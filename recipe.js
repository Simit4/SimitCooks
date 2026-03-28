import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';

function getSlug() {
  const path = window.location.pathname.split('/').filter(Boolean);
  return path[1] || new URLSearchParams(window.location.search).get('slug');
}

function formatNutrition(nutrition) {
  if (!nutrition) return '';
  
  const items = [];
  if (nutrition.calories) items.push({ label: 'Calories', value: nutrition.calories });
  if (nutrition.protein) items.push({ label: 'Protein', value: nutrition.protein });
  if (nutrition.carbs) items.push({ label: 'Carbs', value: nutrition.carbs });
  if (nutrition.fat) items.push({ label: 'Fat', value: nutrition.fat });
  if (nutrition.fiber) items.push({ label: 'Fiber', value: nutrition.fiber });
  
  return items.map(item => `
    <div class="nutrition-item">
      <div class="nutrition-value">${item.value}</div>
      <div class="nutrition-label">${item.label}</div>
    </div>
  `).join('');
}

function formatTags(tags) {
  if (!tags || !Array.isArray(tags) || tags.length === 0) return '<span class="tag">No tags</span>';
  return tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderRecipe(recipe) {
  if (!recipe) return;

  // Update hero section
  document.getElementById('recipe-title').innerText = recipe.title || 'Untitled Recipe';
  document.getElementById('recipe-description').innerText = recipe.description || 'Delicious home-style recipe made with love.';
  document.getElementById('prep-time').innerText = recipe.prep_time || 'N/A';
  document.getElementById('cook-time').innerText = recipe.cook_time || 'N/A';
  document.getElementById('servings').innerText = recipe.servings || 'N/A';

  // Ingredients
  const ingredients = document.getElementById('ingredients-list');
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    ingredients.innerHTML = recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('');
  } else {
    ingredients.innerHTML = '<li>No ingredients listed</li>';
  }

  // Method
  const method = document.getElementById('method-list');
  if (recipe.method && Array.isArray(recipe.method)) {
    method.innerHTML = recipe.method.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  } else {
    method.innerHTML = '<li>No instructions available</li>';
  }

  // Nutrition
  const nutritionDiv = document.getElementById('nutrition');
  nutritionDiv.innerHTML = formatNutrition(recipe.nutrition) || '<div class="nutrition-item"><div class="nutrition-value">N/A</div><div class="nutrition-label">Info coming soon</div></div>';

  // Categories, Cuisine, Tags
  if (recipe.category && Array.isArray(recipe.category)) {
    document.getElementById('category').innerHTML = recipe.category.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('');
  } else if (recipe.category) {
    document.getElementById('category').innerHTML = `<span class="tag">${escapeHtml(recipe.category)}</span>`;
  }

  if (recipe.cuisine && Array.isArray(recipe.cuisine)) {
    document.getElementById('cuisine').innerHTML = recipe.cuisine.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('');
  } else if (recipe.cuisine) {
    document.getElementById('cuisine').innerHTML = `<span class="tag">${escapeHtml(recipe.cuisine)}</span>`;
  }

  document.getElementById('tags').innerHTML = formatTags(recipe.tags);
  document.getElementById('notes').innerText = recipe.notes || 'No additional notes.';
  document.getElementById('facts').innerText = recipe.facts || 'Did you know? This recipe is made with love!';

  // Video - Separate section
  if (recipe.video_url) {
    const videoSection = document.getElementById('video-section');
    const videoContainer = document.getElementById('video-container');
    const videoId = extractYouTubeId(recipe.video_url);
    
    if (videoId) {
      videoSection.style.display = 'block';
      videoContainer.innerHTML = `
        <iframe 
          src="https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      `;
    } else {
      videoSection.style.display = 'none';
    }
  }

  // Update page title and meta for SEO
  document.title = `${recipe.title} | Simit Cooks`;
  updateMetaTags(recipe);
}

function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  
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

function updateMetaTags(recipe) {
  // Update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', recipe.description || 'Delicious home-style recipe from Simit Cooks');
  }
  
  // Update OG title
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', `${recipe.title} | Simit Cooks`);
  }
  
  // Update OG description
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', recipe.description || 'Try this delicious recipe from Simit Cooks');
  }
}

async function fetchMoreRecipes(currentSlug) {
  const { data: recipes, error } = await supabase
    .from('recipe_db')
    .select('title, slug, thumbnail_url, video_url, prep_time, category')
    .neq('slug', currentSlug)
    .limit(6);

  const grid = document.getElementById('more-recipes-grid');
  
  if (!recipes || recipes.length === 0) {
    grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">More recipes coming soon!</p>';
    return;
  }
  
  grid.innerHTML = recipes.map(recipe => {
    const thumbnail = recipe.thumbnail_url || getVideoThumbnail(recipe.video_url) || FALLBACK_IMAGE;
    const category = recipe.category && Array.isArray(recipe.category) ? recipe.category[0] : 'Recipe';
    
    return `
      <div class="recipe-card-modern" onclick="window.location.href='/recipe/${recipe.slug}'">
        <div class="card-image">
          <img src="${thumbnail}" alt="${escapeHtml(recipe.title)}" loading="lazy">
          <div class="card-overlay">
            <span class="quick-view">Quick View →</span>
          </div>
        </div>
        <div class="card-content">
          <h4>${escapeHtml(recipe.title)}</h4>
          <div class="card-meta">
            <span><i class="fas fa-tag"></i> ${escapeHtml(category)}</span>
            ${recipe.prep_time ? `<span><i class="fas fa-clock"></i> ${recipe.prep_time}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function getVideoThumbnail(videoUrl) {
  const videoId = extractYouTubeId(videoUrl);
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

// Initialize
async function init() {
  const slug = getSlug();
  
  if (!slug) {
    console.error('No recipe slug found');
    return;
  }
  
  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error || !recipe) {
    console.error('Recipe not found:', error);
    document.getElementById('recipe-title').innerText = 'Recipe Not Found';
    return;
  }
  
  renderRecipe(recipe);
  fetchMoreRecipes(slug);
  
  // Increment view count (optional)
  await supabase
    .from('recipe_db')
    .update({ views: (recipe.views || 0) + 1 })
    .eq('slug', slug);
}

init();
