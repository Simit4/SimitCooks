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

// Render cards
function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const hasVideo = recipe.video_url && recipe.video_url.trim() !== "";
    const thumb = hasVideo ? getThumbnail(recipe.video_url) : "assets/momo-graphic.png"; // high-quality placeholder

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('data-tags', recipe.tags || '');
    card.setAttribute('data-video', hasVideo);

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb"/>
      </div>
      <div class="recipe-info">
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
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : "assets/momo-graphic.png"; // fallback
}

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    let filtered = [...allRecipes];

    if (filter === 'video') {
      filtered = filtered.filter(r => r.video_url && r.video_url.trim() !== "");
    } else if (filter !== 'all') {
      filtered = filtered.filter(r => (r.tags || "").toLowerCase().includes(filter));
    }

    renderRecipes(filtered);

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Search
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allRecipes.filter(r => r.title.toLowerCase().includes(term));
  renderRecipes(filtered);
});

fetchRecipes();
