import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// =================================================
// 🔹 Helper Functions
// =================================================

// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
  if (!url) return '';
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  return '';
}

// Get slug from URL
function getSlugFromUrl() {
  // Try to get from pathname (clean URL: /recipe/slug)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  
  console.log('Path parts:', pathParts);
  console.log('Current URL:', window.location.href);
  
  // Check if we have a recipe path
  if (pathParts[0] === 'recipe' && pathParts[1]) {
    return pathParts[1];
  }
  
  // Try query parameter as fallback
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  if (slugParam) {
    return slugParam;
  }
  
  return null;
}

// Show loading state
function showLoading() {
  document.getElementById('recipe-title').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading recipe...';
  document.getElementById('recipe-description').innerHTML = 'Please wait while we fetch the recipe details.';
}

// Show error message
function showError(message) {
  const container = document.querySelector('.recipe-page');
  if (container) {
    container.innerHTML = `
      <div class="error-message" style="text-align: center; padding: 3rem;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #dc2626;"></i>
        <h2 style="margin-top: 1rem;">Recipe Not Found</h2>
        <p>${message}</p>
        <a href="/recipes.html" class="btn-primary" style="display: inline-block; margin-top: 1rem;">
          <i class="fas fa-arrow-left"></i> Browse All Recipes
        </a>
      </div>
    `;
  }
}

// =================================================
// 🔹 Render Functions
// =================================================

// Render recipe details
function renderRecipe(recipe) {
  if (!recipe) {
    showError('Recipe not found in database.');
    return;
  }
  
  console.log('Rendering recipe:', recipe.title);
  
  // Set page title
  document.title = `${recipe.title} | Simit Cooks`;
  
  // Basic info
  document.getElementById('recipe-title').innerText = recipe.title;
  document.getElementById('recipe-description').innerText = recipe.description || 'Delicious home-style recipe.';
  document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
  document.getElementById('servings').innerText = recipe.servings || 'N/A';

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ingredientsList.appendChild(li);
    });
  } else {
    ingredientsList.innerHTML = '<li>No ingredients listed.</li>';
  }

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  if (recipe.method && Array.isArray(recipe.method)) {
    recipe.method.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      methodList.appendChild(li);
    });
  } else {
    methodList.innerHTML = '<li>No instructions available.</li>';
  }

  // Nutrition
  const nutrition = recipe.nutritional_info;
  const nutritionDiv = document.getElementById('nutrition');
  if (nutrition && typeof nutrition === 'object') {
    nutritionDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 0.5rem;">
        ${nutrition.calories ? `<div><strong>🔥 Calories:</strong> ${nutrition.calories}</div>` : ''}
        ${nutrition.protein ? `<div><strong>💪 Protein:</strong> ${nutrition.protein}</div>` : ''}
        ${nutrition.carbohydrates ? `<div><strong>🍚 Carbs:</strong> ${nutrition.carbohydrates}</div>` : ''}
        ${nutrition.fiber ? `<div><strong>🌾 Fiber:</strong> ${nutrition.fiber}</div>` : ''}
        ${nutrition.fat ? `<div><strong>🥑 Fat:</strong> ${nutrition.fat}</div>` : ''}
      </div>
    `;
  } else {
    nutritionDiv.innerHTML = '<p>Nutrition information not available.</p>';
  }

  // Tags, Cuisine, Category
  const tagsSpan = document.getElementById('tags');
  tagsSpan.textContent = recipe.tags?.join(', ') || 'Not available';
  
  const cuisineSpan = document.getElementById('cuisine');
  cuisineSpan.textContent = recipe.cuisine?.join(', ') || 'Not available';
  
  const categorySpan = document.getElementById('category');
  categorySpan.textContent = recipe.category?.join(', ') || 'Not available';

  // Notes & Fun Facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes available.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';

  // Video
  const embedUrl = convertToEmbedUrl(recipe.video_url);
  const videoContainer = document.querySelector('.recipe-video');
  if (embedUrl) {
    videoContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen title="${recipe.title} video"></iframe>`;
    videoContainer.style.display = 'block';
  } else {
    videoContainer.style.display = 'none';
  }

  // Equipment
  if (recipe.equipment_ids && recipe.equipment_ids.length) {
    fetchEquipmentByIds(recipe.equipment_ids);
  }
}

// Fetch equipment details by IDs
async function fetchEquipmentByIds(ids) {
  const container = document.getElementById('equipment-container');
  if (!container) return;
  
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading equipment...</div>';
  
  try {
    // Convert string IDs to numbers if needed
    const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id) : id);
    
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', numericIds);

    if (error) throw error;

    container.innerHTML = '';

    if (!data || data.length === 0) {
      container.innerHTML = '<p>No recommended equipment found.</p>';
      return;
    }

    data.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'equipment-item';
      card.style.animationDelay = `${index * 0.1}s`;

      card.innerHTML = `
        <div class="image-wrapper">
          <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=Equipment'}" alt="${item.name}">
          <div class="overlay">
            <p>${item.description || 'Essential kitchen tool'}</p>
            <a href="${item.affiliate_link || '#'}" target="_blank" rel="noopener noreferrer" class="btn-buy">
              Buy Now <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
        <div class="card-body">
          <h4 class="equipment-title">${item.name}</h4>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    container.innerHTML = '<p>Unable to load equipment recommendations.</p>';
  }
}

// =================================================
// 🔹 Main Fetch Function
// =================================================

async function fetchAndRenderRecipe() {
  showLoading();
  
  const slug = getSlugFromUrl();
  
  console.log('Looking for recipe with slug:', slug);
  
  if (!slug) {
    showError('No recipe specified. Please browse our recipes collection.');
    return;
  }

  try {
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    console.log('Recipe data:', recipe);
    console.log('Error:', error);

    if (error || !recipe) {
      showError(`Recipe "${slug}" not found. It may have been moved or deleted.`);
      return;
    }

    // Update view count in background
    if (recipe.id) {
      supabase
        .from('recipe_db')
        .update({ views: (recipe.views || 0) + 1 })
        .eq('id', recipe.id)
        .then(() => console.log('View count updated'))
        .catch(err => console.error('Error updating views:', err));
    }

    renderRecipe(recipe);
    
  } catch (error) {
    console.error('Error fetching recipe:', error);
    showError('An error occurred while loading the recipe. Please try again later.');
  }
}

// =================================================
// 🔹 Initialize
// =================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchAndRenderRecipe);
} else {
  fetchAndRenderRecipe();
}
