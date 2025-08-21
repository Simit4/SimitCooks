import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


let recipesData = [];
let activeCategory = 'all';
let videoOnly = false;

async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  recipesData = data;
  renderRecipes();
}

function renderRecipes() {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  let filtered = recipesData;

  if (activeCategory !== 'all') {
    filtered = filtered.filter(r => r.tags?.includes(activeCategory));
  }

  if (videoOnly) {
    filtered = filtered.filter(r => r.video_url && r.video_url.trim() !== '');
  }

  if (!filtered.length) {
    container.innerHTML = `<p style="text-align:center;color:#888;">No recipes found.</p>`;
    return;
  }

  filtered.forEach(recipe => {
    const hasVideo = recipe.video_url && recipe.video_url.trim() !== '';
    const thumb = hasVideo
      ? getThumbnail(recipe.video_url)
      : 'assets/momo-graphic.png'; // High-quality image or emoji graphic

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />
        ${hasVideo ? '<div class="play-icon">&#9658;</div>' : ''}
      </div>
      <div class="recipe-content">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
        <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : 'assets/default-thumbnail.jpg';
}

// Category filter
document.querySelectorAll('.category-filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    activeCategory = btn.dataset.category;
    document.querySelectorAll('.category-filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderRecipes();
  });
});

// Video filter
document.getElementById('video-filter').addEventListener('click', () => {
  videoOnly = !videoOnly;
  document.getElementById('video-filter').classList.toggle('active', videoOnly);
  renderRecipes();
});

// Search
document.getElementById('search-input').addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  recipesData.forEach(r => r.visible = r.title.toLowerCase().includes(term));
  renderRecipes();
});

fetchRecipes();
