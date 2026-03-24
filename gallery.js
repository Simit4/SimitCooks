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
let glightbox = null;
let currentObserver = null;

// Helper function to extract filename without extension
function getFileNameWithoutExtension(filename) {
  return filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '').replace(/_/g, ' ').trim();
}

// Show skeleton loader
function showSkeleton(count = BATCH) {
  if (!gallery) return;
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton';
    gallery.appendChild(sk);
  }
}

// Show error message
function showError(message) {
  if (!gallery) return;
  gallery.innerHTML = `
    <div style="text-align:center;padding:2rem;">
      <p style="color:#dc2626;margin-bottom:1rem;">❌ ${message}</p>
      <button onclick="location.reload()" style="padding:0.5rem 1rem;background:#3b82f6;color:white;border:none;border-radius:0.375rem;cursor:pointer;">
        Retry
      </button>
    </div>
  `;
}

// Fetch images from Supabase
async function fetchGallery() {
  showSkeleton();

  try {
    // Fetch metadata and files in parallel for better performance
    const [metadataResult, filesResult] = await Promise.all([
      supabase.from('gallery_metadata').select('file_name, description, emoji, category'),
      supabase.storage.from('gallery').list()
    ]);

    if (metadataResult.error) throw metadataResult.error;
    if (filesResult.error) throw filesResult.error;

    const metadata = metadataResult.data || [];
    const files = filesResult.data || [];

    // Create a map for faster metadata lookup
    const metadataMap = new Map();
    metadata.forEach(meta => {
      metadataMap.set(meta.file_name.toLowerCase(), meta);
    });

    allImages = files
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name))
      .map(f => {
        const meta = metadataMap.get(f.name.toLowerCase());
        const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(f.name);
        
        return {
          url: publicUrl,
          name: getFileNameWithoutExtension(f.name),
          category: meta?.category || 'main',
          emoji: meta?.emoji || '🍲',
          description: meta?.description || 'No description yet.',
          originalName: f.name
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

    if (allImages.length === 0) {
      showError('No images found in the gallery.');
      return;
    }

    filteredImages = [...allImages];
    loadedCount = 0;
    if (gallery) gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch (err) {
    console.error('Gallery fetch error:', err);
    showError('Failed to load gallery. Please try again later.');
  }
}

// Render a batch of images
function renderBatch(data) {
  if (!gallery) return;
  
  const batch = data.slice(loadedCount, loadedCount + BATCH);
  if (batch.length === 0) return;

  const fragment = document.createDocumentFragment();

  batch.forEach((img, i) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.className = 'glightbox';
    link.setAttribute('data-gallery', 'gallery');
    link.setAttribute('data-title', `${img.emoji} ${img.name}`);
    link.setAttribute('data-description', img.description);

    link.innerHTML = `
      <div class="gallery-item fade-in" style="animation-delay:${i * 50}ms">
        <img src="${img.url}" alt="${img.name}" loading="lazy">
        <div class="overlay">
          <div class="title">${escapeHtml(img.emoji)} ${escapeHtml(img.name)}</div>
          <div class="description">${escapeHtml(img.description)}</div>
        </div>
      </div>
    `;

    fragment.appendChild(link);
  });

  gallery.appendChild(fragment);
  loadedCount += batch.length;

  // Initialize or refresh GLightbox
  if (typeof GLightbox !== 'undefined') {
    if (!glightbox) {
      glightbox = GLightbox({
        selector: '.glightbox',
        openEffect: 'zoom',
        closeEffect: 'zoom',
        slideEffect: 'slide',
        zoomable: true,
        loop: true,
        autoplayVideos: false,
        touchNavigation: true
      });
    } else {
      glightbox.reload();
    }
  }

  // Setup infinite scroll
  setupInfiniteScroll();
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Setup intersection observer for infinite scroll
function setupInfiniteScroll() {
  if (currentObserver) {
    currentObserver.disconnect();
  }

  const lastItems = document.querySelectorAll('.gallery-item');
  const lastItem = lastItems[lastItems.length - 1];
  
  if (!lastItem) return;

  currentObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && loadedCount < filteredImages.length) {
        currentObserver.disconnect();
        renderBatch(filteredImages);
      }
    });
  }, { rootMargin: '250px' });

  currentObserver.observe(lastItem);
}

// Handle filter button clicks
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button state
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    
    // Filter images
    const category = btn.dataset.category;
    filteredImages = category === 'all' 
      ? [...allImages] 
      : allImages.filter(img => img.category === category);
    
    // Reset and re-render
    if (gallery) gallery.innerHTML = '';
    loadedCount = 0;
    renderBatch(filteredImages);
    
    // Scroll to top when filtering
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});

// Add debounced resize handler for GLightbox
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (glightbox) {
      glightbox.reload();
    }
  }, 250);
});

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  fetchGallery();
});

// Optional: Add keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && glightbox) {
    glightbox.close();
  }
});

// Optional: Prefetch next batch on hover near bottom
let prefetchTimeout;
window.addEventListener('scroll', () => {
  if (prefetchTimeout) clearTimeout(prefetchTimeout);
  prefetchTimeout = setTimeout(() => {
    const scrollPosition = window.innerHeight + window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    
    // If user is within 500px of bottom, prefetch next batch
    if (documentHeight - scrollPosition < 500 && loadedCount < filteredImages.length) {
      const nextBatch = filteredImages.slice(loadedCount, loadedCount + BATCH);
      if (nextBatch.length > 0) {
        // Preload images in background
        nextBatch.forEach(img => {
          const preloadLink = document.createElement('link');
          preloadLink.rel = 'preload';
          preloadLink.as = 'image';
          preloadLink.href = img.url;
          document.head.appendChild(preloadLink);
        });
      }
    }
  }, 150);
});
