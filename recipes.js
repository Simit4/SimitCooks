
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);



/* ------------------ Helpers ------------------ */
// Get full-size YouTube thumbnail
function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : '';
}

// Momo placeholder or fallback image
function momoPlaceholder(recipe) {
  const imageUrl = recipe.thumbnail_url || 'https://i.ibb.co/4p4mR3N/momo-graphic.png';
  return `
    <div class="momo-placeholder">
      <img src="${imageUrl}" alt="${recipe.title || 'Momo Placeholder'}" class="recipe-thumb">
    </div>
  `;
}

/* ------------------ Fetch Recipes ------------------ */
async function fetchRecipes() {
  try {
    const { data: recipes, error } = await supabase
      .from('recipe_db')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Fetched recipes:', recipes); // Debugging
    renderRecipes(recipes);
  } catch (err) {
    console.error('Error fetching recipes:', err.message);
  }
}

/* ------------------ Render Recipes ------------------ */
function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const hasVideo = !!recipe.video_url;

    // Determine which image to show
    const thumb = recipe.thumbnail_url
      ? `<img src="${recipe.thumbnail_url}" alt="${recipe.title}" class="recipe-thumb">`
      : hasVideo
        ? `<img src="${getThumbnail(recipe.video_url)}" alt="${recipe.title}" class="recipe-thumb">`
        : momoPlaceholder(recipe);

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.hasVideo = hasVideo;
    card.dataset.tags = recipe.tags?.join(',') || '';
    card.dataset.category = recipe.category?.join(',') || '';

    card.onclick = () => window.location.href = `/recipe/${recipe.slug}`;

    card.innerHTML = `
      ${thumb ? `<div class="thumbnail-wrapper">${thumb}</div>` : ''}
      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p>${recipe.description || ""}</p>
      </div>
    `;
    container.appendChild(card);
  });

  setupFilters();
  setupSearch();
}

/* ------------------ Filters ------------------ */
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterRecipes(btn.dataset.filter);
    };
  });
}

function filterRecipes(filter) {
  document.querySelectorAll('.recipe-card').forEach(card => {
    const hasVideo = card.dataset.hasVideo === 'true';
    const tags = card.dataset.tags.split(',');
    if (filter === 'all') card.style.display = 'block';
    else if (filter === 'video') card.style.display = hasVideo ? 'block' : 'none';
    else card.style.display = tags.includes(filter) ? 'block' : 'none';
  });
}

/* ------------------ Search ------------------ */
function setupSearch() {
  const input = document.getElementById('search-input');
  input.oninput = e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.recipe-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(term) ? 'block' : 'none';
    });
  };
}

/* ------------------ Initialize ------------------ */
fetchRecipes();
