import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase setup
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);



const gallery = document.getElementById('gallery');

async function loadGallery() {
  const { data, error } = await supabase.storage.from('gallery').list('', { limit: 100 });

  if (error) {
    console.error('❌ Supabase fetch error:', error);
    gallery.innerHTML = '<p>Failed to load gallery.</p>';
    return;
  }

  console.log('✅ Fetched files:', data);

  data.forEach(file => {
    const url = supabase.storage.from('gallery').getPublicUrl(file.name).data.publicUrl;
    console.log('IMAGE URL:', url);

    const div = document.createElement('div');
    div.className = 'gallery-item';
    div.innerHTML = `
      <img src="${url}" alt="${file.name}" loading="lazy">
      <div class="overlay">${file.name}</div>
    `;
    gallery.appendChild(div);
  });
}

loadGallery();
