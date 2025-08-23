import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const equipmentContainer = document.getElementById("equipment-container");

async function fetchEquipment() {
  try {
    equipmentContainer.innerHTML = "Loading...";

    const { data, error } = await supabase
      .from("equipment_db")
      .select("id, name, image_url, description, affiliate_link")
      .order("id");

    if (error) throw error;
    if (!data || data.length === 0) {
      equipmentContainer.innerHTML = "No equipment found.";
      return;
    }

    equipmentContainer.innerHTML = "";
    data.forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = `
        <img src="${item.image_url}" alt="${item.name}" style="width:100%">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <a href="${item.affiliate_link}" target="_blank">Buy Now</a>
      `;
      equipmentContainer.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    equipmentContainer.innerHTML = "Error loading equipment.";
  }
}

fetchEquipment();
