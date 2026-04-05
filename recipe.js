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
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

function getRecipeThumbnail(recipe) {
  if (recipe.thumbnail_url) return recipe.thumbnail_url;
  const vid = extractYouTubeId(recipe.video_url);
  return vid ? `https://img.youtube.com/vi/${vid}/maxresdefault.jpg` : FALLBACK_IMAGE;
}

// =================================================
// 🔹 Render Recipe
// =================================================
function renderRecipe(recipe) {
  if (!recipe) return;

  document.getElementById('recipe-title').innerText = recipe.title || '';
  document.getElementById('recipe-description').innerText = recipe.description || '';
  document.getElementById('prep-time').innerText = recipe.prep_time || '-';
  document.getElementById('cook-time').innerText = recipe.cook_time || '-';
  document.getElementById('servings').innerText = recipe.servings || '-';

  // Ingredients
  const ingList = document.getElementById('ingredients-list');
  ingList.innerHTML = recipe.ingredients?.map(i => `<li>${escapeHtml(i)}</li>`).join('') || '<li>No ingredients</li>';

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = recipe.method?.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li>No steps</li>';

  // Info
  document.getElementById("history-overview").textContent = recipe.history_overview || '';
  document.getElementById('notes').innerText = recipe.notes || '';
  document.getElementById('facts').innerText = recipe.facts || '';

  // =================================================
// 🔥 REELS-LEVEL VIDEO SECTION
// =================================================
const videoSection = document.getElementById("video-section");
const videoContainer = document.getElementById("video-container");

const videoId = extractYouTubeId(recipe.video_url);

if (videoId && videoContainer) {
  videoSection.style.display = "block";

  let isUnmuted = false;

  function loadMutedVideo() {
    videoContainer.innerHTML = `
      <iframe
        id="recipeVideo"
        src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&mute=1&controls=0&playsinline=1&rel=0"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
  }

  function loadUnmutedVideo() {
    videoContainer.innerHTML = `
      <iframe
        id="recipeVideo"
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&playsinline=1&rel=0"
        allow="autoplay; encrypted-media"
        allowfullscreen>
      </iframe>
    `;
  }

  // Initial load (muted autoplay)
  loadMutedVideo();

  // 👉 Click → unmute (TikTok style)
  videoContainer.addEventListener("click", () => {
    if (!isUnmuted) {
      isUnmuted = true;
      loadUnmutedVideo();
      videoContainer.classList.add("video-playing");
    }
  });

  // 👉 Scroll autoplay / pause
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const iframe = document.getElementById("recipeVideo");

        if (!iframe) return;

        if (entry.isIntersecting) {
          iframe.src = iframe.src.replace("autoplay=0", "autoplay=1");
        } else {
          // Pause by reloading muted preview
          if (!isUnmuted) loadMutedVideo();
        }
      });
    }, { threshold: 0.6 });

    observer.observe(videoContainer);
  }

} else {
  videoSection.style.display = "none";
}

// =================================================
// 🔹 More Recipes
// =================================================
async function fetchMoreRecipes(slug) {
  const { data } = await supabase.from('recipe_db').select('*').neq('slug', slug).limit(3);
  const grid = document.getElementById('more-recipes-grid');

  if (!data?.length) {
    grid.innerHTML = '<p>No recipes</p>';
    return;
  }

  grid.innerHTML = data.map(r => `
    <div class="recipe-card" onclick="location.href='/recipe/${r.slug}'">
      <div class="thumbnail-wrapper">
        <img src="${getRecipeThumbnail(r)}" />
      </div>
      <div class="card-body">
        <h4>${escapeHtml(r.title)}</h4>
        <p>${escapeHtml(r.description?.slice(0,80) || '')}</p>
      </div>
    </div>
  `).join('');
}

// =================================================
// 🔹 Init
// =================================================
async function init() {
  const slug = getSlug();
  if (!slug) return;

  const { data, error } = await supabase.from('recipe_db').select('*').eq('slug', slug).single();

  if (error || !data) {
    document.getElementById('recipe-title').innerText = 'Not found';
    return;
  }

  renderRecipe(data);
  fetchMoreRecipes(slug);

  await supabase.from('recipe_db')
    .update({ views: (data.views || 0) + 1 })
    .eq('slug', slug);
}

init();
