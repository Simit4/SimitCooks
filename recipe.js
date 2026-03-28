import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function getSlugFromUrl() {
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'recipe' && pathParts[1]) return pathParts[1];
  return new URLSearchParams(window.location.search).get('slug');
}

function showLoading() {
  document.getElementById('recipe-title').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading recipe...';
  document.getElementById('recipe-description').innerText = 'Please wait while we fetch the recipe details.';
}

function showError(message) {
  document.querySelector('.recipe-page').innerHTML = `
    <div style="text-align:center;padding:3rem;">
      <i class="fas fa-exclamation-circle" style="font-size:3rem;color:#dc2626;"></i>
      <h2>Recipe Not Found</h2>
      <p>${message}</p>
      <a href="/recipes.html" class="btn-primary">Browse All Recipes</a>
    </div>`;
}

function renderRecipe(recipe) {
  if (!recipe) return showError('Recipe not found.');

  document.title = `${recipe.title} | Simit Cooks`;
  document.getElementById('recipe-title').innerText = recipe.title;
  document.getElementById('recipe-description').innerText = recipe.description || '';
  document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
  document.getElementById('servings').innerText = recipe.servings || 'N/A';

  const ingredients = document.getElementById('ingredients-list');
  ingredients.innerHTML = recipe.ingredients?.map(i => `<li>${i}</li>`).join('') || '<li>No ingredients</li>';

  const method = document.getElementById('method-list');
  method.innerHTML = recipe.method?.map(m => `<li>${m}</li>`).join('') || '<li>No instructions</li>';

  const embedUrl = convertToEmbedUrl(recipe.video_url);
  const videoContainer = document.getElementById('recipe-video-container');
  videoContainer.innerHTML = embedUrl ? `<iframe src="${embedUrl}" allowfullscreen title="${recipe.title} video"></iframe>` : '';

  const nutritionDiv = document.getElementById('nutrition');
  if (recipe.nutritional_info) {
    nutritionDiv.innerHTML = Object.entries(recipe.nutritional_info).map(([k,v]) => `<div><strong>${k}:</strong> ${v}</div>`).join('');
  }

  document.getElementById('notes').innerText = recipe.notes || 'No notes';
  document.getElementById('facts').innerText = recipe.facts || 'No fun facts';
  document.getElementById('tags').innerText = recipe.tags?.join(', ') || 'N/A';
  document.getElementById('cuisine').innerText = recipe.cuisine?.join(', ') || 'N/A';
  document.getElementById('category').innerText = recipe.category?.join(', ') || 'N/A';

  // Fetch and show more recipes
  fetchMoreRecipes(recipe.id);
}

async function fetchMoreRecipes(currentId) {
  const container = document.getElementById('more-recipes-container');
  container.innerHTML = '<div>Loading more recipes...</div>';
  try {
    const { data, error } = await supabase
      .from('recipe_db')
      .select('*')
      .neq('id', currentId)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error || !data.length) return container.innerHTML = '<p>No more recipes found.</p>';

    container.innerHTML = data.map(r => `
      <a href="/recipe/${r.slug}" class="recipe-card">
        <img src="${r.image_url || 'https://via.placeholder.com/300x180'}" alt="${r.title}" />
        <h4>${r.title}</h4>
      </a>
    `).join('');
  } catch(e) { container.innerHTML = '<p>Error loading more recipes.</p>'; }
}

document.addEventListener('DOMContentLoaded', async () => {
  showLoading();
  const slug = getSlugFromUrl();
  if (!slug) return showError('No recipe specified.');

  try {
    const { data: recipe, error } = await supabase.from('recipe_db').select('*').eq('slug', slug).single();
    if (error || !recipe) return showError('Recipe not found.');
    renderRecipe(recipe);
    // Update views
    supabase.from('recipe_db').update({views:(recipe.views||0)+1}).eq('id', recipe.id);
  } catch(e){ showError('Error fetching recipe.'); }
});

// Save Recipe
function saveRecipe() {
  const slug = getSlugFromUrl();
  let saved = JSON.parse(localStorage.getItem('savedRecipes'))||[];
  if(!saved.includes(slug)) { saved.push(slug); localStorage.setItem('savedRecipes', JSON.stringify(saved)); alert('Saved!'); }
  else alert('Already saved.');
}

// Share Recipe
function shareRecipe() {
  if(navigator.share) {
    navigator.share({ title: document.getElementById('recipe-title').innerText, text:'Check this recipe!', url:window.location.href});
  } else { alert('Copy URL to share.'); }
}
