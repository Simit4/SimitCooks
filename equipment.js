import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


const equipmentContainer = document.getElementById('equipment-container');

async function fetchEquipment() {
  try {
    const { data, error } = await supabase
      .from('equipment_db')
      .select('id, name, description, image_url, affiliate_link');

    if (error) throw error;

    if (!data || data.length === 0) {
      equipmentContainer.innerHTML = '<p class="info-message">No equipment items found.</p>';
      return;
    }

    // Clear container and build equipment cards
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
        img.className = 'equipment-image';
        img.src = image_url;
        img.alt = name ? `Image of ${name}` : 'Equipment image';
        card.appendChild(img);
      }

      // Title
      const title = document.createElement('h3');
      title.className = 'equipment-title';
      title.id = `equipment-title-${id}`;
      title.textContent = name || 'Unnamed Equipment';
      card.appendChild(title);

      // Description
      if (description) {
        const desc = document.createElement('p');
        desc.className = 'equipment-description';
        desc.textContent = description;
        card.appendChild(desc);
      }

      // Buy Button
      if (affiliate_link) {
        const buyBtn = document.createElement('a');
        buyBtn.className = 'btn-buy';
        buyBtn.href = affiliate_link;
        buyBtn.target = '_blank';
        buyBtn.rel = 'noopener noreferrer nofollow';
        buyBtn.setAttribute('aria-label', `Buy ${name}`);
        buyBtn.textContent = 'Buy Now';
        card.appendChild(buyBtn);
      }

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
