import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 Configuration & Constants
// =================================================
const CONFIG = {
  supabaseUrl: 'https://ozdwocrbrojtyogolqxn.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ',
  fallbackImage: 'https://i.ibb.co/4p4mR3N/momo-graphic.png',
  debounceDelay: 300,
  itemsPerPage: 12,
  skeletonCount: 6
};

// =================================================
// 🔹 Initialize Supabase
// =================================================
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

// =================================================
// 🔹 DOM Elements
// =================================================
const elements = {
  container: document.getElementById('recipes-container'),
  searchInput: document.getElementById('search-input'),
  filterButtons: document.querySelectorAll('.filter-btn')
};

// =================================================
// 🔹 Application State
// =================================================
const state = {
  recipes: [],
  filteredRecipes: [],
  currentFilter: 'all',
  currentSearch: '',
  isLoading: false,
  error: null
};

// =================================================
// 🔹 Utility Functions
// =================================================

// Safe text formatting
const safeText = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value.trim() || defaultValue;
  return String(value) || defaultValue;
};

// Enhanced XSS protection
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

// YouTube ID extraction
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

// Get thumbnail URL
const getThumbnail = (recipe) => {
  if (recipe.thumbnail_url?.trim()) return recipe.thumbnail_url;
  
  const videoId = extractYouTubeId(recipe.video_url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  return CONFIG.fallbackImage;
};

// Validate recipe
const isValidRecipe = (recipe) => {
  return recipe && typeof recipe === 'object' && (recipe.title || recipe.slug);
};

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// =================================================
// 🔹 UI Components
// =================================================

// Create loading skeleton
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

// Show loading state
const showLoading = () => {
  if (!elements.container || state.isLoading) return;
  
  state.isLoading = true;
  elements.container.innerHTML = '';
  elements.container.classList.add('loading');
  
  for (let i = 0; i < CONFIG.skeletonCount; i++) {
    elements.container.appendChild(createSkeleton());
  }
};

// Hide loading state
const hideLoading = () => {
  if (!elements.container) return;
  state.isLoading = false;
  elements.container.classList.remove('loading');
};

// Create recipe card
const createRecipeCard = (recipe) => {
  if (!isValidRecipe(recipe)) return null;
  
  const title = safeText(recipe.title, 'Untitled Recipe');
  const description = safeText(recipe.description, 'Delicious home-style recipe made with love.');
  const category = safeText(recipe.category);
  const slug = safeText(recipe.slug);
  const thumbnail = getThumbnail(recipe);
  
  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.setAttribute('data-slug', slug);
  card.setAttribute('data-category', category);
  
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
      ${category ? `<span class="recipe-category">${escapeHtml(category)}</span>` : ''}
    </div>
  `;
  
  return card;
};

// Show no results message
const showNoResults = () => {
  if (!elements.container) return;
  
  const filterName = state.currentFilter === 'all' ? 'recipes' : state.currentFilter;
  const searchTerm = state.currentSearch ? ` matching "${escapeHtml(state.currentSearch)}"` : '';
  
  elements.container.innerHTML = `
    <div class="no-results">
      <i class="fas fa-search"></i>
      <h3>No Recipes Found</h3>
      <p>We couldn't find any ${escapeHtml(filterName)}${searchTerm}.</p>
      <button onclick="location.reload()" class="retry-btn">
        <i class="fas fa-sync-alt"></i> Show All Recipes
      </button>
    </div>
  `;
};

// Show error message
const showError = (message) => {
  if (!elements.container) return;
  
  elements.container.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Something Went Wrong</h3>
      <p>${escapeHtml(message)}</p>
      <button onclick="location.reload()" class="retry-btn">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>
  `;
};

// =================================================
// 🔹 Filtering Logic
// =================================================

// Apply all filters to recipes
const applyFilters = () => {
  let filtered = [...state.recipes];
  
  // Apply category filter
  if (state.currentFilter !== 'all') {
    filtered = filtered.filter(recipe => 
      safeText(recipe.category).toLowerCase() === state.currentFilter.toLowerCase()
    );
  }
  
  // Apply search filter
  if (state.currentSearch.trim()) {
    const searchTerm = state.currentSearch.toLowerCase().trim();
    filtered = filtered.filter(recipe =>
      safeText(recipe.title).toLowerCase().includes(searchTerm) ||
      safeText(recipe.description).toLowerCase().includes(searchTerm) ||
      safeText(recipe.category).toLowerCase().includes(searchTerm)
    );
  }
  
  state.filteredRecipes = filtered;
  return filtered;
};

// Render recipes to DOM
const renderRecipes = () => {
  if (!elements.container) return;
  
  const filteredRecipes = applyFilters();
  
  if (filteredRecipes.length === 0) {
    showNoResults();
    return;
  }
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  filteredRecipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    if (card) fragment.appendChild(card);
  });
  
  elements.container.innerHTML = '';
  elements.container.appendChild(fragment);
  
  // Smooth scroll to top on mobile when filtering
  if (window.innerWidth <= 768 && (state.currentFilter !== 'all' || state.currentSearch)) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// =================================================
// 🔹 Data Fetching
// =================================================

// Fetch recipes from Supabase
const fetchRecipes = async () => {
  showLoading();
  
  try {
    const { data, error, status } = await supabase
      .from('recipe_db')
      .select('title, description, category, slug, thumbnail_url, video_url')
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (status !== 200) {
      throw new Error(`HTTP ${status}: Failed to fetch recipes`);
    }
    
    if (!data?.length) {
      showNoResults();
      hideLoading();
      return;
    }
    
    // Validate and store recipes
    state.recipes = data.filter(isValidRecipe);
    
    if (state.recipes.length === 0) {
      showNoResults();
      hideLoading();
      return;
    }
    
    // Initial render
    renderRecipes();
    hideLoading();
    
  } catch (error) {
    console.error('Fetch error:', error);
    showError(error.message || 'Unable to load recipes. Please check your connection.');
    hideLoading();
  }
};

// =================================================
// 🔹 Event Handlers
// =================================================

// Handle filter button clicks
const handleFilterClick = (btn) => {
  const filterValue = btn.getAttribute('data-filter');
  if (!filterValue) return;
  
  // Update active state
  elements.filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  
  // Update state
  state.currentFilter = filterValue;
  
  // Clear search when changing filter
  if (elements.searchInput) {
    elements.searchInput.value = '';
    state.currentSearch = '';
  }
  
  // Re-render
  renderRecipes();
};

// Handle search input with debounce
const handleSearch = debounce((value) => {
  state.currentSearch = value;
  renderRecipes();
}, CONFIG.debounceDelay);

// =================================================
// 🔹 Initialize Event Listeners
// =================================================

const initEventListeners = () => {
  // Filter buttons
  if (elements.filterButtons?.length) {
    elements.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleFilterClick(btn);
      });
    });
  }
  
  // Search input
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
  }
};

// =================================================
// 🔹 Lazy Loading Images
// =================================================

const initLazyLoading = () => {
  if (!('IntersectionObserver' in window)) return;
  
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        imageObserver.unobserve(img);
      }
    });
  }, { rootMargin: '50px', threshold: 0.1 });
  
  // Observe images that will be added dynamically
  const observeImages = () => {
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  };
  
  // Set up a mutation observer to watch for new images
  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach(() => observeImages());
  });
  
  if (elements.container) {
    mutationObserver.observe(elements.container, { childList: true, subtree: true });
  }
  
  observeImages();
};

// =================================================
// 🔹 Initialize Application
// =================================================

const init = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initEventListeners();
      fetchRecipes();
      initLazyLoading();
    });
  } else {
    initEventListeners();
    fetchRecipes();
    initLazyLoading();
  }
};

// Start the app
init();

// =================================================
// 🔹 Export for testing (if needed)
// =================================================
export { 
  fetchRecipes, 
  renderRecipes, 
  applyFilters,
  state,
  CONFIG
};
