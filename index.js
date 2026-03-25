import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);



// Show loading skeleton
function showLoadingSkeleton() {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'recipe-card skeleton-card';
    skeleton.innerHTML = `
      <div class="thumbnail-wrapper skeleton-thumbnail"></div>
      <div class="card-body">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
      </div>
    `;
    container.appendChild(skeleton);
  }
}

// Escape HTML to prevent XSS - FIXED to handle non-string values
function escapeHtml(str) {
  if (!str) return '';
  if (typeof str !== 'string') return String(str);
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Fetch featured recipes
async function fetchFeaturedRecipes() {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  // Show loading skeleton
  showLoadingSkeleton();

  try {
    const { data, error } = await supabase
      .from('recipe_db')
      .select('*')
      .order('views', { ascending: true, nullsFirst: false })
      .limit(3);

    if (error) throw error;

    if (!data || data.length === 0) {
      renderNoResults();
      return;
    }

    renderFeaturedRecipes(data);
  } catch (error) {
    console.error('Error fetching featured recipes:', error.message);
    renderError(error.message);
  }
}

// Render featured recipes
function renderFeaturedRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = '';

  recipes.forEach(recipe => {
    // Safely get values with fallbacks
    const title = recipe.title || 'Untitled Recipe';
    const description = recipe.description || 'Delicious home-style recipe made with love.';
    const category = recipe.category || '';
    const slug = recipe.slug || '';
    
    // Get thumbnail with fallback
    let thumb = recipe.thumbnail_url;
    if (!thumb) {
      thumb = getVideoThumbnail(recipe.video_url);
    }
    if (!thumb) {
      thumb = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';
    }
    
    const fallbackImage = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';
    
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => {
      if (slug) {
        window.location.href = `/recipe/${slug}`;
      }
    };
    
    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img 
          src="${thumb}" 
          alt="${escapeHtml(title)}"
          loading="lazy"
          onerror="this.src='${fallbackImage}'"
        />
      </div>
      <div class="card-body">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        ${category ? `<span class="recipe-category">${escapeHtml(category)}</span>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

// Get YouTube thumbnail from video URL
function getVideoThumbnail(url) {
  if (!url || typeof url !== 'string') return null;
  
  const patterns = [
    /(?:v=|v\/|vi\/|youtu\.be\/|\/embed\/|\/v\/|\/e\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
  }
  return null;
}

// Render error message
function renderError(message) {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>Failed to load recipes. Please try again later.</p>
      <button onclick="location.reload()" class="retry-btn">
        <i class="fas fa-sync-alt"></i> Try Again
      </button>
    </div>
  `;
}

// Render no results message
function renderNoResults() {
  const container = document.getElementById('recipes-container');
  if (!container) return;
  
  container.innerHTML = `
    <div class="no-results">
      <i class="fas fa-utensils"></i>
      <p>No featured recipes found. Check back soon!</p>
    </div>
  `;
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedRecipes();
  });
} else {
  fetchFeaturedRecipes();
}
