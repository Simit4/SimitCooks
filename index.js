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
const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';
const MAX_RECIPES = 3;

// =================================================
// 🔹 Helper Functions
// =================================================

// Safe text formatting
const safeText = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value.trim() || defaultValue;
  return String(value) || defaultValue;
};

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
  const safe = safeText(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  return safe.replace(/[&<>"'/`=]/g, char => map[char]);
};

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url) => {
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
};

// Get thumbnail from video URL - EXACT same as recipes page
const getVideoThumbnail = (videoUrl) => {
  const videoId = getYouTubeId(videoUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

// Get recipe thumbnail - EXACT same as recipes page
const getRecipeThumbnail = (recipe) => {
  // First priority: thumbnail_url
  if (recipe.thumbnail_url && typeof recipe.thumbnail_url === 'string' && recipe.thumbnail_url.trim()) {
    return recipe.thumbnail_url;
  }
  
  // Second priority: video thumbnail
  const videoThumb = getVideoThumbnail(recipe.video_url);
  if (videoThumb) return videoThumb;
  
  // Third priority: fallback image
  return FALLBACK_IMAGE;
};

// Validate recipe data
const isValidRecipe = (recipe) => {
  return recipe && typeof recipe === 'object' && (recipe.title || recipe.slug);
};

// Category mapping (same as recipes page)
const CATEGORY_MAP = {
  'main': 'Main',
  'main dish': 'Main',
  'entree': 'Main',
  'curry': 'Main',
  'rice': 'Main',
  'noodle': 'Main',
  'sauce': 'Sides & Sauces',
  'dip': 'Sides & Sauces',
  'chutney': 'Sides & Sauces',
  'side': 'Sides & Sauces',
  'accompaniment': 'Sides & Sauces',
  'salad': 'Sides & Sauces',
  'jhol': 'Sides & Sauces',
  'dessert': 'Dessert',
  'sweet': 'Dessert',
  'snack': 'Snack',
  'appetizer': 'Snack',
  'starter': 'Snack',
  'breakfast': 'Breakfast',
  'beverage': 'Beverage',
  'drink': 'Beverage',
  'festival': 'Festival',
  'special': 'Festival'
};

// Get mapped category
const getMappedCategory = (rawCategory) => {
  const lowerCat = safeText(rawCategory).toLowerCase();
  const mapped = CATEGORY_MAP[lowerCat];
  if (mapped) return mapped;
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

// =================================================
// 🔹 UI Components
// =================================================

// Show loading skeleton
const showLoadingSkeleton = () => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = '';
  container.classList.add('loading');
  
  for (let i = 0; i < MAX_RECIPES; i++) {
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
    container.appendChild(skeleton);
  }
};

// Create recipe card - IDENTICAL to recipes page
const createRecipeCard = (recipe) => {
  if (!isValidRecipe(recipe)) return null;
  
  const title = safeText(recipe.title, 'Untitled Recipe');
  const description = safeText(recipe.description, 'Delicious home-style recipe made with love.');
  const categories = getRecipeCategories(recipe);
  const primaryCategory = categories[0] || '';
  const slug = safeText(recipe.slug);
  const thumbnail = getRecipeThumbnail(recipe);
  
  // Debug log to see what thumbnail is being used
  console.log(`Recipe: ${title}`);
  console.log(`  - thumbnail_url: ${recipe.thumbnail_url}`);
  console.log(`  - video_url: ${recipe.video_url}`);
  console.log(`  - final thumbnail: ${thumbnail}`);
  
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.setAttribute('data-slug', slug);
  card.setAttribute('data-categories', categories.join(','));
  
  card.addEventListener('click', (e) => {
    e.preventDefault();
    if (slug) {
      window.location.href = `/recipe/${slug}`;
    }
  });
  
  card.innerHTML = `
    <div class="thumbnail-wrapper">
      <img 
        src="${thumbnail}" 
        alt="${escapeHtml(title)}"
        loading="lazy"
        onerror="this.src='${FALLBACK_IMAGE}'"
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

// Render featured recipes
const renderFeaturedRecipes = (recipes) => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = '';
  container.classList.remove('loading');
  
  if (!recipes || recipes.length === 0) {
    container.innerHTML = `
      <div class="no-results">
        <i class="fas fa-utensils"></i>
        <h3>No Recipes Yet</h3>
        <p>Check back soon for delicious recipes!</p>
      </div>
    `;
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  recipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    if (card) fragment.appendChild(card);
  });
  
  container.appendChild(fragment);
};

// Show error message
const showError = (message) => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <h3>Unable to Load Recipes</h3>
      <p>${escapeHtml(message)}</p>
      <button onclick="location.reload()" class="retry-btn">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>
  `;
  container.classList.remove('loading');
};

// =================================================
// 🔹 Data Fetching
// =================================================

// Fetch featured recipes from Supabase
const fetchFeaturedRecipes = async () => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  showLoadingSkeleton();
  
  try {
    const { data, error, status } = await supabase
      .from('recipe_db')
      .select('*')
      .order('views', { ascending: true, nullsFirst: false })
      .limit(MAX_RECIPES);
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }
    
    if (status !== 200) {
      throw new Error(`HTTP ${status}: Failed to fetch recipes`);
    }
    
    if (!data || data.length === 0) {
      renderFeaturedRecipes([]);
      return;
    }
    
    console.log('Fetched recipes:', data);
    
    // Filter out invalid recipes
    const validRecipes = data.filter(isValidRecipe);
    
    if (validRecipes.length === 0) {
      renderFeaturedRecipes([]);
      return;
    }
    
    renderFeaturedRecipes(validRecipes);
    
  } catch (error) {
    console.error('Failed to fetch featured recipes:', error.message);
    showError(error.message || 'Unable to load featured recipes. Please try again later.');
  }
};

// =================================================
// 🔹 Lazy Loading with Intersection Observer
// =================================================

const initLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// =================================================
// 🔹 Initialize
// =================================================

// Wait for DOM to be ready
const init = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      fetchFeaturedRecipes();
      initLazyLoading();
    });
  } else {
    fetchFeaturedRecipes();
    initLazyLoading();
  }
};

// Start the app
init();

// Export for debugging
window.indexDebug = {
  fetchFeaturedRecipes,
  createRecipeCard,
  getRecipeCategories,
  getRecipeThumbnail,
  getYouTubeId
};
