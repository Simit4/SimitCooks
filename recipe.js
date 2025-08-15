import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Debug mode - set to false in production
const DEBUG = true;
function debugLog(message, data) {
  if (DEBUG) console.log(`[DEBUG] ${message}`, data || '');
}


// Check if DOM elements exist
function verifyDomElements() {
  const requiredElements = [
    'recipe-title', 'recipe-description', 'ingredients-list',
    'method-list', 'equipment-container'
  ];
  
  requiredElements.forEach(id => {
    if (!document.getElementById(id)) {
      debugLog(`Missing DOM element:`, id);
    }
  });
}

// Get recipe ID from URL
function getRecipeIdFromUrl() {
  const path = window.location.pathname;
  const recipeId = path.split('/recipe/')[1];
  debugLog('Extracted recipe ID from URL:', recipeId);
  return recipeId;
}

// Main function
async function loadRecipe() {
  debugLog('Starting recipe load...');
  verifyDomElements();
  
  const recipeId = getRecipeIdFromUrl();
  if (!recipeId) {
    showError('Invalid recipe URL');
    return;
  }

  try {
    debugLog('Fetching recipe from Supabase...');
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', recipeId)  // or .eq('url_id', recipeId)
      .single();

    if (error) throw error;
    if (!recipe) throw new Error('Recipe not found');
    debugLog('Recipe found:', recipe.title);

    renderRecipe(recipe);
    await updateViewCount(recipe.id);
    await loadEquipment(recipe.equipment_ids);

  } catch (error) {
    debugLog('Error loading recipe:', error);
    showError('Failed to load recipe. Please try again.');
  }
}

// Render functions
function renderRecipe(recipe) {
  debugLog('Rendering recipe...');
  
  // Basic Info
  setElementContent('recipe-title', recipe.title);
  setElementContent('recipe-description', recipe.description);
  
  // Times
  setElementContent('prep-time', recipe.prep_time);
  setElementContent('cook-time', recipe.cook_time);
  setElementContent('servings', recipe.servings);

  // Ingredients
  renderList('ingredients-list', recipe.ingredients, 'No ingredients listed');
  
  // Method
  renderList('method-list', recipe.method?.map((step, i) => `Step ${i+1}: ${step}`), 'No instructions available');

  // Nutrition
  if (recipe.nutritional_info) {
    const nutr = recipe.nutritional_info;
    document.getElementById('nutrition').innerHTML = `
      <p><strong>Calories:</strong> ${nutr.calories || 'N/A'}</p>
      <p><strong>Protein:</strong> ${nutr.protein || 'N/A'}</p>
      <p><strong>Carbs:</strong> ${nutr.carbs || 'N/A'}</p>
      <p><strong>Fat:</strong> ${nutr.fat || 'N/A'}</p>
    `;
  }
}

// Helper functions
function setElementContent(id, content, fallback = '') {
  const el = document.getElementById(id);
  if (el) el.textContent = content || fallback;
}

function renderList(id, items, emptyMessage) {
  const container = document.getElementById(id);
  if (!container) return;
  
  container.innerHTML = items?.length 
    ? items.map(item => `<li>${item}</li>`).join('')
    : `<li>${emptyMessage}</li>`;
}

async function updateViewCount(recipeId) {
  try {
    await supabase
      .from('recipe_db')
      .update({ views: supabase.rpc('increment') })
      .eq('id', recipeId);
  } catch (error) {
    debugLog('Failed to update view count:', error);
  }
}

async function loadEquipment(equipmentIds) {
  if (!equipmentIds?.length) return;
  
  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', equipmentIds);

    if (error) throw error;
    
    const container = document.getElementById('equipment-container');
    if (container) {
      container.innerHTML = data?.map(item => `
        <div class="equipment-item">
          <img src="${item.image_url}" alt="${item.name}" loading="lazy">
          <h3>${item.name}</h3>
          <p>${item.description || ''}</p>
          <a href="${item.purchase_link}" target="_blank">Buy Now</a>
        </div>
      `).join('') || '<p>No equipment recommendations</p>';
    }
  } catch (error) {
    debugLog('Equipment load error:', error);
  }
}

function showError(message) {
  const titleEl = document.getElementById('recipe-title');
  if (titleEl) titleEl.textContent = message;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  debugLog('DOM fully loaded');
  loadRecipe();
});
