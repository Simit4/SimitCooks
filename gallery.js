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
let glightbox;

function showSkeleton(count = BATCH) {
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    gallery.appendChild(sk);
  }
}

async function fetchGallery() {
  showSkeleton();

  try {
    const { data: metadata = [] } = await supabase
      .from('gallery_metadata')
      .select('file_name, description, emoji, category');

    const { data: files = [] } = await supabase.storage.from('gallery').list();

    allImages = files
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map(f => {
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

    filteredImages = allImages;
    loadedCount = 0;
    gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch (err) {
    gallery.innerHTML = "<p style='text-align:center;color:red'>Failed to load gallery.</p>";
    console.error(err);
  }
}

function renderBatch(data) {
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach((img, i) => {
    const item = document.createElement('div');
    item.className = 'gallery-item fade-in';
    item.style.animationDelay = `${i*50}ms`;

    item.innerHTML = `
      <a href="${img.url}" class="glightbox" data-title="${img.emoji} ${img.name}" data-description="${img.description}"></a>
      <img src="${img.url}" alt="${img.name}" loading="lazy">
      <div class="overlay">
        <div class="title">${img.emoji} ${img.name}</div>
        <div class="description">${img.description}</div>
      </div>
    `;

    gallery.appendChild(item);
  });

  loadedCount += batch.length;

  if (glightbox) glightbox.reload();
  else {
    glightbox = GLightbox({
      selector: '.glightbox',
      openEffect: 'zoom',
      slideEffect: 'slide',
      zoomable: true,
      loop: true
    });
  }

  observeLastImage();
}

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

fetchGallery();
