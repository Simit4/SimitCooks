// recipes.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const recipesContainer = document.getElementById('recipes-container');
const placeholderImage = 'images/placeholder-recipe.jpg'; // default if recipe has no image

// Fetch all recipes from Supabase
async function fetchRecipes() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false }); // newest first

  if (error) {
    console.error('Error fetching recipes:', error);
    recipesContainer.innerHTML = '<p>Unable to load recipes at the moment.</p>';
    return;
  }

  renderRecipes(recipes);
}

// Render recipes on the page
function renderRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = '<p>No recipes found.</p>';
    return;
  }

  recipesContainer.innerHTML = recipes.map(recipe => {
    const image = recipe.image_url || placeholderImage;
    const videoBadge = recipe.video_url ? '<span class="video-badge">🎥</span>' : '';
    const categoryTag = recipe.category ? `<span class="recipe-category">${recipe.category}</span>` : '';
    const festivalTag = recipe.festival ? `<span class="recipe-festival">${recipe.festival}</span>` : '';

    return `
      <div class="recipe-card">
        <div class="recipe-image-wrapper">
          <img src="${image}" alt="${recipe.title}" class="recipe-image">
          ${videoBadge}
        </div>
        <h3 class="recipe-title">${recipe.title}</h3>
        <div class="recipe-tags">${categoryTag} ${festivalTag}</div>
      </div>
    `;
  }).join('');
}

// Initialize
fetchRecipes();
