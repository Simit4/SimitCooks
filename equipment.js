import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);


async function fetchEquipment() {
  const { data, error } = await supabase.from('equipment').select('*');
  if (error) {
    console.error('Error fetching equipment:', error);
    return;
  }

  const container = document.getElementById('equipment-container');
  container.innerHTML = data.map(item => `
    <div class="equipment-card">
      <div class="equipment-image">
        <img src="${item.image_url}" alt="${item.title}">
      </div>
      <div class="equipment-info">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <a href="${item.link}" target="_blank" class="buy-btn">
          <i class="fas fa-cart-shopping"></i> Buy on Amazon
        </a>
      </div>
    </div>
  `).join('');
}

fetchEquipment();
