import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


// DOM Elements
const recipesContainer = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');

// State
let allRecipes = [];
let currentFilter = 'all';
let currentSearch = '';

// Constants
const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';

// Helper Functions
const safeText = (value, defaultValue = '') => {
  if (!value && value !== 0) return defaultValue;
  if (typeof value === 'string') return value.trim() || defaultValue;
  return String(value) || defaultValue;
};

const escapeHtml = (text) => {
  const safe = safeText(text);
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return safe.replace(/[&<>"']/g, char => map[char]);
};

const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:v=|v\/|vi\/|youtu\.be\/|\/embed\/|\/v\/|\/e\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const getVideoThumbnail = (videoUrl) => {
  const videoId = getYouTubeId(videoUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

const getRecipeThumbnail = (recipe) => {
  if (recipe.thumbnail_url && typeof recipe.thumbnail_url === 'string') {
    return recipe.thumbnail_url;
  }
  const videoThumb = getVideoThumbnail(recipe.video_url);
  if (videoThumb) return videoThumb;
  return FALLBACK_IMAGE;
};

// Show Loading Skeleton
const showLoadingSkeleton = () => {
  if (!recipesContainer) return;
  recipesContainer.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'recipe-card skeleton-card';
    skeleton.innerHTML = `
      <div class="thumbnail-wrapper skeleton-thumbnail"></div>
      <div class="card-body">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
      </div>
    `;
    recipesContainer.appendChild(skeleton);
  }
};

// Create Recipe Card
const createRecipeCard = (recipe) => {
  const title = safeText(recipe.title, 'Untitled Recipe');
  const description = safeText(recipe.description, 'Delicious home-style recipe made with love.');
  const category = safeText(recipe.category);
  const slug = safeText(recipe.slug);
  const thumbnail = getRecipeThumbnail(recipe);

  const card = document.createElement('div');
  card.className = 'recipe-card';
  card.addEventListener('click', () => {
    if (slug) window.location.href = `/recipe/${slug}`;
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

// Render Recipes
const renderRecipes = () => {
  if (!recipesContainer) return;

  let filteredRecipes = [...allRecipes];

  // Apply category filter
  if (currentFilter !== 'all') {
    filteredRecipes = filteredRecipes.filter(recipe => 
      safeText(recipe.category).toLowerCase() === currentFilter.toLowerCase()
    );
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

  recipesContainer.innerHTML = '';

  if (filteredRecipes.length === 0) {
    recipesContainer.innerHTML = `
      <div class="no-results">
        <i class="fas fa-utensils"></i>
        <p>No recipes found matching your criteria.</p>
        <button onclick="location.reload()" class="retry-btn">
          <i class="fas fa-sync-alt"></i> Show All Recipes
        </button>
      </div>
    `;
    return;
  }

  const fragment = document.createDocumentFragment();
  filteredRecipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    fragment.appendChild(card);
  });
  recipesContainer.appendChild(fragment);
};

// Fetch Recipes from Supabase
const fetchRecipes = async () => {
  showLoadingSkeleton();

  try {
    const { data, error } = await supabase
      .from('recipe_db')
      .select('title, description, category, slug, thumbnail_url, video_url')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      recipesContainer.innerHTML = `
        <div class="no-results">
          <i class="fas fa-utensils"></i>
          <p>No recipes found. Check back soon!</p>
        </div>
      `;
      return;
    }

    allRecipes = data;
    renderRecipes();
  } catch (error) {
    console.error('Error fetching recipes:', error);
    recipesContainer.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        <p>Failed to load recipes. Please try again later.</p>
        <button onclick="location.reload()" class="retry-btn">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    `;
  }
};

// Event Listeners
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderRecipes();
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderRecipes();
  });
});

// Initialize
fetchRecipes();
