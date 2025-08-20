import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://YOUR-SUPABASE-URL.supabase.co';
const supabaseKey = 'YOUR-ANON-KEY'; // keep it secure if possible
const supabase = createClient(supabaseUrl, supabaseKey);

const videosContainer = document.getElementById('videos-container');
const searchInput = document.getElementById('search-input');

// Fetch recipes with videos
async function fetchVideos() {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('has_video', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching videos:', error);
    videosContainer.innerHTML = '<p>Failed to load videos.</p>';
    return;
  }

  displayVideos(data);
}

// Render videos
function displayVideos(videos) {
  videosContainer.innerHTML = videos.map(video => `
    <div class="recipe-card">
      <img src="${video.image_url}" alt="${video.title}">
      <h3>${video.title}</h3>
      <a href="${video.video_url}" target="_blank" class="btn-video">
        <i class="fas fa-play-circle"></i> Watch Video
      </a>
    </div>
  `).join('');
}

// Search functionality
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  fetchVideos().then(videos => {
    const filtered = videos.filter(v => v.title.toLowerCase().includes(query));
    displayVideos(filtered);
  });
});

// Initial fetch
fetchVideos();
