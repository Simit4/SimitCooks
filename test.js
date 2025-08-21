import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


async function fetchRecipes() {
  const { data: recipes, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  renderRecipes(recipes);
}

function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    // Only set thumbnail if recipe has a valid video URL
    const thumb = recipe.video_url && recipe.video_url.trim() !== ''
      ? getThumbnail(recipe.video_url)
      : '';

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.tags = recipe.tags || '';
    card.dataset.video = recipe.video_url || '';

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        ${thumb ? `<img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />` : `<div class="no-thumb">No Video</div>`}
      </div>
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>
      <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
    `;
    container.appendChild(card);
  });
}

function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterRecipes(btn.dataset.filter);
  });
});

function filterRecipes(category) {
  const cards = document.querySelectorAll('.recipe-card');
  cards.forEach(card => {
    const tags = card.dataset.tags.split(',');
    const videoUrl = card.dataset.video;
    const hasVideo = videoUrl && videoUrl !== 'null' && videoUrl !== 'undefined' && videoUrl.trim() !== '';

    if (category === 'all') card.style.display = 'block';
    else if (category === 'video') card.style.display = hasVideo ? 'block' : 'none';
    else card.style.display = tags.includes(category) ? 'block' : 'none';
  });
}

// Search functionality
document.getElementById('search-input')?.addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.recipe-card');
  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase();
    card.style.display = title.includes(term) ? 'block' : 'none';
  });
});

fetchRecipes();
