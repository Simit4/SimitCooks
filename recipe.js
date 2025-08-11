// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


console.log('Supabase initialized:', !!supabase);

// 2. Robust slug extraction
function getSlug() {
  // Handle /recipes/slug or /slug
  const segments = window.location.pathname.split('/').filter(s => s);
  let slug = segments.length > 1 ? segments[1] : segments[0];
  
  // Fallback for old ?slug= parameter
  if (!slug) {
    const params = new URLSearchParams(window.location.search);
    slug = params.get('slug');
  }
  
  console.log('Extracted slug:', slug);
  return slug;
}

// 3. Main recipe loader with error handling
async function loadRecipe() {
  const recipeContainer = document.getElementById('recipe-content');
  const slug = getSlug();

  if (!slug) {
    window.location.href = '/recipes';
    return;
  }

  try {
    // First verify database connection
    const test = await supabase
      .from('recipe_db')
      .select('id')
      .limit(1);
      
    if (test.error) throw test.error;

    // Then fetch the actual recipe
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    if (!recipe) throw new Error('Recipe not found');

    // Update view count
    await supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);

    renderRecipe(recipe);
    loadEquipment(recipe.equipment_ids || []);

  } catch (error) {
    console.error('Recipe load failed:', error);
    recipeContainer.innerHTML = `
      <div class="error-message">
        <h2>Recipe Load Failed</h2>
        <p>${error.message}</p>
        <a href="/recipes" class="btn">Browse All Recipes</a>
      </div>
    `;
  }
}

// 4. Recipe renderer
function renderRecipe(recipe) {
  document.title = `${recipe.title} | Simit's Swaad`;
  
  document.getElementById('recipe-content').innerHTML = `
    <article class="recipe-detail">
      <h1>${recipe.title}</h1>
      <div class="recipe-meta">
        <span><i class="fas fa-clock"></i> Prep: ${recipe.prep_time || 'N/A'}</span>
        <span><i class="fas fa-fire"></i> Cook: ${recipe.cook_time || 'N/A'}</span>
        <span><i class="fas fa-utensils"></i> Serves: ${recipe.servings || 'N/A'}</span>
      </div>
      
      <div class="recipe-grid">
        <div class="recipe-main">
          ${recipe.description ? `<p class="description">${recipe.description}</p>` : ''}
          
          <h2><i class="fas fa-list-ul"></i> Ingredients</h2>
          <ul class="ingredients">
            ${recipe.ingredients?.map(i => `<li>${i}</li>`).join('') || '<li>No ingredients listed</li>'}
          </ul>
          
          <h2><i class="fas fa-list-ol"></i> Method</h2>
          <ol class="method">
            ${recipe.method?.map(m => `<li>${m}</li>`).join('') || '<li>No method available</li>'}
          </ol>
        </div>
        
        ${recipe.video_url ? `
        <div class="recipe-video">
          <iframe src="${getEmbedUrl(recipe.video_url)}" 
                  frameborder="0" 
                  allowfullscreen></iframe>
        </div>
        ` : ''}
      </div>
    </article>
  `;
}

// 5. Equipment loader
async function loadEquipment(ids) {
  if (!ids.length) return;
  
  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', ids.map(Number));

    if (data?.length) {
      document.getElementById('equipment-section').style.display = 'block';
      document.getElementById('equipment-section').innerHTML = `
        <h2>Recommended Equipment</h2>
        <div class="equipment-grid">
          ${data.map(item => `
            <div class="equipment-card">
              <img src="${item.image_url}" alt="${item.name}">
              <h3>${item.name}</h3>
              <p>${item.description || ''}</p>
              <a href="${item.affiliate_link}" class="btn" target="_blank">
                <i class="fas fa-shopping-cart"></i> Buy Now
              </a>
            </div>
          `).join('')}
        </div>
      `;
    }
  } catch (error) {
    console.error('Equipment load failed:', error);
  }
}

// Helper functions
function getEmbedUrl(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[2]}` : '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Handle internal navigation
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/"]');
    if (link && !link.target) {
      e.preventDefault();
      window.history.pushState({}, '', link.href);
      loadRecipe();
    }
  });

  // Handle back/forward
  window.addEventListener('popstate', loadRecipe);

  // Initial load
  loadRecipe();
});
