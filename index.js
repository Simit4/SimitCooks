import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


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

// Safe text formatting - handles null, undefined, and non-string values
const safeText = (value, defaultValue = '') => {
  if (!value && value !== 0) return defaultValue;
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

// Get thumbnail URL from video URL
const getVideoThumbnail = (videoUrl) => {
  const videoId = getYouTubeId(videoUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

// Get recipe thumbnail with fallback
const getRecipeThumbnail = (recipe) => {
  // Try thumbnail_url first
  if (recipe.thumbnail_url && typeof recipe.thumbnail_url === 'string') {
    return recipe.thumbnail_url;
  }
  
  // Try video thumbnail
  const videoThumb = getVideoThumbnail(recipe.video_url);
  if (videoThumb) return videoThumb;
  
  // Return fallback
  return FALLBACK_IMAGE;
};

// Validate recipe data
const isValidRecipe = (recipe) => {
  return recipe && typeof recipe === 'object' && (recipe.title || recipe.slug);
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

// Create recipe card element
const createRecipeCard = (recipe) => {
  if (!isValidRecipe(recipe)) return null;
  
  const title = safeText(recipe.title, 'Untitled Recipe');
  const description = safeText(recipe.description, 'Delicious home-style recipe made with love.');
  const category = safeText(recipe.category);
  const slug = safeText(recipe.slug);
  const thumbnail = getRecipeThumbnail(recipe);
  
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.setAttribute('data-slug', slug);
  card.setAttribute('data-category', category);
  
  // Add click handler
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
      ${category ? `<span class="recipe-category">${escapeHtml(category)}</span>` : ''}
    </div>
  `;
  
  return card;
};

// Render recipes to DOM
const renderRecipes = (recipes) => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = '';
  container.classList.remove('loading');
  
  if (!recipes || recipes.length === 0) {
    renderNoResults();
    return;
  }
  
  const fragment = document.createDocumentFragment();
  let validCards = 0;
  
  recipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    if (card) {
      fragment.appendChild(card);
      validCards++;
    }
  });
  
  if (validCards === 0) {
    renderNoResults();
    return;
  }
  
  container.appendChild(fragment);
};

// Render error message
const renderError = (message = 'Failed to load recipes') => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-message" role="alert">
      <i class="fas fa-exclamation-circle"></i>
      <p>${escapeHtml(message)}</p>
      <button onclick="location.reload()" class="retry-btn">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>
  `;
  container.classList.remove('loading');
};

// Render no results message
const renderNoResults = () => {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="no-results">
      <i class="fas fa-utensils"></i>
      <p>No featured recipes found. Check back soon!</p>
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
  if (!container) {
    console.warn('Recipes container not found');
    return;
  }
  
  showLoadingSkeleton();
  
  try {
    const { data, error, status } = await supabase
      .from('recipe_db')
      .select('title, description, category, slug, thumbnail_url, video_url')
      .order('views', { ascending: true, nullsFirst: false })
      .limit(MAX_RECIPES);
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }
    
    if (status !== 200) {
      throw new Error(`HTTP ${status}: ${statusText}`);
    }
    
    // Filter out invalid recipes
    const validRecipes = data?.filter(isValidRecipe) || [];
    
    if (validRecipes.length === 0) {
      renderNoResults();
      return;
    }
    
    renderRecipes(validRecipes);
    
  } catch (error) {
    console.error('Failed to fetch featured recipes:', {
      message: error.message,
      stack: error.stack
    });
    
    renderError('Unable to load featured recipes. Please try again later.');
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
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.getAttribute('data-src');
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

// Export for testing (if needed)
export { fetchFeaturedRecipes, createRecipeCard, isValidRecipe };
