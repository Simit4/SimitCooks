// =================================================
// recipe.js - With Visible Play Icon + Autoplay
// =================================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase Configuration
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

const FALLBACK_IMAGE = 'https://i.ibb.co/4p4mR3N/momo-graphic.png';

// =================================================
// Helper Functions
// =================================================
function getSlug() {
  const path = window.location.pathname.split('/').filter(Boolean);
  return path[1] || new URLSearchParams(window.location.search).get('slug');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

function getRecipeThumbnail(recipe) {
  if (recipe.thumbnail_url?.trim()) return recipe.thumbnail_url;
  const vid = extractYouTubeId(recipe.video_url);
  if (vid) return `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
  return FALLBACK_IMAGE;
}

// =================================================
// Render Video Section (Visible Play Icon + Autoplay)
// =================================================
async function renderVideoSection(recipe) {
  const videoSection = document.getElementById('video-section');
  const videoContainer = document.getElementById('video-container');
  const videoId = extractYouTubeId(recipe.video_url);

  // Hide video section if no video URL
  if (!videoId || !videoSection || !videoContainer) {
    if (videoSection) videoSection.style.display = 'none';
    return;
  }

  // Show video section
  videoSection.style.display = 'block';
  
  // Clear previous content
  videoContainer.innerHTML = '';
  videoContainer.classList.remove('video-playing');
  
  // Add a unique class for styling
  videoContainer.classList.add('custom-video-container');
  
  // Create thumbnail image
  const thumb = document.createElement('img');
  thumb.src = getRecipeThumbnail(recipe);
  thumb.alt = 'Video thumbnail';
  thumb.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  `;
  videoContainer.appendChild(thumb);
  
  // Create visible play button in the middle
  const playButton = document.createElement('div');
  playButton.innerHTML = '▶';
  playButton.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: rgba(230, 126, 34, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: white;
    cursor: pointer;
    z-index: 3;
    transition: all 0.3s ease;
    box-shadow: 0 0 20px rgba(0,0,0,0.3);
    font-family: Arial, sans-serif;
    padding-left: 8px;
  `;
  
  // Add hover effect
  playButton.addEventListener('mouseenter', () => {
    playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
    playButton.style.background = '#d35400';
  });
  playButton.addEventListener('mouseleave', () => {
    playButton.style.transform = 'translate(-50%, -50%) scale(1)';
    playButton.style.background = 'rgba(230, 126, 34, 0.9)';
  });
  
  videoContainer.appendChild(playButton);
  
  // Add pulse animation to play button
  const pulseAnimation = `
    @keyframes pulseOrange {
      0% {
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 0 0 0 rgba(230, 126, 34, 0.7);
      }
      70% {
        transform: translate(-50%, -50%) scale(1.1);
        box-shadow: 0 0 0 15px rgba(230, 126, 34, 0);
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        box-shadow: 0 0 0 0 rgba(230, 126, 34, 0);
      }
    }
  `;
  
  if (!document.querySelector('#pulse-orange-style')) {
    const style = document.createElement('style');
    style.id = 'pulse-orange-style';
    style.textContent = pulseAnimation;
    document.head.appendChild(style);
  }
  
  playButton.style.animation = 'pulseOrange 1.5s infinite';
  
  // Create click overlay (covers entire container)
  const clickOverlay = document.createElement('div');
  clickOverlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    cursor: pointer;
  `;
  videoContainer.appendChild(clickOverlay);
  
  // Function to play video
  function playVideo() {
    // Remove pulse animation
    playButton.style.animation = 'none';
    playButton.style.opacity = '0';
    playButton.style.pointerEvents = 'none';
    
    // Add playing class to stop CSS pulse (if any)
    videoContainer.classList.add('video-playing');
    
    // Remove the click overlay and play button
    clickOverlay.remove();
    playButton.remove();
    
    // Create and add iframe with autoplay
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
    iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 10;
    `;
    
    // Clear container and add iframe
    videoContainer.innerHTML = '';
    videoContainer.appendChild(iframe);
  }
  
  // Add click event to both play button and overlay
  playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    playVideo();
  });
  
  clickOverlay.addEventListener('click', playVideo);
}

// =================================================
// Render Recipe Content
// =================================================
async function renderRecipe(recipe) {
  if (!recipe) return;

  // Title, description, times
  const titleEl = document.getElementById('recipe-title');
  const descEl = document.getElementById('recipe-description');
  const prepEl = document.getElementById('prep-time');
  const cookEl = document.getElementById('cook-time');
  const servingsEl = document.getElementById('servings');

  if (titleEl) titleEl.innerText = recipe.title || 'Untitled Recipe';
  if (descEl) descEl.innerText = recipe.description || 'Delicious recipe made with love.';
  if (prepEl) prepEl.innerText = recipe.prep_time || 'N/A';
  if (cookEl) cookEl.innerText = recipe.cook_time || 'N/A';
  if (servingsEl) servingsEl.innerText = recipe.servings || 'N/A';

  // Ingredients
  const ingList = document.getElementById('ingredients-list');
  if (ingList) {
    if (recipe.ingredients?.length) {
      if (typeof recipe.ingredients[0] === 'object' && recipe.ingredients[0].items) {
        ingList.innerHTML = recipe.ingredients.map(section => {
          const title = escapeHtml(section.section || '');
          const items = (section.items || []).map(i => `<li>${escapeHtml(i)}</li>`).join('');
          return `<div class="ingredients-section">
            ${title ? `<h4 style="margin: 0.5rem 0; color: var(--primary, #e67e22);">${title}</h4>` : ''}
            <ul class="green-bullets">${items}</ul>
          </div>`;
        }).join('');
      } else {
        const items = recipe.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('');
        ingList.innerHTML = `<ul class="green-bullets">${items}</ul>`;
      }
    } else {
      ingList.innerHTML = '<li>No ingredients listed</li>';
    }
  }

  // Method
  const methodList = document.getElementById('method-list');
  if (methodList) {
    methodList.innerHTML = recipe.method?.map(s => `<li>${escapeHtml(s)}</li>`).join('') || '<li>No instructions available</li>';
  }

  // History, Notes, Facts
  const historyEl = document.getElementById('history-overview');
  const notesEl = document.getElementById('notes');
  const factsEl = document.getElementById('facts');

  if (historyEl) historyEl.textContent = recipe.history_overview || 'Classic recipe passed down through generations.';
  if (notesEl) notesEl.textContent = recipe.notes || 'No additional notes.';
  if (factsEl) factsEl.textContent = recipe.facts || 'Did you know? This recipe is made with love!';

  // Categories
  const catDiv = document.getElementById('category');
  if (catDiv && recipe.category) {
    catDiv.innerHTML = Array.isArray(recipe.category) 
      ? recipe.category.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('') 
      : `<span class="tag">${escapeHtml(recipe.category)}</span>`;
  }

  // Cuisine
  const cuisineDiv = document.getElementById('cuisine');
  if (cuisineDiv && recipe.cuisine) {
    cuisineDiv.innerHTML = Array.isArray(recipe.cuisine) 
      ? recipe.cuisine.map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('') 
      : `<span class="tag">${escapeHtml(recipe.cuisine)}</span>`;
  }

  // Share button
  const shareBtn = document.getElementById('universal-share');
  if (shareBtn) {
    const newShareBtn = shareBtn.cloneNode(true);
    shareBtn.parentNode.replaceChild(newShareBtn, shareBtn);
    
    newShareBtn.addEventListener('click', async () => {
      const recipeTitle = document.getElementById('recipe-title')?.textContent || 'Recipe';
      const recipeUrl = window.location.href;
      if (navigator.share) {
        try {
          await navigator.share({ title: recipeTitle, text: `Check out this recipe: ${recipeTitle}`, url: recipeUrl });
        } catch (err) {
          console.error('Share failed:', err);
        }
      } else {
        prompt('Copy this link to share:', recipeUrl);
      }
    });
  }

  // Print button
  const printBtn = document.querySelector('.btn-action[onclick="window.print()"]');
  if (printBtn) {
    const newPrintBtn = printBtn.cloneNode(true);
    printBtn.parentNode.replaceChild(newPrintBtn, printBtn);
    newPrintBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.print();
    });
  }

  // Render video section
  await renderVideoSection(recipe);
}

// =================================================
// Fetch More Recipes (3 cards)
// =================================================
async function fetchMoreRecipes(slug) {
  const { data: recipes } = await supabase
    .from('recipe_db')
    .select('*')
    .neq('slug', slug)
    .limit(3);

  const grid = document.getElementById('more-recipes-grid');
  if (!grid) return;

  if (!recipes?.length) {
    grid.innerHTML = '<p style="text-align:center; color: var(--neutral-500, #78716c);">More recipes coming soon!</p>';
    return;
  }

  grid.innerHTML = recipes.map(r => {
    const thumb = getRecipeThumbnail(r);
    const title = r.title || 'Untitled';
    const desc = r.description || 'Delicious recipe';
    return `
      <div class="recipe-card" onclick="window.location.href='/recipe/${r.slug}'" style="cursor: pointer;">
        <div class="thumbnail-wrapper">
          <img src="${thumb}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div class="card-body">
          <h4>${escapeHtml(title)}</h4>
          <p>${escapeHtml(desc.substring(0, 80))}${desc.length > 80 ? '...' : ''}</p>
        </div>
      </div>
    `;
  }).join('');
}

// =================================================
// Initialize
// =================================================
async function init() {
  const slug = getSlug();
  
  if (!slug) {
    const titleEl = document.getElementById('recipe-title');
    if (titleEl) titleEl.innerText = 'Recipe Not Found';
    const descEl = document.getElementById('recipe-description');
    if (descEl) descEl.innerText = 'Please provide a valid recipe slug.';
    return;
  }

  const { data: recipe, error } = await supabase
    .from('recipe_db')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !recipe) {
    const titleEl = document.getElementById('recipe-title');
    if (titleEl) titleEl.innerText = 'Recipe Not Found';
    const descEl = document.getElementById('recipe-description');
    if (descEl) descEl.innerText = 'This recipe does not exist or is unavailable.';
    console.error('Recipe fetch error:', error);
    return;
  }

  // Render the recipe
  await renderRecipe(recipe);
  
  // Fetch more recipes
  await fetchMoreRecipes(slug);

  // Increment view count
  supabase
    .from('recipe_db')
    .update({ views: (recipe.views || 0) + 1 })
    .eq('slug', slug)
    .then(() => console.log('View count updated'))
    .catch(err => console.error('View update failed:', err));
}

// Start
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
