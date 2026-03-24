import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);




// -------------------------
// DOM references
// -------------------------
const gallery = document.getElementById('gallery');
const filterButtons = document.querySelectorAll('.filter-btn');

let allImages = [];
let filteredImages = [];
let loadedCount = 0;
const BATCH = 12; // images per batch

// -------------------------
// Skeleton loader
// -------------------------
function showSkeleton(count = BATCH) {
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'gallery-item skeleton';
    skeleton.innerHTML = `<div class="image-wrapper" style="height:250px;background:#eee;border-radius:15px;"></div>`;
    gallery.appendChild(skeleton);
  }
}

// -------------------------
// Render a batch of images
// -------------------------
function renderBatch(data) {
  const fragment = document.createDocumentFragment();
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach(img => {
    const div = document.createElement('div');
    div.className = 'gallery-item fade-in';

    // Click → recipe page
    const recipeSlug = img.name.toLowerCase().replace(/\s+/g, '-');
    div.innerHTML = `
      <a href="/recipes.html?slug=${recipeSlug}">
        <img src="${img.url}" alt="${img.name}">
        <div class="overlay">${img.emoji} ${img.name}</div>
      </a>
    `;

    fragment.appendChild(div);
  });

  gallery.appendChild(fragment);
  loadedCount += batch.length;
  observeLastImage();
}

// -------------------------
// Infinite scroll observer
// -------------------------
function observeLastImage() {
  const items = document.querySelectorAll('.gallery-item');
  const lastItem = items[items.length - 1];
  if (!lastItem) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && loadedCount < filteredImages.length) {
        renderBatch(filteredImages);
        observer.disconnect();
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(lastItem);
}

// -------------------------
// Load gallery from Supabase
// -------------------------
async function loadGallery() {
  try {
    showSkeleton();

    const { data, error } = await supabase.storage.from('gallery').list('', { limit: 200 });
    if (error) throw error;

    allImages = data.map(file => {
      const url = supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl;

      // Determine category by filename
      let category = 'main';
      let emoji = '🍲';
      const nameLower = file.name.toLowerCase();
      if (nameLower.startsWith('dessert')) { category = 'dessert'; emoji = '🍰'; }
      else if (nameLower.startsWith('appetizer')) { category = 'appetizer'; emoji = '🥗'; }

      const name = file.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
                            .replace(/_/g, ' ')
                            .replace(/\b(appetizer|main|dessert)\b/i, '')
                            .trim();

      return { url, name, category, emoji };
    });

    filteredImages = allImages;
    loadedCount = 0;
    gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch (err) {
    console.error('Failed to load gallery:', err);
    gallery.innerHTML = "<p class='error-message'>Failed to load images.</p>";
  }
}

// -------------------------
// Filter buttons
// -------------------------
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');

    const filter = btn.dataset.category;
    filteredImages = filter === 'all' ? allImages : allImages.filter(img => img.category === filter);

    gallery.innerHTML = '';
    loadedCount = 0;
    renderBatch(filteredImages);
  });
});

// -------------------------
// Fade-in animation
// -------------------------
const style = document.createElement('style');
style.innerHTML = `
  .fade-in { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.5s forwards; }
  @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
  .skeleton { animation: pulse 1.2s infinite; background: linear-gradient(-90deg, #eee 0%, #f5f5f5 50%, #eee 100%); background-size: 400% 400%; }
  @keyframes pulse { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
`;
document.head.appendChild(style);

// -------------------------
// Initialize
// -------------------------
loadGallery();
