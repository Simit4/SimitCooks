import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


let allRecipes = [];

async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    return;
  }

  allRecipes = data;
  renderRecipes(allRecipes);
}

function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const thumb = recipe.video_url ? getThumbnail(recipe.video_url) : getGraphic(recipe.tags);

    const card = document.createElement('div');
    card.className = 'recipe-card';
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

function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match
    ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`
    : null;
}

function getGraphic(tags) {
  tags = (tags || []).map(t => t.toLowerCase());
  if (tags.includes('momo') || tags.includes('dumpling')) return "https://i.ibb.co/z5JhfyV/momo.png";
  if (tags.includes('curry')) return "https://i.ibb.co/bBvhc3p/curry.png";
  if (tags.includes('dessert')) return "https://i.ibb.co/sP3HLjC/dessert.png";
  return "https://i.ibb.co/FxXW8gL/placeholder-food.png";
}

/* -------- Search -------- */
document.getElementById('search-input')?.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = allRecipes.filter(r => r.title.toLowerCase().includes(term));
  renderRecipes(filtered);
});

/* -------- Filters -------- */
document.querySelectorAll('.filters button').forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    let filtered = allRecipes;
    if (filter !== 'all') {
      if (filter === 'video') {
        filtered = allRecipes.filter(r => r.video_url);
      } else {
        filtered = allRecipes.filter(r => (r.tags || []).map(t => t.toLowerCase()).includes(filter));
      }
    }

    renderRecipes(filtered);
  });
});

fetchRecipes();
