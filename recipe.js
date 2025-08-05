import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper: Convert YouTube URLs to embed format
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Render recipe details
function renderRecipe(recipe) {
  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-description').textContent = recipe.description;
  document.getElementById('prep-time').textContent = recipe.prep_time;
  document.getElementById('cook-time').textContent = recipe.cook_time;
  document.getElementById('servings').textContent = recipe.servings;

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  recipe.method.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    methodList.appendChild(li);
  });

  // Tags (optional)
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || '';

  // Video
  document.getElementById('recipe-video').src = convertToEmbedUrl(recipe.video_url) || '';
}

// Render related equipment items
function renderRelatedEquipment(equipmentItems) {
  const container = document.getElementById('related-equipment-container');
  container.innerHTML = '';

  if (!equipmentItems.length) {
    container.innerHTML = '<p>No equipment recommended for this recipe.</p>';
    return;
  }

  equipmentItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'equipment-item';
    div.innerHTML = `
      <img class="equipment-image" src="${item.image_url}" alt="${item.name}" />
      <h3 class="equipment-title">${item.name}</h3>
      <p class="equipment-description">${item.description || ''}</p>
      <a class="btn-buy" href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer">Buy Now</a>
    `;
    container.appendChild(div);
  });
}

// Fetch recipe and related equipment from Supabase
async function fetchAndRenderRecipe() {
  try {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) throw new Error('Recipe slug missing');

    // Fetch recipe by slug
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !recipe) throw new Error('Recipe not found');

    renderRecipe(recipe);

    // Get numeric equipment IDs array (assumes you use integer array column)
    const equipmentIds = recipe.equipment_ids || [];

    if (equipmentIds.length === 0) {
      renderRelatedEquipment([]);
      return;
    }

    // Fetch related equipment by numeric IDs
    const { data: equipmentData, error: equipError } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', equipmentIds);

    if (equipError) {
      console.error('Error loading related equipment:', equipError.message);
      renderRelatedEquipment([]);
      return;
    }

    renderRelatedEquipment(equipmentData || []);
  } catch (err) {
    console.error(err);
    document.getElementById('recipe-title').textContent = 'Recipe not found';
  }
}

// Start fetching when script loads
fetchAndRenderRecipe();
