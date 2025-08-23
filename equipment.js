import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials

const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const equipmentContainer = document.getElementById("equipment-container");
const filterButtons = document.querySelectorAll(".filter-btn");

// Skeleton Loader
function showSkeleton(count=6){
  equipmentContainer.innerHTML="";
  for(let i=0;i<count;i++){
    const s=document.createElement("div");
    s.className="equipment-card skeleton";
    s.innerHTML=`<div class="image-wrapper"></div><div class="card-body"><div class="skeleton-text short"></div><div class="skeleton-text"></div></div>`;
    equipmentContainer.appendChild(s);
  }
}

// Render Cards
function renderEquipment(data){
  equipmentContainer.innerHTML="";
  if(!data||data.length===0){equipmentContainer.innerHTML=`<p class="empty">No equipment found.</p>`;return;}
  data.forEach(item=>{
    const card=document.createElement("div");
    card.className="equipment-card";
    card.dataset.category=item.category||"other";
    const imgSrc=item.image_url||'https://via.placeholder.com/300x260?text=No+Image';
    card.innerHTML=`<div class="image-wrapper"><img src="${imgSrc}" alt="${item.name}" loading="lazy"></div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${item.affiliate_link?`<a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" class="btn-buy">Buy Now</a>`:""}
      </div>`;
    card.querySelector("img").onload=()=>card.querySelector("img").classList.add("loaded");
    equipmentContainer.appendChild(card);
  });
}

// Fetch Data
async function fetchEquipment(){
  try{
    showSkeleton();
    const {data,error}=await supabase.from("equipment_db").select("id,name,image_url,description,affiliate_link,category").order("id",{ascending:true});
    if(error)throw error;
    renderEquipment(data);
  }catch(err){
    console.error(err);
    equipmentContainer.innerHTML=`<p class="error">⚠️ Unable to load equipment. Please try again later.</p>`;
  }
}

// Filter Buttons
filterButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    filterButtons.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const category=btn.dataset.filter;
    const cards=document.querySelectorAll(".equipment-card");
    cards.forEach(card=>{
      if(category==="all"||card.dataset.category===category){
        card.style.display="flex";
        setTimeout(()=>card.classList.remove("hidden"),20);
      }else{
        card.classList.add("hidden");
        setTimeout(()=>card.style.display="none",300);
      }
    });
  });
});

// Init
fetchEquipment();
