import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const equipmentContainer = document.getElementById("equipment-container");

// Skeleton loader
function showSkeleton(count = 4) {
  equipmentContainer.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "equipment-card skeleton";
    skeleton.innerHTML = `
      <div class="image-wrapper"></div>
      <div class="card-body">
        <div class="skeleton-text short"></div>
        <div class="skeleton-text"></div>
      </div>
    `;
    equipmentContainer.appendChild(skeleton);
  }
}

// Render equipment
function renderEquipment(data) {
  equipmentContainer.innerHTML = "";

  if (!data || data.length === 0) {
    equipmentContainer.innerHTML = `<p class="empty">No equipment found.</p>`;
    return;
  }

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "equipment-card";

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${item.image_url}" alt="${item.name}">
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" class="btn-buy">Buy Now</a>` : ""}
      </div>
    `;

    const img = card.querySelector("img");
    img.onload = () => img.classList.add("loaded");

    equipmentContainer.appendChild(card);
  });
}

// Fetch from Supabase
async function fetchEquipment() {
  try {
    showSkeleton(); // show skeleton while loading

    const { data, error } = await supabase
      .from("equipment_db")
      .select("id, name, image_url, description, affiliate_link")
      .order("id", { ascending: true });

    if (error) throw error;
    renderEquipment(data);
  } catch (err) {
    console.error("Error fetching equipment:", err);
    equipmentContainer.innerHTML = `<p class="error">⚠️ Unable to load equipment. Please try again later.</p>`;
  }
}

// Run on page load
fetchEquipment();
