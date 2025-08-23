import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Supabase credentials
const supabaseUrl = 'https://ozdwocrbrojtyogolqxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const container = document.getElementById('equipment-container');
const filterButtons = document.querySelectorAll('.filter-btn');
let allEquipment = [];
let loadedCount = 0;
const BATCH = 6;

// Skeleton loader
function showSkeleton(count = BATCH){
  container.innerHTML = '';
  for(let i=0;i<count;i++){
    const skeleton = document.createElement('div');
    skeleton.className='equipment-card skeleton';
    skeleton.innerHTML=`<div class="image-wrapper"></div><div class="card-body"></div>`;
    container.appendChild(skeleton);
  }
}

// Render batch
function renderBatch(data){
  const fragment = document.createDocumentFragment();
  const batch = data.slice(loadedCount, loadedCount + BATCH);

  batch.forEach((item, index)=>{
    const card = document.createElement('div');
    card.className='equipment-card';
    const shortDesc = item.description ? item.description.split('. ')[0]+'.' : '';
    card.innerHTML=`
      <div class="image-wrapper">
        <img src="${item.image_url}" alt="${item.name}">
        ${item.category ? `<span class="category-badge">${item.category}</span>` : ''}
      </div>
      <div class="card-body" title="${item.description}">
        <h3>${item.name}</h3>
        <p>${shortDesc}</p>
        ${item.affiliate_link ? `<a href="${item.affiliate_link}" target="_blank" rel="noopener noreferrer" class="btn-buy">Buy Now</a>` : ''}
      </div>
    `;
    card.style.animationDelay = `${(loadedCount+index)*0.08}s`;
    fragment.appendChild(card);
  });

  container.appendChild(fragment);
  loadedCount += batch.length;
}

// Fetch equipment
async function fetchEquipment(){
  try{
    showSkeleton();
    const { data, error } = await supabase
      .from('equipment_db')
      .select('id,name,image_url,description,affiliate_link,category')
      .order('id');
    if(error) throw error;
    allEquipment = data;
    loadedCount = 0;
    container.innerHTML='';
    renderBatch(allEquipment);
  }catch(err){
    console.error(err);
    container.innerHTML="<p class='error-message'>Failed to load equipment.</p>";
  }
}

// Lazy load
window.addEventListener('scroll', ()=>{
  if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 200){
    if(loadedCount<allEquipment.length) renderBatch(allEquipment);
  }
});

// Filters
filterButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelector('.filter-btn.active')?.classList.remove('active');
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    const filtered = filter==='all' ? allEquipment : allEquipment.filter(i=>i.category===filter);
    container.innerHTML='';
    loadedCount=0;
    renderBatch(filtered);
  });
});

fetchEquipment();
