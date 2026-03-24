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

// -------------------------------
// Skeleton loader
// -------------------------------
function showSkeleton(count = BATCH) {
  if (!gallery) {
    console.error('Gallery element not found!');
    return;
  }
  gallery.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'gallery-item skeleton';
    skeleton.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
    skeleton.style.backgroundSize = '200% 100%';
    skeleton.style.animation = 'shimmer 1.5s infinite';
    gallery.appendChild(skeleton);
  }
}

// -------------------------------
// Render batch
// -------------------------------
function renderBatch(data) {
  if (!gallery) return;
  
  const fragment = document.createDocumentFragment();
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item fade-in';
    div.innerHTML = `
      <img src="${item.url}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';">
      <div class="overlay">${item.emoji} ${item.name}</div>
    `;
    fragment.appendChild(div);
  });

  gallery.appendChild(fragment);
  loadedCount += batch.length;
  observeLastItem();
}

// -------------------------------
// Infinite scroll
// -------------------------------
function observeLastItem() {
  const items = gallery.querySelectorAll('.gallery-item');
  const lastItem = items[items.length - 1];
  if (!lastItem) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && loadedCount < filteredImages.length) {
        renderBatch(filteredImages);
        observer.disconnect();
      }
    });
  }, { rootMargin: '200px' });

  observer.observe(lastItem);
}

// -------------------------------
// Fetch images from Supabase Storage
// -------------------------------
async function fetchGallery() {
  // Check if gallery element exists
  if (!gallery) {
    console.error('❌ Gallery element with id "gallery" not found in HTML');
    return;
  }

  showSkeleton();

  try {
    console.log('🔍 Attempting to fetch from Supabase bucket: gallery');
    
    // First, test if we can list files
    const { data: listData, error: listError } = await supabase.storage
      .from('gallery')
      .list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.error('❌ Supabase storage error:', listError);
      console.error('Error details:', JSON.stringify(listError, null, 2));
      
      if (listError.message.includes('bucket not found')) {
        gallery.innerHTML = "<p style='color: red;'>⚠️ Bucket 'gallery' not found. Please create it in Supabase dashboard.</p>";
      } else if (listError.message.includes('permission')) {
        gallery.innerHTML = "<p style='color: red;'>⚠️ Permission denied. Make sure your bucket is public or you have proper RLS policies.</p>";
      } else {
        gallery.innerHTML = `<p style='color: red;'>⚠️ Error: ${listError.message}</p>`;
      }
      return;
    }

    if (!listData || listData.length === 0) {
      console.warn('⚠️ No files found in the gallery bucket!');
      gallery.innerHTML = "<p>No images found. Please upload some images to the 'gallery' bucket in Supabase.</p>";
      return;
    }

    console.log(`✅ Found ${listData.length} files:`, listData);

    // Filter and process only image files
    allImages = listData
      .filter(file => {
        const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
        if (!isImage) {
          console.log(`⏭️ Skipping non-image file: ${file.name}`);
        }
        return isImage;
      })
      .map(file => {
        const nameLower = file.name.toLowerCase();
        let category = 'main', emoji = '🍲';
        
        if (nameLower.startsWith('appetizer')) { 
          category = 'appetizer'; 
          emoji = '🥗'; 
        } else if (nameLower.startsWith('dessert')) { 
          category = 'dessert'; 
          emoji = '🍰'; 
        } else if (nameLower.startsWith('main')) { 
          category = 'main'; 
          emoji = '🍲'; 
        }

        // Clean up the name for display
        let name = file.name
          .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
          .replace(/[_\-]/g, ' ')
          .replace(/\b(appetizer|main|dessert)\b/gi, '')
          .trim();

        // If name is empty after cleaning, use a default
        if (!name) {
          name = 'Delicious Dish';
        }

        // Capitalize first letter of each word
        name = name.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('gallery')
          .getPublicUrl(file.name);
        
        const url = urlData.publicUrl;
        console.log(`🖼️ Processed image: ${name} (${category}) - URL: ${url}`);
        
        return { url, name, category, emoji };
      });

    console.log(`✅ Successfully processed ${allImages.length} images`);

    if (allImages.length === 0) {
      gallery.innerHTML = "<p>No valid images found. Please upload JPG, PNG, WEBP, or GIF files to your gallery bucket.</p>";
      return;
    }

    filteredImages = allImages;
    loadedCount = 0;
    gallery.innerHTML = '';
    renderBatch(filteredImages);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    gallery.innerHTML = `<p style='color: red;'>⚠️ Error loading gallery: ${error.message}</p>`;
  }
}

// -------------------------------
// Filter buttons
// -------------------------------
if (filterButtons.length > 0) {
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelector('.filter-btn.active')?.classList.remove('active');
      btn.classList.add('active');

      const filter = btn.dataset.category;
      if (filter === 'all') {
        filteredImages = allImages;
      } else {
        filteredImages = allImages.filter(img => img.category === filter);
      }

      gallery.innerHTML = '';
      loadedCount = 0;
      renderBatch(filteredImages);
    });
  });
} else {
  console.warn('No filter buttons found. Make sure you have elements with class "filter-btn"');
}

// Add CSS animation for shimmer effect if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .gallery-item.skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
`;
document.head.appendChild(style);

// -------------------------------
// Initialize
// -------------------------------
fetchGallery();
