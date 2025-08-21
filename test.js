
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase config ---
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

/ --- DOM elements ---
const recipesContainer = document.getElementById("recipes-container");
const searchInput = document.getElementById("search-input");

// --- Placeholder image ---
const PLACEHOLDER_IMAGE = "placeholder-image.jpg"; // Add this image in your folder

// --- YouTube thumbnail fetcher ---
function getYouTubeThumbnail(url) {
  try {
    const videoId = new URL(url).searchParams.get("v");
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch {
    return PLACEHOLDER_IMAGE;
  }
}

// --- Render recipes ---
function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";

  if (!recipes || recipes.length === 0) {
    recipesContainer.innerHTML = "<p>No recipes found.</p>";
    return;
  }

  recipes.forEach((recipe) => {
    let thumbnail = recipe.thumbnail_url;

    if (!thumbnail && recipe.video_url) {
      thumbnail = getYouTubeThumbnail(recipe.video_url);
    }
    if (!thumbnail) {
      thumbnail = PLACEHOLDER_IMAGE;
    }

    const card = document.createElement("div");
    card.classList.add("recipe-card");

    card.innerHTML = `
      <a href="/recipe/${recipe.slug}/" class="recipe-link">
        <div class="recipe-thumb">
          <img src="${thumbnail}" alt="${recipe.title}" />
          ${recipe.video_url ? `<div class="video-overlay"><i class="fas fa-play"></i></div>` : ""}
        </div>
        <div class="recipe-info">
          <h3>${recipe.title}</h3>
          <p class="tags">${recipe.tags ? recipe.tags.join(", ") : ""}</p>
          <p class="category">${recipe.category ? recipe.category.join(", ") : ""}</p>
        </div>
      </a>
    `;

    recipesContainer.appendChild(card);
  });
}

// --- Cache recipes locally for search ---
let cachedRecipes = [];

// --- Fetch recipes from Supabase ---
async function fetchRecipes() {
  recipesContainer.innerHTML = "<p>Loading recipes...</p>";

  const { data: recipes, error } = await supabase
    .from("recipe_db")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
    recipesContainer.innerHTML = "<p>Failed to load recipes.</p>";
    return;
  }

  cachedRecipes = recipes;
  displayRecipes(recipes);
}

// --- Search filter ---
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  const filtered = cachedRecipes.filter((recipe) => {
    const title = recipe.title?.toLowerCase() || "";
    const tags = (recipe.tags || []).join(" ").toLowerCase();
    const category = (recipe.category || []).join(" ").toLowerCase();
    return (
      title.includes(query) ||
      tags.includes(query) ||
      category.includes(query)
    );
  });

  displayRecipes(filtered);
});

// --- Init ---
fetchRecipes();
