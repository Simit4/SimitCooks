import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Convert YouTube URL to embed URL (unchanged)
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Main function to fetch and render recipe
async function fetchAndRenderRecipe() {
  // Get slug from URL path (e.g., /recipes/simple-egg-roll → "simple-egg-roll")
  const slug = window.location.pathname.split('/').pop();

  if (!slug || slug === 'recipes') {
    window.location.href = '/recipes'; // Redirect if empty or just /recipes/
    return;
  }

  // Fetch recipe from Supabase
  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    renderErrorState();
    return;
  }

  // Update view count
  if (recipe.id) {
    await supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);
  }

  renderRecipe(recipe);
  if (recipe.equipment_ids?.length > 0) {
    fetchEquipmentByIds(recipe.equipment_ids.map(Number));
  }
}

// Render recipe to DOM
function renderRecipe(recipe) {
  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-description').textContent = recipe.description;
  document.getElementById('prep-time').textContent = recipe.prep_time;
  document.getElementById('cook-time').textContent = recipe.cook_time;
  document.getElementById('servings').textContent = recipe.servings;

  // Render ingredients list
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = recipe.ingredients?.map(item => 
    `<li>${item}</li>`
  ).join('') || '<li>No ingredients listed</li>';

  // Render method steps
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = recipe.method?.map(step => 
    `<li>${step}</li>`
  ).join('') || '<li>No method available</li>';

  // Render nutrition info
  const nutrition = recipe.nutritional_info || {};
  document.getElementById('nutrition').innerHTML = `
    <strong>Calories:</strong> ${nutrition.calories || 'N/A'}<br>
    <strong>Protein:</strong> ${nutrition.protein || 'N/A'}<br>
    <strong>Carbohydrates:</strong> ${nutrition.carbohydrates || 'N/A'}<br>
    <strong>Fiber:</strong> ${nutrition.fiber || 'N/A'}<br>
    <strong>Fat:</strong> ${nutrition.fat || 'N/A'}
  `;

  // Render metadata
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts.';

  // Render video if available
  const embedUrl = convertToEmbedUrl(recipe.video_url);
  document.getElementById('recipe-video').src = embedUrl || '';
}

// Fetch equipment by IDs (unchanged)
async function fetchEquipmentByIds(ids) {
  const { data, error } = await supabase
    .from('equipment_db')
    .select('*')
    .in('id', ids);

  const container = document.getElementById('equipment-container');
  container.innerHTML = data?.map(item => `
    <div class="equipment-item">
      <img src="${item.image_url}" alt="${item.name}" class="equipment-image">
      <h3>${item.name}</h3>
      <p>${item.description || ''}</p>
      <a href="${item.affiliate_link}" target="_blank" rel="noopener">Buy Now</a>
    </div>
  `).join('') || '<p>No equipment found.</p>';
}

// Error state
function renderErrorState() {
  document.getElementById('recipe-title').textContent = 'Recipe not found';
  document.getElementById('recipe-content').innerHTML = `
    <p>We couldn't find this recipe. Try browsing our <a href="/recipes">recipe collection</a>.</p>
  `;
}

// SPA Navigation (optional)
document.addEventListener('click', (e) => {
  if (e.target.closest('a[href^="/recipes/"]')) {
    e.preventDefault();
    window.history.pushState({}, '', e.target.href);
    fetchAndRenderRecipe();
  }
});

// Handle back/forward navigation
window.addEventListener('popstate', fetchAndRenderRecipe);

// Initialize
fetchAndRenderRecipe();
