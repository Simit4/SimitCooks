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

// ----- Skeleton Loader -----
function showSkeleton(count = BATCH) {
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    gallery.appendChild(sk);
  }
}

// ----- Render Batch -----
function renderBatch(data) {
  const batch = data.slice(loadedCount, loadedCount + BATCH);
  batch.forEach(img => {
    const link = document.createElement('a');
    link.href = `recipes.html?img=${encodeURIComponent(img.name)}`;
    link.className = 'glightbox';
    link.innerHTML = `
      <div class="gallery-item">
        <img src="${img.url}" alt="${img.name}">
        <div class="overlay">${img.emoji} ${img.name}</div>
      </div>
    `;
    gallery.appendChild(link);
  });
  loadedCount += batch.length;
  GLightbox({ selector: '.glightbox' });
  observeLastImage();
}

// ----- Infinite Scroll -----
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
  }, { rootMargin: '200px' });

  observer.observe(lastImg);
}

// ----- Fetch Gallery -----
async function fetchGallery() {
  try {
    showSkeleton();

    const { data, error } = await supabase.storage.from('gallery').list();
    if (error) throw error;

    allImages = data.map(file => {
      const nameLower = file.name.toLowerCase();
      let category = 'main', emoji = '🍲';
      if (nameLower.startsWith('appetizer')) { category = 'appetizer'; emoji = '🥗'; }
      if (nameLower.startsWith('dessert')) { category = 'dessert'; emoji = '🍰'; }
      const url = supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl;
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
    console.error(err);
    gallery.innerHTML = "<p style='text-align:center;color:red'>Failed to load gallery.</p>";
  }
}

// ----- Filter Buttons -----
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

// ----- Initialize -----
fetchGallery();
