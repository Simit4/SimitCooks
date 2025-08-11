import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


// Get slug from clean URL (/recipes/slug) or fallback to query param
function getCurrentSlug() {
  const pathParts = window.location.pathname.split('/');
  
  // Handle both /recipes/slug and /slug formats
  const slug = pathParts.length > 2 ? pathParts[2] : pathParts[1];
  
  // Fallback to query param for backward compatibility
  if (!slug || slug === 'recipes') {
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
  }
  return slug;
}

// Main function to load and display recipe
async function loadRecipe() {
  const slug = getCurrentSlug();
  
  if (!slug) {
    window.location.href = '/recipes';
    return;
  }

  try {
    // Show loading state
    document.getElementById('recipe-content').innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i> Loading recipe...
      </div>
    `;

    // Fetch recipe from Supabase
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !recipe) {
      throw new Error('Recipe not found');
    }

    // Update view count
    await supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);

    // Render the recipe
    renderRecipe(recipe);
    
    // Update SEO meta tags
    updateMetaTags(recipe);

  } catch (error) {
    console.error('Error loading recipe:', error);
    document.getElementById('recipe-content').innerHTML = `
      <div class="error-message">
        <h2>Recipe Not Found</h2>
        <p>We couldn't find the recipe you're looking for.</p>
        <a href="/recipes" class="btn">Browse All Recipes</a>
      </div>
    `;
  }
}

// Render recipe to the page
function renderRecipe(recipe) {
  const recipeContent = `
    <h1 id="recipe-title">${recipe.title}</h1>

    <div class="recipe-meta">
      <span>⏱️ <strong>Prep:</strong> ${recipe.prep_time || 'N/A'}</span>
      <span>🍳 <strong>Cook:</strong> ${recipe.cook_time || 'N/A'}</span>
      <span>🍽️ <strong>Serves:</strong> ${recipe.servings || 'N/A'}</span>
    </div>

    <p class="description">${recipe.description || ''}</p>

    <div class="recipe-layout">
      <div class="recipe-left">
        <h3>📝 Ingredients</h3>
        <ul id="ingredients-list">
          ${recipe.ingredients?.map(item => `<li>${item}</li>`).join('') || '<li>No ingredients listed</li>'}
        </ul>

        <h3>👨‍🍳 Method</h3>
        <ol id="method-list">
          ${recipe.method?.map(step => `<li>${step}</li>`).join('') || '<li>No method available</li>'}
        </ol>

        <h3>🍽️ Nutrition</h3>
        <div id="nutrition">
          ${recipe.nutritional_info ? `
            <strong>Calories:</strong> ${recipe.nutritional_info.calories || 'N/A'}<br>
            <strong>Protein:</strong> ${recipe.nutritional_info.protein || 'N/A'}<br>
            <strong>Carbs:</strong> ${recipe.nutritional_info.carbohydrates || 'N/A'}<br>
            <strong>Fat:</strong> ${recipe.nutritional_info.fat || 'N/A'}
          ` : 'Nutritional information not available'}
        </div>

        <div class="recipe-tags">
          <div><strong>Tags:</strong> ${recipe.tags?.join(', ') || 'None'}</div>
          <div><strong>Cuisine:</strong> ${recipe.cuisine?.join(', ') || 'Not specified'}</div>
          <div><strong>Category:</strong> ${recipe.category?.join(', ') || 'Not specified'}</div>
        </div>

        ${recipe.notes ? `<h3>📝 Notes</h3><p>${recipe.notes}</p>` : ''}
        ${recipe.facts ? `<h3>📚 Fun Fact</h3><p>${recipe.facts}</p>` : ''}

        <button class="btn-print" onclick="window.print()">
          🖨️ Print Recipe
        </button>
      </div>

      ${recipe.video_url ? `
        <div class="recipe-video">
          <iframe src="${convertToEmbedUrl(recipe.video_url)}" allowfullscreen></iframe>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('recipe-content').innerHTML = recipeContent;
  
  // Load equipment if available
  if (recipe.equipment_ids?.length > 0) {
    loadEquipment(recipe.equipment_ids);
  }
}

// Helper function for YouTube URLs
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Load equipment recommendations
async function loadEquipment(equipmentIds) {
  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', equipmentIds.map(Number));

    if (data?.length > 0) {
      document.getElementById('equipment-section').style.display = 'block';
      document.getElementById('equipment-container').innerHTML = data.map(item => `
        <div class="equipment-item">
          <img src="${item.image_url}" alt="${item.name}">
          <h3>${item.name}</h3>
          ${item.description ? `<p>${item.description}</p>` : ''}
          <a href="${item.affiliate_link}" class="btn" target="_blank">Buy Now</a>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading equipment:', error);
  }
}

// Update dynamic meta tags
function updateMetaTags(recipe) {
  // Update document title
  document.title = `${recipe.title} | Simit's Swaad`;
  
  // Update meta tags
  document.getElementById('meta-description').content = recipe.description || 'Delicious recipe from Simit\'s Swaad';
  document.getElementById('meta-keywords').content = recipe.tags?.join(', ') || 'recipe, cooking';
  
  // Update Open Graph tags
  document.getElementById('og-title').content = recipe.title;
  document.getElementById('og-description').content = recipe.description || '';
  document.getElementById('og-image').content = recipe.image_url || '';
  document.getElementById('og-url').content = window.location.href;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadRecipe();
  
  // Handle SPA navigation for internal links
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="/"]');
    if (link && !link.target) {
      e.preventDefault();
      window.history.pushState({}, '', link.href);
      loadRecipe();
    }
  });
});

// Handle browser back/forward
window.addEventListener('popstate', loadRecipe);
