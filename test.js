import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


let allRecipes = [];

// Fetch from Supabase
async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  allRecipes = data;
  renderRecipes(allRecipes);
}

// Render
function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const thumb = getThumbnail(recipe.video_url);

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <div class="thumbnail-wrapper">
        ${thumb 
          ? `<img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />`
          : `<div class="no-video"></div>`}
      </div>
      <div class="recipe-content">
        <h3>${recipe.title}</h3>
        <p>${recipe.description || ''}</p>
        <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// Get YouTube thumbnail
function getThumbnail(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    if (filter === 'all') {
      renderRecipes(allRecipes);
    } else if (filter === 'video') {
      renderRecipes(allRecipes.filter(r => r.video_url));
    } else {
      renderRecipes(allRecipes.filter(r => r.tags?.includes(filter)));
    }
  });
});

// Init
fetchRecipes();
