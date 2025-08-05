import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Render recipe details to DOM
function renderRecipe(recipe) {
  document.getElementById('recipe-title').textContent = recipe.title || 'Untitled Recipe';
  document.getElementById('recipe-description').textContent = recipe.description || '';

  document.getElementById('prep-time').textContent = recipe.prep_time || '-';
  document.getElementById('cook-time').textContent = recipe.cook_time || '-';
  document.getElementById('servings').textContent = recipe.servings || '-';

  // Ingredients list
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  if (Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach(ingredient => {
      const li = document.createElement('li');
      li.textContent = ingredient;
      ingredientsList.appendChild(li);
    });
  }

  // Method list
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  if (Array.isArray(recipe.method)) {
    recipe.method.forEach(step => {
      // Strip numbers if any
      const cleanedStep = step.replace(/^\d+\.\s*/, '');
      const li = document.createElement('li');
      li.textContent = cleanedStep;
      methodList.appendChild(li);
    });
  }

  // Tags / Cuisine / Category
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';

  // Nutrition info
  const nutrition = recipe.nutritional_info || {};
  const nutritionEl = document.getElementById('nutrition');
  nutritionEl.innerHTML = `
    <strong>Calories:</strong> ${nutrition.calories || '-'}<br>
    <strong>Protein:</strong> ${nutrition.protein || '-'}<br>
    <strong>Carbohydrates:</strong> ${nutrition.carbohydrates || '-'}<br>
    <strong>Fiber:</strong> ${nutrition.fiber || '-'}<br>
    <strong>Fat:</strong> ${nutrition.fat || '-'}
  `;

  // Notes and fun facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes available.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';

  // Video embed
  const videoUrl = convertToEmbedUrl(recipe.video_url);
  const videoFrame = document.getElementById('recipe-video');
  if (videoUrl) {
    videoFrame.src = videoUrl;
    videoFrame.style.display = 'block';
  } else {
    videoFrame.style.display = 'none';
  }
}

// Render related equipment on recipe page
function renderRelatedEquipment(equipmentList) {
  const container = document.getElementById('related-equipment-container');
  if (!container) return;
  container.innerHTML = '';

  if (!Array.isArray(equipmentList) || equipmentList.length === 0) {
    container.innerHTML = '<p>No related equipment found for this recipe.</p>';
    return;
  }

  equipmentList.forEach(item => {
    const equipmentHTML = `
      <div class="equipment-item">
        <img class="equipment-image" src="${item.image_url}" alt="${item.name}" loading="lazy" />
        <h3 class="equipment-title">${item.name}</h3>
        <p class="equipment-description">${item.description || ''}</p>
        <a class="btn-buy" href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" aria-label="Buy ${item.name} now">
          Buy Now
        </a>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', equipmentHTML);
  });
}

async function fetchAndRenderRecipe() {
  try {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    if (!slug) {
      throw new Error('Recipe slug missing in URL');
    }

    // Fetch recipe by slug
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !recipe) {
      throw new Error('Recipe not found');
    }

    // Increment views counter (optional)
    await supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);

    // Render recipe info
    renderRecipe(recipe);

    // Fetch and render related equipment if present
    if (Array.isArray(recipe.equipment_ids) && recipe.equipment_ids.length > 0) {
      const { data: equipmentData, error: equipError } = await supabase
        .from('equipment_db')
        .select('*')
        .in('id', recipe.equipment_ids);

      if (equipError) {
        console.warn('Failed to load related equipment:', equipError.message);
      } else {
        renderRelatedEquipment(equipmentData);
      }
    } else {
      // Clear equipment container if no related equipment
      const container = document.getElementById('related-equipment-container');
      if (container) container.innerHTML = '<p>No related equipment specified for this recipe.</p>';
    }

  } catch (err) {
    console.error(err);
    document.getElementById('recipe-title').textContent = 'Recipe not found';
  }
}

fetchAndRenderRecipe();
