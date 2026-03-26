import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('equipment-container');
const filterButtons = document.querySelectorAll('.filter-btn');

let allEquipment = [];
let filteredEquipment = [];
let loadedCount = 0; 
const BATCH = 20;

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
        <img src="${item.image_url}" alt="${item.name}" loading="lazy">
        ${item.category ? `<span class="category-badge">${item.category}</span>` : ''}
        <div class="overlay">
          <p>${shortDesc}</p>
          ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" class="btn-buy" rel="noopener noreferrer">Buy Now</a>` : ''}
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
  
  // Add mobile tap functionality to newly rendered cards
  addMobileTapToCards();
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
// Mobile Tap Functionality - Make overlay work on mobile
// -------------------------------
function addMobileTapToCards() {
  const cards = document.querySelectorAll('.equipment-card');
  
  // Remove existing event listeners to avoid duplicates
  cards.forEach(card => {
    card.removeEventListener('click', handleCardClick);
    card.addEventListener('click', handleCardClick);
  });
}

// Handle card click/tap
function handleCardClick(e) {
  // Don't trigger if clicking on buy button
  if (e.target.closest('.btn-buy')) {
    e.stopPropagation();
    return;
  }
  
  const clickedCard = this;
  const allCards = document.querySelectorAll('.equipment-card');
  
  // Close all other overlays
  allCards.forEach(card => {
    if (card !== clickedCard) {
      card.classList.remove('active');
    }
  });
  
  // Toggle active class on clicked card
  clickedCard.classList.toggle('active');
  
  // Optional: Auto close after 3 seconds
  if (clickedCard.classList.contains('active')) {
    if (clickedCard.timeoutId) clearTimeout(clickedCard.timeoutId);
    clickedCard.timeoutId = setTimeout(() => {
      clickedCard.classList.remove('active');
    }, 3000);
  }
}

// Close overlay when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.equipment-card')) {
    const allCards = document.querySelectorAll('.equipment-card');
    allCards.forEach(card => {
      card.classList.remove('active');
      if (card.timeoutId) clearTimeout(card.timeoutId);
    });
  }
});

// Close overlay when pressing Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    const allCards = document.querySelectorAll('.equipment-card');
    allCards.forEach(card => {
      card.classList.remove('active');
      if (card.timeoutId) clearTimeout(card.timeoutId);
    });
  }
});

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
  
  /* Mobile tap overlay styles */
  .equipment-card.active .overlay {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Visual feedback for tap */
  .equipment-card.active {
    transform: scale(0.98);
    transition: transform 0.1s ease;
  }
  
  /* Ensure buy button clicks work properly */
  .btn-buy {
    position: relative;
    z-index: 10;
    pointer-events: auto;
  }
  
  /* Make overlay click-through on mobile */
  @media (max-width: 768px) {
    .overlay {
      pointer-events: none;
    }
    .equipment-card.active .overlay {
      pointer-events: auto;
    }
  }
`;
document.head.appendChild(style);
