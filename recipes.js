
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon/public key
const supabase = createClient(supabaseUrl, supabaseKey);


import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ------------------ Supabase Setup ------------------
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------ Helpers ------------------

// Get full-size YouTube thumbnail
function getThumbnail(url) {
  const match = url?.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : '';
}

// Fallback Momo placeholder image
function momoPlaceholder(recipe) {
  const imageUrl = recipe.thumbnail_url || 'https://i.ibb.co/4p4mR3N/momo-graphic.png';
  return `<img src="${imageUrl}" alt="${recipe.title || 'Momo Placeholder'}" class="recipe-thumb">`;
}

// ------------------ Fetch Recipes ------------------
async function fetchRecipes() {
  try {
    const { data: recipes, error } = await supabase
      .from('recipe_db')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Fetched recipes:', recipes); // Debug
    renderRecipes(recipes);
  } catch (err) {
    console.error('Error fetching recipes:', err.message);
  }
}

// ------------------ Render Recipes ------------------
function renderRecipes(recipes) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();

  recipes.forEach(recipe => {
    const hasVideo = !!recipe.video_url;

    // Determine thumbnail
    const thumbHtml = recipe.thumbnail_url
      ? `<img src="${recipe.thumbnail_url}" alt="${recipe.title}" class="recipe-thumb">`
      : hasVideo
        ? `<img src="${getThumbnail(recipe.video_url)}" alt="${recipe.title}" class="recipe-thumb">`
        : momoPlaceholder(recipe);

    // Create recipe card
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.dataset.hasVideo = hasVideo.toString();
    card.dataset.tags = Array.isArray(recipe.tags) ? recipe.tags.join(',') : '';
    card.dataset.category = recipe.category || 'uncategorized';
    card.onclick = () => window.location.href = `/recipe/${recipe.slug}`;

    card.innerHTML = `
      <div class="thumbnail-wrapper">${thumbHtml}</div>
      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p>${recipe.description || ''}</p>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);

  setupFilters();
  setupSearch();
}

// ------------------ Filters ------------------
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category || 'all';
      const tag = btn.dataset.tag || 'all';
      filterRecipes(category, tag);
    };
  });
}

function filterRecipes(category = 'all', tag = 'all') {
  document.querySelectorAll('.recipe-card').forEach(card => {
    const cardCategory = card.dataset.category || '';
    const cardTags = card.dataset.tags ? card.dataset.tags.split(',') : [];

    const categoryMatch = category === 'all' || cardCategory === category;
    const tagMatch = tag === 'all' 
      ? true 
      : tag === 'video'
        ? card.dataset.hasVideo === 'true'
        : cardTags.includes(tag);

    card.style.display = (categoryMatch && tagMatch) ? 'block' : 'none';
  });
}

// ------------------ Search ------------------
function setupSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;

  input.oninput = e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.recipe-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
      card.style.display = (title + ' ' + desc).includes(term) ? 'block' : 'none';
    });
  };
}

// ------------------ Initialize ------------------
fetchRecipes();

