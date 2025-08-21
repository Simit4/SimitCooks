import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


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
    const thumb = hasVideo ? getThumbnail(recipe.video_url) : createDynamicPlaceholder(recipe);

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.hasVideo = hasVideo;
    card.dataset.tags = recipe.tags?.join(',') || '';
    card.addEventListener('click', () => window.location.href = `/recipe/${recipe.slug}`);

    card.innerHTML = `
      <div class="thumbnail-wrapper">${thumb}</div>
      <h3>${recipe.title}</h3>
    `;

    container.appendChild(card);
  });

  setupFilters();
  setupSearch();
}

function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `<img src="https://img.youtube.com/vi/${match[1]}/hqdefault.jpg" alt="video">` : '';
}

// Dynamic placeholder for recipes without video
function createDynamicPlaceholder(recipe) {
  const emoji = recipe.slug.toLowerCase() === 'momo' ? '🥟' : '🍲';
  const colors = ['#FFB347', '#FFCC33', '#FFA07A', '#F4A261'];
  const gradient = `linear-gradient(135deg, ${colors[Math.floor(Math.random()*colors.length)]}, #fff)`;
  return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:80px;background:${gradient};">${emoji}</div>`;
}

// Filters
function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterRecipes(btn.dataset.filter);
    });
  });
}

function filterRecipes(filter) {
  const cards = document.querySelectorAll('.recipe-card');
  cards.forEach(card => {
    const hasVideo = card.dataset.hasVideo === 'true';
    const tags = card.dataset.tags.split(',');
    if (filter === 'all') card.style.display = 'block';
    else if (filter === 'video') card.style.display = hasVideo ? 'block' : 'none';
    else card.style.display = tags.includes(filter) ? 'block' : 'none';
  });
}

// Search
function setupSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.recipe-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(term) ? 'block' : 'none';
    });
  });
}

fetchRecipes();
