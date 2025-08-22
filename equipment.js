import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'YOUR_PUBLIC_ANON_KEY'; // replace with your anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const equipmentContainer = document.getElementById('equipment-container');

async function fetchEquipment() {
  try {
    equipmentContainer.innerHTML = '<p class="info-message">Loading equipment...</p>';

    const { data, error } = await supabase
      .from('equipment_db')
      .select('id, name, description, image_url, affiliate_link')
      .order('id', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      equipmentContainer.innerHTML = '<p class="info-message">No equipment items found.</p>';
      return;
    }

    equipmentContainer.innerHTML = '';
    const fragment = document.createDocumentFragment();

    data.forEach(({ id, name, description, image_url, affiliate_link }) => {
      const card = document.createElement('article');
      card.className = 'equipment-item';
      card.setAttribute('role', 'region');
      card.setAttribute('aria-labelledby', `equipment-title-${id}`);

      // Image
      if (image_url) {
        const img = document.createElement('img');
        img.src = image_url;
        img.alt = name ? `Image of ${name}` : 'Equipment image';
        img.onerror = () => {
          img.src = 'https://via.placeholder.com/600x400?text=No+Image';
        };
        card.appendChild(img);
      }

      // Content wrapper
      const content = document.createElement('div');
      content.className = 'equipment-item-content';

      // Title
      const title = document.createElement('h3');
      title.id = `equipment-title-${id}`;
      title.textContent = name || 'Unnamed Equipment';
      content.appendChild(title);

      // Description
      if (description) {
        const desc = document.createElement('p');
        desc.textContent = description;
        content.appendChild(desc);
      }

      // Buy Button
      if (affiliate_link) {
        const buyBtn = document.createElement('a');
        buyBtn.className = 'btn-buy';
        buyBtn.href = affiliate_link;
        buyBtn.target = '_blank';
        buyBtn.rel = 'noopener noreferrer nofollow';
        buyBtn.textContent = 'Buy Now';
        content.appendChild(buyBtn);
      }

      card.appendChild(content);
      fragment.appendChild(card);
    });

    equipmentContainer.appendChild(fragment);

  } catch (err) {
    console.error('Failed to load equipment:', err);
    equipmentContainer.innerHTML = `<p class="error-message">Sorry, something went wrong loading equipment.</p>`;
  }
}

// Call on page load
fetchEquipment();
