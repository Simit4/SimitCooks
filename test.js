import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


const container = document.getElementById('recipes-container');
let allRecipes = [];

async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    container.innerHTML = `<p style="text-align:center;color:red;">Error loading recipes</p>`;
    return;
  }

  allRecipes = data;
  renderRecipes(allRecipes);
}

function renderRecipes(recipes) {
  container.innerHTML = '';
  
  recipes.forEach(recipe => {
    const hasVideo = recipe.video_url && recipe.video_url.trim() !== '';
    const thumbHtml = hasVideo
      ? `<img src="${getThumbnail(recipe.video_url)}" alt="${recipe.title}" class="recipe-thumb" />
         <div class="play-icon">&#9658;</div>`
      : `<div class="no-video">🥟</div>`; // emoji for no video

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.tags = recipe.tags ? recipe.tags.join(',') : '';

    card.innerHTML = `
      <div class="thumbnail-wrapper">
        ${thumbHtml}
      </div>
      <div class="recipe-content">
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
        <a href="/recipe/${recipe.slug}" class="view-btn">View Recipe</a>
      </div>
    `;
    container.appendChild(card);
  });
}

function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : 'assets/default-thumbnail.jpg';
}

// FILTER BUTTONS
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    let filtered = allRecipes;

    if (filter === 'video') {
      filtered = allRecipes.filter(r => r.video_url && r.video_url.trim() !== '');
    } else if (filter !== 'all') {
      filtered = allRecipes.filter(r => r.tags && r.tags.includes(filter));
    }

    renderRecipes(filtered);
  });
});

// SEARCH INPUT
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allRecipes.filter(r => r.title.toLowerCase().includes(term));
  renderRecipes(filtered);
});

fetchRecipes();
