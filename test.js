import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


const recipesContainer = document.getElementById("recipes");

// Fetch from Supabase
async function loadRecipes() {
  const { data, error } = await supabase.from("recipe_db").select("*");
  if (error) {
    console.error("Error fetching recipes:", error);
    return;
  }
  renderRecipes(data);
}

function renderRecipes(recipes) {
  recipesContainer.innerHTML = "";
  recipes.forEach(recipe => {
    const thumb = recipe.video_url 
      ? `<div class="recipe-thumb">
           <img src="https://img.youtube.com/vi/${extractYoutubeId(recipe.video_url)}/hqdefault.jpg" alt="${recipe.title}">
           <div class="play-icon">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
           </div>
         </div>`
      : `<div class="recipe-thumb">
           <img src="${recipe.image_url || 'placeholder.jpg'}" alt="${recipe.title}">
         </div>`;

    const tags = recipe.tags ? recipe.tags.map(tag => `<span>${tag}</span>`).join("") : "";

    const card = document.createElement("div");
    card.classList.add("recipe-card");
    card.innerHTML = `
      ${thumb}
      <div class="recipe-body">
        <h3>${recipe.title}</h3>
        <p>${recipe.description || ""}</p>
        <div class="recipe-tags">${tags}</div>
      </div>
    `;
    card.addEventListener("click", () => {
      window.location.href = `/recipe/${recipe.slug}/`;
    });
    recipesContainer.appendChild(card);
  });
}

// Extract YouTube ID
function extractYoutubeId(url) {
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Filtering
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;
    document.querySelectorAll(".recipe-card").forEach(card => {
      const tags = card.querySelector(".recipe-tags").innerText.toLowerCase();
      if (filter === "all" || tags.includes(filter)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// Load recipes on page load
loadRecipes();
