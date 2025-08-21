import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);
// --- DOM elements ---
const recipesContainer = document.getElementById("recipes-container");
const searchInput = document.getElementById("search-input");

// --- Placeholder image for recipes with no thumbnail ---
const PLACEHOLDER_IMAGE = "placeholder-image.jpg"; // put a default image in your project folder

// --- Fetch all recipes ---
async function fetchRecipes() {
  const { data: recipes, error } = await supabase
    .from("recipe_db")   // 👈 make sure this matches your table name
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching recipes:", error.message);
    recipesContainer.innerHTML = "<p>Failed to load recipes.</p>";
    return;
  }

  displayRecipes(recipes);
}

// --- Render recipes on page ---
function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach((recipe) => {
    const card = document.createElement("div");
    card.classList.add("recipe-card");

    const thumbnail = recipe.thumbnail_url || PLACEHOLDER_IMAGE;

    card.innerHTML = `
      <div class="recipe-thumb">
        <img src="${thumbnail}" alt="${recipe.title}" />
        ${recipe.video_url ? `<a class="video-btn" href="${recipe.video_url}" target="_blank"><i class="fas fa-play"></i></a>` : ""}
      </div>
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <p class="tags">${Array.isArray(recipe.tags) ? recipe.tags.join(", ") : recipe.tags || ""}</p>
        <p class="category">${Array.isArray(recipe.category) ? recipe.category.join(", ") : recipe.category || ""}</p>
      </div>
    `;

    recipesContainer.appendChild(card);
  });
}

// --- Search recipes ---
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase();

  const { data: recipes, error } = await supabase.from("recipe_db").select("*");
  if (error) {
    console.error("❌ Error searching recipes:", error.message);
    return;
  }

  const filtered = recipes.filter((recipe) => {
    const title = recipe.title?.toLowerCase() || "";
    const tags = Array.isArray(recipe.tags) ? recipe.tags.join(" ").toLowerCase() : (recipe.tags || "").toLowerCase();
    const category = Array.isArray(recipe.category) ? recipe.category.join(" ").toLowerCase() : (recipe.category || "").toLowerCase();

    return title.includes(query) || tags.includes(query) || category.includes(query);
  });

  displayRecipes(filtered);
});

// --- Initial load ---
fetchRecipes();
