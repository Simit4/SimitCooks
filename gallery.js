import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ---------------- Supabase Setup ----------------
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY'; // replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

// ---------------- DOM Elements ----------------
const gallery = document.getElementById('gallery');
const filterButtons = document.querySelectorAll('.filter-btn');

let allImages = [];
let filteredImages = [];
let loadedCount = 0;
const BATCH = 12;
let glightbox;

// ---------------- Skeleton Loader ----------------
function showSkeleton(count = BATCH) {
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    gallery.appendChild(sk);
  }
}

// ---------------- Render Batch ----------------
function renderBatch(data) {
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach((img, i) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.className = 'glightbox';
    link.setAttribute('data-title', `${img.emoji || '🍲'} ${img.name}`);
    link.setAttribute('data-description', img.description || '');

    link.innerHTML = `
      <div class="gallery-item fade-in" style="animation-delay:${i*70}ms">
        <img loading="lazy" src="${img.url}" alt="${img.name}">
        <div class="overlay">
          <div>${img.emoji || '🍲'} ${img.name}</div>
          <div class="description">${img.description || ''}</div>
        </div>
      </div>
    `;
    gallery.appendChild(link);
  });

  loadedCount += batch.length;

  // Initialize or reload GLightbox
  if (glightbox) glightbox.reload();
  else {
    glightbox = GLightbox({
      selector: '.glightbox',
      touchNavigation: false,
      loop: true,
      openEffect: 'zoom',
      closeEffect: 'fade',
      slideEffect: 'slide',
      zoomable: false,
      renderSlide: slide => `
        <div class="gslide">
          <img src="${slide.href}" alt="${slide.title}">
          <div class="gslide-overlay">
            <div class="gslide-title">${slide.title}</div>
            <div class="gslide-description">${slide.description || ''}</div>
          </div>
        </div>
      `
    });
  }

  observeLastImage();
}

// ---------------- Infinite Scroll ----------------
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

// ---------------- Fetch Gallery from Supabase ----------------
async function fetchGallery() {
  try {
    showSkeleton();

    // ---------------- Fetch metadata ----------------
    const { data: metadata = [], error: metaError } = await supabase
      .from('gallery_metadata')
      .select('file_name, description, emoji, category');

    if (metaError) throw metaError;

    // ---------------- Fetch storage files ----------------
    const { data: files = [], error: fileError } = await supabase.storage.from('gallery').list();
    if (fileError) throw fileError;

    // ---------------- Map files to metadata ----------------
    allImages = files
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map(f => {
        // case-insensitive match to be safe
        const meta = metadata.find(m => m.file_name.toLowerCase() === f.name.toLowerCase());
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(f.name);

        return {
          url: publicUrl,
          name: f.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i,'').replace(/_/g,' ').trim(),
          category: meta?.category || 'main',
          emoji: meta?.emoji || '🍲',
          description: meta?.description || 'No description yet.'
        };
      });

    // ---------------- Debug Logging ----------------
    console.log('Files in bucket:', files.map(f => f.name));
    console.log('Metadata from DB:', metadata);
    console.log('Mapped Images:', allImages);

    filteredImages = allImages;
    loadedCount = 0;
    gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch (err) {
    console.error(err);
    gallery.innerHTML = "<p style='text-align:center;color:red'>Failed to load gallery.</p>";
  }
}

// ---------------- Filter Buttons ----------------
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

// ---------------- Initialize ----------------
fetchGallery();
