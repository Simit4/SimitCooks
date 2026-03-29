import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// DOM Elements
const gallery = document.getElementById('gallery');
const filterButtons = document.querySelectorAll('.filter-btn');

let allImages = [];
let filteredImages = [];
let loadedCount = 0;
const BATCH = 12;

// ---------------------
// Skeleton loader
// ---------------------
function showSkeleton(count = BATCH) {
  if (!gallery) return;
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    gallery.appendChild(sk);
  }
}

// ---------------------
// GLightbox init
// ---------------------
function initGLightbox() {
  if (typeof GLightbox !== 'undefined') {
    if (window.glightboxInstance) window.glightboxInstance.destroy();

    window.glightboxInstance = GLightbox({
      selector: '.glightbox',
      openEffect: 'fade',
      closeEffect: 'fade',
      slideEffect: 'fade',
      zoomable: false, // 🔹 remove zoom icon
      loop: true,
      touchNavigation: true,
      keyboardNavigation: true,
      closeButton: true,
      draggable: true,
      width: '90vw',
      height: 'auto',
      preload: true,
      autoplayVideos: false,
      css: 'https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css',
      touchMovement: true,
      closeOnOutsideClick: true
    });
  }
}

// ---------------------
// Fetch images from Supabase
// ---------------------
async function fetchGallery() {
  showSkeleton();

  try {
    const [metadataResult, filesResult] = await Promise.all([
      supabase.from('gallery_metadata').select('file_name, description, emoji, category'),
      supabase.storage.from('gallery').list()
    ]);

    if (metadataResult.error) throw metadataResult.error;
    if (filesResult.error) throw filesResult.error;

    const metadataMap = new Map();
    (metadataResult.data || []).forEach(meta => {
      metadataMap.set(meta.file_name.toLowerCase(), meta);
    });

    allImages = (filesResult.data || [])
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map(f => {
        const meta = metadataMap.get(f.name.toLowerCase());
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(f.name);

        return {
          url: publicUrl,
          name: f.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/_/g, ' ').trim(),
          category: meta?.category || 'main',
          emoji: meta?.emoji || '🍲',
          description: meta?.description || 'No description yet.'
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    if (!allImages.length) {
      gallery.innerHTML = "<p style='text-align:center;color:red;padding:2rem;'>No images found in the gallery.</p>";
      return;
    }

    filteredImages = [...allImages];
    loadedCount = 0;
    gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch (err) {
    console.error('Gallery fetch error:', err);
    gallery.innerHTML = "<p style='text-align:center;color:red;padding:2rem;'>Failed to load gallery. Please try again later.</p>";
  }
}

// ---------------------
// Render batch of images
// ---------------------
function renderBatch(data) {
  if (!gallery) return;

  const batch = data.slice(loadedCount, loadedCount + BATCH);
  if (!batch.length) return;

  batch.forEach((img, i) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.className = 'glightbox';
    link.setAttribute('data-gallery', 'simit-gallery');
    link.setAttribute('data-title', `${img.emoji} ${img.name}`);
    link.setAttribute('data-description', img.description);

    link.innerHTML = `
      <div class="gallery-item fade-in" style="animation-delay:${i * 50}ms">
        <img src="${img.url}" alt="${img.name.replace(/[<>]/g, '')}" loading="lazy">
        <div class="overlay">
          <div class="title">${img.emoji} ${img.name.replace(/[<>]/g, '')}</div>
          <div class="description">${img.description.replace(/[<>]/g, '')}</div>
        </div>
      </div>
    `;
    gallery.appendChild(link);
  });

  loadedCount += batch.length;
  setTimeout(initGLightbox, 100); // re-init lightbox
  observeLastImage();
}

// ---------------------
// Infinite scroll observer
// ---------------------
function observeLastImage() {
  const items = document.querySelectorAll('.gallery-item');
  const lastItem = items[items.length - 1];
  if (!lastItem) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && loadedCount < filteredImages.length) {
        observer.disconnect();
        renderBatch(filteredImages);
      }
    });
  }, { rootMargin: '250px' });

  observer.observe(lastItem);
}

// ---------------------
// Filter buttons
// ---------------------
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');

    const category = btn.dataset.category;
    filteredImages = category === 'all' ? [...allImages] : allImages.filter(img => img.category === category);

    gallery.innerHTML = '';
    loadedCount = 0;
    renderBatch(filteredImages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// ---------------------
// Initialize
// ---------------------
fetchGallery();
