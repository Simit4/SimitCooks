// recipes.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase config ---
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


const container = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

let allRecipes = [];

// Fetch all recipes
async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = '<p>Failed to load recipes.</p>';
    return;
  }

  allRecipes = data;
  populateCategoryDropdown();
  renderRecipes(allRecipes);
}

// Populate category dropdown
function populateCategoryDropdown() {
  const categories = new Set();
  allRecipes.forEach(recipe => {
    if (recipe.category) {
      recipe.category.forEach(cat => categories.add(cat));
    }
  });

  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
}

// Render recipe cards
function renderRecipes(recipes) {
  if (!recipes.length) {
    container.innerHTML = '<p>No recipes found.</p>';
    return;
  }

  container.innerHTML = recipes.map(recipe => {
    const thumbnail = recipe.thumbnail_url || 'placeholder.jpg';
    const hasVideo = recipe.video_url ? true : false;

    return `
      <div class="recipe-card">
        <a href="recipe.html?slug=${recipe.slug}">
          <div class="recipe-thumb">
            <img src="${thumbnail}" alt="${recipe.title}">
            ${hasVideo ? '<span class="play-icon">▶</span>' : ''}
          </div>
          <h3>${recipe.title}</h3>
          <p>${recipe.description || ''}</p>
        </a>
      </div>
    `;
  }).join('');
}

// Filter recipes by search or category
function filterRecipes() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = allRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm) || (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
    const matchesCategory = selectedCategory ? (recipe.category && recipe.category.includes(selectedCategory)) : true;
    return matchesSearch && matchesCategory;
  });

  renderRecipes(filtered);
}

// Event listeners
searchInput.addEventListener('input', filterRecipes);
categoryFilter.addEventListener('change', filterRecipes);

// Initial fetch
fetchRecipes();
