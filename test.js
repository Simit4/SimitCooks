import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


// Fetch recipes
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
    const hasVideo = !!recipe.video_url;
    const thumb = hasVideo
      ? getThumbnail(recipe.video_url)
      : 'assets/fallback-momo.png'; // fallback graphic

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.setAttribute('data-tags', recipe.tags?.join(',') || '');
    card.setAttribute('data-video', hasVideo ? 'true' : 'false');

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />
      </div>
      <h3>${recipe.title}</h3>
      <p>${recipe.description || ''}</p>
      <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
    `;

    container.appendChild(card);
  });
}

// Get YouTube thumbnail
function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : 'assets/fallback-momo.png';
}

// Search
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.recipe-card');
  cards.forEach(card => {
    const title = card.querySelector('h3')?.textContent.toLowerCase();
    card.style.display = title.includes(term) ? 'block' : 'none';
  });
});

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');
    const cards = document.querySelectorAll('.recipe-card');

    cards.forEach(card => {
      const tags = card.getAttribute('data-tags').split(',');
      const hasVideo = card.getAttribute('data-video') === 'true';

      let show = true;

      if (filter === 'video') {
        show = hasVideo;
      } else if (filter !== 'all') {
        show = tags.includes(filter);
      }

      card.style.display = show ? 'block' : 'none';
    });
  });
});

fetchRecipes();
