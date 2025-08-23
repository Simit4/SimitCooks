import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


const container = document.getElementById('equipment-container');
const filterButtons = document.querySelectorAll('.filter-btn');

let allEquipment = [];
let filteredEquipment = [];
let loadedCount = 0; const BATCH = 20;

// -------------------------------
// Skeleton loader
// -------------------------------
function showSkeleton(count = BATCH) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'equipment-card skeleton';
    skeleton.innerHTML = `
      <div class="image-wrapper"></div>
      <div class="card-body"></div>
    `;
    container.appendChild(skeleton);
  }
}

// -------------------------------
// Render batch of equipment cards
// -------------------------------
function renderBatch(data) {
  const fragment = document.createDocumentFragment();
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach(item => {
    const card = document.createElement('div');
    card.className = 'equipment-card fade-in';

    const shortDesc = item.description ? item.description.split('. ')[0] + '.' : '';

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${item.image_url}" alt="${item.name}">
        ${item.category ? `<span class="category-badge">${item.category}</span>` : ''}
        <div class="overlay">
          <p>${shortDesc}</p>
          ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" class="btn-buy">Buy Now</a>` : ''}
        </div>
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
      </div>
    `;

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
  loadedCount += batch.length;

  // Match card heights after images load
  const images = container.querySelectorAll('img');
  let loadedImages = 0;

  images.forEach(img => {
    if (img.complete) loadedImages++;
    else img.onload = () => {
      loadedImages++;
      if (loadedImages === images.length) matchCardHeights();
    };
  });

  if (loadedImages === images.length) matchCardHeights();
  observeLastCard();
}

// -------------------------------
// Match card heights
// -------------------------------
function matchCardHeights() {
  const cards = document.querySelectorAll('.equipment-card');
  let maxHeight = 0;

  cards.forEach(card => {
    card.style.height = 'auto';
    if (card.offsetHeight > maxHeight) maxHeight = card.offsetHeight;
  });

  cards.forEach(card => card.style.height = maxHeight + 'px');
}

// -------------------------------
// Fetch equipment from Supabase
// -------------------------------
async function fetchEquipment() {
  try {
    showSkeleton();

    const { data, error } = await supabase
      .from('equipment_db')
      .select('id,name,image_url,description,affiliate_link,category')
      .order('id');

    if (error) throw error;

    allEquipment = data;
    filteredEquipment = allEquipment;
    loadedCount = 0;

    container.innerHTML = '';
    renderBatch(allEquipment);

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='error-message'>Failed to load equipment.</p>";
  }
}

// -------------------------------
// Infinite scroll observer
// -------------------------------
function observeLastCard() {
  const cards = document.querySelectorAll('.equipment-card');
  const lastCard = cards[cards.length - 1];
  if (!lastCard) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && loadedCount < filteredEquipment.length) {
        renderBatch(filteredEquipment);
        observer.disconnect();
      }
    });
  }, { rootMargin: '150px' });

  observer.observe(lastCard);
}

// -------------------------------
// Filter buttons
// -------------------------------
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    filteredEquipment = filter === 'all'
      ? allEquipment
      : allEquipment.filter(item => item.category === filter);

    container.innerHTML = '';
    loadedCount = 0;
    renderBatch(filteredEquipment);
  });
});

// -------------------------------
// Initialize
// -------------------------------
fetchEquipment();

// -------------------------------
// Fade-in animation CSS
// -------------------------------
const style = document.createElement('style');
style.innerHTML = `
  .fade-in {
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.6s forwards;
  }
  @keyframes fadeInUp {
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
