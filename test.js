// recipes.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Supabase config ---
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


const container = document.getElementById('recipe-container');

// Get slug from URL
const urlParams = new URLSearchParams(window.location.search);
const slug = urlParams.get('slug');

async function fetchRecipe() {
  const { data, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    container.innerHTML = '<p>Recipe not found.</p>';
    return;
  }

  renderRecipe(data);
}

function renderRecipe(recipe) {
  const thumbnail = recipe.thumbnail_url || 'placeholder.jpg';
  const videoSection = recipe.video_url ? `
    <div class="video">
      <iframe width="100%" height="360" src="${recipe.video_url.replace("watch?v=", "embed/")}" frameborder="0" allowfullscreen></iframe>
    </div>` : '';

  container.innerHTML = `
    <h1>${recipe.title}</h1>
    <p class="description">${recipe.description || ''}</p>
    <img src="${thumbnail}" alt="${recipe.title}" class="recipe-thumbnail">
    ${videoSection}
    <div class="recipe-details">
      <p><strong>Prep Time:</strong> ${recipe.prep_time || 'N/A'}</p>
      <p><strong>Cook Time:</strong> ${recipe.cook_time || 'N/A'}</p>
      <p><strong>Servings:</strong> ${recipe.servings || 'N/A'}</p>
    </div>
    <div class="ingredients">
      <h2>Ingredients</h2>
      <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
    </div>
    <div class="method">
      <h2>Method</h2>
      <ol>${recipe.method.map(m => `<li>${m}</li>`).join('')}</ol>
    </div>
    ${recipe.notes ? `<div class="notes"><h3>Notes</h3><p>${recipe.notes}</p></div>` : ''}
    ${recipe.facts ? `<div class="fun-facts"><h3>Fun Facts</h3><p>${recipe.facts}</p></div>` : ''}
    ${recipe.nutritional_info ? `<div class="nutrition">
      <h3>Nutritional Info</h3>
      <ul>
        ${Object.entries(recipe.nutritional_info).map(([k,v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
      </ul>
    </div>` : ''}
    <div class="tags-categories">
      ${recipe.tags ? `<p><strong>Tags:</strong> ${recipe.tags.join(', ')}</p>` : ''}
      ${recipe.category ? `<p><strong>Category:</strong> ${recipe.category.join(', ')}</p>` : ''}
      ${recipe.cuisine ? `<p><strong>Cuisine:</strong> ${recipe.cuisine.join(', ')}</p>` : ''}
    </div>
    <button onclick="window.print()" class="print-btn">Print Recipe 🖨️</button>
  `;
}

fetchRecipe();
