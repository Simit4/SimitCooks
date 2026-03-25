import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);





// =================================================
// 🔹 DOM Elements
// =================================================
const recipesContainer = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');

// =================================================
// 🔹 State
// =================================================
let allRecipes = [];
let currentFilter = 'all';
let currentSearch = '';
let isLoading = false;

// =================================================
// 🔹 Constants
// =================================================
const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';
const DEBOUNCE_DELAY = 300;
let debounceTimeout;

// =================================================
// 🔹 Helper Functions
// =================================================

// Safe text formatting - handles null, undefined, and non-string values
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

// Get thumbnail from video URL
const getVideoThumbnail = (videoUrl) => {
  const videoId = getYouTubeId(videoUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

// Get recipe thumbnail with fallback chain
const getRecipeThumbnail = (recipe) => {
  // Try thumbnail_url first
  if (recipe.thumbnail_url && typeof recipe.thumbnail_url === 'string' && recipe.thumbnail_url.trim()) {
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
  if (!recipesContainer || isLoading) return;
  isLoading = true;
  
  recipesContainer.innerHTML = '';
  recipesContainer.classList.add('loading');
  
  // Show 6 skeletons (2 rows of 3)
  for (let i = 0; i < 6; i++) {
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
    recipesContainer.appendChild(skeleton);
  }
};

// Hide loading skeleton
const hideLoadingSkeleton = () => {
  if (!recipesContainer) return;
  isLoading = false;
  recipesContainer.classList.remove('loading');
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
const renderRecipes = () => {
  if (!recipesContainer) return;
  
  console.log('Rendering recipes with filter:', currentFilter);
  console.log('Total recipes:', allRecipes.length);
  
  let filteredRecipes = [...allRecipes];
  
  // Apply category filter - FIXED: Check if filter is not 'all'
  if (currentFilter !== 'all') {
    filteredRecipes = filteredRecipes.filter(recipe => {
      const recipeCategory = safeText(recipe.category).toLowerCase();
      const filterValue = currentFilter.toLowerCase();
      const matches = recipeCategory === filterValue;
      
      console.log(`Recipe: ${recipe.title}, Category: ${recipeCategory}, Filter: ${filterValue}, Matches: ${matches}`);
      return matches;
    });
  }
  
  // Apply search filter
  if (currentSearch.trim()) {
    const searchTerm = currentSearch.toLowerCase().trim();
    filteredRecipes = filteredRecipes.filter(recipe =>
      safeText(recipe.title).toLowerCase().includes(searchTerm) ||
      safeText(recipe.description).toLowerCase().includes(searchTerm) ||
      safeText(recipe.category).toLowerCase().includes(searchTerm)
    );
  }
  
  console.log('Filtered recipes count:', filteredRecipes.length);
  
  // Clear container
  recipesContainer.innerHTML = '';
  
  // Show no results message
  if (filteredRecipes.length === 0) {
    recipesContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-utensils"></i>
        <h3>No Recipes Found</h3>
        <p>We couldn't find any recipes matching "${escapeHtml(currentSearch || currentFilter)}".</p>
        <button onclick="location.reload()" class="retry-btn">
          <i class="fas fa-sync-alt"></i> Show All Recipes
        </button>
      </div>
    `;
    return;
  }
  
  // Render cards using document fragment for better performance
  const fragment = document.createDocumentFragment();
  filteredRecipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    if (card) fragment.appendChild(card);
  });
  recipesContainer.appendChild(fragment);
  
  // Scroll to top when filters change (optional)
  if (window.innerWidth <= 768) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// =================================================
// 🔹 Data Fetching
// =================================================

// Fetch recipes from Supabase
const fetchRecipes = async () => {
  showLoadingSkeleton();
  
  try {
    const { data, error, status } = await supabase
      .from('recipe_db')
      .select('title, description, category, slug, thumbnail_url, video_url')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(error.message || 'Database error');
    }
    
    if (status !== 200) {
      throw new Error(`HTTP ${status}: Failed to fetch recipes`);
    }
    
    if (!data || data.length === 0) {
      recipesContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-utensils"></i>
          <h3>No Recipes Yet</h3>
          <p>Check back soon for delicious recipes!</p>
        </div>
      `;
      hideLoadingSkeleton();
      return;
    }
    
    console.log('Fetched recipes:', data);
    console.log('Recipe categories:', data.map(r => r.category));
    
    // Filter out invalid recipes
    const validRecipes = data.filter(isValidRecipe);
    
    if (validRecipes.length === 0) {
      recipesContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-exclamation-circle"></i>
          <p>No valid recipes found.</p>
        </div>
      `;
      hideLoadingSkeleton();
      return;
    }
    
    allRecipes = validRecipes;
    renderRecipes();
    hideLoadingSkeleton();
    
  } catch (error) {
    console.error('Failed to fetch recipes:', {
      message: error.message,
      stack: error.stack
    });
    
    recipesContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <h3>Unable to Load Recipes</h3>
        <p>${escapeHtml(error.message) || 'Please check your internet connection and try again.'}</p>
        <button onclick="location.reload()" class="retry-btn">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
    hideLoadingSkeleton();
  }
};

// =================================================
// 🔹 Event Listeners
// =================================================

// Debounced search input
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      currentSearch = e.target.value;
      renderRecipes();
    }, DEBOUNCE_DELAY);
  });
}

// Filter buttons - FIXED: Proper event handling
if (filterButtons && filterButtons.length > 0) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Get the filter value from data-filter attribute
      const filterValue = btn.getAttribute('data-filter');
      console.log('Filter button clicked:', filterValue);
      
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update current filter
      currentFilter = filterValue;
      
      // Clear search input when changing filter for better UX
      if (searchInput && currentSearch) {
        searchInput.value = '';
        currentSearch = '';
      }
      
      // Re-render with new filter
      renderRecipes();
    });
  });
} else {
  console.warn('No filter buttons found on the page');
}

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
    
    // Observe all images with data-src attribute
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
      fetchRecipes();
      initLazyLoading();
    });
  } else {
    fetchRecipes();
    initLazyLoading();
  }
};

// Start the app
init();

// Export for testing (if needed)
export { fetchRecipes, createRecipeCard, isValidRecipe, renderRecipes };
