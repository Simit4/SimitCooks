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
  debug: false
};

// =================================================
// 🔹 Category Mapping - Group similar categories
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
// 🔹 Initialize Supabase
// =================================================
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

// =================================================
// 🔹 DOM Elements
// =================================================
const elements = {
  container: document.getElementById('recipes-container'),
  searchInput: document.getElementById('search-input'),
  filterContainer: document.querySelector('.filters')
};

// =================================================
// 🔹 Application State
// =================================================
const state = {
  recipes: [],
  filteredRecipes: [],
  categories: [],
  currentFilter: 'all',
  currentSearch: '',
  isLoading: false,
  error: null
};

// =================================================
// 🔹 Utility Functions
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
  
  // Map to main categories and filter out nulls
  const mappedCategories = new Set();
  rawCategories.forEach(cat => {
    const mapped = getMappedCategory(cat);
    if (mapped) {
      mappedCategories.add(mapped);
    }
  });
  
  return Array.from(mappedCategories);
};

// Extract only the categories that actually exist in recipes
const extractExistingCategories = (recipes) => {
  const categorySet = new Set();
  
  recipes.forEach(recipe => {
    const categories = getRecipeCategories(recipe);
    categories.forEach(cat => {
      if (cat && cat !== '') {
        categorySet.add(cat);
      }
    });
  });
  
  // Sort categories in a logical order
  const orderPriority = {
    'Main': 1,
    'Sauce': 2,
    'Side': 3,
    'Dessert': 4,
    'Snack': 5,
    'Breakfast': 6,
    'Beverage': 7,
    'Festival': 8
  };
  
  const sortedCategories = Array.from(categorySet).sort((a, b) => {
    const priorityA = orderPriority[a] || 99;
    const priorityB = orderPriority[b] || 99;
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.localeCompare(b);
  });
  
  return sortedCategories;
};

// Check if recipe matches a category
const matchesCategory = (recipe, filterValue) => {
  if (filterValue === 'all') return true;
  const categories = getRecipeCategories(recipe);
  return categories.includes(filterValue);
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

// =================================================
// 🔹 UI Components - Dynamic Filter Buttons
// =================================================

// Create filter buttons dynamically
const createFilterButtons = () => {
  if (!elements.filterContainer) return;
  
  // Clear existing buttons
  elements.filterContainer.innerHTML = '';
  
  // Add "All" button first
  const allButton = document.createElement('button');
  allButton.className = 'filter-btn active';
  allButton.setAttribute('data-filter', 'all');
  allButton.textContent = 'All';
  elements.filterContainer.appendChild(allButton);
  
  // Add category buttons (only categories that exist in recipes)
  console.log('Creating buttons for categories:', state.categories);
  
  state.categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'filter-btn';
    button.setAttribute('data-filter', category);
    button.textContent = category;
    elements.filterContainer.appendChild(button);
  });
  
  // Re-attach event listeners
  attachFilterListeners();
};

// Attach filter button event listeners
const attachFilterListeners = () => {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(btn => {
    btn.removeEventListener('click', handleFilterClick);
    btn.addEventListener('click', handleFilterClick);
  });
};

// Handle filter button click
const handleFilterClick = (e) => {
  const btn = e.currentTarget;
  const filterValue = btn.getAttribute('data-filter');
  
  if (!filterValue) return;
  
  // Update active state
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
  });
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

// =================================================
// 🔹 UI Components - Cards and Loading
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
// 🔹 Filtering Logic
// =================================================

const applyFilters = () => {
  let filtered = [...state.recipes];
  
  // Apply category filter
  if (state.currentFilter !== 'all') {
    const filterValue = state.currentFilter;
    filtered = filtered.filter(recipe => matchesCategory(recipe, filterValue));
  }
  
  // Apply search filter
  if (state.currentSearch.trim()) {
    const searchTerm = state.currentSearch.toLowerCase().trim();
    filtered = filtered.filter(recipe => {
      const title = safeText(recipe.title).toLowerCase();
      const description = safeText(recipe.description).toLowerCase();
      const categories = getRecipeCategories(recipe).join(' ').toLowerCase();
      
      return title.includes(searchTerm) || 
             description.includes(searchTerm) || 
             categories.includes(searchTerm);
    });
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
};

// =================================================
// 🔹 Data Fetching
// =================================================

const fetchRecipes = async () => {
  showLoading();
  
  try {
    const { data, error, status } = await supabase
      .from('recipe_db')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    
    if (status !== 200) throw new Error(`HTTP ${status}: Failed to fetch recipes`);
    
    if (!data?.length) {
      showNoResults();
      hideLoading();
      return;
    }
    
    state.recipes = data.filter(isValidRecipe);
    
    // Extract only categories that actually exist in recipes
    state.categories = extractExistingCategories(state.recipes);
    
    console.log('Found categories in database:', state.categories);
    
    // Create dynamic filter buttons
    createFilterButtons();
    
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
// 🔹 Search Handler
// =================================================

const handleSearch = (value) => {
  state.currentSearch = value;
  renderRecipes();
};

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
  if (elements.searchInput) {
    const debouncedSearch = debounce(handleSearch, CONFIG.debounceDelay);
    elements.searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
  }
};

// =================================================
// 🔹 Initialize Application
// =================================================

const init = () => {
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
  getRecipeCategories,
  extractExistingCategories
};
