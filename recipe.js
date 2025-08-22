import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

async function fetchAndRenderRecipe() {
  let slug;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'recipe' && pathParts[1]) slug = pathParts[1];
  else slug = new URLSearchParams(window.location.search).get('slug');

  if (!slug) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    return;
  }

  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    return;
  }

  renderRecipe(recipe);
}

function renderRecipe(recipe) {
  document.getElementById('recipe-title').innerText = recipe.title;
  document.getElementById('recipe-description').innerText = recipe.description;
  document.getElementById('prep-time').innerText = recipe.prep_time;
  document.getElementById('cook-time').innerText = recipe.cook_time;
  document.getElementById('servings').innerText = recipe.servings;

  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = recipe.ingredients.map(i => `<li>${i}</li>`).join('');

  const methodList = document.getElementById('method-list');
  methodList.innerHTML = recipe.method.map(step => `<li>${step}</li>`).join('');

  if (recipe.nutritional_info) {
    document.getElementById('nutrition').innerHTML = `
      <strong>Calories:</strong> ${recipe.nutritional_info.calories}<br>
      <strong>Protein:</strong> ${recipe.nutritional_info.protein}<br>
      <strong>Carbs:</strong> ${recipe.nutritional_info.carbohydrates}<br>
      <strong>Fat:</strong> ${recipe.nutritional_info.fat}
    `;
  }

  document.getElementById('tags').textContent = recipe.tags?.join(', ') || '';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || '';
  document.getElementById('category').textContent = recipe.category?.join(', ') || '';
  document.getElementById('notes').textContent = recipe.notes || '';
  document.getElementById('facts').textContent = recipe.facts || '';

  document.getElementById('recipe-video').src = convertToEmbedUrl(recipe.video_url);

  if (recipe.equipment_ids?.length) fetchEquipmentByIds(recipe.equipment_ids.map(Number));
}

async function fetchEquipmentByIds(ids) {
  const { data } = await supabase.from('equipment_db').select('*').in('id', ids);
  const container = document.getElementById('equipment-container');
  container.innerHTML = data?.map(item => `
    <div class="equipment-item">
      <img src="${item.image_url}" alt="${item.name}" class="equipment-image" />
      <h3>${item.name}</h3>
      <p>${item.description || ''}</p>
      <a href="${item.affiliate_link}" class="btn-buy" target="_blank">Buy Now</a>
    </div>
  `).join('') || '<p>No equipment found.</p>';
}

fetchAndRenderRecipe();
