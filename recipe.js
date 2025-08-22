import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


// ------------------ Helper: YouTube Embed ------------------
function convertToEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

// ------------------ Fetch & Render Recipe ------------------
async function fetchAndRenderRecipe() {
  let slug;

  // Clean URL: /recipe/<slug>
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'recipe' && pathParts[1]) {
    slug = pathParts[1];
  } else {
    // Fallback to query string: ?slug=<slug>
    const params = new URLSearchParams(window.location.search);
    slug = params.get('slug');
  }

  if (!slug) {
    showError('Recipe not found');
    return;
  }

  // Fetch recipe
  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    console.error(error);
    showError('Recipe not found');
    return;
  }

  // Update views
  if (recipe.id) {
    await supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);
  }

  renderRecipe(recipe);
}

// ------------------ Render Recipe ------------------
function renderRecipe(recipe) {
  // Title & Description
  document.getElementById('recipe-title').innerText = recipe.title || 'No title';
  document.getElementById('recipe-description').innerText = recipe.description || '';

  // Prep, Cook, Servings
  document.getElementById('prep-time').innerText = recipe.prep_time || '-';
  document.getElementById('cook-time').innerText = recipe.cook_time || '-';
  document.getElementById('servings').innerText = recipe.servings || '-';

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  recipe.ingredients?.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  recipe.method?.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    methodList.appendChild(li);
  });

  // Nutrition
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

  // Tags, Cuisine, Category
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';

  // Notes & Facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes available.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';

  // ------------------ Video ------------------
  const videoContainer = document.getElementById('video-container');
  videoContainer.innerHTML = ''; // Clear old content
  const embedUrl = convertToEmbedUrl(recipe.video_url);
  if (embedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '560';
    iframe.height = '315';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
  }

  // ------------------ Equipment ------------------
  if (recipe.equipment_ids?.length) {
    fetchEquipmentByIds(recipe.equipment_ids.map(Number));
  } else {
    document.getElementById('equipment-container').innerHTML = '<p>No equipment needed.</p>';
  }
}

// ------------------ Fetch Equipment ------------------
async function fetchEquipmentByIds(ids) {
  const { data, error } = await supabase
    .from('equipment_db')
    .select('*')
    .in('id', ids);

  const container = document.getElementById('equipment-container');
  container.innerHTML = '';

  if (error || !data?.length) {
    container.innerHTML = '<p>No equipment found.</p>';
    return;
  }

  data.forEach(item => {
    const div = document.createElement('div');
    div.className = 'equipment-item';
    div.innerHTML = `
      <img src="${item.image_url}" alt="${item.name}" class="equipment-image" />
      <h3 class="equipment-title">${item.name}</h3>
      <p class="equipment-description">${item.description || ''}</p>
      <a href="${item.affiliate_link}" class="btn-buy" target="_blank" rel="noopener noreferrer">Buy Now</a>
    `;
    container.appendChild(div);
  });
}

// ------------------ Show Error ------------------
function showError(msg) {
  document.getElementById('recipe-title').innerText = msg;
  document.getElementById('recipe-description').innerText = '';
  document.getElementById('ingredients-list').innerHTML = '';
  document.getElementById('method-list').innerHTML = '';
  document.getElementById('video-container').innerHTML = '';
  document.getElementById('equipment-container').innerHTML = '';
}

// ------------------ Initialize ------------------
fetchAndRenderRecipe();

