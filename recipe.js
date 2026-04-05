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

  // Title, description, times
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

  // Categories & Cuisine
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
  // 🔹 VIDEO SECTION - 16:9 FULLSCREEN, SOUND, PULSE
  // =================================================
  const videoSection = document.getElementById("video-section");
  const videoContainer = document.getElementById("video-container");
  const videoId = extractYouTubeId(recipe.video_url);

// Video wrapper fixed for true 16:9
if (videoId && videoContainer) {
  videoSection.style.display = "block";
  videoContainer.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = "100%";
  wrapper.style.height = "0";
  wrapper.style.paddingBottom = "56.25%"; // 16:9
  wrapper.style.cursor = "pointer";
  videoContainer.appendChild(wrapper);

  // Thumbnail
  const thumb = document.createElement("img");
  thumb.src = getRecipeThumbnail(recipe);
  thumb.style.position = "absolute";
  thumb.style.top = "0";
  thumb.style.left = "0";
  thumb.style.width = "100%";
  thumb.style.height = "100%";
  thumb.style.objectFit = "cover";
  wrapper.appendChild(thumb);

  // Pulse play button
  const playBtn = document.createElement("div");
  playBtn.innerText = "▶";
  playBtn.style.position = "absolute";
  playBtn.style.top = "50%";
  playBtn.style.left = "50%";
  playBtn.style.transform = "translate(-50%, -50%)";
  playBtn.style.fontSize = "3rem";
  playBtn.style.color = "rgba(255,255,255,0.9)";
  playBtn.style.textShadow = "0 0 10px rgba(0,0,0,0.5)";
  playBtn.style.animation = "pulse 1.2s infinite";
  wrapper.appendChild(playBtn);

  // Click → iframe
  wrapper.addEventListener("click", () => {
    wrapper.innerHTML = `<iframe
      src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0"
      style="position:absolute;top:0;left:0;width:100%;height:100%;"
      frameborder="0"
      allow="autoplay; fullscreen; encrypted-media"
      allowfullscreen>
    </iframe>`;
  });

  // Add pulse animation keyframes
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes pulse {
      0% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
      100% { transform: translate(-50%, -50%) scale(1); }
    }
  `;
  document.head.appendChild(style);
}

    // Click → replace thumbnail with iframe
    wrapper.addEventListener("click", () => {
      wrapper.innerHTML = `<iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0"
        style="position:absolute;top:0;left:0;width:100%;height:100%;"
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

// Start
init();
