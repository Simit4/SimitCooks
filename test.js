// recipes.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase config ---
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const recipesContainer = document.getElementById("recipes-container");
const searchInput = document.getElementById("search-input");

// Placeholder image for recipes without thumbnail
const PLACEHOLDER_IMAGE = "placeholder-image.jpg"; // add a default image in your folder

// Fetch recipes from Supabase
async function fetchRecipes() {
  const { data: recipes, error } = await supabase
    .from("recipe_db")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
    recipesContainer.innerHTML = "<p>Failed to load recipes.</p>";
    return;
  }

  displayRecipes(recipes);
}

// Display recipes
function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";

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
        <p class="tags">${recipe.tags ? recipe.tags.join(", ") : ""}</p>
        <p class="category">${recipe.category ? recipe.category.join(", ") : ""}</p>
      </div>
    `;

    recipesContainer.appendChild(card);
  });
}

// Search recipes by title, tags, or category
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase();
  const { data: recipes, error } = await supabase.from("recipe_db").select("*");

  if (error) {
    console.error("Error searching recipes:", error);
    return;
  }

  const filtered = recipes.filter((recipe) => {
    const title = recipe.title?.toLowerCase() || "";
    const tags = (recipe.tags || []).join(" ").toLowerCase();
    const category = (recipe.category || []).join(" ").toLowerCase();
    return title.includes(query) || tags.includes(query) || category.includes(query);
  });

  displayRecipes(filtered);
});

// Initial fetch
fetchRecipes();
