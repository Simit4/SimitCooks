import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 CONFIGURATION & CONSTANTS
// =================================================

const CONFIG = {
  supabase: {
    url: 'https://ozdwocrbrojtyogolqxn.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'
  },
  animation: {
    enabled: true,
    duration: 300,
    staggerDelay: 50
  },
  video: {
    autoplay: false,
    modestBranding: true,
    rel: 0
  }
};

// =================================================
// 🔹 INITIALIZATION
// =================================================

const supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);

// DOM Elements Cache
const DOM = {
  container: document.querySelector('.recipe-page'),
  title: document.getElementById('recipe-title'),
  description: document.getElementById('recipe-description'),
  meta: {
    prep: document.getElementById('prep-time'),
    cook: document.getElementById('cook-time'),
    servings: document.getElementById('servings')
  },
  ingredients: document.getElementById('ingredients-list'),
  method: document.getElementById('method-list'),
  nutrition: document.getElementById('nutrition'),
  metadata: {
    tags: document.getElementById('tags'),
    cuisine: document.getElementById('cuisine'),
    category: document.getElementById('category')
  },
  notes: document.getElementById('notes'),
  facts: document.getElementById('facts'),
  video: document.querySelector('.recipe-video'),
  equipment: document.getElementById('equipment-container')
};

// =================================================
// 🔹 UTILITY FUNCTIONS
// =================================================

/**
 * Safely escape HTML to prevent XSS attacks
 */
const escapeHtml = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Format time minutes to human readable format
 */
const formatTime = (minutes) => {
  if (!minutes || minutes === 'N/A') return '—';
  const mins = parseInt(minutes);
  if (isNaN(mins)) return '—';
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return remainingMins ? `${hours}h ${remainingMins}m` : `${hours}h`;
};

/**
 * Format array to badge HTML
 */
const formatBadges = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return '<span class="badge-empty">Not specified</span>';
  }
  return items.map(item => `<span class="badge">${escapeHtml(item)}</span>`).join('');
};

/**
 * Convert YouTube URL to embed URL
 */
const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      const params = new URLSearchParams();
      if (!CONFIG.video.autoplay) params.set('autoplay', '0');
      if (CONFIG.video.modestBranding) params.set('modestbranding', '1');
      if (CONFIG.video.rel === 0) params.set('rel', '0');
      const queryString = params.toString();
      return `https://www.youtube.com/embed/${match[1]}${queryString ? '?' + queryString : ''}`;
    }
  }
  return null;
};

/**
 * Get recipe slug from URL (supports multiple formats)
 */
const getRecipeSlug = () => {
  // Clean URL: /recipe/slug
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'recipe' && pathParts[1]) return pathParts[1];
  
  // Query parameter: ?slug=xxx
  const params = new URLSearchParams(window.location.search);
  const slugParam = params.get('slug');
  if (slugParam) return slugParam;
  
  // Hash routing: #/recipe/slug
  const hash = window.location.hash;
  if (hash.includes('/recipe/')) {
    const hashParts = hash.split('/');
    return hashParts[hashParts.length - 1];
  }
  
  return null;
};

/**
 * Update document metadata for SEO
 */
const updateMetadata = (recipe) => {
  document.title = `${recipe.title} | Simit Cooks`;
  
  // Update or create meta description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.appendChild(metaDesc);
  }
  metaDesc.content = recipe.description || `Discover how to make ${recipe.title} with Simit Cooks.`;
  
  // Update Open Graph tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.content = recipe.title;
  
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.content = recipe.description || `Discover how to make ${recipe.title}`;
};

/**
 * Apply fade-in animation to elements
 */
const applyStaggeredAnimation = (container, selector, baseDelay = 0) => {
  if (!CONFIG.animation.enabled) return;
  const items = container?.querySelectorAll(selector);
  if (!items?.length) return;
  
  items.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.animation = `fadeInUp ${CONFIG.animation.duration}ms ease forwards ${baseDelay + index * CONFIG.animation.staggerDelay}ms`;
  });
};

// =================================================
// 🔹 LOADING & ERROR STATES
// =================================================

const showLoadingState = () => {
  if (DOM.title) DOM.title.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading recipe...';
  if (DOM.description) DOM.description.textContent = 'Please wait while we fetch the recipe details.';
};

const showErrorState = (message, showRetry = true) => {
  if (!DOM.container) return;
  
  DOM.container.innerHTML = `
    <div class="error-state-modern">
      <div class="error-icon">
        <i class="fas fa-utensils"></i>
      </div>
      <h2>Recipe Not Found</h2>
      <p>${escapeHtml(message)}</p>
      <div class="error-actions">
        ${showRetry ? `
          <button onclick="window.location.reload()" class="btn-outline">
            <i class="fas fa-sync-alt"></i> Try Again
          </button>
        ` : ''}
        <a href="/recipes.html" class="btn-primary">
          <i class="fas fa-book-open"></i> Browse Recipes
        </a>
      </div>
    </div>
  `;
};

// =================================================
// 🔹 RENDER FUNCTIONS
// =================================================

const renderBasicInfo = (recipe) => {
  if (DOM.title) DOM.title.textContent = recipe.title;
  if (DOM.description) DOM.description.textContent = recipe.description || 'Delicious home-style recipe.';
  if (DOM.meta.prep) DOM.meta.prep.textContent = formatTime(recipe.prep_time);
  if (DOM.meta.cook) DOM.meta.cook.textContent = formatTime(recipe.cook_time);
  if (DOM.meta.servings) DOM.meta.servings.textContent = recipe.servings || '—';
};

const renderIngredients = (ingredients) => {
  if (!DOM.ingredients) return;
  
  if (!ingredients?.length) {
    DOM.ingredients.innerHTML = '<li class="empty-message">No ingredients listed.</li>';
    return;
  }
  
  DOM.ingredients.innerHTML = ingredients.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  applyStaggeredAnimation(DOM.ingredients, 'li');
};

const renderMethod = (method) => {
  if (!DOM.method) return;
  
  if (!method?.length) {
    DOM.method.innerHTML = '<li class="empty-message">No instructions available.</li>';
    return;
  }
  
  DOM.method.innerHTML = method.map(step => `<li>${escapeHtml(step)}</li>`).join('');
  applyStaggeredAnimation(DOM.method, 'li');
};

const renderNutrition = (nutrition) => {
  if (!DOM.nutrition) return;
  
  if (!nutrition || typeof nutrition !== 'object' || !Object.keys(nutrition).length) {
    DOM.nutrition.innerHTML = '<p class="empty-message">Nutrition information not available.</p>';
    return;
  }
  
  const nutritionMap = {
    calories: { icon: '🔥', label: 'Calories' },
    protein: { icon: '💪', label: 'Protein' },
    carbohydrates: { icon: '🍚', label: 'Carbs' },
    fiber: { icon: '🌾', label: 'Fiber' },
    fat: { icon: '🥑', label: 'Fat' }
  };
  
  const items = Object.entries(nutritionMap)
    .filter(([key]) => nutrition[key])
    .map(([key, { icon, label }]) => `
      <div class="nutrition-item">
        <div class="nutrition-icon">${icon}</div>
        <div class="nutrition-label">${label}</div>
        <div class="nutrition-value">${escapeHtml(nutrition[key])}</div>
      </div>
    `);
  
  DOM.nutrition.innerHTML = `<div class="nutrition-grid">${items.join('')}</div>`;
};

const renderMetadata = (recipe) => {
  if (DOM.metadata.tags) DOM.metadata.tags.innerHTML = formatBadges(recipe.tags);
  if (DOM.metadata.cuisine) DOM.metadata.cuisine.innerHTML = formatBadges(recipe.cuisine);
  if (DOM.metadata.category) DOM.metadata.category.innerHTML = formatBadges(recipe.category);
};

const renderNotes = (recipe) => {
  if (DOM.notes) DOM.notes.textContent = recipe.notes || 'No additional notes available.';
  if (DOM.facts) DOM.facts.textContent = recipe.facts || 'No fun facts found.';
};

const renderVideo = (videoUrl, title) => {
  if (!DOM.video) return;
  
  const embedUrl = getYouTubeEmbedUrl(videoUrl);
  if (embedUrl) {
    DOM.video.innerHTML = `
      <iframe 
        src="${embedUrl}"
        title="${escapeHtml(title)} recipe video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    `;
    DOM.video.classList.add('has-video');
  } else {
    DOM.video.classList.remove('has-video');
    DOM.video.innerHTML = '<div class="no-video"><i class="fas fa-video-slash"></i><p>Video coming soon</p></div>';
  }
};

const renderEquipment = async (equipmentIds) => {
  if (!DOM.equipment) return;
  
  if (!equipmentIds?.length) {
    DOM.equipment.innerHTML = '<p class="empty-message">No recommended equipment found.</p>';
    return;
  }
  
  DOM.equipment.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading equipment...</div>';
  
  try {
    const numericIds = equipmentIds.map(id => typeof id === 'string' ? parseInt(id) : id);
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', numericIds)
      .limit(8);

    if (error) throw error;

    if (!data?.length) {
      DOM.equipment.innerHTML = '<p class="empty-message">No recommended equipment found.</p>';
      return;
    }

    DOM.equipment.innerHTML = data.map((item, index) => `
      <div class="equipment-item" style="animation-delay: ${index * 0.05}s">
        <div class="equipment-image">
          <img 
            src="${item.image_url || 'https://via.placeholder.com/300x200?text=Equipment'}" 
            alt="${escapeHtml(item.name)}"
            loading="lazy"
          >
          ${item.description ? `<div class="equipment-overlay"><p>${escapeHtml(item.description)}</p></div>` : ''}
        </div>
        <div class="equipment-details">
          <h3>${escapeHtml(item.name)}</h3>
          ${item.affiliate_link ? `
            <a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer nofollow" class="equipment-link">
              Shop Now <i class="fas fa-arrow-right"></i>
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Equipment fetch error:', error);
    DOM.equipment.innerHTML = '<p class="error-message">Unable to load equipment recommendations.</p>';
  }
};

// =================================================
// 🔹 MAIN FETCH FUNCTION
// =================================================

const fetchAndRenderRecipe = async () => {
  showLoadingState();
  
  const slug = getRecipeSlug();
  
  if (!slug) {
    showErrorState('No recipe specified. Please browse our recipes collection.', false);
    return;
  }

  try {
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !recipe) {
      showErrorState(`Recipe "${slug}" not found. It may have been moved or deleted.`);
      return;
    }

    // Update view count asynchronously
    supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id)
      .then(() => console.log('[Analytics] View count updated'))
      .catch(err => console.error('[Analytics] Error updating views:', err));

    // Update SEO metadata
    updateMetadata(recipe);
    
    // Render all sections
    renderBasicInfo(recipe);
    renderIngredients(recipe.ingredients);
    renderMethod(recipe.method);
    renderNutrition(recipe.nutritional_info);
    renderMetadata(recipe);
    renderNotes(recipe);
    renderVideo(recipe.video_url, recipe.title);
    await renderEquipment(recipe.equipment_ids);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log(`[Success] Recipe loaded: ${recipe.title}`);
    
  } catch (error) {
    console.error('[Error] Fetch failed:', error);
    showErrorState('An error occurred while loading the recipe. Please try again later.');
  }
};

// =================================================
// 🔹 CSS ANIMATIONS (Auto-injected)
// =================================================

const injectStyles = () => {
  const styles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(16px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: #f0f4f0;
      color: #27ae60;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .badge:hover {
      background: #27ae60;
      color: white;
      transform: translateY(-1px);
    }
    
    .badge-empty {
      color: #94a3b8;
      font-size: 0.875rem;
      font-style: italic;
    }
    
    .empty-message,
    .error-message {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
      font-style: italic;
    }
    
    .loading-spinner {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
    }
    
    .nutrition-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }
    
    .nutrition-item {
      text-align: center;
      padding: 0.75rem;
      background: #f8faf8;
      border-radius: 12px;
      transition: all 0.2s ease;
    }
    
    .nutrition-item:hover {
      transform: translateY(-2px);
      background: #f0f4f0;
    }
    
    .nutrition-icon {
      font-size: 1.25rem;
      margin-bottom: 0.25rem;
    }
    
    .nutrition-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 0.25rem;
    }
    
    .nutrition-value {
      font-weight: 600;
      color: #1e8449;
    }
    
    .error-state-modern {
      text-align: center;
      padding: 3rem 2rem;
    }
    
    .error-icon {
      font-size: 4rem;
      color: #dc2626;
      margin-bottom: 1rem;
    }
    
    .error-state-modern h2 {
      margin-bottom: 0.5rem;
      color: #2c3e50;
    }
    
    .error-state-modern p {
      color: #64748b;
      margin-bottom: 1.5rem;
    }
    
    .error-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .btn-primary,
    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      border-radius: 40px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      font-size: 0.875rem;
    }
    
    .btn-primary {
      background: #27ae60;
      color: white;
    }
    
    .btn-primary:hover {
      background: #1e8449;
      transform: translateY(-1px);
    }
    
    .btn-outline {
      background: transparent;
      color: #27ae60;
      border: 1px solid #27ae60;
    }
    
    .btn-outline:hover {
      background: #27ae60;
      color: white;
      transform: translateY(-1px);
    }
    
    .no-video {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      height: 100%;
      min-height: 200px;
      background: #f8f9fa;
      border-radius: 16px;
      color: #94a3b8;
    }
    
    .no-video i {
      font-size: 2rem;
    }
    
    .recipe-video.has-video iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
    }
    
    .equipment-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      color: #27ae60;
      border-radius: 40px;
      font-size: 0.75rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    
    .equipment-link:hover {
      background: #27ae60;
      color: white;
    }
  `;
  
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
};

// =================================================
// 🔹 INITIALIZATION
// =================================================

injectStyles();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fetchAndRenderRecipe);
} else {
  fetchAndRenderRecipe();
}

// Export for module usage
export { fetchAndRenderRecipe };
