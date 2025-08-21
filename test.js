import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);



const container = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');

let allRecipes = [];

// Fetch recipes from Supabase
async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    container.innerHTML = `<p style="color:red;">Failed to load recipes</p>`;
    return;
  }

  allRecipes = data;
  renderRecipes(allRecipes);
}

// Render recipes
function renderRecipes(recipes) {
  container.innerHTML = '';

  if (!recipes || recipes.length === 0) {
    container.innerHTML = '<p>No recipes found.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.category = recipe.tags?.join(',').toLowerCase() || '';
    card.dataset.hasVideo = recipe.video_url ? 'yes' : 'no';

    const thumbWrapper = document.createElement('div');
    thumbWrapper.className = 'thumbnail-wrapper';

    if (recipe.video_url && recipe.video_url.trim() !== '') {
      const img = document.createElement('img');
      img.src = getYoutubeThumbnail(recipe.video_url);
      img.alt = recipe.title;
      thumbWrapper.appendChild(img);
    } else {
      const placeholder = document.createElement('div');
      placeholder.className = 'placeholder-graphic';

      // Emoji based on recipe
      if (recipe.slug.toLowerCase().includes('momo')) placeholder.textContent = '🥟';
      else if (recipe.slug.toLowerCase().includes('curry')) placeholder.textContent = '🍛';
      else placeholder.textContent = '🍲';

      thumbWrapper.appendChild(placeholder);
    }

    const title = document.createElement('h3');
    title.textContent = recipe.title;

    const desc = document.createElement('p');
    desc.textContent = recipe.description || '';

    card.appendChild(thumbWrapper);
    card.appendChild(title);
    card.appendChild(desc);

    container.appendChild(card);
  });
}

// Get YouTube thumbnail
function getYoutubeThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
}

// Search functionality
searchInput?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allRecipes.filter(r =>
    r.title.toLowerCase().includes(term) ||
    (r.tags && r.tags.join(',').toLowerCase().includes(term))
  );
  renderRecipes(filtered);
});

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const type = btn.dataset.filter;
    let filtered = [...allRecipes];

    if (type === 'video') filtered = filtered.filter(r => r.video_url && r.video_url.trim() !== '');
    else if (type !== 'all') filtered = filtered.filter(r => r.tags?.map(t => t.toLowerCase()).includes(type));

    renderRecipes(filtered);

    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

fetchRecipes();
