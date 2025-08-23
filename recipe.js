import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Fetch recipe data and render
async function fetchAndRenderRecipe() {
  let slug;

  // Handle /recipe/<slug> clean URL
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'recipe' && pathParts[1]) {
    slug = pathParts[1];
  } else {
    const params = new URLSearchParams(window.location.search);
    slug = params.get('slug');
  }

  if (!slug) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    return;
  }

  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    return;
  }

  // Update views
  if (recipe.id) {
    await supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);
  }

  renderRecipe(recipe);
}

// Render recipe details
function renderRecipe(recipe) {
  document.getElementById('recipe-title').innerText = recipe.title;
  document.getElementById('recipe-description').innerText = recipe.description;
  document.getElementById('prep-time').innerText = recipe.prep_time;
  document.getElementById('cook-time').innerText = recipe.cook_time;
  document.getElementById('servings').innerText = recipe.servings;

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  recipe.ingredients?.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  recipe.method?.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    methodList.appendChild(li);
  });

  // Nutrition
  const nutrition = recipe.nutritional_info;
  if (nutrition) {
    document.getElementById('nutrition').innerHTML = `
      <strong>Calories:</strong> ${nutrition.calories}<br>
      <strong>Protein:</strong> ${nutrition.protein}<br>
      <strong>Carbohydrates:</strong> ${nutrition.carbohydrates}<br>
      <strong>Fiber:</strong> ${nutrition.fiber}<br>
      <strong>Fat:</strong> ${nutrition.fat}
    `;
  }

  // Tags, Cuisine, Category
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';

  // Notes & Fun Facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes available.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';

  // Video
  const embedUrl = convertToEmbedUrl(recipe.video_url);
  const videoContainer = document.querySelector('.recipe-video');
  if (embedUrl) {
    videoContainer.innerHTML = `<iframe id="recipe-video" src="${embedUrl}" allowfullscreen></iframe>`;
    videoContainer.style.display = 'block';
  } else {
    videoContainer.style.display = 'none';
  }

  // Equipment
  if (recipe.equipment_ids?.length) {
    fetchEquipmentByIds(recipe.equipment_ids.map(Number));
  }
}

// Fetch equipment details by IDs and render with modern card structure
async function fetchEquipmentByIds(ids) {
  const { data, error } = await supabase
    .from('equipment_db')
    .select('*')
    .in('id', ids);

  const container = document.getElementById('equipment-container');
  container.innerHTML = '';

  if (error || !data?.length) {
    container.innerHTML = '<p>No equipment found.</p>';
    return;
  }

  data.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'equipment-item';
    card.style.animationDelay = `${index * 0.1}s`; // staggered fade-in

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${item.image_url}" alt="${item.name}">
        <div class="overlay">
          <h4>${item.name}</h4>
          <p>${item.description || ''}</p>
          <a href="${item.affiliate_link || '#'}" target="_blank" class="btn-buy">Buy Now</a>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}




// Initialize
fetchAndRenderRecipe();
