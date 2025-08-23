import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const equipmentContainer = document.getElementById('equipment-container');
const filterButtons = document.querySelectorAll('.filter-btn');

let allEquipment = [];

async function fetchEquipment() {
  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('id, name, image_url, affiliate_link, category, description, rating');

    if (error) throw error;
    if (!data || data.length === 0) {
      equipmentContainer.innerHTML = '<p class="info-message">No equipment found.</p>';
      return;
    }

    allEquipment = data;
    renderEquipment(allEquipment);

  } catch (err) {
    console.error(err);
    equipmentContainer.innerHTML = `<p class="error-message">Failed to load equipment.</p>`;
  }
}

function renderEquipment(items) {
  equipmentContainer.innerHTML = '';
  const fragment = document.createDocumentFragment();

  items.forEach(({ id, name, image_url, affiliate_link, description, rating }, index) => {
    const card = document.createElement('article');
    card.className = 'equipment-item';
    card.style.animationDelay = `${index * 0.05}s`;

    // Image wrapper
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'image-wrapper';
    const img = document.createElement('img');
    img.src = image_url || 'placeholder.png';
    img.alt = name || 'Equipment';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    // Quick View Overlay
    const overlay = document.createElement('div');
    overlay.className = 'quick-view-overlay';

    const overlayTitle = document.createElement('h4');
    overlayTitle.textContent = name || '';
    overlay.appendChild(overlayTitle);

    if (description) {
      const desc = document.createElement('p');
      desc.textContent = description.length > 60 ? description.slice(0, 60) + '...' : description;
      overlay.appendChild(desc);
    }

    if (rating) {
      const stars = document.createElement('p');
      stars.className = 'stars';
      stars.innerHTML = '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
      overlay.appendChild(stars);
    }

    const btn = document.createElement('a');
    btn.className = 'btn-buy';
    btn.href = affiliate_link;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer nofollow';
    btn.textContent = 'Buy on Amazon';
    overlay.appendChild(btn);

    imgWrapper.appendChild(overlay);
    card.appendChild(imgWrapper);

    fragment.appendChild(card);
  });

  equipmentContainer.appendChild(fragment);
}

// Filter logic
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    if (filter === 'all') renderEquipment(allEquipment);
    else renderEquipment(allEquipment.filter(item => item.category === filter));
  });
});

fetchEquipment();
