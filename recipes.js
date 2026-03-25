import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 Configuration & Constants
// =================================================
const CONFIG = {
  supabaseUrl: 'https://ozdwocrbrojtyogolqxn.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ',
  fallbackImage: 'https://i.ibb.co/4p4mR3N/momo-graphic.png',
  debounceDelay: 300,
  skeletonCount: 6,
  debug: true
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
// 🔹 Debug Logger
// =================================================
const debugLog = (...args) => {
  if (CONFIG.debug) {
    console.log('[Recipes Debug]:', ...args);
  }
};

// =================================================
// 🔹 Utility Functions
// =================================================

const safeText = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value.trim() || defaultValue;
  return String(value) || defaultValue;
};

// Handle array categories - FIXED for your database structure
const getRecipeCategories = (recipe) => {
  // category is an array in your database
  if (recipe.category && Array.isArray(recipe.category)) {
    return recipe.category.map(cat => safeText(cat).toLowerCase());
  }
  // If it's a string, convert to array
  if (recipe.category && typeof recipe.category === 'string') {
    return [safeText(recipe.category).toLowerCase()];
  }
  return [];
};

// Check if recipe matches a category
const matchesCategory = (recipe, filterValue) => {
  const categories = getRecipeCategories(recipe);
  return categories.includes(filterValue.toLowerCase());
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
  if (recipe.thumbnail_url?.trim()) return recipe.thumbnail_url;
  
  const videoId = extractYouTubeId(recipe.video_url);
  if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  
  return CONFIG.fallbackImage;
};

const isValidRecipe = (recipe) => {
  return recipe && typeof recipe === 'object' && (recipe.title || recipe.slug);
};

// Format ingredients and method from JSON arrays
const formatArray = (arr) => {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr;
  try {
    return JSON.parse(arr);
  } catch {
    return [];
  }
};

// =================================================
// 🔹 UI Components
// =================================================

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

const showLoading = () => {
  if (!elements.container || state.isLoading) return;
  
  state.isLoading = true;
  elements.container.innerHTML = '';
  elements.container.classList.add('loading');
  
  for (let i = 0; i < CONFIG.skeletonCount; i++) {
    elements.container.appendChild(createSkeleton());
  }
};

const hideLoading = () => {
  if (!elements.container) return;
  state.isLoading = false;
  elements.container.classList.remove('loading');
};

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
// 🔹 Filtering Logic - FIXED for array categories
// =================================================

const applyFilters = () => {
  debugLog('Applying filters...');
  debugLog('Current filter:', state.currentFilter);
  debugLog('Current search:', state.currentSearch);
  debugLog('Total recipes:', state.recipes.length);
  
  let filtered = [...state.recipes];
  
  // Debug: Show all categories from recipes
  const allCategories = [];
  state.recipes.forEach(recipe => {
    const categories = getRecipeCategories(recipe);
    categories.forEach(cat => {
      if (!allCategories.includes(cat)) allCategories.push(cat);
    });
  });
  debugLog('Available categories in database:', allCategories);
  
  // Apply category filter - FIXED for array categories
  if (state.currentFilter !== 'all') {
    const filterValue = state.currentFilter.toLowerCase();
    debugLog(`Filtering by category: "${filterValue}"`);
    
    filtered = filtered.filter(recipe => {
      const matches = matchesCategory(recipe, filterValue);
      
      if (matches) {
        const categories = getRecipeCategories(recipe);
        debugLog(`✓ Matched: ${recipe.title} (categories: ${categories.join(', ')})`);
      }
      
      return matches;
    });
    
    debugLog(`Found ${filtered.length} recipes matching filter "${filterValue}"`);
  } else {
    debugLog('Showing all recipes');
  }
  
  // Apply search filter
  if (state.currentSearch.trim()) {
    const searchTerm = state.currentSearch.toLowerCase().trim();
    debugLog(`Searching for: "${searchTerm}"`);
    
    filtered = filtered.filter(recipe => {
      const title = safeText(recipe.title).toLowerCase();
      const description = safeText(recipe.description).toLowerCase();
      const categories = getRecipeCategories(recipe).join(' ').toLowerCase();
      
      const matches = title.includes(searchTerm) || 
                      description.includes(searchTerm) || 
                      categories.includes(searchTerm);
      
      if (matches) {
        debugLog(`✓ Search matched: ${recipe.title}`);
      }
      
      return matches;
    });
    
    debugLog(`Found ${filtered.length} recipes matching search "${searchTerm}"`);
  }
  
  state.filteredRecipes = filtered;
  return filtered;
};

const renderRecipes = () => {
  if (!elements.container) return;
  
  const filteredRecipes = applyFilters();
  
  if (filteredRecipes.length === 0) {
    showNoResults();
    return;
  }
  
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
  
  debugLog(`Rendered ${filteredRecipes.length} recipes`);
};

// =================================================
// 🔹 Data Fetching
// =================================================

const fetchRecipes = async () => {
  showLoading();
  
  try {
    debugLog('Fetching recipes from Supabase...');
    
    const { data, error, status } = await supabase
      .from('recipe_db')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      debugLog('Supabase error:', error);
      throw new Error(error.message);
    }
    
    if (status !== 200) {
      debugLog('HTTP error:', status);
      throw new Error(`HTTP ${status}: Failed to fetch recipes`);
    }
    
    if (!data?.length) {
      debugLog('No recipes found in database');
      showNoResults();
      hideLoading();
      return;
    }
    
    debugLog(`Fetched ${data.length} recipes from database`);
    
    // Log sample recipe categories
    debugLog('Sample recipes with categories:');
    data.slice(0, 3).forEach(r => {
      debugLog(`- ${r.title}: categories =`, r.category);
    });
    
    // Validate and store recipes
    state.recipes = data.filter(isValidRecipe);
    
    // Log all unique categories
    const allCategories = [];
    state.recipes.forEach(recipe => {
      const categories = getRecipeCategories(recipe);
      categories.forEach(cat => {
        if (!allCategories.includes(cat)) allCategories.push(cat);
      });
    });
    debugLog('All unique categories in database:', allCategories);
    
    if (state.recipes.length === 0) {
      showNoResults();
      hideLoading();
      return;
    }
    
    // Initial render
    renderRecipes();
    hideLoading();
    
  } catch (error) {
    debugLog('Fetch error:', error);
    showError(error.message || 'Unable to load recipes. Please check your connection.');
    hideLoading();
  }
};

// =================================================
// 🔹 Event Handlers
// =================================================

const handleFilterClick = (btn) => {
  const filterValue = btn.getAttribute('data-filter');
  if (!filterValue) return;
  
  debugLog(`Filter button clicked: ${filterValue}`);
  
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

const handleSearch = (value) => {
  debugLog(`Search input changed: "${value}"`);
  state.currentSearch = value;
  renderRecipes();
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
// 🔹 Initialize Event Listeners
// =================================================

const initEventListeners = () => {
  debugLog('Initializing event listeners...');
  debugLog('Filter buttons found:', elements.filterButtons.length);
  
  // Filter buttons
  if (elements.filterButtons?.length) {
    elements.filterButtons.forEach((btn, index) => {
      const filterValue = btn.getAttribute('data-filter');
      debugLog(`Button ${index}: data-filter="${filterValue}"`);
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        handleFilterClick(btn);
      });
    });
  } else {
    debugLog('No filter buttons found on the page!');
  }
  
  // Search input
  if (elements.searchInput) {
    const debouncedSearch = debounce(handleSearch, CONFIG.debounceDelay);
    elements.searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
    debugLog('Search input listener attached');
  }
};

// =================================================
// 🔹 Initialize Application
// =================================================

const init = () => {
  debugLog('Initializing Recipes App...');
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initEventListeners();
      fetchRecipes();
    });
  } else {
    initEventListeners();
    fetchRecipes();
  }
};

// Start the app
init();

// Export for debugging
window.recipesDebug = {
  state,
  CONFIG,
  applyFilters,
  renderRecipes,
  getRecipeCategories,
  matchesCategory
};
