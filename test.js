import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Fetch recipes ---
async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    document.getElementById('recipes-container').innerHTML =
      `<p class="error-message">Failed to load recipes.</p>`;
    return;
  }

  renderRecipes(data);
}

// --- Render recipe cards ---
function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const thumb = getThumbnail(recipe.video_url);

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.category = recipe.category || 'all'; // for filter
    card.innerHTML = `
      <div class="recipe-image">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />
        <div class="play-icon">▶</div>
      </div>
      <h3>${recipe.title}</h3>
      <p>${recipe.description || ''}</p>
      <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
    `;
    container.appendChild(card);
  });
}

// --- Get thumbnail from YouTube URL ---
function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : 'assets/default-thumbnail.jpg';
}

// --- Search recipes ---
document.getElementById('search-input')?.addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('.recipe-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase();
    card.style.display = title.includes(term) ? 'block' : 'none';
  });
});

// --- Filter buttons ---
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const category = btn.dataset.filter;
    document.querySelectorAll('.recipe-card').forEach(card => {
      card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
    });
  });
});

// --- Init ---
fetchRecipes();

