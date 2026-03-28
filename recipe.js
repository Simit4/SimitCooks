import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';

function getSlug() {
  const path = window.location.pathname.split('/').filter(Boolean);
  return path[1] || new URLSearchParams(window.location.search).get('slug');
}

// Format nutrition data from nutritional_info field
function formatNutrition(nutritionalInfo) {
  if (!nutritionalInfo) {
    return `
      <div class="nutrition-item">
        <div class="nutrition-value">N/A</div>
        <div class="nutrition-label">Coming Soon</div>
      </div>
    `;
  }
  
  const items = [];
  
  if (nutritionalInfo.calories) items.push({ label: 'Calories', value: nutritionalInfo.calories });
  if (nutritionalInfo.protein) items.push({ label: 'Protein', value: nutritionalInfo.protein });
  if (nutritionalInfo.carbohydrates) items.push({ label: 'Carbs', value: nutritionalInfo.carbohydrates });
  if (nutritionalInfo.fat) items.push({ label: 'Fat', value: nutritionalInfo.fat });
  if (nutritionalInfo.fiber) items.push({ label: 'Fiber', value: nutritionalInfo.fiber });
  if (nutritionalInfo.sugar) items.push({ label: 'Sugar', value: nutritionalInfo.sugar });
  if (nutritionalInfo.sodium) items.push({ label: 'Sodium', value: nutritionalInfo.sodium });
  
  if (items.length === 0) {
    return `
      <div class="nutrition-item">
        <div class="nutrition-value">N/A</div>
        <div class="nutrition-label">Coming Soon</div>
      </div>
    `;
  }
  
  return items.map(item => `
    <div class="nutrition-item">
      <div class="nutrition-value">${escapeHtml(item.value)}</div>
      <div class="nutrition-label">${escapeHtml(item.label)}</div>
    </div>
  `).join('');
}

function formatTags(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return '<span class="tag">No tags</span>';
  return tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getRecipeThumbnail(recipe) {
  if (recipe.thumbnail_url && recipe.thumbnail_url.trim()) {
    return recipe.thumbnail_url;
  }
  
  const videoId = extractYouTubeId(recipe.video_url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  return FALLBACK_IMAGE;
}

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function renderRecipe(recipe) {
  if (!recipe) return;

  // Update hero section
  document.getElementById('recipe-title').innerText = recipe.title || 'Untitled Recipe';
  document.getElementById('recipe-description').innerText = recipe.description || 'Delicious home-style recipe made with love.';
  document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
  document.getElementById('servings').innerText = recipe.servings || 'N/A';

  // Ingredients
  const ingredients = document.getElementById('ingredients-list');
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    ingredients.innerHTML = recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('');
  } else {
    ingredients.innerHTML = '<li>No ingredients listed</li>';
  }

  // Method
  const method = document.getElementById('method-list');
  if (recipe.method && Array.isArray(recipe.method)) {
    method.innerHTML = recipe.method.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  } else {
    method.innerHTML = '<li>No instructions available</li>';
  }

  // Nutrition
  const nutritionDiv = document.getElementById('nutrition');
  const nutritionData = recipe.nutritional_info;
  
  let parsedNutrition = nutritionData;
  if (typeof nutritionData === 'string') {
    try {
      parsedNutrition = JSON.parse(nutritionData);
    } catch (e) {
      console.error('Failed to parse nutrition data:', e);
    }
  }
  
  nutritionDiv.innerHTML = formatNutrition(parsedNutrition);

  // Categories, Cuisine, Tags
  if (recipe.category && Array.isArray(recipe.category)) {
    document.getElementById('category').innerHTML = recipe.category.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('');
  } else if (recipe.category) {
    document.getElementById('category').innerHTML = `<span class="tag">${escapeHtml(recipe.category)}</span>`;
  }

  if (recipe.cuisine && Array.isArray(recipe.cuisine)) {
    document.getElementById('cuisine').innerHTML = recipe.cuisine.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('');
  } else if (recipe.cuisine) {
    document.getElementById('cuisine').innerHTML = `<span class="tag">${escapeHtml(recipe.cuisine)}</span>`;
  }

  document.getElementById('tags').innerHTML = formatTags(recipe.tags);
  document.getElementById('notes').innerText = recipe.notes || 'No additional notes.';
  document.getElementById('facts').innerText = recipe.facts || 'Did you know? This recipe is made with love!';

  // Video
  if (recipe.video_url) {
    const videoSection = document.getElementById('video-section');
    const videoContainer = document.getElementById('video-container');
    const videoId = extractYouTubeId(recipe.video_url);
    
    if (videoId) {
      videoSection.style.display = 'block';
      videoContainer.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
    }
  }

  document.title = `${recipe.title} | Simit Cooks`;
}

async function fetchMoreRecipes(currentSlug) {
  const { data: recipes, error } = await supabase
    .from('recipe_db')
    .select('*')
    .neq('slug', currentSlug)
    .limit(3);

  const grid = document.getElementById('more-recipes-grid');
  
  if (!recipes || recipes.length === 0) {
    grid.innerHTML = '<div class="no-results"><i class="fas fa-utensils"></i><h3>No More Recipes</h3><p>Check back soon for more delicious recipes!</p></div>';
    return;
  }
  
  grid.innerHTML = recipes.map(recipe => {
    const thumbnail = getRecipeThumbnail(recipe);
    const title = recipe.title || 'Untitled';
    const description = recipe.description || 'Delicious recipe';
    const categories = recipe.category && Array.isArray(recipe.category) ? recipe.category : [];
    const primaryCategory = categories[0] || '';
    
    return `
      <div class="recipe-card" onclick="window.location.href='/recipe/${recipe.slug}'">
        <div class="thumbnail-wrapper">
          <img src="${thumbnail}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'">
        </div>
        <div class="card-body">
          <h4>${escapeHtml(title)}</h4>
          <p>${escapeHtml(description.substring(0, 80))}${description.length > 80 ? '...' : ''}</p>
          ${primaryCategory ? `<div class="category-wrapper"><span class="recipe-category">${escapeHtml(primaryCategory)}</span></div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

async function init() {
  const slug = getSlug();
  
  if (!slug) {
    console.error('No recipe slug found');
    document.getElementById('recipe-title').innerText = 'Recipe Not Found';
    return;
  }
  
  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !recipe) {
    console.error('Recipe not found:', error);
    document.getElementById('recipe-title').innerText = 'Recipe Not Found';
    document.getElementById('recipe-description').innerText = 'Sorry, we couldn\'t find this recipe.';
    return;
  }
  
  renderRecipe(recipe);
  fetchMoreRecipes(slug);
  
  await supabase
    .from('recipe_db')
    .update({ views: (recipe.views || 0) + 1 })
    .eq('slug', slug);
}

init();

window.recipeDebug = {
  supabase,
  formatNutrition,
  getSlug
};
