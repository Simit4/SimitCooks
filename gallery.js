import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


// ----------------------------- gallery.js (Instagram App Style) -----------------------------
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ------------------- Supabase Setup -------------------
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY'; // replace with your anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// ------------------- DOM Elements -------------------
const gallery = document.getElementById('gallery');
const filterButtons = document.querySelectorAll('.filter-btn');

// ------------------- Variables -------------------
let allImages = [];
let filteredImages = [];
let loadedCount = 0;
const BATCH = 12;
let glightbox;

// ------------------- Skeleton Loader -------------------
function showSkeleton(count = BATCH) {
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    gallery.appendChild(sk);
  }
}

// ------------------- Render Images -------------------
function renderBatch(data) {
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach((img, i) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.className = 'glightbox';
    link.setAttribute('data-title', `${img.emoji} ${img.name}`);
    link.setAttribute('data-description', img.description || '');
    link.setAttribute('data-type', 'image');

    link.innerHTML = `
      <div class="gallery-item fade-in" style="animation-delay:${i * 70}ms">
        <img loading="lazy" src="${img.url}" alt="${img.name}">
        <div class="overlay">${img.emoji} ${img.name}</div>
      </div>
    `;
    gallery.appendChild(link);
  });

  loadedCount += batch.length;

  if (glightbox) {
    glightbox.reload();
  } else {
    glightbox = GLightbox({
      selector: '.glightbox',
      touchNavigation: true,     // swipe gestures
      loop: true,
      openEffect: 'zoom',
      closeEffect: 'fade',
      slideEffect: 'slide',
      moreLength: true,
      // Pinch-to-zoom enabled
      zoomable: true,
      // Custom slide with overlay
      renderSlide: (slide) => {
        return `
          <div class="gslide">
            <img src="${slide.href}" alt="${slide.title}">
            <div class="gslide-overlay">
              <div class="gslide-title">${slide.title}</div>
              <div class="gslide-description">${slide.description}</div>
            </div>
          </div>
        `;
      }
    });

    // ---------------- Tap to hide/show overlay ----------------
    glightbox.on('slide_after_load', ({ slideNode }) => {
      const overlay = slideNode.querySelector('.gslide-overlay');
      if (!overlay) return;

      overlay.style.transition = 'opacity 0.4s';
      overlay.style.opacity = '1';

      slideNode.querySelector('img').addEventListener('click', () => {
        overlay.style.opacity = overlay.style.opacity === '1' ? '0' : '1';
      });
    });
  }

  observeLastImage();
}

// ------------------- Infinite Scroll -------------------
function observeLastImage() {
  const imgs = document.querySelectorAll('.gallery-item');
  const lastImg = imgs[imgs.length - 1];
  if (!lastImg) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && loadedCount < filteredImages.length) {
        renderBatch(filteredImages);
        observer.disconnect();
      }
    });
  }, { rootMargin: '250px' });

  observer.observe(lastImg);
}

// ------------------- Fetch Gallery & Metadata -------------------
async function fetchGallery() {
  try {
    showSkeleton();

    const { data: files, error: fileError } = await supabase.storage.from('gallery').list();
    if (fileError) throw fileError;

    const { data: metadata = [], error: metaError } = await supabase
      .from('gallery_metadata')
      .select('file_name, description, emoji, category');
    if (metaError) throw metaError;

    allImages = files
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map(f => {
        const meta = metadata.find(m => m.file_name === f.name) || {};
        const name = f.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/_/g, ' ').trim();
        const url = supabase.storage.from('gallery').getPublicUrl(f.name).data.publicUrl;

        return {
          url,
          name,
          category: meta.category || 'main',
          emoji: meta.emoji || '🍲',
          description: meta.description || 'Delicious homemade dish.',
        };
      });

    filteredImages = allImages;
    loadedCount = 0;
    gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch (err) {
    console.error(err);
    gallery.innerHTML = "<p style='text-align:center;color:red'>Failed to load gallery.</p>";
  }
}

// ------------------- Filter Buttons -------------------
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    const category = btn.dataset.category;
    filteredImages = category === 'all' ? allImages : allImages.filter(img => img.category === category);
    gallery.innerHTML = '';
    loadedCount = 0;
    renderBatch(filteredImages);
  });
});

// ------------------- Initialize -------------------
fetchGallery();
