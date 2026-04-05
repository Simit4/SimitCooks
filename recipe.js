import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);
const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';

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
  if (vid) return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
  return FALLBACK_IMAGE;
}

async function renderRecipe(recipe) {
  if (!recipe) return;

  // Basic info
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
      ingList.innerHTML = `<ul class="green-bullets">${recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
    }
  } else ingList.innerHTML = '<li>No ingredients listed</li>';

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = recipe.method?.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li>No instructions available</li>';

  // =================================================
  // 🔹 VIDEO SECTION - WORKING
  // =================================================
  const videoSection = document.getElementById("video-section");
  const videoContainer = document.getElementById("video-container");
  const videoId = extractYouTubeId(recipe.video_url);

  if (videoId && videoContainer) {
    videoSection.style.display = "block";

    // Show thumbnail first
    const thumbUrl = getRecipeThumbnail(recipe);
    videoContainer.innerHTML = `<div class="video-thumb" style="position:relative;cursor:pointer;">
      <img src="${thumbUrl}" style="width:100%;display:block;" />
      <div class="play-btn" style="
        position:absolute;top:50%;left:50%;
        transform:translate(-50%, -50%);
        font-size:3rem;color:white;text-shadow:0 0 10px rgba(0,0,0,0.5);">▶</div>
    </div>`;

    const thumbDiv = videoContainer.querySelector('.video-thumb');

    // Click → replace with iframe
    thumbDiv.addEventListener('click', () => {
      videoContainer.innerHTML = `<iframe
        width="100%" height="100%"
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0"
        frameborder="0"
        allow="autoplay; fullscreen; encrypted-media"
        allowfullscreen>
      </iframe>`;
    });

  } else videoSection.style.display = "none";
}

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

init();
