import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const equipmentContainer = document.getElementById("equipment-container");

// Show loading state
equipmentContainer.innerHTML = `<p class="loading">Loading equipment...</p>`;

async function fetchEquipment() {
  const { data, error } = await supabase
    .from("equipment")
    .select("id, name, image, link")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching equipment:", error);
    equipmentContainer.innerHTML = `<p class="error">⚠️ Unable to load equipment. Please try again later.</p>`;
    return;
  }

  if (!data || data.length === 0) {
    equipmentContainer.innerHTML = `<p class="empty">No equipment found yet.</p>`;
    return;
  }

  equipmentContainer.innerHTML = "";

  data.forEach(item => {
    const card = document.createElement("a");
    card.href = item.link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "equipment-card";

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
      </div>
    `;

    const img = card.querySelector("img");
    img.onload = () => img.classList.add("loaded");

    equipmentContainer.appendChild(card);
  });
}

fetchEquipment();
