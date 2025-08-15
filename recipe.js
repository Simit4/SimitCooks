import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchAndRenderRecipe() {
  let slug;
  const params = new URLSearchParams(window.location.search);
  slug = params.get('slug');
  if (!slug) {
    const path = window.location.pathname;
    slug = path.split('/').pop();
  }
  console.log('Extracted slug:', slug);
  console.log('URL:', window.location.href);
  if (!slug) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    document.getElementById('recipe-description').innerText = 'No recipe slug provided.';
    return;
  }

  try {
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();
    console.log('Supabase recipe response:', { data: recipe, error });
    if (error) throw error;
    if (!recipe) {
      document.getElementById('recipe-title').innerText = 'Recipe not found';
      document.getElementById('recipe-description').innerText = 'This recipe does not exist.';
      return;
    }

    if (recipe.id) {
      const { error: updateError } = await supabase
        .from('recipe_db')
        .update({ views: (recipe.views || 0) + 1 })
        .eq('id', recipe.id);
      if (updateError) console.error('Error updating views:', updateError);
    }

    renderRecipe(recipe);
  } catch (e) {
    console.error('Error fetching recipe:', e);
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    document.getElementById('recipe-description').innerText = 'Error loading recipe: ' + e.message;
  }
}

async function fetchEquipment(equipmentIds) {
  if (!equipmentIds || equipmentIds.length === 0) return [];
  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', equipmentIds.map(Number));
    console.log('Supabase equipment response:', { data, error });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Error fetching equipment:', e);
    return [];
  }
}

function renderRecipe(recipe) {
  console.log('Rendering recipe:', recipe);

  // Update meta tags for SEO
  document.querySelector('meta[name="description"]').setAttribute('content', recipe.description || 'Delicious recipe from Simit’s Swaad');
  document.querySelector('meta[name="keywords"]').setAttribute('content', recipe.tags?.join(', ') || 'Nepali recipe, home cooking');
  document.querySelector('meta[property="og:title"]').setAttribute('content', recipe.title || 'Recipe | Simit’s Swaad');
  document.querySelector('meta[property="og:description"]').setAttribute('content', recipe.description || 'Delicious recipe from Simit’s Swaad');
  document.querySelector('meta[property="og:image"]').setAttribute('content', recipe.thumbnail_url || 'https://simitswaad.netlify.app/recipe-thumbnail.jpg');
  document.querySelector('meta[property="og:url"]').setAttribute('content', `https://simitswaad.netlify.app/recipes/${recipe.slug}`);

  // Render recipe details
  document.getElementById('recipe-title').innerText = recipe.title || 'Recipe';
  document.getElementById('recipe-description').innerText = recipe.description || 'No description available.';
  document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
  document.getElementById('servings').innerText = recipe.servings || 'N/A';

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  if (ingredientsList && recipe.ingredients?.length) {
    ingredientsList.innerHTML = recipe.ingredients.map(item => `<li>${item}</li>`).join('');
  } else {
    ingredientsList.innerHTML = '<li>No ingredients listed.</li>';
  }

  // Method
  const methodList = document.getElementById('method-list');
  if (methodList && recipe.method?.length) {
    methodList.innerHTML = recipe.method.map(step => `<li>${step}</li>`).join('');
  } else {
    methodList.innerHTML = '<li>No method provided.</li>';
  }

  // Nutrition
  const nutritionDiv = document.getElementById('nutrition');
  if (nutritionDiv && recipe.nutritional_info) {
    nutritionDiv.innerHTML = `
      <p>Calories: ${recipe.nutritional_info.calories || 'N/A'}</p>
      <p>Protein: ${recipe.nutritional_info.protein || 'N/A'}</p>
      <p>Carbohydrates: ${recipe.nutritional_info.carbohydrates || 'N/A'}</p>
      <p>Fiber: ${recipe.nutritional_info.fiber || 'N/A'}</p>
      <p>Fat: ${recipe.nutritional_info.fat || 'N/A'}</p>
    `;
  } else {
    nutritionDiv.innerHTML = '<p>No nutritional information available.</p>';
  }

  // Tags, Cuisine, Category
  document.getElementById('tags').innerText = recipe.tags?.join(', ') || 'None';
  document.getElementById('cuisine').innerText = recipe.cuisine?.join(', ') || 'None';
  document.getElementById('category').innerText = recipe.category?.join(', ') || 'None';

  // Notes and Facts
  document.getElementById('notes').innerText = recipe.notes || 'No additional notes.';
  document.getElementById('facts').innerText = recipe.facts || 'No fun facts available.';

  // Video
  const videoContainer = document.getElementById('recipe-video');
  if (videoContainer && recipe.video_url) {
    const videoId = recipe.video_url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      videoContainer.innerHTML = `<iframe width="100%" height="300" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      videoContainer.innerHTML = '<p>No video available.</p>';
    }
  } else {
    videoContainer.innerHTML = '<p>No video available.</p>';
  }

  // Equipment
  fetchEquipment(recipe.equipment_ids || []).then(equipment => {
    const equipmentSection = document.getElementById('equipment-section');
    if (equipmentSection && equipment.length) {
      equipmentSection.innerHTML = equipment.map(item => `
        <div class="equipment-item">
          <h3>${item.name || 'Equipment'}</h3>
          ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="max-width: 100px;">` : ''}
          <p>${item.description || 'No description.'}</p>
          ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank">Buy Now</a>` : ''}
        </div>
      `).join('');
    } else {
      equipmentSection.innerHTML = '<p>No equipment listed.</p>';
    }
  });
}

// Initialize
fetchAndRenderRecipe();
