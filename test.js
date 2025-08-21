import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('recipes-container');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');

let allRecipes = [];

// Fetch recipes
async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .order('title', { ascending: true });

  if (error) {
    console.error(error);
    container.innerHTML = '<p>Failed to load recipes.</p>';
    return;
  }

  allRecipes = data;
  displayRecipes(allRecipes);
}

// Generate recipe cards
function displayRecipes(recipes) {
  if (!recipes.length) {
    container.innerHTML = '<p>No recipes found.</p>';
    return;
  }

  container.innerHTML = recipes
    .map(recipe => {
      const hasVideo = recipe.video ? true : false;
      const thumbnail = hasVideo
        ? `https://img.youtube.com/vi/${extractYouTubeID(recipe.video)}/hqdefault.jpg`
        : recipe.photo || 'placeholder.jpg';

      return `
      <div class="recipe-card" data-tags="${recipe.tags ? recipe.tags.join(',') : ''}" data-video="${hasVideo ? 'video' : 'text'}">
        <a href="/recipe/${recipe.slug}/">
          <div class="recipe-image">
            <img src="${thumbnail}" alt="${recipe.title}" />
            ${hasVideo ? '<span class="play-icon"><i class="fas fa-play"></i></span>' : ''}
          </div>
          <h3>${recipe.title}</h3>
        </a>
      </div>
      `;
    })
    .join('');
}

// Extract YouTube video ID
function extractYouTubeID(url) {
  const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?]+)/;
  const match = url.match(regExp);
  return match ? match[1] : '';
}

// Filter recipes
function filterRecipes(filter) {
  let filtered = allRecipes;

  if (filter === 'video') filtered = allRecipes.filter(r => r.video);
  else if (filter === 'text') filtered = allRecipes.filter(r => !r.video);
  else if (filter !== 'all') filtered = allRecipes.filter(r => r.tags && r.tags.includes(filter));

  displayRecipes(filtered);
}

// Filter button click
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    filterRecipes(btn.dataset.filter);
  });
});

// Search input
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allRecipes.filter(r => r.title.toLowerCase().includes(query));
  displayRecipes(filtered);
});

// Initial fetch
fetchRecipes();

