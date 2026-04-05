// =================================================
// recipe.js - Completely Self-Contained
// Creates its own 16:9 video with pulse button
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
// Create Video Section (completely self-contained)
// =================================================
function createVideoSection(recipe) {
  const videoId = extractYouTubeId(recipe.video_url);
  
  if (!videoId) return null;
  
  // Create container
  const videoSection = document.createElement('div');
  videoSection.id = 'dynamic-video-section';
  videoSection.style.cssText = `
    width: 100%;
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1rem;
    position: relative;
    z-index: 10;
  `;
  
  // Create header
  const header = document.createElement('div');
  header.style.cssText = `
    text-align: center;
    margin-bottom: 1rem;
  `;
  header.innerHTML = `
    <h3 style="
      font-family: 'Playfair Display', serif;
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, #e67e22, #f39c12);
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      margin-bottom: 0.5rem;
    ">📹 Watch & Cook Along</h3>
    <p style="color: #78716c; font-size: 0.9rem;">Follow our step-by-step video tutorial</p>
  `;
  videoSection.appendChild(header);
  
  // Create video wrapper (16:9)
  const wrapper = document.createElement('div');
  wrapper.style.cssText = `
    position: relative;
    width: 100%;
    padding-top: 56.25%;
    background: #000;
    border-radius: 1rem;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  `;
  
  // Thumbnail image
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
    transition: transform 0.5s ease;
  `;
  wrapper.appendChild(thumb);
  
  // Pulse play button
  const playBtn = document.createElement('div');
  playBtn.innerHTML = '▶';
  playBtn.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 80px;
    height: 80px;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    color: #ffde9c;
    font-family: monospace;
    box-shadow: 0 0 0 4px rgba(230,126,34,0.8);
    animation: pulsePlayDynamic 1.4s infinite ease-in-out;
    pointer-events: none;
    z-index: 2;
  `;
  wrapper.appendChild(playBtn);
  
  // Add animation keyframes
  if (!document.querySelector('#dynamic-pulse-style')) {
    const style = document.createElement('style');
    style.id = 'dynamic-pulse-style';
    style.textContent = `
      @keyframes pulsePlayDynamic {
        0% {
          transform: translate(-50%, -50%) scale(0.95);
          opacity: 0.9;
          box-shadow: 0 0 0 0 rgba(230,126,34,0.7);
        }
        70% {
          transform: translate(-50%, -50%) scale(1.15);
          opacity: 1;
          box-shadow: 0 0 0 20px rgba(230,126,34,0);
        }
        100% {
          transform: translate(-50%, -50%) scale(0.95);
          opacity: 0.9;
          box-shadow: 0 0 0 0 rgba(230,126,34,0);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Hover effects
  wrapper.addEventListener('mouseenter', () => {
    wrapper.style.transform = 'scale(1.02)';
    wrapper.style.boxShadow = '0 30px 60px rgba(0,0,0,0.3)';
    thumb.style.transform = 'scale(1.05)';
  });
  
  wrapper.addEventListener('mouseleave', () => {
    wrapper.style.transform = 'scale(1)';
    wrapper.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
    thumb.style.transform = 'scale(1)';
  });
  
  // Click to play video
  wrapper.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`;
    iframe.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    `;
    iframe.setAttribute('allow', 'autoplay; fullscreen; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');
    
    // Replace wrapper contents with iframe
    wrapper.innerHTML = '';
    wrapper.appendChild(iframe);
  });
  
  videoSection.appendChild(wrapper);
  
  return videoSection;
}

// =================================================
// Insert Video Section into Page
// =================================================
function insertVideoSection(recipe) {
  // Remove existing dynamic video section if present
  const existingSection = document.getElementById('dynamic-video-section');
  if (existingSection) {
    existingSection.remove();
  }
  
  // Hide the original video section if it exists
  const originalVideoSection = document.getElementById('video-section');
  if (originalVideoSection) {
    originalVideoSection.style.display = 'none';
  }
  
  const videoSection = createVideoSection(recipe);
  if (!videoSection) return;
  
  // Find where to insert the video section
  // Try to insert after hero section or after recipe-content
  const heroSection = document.querySelector('.hero');
  const recipeContent = document.querySelector('.recipe-content');
  
  if (heroSection && heroSection.nextSibling) {
    // Insert after hero section
    heroSection.parentNode.insertBefore(videoSection, heroSection.nextSibling);
  } else if (recipeContent) {
    // Insert before recipe content
    recipeContent.parentNode.insertBefore(videoSection, recipeContent);
  } else {
    // Fallback: insert after body's first child or at beginning of main
    const main = document.querySelector('main') || document.body;
    main.insertBefore(videoSection, main.firstChild);
  }
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
            ${title ? `<h4 style="margin: 0.5rem 0; color: #e67e22;">${title}</h4>` : ''}
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
    // Remove existing listeners to avoid duplicates
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

  // Insert video section (creates its own element)
  insertVideoSection(recipe);
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
    grid.innerHTML = '<p style="text-align:center; color: #78716c;">More recipes coming soon!</p>';
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

  // Increment view count (non-blocking)
  supabase
    .from('recipe_db')
    .update({ views: (recipe.views || 0) + 1 })
    .eq('slug', slug)
    .then(() => console.log('View count updated'))
    .catch(err => console.error('View update failed:', err));
}

// Wait for DOM to be fully loaded before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
