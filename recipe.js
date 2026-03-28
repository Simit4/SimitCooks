import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


function getSlug() {
  const path = window.location.pathname.split('/').filter(Boolean);
  return path[1] || new URLSearchParams(window.location.search).get('slug');
}

function renderRecipe(recipe) {
  if(!recipe) return;

  document.getElementById('recipe-title').innerText = recipe.title;
  document.getElementById('recipe-description').innerText = recipe.description || '';
  document.getElementById('prep-time').innerText = recipe.prep_time || '';
  document.getElementById('cook-time').innerText = recipe.cook_time || '';
  document.getElementById('servings').innerText = recipe.servings || '';

  const ingredients = document.getElementById('ingredients-list');
  ingredients.innerHTML = recipe.ingredients.map(i=>`<li>${i}</li>`).join('');

  const method = document.getElementById('method-list');
  method.innerHTML = recipe.method.map(s=>`<li>${s}</li>`).join('');

  // Nutrition
  const nutritionDiv = document.getElementById('nutrition');
  nutritionDiv.innerHTML = `
    ${recipe.nutrition?.calories ? `<p>Calories: ${recipe.nutrition.calories}</p>` : ''}
    ${recipe.nutrition?.protein ? `<p>Protein: ${recipe.nutrition.protein}</p>` : ''}
    ${recipe.nutrition?.carbs ? `<p>Carbs: ${recipe.nutrition.carbs}</p>` : ''}
  `;

  // Tags, Cuisine, Category
  document.getElementById('tags').innerText = recipe.tags?.join(', ') || '';
  document.getElementById('cuisine').innerText = recipe.cuisine?.join(', ') || '';
  document.getElementById('category').innerText = recipe.category?.join(', ') || '';

  // Notes & Fun Facts
  document.getElementById('notes').innerText = recipe.notes || '';
  document.getElementById('facts').innerText = recipe.facts || '';

  // Video
  if(recipe.video_url) {
    document.getElementById('recipe-video-container').innerHTML = 
      `<iframe src="https://www.youtube.com/embed/${recipe.video_url.split('v=')[1]}" allowfullscreen></iframe>`;
  }

  // More Recipes
  fetchMoreRecipes(recipe.slug);
}

async function fetchMoreRecipes(currentSlug) {
  const { data: recipes } = await supabase
    .from('recipe_db')
    .select('title, slug, image_url')
    .neq('slug', currentSlug)
    .limit(3);

  const grid = document.getElementById('more-recipes-grid');
  grid.innerHTML = recipes.map(r => `
    <div class="recipe-card">
      <img src="${r.image_url || 'https://via.placeholder.com/300x180'}" alt="${r.title}">
      <h4>${r.title}</h4>
    </div>
  `).join('');
}

// Initialize
async function init() {
  const slug = getSlug();
  const { data: recipe } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  renderRecipe(recipe);
}

init();
