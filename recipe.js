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
  const params = new URLSearchParams(window.location.search);
  slug = params.get('slug');
  if (!slug) {
    const path = window.location.pathname;
    slug = path.split('/').pop();
  }
  console.log('Extracted slug:', slug);
  console.log('URL:', window.location.href);
  if (!slug) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    return;
  }
  try {
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();
    console.log('Supabase response:', { data: recipe, error });
    if (error) throw error;
    if (!recipe) {
      document.getElementById('recipe-title').innerText = 'Recipe not found';
      return;
    }
    if (recipe.id) {
      await supabase
        .from('recipe_db')
        .update({ views: (recipe.views || 0) + 1 })
        .eq('id', recipe.id);
    }
    renderRecipe(recipe);
  } catch (e) {
    console.error('Error fetching recipe:', e);
    document.getElementById('recipe-title').innerText = 'Recipe not found';
  }
}



function renderRecipe(recipe) {
  document.getElementById('recipe-title').innerText = recipe.title;
  document.getElementById('recipe-description').innerText = recipe.description;
  document.getElementById('prep-time').innerText = recipe.prep_time;
  document.getElementById('cook-time').innerText = recipe.cook_time;
  document.getElementById('servings').innerText = recipe.servings;

  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  recipe.ingredients?.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  recipe.method?.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    methodList.appendChild(li);
  });

  const nutrition = recipe.nutritional_info;
  if (nutrition) {
    document.getElementById('nutrition').innerHTML = `
      <strong>Calories:</strong> ${nutrition.calories}<br>
      <strong>Protein:</strong> ${nutrition.protein}<br>
      <strong>Carbohydrates:</strong> ${nutrition.carbohydrates}<br>
      <strong>Fiber:</strong> ${nutrition.fiber}<br>
      <strong>Fat:</strong> ${nutrition.fat}
    `;
  }

  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes available.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';

  const embedUrl = convertToEmbedUrl(recipe.video_url);
  document.getElementById('recipe-video').src = embedUrl || '';

  // Update Open Graph URL for SEO
  const ogUrlMeta = document.querySelector('meta[property="og:url"]');
  ogUrlMeta.setAttribute('content', `https://simitswaad.netlify.app/recipes/${recipe.slug}`);

  // 🛠 Fetch and show dedicated equipment
  if (recipe.equipment_ids && recipe.equipment_ids.length > 0) {
    const equipmentIds = recipe.equipment_ids.map(Number); // Make sure they're integers
    fetchEquipmentByIds(equipmentIds);
  } else {
    document.getElementById('equipment-container').innerHTML = '<p>No equipment recommended for this recipe.</p>';
  }
}

// Fetch equipment items by their IDs
async function fetchEquipmentByIds(ids) {
  const { data, error } = await supabase
    .from('equipment_db')
    .select('*')
    .in('id', ids);

  const container = document.getElementById('equipment-container');
  container.innerHTML = '';

  if (error || !data?.length) {
    console.error('Error fetching equipment:', error);
    container.innerHTML = '<p>No equipment found.</p>';
    return;
  }

  data.forEach(item => {
    container.innerHTML += `
      <div class="equipment-item">
        <img src="${item.image_url}" alt="${item.name}" class="equipment-image" />
        <h3 class="equipment-title">${item.name}</h3>
        <p class="equipment-description">${item.description || ''}</p>
        <a href="${item.affiliate_link}" class="btn-buy" target="_blank" rel="noopener noreferrer">Buy Now</a>
      </div>
    `;
  });
}

// Init
fetchAndRenderRecipe();
