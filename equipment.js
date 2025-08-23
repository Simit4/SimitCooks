import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('equipment-container');
const filterButtons = document.querySelectorAll('.filter-btn');
let allEquipment = [];

function showSkeleton(count=3){
  container.innerHTML = '';
  for(let i=0;i<count;i++){
    const skeleton = document.createElement('div');
    skeleton.className = 'equipment-card skeleton';
    skeleton.innerHTML = `<div class="image-wrapper"></div><div class="card-body"></div>`;
    container.appendChild(skeleton);
  }
}

function renderEquipment(data){
  container.innerHTML = '';
  if(!data || data.length===0){
    container.innerHTML="<p>No equipment found.</p>";
    return;
  }
  data.forEach(item=>{
    const card = document.createElement('div');
    card.className='equipment-card';
    card.innerHTML=`
      <div class="image-wrapper">
        <img src="${item.image_url}" alt="${item.name}">
      </div>
      <div class="card-body">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" class="btn-buy">Buy Now</a>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

// Fetch all equipment
async function fetchEquipment(){
  try{
    showSkeleton();
    const { data, error } = await supabase
      .from('equipment_db')
      .select('id,name,image_url,description,affiliate_link,category')
      .order('id');

    if(error) throw error;
    allEquipment = data;
    renderEquipment(allEquipment);
  }catch(err){
    console.error(err);
    container.innerHTML="<p>Error loading equipment.</p>";
  }
}

// Filter buttons
filterButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    if(filter==='all') renderEquipment(allEquipment);
    else renderEquipment(allEquipment.filter(item=>item.category===filter));
  });
});

fetchEquipment();
