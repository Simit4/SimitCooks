// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

console.log('[DEBUG] Supabase initialized:', !!supabase);

// ==============================================
// URL NORMALIZATION
// ==============================================
function normalizeUrl() {
  // Skip if already on clean URL
  if (window.location.pathname.startsWith('/recipes/')) return false;
  
  // Handle old recipe.html?slug= format
  if (window.location.pathname.includes('recipe.html') && window.location.search.includes('slug=')) {
    const slug = new URLSearchParams(window.location.search).get('slug');
    const newUrl = `${window.location.origin}/recipes/${slug}`;
    
    console.log('[REDIRECT] Migrating old URL:', {
      from: window.location.href,
      to: newUrl
    });
    
    window.location.replace(newUrl);
    return true; // Indicates redirect happened
  }
  
  return false;
}

// ==============================================
// RECIPE LOADER
// ==============================================
async function loadRecipe() {
  try {
    // Show loading state
    document.getElementById('recipe-content').innerHTML = `
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
        <p>Loading recipe...</p>
      </div>
    `;

    // Get slug from clean URL (/recipes/slug)
    const slug = window.location.pathname.split('/').pop();
    console.log('[DEBUG] Loading recipe for slug:', slug);

    if (!slug) throw new Error('No recipe specified');

    // 1. Verify database connection
    const test = await supabase
      .from('recipe_db')
      .select('id')
      .limit(1);
      
    if (test.error) throw test.error;
    console.log('[DEBUG] Database connection OK');

    // 2. Fetch recipe data
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select(`
        *,
        nutritional_info (calories, protein, carbohydrates, fat)
      `)
      .eq('slug', slug)
      .single();

    console.log('[DEBUG] Recipe data:', recipe);
    if (error) throw error;
    if (!recipe) throw new Error('Recipe not found');

    // 3. Update view count
    await supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);

    // 4. Render content
    renderRecipe(recipe);
    
    // 5. Load equipment if available
    if (recipe.equipment_ids?.length > 0) {
      await loadEquipment(recipe.equipment_ids);
    }

  } catch (error) {
    console.error('[ERROR] Recipe load failed:', error);
    showError(error);
  }
}

// ==============================================
// RENDER FUNCTIONS
// ==============================================
function renderRecipe(recipe) {
  document.title = `${recipe.title} | Simit's Swaad`;
  
  document.getElementById('recipe-content').innerHTML = `
    <article class="recipe-detail">
      <header class="recipe-header">
        <h1>${recipe.title}</h1>
        <div class="recipe-meta">
          ${recipe.prep_time ? `<span><i class="fas fa-clock"></i> Prep: ${recipe.prep_time}</span>` : ''}
          ${recipe.cook_time ? `<span><i class="fas fa-fire"></i> Cook: ${recipe.cook_time}</span>` : ''}
          ${recipe.servings ? `<span><i class="fas fa-utensils"></i> Serves: ${recipe.servings}</span>` : ''}
        </div>
      </header>
      
      ${recipe.description ? `<p class="recipe-description">${recipe.description}</p>` : ''}
      
      <div class="recipe-grid">
        <div class="recipe-ingredients">
          <h2><i class="fas fa-list-ul"></i> Ingredients</h2>
          <ul>${recipe.ingredients?.map(i => `<li>${i}</li>`).join('') || '<li>No ingredients listed</li>'}</ul>
        </div>
        
        <div class="recipe-method">
          <h2><i class="fas fa-list-ol"></i> Method</h2>
          <ol>${recipe.method?.map((step, i) => `<li><strong>Step ${i+1}:</strong> ${step}</li>`).join('') || '<li>No method available</li>'}</ol>
        </div>
      </div>
      
      ${recipe.video_url ? `
      <div class="recipe-video-container">
        <iframe src="${getYoutubeEmbedUrl(recipe.video_url)}" 
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowfullscreen></iframe>
      </div>
      ` : ''}
      
      ${recipe.nutritional_info ? `
      <div class="nutrition-facts">
        <h2><i class="fas fa-chart-pie"></i> Nutrition</h2>
        <div class="nutrition-grid">
          ${Object.entries(recipe.nutritional_info)
            .map(([key, val]) => val ? `<div><strong>${key}:</strong> ${val}</div>` : '')
            .join('')}
        </div>
      </div>
      ` : ''}
    </article>
  `;
}

async function loadEquipment(equipmentIds) {
  try {
    console.log('[DEBUG] Loading equipment:', equipmentIds);
    
    const { data: equipment, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', equipmentIds.map(Number));

    if (error) throw error;
    
    if (equipment?.length > 0) {
      document.getElementById('equipment-section').innerHTML = `
        <h2><i class="fas fa-blender"></i> Recommended Equipment</h2>
        <div class="equipment-grid">
          ${equipment.map(item => `
            <div class="equipment-card">
              <img src="${item.image_url || '/images/placeholder-equipment.jpg'}" 
                   alt="${item.name}" 
                   loading="lazy">
              <div class="equipment-info">
                <h3>${item.name}</h3>
                ${item.description ? `<p>${item.description}</p>` : ''}
                <a href="${item.affiliate_link || '#'}" 
                   class="btn-buy" 
                   target="_blank"
                   rel="noopener noreferrer">
                  <i class="fas fa-shopping-cart"></i> Buy Now
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      document.getElementById('equipment-section').style.display = 'block';
    }
  } catch (error) {
    console.error('[ERROR] Equipment load failed:', error);
  }
}

function showError(error) {
  document.getElementById('recipe-content').innerHTML = `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <h2>Recipe Load Failed</h2>
      <p>${error.message}</p>
      <div class="error-actions">
        <a href="/recipes" class="btn">
          <i class="fas fa-book"></i> Browse Recipes
        </a>
        <button onclick="window.location.reload()" class="btn">
          <i class="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    </div>
  `;
}

// ==============================================
// HELPER FUNCTIONS
// ==============================================
function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?rel=0`
    : '';
}

// ==============================================
// INITIALIZATION
// ==============================================
function init() {
  // First handle URL normalization
  if (!normalizeUrl()) {
    // If no redirect happened, load the recipe
    document.addEventListener('DOMContentLoaded', loadRecipe);
    
    // Handle back/forward navigation
    window.addEventListener('popstate', loadRecipe);
    
    // Handle internal link clicks (SPA-style)
    document.body.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link && !link.target) {
        e.preventDefault();
        window.history.pushState({}, '', link.href);
        loadRecipe();
      }
    });
  }
}

init();
