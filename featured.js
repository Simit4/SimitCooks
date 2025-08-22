import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


async function fetchFeaturedRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('views', { ascending: false })
    .limit(3);

  if (error) return console.error('Error fetching featured recipes:', error.message);

  renderFeaturedRecipes(data);
}

function renderFeaturedRecipes(recipes) {
  const container = document.getElementById('featured-container');
  container.innerHTML = '';

  recipes.forEach(recipe => {
    const thumb = recipe.thumbnail_url || getVideoThumbnail(recipe.video_url) || 'https://i.ibb.co/4p4mR3N/momo-graphic.png';

    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.onclick = () => window.location.href = `/recipe/${recipe.slug}`;
    card.innerHTML = `
      <div class="thumbnail-wrapper">
        <img src="${thumb}" alt="${recipe.title}" />
      </div>
      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p>${recipe.description || ''}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

function getVideoThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

fetchFeaturedRecipes();
