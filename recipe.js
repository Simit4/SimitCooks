import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get slug from URL
function getSlugFromUrl() {
  // Get slug from URL query parameter
  const params = new URLSearchParams(window.location.search);
  return params.get('slug');
}

// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Show error
function showError(message) {
  const container = document.querySelector('.recipe-page');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #dc2626;"></i>
        <h2>Recipe Not Found</h2>
        <p>${message}</p>
        <a href="/recipes.html" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #27ae60; color: white; border-radius: 25px; text-decoration: none;">
          Browse All Recipes
        </a>
      </div>
    `;
  }
}

// Fetch and render recipe
async function loadRecipe() {
  const slug = getSlugFromUrl();
  
  if (!slug) {
    showError('No recipe specified.');
    return;
  }

  try {
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !recipe) {
      showError(`Recipe "${slug}" not found.`);
      return;
    }

    // Set page title
    document.title = `${recipe.title} | Simit Cooks`;
    
    // Fill in the HTML
    document.getElementById('recipe-title').innerText = recipe.title;
    document.getElementById('recipe-description').innerText = recipe.description || '';
    document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
    document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
    document.getElementById('servings').innerText = recipe.servings || 'N/A';
    
    // Ingredients
    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = '';
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      recipe.ingredients.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ingredientsList.appendChild(li);
      });
    }
    
    // Method
    const methodList = document.getElementById('method-list');
    methodList.innerHTML = '';
    if (recipe.method && Array.isArray(recipe.method)) {
      recipe.method.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        methodList.appendChild(li);
      });
    }
    
    // Nutrition
    const nutrition = recipe.nutritional_info;
    const nutritionDiv = document.getElementById('nutrition');
    if (nutrition && typeof nutrition === 'object') {
      nutritionDiv.innerHTML = `
        ${nutrition.calories ? `<div><strong>Calories:</strong> ${nutrition.calories}</div>` : ''}
        ${nutrition.protein ? `<div><strong>Protein:</strong> ${nutrition.protein}</div>` : ''}
        ${nutrition.carbohydrates ? `<div><strong>Carbs:</strong> ${nutrition.carbohydrates}</div>` : ''}
        ${nutrition.fat ? `<div><strong>Fat:</strong> ${nutrition.fat}</div>` : ''}
      `;
    }
    
    // Tags, Cuisine, Category
    document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
    document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
    document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';
    document.getElementById('notes').textContent = recipe.notes || 'No notes available.';
    document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';
    
    // Video
    const embedUrl = convertToEmbedUrl(recipe.video_url);
    const videoContainer = document.querySelector('.recipe-video');
    if (embedUrl && videoContainer) {
      videoContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
    }
    
    // Equipment
    if (recipe.equipment_ids && recipe.equipment_ids.length) {
      const { data: equipment } = await supabase
        .from('equipment_db')
        .select('*')
        .in('id', recipe.equipment_ids);
      
      const equipmentContainer = document.getElementById('equipment-container');
      if (equipment && equipment.length) {
        equipmentContainer.innerHTML = '';
        equipment.forEach(item => {
          equipmentContainer.innerHTML += `
            <div class="equipment-item">
              <img src="${item.image_url || ''}" alt="${item.name}">
              <h4>${item.name}</h4>
              <p>${item.description || ''}</p>
            </div>
          `;
        });
      }
    }
    
    // Update view count
    supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id);
      
  } catch (error) {
    console.error('Error:', error);
    showError('Failed to load recipe.');
  }
}

// Start
loadRecipe();
