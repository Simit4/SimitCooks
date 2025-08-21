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
    const thumb = hasVideo ? getThumbnail(recipe.video_url) : getPlaceholder(recipe.slug);

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.hasVideo = hasVideo;
    card.dataset.category = recipe.category;

    card.addEventListener('click', () => {
      window.location.href = `/recipe/${recipe.slug}`;
    });

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" class="recipe-thumb" />
      </div>
      <h3>${recipe.title}</h3>
    `;
    container.appendChild(card);
  });

  setupFilters();
  setupSearch();
}

function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : '';
}

function getPlaceholder(slug) {
  const emojiMap = {
    momo: '🥟',
    default: '🍲'
  };
  const emoji = emojiMap[slug.toLowerCase()] || emojiMap.default;

  const canvas = document.createElement('canvas');
  canvas.width = 500;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  grad.addColorStop(0,'#ffe3b3');
  grad.addColorStop(1,'#ffd27f');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.font = '180px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, canvas.width/2, canvas.height/2);

  return canvas.toDataURL();
}

function setupFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      filterRecipes(filter);
    });
  });
}

function filterRecipes(filter) {
  const cards = document.querySelectorAll('.recipe-card');
  cards.forEach(card => {
    const hasVideo = card.dataset.hasVideo === 'true';
    const category = card.dataset.category;

    if (filter === 'all') card.style.display = 'block';
    else if (filter === 'video') card.style.display = hasVideo ? 'block' : 'none';
    else card.style.display = category === filter ? 'block' : 'none';
  });
}

function setupSearch() {
  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.recipe-card');
    cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      card.style.display = title.includes(term) ? 'block' : 'none';
    });
  });
}

fetchRecipes();
