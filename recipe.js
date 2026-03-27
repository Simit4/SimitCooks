import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 Supabase Configuration
// =================================================
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// =================================================
// 🔹 DOM Elements Cache
// =================================================
const DOM = {
  title: document.getElementById('recipe-title'),
  description: document.getElementById('recipe-description'),
  prepTime: document.getElementById('prep-time'),
  cookTime: document.getElementById('cook-time'),
  servings: document.getElementById('servings'),
  ingredientsList: document.getElementById('ingredients-list'),
  methodList: document.getElementById('method-list'),
  nutrition: document.getElementById('nutrition'),
  tags: document.getElementById('tags'),
  cuisine: document.getElementById('cuisine'),
  category: document.getElementById('category'),
  notes: document.getElementById('notes'),
  facts: document.getElementById('facts'),
  videoContainer: document.querySelector('.recipe-video'),
  equipmentContainer: document.getElementById('equipment-container')
};

// =================================================
// 🔹 Utility Functions
// =================================================

// Format time display
function formatTime(minutes) {
  if (!minutes || minutes === 'N/A') return 'N/A';
  const mins = parseInt(minutes);
  if (mins < 60) return `${mins} mins`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins ? `${hours}h ${remainingMins}m` : `${hours}h`;
}

// Format array data for display
function formatArrayData(data) {
  if (!data || !Array.isArray(data) || data.length === 0) return 'Not available';
  return data.map(item => `<span>${escapeHtml(item)}</span>`).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1`;
  }
  return null;
}

// Get slug from URL (supports multiple formats)
function getSlugFromUrl() {
  // Clean URL: /recipe/slug
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'recipe' && pathParts[1]) return pathParts[1];
  
  // Query parameter: ?slug=xxx
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  if (slugParam) return slugParam;
  
  // Hash: #/recipe/slug (for SPA)
  const hash = window.location.hash;
  if (hash.includes('/recipe/')) {
    const hashParts = hash.split('/');
    return hashParts[hashParts.length - 1];
  }
  
  return null;
}

// Show loading state
function showLoading() {
  if (DOM.title) DOM.title.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading recipe...';
  if (DOM.description) DOM.description.textContent = 'Please wait while we fetch the recipe details.';
}

// Show error message with retry option
function showError(message, showRetry = true) {
  const container = document.querySelector('.recipe-page');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-container" style="text-align: center; padding: 3rem;">
      <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #dc2626; margin-bottom: 1rem;"></i>
      <h2 style="margin-bottom: 0.5rem;">Recipe Not Found</h2>
      <p style="color: #64748b; margin-bottom: 1.5rem;">${escapeHtml(message)}</p>
      ${showRetry ? `
        <button onclick="location.reload()" class="retry-btn" style="
          background: #27ae60;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          margin-right: 0.5rem;
        ">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      ` : ''}
      <a href="/recipes.html" class="browse-btn" style="
        display: inline-block;
        padding: 0.75rem 1.5rem;
        background: #1e293b;
        color: white;
        border-radius: 40px;
        text-decoration: none;
        font-weight: 600;
      ">
        <i class="fas fa-arrow-left"></i> Browse Recipes
      </a>
    </div>
  `;
}

// =================================================
// 🔹 Render Functions
// =================================================

// Render basic recipe info
function renderBasicInfo(recipe) {
  if (DOM.title) DOM.title.textContent = recipe.title;
  if (DOM.description) DOM.description.textContent = recipe.description || 'Delicious home-style recipe.';
  if (DOM.prepTime) DOM.prepTime.textContent = formatTime(recipe.prep_time);
  if (DOM.cookTime) DOM.cookTime.textContent = formatTime(recipe.cook_time);
  if (DOM.servings) DOM.servings.textContent = recipe.servings || 'N/A';
}

// Render ingredients with animations
function renderIngredients(ingredients) {
  if (!DOM.ingredientsList) return;
  
  DOM.ingredientsList.innerHTML = '';
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    DOM.ingredientsList.innerHTML = '<li class="empty-state">No ingredients listed.</li>';
    return;
  }
  
  ingredients.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;
    li.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`;
    li.style.opacity = '0';
    DOM.ingredientsList.appendChild(li);
  });
}

// Render method/steps with animations
function renderMethod(method) {
  if (!DOM.methodList) return;
  
  DOM.methodList.innerHTML = '';
  if (!method || !Array.isArray(method) || method.length === 0) {
    DOM.methodList.innerHTML = '<li class="empty-state">No instructions available.</li>';
    return;
  }
  
  method.forEach((step, index) => {
    const li = document.createElement('li');
    li.textContent = step;
    li.style.animation = `fadeInUp 0.3s ease forwards ${index * 0.05}s`;
    li.style.opacity = '0';
    DOM.methodList.appendChild(li);
  });
}

// Render nutrition info
function renderNutrition(nutrition) {
  if (!DOM.nutrition) return;
  
  if (nutrition && typeof nutrition === 'object' && Object.keys(nutrition).length > 0) {
    const nutritionItems = [];
    if (nutrition.calories) nutritionItems.push(`<div><strong>🔥 Calories</strong><br>${nutrition.calories}</div>`);
    if (nutrition.protein) nutritionItems.push(`<div><strong>💪 Protein</strong><br>${nutrition.protein}</div>`);
    if (nutrition.carbohydrates) nutritionItems.push(`<div><strong>🍚 Carbs</strong><br>${nutrition.carbohydrates}</div>`);
    if (nutrition.fiber) nutritionItems.push(`<div><strong>🌾 Fiber</strong><br>${nutrition.fiber}</div>`);
    if (nutrition.fat) nutritionItems.push(`<div><strong>🥑 Fat</strong><br>${nutrition.fat}</div>`);
    
    DOM.nutrition.innerHTML = `<div class="nutrition-grid">${nutritionItems.join('')}</div>`;
  } else {
    DOM.nutrition.innerHTML = '<p class="empty-state">Nutrition information not available.</p>';
  }
}

// Render tags, cuisine, category
function renderMetadata(recipe) {
  if (DOM.tags) DOM.tags.innerHTML = formatArrayData(recipe.tags);
  if (DOM.cuisine) DOM.cuisine.innerHTML = formatArrayData(recipe.cuisine);
  if (DOM.category) DOM.category.innerHTML = formatArrayData(recipe.category);
}

// Render notes and facts
function renderNotes(recipe) {
  if (DOM.notes) DOM.notes.textContent = recipe.notes || 'No additional notes available.';
  if (DOM.facts) DOM.facts.textContent = recipe.facts || 'No fun facts found.';
}

// Render video
function renderVideo(videoUrl, title) {
  if (!DOM.videoContainer) return;
  
  const embedUrl = convertToEmbedUrl(videoUrl);
  if (embedUrl) {
    DOM.videoContainer.innerHTML = `
      <iframe 
        src="${embedUrl}" 
        allowfullscreen 
        title="${escapeHtml(title)} video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      ></iframe>
    `;
    DOM.videoContainer.style.display = 'block';
  } else {
    DOM.videoContainer.style.display = 'none';
  }
}

// Fetch and render equipment
async function renderEquipment(equipmentIds) {
  if (!DOM.equipmentContainer || !equipmentIds || !equipmentIds.length) {
    if (DOM.equipmentContainer) DOM.equipmentContainer.innerHTML = '<p class="empty-state">No recommended equipment found.</p>';
    return;
  }
  
  DOM.equipmentContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading equipment...</div>';
  
  try {
    const numericIds = equipmentIds.map(id => typeof id === 'string' ? parseInt(id) : id);
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', numericIds)
      .limit(6);

    if (error) throw error;

    if (!data || data.length === 0) {
      DOM.equipmentContainer.innerHTML = '<p class="empty-state">No recommended equipment found.</p>';
      return;
    }

    DOM.equipmentContainer.innerHTML = '';
    data.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'equipment-item';
      card.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.1}s`;
      card.style.opacity = '0';

      card.innerHTML = `
        <div class="image-wrapper">
          <img 
            src="${item.image_url || 'https://via.placeholder.com/300x200?text=Equipment'}" 
            alt="${escapeHtml(item.name)}"
            loading="lazy"
          >
          <div class="overlay">
            <p>${escapeHtml(item.description || 'Essential kitchen tool')}</p>
          </div>
        </div>
        <div class="equipment-info">
          <h3>${escapeHtml(item.name)}</h3>
          ${item.affiliate_link ? `
            <a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer nofollow" class="btn-buy">
              Buy Now <i class="fas fa-arrow-right"></i>
            </a>
          ` : ''}
        </div>
      `;

      DOM.equipmentContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    DOM.equipmentContainer.innerHTML = '<p class="error-state">Unable to load equipment recommendations.</p>';
  }
}

// Main render function
function renderRecipe(recipe) {
  if (!recipe) {
    showError('Recipe not found in database.');
    return;
  }
  
  console.log('Rendering recipe:', recipe.title);
  
  // Update page title and meta
  document.title = `${recipe.title} | Simit Cooks`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', recipe.description || 'Delicious home-style recipe');
  
  // Render all sections
  renderBasicInfo(recipe);
  renderIngredients(recipe.ingredients);
  renderMethod(recipe.method);
  renderNutrition(recipe.nutritional_info);
  renderMetadata(recipe);
  renderNotes(recipe);
  renderVideo(recipe.video_url, recipe.title);
  renderEquipment(recipe.equipment_ids);
  
  // Scroll to top on new recipe
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =================================================
// 🔹 Main Fetch Function
// =================================================

async function fetchAndRenderRecipe() {
  showLoading();
  
  const slug = getSlugFromUrl();
  console.log('Fetching recipe with slug:', slug);
  
  if (!slug) {
    showError('No recipe specified. Please browse our recipes collection.', false);
    return;
  }

  try {
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !recipe) {
      showError(`Recipe "${slug}" not found. It may have been moved or deleted.`);
      return;
    }

    // Update view count in background (don't await)
    supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id)
      .then(() => console.log('View count updated'))
      .catch(err => console.error('Error updating views:', err));

    renderRecipe(recipe);
    
  } catch (error) {
    console.error('Error fetching recipe:', error);
    showError('An error occurred while loading the recipe. Please try again later.');
  }
}

// =================================================
// 🔹 Initialize
// =================================================

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .loading-spinner {
    text-align: center;
    padding: 2rem;
    color: var(--muted);
  }
  
  .empty-state,
  .error-state {
    text-align: center;
    padding: 2rem;
    color: var(--muted);
    font-style: italic;
  }
  
  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.75rem;
    text-align: center;
  }
  
  .nutrition-grid div {
    padding: 0.5rem;
    background: rgba(39, 174, 96, 0.05);
    border-radius: 12px;
  }
  
  .nutrition-grid strong {
    display: block;
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
    color: var(--primary-dark);
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchAndRenderRecipe);
} else {
  fetchAndRenderRecipe();
}

// Export for potential reuse
export { fetchAndRenderRecipe, renderRecipe };
