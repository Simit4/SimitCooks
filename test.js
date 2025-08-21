import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


const recipeGrid = document.getElementById("recipeGrid");
const filterButtons = document.querySelectorAll(".filter-btn");

let recipes = [];

async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
    recipeGrid.innerHTML = "<p style='text-align:center;color:red'>Failed to fetch recipes.</p>";
    return;
  }

  recipes = data;
  renderRecipes("all");
}

// Render function
function renderRecipes(filter = "all") {
  recipeGrid.innerHTML = "";

  recipes.forEach(recipe => {
    const hasVideo = recipe.video_url && recipe.video_url.trim() !== "";
    const recipeTags = recipe.tags || [];

    const matchesFilter =
      filter === "all" ||
      (filter === "video" && hasVideo) ||
      (filter === "text" && !hasVideo) ||
      recipeTags.includes(filter);

    if (!matchesFilter) return;

    const card = document.createElement("div");
    card.className = "recipe-card";

    const thumb = document.createElement("div");
    thumb.className = "recipe-thumb";

    if (hasVideo && recipe.video_url) {
      const videoIdMatch = recipe.video_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      const thumbnailUrl = videoIdMatch
        ? `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`
        : "assets/default-thumbnail.jpg";

      thumb.style.backgroundImage = `url(${thumbnailUrl})`;
      thumb.classList.add("has-video");
    } else {
      thumb.innerHTML = `<span class="placeholder-emoji">🥟</span>`;
      thumb.style.background = "linear-gradient(135deg, #fef9f4, #f0eae0)";
    }

    const title = document.createElement("h3");
    title.textContent = recipe.title;

    card.appendChild(thumb);
    card.appendChild(title);
    recipeGrid.appendChild(card);
  });
}

// Filter button events
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderRecipes(btn.dataset.filter);
  });
});

fetchRecipes();
