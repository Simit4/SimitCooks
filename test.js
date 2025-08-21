import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


const container = document.getElementById('recipes-container');
const filterButtons = document.querySelectorAll('.filters button');
const searchInput = document.getElementById('search-input');

let allRecipes = [];

async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return console.error('Error fetching recipes:', error);

  allRecipes = data;
  renderRecipes(allRecipes);
}

function renderRecipes(recipes) {
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.tags = recipe.tags ? recipe.tags.join(',') : '';
    card.dataset.hasVideo = recipe.video_url && recipe.video_url.trim() !== '' ? 'yes' : 'no';

    // Thumbnail or placeholder
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

      // Momo or general placeholder
      if (recipe.slug === 'momo') {
        placeholder.textContent = '🥟';
      } else {
        placeholder.textContent = '🍲';
      }

      thumbWrapper.appendChild(placeholder);
    }

    card.appendChild(thumbWrapper);

    const title = document.createElement('h3');
    title.textContent = recipe.title;
    card.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = recipe.description || '';
    card.appendChild(desc);

    const link = document.createElement('a');
    link.className = 'view-btn';
    link.href = `/recipe/${recipe.slug}`;
    link.textContent = 'View Recipe';
    card.appendChild(link);

    container.appendChild(card);
  });
}

function getYoutubeThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
}

// -------------------- Filters --------------------
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let filtered = [...allRecipes];

    if (filter === 'video') {
      filtered = filtered.filter(r => r.video_url && r.video_url.trim() !== '');
    } else if (filter !== 'all') {
      filtered = filtered.filter(r => r.tags?.includes(filter));
    }

    const term = searchInput.value.toLowerCase();
    if (term) filtered = filtered.filter(r => r.title.toLowerCase().includes(term));

    renderRecipes(filtered);
  });
});

// -------------------- Search --------------------
searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  let filtered = [...allRecipes];

  const activeFilter = document.querySelector('.filters button.active').dataset.filter;
  if (activeFilter === 'video') {
    filtered = filtered.filter(r => r.video_url && r.video_url.trim() !== '');
  } else if (activeFilter !== 'all') {
    filtered = filtered.filter(r => r.tags?.includes(activeFilter));
  }

  if (term) filtered = filtered.filter(r => r.title.toLowerCase().includes(term));

  renderRecipes(filtered);
});

fetchRecipes();
