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
    return;
  }

  renderRecipes(data);
}

// --- Render recipes ---
function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    // Check if recipe has a valid video
    const hasVideo = recipe.video_url && recipe.video_url.trim() !== '';
    const thumb = hasVideo ? getThumbnail(recipe.video_url) : 'assets/default-thumbnail.jpg';

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.category = recipe.tags ? recipe.tags.toLowerCase() : '';
    card.dataset.hasVideo = hasVideo ? 'yes' : 'no';

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />
        ${hasVideo ? '<div class="play-icon">▶</div>' : ''}
      </div>
      <h3>${recipe.title}</h3>
      <p>${recipe.description || ''}</p>
      <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
    `;

    container.appendChild(card);
  });
}

// --- Extract YouTube thumbnail ---
function getThumbnail(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : 'assets/default-thumbnail.jpg';
}

// --- Filter functionality ---
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const cards = document.querySelectorAll('.recipe-card');

    cards.forEach(card => {
      if (filter === 'all') {
        card.style.display = 'flex';
      } else if (filter === 'video') {
        card.style.display = card.dataset.hasVideo === 'yes' ? 'flex' : 'none';
      } else {
        // Filter by tag/category
        card.style.display = card.dataset.category.includes(filter) ? 'flex' : 'none';
      }
    });
  });
});

// --- Search functionality ---
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.recipe-card');

  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase();
    const match = title.includes(term);
    card.style.display = match ? 'flex' : 'none';
  });
});

// --- Initialize ---
fetchRecipes();
