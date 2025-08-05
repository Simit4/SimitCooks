import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

async function fetchAndRenderRecipe() {
  try {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
      showError('Recipe not found: missing slug');
      return;
    }

    // Fetch recipe by slug
    const { data: recipe, error: recipeError } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    if (recipeError || !recipe) {
      showError('Recipe not found');
      return;
    }

    // Increment views (async, no await)
    if (recipe.id) {
      supabase
        .from('recipe_db')
        .update({ views: (recipe.views || 0) + 1 })
        .eq('id', recipe.id)
        .catch(console.error);
    }

    renderRecipe(recipe);

    // Fetch and render related equipment
    if (Array.isArray(recipe.equipment_ids) && recipe.equipment_ids.length > 0) {
      const { data: equipmentData, error: eqError } = await supabase
        .from('equipment_db')
        .select('*')
        .in('id', recipe.equipment_ids);

      if (eqError) {
        console.error('Error loading equipment:', eqError);
        showEquipmentError('Error loading related equipment.');
      } else {
        renderEquipment(equipmentData);
      }
    } else {
      document.getElementById('equipment-container').innerHTML = '<p>No equipment needed for this recipe.</p>';
    }
  } catch (err) {
    console.error(err);
    showError('An unexpected error occurred.');
  }
}

function showError(message) {
  const container = document.querySelector('.recipe-page');
  container.innerHTML = `<p class="error">${message}</p>`;
  document.getElementById('equipment-container').innerHTML = '';
}

function showEquipmentError(message) {
  document.getElementById('equipment-container').innerHTML = `<p class="error">${message}</p>`;
}

function renderRecipe(recipe) {
  document.getElementById('recipe-title').textContent = recipe.title || 'Untitled';
  document.getElementById('recipe-description').textContent = recipe.description || '';

  document.getElementById('prep-time').textContent = recipe.prep_time || '';
  document.getElementById('cook-time').textContent = recipe.cook_time || '';
  document.getElementById('servings').textContent = recipe.servings || '';

  // Ingredients list
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  safeParseArray(recipe.ingredients).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  // Method steps
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  safeParseArray(recipe.method).forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    methodList.appendChild(li);
  });

  // Nutrition info
  const nutrition = recipe.nutritional_info || {};
  document.getElementById('nutrition').innerHTML = `
    <strong>Calories:</strong> ${nutrition.calories || 'N/A'}<br>
    <strong>Protein:</strong> ${nutrition.protein || 'N/A'}<br>
    <strong>Carbohydrates:</strong> ${nutrition.carbohydrates || 'N/A'}<br>
    <strong>Fiber:</strong> ${nutrition.fiber || 'N/A'}<br>
    <strong>Fat:</strong> ${nutrition.fat || 'N/A'}
  `;

  // Tags, cuisine, category
  document.getElementById('tags').textContent = safeParseArray(recipe.tags).join(', ') || 'N/A';
  document.getElementById('cuisine').textContent = safeParseArray(recipe.cuisine).join(', ') || 'N/A';
  document.getElementById('category').textContent = safeParseArray(recipe.category).join(', ') || 'N/A';

  // Notes and fun facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts available.';

  // Video embed
  const iframe = document.getElementById('recipe-video');
  iframe.src = convertToEmbedUrl(recipe.video_url) || '';
  iframe.title = `${recipe.title || 'Recipe'} video`;
}

function renderEquipment(equipmentData) {
  const container = document.getElementById('equipment-container');
  container.innerHTML = '';

  equipmentData.forEach(item => {
    const div = document.createElement('div');
    div.className = 'equipment-item';
    div.innerHTML = `
      <img class="equipment-image" src="${item.image_url}" alt="${item.name}" />
      <h3 class="equipment-title">${item.name}</h3>
      <p class="equipment-description">${item.description || ''}</p>
      <a class="btn-buy" href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" aria-label="Buy ${item.name}">
        Buy Now
      </a>
    `;
    container.appendChild(div);
  });
}

function safeParseArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

// Initialize on page load
fetchAndRenderRecipe();
