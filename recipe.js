import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Convert YouTube URL to embed format
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function getSlug() {
  return window.location.pathname.split('/').pop(); // Gets "easy-veg-chowmein" from "/recipe/easy-veg-chowmein"
}

async function fetchAndRenderRecipe() {
  const slug = getSlug();
  
  if (!slug) {
    document.getElementById('recipe-title').textContent = 'Recipe not found';
    return;
  }

  // Rest remains EXACTLY THE SAME as your original code
  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    document.getElementById('recipe-title').textContent = 'Recipe not found';
    return;
  }

  // ... keep all your existing renderRecipe() and equipment code ...
}

// Initialize as before
fetchAndRenderRecipe();

    loadRecommendedEquipment(recipe.equipment_ids);
    
  } catch (error) {
    console.error('Error loading recipe:', error);
    document.getElementById('recipe-title').textContent = 'Recipe not found';
  }
}

// Render recipe data to the page
function renderRecipe(recipe) {
  // Basic info
  document.getElementById('recipe-title').textContent = recipe.title;
  document.getElementById('recipe-description').textContent = recipe.description;
  document.getElementById('prep-time').textContent = recipe.prep_time;
  document.getElementById('cook-time').textContent = recipe.cook_time;
  document.getElementById('servings').textContent = recipe.servings;

  // Ingredients list
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = recipe.ingredients?.map(item => 
    `<li>${item}</li>`
  ).join('') || '<li>No ingredients listed</li>';

  // Method steps
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = recipe.method?.map(step => 
    `<li>${step}</li>`
  ).join('') || '<li>No method provided</li>';

  // Nutrition info
  const nutrition = recipe.nutritional_info || {};
  document.getElementById('nutrition').innerHTML = `
    <strong>Calories:</strong> ${nutrition.calories || 'N/A'}<br>
    <strong>Protein:</strong> ${nutrition.protein || 'N/A'}<br>
    <strong>Carbs:</strong> ${nutrition.carbohydrates || 'N/A'}<br>
    <strong>Fiber:</strong> ${nutrition.fiber || 'N/A'}<br>
    <strong>Fat:</strong> ${nutrition.fat || 'N/A'}
  `;

  // Metadata
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'None';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not specified';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Uncategorized';

  // Notes and fun facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts available.';

  // Video embedding
  const embedUrl = convertToEmbedUrl(recipe.video_url);
  document.getElementById('recipe-video').src = embedUrl;
}

// Load recommended equipment
async function loadRecommendedEquipment(equipmentIds = []) {
  if (!equipmentIds?.length) {
    document.getElementById('equipment-container').innerHTML = 
      '<p>No equipment recommendations for this recipe.</p>';
    return;
  }

  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', equipmentIds.map(Number));

    if (error || !data?.length) throw error;

    document.getElementById('equipment-container').innerHTML = data.map(item => `
      <div class="equipment-item">
        <img src="${item.image_url}" alt="${item.name}" class="equipment-image">
        <h3>${item.name}</h3>
        <p>${item.description || ''}</p>
        <a href="${item.affiliate_link}" target="_blank" rel="noopener" class="btn-buy">
          Buy Now
        </a>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading equipment:', error);
    document.getElementById('equipment-container').innerHTML = 
      '<p>Could not load equipment recommendations.</p>';
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', fetchAndRenderRecipe);
