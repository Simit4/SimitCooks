import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Initialize Supabase
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);


// Convert YouTube URL to embed URL
function convertToEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

// Fetch recipe data
async function fetchAndRenderRecipe() {
  let slug;
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  slug = (pathParts[0] === 'recipe' && pathParts[1]) ? pathParts[1] : new URLSearchParams(window.location.search).get('slug');

  if (!slug) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    return;
  }

  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    document.getElementById('recipe-title').innerText = 'Recipe not found';
    return;
  }

  // Update views
  if (recipe.id) {
    await supabase.from('recipe_db').update({ views: (recipe.views || 0) + 1 }).eq('id', recipe.id);
  }

  renderRecipe(recipe);
}

// Render recipe details
function renderRecipe(recipe) {
  document.getElementById('recipe-title').innerText = recipe.title;
  document.getElementById('recipe-description').innerText = recipe.description;
  document.getElementById('prep-time').innerText = recipe.prep_time;
  document.getElementById('cook-time').innerText = recipe.cook_time;
  document.getElementById('servings').innerText = recipe.servings;

  // Ingredients
  const ingredientsList = document.getElementById('ingredients-list');
  ingredientsList.innerHTML = '';
  recipe.ingredients?.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  // Method
  const methodList = document.getElementById('method-list');
  methodList.innerHTML = '';
  recipe.method?.forEach(step => {
    const li = document.createElement('li');
    li.textContent = step;
    methodList.appendChild(li);
  });

  // Nutrition
  const nutrition = recipe.nutritional_info;
  if (nutrition) {
    document.getElementById('nutrition').innerHTML = `
      <strong>Calories:</strong> ${nutrition.calories}<br>
      <strong>Protein:</strong> ${nutrition.protein}<br>
      <strong>Carbohydrates:</strong> ${nutrition.carbohydrates}<br>
      <strong>Fiber:</strong> ${nutrition.fiber}<br>
      <strong>Fat:</strong> ${nutrition.fat}
    `;
  }

  // Tags, Cuisine, Category
  document.getElementById('tags').textContent = recipe.tags?.join(', ') || 'Not available';
  document.getElementById('cuisine').textContent = recipe.cuisine?.join(', ') || 'Not available';
  document.getElementById('category').textContent = recipe.category?.join(', ') || 'Not available';

  // Notes & Fun Facts
  document.getElementById('notes').textContent = recipe.notes || 'No additional notes available.';
  document.getElementById('facts').textContent = recipe.facts || 'No fun facts found.';

  // Video: only show if valid URL
  const embedUrl = convertToEmbedUrl(recipe.video_url);
  const videoContainer = document.querySelector('.recipe-video');
  if (embedUrl) {
    videoContainer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
    videoContainer.style.display = 'block';
  } else {
    videoContainer.style.display = 'none';
  }

  // Equipment
  if (recipe.equipment_ids?.length) {
    fetchEquipmentByIds(recipe.equipment_ids.map(Number));
  }
}

// Fetch and render equipment by IDs
async function fetchEquipmentByIds(ids) {
  const { data, error } = await supabase
    .from('equipment_db')
    .select('*')
    .in('id', ids);

  const container = document.getElementById('equipment-container');
  container.innerHTML = '';

  if (error || !data?.length) {
    container.innerHTML = '<p>No equipment found.</p>';
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'equipment-card fade-in';
    const shortDesc = item.description ? item.description.split('. ')[0] + '.' : '';
    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${item.image_url}" alt="${item.name}">
        <div class="overlay">
          ${shortDesc ? `<p>${shortDesc}</p>` : ''}
          ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" class="btn-buy">Buy Now</a>` : ''}
        </div>
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
      </div>
    `;
    container.appendChild(card);
  });

  // Optional: match heights for uniform grid
  matchCardHeights();
}

// Match card heights for grid consistency
function matchCardHeights() {
  const cards = document.querySelectorAll('.equipment-card');
  let maxHeight = 0;
  cards.forEach(card => {
    card.style.height = 'auto';
    if (card.offsetHeight > maxHeight) maxHeight = card.offsetHeight;
  });
  cards.forEach(card => card.style.height = maxHeight + 'px');
}

// Add fade-in CSS dynamically
const style = document.createElement('style');
style.innerHTML = `
.fade-in { opacity:0; transform:translateY(20px); animation: fadeInUp 0.6s forwards; }
@keyframes fadeInUp { to { opacity:1; transform:translateY(0); } }
.equipment-card { margin:1rem; border-radius:12px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.08); transition: transform 0.3s ease; }
.equipment-card:hover { transform: translateY(-5px); box-shadow:0 12px 32px rgba(0,0,0,0.15); }
.image-wrapper { position:relative; width:100%; height:250px; overflow:hidden; }
.image-wrapper img { width:100%; height:100%; object-fit:contain; display:block; }
.overlay { position:absolute; bottom:0; left:0; width:100%; background:rgba(255,255,255,0.9); padding:0.8rem; display:flex; justify-content:space-between; align-items:center; }
.overlay p { margin:0; font-size:0.9rem; color:#333; flex:1; }
.btn-buy { background:var(--primary); color:#fff; padding:0.5rem 1rem; border-radius:8px; text-decoration:none; font-weight:600; margin-left:0.5rem; transition:background 0.3s ease; }
.btn-buy:hover { background:var(--primary-dark); }
.card-body { padding:0.8rem 0.5rem; text-align:center; }
.card-body h3 { margin:0; font-size:1rem; color:var(--primary-dark); }
`;
document.head.appendChild(style);

// Initialize
fetchAndRenderRecipe();
