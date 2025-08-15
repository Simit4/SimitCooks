import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Client Configuration
const supabase = createClient(
  'https://ozdwocrbrojtyogolqxn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'
);

// DOM Elements Cache
const elements = {
  title: document.getElementById('recipe-title'),
  description: document.getElementById('recipe-description'),
  prepTime: document.getElementById('prep-time'),
  cookTime: document.getElementById('cook-time'),
  servings: document.getElementById('servings'),
  ingredients: document.getElementById('ingredients-list'),
  method: document.getElementById('method-list'),
  nutrition: document.getElementById('nutrition'),
  tags: document.getElementById('tags'),
  cuisine: document.getElementById('cuisine'),
  category: document.getElementById('category'),
  notes: document.getElementById('notes'),
  facts: document.getElementById('facts'),
  video: document.getElementById('recipe-video'),
  equipment: document.getElementById('equipment-container')
};

// Utility Functions
const utils = {
  getSlug: () => {
    const path = window.location.pathname;
    // Handle both /recipe/slug and /slug formats
    return path.startsWith('/recipe/') 
      ? path.split('/recipe/')[1] 
      : path.split('/').filter(Boolean).pop();
  },
  
  youtubeEmbed: (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 
      ? `https://www.youtube.com/embed/${match[2]}` 
      : '';
  },

  safeRender: (element, content, fallback = '') => {
    if (!element) return;
    element.textContent = content || fallback;
  }
};

// Recipe Functions
const recipeHandler = {
  fetchRecipe: async (slug) => {
    try {
      const { data, error } = await supabase
        .from('recipe_db')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  },

  incrementViews: async (recipeId) => {
    try {
      await supabase
        .from('recipe_db')
        .update({ views: supabase.rpc('increment') })
        .eq('id', recipeId);
    } catch (error) {
      console.error('View increment failed:', error);
    }
  },

  render: (recipe) => {
    if (!recipe) return;

    // Basic Information
    utils.safeRender(elements.title, recipe.title, 'Recipe not found');
    utils.safeRender(elements.description, recipe.description);
    utils.safeRender(elements.prepTime, recipe.prep_time);
    utils.safeRender(elements.cookTime, recipe.cook_time);
    utils.safeRender(elements.servings, recipe.servings);

    // Ingredients and Method
    elements.ingredients.innerHTML = recipe.ingredients?.map(item => 
      `<li>${item}</li>`
    ).join('') || '<li>No ingredients listed</li>';

    elements.method.innerHTML = recipe.method?.map((step, i) => 
      `<li><strong>Step ${i + 1}:</strong> ${step}</li>`
    ).join('') || '<li>No method provided</li>';

    // Nutrition Information
    const nutrition = recipe.nutritional_info || {};
    elements.nutrition.innerHTML = `
      <div class="nutrition-item"><span>Calories:</span> ${nutrition.calories || 'N/A'}</div>
      <div class="nutrition-item"><span>Protein:</span> ${nutrition.protein || 'N/A'}</div>
      <div class="nutrition-item"><span>Carbs:</span> ${nutrition.carbohydrates || 'N/A'}</div>
      <div class="nutrition-item"><span>Fiber:</span> ${nutrition.fiber || 'N/A'}</div>
      <div class="nutrition-item"><span>Fat:</span> ${nutrition.fat || 'N/A'}</div>
    `;

    // Metadata
    utils.safeRender(elements.tags, recipe.tags?.join(', '), 'No tags');
    utils.safeRender(elements.cuisine, recipe.cuisine?.join(', '), 'Not specified');
    utils.safeRender(elements.category, recipe.category?.join(', '), 'Uncategorized');

    // Additional Content
    utils.safeRender(elements.notes, recipe.notes, 'No additional notes');
    utils.safeRender(elements.facts, recipe.facts, 'No fun facts available');

    // Video Embed
    elements.video.src = utils.youtubeEmbed(recipe.video_url);
    elements.video.style.display = recipe.video_url ? 'block' : 'none';
  }
};

// Equipment Functions
const equipmentHandler = {
  fetchEquipment: async (equipmentIds) => {
    if (!equipmentIds?.length) return null;
    
    try {
      const { data, error } = await supabase
        .from('equipment_db')
        .select('*')
        .in('id', equipmentIds.map(Number));

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Equipment fetch error:', error);
      return null;
    }
  },

  render: (equipmentItems) => {
    if (!elements.equipment) return;

    if (!equipmentItems?.length) {
      elements.equipment.innerHTML = '<p class="no-equipment">No special equipment needed for this recipe</p>';
      return;
    }

    elements.equipment.innerHTML = equipmentItems.map(item => `
      <div class="equipment-card">
        <img src="${item.image_url}" alt="${item.name}" loading="lazy" class="equipment-image">
        <div class="equipment-info">
          <h3>${item.name}</h3>
          ${item.description ? `<p>${item.description}</p>` : ''}
          <a href="${item.affiliate_link}" target="_blank" rel="noopener" class="btn-buy">
            <i class="fas fa-shopping-cart"></i> Buy Now
          </a>
        </div>
      </div>
    `).join('');
  }
};

// Main Application Flow
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Recipe page initialized');
  
  const slug = utils.getSlug();
  console.log('Slug extracted:', slug);

  if (!slug) {
    utils.safeRender(elements.title, 'Invalid recipe URL');
    return;
  }

  const recipe = await recipeHandler.fetchRecipe(slug);
  
  if (!recipe) {
    utils.safeRender(elements.title, 'Recipe not found');
    return;
  }

  console.log('Recipe loaded:', recipe.title);
  
  // Render the recipe
  recipeHandler.render(recipe);
  
  // Update view count
  if (recipe.id) {
    await recipeHandler.incrementViews(recipe.id);
  }

  // Load equipment if available
  if (recipe.equipment_ids?.length) {
    const equipment = await equipmentHandler.fetchEquipment(recipe.equipment_ids);
    equipmentHandler.render(equipment);
  }
});

// Print Button Handler
document.querySelector('.btn-print')?.addEventListener('click', () => {
  window.print();
});
