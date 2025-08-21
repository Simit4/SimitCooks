import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


// Fetch all recipes
async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  renderRecipes(data);
}

function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    // Determine if recipe has a video
    const hasVideo = recipe.video_url && recipe.video_url.trim() !== '';
    const thumb = hasVideo
      ? getThumbnail(recipe.video_url)
      : 'assets/default-thumbnail.jpg';

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.tags = recipe.tags ? recipe.tags.join(',') : '';
    card.dataset.video = hasVideo ? 'yes' : 'no';

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />
        ${hasVideo ? '<span class="play-icon">▶</span>' : ''}
      </div>
      <h3>${recipe.title}</h3>
      <p>${recipe.description || ''}</p>
      <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
    `;
    container.appendChild(card);
  });

  setupFilters();
}

// YouTube thumbnail extractor
function getThumbnail(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : 'assets/default-thumbnail.jpg';
}

// -------------------- Filters --------------------
function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('search-input');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilter();
    });
  });

  searchInput?.addEventListener('input', applyFilter);
}

function applyFilter() {
  const term = document.getElementById('search-input').value.toLowerCase();
  const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
  const cards = document.querySelectorAll('.recipe-card');

  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase();
    const tags = card.dataset.tags.toLowerCase();
    const hasVideo = card.dataset.video === 'yes';

    let show = title.includes(term);

    if (activeFilter === 'video') {
      show = show && hasVideo;
    } else if (activeFilter !== 'all') {
      show = show && tags.includes(activeFilter);
    }

    card.style.display = show ? 'block' : 'none';
  });
}

// -------------------- Init --------------------
fetchRecipes();
