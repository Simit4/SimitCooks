import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 Configuration
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

function formatNutrition(nutritionData) {
  if (!nutritionData) return `<div class="nutrition-item"><div class="nutrition-value">N/A</div><div class="nutrition-label">Coming Soon</div></div>`;
  
  let parsed = nutritionData;
  if (typeof nutritionData === 'string') {
    try { parsed = JSON.parse(nutritionData); } 
    catch(e) { console.error('Nutrition parse failed', e); parsed = null; }
  }
  if (!parsed) return `<div class="nutrition-item"><div class="nutrition-value">N/A</div><div class="nutrition-label">Coming Soon</div></div>`;

  const items = [];
  const mapping = { calories: 'Calories', protein: 'Protein', carbohydrates: 'Carbs', carbs: 'Carbs', fat: 'Fat', fats: 'Fat', fiber: 'Fiber', sugar: 'Sugar', sodium: 'Sodium' };
  for (const key in mapping) {
    if (parsed[key] != null) items.push({ label: mapping[key], value: parsed[key] });
  }
  if (!items.length) return `<div class="nutrition-item"><div class="nutrition-value">N/A</div><div class="nutrition-label">Coming Soon</div></div>`;
  return items.map(i => `<div class="nutrition-item"><div class="nutrition-value">${escapeHtml(i.value)}</div><div class="nutrition-label">${escapeHtml(i.label)}</div></div>`).join('');
}

function formatTags(tags) {
  if (!tags?.length) return '<span class="tag">No tags</span>';
  return tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
}

// =================================================
// 🔹 Render Recipe
// =================================================
function renderRecipe(recipe) {
  if (!recipe) return;

  document.getElementById('recipe-title').innerText = recipe.title || 'Untitled Recipe';
  document.getElementById('recipe-description').innerText = recipe.description || 'Delicious recipe made with love.';
  document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
  document.getElementById('servings').innerText = recipe.servings || 'N/A';

  // Ingredients with sections
// Ingredients
const ingList = document.getElementById('ingredients-list');
if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
  // Check if first element is an object with `items` (sectioned)
  if (typeof recipe.ingredients[0] === 'object' && recipe.ingredients[0].items) {
    ingList.innerHTML = recipe.ingredients.map(section => {
      const title = escapeHtml(section.section || '');
      const items = (section.items || []).map(i => `<li>${escapeHtml(i)}</li>`).join('');
      return `<div class="ingredients-section">${title ? `<h4>${title}</h4>` : ''}<ul class="green-bullets">${items}</ul></div>`;
    }).join('');
  } else {
    // Plain array of strings
    const items = recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('');
    ingList.innerHTML = `<ul class="green-bullets">${items}</ul>`;
  }
} else {
  ingList.innerHTML = '<li>No ingredients listed</li>';
}

  // Method
  const methodList = document.getElementById('method-list');
  if (recipe.method?.length) methodList.innerHTML = recipe.method.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  else methodList.innerHTML = '<li>No instructions available</li>';

  // Nutrition
  const nutritionDiv = document.getElementById('nutrition');
  nutritionDiv.innerHTML = formatNutrition(recipe.nutritional_info);

  // Categories & Cuisine
  const catDiv = document.getElementById('category');
  if (recipe.category) catDiv.innerHTML = Array.isArray(recipe.category) ? recipe.category.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('') : `<span class="tag">${escapeHtml(recipe.category)}</span>`;

  const cuisineDiv = document.getElementById('cuisine');
  if (recipe.cuisine) cuisineDiv.innerHTML = Array.isArray(recipe.cuisine) ? recipe.cuisine.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('') : `<span class="tag">${escapeHtml(recipe.cuisine)}</span>`;

  // Tags
  document.getElementById('tags').innerHTML = formatTags(recipe.tags);

  // Notes & Facts
  document.getElementById('notes').innerText = recipe.notes || 'No additional notes.';
  document.getElementById('facts').innerText = recipe.facts || 'Did you know? This recipe is made with love!';

  // Video
  if (recipe.video_url) {
    const vidSection = document.getElementById('video-section');
    const vidContainer = document.getElementById('video-container');
    const videoId = extractYouTubeId(recipe.video_url);
    if (videoId) {
      vidSection.style.display = 'block';
      vidContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1" allowfullscreen></iframe>`;
    }
  }

  // Page title
  document.title = `${recipe.title} | Simit Cooks`;
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
    const cat = Array.isArray(r.category) ? r.category[0] : r.category || '';
    return `<div class="recipe-card" onclick="window.location.href='/recipe/${r.slug}'">
      <div class="thumbnail-wrapper"><img src="${thumb}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'"></div>
      <div class="card-body"><h4>${escapeHtml(title)}</h4><p>${escapeHtml(desc.substring(0,80))}${desc.length>80?'...':''}</p>${cat?`<span class="recipe-category">${escapeHtml(cat)}</span>`:''}</div>
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

  // Increment views
  await supabase.from('recipe_db').update({ views: (recipe.views || 0) + 1 }).eq('slug', slug);
}

init();

// Debugging
window.recipeDebug = { supabase, getSlug, escapeHtml, extractYouTubeId, getRecipeThumbnail, renderRecipe };
