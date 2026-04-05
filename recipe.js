import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 Supabase Configuration
// =================================================
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);
const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';

// =================================================
// 🔹 Helpers
// =================================================
function getSlug() {
  const path = window.location.pathname.split('/').filter(Boolean);
  return path[1] || new URLSearchParams(window.location.search).get('slug');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function getRecipeThumbnail(recipe) {
  if (recipe.thumbnail_url?.trim()) return recipe.thumbnail_url;
  const vid = extractYouTubeId(recipe.video_url);
  if (vid) return `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
  return FALLBACK_IMAGE;
}

// =================================================
// 🔹 Render Recipe
// =================================================
async function renderRecipe(recipe) {
  if (!recipe) return;

  document.getElementById('recipe-title').innerText = recipe.title || 'Untitled Recipe';
  document.getElementById('recipe-description').innerText = recipe.description || 'Delicious recipe made with love.';
  document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
  document.getElementById('servings').innerText = recipe.servings || 'N/A';

  // Ingredients
  const ingList = document.getElementById('ingredients-list');
  if (recipe.ingredients?.length) {
    if (typeof recipe.ingredients[0] === 'object' && recipe.ingredients[0].items) {
      ingList.innerHTML = recipe.ingredients.map(section => {
        const title = escapeHtml(section.section || '');
        const items = (section.items || []).map(i => `<li>${escapeHtml(i)}</li>`).join('');
        return `<div class="ingredients-section">${title ? `<h4>${title}</h4>` : ''}<ul class="green-bullets">${items}</ul></div>`;
      }).join('');
    } else {
      const items = recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('');
      ingList.innerHTML = `<ul class="green-bullets">${items}</ul>`;
    }
  } else ingList.innerHTML = '<li>No ingredients listed</li>';

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = recipe.method?.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li>No instructions available</li>';

  // Info sections
  document.getElementById("history-overview").textContent = recipe.history_overview || '';
  document.getElementById('notes').innerText = recipe.notes || 'No additional notes.';
  document.getElementById('facts').innerText = recipe.facts || 'Did you know? This recipe is made with love!';

  const catDiv = document.getElementById('category');
  if (recipe.category) catDiv.innerHTML = Array.isArray(recipe.category) ? recipe.category.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('') : `<span class="tag">${escapeHtml(recipe.category)}</span>`;
  
  const cuisineDiv = document.getElementById('cuisine');
  if (recipe.cuisine) cuisineDiv.innerHTML = Array.isArray(recipe.cuisine) ? recipe.cuisine.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('') : `<span class="tag">${escapeHtml(recipe.cuisine)}</span>`;

  // Share button
  document.getElementById('universal-share')?.addEventListener('click', async () => {
    const recipeTitle = document.getElementById('recipe-title').textContent;
    const recipeUrl = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: recipeTitle, text: `Check out this recipe: ${recipeTitle}`, url: recipeUrl }); } 
      catch (err) { console.error(err); }
    } else prompt('Copy this link to share:', recipeUrl);
  });

  // =================================================
  // 🔹 Video Section - TikTok/Instagram style
  // =================================================

document.addEventListener("DOMContentLoaded", () => {
  const videoSection = document.getElementById("video-section");
  const videoContainer = document.getElementById("video-container");

  // Replace with your actual YouTube video ID
  const videoId = "YOUR_VIDEO_ID_HERE";

  if (videoContainer && videoContainer.children.length === 0) {
    // Create iframe with muted autoplay
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=1&mute=1&playsinline=1`;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    videoContainer.appendChild(iframe);
    videoSection.style.display = "block";

    // Click-to-unmute and play normally
    videoContainer.addEventListener("click", () => {
      // Reload iframe with autoplay and unmuted
      iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=1&playsinline=1`;
      // Hide play icon after click
      videoContainer.style.pointerEvents = "none";
    });

    // Intersection Observer for auto-play only when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=1&mute=1&playsinline=1`;
          }
        });
      },
      { threshold: 0.5 } // 50% of the video should be visible
    );

    observer.observe(videoContainer);
  }
});
// =================================================
// 🔹 Fetch More Recipes
// =================================================
async function fetchMoreRecipes(slug) {
  const { data: recipes } = await supabase.from('recipe_db').select('*').neq('slug', slug).limit(3);
  const grid = document.getElementById('more-recipes-grid');
  if (!recipes?.length) { grid.innerHTML = '<p style="text-align:center">More recipes coming soon!</p>'; return; }

  grid.innerHTML = recipes.map(r => {
    const thumb = getRecipeThumbnail(r);
    const title = r.title || 'Untitled';
    const desc = r.description || 'Delicious recipe';
    return `<div class="recipe-card" onclick="window.location.href='/recipe/${r.slug}'">
      <div class="thumbnail-wrapper"><img src="${thumb}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'"></div>
      <div class="card-body"><h4>${escapeHtml(title)}</h4><p>${escapeHtml(desc.substring(0,80))}${desc.length>80?'...':''}</p></div>
    </div>`;
  }).join('');
}

// =================================================
// 🔹 Initialize
// =================================================
async function init() {
  const slug = getSlug();
  if (!slug) { document.getElementById('recipe-title').innerText = 'Recipe Not Found'; return; }

  const { data: recipe, error } = await supabase.from('recipe_db').select('*').eq('slug', slug).single();
  if (error || !recipe) { document.getElementById('recipe-title').innerText = 'Recipe Not Found'; return; }

  renderRecipe(recipe);
  fetchMoreRecipes(slug);

  await supabase.from('recipe_db').update({ views: (recipe.views || 0) + 1 }).eq('slug', slug);
}

// Start
init();
