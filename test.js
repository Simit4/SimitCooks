// recipes.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase config ---
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM elements
const recipesGrid = document.getElementById("recipesGrid");
const searchBox = document.getElementById("searchBox");
const filterBtns = document.querySelectorAll(".filter-btn");

let allRecipes = [];

// Fetch recipes from Supabase
async function loadRecipes() {
  const { data, error } = await supabase
    .from("recipe_db")
    .select("slug, title, description, thumbnail_url, category, tags, video_url");

  if (error) {
    console.error("Error loading recipes:", error);
    return;
  }

  allRecipes = data;
  renderRecipes(allRecipes);
}

// Render recipes into grid
function renderRecipes(recipes) {
  recipesGrid.innerHTML = "";

  if (recipes.length === 0) {
    recipesGrid.innerHTML = `<p class="no-results">No recipes found 🍽️</p>`;
    return;
  }

  recipes.forEach(recipe => {
    const thumb = recipe.thumbnail_url 
      ? recipe.thumbnail_url 
      : "assets/default-thumbnail.jpg"; // fallback image

    const videoIcon = recipe.video_url ? `<span class="video-icon">▶</span>` : "";

    const recipeCard = `
      <a href="/recipe/${recipe.slug}/" class="recipe-card">
        <div class="thumb-wrapper">
          <img src="${thumb}" alt="${recipe.title}" />
          ${videoIcon}
        </div>
        <div class="recipe-info">
          <h3>${recipe.title}</h3>
          <p>${recipe.description ? recipe.description : ""}</p>
          <div class="tags">
            ${(recipe.tags || []).map(tag => `<span>#${tag}</span>`).join(" ")}
          </div>
        </div>
      </a>
    `;

    recipesGrid.innerHTML += recipeCard;
  });
}

// Search filter
searchBox.addEventListener("input", () => {
  const query = searchBox.value.toLowerCase();
  const filtered = allRecipes.filter(r =>
    r.title.toLowerCase().includes(query) ||
    (r.description && r.description.toLowerCase().includes(query)) ||
    (r.tags && r.tags.some(tag => tag.toLowerCase().includes(query)))
  );
  renderRecipes(filtered);
});

// Category filter
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    if (filter === "all") {
      renderRecipes(allRecipes);
    } else {
      const filtered = allRecipes.filter(r =>
        (r.category && r.category.includes(filter)) ||
        (r.tags && r.tags.includes(filter))
      );
      renderRecipes(filtered);
    }
  });
});

// Init
