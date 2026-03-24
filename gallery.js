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
const BUCKET_NAME = 'storage-files-bucket-gallery';

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
      <img src="${item.url}" alt="${item.name}" loading="lazy" onerror="this.onerror=null; console.error('Failed to load image:', '${item.url}'); this.src='https://via.placeholder.com/300x200?text=Load+Failed';">
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
// Debug function to check bucket contents
// -------------------------------
async function debugBucket() {
  console.log('🔍 DEBUG: Checking bucket contents...');
  console.log('Bucket name:', BUCKET_NAME);
  
  try {
    // List all files in bucket
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      console.error('❌ DEBUG: Error listing bucket:', error);
      return;
    }

    console.log('✅ DEBUG: Raw data from bucket:', data);
    console.log('✅ DEBUG: Number of items:', data?.length);
    
    if (data && data.length > 0) {
      console.log('📁 DEBUG: First few files:');
      data.slice(0, 5).forEach((file, index) => {
        console.log(`  ${index + 1}. Name: "${file.name}"`);
        console.log(`     Size: ${file.metadata?.size || 'unknown'} bytes`);
        console.log(`     Is image? ${/\.(jpg|jpeg|png|webp|gif)$/i.test(file.name)}`);
      });
      
      // Test if we can get a public URL for the first image
      if (data[0]) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(data[0].name);
        console.log('🖼️ DEBUG: Example public URL:', urlData.publicUrl);
      }
    } else {
      console.warn('⚠️ DEBUG: No items found in bucket!');
    }
  } catch (err) {
    console.error('❌ DEBUG: Unexpected error:', err);
  }
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
    console.log(`🔍 Fetching from Supabase bucket: ${BUCKET_NAME}`);
    
    // First, run debug to see what's in the bucket
    await debugBucket();
    
    // List files from bucket
    const { data: listData, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      console.error('❌ Supabase storage error:', listError);
      gallery.innerHTML = `<p style='color: red;'>⚠️ Error: ${listError.message}</p>`;
      return;
    }

    if (!listData || listData.length === 0) {
      console.warn(`⚠️ No files found in the ${BUCKET_NAME} bucket!`);
      gallery.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p>📁 No images found in bucket: ${BUCKET_NAME}</p>
          <p>Please upload images to your Supabase storage bucket.</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">Refresh</button>
        </div>
      `;
      return;
    }

    console.log(`✅ Found ${listData.length} files in bucket`);

    // Process all files (including non-images for debugging)
    allImages = [];
    
    for (const file of listData) {
      console.log(`Processing file: "${file.name}"`);
      
      // Check if it's an image file
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
      
      if (!isImage) {
        console.log(`⏭️ Skipping non-image: ${file.name}`);
        continue;
      }
      
      const nameLower = file.name.toLowerCase();
      let category = 'main', emoji = '🍲';
      
      if (nameLower.includes('appetizer') || nameLower.startsWith('appetizer')) { 
        category = 'appetizer'; 
        emoji = '🥗'; 
      } else if (nameLower.includes('dessert') || nameLower.startsWith('dessert')) { 
        category = 'dessert'; 
        emoji = '🍰'; 
      } else if (nameLower.includes('main') || nameLower.startsWith('main')) { 
        category = 'main'; 
        emoji = '🍲'; 
      }

      // Clean up the name for display
      let name = file.name
        .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
        .replace(/[_\-]/g, ' ')
        .replace(/\b(appetizer|main|dessert)\b/gi, '')
        .trim();

      if (!name) {
        name = 'Delicious Dish';
      }

      // Capitalize first letter of each word
      name = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name);
      
      const url = urlData.publicUrl;
      console.log(`✅ Added image: ${name} (${category})`);
      console.log(`   URL: ${url}`);
      
      allImages.push({ url, name, category, emoji });
    }

    console.log(`✅ Successfully processed ${allImages.length} images`);

    if (allImages.length === 0) {
      gallery.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <p>🖼️ Found ${listData.length} file(s) in bucket, but none are valid images.</p>
          <p>Supported formats: JPG, JPEG, PNG, WEBP, GIF</p>
          <p>Files found: ${listData.map(f => f.name).join(', ')}</p>
        </div>
      `;
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
  console.warn('No filter buttons found');
}

// Add CSS animation
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
