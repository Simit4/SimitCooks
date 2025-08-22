import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// recipe.js
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    document.getElementById("recipe-container").innerHTML = "<p>Recipe not found.</p>";
    return;
  }

  try {
    const { data, error } = await supabase
      .from("recipe_db")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error || !data) {
      console.error(error);
      document.getElementById("recipe-container").innerHTML = "<p>Recipe not found.</p>";
      return;
    }

    document.getElementById("recipe-container").innerHTML = renderRecipe(data);
  } catch (err) {
    console.error("Error loading recipe:", err);
    document.getElementById("recipe-container").innerHTML = "<p>Something went wrong.</p>";
  }
});

function renderRecipe(recipe) {
  // Ingredients
  const ingredientsSection = recipe.ingredients?.length
    ? `<h2>Ingredients</h2>
       <ul>${recipe.ingredients.map(item => `<li>${item}</li>`).join("")}</ul>`
    : "";

  // Method
  const methodSection = recipe.method?.length
    ? `<h2>Method</h2>
       <ol>${recipe.method.map(step => `<li>${step}</li>`).join("")}</ol>`
    : "";

  // ✅ Only show video if available
  const videoSection = recipe.video_url
    ? `<div class="recipe-video">
         <h2>Recipe Video</h2>
         <iframe src="https://www.youtube.com/embed/${extractVideoId(recipe.video_url)}" 
                 frameborder="0" allowfullscreen></iframe>
       </div>`
    : "";

  return `
    <article class="recipe-details">
      <h1>${recipe.title}</h1>
      ${recipe.description ? `<p class="description">${recipe.description}</p>` : ""}
      ${ingredientsSection}
      ${methodSection}
      ${videoSection}
    </article>
  `;
}

// Helper: Extract YouTube ID
function extractVideoId(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
