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

  recipesData = data || [];
  renderRecipes();
}

function renderRecipes() {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  let filtered = recipesData;

  // Category filter
  if (activeCategory !== 'all') {
    filtered = filtered.filter(recipe => recipe.tags?.includes(activeCategory));
  }

  // Video filter
  if (videoOnly) {
    filtered = filtered.filter(recipe => recipe.video_url && recipe.video_url.trim() !== '');
  }

  if (filtered.length === 0) {
    container.innerHTML = `<p style="text-align:center;color:#888;">No recipes found.</p>`;
    return;
  }

  filtered.forEach(recipe => {
    const hasVideo = recipe.video_url && recipe.video_url.trim() !== '';
    const thumb = hasVideo ? getThumbnail(recipe.video_url) : 'assets/no-video.png';

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb ${hasVideo ? '' : 'no-video'}" />
        ${hasVideo ? '<div class="play-icon">&#9658;</div>' : ''}
      </div>
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>
      <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
    `;
    container.appendChild(card);
  });
}

// Get YouTube thumbnail
function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : 'assets/no-video.png';
}

// Category buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategory = btn.dataset.category;
    videoOnly = btn.dataset.video === 'true';
    renderRecipes();
  });
});

// Search
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('.recipe-card').forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase();
    card.style.display = title.includes(term) ? 'block' : 'none';
  });
});

fetchRecipes();
