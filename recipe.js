import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Get slug from URL
function getSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  console.log('Current URL:', window.location.href);
  console.log('Slug from URL:', slug);
  return slug;
}

// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return '';
}

// Show error message
function showError(message) {
  const container = document.querySelector('.recipe-page');
  if (container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: #dc2626;"></i>
        <h2 style="margin-top: 1rem;">Recipe Not Found</h2>
        <p>${message}</p>
        <p style="font-size: 0.9rem; color: #666; margin-top: 1rem;">
          Try: /recipe/index.html?slug=simple-egg-roll
        </p>
        <a href="/recipes.html" style="display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem; background: #27ae60; color: white; border-radius: 25px; text-decoration: none;">
          <i class="fas fa-arrow-left"></i> Browse All Recipes
        </a>
      </div>
    `;
  }
}

// Fetch equipment details
async function fetchEquipment(equipmentIds) {
  if (!equipmentIds || equipmentIds.length === 0) return [];
  
  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('*')
      .in('id', equipmentIds);
    
    if (error) {
      console.error('Error fetching equipment:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
}

// Main function to load and render recipe
async function loadRecipe() {
  console.log('Loading recipe...');
  
  const slug = getSlugFromUrl();
  
  if (!slug) {
    showError('No recipe specified. Please add ?slug=recipe-name to the URL');
    return;
  }
  
  try {
    // Fetch recipe from Supabase
    const { data: recipe, error } = await supabase
      .from('recipe_db')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) {
      console.error('Supabase error:', error);
      showError(`Error loading recipe: ${error.message}`);
      return;
    }
    
    if (!recipe) {
      showError(`Recipe "${slug}" not found in database.`);
      return;
    }
    
    console.log('Recipe loaded:', recipe.title);
    
    // Update page title
    document.title = `${recipe.title} | Simit Cooks`;
    
    // Fill basic info
    const titleEl = document.getElementById('recipe-title');
    if (titleEl) titleEl.textContent = recipe.title;
    
    const descEl = document.getElementById('recipe-description');
    if (descEl) descEl.textContent = recipe.description || '';
    
    const prepEl = document.getElementById('prep-time');
    if (prepEl) prepEl.textContent = recipe.prep_time || 'N/A';
    
    const cookEl = document.getElementById('cook-time');
    if (cookEl) cookEl.textContent = recipe.cook_time || 'N/A';
    
    const servingsEl = document.getElementById('servings');
    if (servingsEl) servingsEl.textContent = recipe.servings || 'N/A';
    
    // Ingredients
    const ingredientsList = document.getElementById('ingredients-list');
    if (ingredientsList && recipe.ingredients) {
      ingredientsList.innerHTML = '';
      const ingredients = typeof recipe.ingredients === 'string' 
        ? JSON.parse(recipe.ingredients) 
        : recipe.ingredients;
      
      ingredients.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ingredientsList.appendChild(li);
      });
    }
    
    // Method/Instructions
    const methodList = document.getElementById('method-list');
    if (methodList && recipe.method) {
      methodList.innerHTML = '';
      const methods = typeof recipe.method === 'string' 
        ? JSON.parse(recipe.method) 
        : recipe.method;
      
      methods.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        methodList.appendChild(li);
      });
    }
    
    // Nutrition info
    const nutritionDiv = document.getElementById('nutrition');
    if (nutritionDiv && recipe.nutritional_info) {
      const nutrition = typeof recipe.nutritional_info === 'string'
        ? JSON.parse(recipe.nutritional_info)
        : recipe.nutritional_info;
      
      nutritionDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem;">
          ${nutrition.calories ? `<div><strong>🔥 Calories:</strong> ${nutrition.calories}</div>` : ''}
          ${nutrition.protein ? `<div><strong>💪 Protein:</strong> ${nutrition.protein}</div>` : ''}
          ${nutrition.carbohydrates ? `<div><strong>🍚 Carbs:</strong> ${nutrition.carbohydrates}</div>` : ''}
          ${nutrition.fat ? `<div><strong>🥑 Fat:</strong> ${nutrition.fat}</div>` : ''}
          ${nutrition.fiber ? `<div><strong>🌾 Fiber:</strong> ${nutrition.fiber}</div>` : ''}
        </div>
      `;
    }
    
    // Tags
    const tagsSpan = document.getElementById('tags');
    if (tagsSpan && recipe.tags) {
      const tags = typeof recipe.tags === 'string' ? JSON.parse(recipe.tags) : recipe.tags;
      tagsSpan.textContent = tags.join(', ');
    }
    
    // Cuisine
    const cuisineSpan = document.getElementById('cuisine');
    if (cuisineSpan && recipe.cuisine) {
      const cuisine = typeof recipe.cuisine === 'string' ? JSON.parse(recipe.cuisine) : recipe.cuisine;
      cuisineSpan.textContent = cuisine.join(', ');
    }
    
    // Category
    const categorySpan = document.getElementById('category');
    if (categorySpan && recipe.category) {
      const category = typeof recipe.category === 'string' ? JSON.parse(recipe.category) : recipe.category;
      categorySpan.textContent = category.join(', ');
    }
    
    // Notes
    const notesEl = document.getElementById('notes');
    if (notesEl) notesEl.textContent = recipe.notes || 'No additional notes available.';
    
    // Fun Facts
    const factsEl = document.getElementById('facts');
    if (factsEl) factsEl.textContent = recipe.facts || 'No fun facts found.';
    
    // Video
    const embedUrl = convertToEmbedUrl(recipe.video_url);
    const videoContainer = document.querySelector('.recipe-video');
    if (videoContainer) {
      if (embedUrl) {
        videoContainer.innerHTML = `
          <iframe 
            src="${embedUrl}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="width: 100%; height: 100%; border-radius: 8px;">
          </iframe>
        `;
        videoContainer.style.display = 'block';
      } else {
        videoContainer.style.display = 'none';
      }
    }
    
    // Equipment
    if (recipe.equipment_ids && recipe.equipment_ids.length > 0) {
      const equipmentList = await fetchEquipment(recipe.equipment_ids);
      const equipmentContainer = document.getElementById('equipment-container');
      
      if (equipmentContainer && equipmentList.length > 0) {
        equipmentContainer.innerHTML = '';
        equipmentList.forEach(item => {
          const equipmentDiv = document.createElement('div');
          equipmentDiv.className = 'equipment-item';
          equipmentDiv.innerHTML = `
            <div class="image-wrapper">
              ${item.image_url ? `<img src="${item.image_url}" alt="${item.name}" style="width: 100%; height: 200px; object-fit: cover;">` : ''}
            </div>
            <div class="card-body">
              <h4 class="equipment-title">${item.name}</h4>
              ${item.description ? `<p>${item.description}</p>` : ''}
              ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" class="btn-buy">Buy Now →</a>` : ''}
            </div>
          `;
          equipmentContainer.appendChild(equipmentDiv);
        });
      }
    }
    
    // Update view count (fire and forget)
    supabase
      .from('recipe_db')
      .update({ views: (recipe.views || 0) + 1 })
      .eq('id', recipe.id)
      .then(() => console.log('View count updated'))
      .catch(err => console.error('Error updating views:', err));
    
    console.log('Recipe rendered successfully');
    
  } catch (error) {
    console.error('Error loading recipe:', error);
    showError(`Failed to load recipe: ${error.message}`);
  }
}

// Start loading when page is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadRecipe);
} else {
  loadRecipe();
}
