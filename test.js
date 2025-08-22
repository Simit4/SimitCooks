import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


async function fetchRecipes() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/recipe_db?select=*`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });
  return await res.json();
}

function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.dataset.tags = recipe.tags?.join(",") || "";
  card.dataset.hasVideo = recipe.video_url ? "true" : "false";

  // Thumbnail or placeholder
  let thumbHTML;
  if (recipe.thumbnail_url) {
    thumbHTML = `<img src="${recipe.thumbnail_url}" alt="${recipe.title}">`;
  } else if (!recipe.video_url && recipe.title.toLowerCase().includes("momo")) {
    thumbHTML = `<div class="recipe-thumb">🥟</div>`;
  } else {
    thumbHTML = `<div class="recipe-thumb">🍲</div>`;
  }

  card.innerHTML = `
    <div class="recipe-thumb">
      ${thumbHTML}
    </div>
    <div class="recipe-content">
      <h3>${recipe.title}</h3>
      <p>${recipe.category || "Recipe"}</p>
    </div>
  `;

  card.addEventListener("click", () => {
    window.location.href = `/recipe/${recipe.slug}`;
  });

  return card;
}

function renderRecipes(recipes) {
  const container = document.getElementById("recipe-list");
  container.innerHTML = "";
  recipes.forEach(recipe => {
    container.appendChild(createRecipeCard(recipe));
  });
}

function setupFilters(allRecipes) {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      let filtered = allRecipes;

      if (filter === "video") {
        filtered = allRecipes.filter(r => r.video_url);
      } else if (filter !== "all") {
        filtered = allRecipes.filter(r => r.tags?.includes(filter));
      }

      renderRecipes(filtered);
    });
  });
}

(async function init() {
  const recipes = await fetchRecipes();
  renderRecipes(recipes);
  setupFilters(recipes);
})();
