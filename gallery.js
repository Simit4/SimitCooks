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
const BATCH = 10; // Images per batch for infinite scroll

// -------------------------------
// Skeleton loader
// -------------------------------
function showSkeleton(count = BATCH) {
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'gallery-item skeleton';
    skeleton.innerHTML = `<div class="overlay">Loading...</div>`;
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
      <div class="overlay">${item.name}</div>
    `;
    // Click opens recipe page (replace URL logic if you have recipe slug)
    div.addEventListener('click', () => {
      window.location.href = `/recipes.html?name=${encodeURIComponent(item.name)}`;
    });
    fragment.appendChild(div);
  });

  gallery.appendChild(fragment);
  loadedCount += batch.length;
  observeLastImage();
}

// -------------------------------
// Infinite scroll
// -------------------------------
function observeLastImage() {
  const items = document.querySelectorAll('.gallery-item');
  const last = items[items.length - 1];
  if (!last) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && loadedCount < filteredImages.length) {
        renderBatch(filteredImages);
        observer.disconnect();
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(last);
}

// -------------------------------
// Fetch images from Supabase
// -------------------------------
async function fetchGallery() {
  showSkeleton();

  const { data, error } = await supabase.storage.from('gallery').list('', { limit: 100 });
  if (error) {
    console.error('❌ Error fetching gallery:', error);
    gallery.innerHTML = '<p>Failed to load gallery.</p>';
    return;
  }

  allImages = data.map(file => {
    let category = 'main';
    if (file.name.toLowerCase().startsWith('dessert')) category = 'dessert';
    else if (file.name.toLowerCase().startsWith('appetizer')) category = 'appetizer';

    const name = file.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
                          .replace(/_/g, ' ')
                          .replace(/\b(appetizer|main|dessert)\b/i, '')
                          .trim();

    const url = supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl;
    return { url, name, category };
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

    const category = btn.dataset.category;
    filteredImages = category === 'all'
      ? allImages
      : allImages.filter(img => img.category === category);

    gallery.innerHTML = '';
    loadedCount = 0;
    renderBatch(filteredImages);
  });
});

// -------------------------------
// Fade-in animation
// -------------------------------
const style = document.createElement('style');
style.innerHTML = `
  .fade-in { opacity: 0; transform: translateY(20px); animation: fadeInUp 0.6s forwards; }
  @keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
  .skeleton { background: #eee; min-height: 200px; border-radius: 15px; }
`;
document.head.appendChild(style);

// -------------------------------
// Init
// -------------------------------
fetchGallery();
