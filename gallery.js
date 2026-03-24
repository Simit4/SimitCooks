import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


const gallery = document.getElementById('gallery');
const filterButtons = document.querySelectorAll('.filter-btn');

let allImages = [];
let filteredImages = [];
let loadedCount = 0;
const BATCH = 12;

// -------------------------------
// Skeleton loader
// -------------------------------
function showSkeleton(count = BATCH) {
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'gallery-item skeleton';
    gallery.appendChild(skeleton);
  }
}

// -------------------------------
// Render batch
// -------------------------------
function renderBatch(data) {
  const fragment = document.createDocumentFragment();
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item fade-in';
    div.innerHTML = `
      <img src="${item.url}" alt="${item.name}" loading="lazy">
      <div class="overlay">${item.emoji} ${item.name}</div>
    `;
    fragment.appendChild(div);
  });

  gallery.appendChild(fragment);
  loadedCount += batch.length;
  observeLastItem();
}

// -------------------------------
// Infinite scroll
// -------------------------------
function observeLastItem() {
  const items = gallery.querySelectorAll('.gallery-item');
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

// -------------------------------
// Fetch images from Supabase Storage
// -------------------------------
async function fetchGallery() {
  showSkeleton();

  const { data, error } = await supabase.storage.from('gallery').list('', {
    limit: 100,
    sortBy: { column: 'name', order: 'asc' }
  });

  if (error) {
    console.error('❌ Gallery fetch error:', error);
    gallery.innerHTML = "<p>Failed to load gallery.</p>";
    return;
  }

  console.log('✅ Files fetched:', data);

  allImages = data.map(file => {
    const nameLower = file.name.toLowerCase();
    let category = 'main', emoji = '🍲';
    if (nameLower.startsWith('appetizer')) { category = 'appetizer'; emoji = '🥗'; }
    if (nameLower.startsWith('dessert')) { category = 'dessert'; emoji = '🍰'; }

    const name = file.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
                          .replace(/_/g, ' ')
                          .replace(/\b(appetizer|main|dessert)\b/i, '')
                          .trim();

    // THIS WORKS: Use the same method as equipment.js
    const url = supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl;
    console.log('IMAGE URL:', url);
    return { url, name, category, emoji };
  });

  filteredImages = allImages;
  loadedCount = 0;
  gallery.innerHTML = '';
  renderBatch(filteredImages);
}

// -------------------------------
// Filter buttons
// -------------------------------
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

// -------------------------------
// Initialize
// -------------------------------
fetchGallery();
