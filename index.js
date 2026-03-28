import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 Supabase Configuration
// =================================================
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// =================================================
// 🔹 Constants
// =================================================
const CONFIG = {
  fallbackImage: 'https://i.ibb.co/4p4mR3N/momo-graphic.png',
  maxRecipes: 3,
  skeletonCount: 3
};

// =================================================
// 🔹 Category Mapping - Same as second file
// =================================================
const CATEGORY_MAP = {
  'main': 'Main',
  'main dish': 'Main',
  'entree': 'Main',
  'curry': 'Main',
  'rice': 'Main',
  'noodle': 'Main',
  'sauce': 'Sauce',
  'dip': 'Sauce',
  'chutney': 'Sauce',
  'condiment': 'Sauce',
  'jhol': 'Sauce',
  'side': 'Side',
  'accompaniment': 'Side',
  'salad': 'Side',
  'dessert': 'Dessert',
  'sweet': 'Dessert',
  'snack': 'Snack',
  'appetizer': 'Snack',
  'starter': 'Snack',
  'street food': 'Snack',
  'breakfast': 'Breakfast',
  'beverage': 'Beverage',
  'drink': 'Beverage',
  'festival': 'Festival',
  'special': 'Festival'
};

// =================================================
// 🔹 Helper Functions
// =================================================

const safeText = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value.trim() || defaultValue;
  return String(value) || defaultValue;
};

// Get mapped category for a raw category
const getMappedCategory = (rawCategory) => {
  const lowerCat = safeText(rawCategory).toLowerCase();
  const mapped = CATEGORY_MAP[lowerCat];
  if (mapped) return mapped;
  
  // If no mapping, check if it's a main category
  const capitalized = lowerCat.charAt(0).toUpperCase() + lowerCat.slice(1);
  if (['Main', 'Sauce', 'Side', 'Dessert', 'Snack', 'Breakfast', 'Beverage', 'Festival'].includes(capitalized)) {
    return capitalized;
  }
  return null;
};

// Get recipe categories (mapped to main categories)
const getRecipeCategories = (recipe) => {
  if (!recipe.category) return [];
  
  let rawCategories = [];
  if (Array.isArray(recipe.category)) {
    rawCategories = recipe.category;
  } else if (typeof recipe.category === 'string') {
    rawCategories = [recipe.category];
  }
  
  const mappedCategories = new Set();
  rawCategories.forEach(cat => {
    const mapped = getMappedCategory(cat);
    if (mapped) {
      mappedCategories.add(mapped);
    }
  });
  
  return Array.from(mappedCategories);
};

const escapeHtml = (text) => {
  const safe = safeText(text);
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return safe.replace(/[&<>"'/`=]/g, char => htmlEscapeMap[char]);
};

const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
};

const getThumbnail = (recipe) => {
  // First priority: thumbnail_url
  if (recipe.thumbnail_url?.trim()) return recipe.thumbnail_url;
  
  // Second priority: video thumbnail
  const videoId = extractYouTubeId(recipe.video_url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  // Third priority: fallback image
  return CONFIG.fallbackImage;
};

const isValidRecipe = (recipe) => {
  return recipe && typeof recipe === 'object' && (recipe.title || recipe.slug);
};

// =================================================
// 🔹 UI Components - Same card styling as second file
// =================================================

// Create skeleton loader (same as second file)
const createSkeleton = () => {
  const skeleton = document.createElement('div');
  skeleton.className = 'recipe-card skeleton-card';
  skeleton.setAttribute('aria-label', 'Loading recipe...');
  skeleton.innerHTML = `
    <div class="thumbnail-wrapper skeleton-thumbnail"></div>
    <div class="card-body">
      <div class="skeleton-title"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text" style="width: 60%"></div>
    </div>
  `;
  return skeleton;
};

// Show loading skeletons
const showLoading = () => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = '';
  container.classList.add('loading');
  
  for (let i = 0; i < CONFIG.skeletonCount; i++) {
    container.appendChild(createSkeleton());
  }
};

// Hide loading
const hideLoading = () => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  container.classList.remove('loading');
};

// Create recipe card - IDENTICAL to second file's card structure
const createRecipeCard = (recipe) => {
  if (!isValidRecipe(recipe)) return null;
  
  const title = safeText(recipe.title, 'Untitled Recipe');
  const description = safeText(recipe.description, 'Delicious home-style recipe made with love.');
  const categories = getRecipeCategories(recipe);
  const primaryCategory = categories[0] || '';
  const slug = safeText(recipe.slug);
  const thumbnail = getThumbnail(recipe);
  
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.setAttribute('data-slug', slug);
  card.setAttribute('data-categories', categories.join(','));
  
  card.addEventListener('click', (e) => {
    e.preventDefault();
    if (slug) window.location.href = `/recipe/${slug}`;
  });
  
  card.innerHTML = `
    <div class="thumbnail-wrapper">
      <img 
        src="${thumbnail}" 
        alt="${escapeHtml(title)}"
        loading="lazy"
        onerror="this.src='${CONFIG.fallbackImage}'"
      />
    </div>
    <div class="card-body">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
      ${primaryCategory ? `<span class="recipe-category">${escapeHtml(primaryCategory)}</span>` : ''}
    </div>
  `;
  
  return card;
};

// Show no results message
const showNoResults = () => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="no-results">
      <i class="fas fa-utensils"></i>
      <h3>No Recipes Yet</h3>
      <p>Check back soon for delicious recipes!</p>
    </div>
  `;
  container.classList.remove('loading');
};

// Show error message
const showError = (message) => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Unable to Load Recipes</h3>
      <p>${escapeHtml(message)}</p>
      <button onclick="location.reload()" class="retry-btn">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>
  `;
  container.classList.remove('loading');
};

// Render featured recipes
const renderFeaturedRecipes = (recipes) => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = '';
  container.classList.remove('loading');
  
  if (!recipes || recipes.length === 0) {
    showNoResults();
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  recipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    if (card) fragment.appendChild(card);
  });
  
  container.appendChild(fragment);
};

// =================================================
// 🔹 Data Fetching - Only fetch 3 recipes
// =================================================

const fetchFeaturedRecipes = async () => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  showLoading();
  
  try {
    const { data, error, status } = await supabase
      .from('recipe_db')
      .select('*')
      .order('views', { ascending: true, nullsFirst: false })
      .limit(CONFIG.maxRecipes);
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }
    
    if (status !== 200) {
      throw new Error(`HTTP ${status}: Failed to fetch recipes`);
    }
    
    if (!data || data.length === 0) {
      showNoResults();
      hideLoading();
      return;
    }
    
    // Filter out invalid recipes
    const validRecipes = data.filter(isValidRecipe);
    
    if (validRecipes.length === 0) {
      showNoResults();
      hideLoading();
      return;
    }
    
    renderFeaturedRecipes(validRecipes);
    hideLoading();
    
  } catch (error) {
    console.error('Failed to fetch featured recipes:', error.message);
    showError(error.message || 'Unable to load featured recipes. Please try again later.');
  }
};

// =================================================
// 🔹 Initialize
// =================================================

const init = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fetchFeaturedRecipes();
    });
  } else {
    fetchFeaturedRecipes();
  }
};

// Start the app
init();

// Export for debugging
window.featuredDebug = {
  fetchFeaturedRecipes,
  createRecipeCard,
  getRecipeCategories,
  getThumbnail
};
