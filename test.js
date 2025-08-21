import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const recipesContainer = document.getElementById("recipes-container");
const searchInput = document.getElementById("search-input");

// Fallback image
const PLACEHOLDER_IMAGE = "placeholder-image.jpg";

// Fetch recipes
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

    // fallback thumbnail if null
    const thumbnail = recipe.thumbnail_url || PLACEHOLDER_IMAGE;

    // join array fields safely
    const tags = Array.isArray(recipe.tags) ? recipe.tags.join(", ") : "";
    const category = Array.isArray(recipe.category) ? recipe.category.join(", ") : "";
    const cuisine = Array.isArray(recipe.cuisine) ? recipe.cuisine.join(", ") : "";

    card.innerHTML = `
      <div class="recipe-thumb">
        <img src="${thumbnail}" alt="${recipe.title}" />
        ${recipe.video_url ? `<a class="video-btn" href="${recipe.video_url}" target="_blank"><i class="fas fa-play"></i></a>` : ""}
      </div>
      <div class="recipe-info">
        <h3>${recipe.title}</h3>
        <p class="description">${recipe.description || ""}</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Cuisine:</strong> ${cuisine}</p>
        <p><strong>Tags:</strong> ${tags}</p>
        <p><strong>Prep:</strong> ${recipe.prep_time || "-"} | <strong>Cook:</strong> ${recipe.cook_time || "-"}</p>
        <p><strong>Servings:</strong> ${recipe.servings || "-"}</p>
      </div>
    `;

    recipesContainer.appendChild(card);
  });
}

// Search functionality
searchInput.addEventListener("input", async () => {
  const query = searchInput.value.toLowerCase();
  const { data: recipes, error } = await supabase.from("recipe_db").select("*");

  if (error) {
    console.error("Error searching recipes:", error);
    return;
  }

  const filtered = recipes.filter((recipe) => {
    const title = recipe.title?.toLowerCase() || "";
    const tags = Array.isArray(recipe.tags) ? recipe.tags.join(" ").toLowerCase() : "";
    const category = Array.isArray(recipe.category) ? recipe.category.join(" ").toLowerCase() : "";
    const cuisine = Array.isArray(recipe.cuisine) ? recipe.cuisine.join(" ").toLowerCase() : "";
    return (
      title.includes(query) ||
      tags.includes(query) ||
      category.includes(query) ||
      cuisine.includes(query)
    );
  });

  displayRecipes(filtered);
});

// Initial fetch
fetchRecipes();
