// recipes.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase config ---
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// --- DOM containers ---
const allRecipesContainer = document.getElementById('all-recipes-container');
const videoRecipesContainer = document.getElementById('video-recipes-container');
const categorySelect = document.getElementById('category-select');
const festivalSelect = document.getElementById('festival-select');

// --- Fetch all recipes ---
async function fetchRecipes() {
  const { data: recipes, error } = await supabase
    .from('recipes')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  renderRecipes(recipes);
  populateFilters(recipes);
}

// --- Render recipes ---
function renderRecipes(recipes) {
  allRecipesContainer.innerHTML = '';
  videoRecipesContainer.innerHTML = '';

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.classList.add('recipe-card');

    // Use placeholder if no image
    const img = document.createElement('img');
    img.src = recipe.image_url || 'images/placeholder.jpg';
    img.alt = recipe.title;

    const title = document.createElement('h3');
    title.textContent = recipe.title;

    // Recipe link
    const link = document.createElement('a');
    link.href = `recipe.html?slug=${recipe.slug}`;
    link.appendChild(img);
    link.appendChild(title);

    card.appendChild(link);

    // Append to Video or All Recipes
    if (recipe.video_url) {
      videoRecipesContainer.appendChild(card);
    } else {
      allRecipesContainer.appendChild(card);
    }
  });
}

// --- Populate filters ---
function populateFilters(recipes) {
  const categories = [...new Set(recipes.map(r => r.category).filter(Boolean))];
  const festivals = [...new Set(recipes.map(r => r.festival).filter(Boolean))];

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });

  festivals.forEach(fest => {
    const option = document.createElement('option');
    option.value = fest;
    option.textContent = fest;
    festivalSelect.appendChild(option);
  });
}

// --- Filter logic ---
function filterRecipes() {
  const selectedCategory = categorySelect.value;
  const selectedFestival = festivalSelect.value;

  fetchRecipes().then(() => {
    const allCards = [...allRecipesContainer.children, ...videoRecipesContainer.children];

    allCards.forEach(card => {
      const recipeTitle = card.querySelector('h3').textContent.toLowerCase();
      const matchesCategory = selectedCategory === 'all' || card.dataset.category === selectedCategory;
      const matchesFestival = selectedFestival === 'all' || card.dataset.festival === selectedFestival;

      card.style.display = matchesCategory && matchesFestival ? 'block' : 'none';
    });
  });
}

// --- Event listeners ---
categorySelect.addEventListener('change', filterRecipes);
festivalSelect.addEventListener('change', filterRecipes);

// --- Init ---
fetchRecipes();
