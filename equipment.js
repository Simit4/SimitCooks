import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const equipmentContainer = document.getElementById("equipment-container");
const filterButtons = document.querySelectorAll(".filter-btn");

// -------------------
// Skeleton Loader
// -------------------
function showSkeleton(count = 6) {
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

// -------------------
// Render Equipment
// -------------------
function renderEquipment(data) {
  equipmentContainer.innerHTML = "";

  if (!data || data.length === 0) {
    // Show placeholder if no data
    equipmentContainer.innerHTML = `<p class="empty">No equipment found.</p>`;
    return;
  }

  data.forEach(item => {
    const card = document.createElement("div");
    card.className = "equipment-card";
    card.dataset.category = item.category || "other";

    const imgSrc = item.image_url || 'https://via.placeholder.com/300x260?text=No+Image';
    const rating = item.rating || Math.floor(Math.random() * 5 + 1);

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${imgSrc}" alt="${item.name}" loading="lazy">
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" class="btn-buy">Buy Now</a>` : ""}
      </div>
      <div class="overlay">
        <div class="rating">${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}</div>
        ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" class="btn-quick">Quick View</a>` : ""}
      </div>
    `;

    // Smooth image fade-in
    const img = card.querySelector("img");
    img.onload = () => img.classList.add("loaded");

    equipmentContainer.appendChild(card);
  });
}

// -------------------
// Fetch Equipment from Supabase
// -------------------
async function fetchEquipment() {
  try {
    showSkeleton(); // show skeleton

    const { data, error, status } = await supabase
      .from("equipment_db")
      .select("id,name,image_url,description,affiliate_link,category")
      .order("id", { ascending: true });

    console.log("Supabase Status:", status);
    console.log("Data:", data);
    console.log("Error:", error);

    if (error) throw error;
    renderEquipment(data);

  } catch (err) {
    console.error("Fetch Error:", err);
    // Show placeholders
    equipmentContainer.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const card = document.createElement("div");
      card.className = "equipment-card";
      card.innerHTML = `
        <div class="image-wrapper">
          <img src="https://via.placeholder.com/300x260?text=No+Image" alt="Placeholder">
        </div>
        <div class="card-body">
          <h3>Placeholder Item</h3>
          <p>Description unavailable.</p>
        </div>
      `;
      equipmentContainer.appendChild(card);
    }
  }
}

// -------------------
// Filter Buttons
// -------------------
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    const allCards = document.querySelectorAll(".equipment-card");

    allCards.forEach(card => {
      if (filter === "all" || card.dataset.category === filter) card.style.display = "flex";
      else card.style.display = "none";
    });
  });
});

// -------------------
// Mobile Menu
// -------------------
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navLinks.classList.toggle("active");
});

// -------------------
// Initialize
// -------------------
fetchEquipment();
