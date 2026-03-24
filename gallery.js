import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

const gallery = document.getElementById('gallery');
const filterButtons = document.querySelectorAll('.filter-btn');

let allImages=[], filteredImages=[], loadedCount=0, BATCH=12, glightbox;

// ---------------- SKELETON ----------------
function showSkeleton(count=BATCH){
  gallery.innerHTML='';
  for(let i=0;i<count;i++){
    const sk=document.createElement('div');
    sk.className='skeleton';
    gallery.appendChild(sk);
  }
}

// ---------------- RENDER BATCH ----------------
function renderBatch(data){
  const batch = data.slice(loadedCount, loadedCount+BATCH);
  batch.forEach((img, i) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.className = 'glightbox';
    link.setAttribute('data-title', `${img.emoji} ${img.name}`);
    link.setAttribute('data-description', img.description || '');
    link.setAttribute('data-type', 'image');

    link.innerHTML = `
      <div class="gallery-item fade-in" style="animation-delay:${i*70}ms">
        <img loading="lazy" src="${img.url}" alt="${img.name}">
        <div class="overlay">${img.emoji} ${img.name}</div>
      </div>`;
    gallery.appendChild(link);
  });
  loadedCount += batch.length;

  if(glightbox) glightbox.reload();
  else glightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    loop: true,
    openEffect: 'zoom',
    closeEffect: 'fade',
    slideEffect: 'slide'
  });

  observeLastImage();
}

// ---------------- INFINITE SCROLL ----------------
function observeLastImage(){
  const imgs = document.querySelectorAll('.gallery-item');
  const lastImg = imgs[imgs.length-1];
  if(!lastImg) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting && loadedCount < filteredImages.length){
        renderBatch(filteredImages);
        observer.disconnect();
      }
    });
  }, { rootMargin: '250px' });
  observer.observe(lastImg);
}

// ---------------- FETCH GALLERY WITH DESCRIPTION ----------------
async function fetchGallery(){
  try {
    showSkeleton();

    // 1️⃣ Get files from storage
    const { data: files, error: fileError } = await supabase.storage.from('gallery').list();
    if(fileError) throw fileError;

    // 2️⃣ Get metadata from table
    const { data: metadata, error: metaError } = await supabase
      .from('gallery_metadata')
      .select('file_name, description, emoji, category');
    if(metaError) throw metaError;

    allImages = files
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map(f => {
        const meta = metadata.find(m => m.file_name === f.name) || {};
        const name = f.name.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/_/g,' ').trim();
        const url = supabase.storage.from('gallery').getPublicUrl(f.name).data.publicUrl;
        const category = meta.category || 'main';
        const emoji = meta.emoji || '🍲';
        const description = meta.description || '';
        return { url, name, category, emoji, description };
      });

    filteredImages = allImages;
    loadedCount = 0;
    gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch(err) {
    console.error(err);
    gallery.innerHTML = "<p style='text-align:center;color:red'>Failed to load gallery.</p>";
  }
}

// ---------------- FILTER BUTTONS ----------------
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

// ---------------- INIT ----------------
fetchGallery();
