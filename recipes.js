import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// =================================================
// 🔹 Configuration & Constants
// =================================================
const CONFIG = {
  supabaseUrl: 'https://ozdwocrbrojtyogolqxn.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96ZHdvY3Jicm9qdHlvZ29scXhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1NzE5MzMsImV4cCI6MjA2NjE0NzkzM30.-MAiUtrdza-T2q8POxY-ZcZuZr5QYzFYq5yd-bVYzRQ',
  fallbackImage: 'https://i.ibb.co/4p4mR3N/momo-graphic.png',
  debounceDelay: 300,
  skeletonCount: 6,
  debug: false
};

// =================================================
// 🔹 Category Mapping - Group similar categories
// =================================================
const CATEGORY_MAP = {
  'main': 'Main', 'main dish': 'Main', 'entree': 'Main', 'curry': 'Main', 'rice': 'Main', 'noodle': 'Main',
  'sauce': 'Sauce', 'dip': 'Sauce', 'chutney': 'Sauce', 'condiment': 'Sauce', 'jhol': 'Sauce',
  'side': 'Side', 'accompaniment': 'Side', 'salad': 'Side',
  'dessert': 'Dessert', 'sweet': 'Dessert',
  'snack': 'Snack', 'appetizer': 'Snack', 'starter': 'Snack', 'street food': 'Snack',
  'breakfast': 'Breakfast',
  'beverage': 'Beverage', 'drink': 'Beverage',
  'festival': 'Festival', 'special': 'Festival'
};

// =================================================
// 🔹 Initialize Supabase
// =================================================
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseKey);

// =================================================
// 🔹 DOM Elements
// =================================================
const elements = {
  container: document.getElementById('recipes-container'),
  searchInput: document.getElementById('search-input'),
  filterContainer: document.querySelector('.filters')
};

// =================================================
// 🔹 Application State
// =================================================
const state = {
  recipes: [],
  filteredRecipes: [],
  categories: [],
  currentFilter: 'all',
  currentSearch: '',
  isLoading: false,
  error: null
};

// =================================================
// 🔹 Utility Functions
// =================================================
const safeText = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value.trim() || defaultValue;
  return String(value) || defaultValue;
};

const getMappedCategory = (rawCategory) => {
  const lowerCat = safeText(rawCategory).toLowerCase();
  return CATEGORY_MAP[lowerCat] || (lowerCat.charAt(0).toUpperCase() + lowerCat.slice(1));
};

const getRecipeCategories = (recipe) => {
  if (!recipe.category) return [];
  const rawCategories = Array.isArray(recipe.category) ? recipe.category : [recipe.category];
  const mapped = new Set();
  rawCategories.forEach(cat => { const m = getMappedCategory(cat); if (m) mapped.add(m); });
  return Array.from(mapped);
};

const extractExistingCategories = (recipes) => {
  const categorySet = new Set();
  recipes.forEach(recipe => getRecipeCategories(recipe).forEach(cat => categorySet.add(cat)));
  const orderPriority = { 'Main':1,'Sauce':2,'Side':3,'Dessert':4,'Snack':5,'Breakfast':6,'Beverage':7,'Festival':8 };
  return Array.from(categorySet).sort((a,b)=>{
    const pa = orderPriority[a]||99, pb = orderPriority[b]||99;
    return pa!==pb ? pa-pb : a.localeCompare(b);
  });
};

const matchesCategory = (recipe, filterValue) => {
  if (filterValue === 'all') return true;
  return getRecipeCategories(recipe).includes(filterValue);
};

const escapeHtml = (text) => {
  const safe = safeText(text);
  const map = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'};
  return safe.replace(/[&<>"'/`=]/g,char => map[char]);
};

const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns){const m = url.match(p); if(m?.[1]) return m[1];}
  return null;
};

const getThumbnail = (recipe) => {
  if (recipe.thumbnail_url?.trim()) return recipe.thumbnail_url;
  const vid = extractYouTubeId(recipe.video_url);
  return vid ? `https://img.youtube.com/vi/${vid}/maxresdefault.jpg` : CONFIG.fallbackImage;
};

const isValidRecipe = (recipe) => recipe && typeof recipe === 'object' && (recipe.title || recipe.slug);

// =================================================
// 🔹 Filter Buttons
// =================================================
const createFilterButtons = () => {
  if (!elements.filterContainer) return;
  elements.filterContainer.innerHTML = '';
  const allBtn = document.createElement('button'); allBtn.className='filter-btn active'; allBtn.setAttribute('data-filter','all'); allBtn.textContent='All';
  elements.filterContainer.appendChild(allBtn);
  state.categories.forEach(cat => {
    const btn = document.createElement('button'); btn.className='filter-btn'; btn.setAttribute('data-filter',cat); btn.textContent=cat;
    elements.filterContainer.appendChild(btn);
  });
  attachFilterListeners();
};

const attachFilterListeners = () => {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.removeEventListener('click', handleFilterClick);
    btn.addEventListener('click', handleFilterClick);
  });
};

const handleFilterClick = (e) => {
  const btn = e.currentTarget;
  state.currentFilter = btn.getAttribute('data-filter');
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  if(elements.searchInput){elements.searchInput.value=''; state.currentSearch='';}
  renderRecipes();
};

// =================================================
// 🔹 Recipe Cards & Loading
// =================================================
const createSkeleton = () => {
  const sk = document.createElement('div'); sk.className='recipe-card skeleton-card'; sk.setAttribute('aria-label','Loading...');
  sk.innerHTML = `<div class="thumbnail-wrapper skeleton-thumbnail"></div><div class="card-body"><div class="skeleton-title"></div><div class="skeleton-text"></div><div class="skeleton-text" style="width:60%"></div></div>`;
  return sk;
};

const showLoading = () => {
  if (!elements.container || state.isLoading) return;
  state.isLoading = true; elements.container.innerHTML=''; elements.container.classList.add('loading');
  for(let i=0;i<CONFIG.skeletonCount;i++){elements.container.appendChild(createSkeleton());}
};

const hideLoading = () => { if(!elements.container) return; state.isLoading=false; elements.container.classList.remove('loading'); };

const createRecipeCard = (recipe) => {
  if (!isValidRecipe(recipe)) return null;
  const title = safeText(recipe.title,'Untitled Recipe');
  const desc = safeText(recipe.description,'Delicious home-style recipe made with love.');
  const categories = getRecipeCategories(recipe);
  const slug = safeText(recipe.slug);
  const thumbnail = getThumbnail(recipe);

  const card = document.createElement('div'); card.className='recipe-card'; card.setAttribute('data-slug',slug); card.setAttribute('data-categories',categories.join(','));
  card.addEventListener('click',(e)=>{ e.preventDefault(); if(slug) window.location.href=`/recipe/${slug}`; });
  card.innerHTML=`
    <div class="thumbnail-wrapper"><img src="${thumbnail}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='${CONFIG.fallbackImage}'"/></div>
    <div class="card-body"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p></div>
  `;
  return card;
};

const showNoResults = () => {
  if(!elements.container) return;
  const filterName = state.currentFilter==='all'?'recipes':state.currentFilter;
  const searchTerm = state.currentSearch?` matching "${escapeHtml(state.currentSearch)}"`:'';
  elements.container.innerHTML=`<div class="no-results"><i class="fas fa-search"></i><h3>No Recipes Found</h3><p>We couldn't find any ${escapeHtml(filterName)}${searchTerm}.</p><button onclick="location.reload()" class="retry-btn"><i class="fas fa-sync-alt"></i> Show All Recipes</button></div>`;
};

const showError = (msg) => {
  if(!elements.container) return;
  elements.container.innerHTML=`<div class="error-message"><i class="fas fa-exclamation-triangle"></i><h3>Something Went Wrong</h3><p>${escapeHtml(msg)}</p><button onclick="location.reload()" class="retry-btn"><i class="fas fa-sync-alt"></i> Try Again</button></div>`;
};

// =================================================
// 🔹 Filtering Logic
// =================================================
const applyFilters = () => {
  let filtered = [...state.recipes];
  if(state.currentFilter!=='all'){filtered=filtered.filter(r=>matchesCategory(r,state.currentFilter));}
  if(state.currentSearch.trim()){const term=state.currentSearch.toLowerCase().trim(); filtered=filtered.filter(r=>{
    const title = safeText(r.title).toLowerCase();
    const desc = safeText(r.description).toLowerCase();
    const cats = getRecipeCategories(r).join(' ').toLowerCase();
    return title.includes(term)||desc.includes(term)||cats.includes(term);
  });}
  state.filteredRecipes=filtered;
  return filtered;
};

const renderRecipes = () => {
  if(!elements.container) return;
  const filtered = applyFilters();
  if(!filtered.length){showNoResults(); return;}
  const fragment = document.createDocumentFragment();
  filtered.forEach(r=>{const card=createRecipeCard(r); if(card) fragment.appendChild(card);});
  elements.container.innerHTML=''; elements.container.appendChild(fragment);

  // 🔹 Staggered animations for unlimited cards
  const cards = document.querySelectorAll('.recipe-card');
  cards.forEach((card,index)=>{
    card.style.animation = `fadeInUp 0.6s ease forwards`;
    card.style.animationDelay = `${0.1*(index+1)}s`;
  });

  if(window.innerWidth<=768 && (state.currentFilter!=='all' || state.currentSearch)){window.scrollTo({top:0, behavior:'smooth'});}
};

// =================================================
// 🔹 Data Fetching
// =================================================
const fetchRecipes = async () => {
  showLoading();
  try{
    const {data,error,status} = await supabase.from('recipe_db').select('*').order('created_at',{ascending:false});
    if(error) throw new Error(error.message);
    if(status!==200) throw new Error(`HTTP ${status}: Failed`);
    if(!data?.length){showNoResults(); hideLoading(); return;}
    state.recipes = data.filter(isValidRecipe);
    state.categories = extractExistingCategories(state.recipes);
    createFilterButtons();
    renderRecipes();
    hideLoading();
  }catch(err){console.error('Fetch error:',err); showError(err.message||'Unable to load recipes.'); hideLoading();}
};

// =================================================
// 🔹 Search Handler
// =================================================
const handleSearch = (value) => { state.currentSearch=value; renderRecipes(); };
const debounce = (func,delay)=>{ let timeoutId; return (...args)=>{clearTimeout(timeoutId); timeoutId=setTimeout(()=>func.apply(this,args),delay);}; };

// =================================================
// 🔹 Event Listeners
// =================================================
const initEventListeners = () => {
  if(elements.searchInput){
    const debouncedSearch = debounce(handleSearch,CONFIG.debounceDelay);
    elements.searchInput.addEventListener('input',(e)=>{ debouncedSearch(e.target.value); });
  }
};

// =================================================
// 🔹 Initialize Application
// =================================================
const init = () => {
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',()=>{ initEventListeners(); fetchRecipes(); });}
  else {initEventListeners(); fetchRecipes();}
};

// Start the app
init();

// Debugging
window.recipesDebug = {state, CONFIG, getRecipeCategories, extractExistingCategories};
