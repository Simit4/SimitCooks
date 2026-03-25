import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get slug from URL
function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  console.log('📖 Recipe slug from URL:', slug);
  return slug;
}

// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Show error message
function showError(message) {
  const container = document.querySelector('.recipe-page');
  if (container) {
    container.innerHTML = `
      <div class="container" style="text-align: center; padding: 4rem 2rem;">
        <i class="fas fa-exclamation-circle" style="font-size: 4rem; color: #dc2626;"></i>
        <h2 style="margin: 1rem 0;">Recipe Not Found</h2>
        <p>${message}</p>
        <a href="/recipes.html" class="btn-primary" style="display: inline-block; margin-top: 1.5rem; padding: 0.8rem 1.8rem; background: #27ae60; color: white; border-radius: 50px; text-decoration: none;">
          <i class="fas fa-arrow-left"></i> Browse All Recipes
        </a>
      </div>
    `;
  }
}

// Render recipe
function renderRecipe(recipe) {
  if (!recipe) {
    showError('Recipe not found.');
    return;
  }

  console.log('🍳 Rendering recipe:', recipe.title);

  // Set page title
  document.title = `${recipe.title} | Simit Cooks`;

  // Basic info
  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-description').textContent = recipe.description || 'Delicious home-style recipe.';
  document.getElementById('prep-time').textContent = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').textContent = recipe.cook_time || 'N/A';
  document.getElementById('servings').textContent = recipe.servings || 'N/A';

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      ingredientsList.appendChild(li);
    });
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
  }

  // Nutrition
  const nutrition = recipe.nutritional_info;
  const nutritionDiv = document.getElementById('nutrition');
  if (nutrition && typeof nutrition === 'object') {
    nutritionDiv.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.8rem;">
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
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';

  // Notes & Facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes available.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';

  // Video
  const embedUrl = convertToEmbedUrl(recipe.video_url);
  const videoContainer = document.querySelector('.recipe-video');
  if (embedUrl) {
    videoContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen title="${recipe.title} video" style="width:100%; height:100%; border:none;"></iframe>`;
    videoContainer.style.display = 'block';
  } else {
    videoContainer.style.display = 'none';
  }

  // Equipment
  if (recipe.equipment_ids && recipe.equipment_ids.length) {
    fetchEquipmentByIds(recipe.equipment_ids);
  }

  // Update view count
  if (recipe.id) {
    supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id)
      .catch(err => console.error('Error updating views:', err));
  }
}

// Fetch equipment
async function fetchEquipmentByIds(ids) {
  const container = document.getElementById('equipment-container');
  if (!container) return;
  
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading equipment...</div>';
  
  try {
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
          <h4>${item.name}</h4>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    container.innerHTML = '<p>Unable to load equipment recommendations.</p>';
  }
}

// Main function
async function fetchAndRenderRecipe() {
  const slug = getSlugFromUrl();
  
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

    if (error || !recipe) {
      console.error('Error:', error);
      showError(`Recipe "${slug}" not found.`);
      return;
    }

    renderRecipe(recipe);
    
  } catch (error) {
    console.error('Error fetching recipe:', error);
    showError('An error occurred while loading the recipe.');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', fetchAndRenderRecipe);
