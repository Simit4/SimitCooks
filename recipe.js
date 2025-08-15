import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Client Configuration
const supabase = createClient(
  'https://ozdwocrbrojtyogolqxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'
);

// Get recipe identifier from clean URL (/recipe/recipe-name)
function getRecipeIdFromUrl() {
  const path = window.location.pathname;
  // Extract "recipe-name" from "/recipe/recipe-name"
  return path.split('/recipe/')[1] || null;
}

// Main function to load and display recipe
async function loadRecipe() {
  const recipeId = getRecipeIdFromUrl();
  
  if (!recipeId) {
    showError('Recipe URL is invalid');
    return;
  }

  try {
    // Fetch recipe from Supabase
    const { data: recipe, error } = await supabase
      .from('recipes')  // Changed from 'recipe_db' to match your table
      .select('*')
      .eq('url_id', recipeId)  // Using url_id instead of slug
      .single();

    if (error) throw error;
    if (!recipe) throw new Error('Recipe not found');

    // Render the recipe
    renderRecipe(recipe);

    // Load recommended equipment
    if (recipe.equipment_ids?.length) {
      await loadEquipment(recipe.equipment_ids);
    }

    // Update view count
    await supabase
      .from('recipes')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);

  } catch (error) {
    console.error('Failed to load recipe:', error);
    showError('Failed to load recipe');
  }
}

// Render recipe to the page
function renderRecipe(recipe) {
  // Basic Info
  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-description').textContent = recipe.description || '';
  
  // Times
  document.getElementById('prep-time').textContent = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').textContent = recipe.cook_time || 'N/A';
  document.getElementById('servings').textContent = recipe.servings || 'N/A';

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = recipe.ingredients?.map(item => 
    `<li>${item}</li>`
  ).join('') || '<li>No ingredients listed</li>';

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = recipe.method?.map((step, i) => 
    `<li><strong>Step ${i+1}:</strong> ${step}</li>`
  ).join('') || '<li>No instructions available</li>';

  // Nutrition
  const nutrition = recipe.nutritional_info || {};
  document.getElementById('nutrition').innerHTML = `
    <p><strong>Calories:</strong> ${nutrition.calories || 'N/A'}</p>
    <p><strong>Protein:</strong> ${nutrition.protein || 'N/A'}</p>
    <p><strong>Carbs:</strong> ${nutrition.carbs || 'N/A'}</p>
    <p><strong>Fat:</strong> ${nutrition.fat || 'N/A'}</p>
  `;

  // Video
  const videoEmbed = document.getElementById('recipe-video');
  if (recipe.video_url) {
    const videoId = recipe.video_url.match(/(?:v=|\/)([a-zA-Z0-9_-]+)/)?.[1];
    videoEmbed.src = `https://www.youtube.com/embed/${videoId}`;
    videoEmbed.style.display = 'block';
  } else {
    videoEmbed.style.display = 'none';
  }
}

// Load recommended equipment
async function loadEquipment(equipmentIds) {
  try {
    const { data: equipment, error } = await supabase
      .from('equipment')
      .select('*')
      .in('id', equipmentIds);

    if (error) throw error;

    const container = document.getElementById('equipment-container');
    container.innerHTML = equipment?.map(item => `
      <div class="equipment-card">
        <img src="${item.image_url}" alt="${item.name}" loading="lazy">
        <h3>${item.name}</h3>
        <p>${item.description || ''}</p>
        <a href="${item.purchase_link}" target="_blank" class="btn-buy">
          Buy Now
        </a>
      </div>
    `).join('') || '<p>No equipment recommendations</p>';

  } catch (error) {
    console.error('Failed to load equipment:', error);
    document.getElementById('equipment-container').innerHTML = 
      '<p>Could not load equipment recommendations</p>';
  }
}

// Show error message
function showError(message) {
  document.getElementById('recipe-title').textContent = message;
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadRecipe);
