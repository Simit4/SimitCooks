import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


const container = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filters button');

let recipesData = [];
let currentFilter = 'all';

// Fetch recipes from Supabase
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

// Render recipes
function renderRecipes() {
  container.innerHTML = '';

  let filtered = recipesData;

  // Apply filter
  if (currentFilter !== 'all') {
    if (currentFilter === 'video') {
      filtered = filtered.filter(r => r.video_url && r.video_url.trim() !== '');
    } else {
      filtered = filtered.filter(r => r.tags?.includes(currentFilter));
    }
  }

  // Apply search
  const term = searchInput.value.toLowerCase();
  filtered = filtered.filter(r => r.title.toLowerCase().includes(term));

  filtered.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';

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
      placeholder.textContent = '🥟';
      thumbWrapper.appendChild(placeholder);
    }

    const info = document.createElement('div');
    info.className = 'recipe-info';
    info.innerHTML = `
      <h3>${recipe.title}</h3>
      <p>${recipe.description || ''}</p>
      <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
    `;

    card.appendChild(thumbWrapper);
    card.appendChild(info);
    container.appendChild(card);
  });
}

// Get YouTube thumbnail
function getYoutubeThumbnail(url) {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
}

// Search event
searchInput.addEventListener('input', renderRecipes);

// Filter buttons
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderRecipes();
  });
});

// Initial fetch
fetchRecipes();
