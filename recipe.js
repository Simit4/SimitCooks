import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get slug from URL
function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  console.log('URL:', window.location.href);
  console.log('Slug from URL:', slug);
  return slug;
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
        <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">Current URL: ${window.location.href}</p>
        <a href="/recipes.html" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #27ae60; color: white; border-radius: 25px; text-decoration: none;">
          Browse All Recipes
        </a>
      </div>
    `;
  }
}

// Fetch and render recipe
async function loadRecipe() {
  console.log('loadRecipe() started');
  
  const slug = getSlugFromUrl();
  console.log('Detected slug:', slug);
  
  if (!slug) {
    showError('No recipe specified. Please use ?slug=recipe-name in the URL.');
    return;
  }

  try {
    console.log('Fetching recipe with slug:', slug);
    
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();

    console.log('Recipe data:', recipe);
    console.log('Error:', error);

    if (error) {
      console.error('Supabase error:', error);
      showError(`Error: ${error.message}`);
      return;
    }
    
    if (!recipe) {
      showError(`Recipe "${slug}" not found in database.`);
      return;
    }

    console.log('Rendering recipe:', recipe.title);
    
    // Set page title
    document.title = `${recipe.title} | Simit Cooks`;
    
    // Fill in the HTML
    const titleEl = document.getElementById('recipe-title');
    if (titleEl) titleEl.innerText = recipe.title;
    
    const descEl = document.getElementById('recipe-description');
    if (descEl) descEl.innerText = recipe.description || '';
    
    const prepEl = document.getElementById('prep-time');
    if (prepEl) prepEl.innerText = recipe.prep_time || 'N/A';
    
    const cookEl = document.getElementById('cook-time');
    if (cookEl) cookEl.innerText = recipe.cook_time || 'N/A';
    
    const servingsEl = document.getElementById('servings');
    if (servingsEl) servingsEl.innerText = recipe.servings || 'N/A';
    
    // Ingredients
    const ingredientsList = document.getElementById('ingredients-list');
    if (ingredientsList) {
      ingredientsList.innerHTML = '';
      if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          ingredientsList.appendChild(li);
        });
      } else {
        ingredientsList.innerHTML = '<li>No ingredients listed.</li>';
      }
    }
    
    // Method
    const methodList = document.getElementById('method-list');
    if (methodList) {
      methodList.innerHTML = '';
      if (recipe.method && Array.isArray(recipe.method)) {
        recipe.method.forEach(step => {
          const li = document.createElement('li');
          li.textContent = step;
          methodList.appendChild(li);
        });
      } else {
        methodList.innerHTML = '<li>No instructions available.</li>';
      }
    }
    
    // Nutrition
    const nutrition = recipe.nutritional_info;
    const nutritionDiv = document.getElementById('nutrition');
    if (nutritionDiv && nutrition && typeof nutrition === 'object') {
      nutritionDiv.innerHTML = `
        ${nutrition.calories ? `<div><strong>Calories:</strong> ${nutrition.calories}</div>` : ''}
        ${nutrition.protein ? `<div><strong>Protein:</strong> ${nutrition.protein}</div>` : ''}
        ${nutrition.carbohydrates ? `<div><strong>Carbs:</strong> ${nutrition.carbohydrates}</div>` : ''}
        ${nutrition.fat ? `<div><strong>Fat:</strong> ${nutrition.fat}</div>` : ''}
      `;
    }
    
    // Tags, Cuisine, Category
    const tagsSpan = document.getElementById('tags');
    if (tagsSpan) tagsSpan.textContent = recipe.tags?.join(', ') || 'Not available';
    
    const cuisineSpan = document.getElementById('cuisine');
    if (cuisineSpan) cuisineSpan.textContent = recipe.cuisine?.join(', ') || 'Not available';
    
    const categorySpan = document.getElementById('category');
    if (categorySpan) categorySpan.textContent = recipe.category?.join(', ') || 'Not available';
    
    const notesEl = document.getElementById('notes');
    if (notesEl) notesEl.textContent = recipe.notes || 'No notes available.';
    
    const factsEl = document.getElementById('facts');
    if (factsEl) factsEl.textContent = recipe.facts || 'No fun facts found.';
    
    // Video
    const embedUrl = convertToEmbedUrl(recipe.video_url);
    const videoContainer = document.querySelector('.recipe-video');
    if (embedUrl && videoContainer) {
      videoContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen style="width:100%; height:100%; border:none;"></iframe>`;
      videoContainer.style.display = 'block';
    } else if (videoContainer) {
      videoContainer.style.display = 'none';
    }
    
    // Equipment
    if (recipe.equipment_ids && recipe.equipment_ids.length) {
      try {
        const { data: equipment } = await supabase
          .from('equipment_db')
          .select('*')
          .in('id', recipe.equipment_ids);
        
        const equipmentContainer = document.getElementById('equipment-container');
        if (equipmentContainer && equipment && equipment.length) {
          equipmentContainer.innerHTML = '';
          equipment.forEach(item => {
            equipmentContainer.innerHTML += `
              <div class="equipment-item">
                ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}">` : ''}
                <h4>${item.name}</h4>
                <p>${item.description || ''}</p>
              </div>
            `;
          });
        }
      } catch (err) {
        console.error('Error loading equipment:', err);
      }
    }
    
    // Update view count (don't await, just fire and forget)
    supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id)
      .then(() => console.log('View count updated'))
      .catch(err => console.error('Error updating views:', err));
      
  } catch (error) {
    console.error('Error in loadRecipe:', error);
    showError(`Failed to load recipe: ${error.message}`);
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadRecipe);
} else {
  loadRecipe();
}
