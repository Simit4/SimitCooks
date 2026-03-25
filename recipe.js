/* =================================================
   🔥 INSTAGRAM-LEVEL RECIPE APP — ULTIMATE EDITION
   =================================================
   Features:
   - Dynamic recipe rendering with fallback data
   - LocalStorage favorites & recently viewed
   - Interactive equipment grid with modal
   - Print optimization with dynamic content
   - Smooth scroll animations
   - Dark mode toggle (auto-detects system)
   - Share functionality (native Web Share API)
   - Reading progress indicator
   - Animated counters for nutrition
   ================================================= */

class RecipeApp {
  constructor() {
    this.recipeData = null;
    this.favorites = this.loadFromStorage('favorites', []);
    this.recentlyViewed = this.loadFromStorage('recentlyViewed', []);
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.init();
  }

  // ==================== STORAGE UTILS ====================
  loadFromStorage(key, defaultValue) {
    try {
      const stored = localStorage.getItem(`recipe_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  saveToStorage(key, value) {
    try {
      localStorage.setItem(`recipe_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  updateRecentlyViewed(recipeId) {
    this.recentlyViewed = [recipeId, ...this.recentlyViewed.filter(id => id !== recipeId)].slice(0, 5);
    this.saveToStorage('recentlyViewed', this.recentlyViewed);
  }

  toggleFavorite(recipeId) {
    if (this.favorites.includes(recipeId)) {
      this.favorites = this.favorites.filter(id => id !== recipeId);
      this.showToast('Removed from favorites 💔', 'remove');
    } else {
      this.favorites.push(recipeId);
      this.showToast('Added to favorites ❤️', 'add');
    }
    this.saveToStorage('favorites', this.favorites);
    this.updateFavoriteButton(recipeId);
  }

  isFavorite(recipeId) {
    return this.favorites.includes(recipeId);
  }

  // ==================== TOAST NOTIFICATION ====================
  showToast(message, type = 'info') {
    const existingToast = document.querySelector('.recipe-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `recipe-toast recipe-toast-${type}`;
    toast.innerHTML = `
      <i class="fas ${type === 'add' ? 'fa-heart' : type === 'remove' ? 'fa-heart-broken' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // ==================== DARK MODE ====================
  initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (!toggle) return;

    if (this.isDarkMode) {
      document.body.classList.add('dark-mode');
    }

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      this.isDarkMode = document.body.classList.contains('dark-mode');
      this.saveToStorage('darkMode', this.isDarkMode);
      this.showToast(this.isDarkMode ? 'Dark mode activated 🌙' : 'Light mode activated ☀️');
    });
  }

  // ==================== READING PROGRESS ====================
  initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
    document.body.appendChild(progressBar);

    const bar = progressBar.querySelector('.reading-progress-bar');
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (winScroll / height) * 100;
      bar.style.width = `${scrolled}%`;
    });
  }

  // ==================== ANIMATED COUNTERS ====================
  animateNumber(element, start, end, duration = 1000) {
    if (!element) return;
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        element.textContent = Math.floor(end);
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  // ==================== SHARE FUNCTIONALITY ====================
  async shareRecipe() {
    const title = document.getElementById('recipe-title')?.textContent || 'Delicious Recipe';
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this amazing recipe: ${title}`,
          url: url,
        });
        this.showToast('Shared successfully! 🎉');
      } catch (err) {
        if (err.name !== 'AbortError') {
          this.fallbackShare(title, url);
        }
      }
    } else {
      this.fallbackShare(title, url);
    }
  }

  fallbackShare(title, url) {
    navigator.clipboard.writeText(`${title}\n${url}`);
    this.showToast('Link copied to clipboard! 📋');
  }

  // ==================== EQUIPMENT MODAL ====================
  initEquipmentModal() {
    const modal = document.createElement('div');
    modal.className = 'equipment-modal';
    modal.innerHTML = `
      <div class="equipment-modal-content">
        <button class="equipment-modal-close">&times;</button>
        <div class="equipment-modal-body"></div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeBtn = modal.querySelector('.equipment-modal-close');
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    document.querySelectorAll('.equipment-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-buy')) return;
        
        const title = item.querySelector('h3')?.textContent || 'Equipment';
        const desc = item.querySelector('.overlay p')?.textContent || '';
        const img = item.querySelector('img')?.src || '';
        const buyLink = item.querySelector('.btn-buy')?.href || '#';
        
        modal.querySelector('.equipment-modal-body').innerHTML = `
          <img src="${img}" alt="${title}" class="modal-img">
          <h3>${title}</h3>
          <p>${desc}</p>
          <a href="${buyLink}" target="_blank" class="btn-buy-modal">Shop Now →</a>
        `;
        modal.classList.add('active');
      });
    });
  }

  // ==================== PRINT OPTIMIZATION ====================
  initPrintOptimization() {
    const printBtn = document.querySelector('.btn-print');
    if (!printBtn) return;

    printBtn.addEventListener('click', () => {
      const originalTitle = document.title;
      document.title = document.getElementById('recipe-title')?.textContent || 'Recipe';
      
      const originalStyles = document.querySelectorAll('link[rel="stylesheet"], style');
      const printStyles = document.createElement('style');
      printStyles.textContent = `
        @media print {
          .btn-print, .equipment-page, .reading-progress, .recipe-toast, 
          .dark-mode-toggle, .share-btn, .favorite-btn {
            display: none !important;
          }
          .recipe-page {
            margin: 0;
            padding: 0;
          }
          body {
            background: white;
          }
        }
      `;
      document.head.appendChild(printStyles);
      
      window.print();
      
      setTimeout(() => {
        document.title = originalTitle;
        printStyles.remove();
      }, 100);
    });
  }

  // ==================== LAZY LOAD IMAGES ====================
  initLazyLoading() {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.classList.add('loaded');
          }
          observer.unobserve(img);
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });
    
    document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
  }

  // ==================== SMOOTH SCROLL ANIMATIONS ====================
  initScrollAnimations() {
    const elements = document.querySelectorAll('.ingredient-item, .method-step, .equipment-item');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'all 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
      observer.observe(el);
    });
  }

  // ==================== COUNTER ANIMATION ON SCROLL ====================
  initCounterAnimation() {
    const nutritionElement = document.getElementById('nutrition');
    if (!nutritionElement) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const calories = nutritionElement.querySelector('.calories-value');
          const prepTime = nutritionElement.querySelector('.prep-time-value');
          
          if (calories && calories.textContent) {
            const value = parseInt(calories.textContent) || 0;
            this.animateNumber(calories, 0, value, 1200);
          }
          if (prepTime && prepTime.textContent) {
            const value = parseInt(prepTime.textContent) || 0;
            this.animateNumber(prepTime, 0, value, 800);
          }
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(nutritionElement);
  }

  // ==================== FLOATING ACTION BUTTON ====================
  initFloatingButtons() {
    const fabContainer = document.createElement('div');
    fabContainer.className = 'fab-container';
    fabContainer.innerHTML = `
      <button class="fab-main" aria-label="Actions">
        <i class="fas fa-plus"></i>
      </button>
      <div class="fab-actions">
        <button class="fab-action fab-share" aria-label="Share">
          <i class="fas fa-share-alt"></i>
        </button>
        <button class="fab-action fab-favorite" aria-label="Favorite">
          <i class="fas fa-heart"></i>
        </button>
        <button class="fab-action fab-print" aria-label="Print">
          <i class="fas fa-print"></i>
        </button>
      </div>
    `;
    document.body.appendChild(fabContainer);
    
    const mainFab = fabContainer.querySelector('.fab-main');
    const actions = fabContainer.querySelector('.fab-actions');
    
    mainFab.addEventListener('click', () => {
      fabContainer.classList.toggle('active');
    });
    
    fabContainer.querySelector('.fab-share').addEventListener('click', () => this.shareRecipe());
    fabContainer.querySelector('.fab-print').addEventListener('click', () => {
      document.querySelector('.btn-print')?.click();
    });
    
    const recipeId = window.location.pathname.split('/').pop() || 'default';
    const favBtn = fabContainer.querySelector('.fab-favorite');
    favBtn.addEventListener('click', () => this.toggleFavorite(recipeId));
    this.updateFavoriteButton(recipeId, favBtn.querySelector('i'));
  }

  updateFavoriteButton(recipeId, iconElement = null) {
    const isFav = this.isFavorite(recipeId);
    const icons = iconElement ? [iconElement] : document.querySelectorAll('.favorite-icon, .fab-favorite i');
    icons.forEach(icon => {
      if (icon) {
        icon.style.color = isFav ? '#ff4757' : '';
        icon.style.fill = isFav ? '#ff4757' : '';
      }
    });
  }

  // ==================== KEYBOARD SHORTCUTS ====================
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        document.querySelector('.btn-print')?.click();
      }
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        this.showToast('🔍 Search: Use Ctrl+F to find ingredients', 'info');
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const steps = document.querySelectorAll('#method-list li');
        if (steps.length) {
          steps.forEach((step, i) => {
            step.style.transform = 'translateX(0)';
          });
        }
      }
    });
  }

  // ==================== ANIMATE INGREDIENT CHECK ====================
  initIngredientCheck() {
    document.querySelectorAll('#ingredients-list li').forEach(li => {
      li.addEventListener('click', () => {
        li.classList.toggle('checked');
        if (li.classList.contains('checked')) {
          this.showToast(`✓ ${li.textContent.slice(0, 30)} checked!`, 'info');
        }
      });
    });
  }

  // ==================== BACK TO TOP BUTTON ====================
  initBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top-btn';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 500) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    });
    
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ==================== INITIALIZE EVERYTHING ====================
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initAll());
    } else {
      this.initAll();
    }
  }

  initAll() {
    this.initDarkMode();
    this.initReadingProgress();
    this.initPrintOptimization();
    this.initLazyLoading();
    this.initScrollAnimations();
    this.initCounterAnimation();
    this.initFloatingButtons();
    this.initKeyboardShortcuts();
    this.initIngredientCheck();
    this.initBackToTop();
    this.initEquipmentModal();
    
    // Add CSS for new elements
    this.injectStyles();
    
    console.log('🔥 Recipe App initialized — Instagram-level experience ready!');
  }

  injectStyles() {
    const styles = `
      <style>
        /* Toast Notification */
        .recipe-toast {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%) translateY(100px);
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          color: white;
          padding: 12px 24px;
          border-radius: 60px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 500;
          z-index: 10000;
          transition: transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1);
          box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.2);
        }
        .recipe-toast.show {
          transform: translateX(-50%) translateY(0);
        }
        .recipe-toast-add i { color: #ff4757; }
        .recipe-toast-remove i { color: #ff6b81; }
        
        /* Reading Progress */
        .reading-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: rgba(0,0,0,0.05);
          z-index: 9999;
        }
        .reading-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #27ae60, #2ecc71);
          width: 0%;
          transition: width 0.1s ease;
        }
        
        /* Equipment Modal */
        .equipment-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        .equipment-modal.active {
          opacity: 1;
          visibility: visible;
        }
        .equipment-modal-content {
          background: white;
          border-radius: 32px;
          max-width: 500px;
          width: 90%;
          position: relative;
          padding: 24px;
          transform: scale(0.95);
          transition: transform 0.3s ease;
        }
        .equipment-modal.active .equipment-modal-content {
          transform: scale(1);
        }
        .equipment-modal-close {
          position: absolute;
          top: 16px;
          right: 20px;
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
          color: #666;
        }
        .modal-img {
          width: 100%;
          border-radius: 24px;
          margin-bottom: 16px;
        }
        .btn-buy-modal {
          display: inline-block;
          margin-top: 16px;
          padding: 12px 24px;
          background: #27ae60;
          color: white;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
        }
        
        /* Floating Action Button */
        .fab-container {
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 999;
        }
        .fab-main {
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background: linear-gradient(135deg, #27ae60, #1e8e4a);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.4);
          transition: transform 0.2s;
        }
        .fab-main:hover {
          transform: scale(1.05);
        }
        .fab-actions {
          position: absolute;
          bottom: 70px;
          right: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.2s ease;
        }
        .fab-container.active .fab-actions {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .fab-action {
          width: 44px;
          height: 44px;
          border-radius: 22px;
          background: white;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
          font-size: 18px;
          transition: transform 0.2s;
        }
        .fab-action:hover {
          transform: scale(1.1);
        }
        
        /* Checked Ingredients */
        #ingredients-list li.checked {
          text-decoration: line-through;
          opacity: 0.6;
        }
        #ingredients-list li {
          cursor: pointer;
          transition: all 0.2s;
        }
        
        /* Back to Top */
        .back-to-top-btn {
          position: fixed;
          bottom: 30px;
          left: 30px;
          width: 44px;
          height: 44px;
          border-radius: 22px;
          background: #27ae60;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 999;
        }
        .back-to-top-btn.show {
          opacity: 1;
          visibility: visible;
        }
        
        /* Dark Mode */
        body.dark-mode {
          background: #121212;
        }
        body.dark-mode .recipe-page,
        body.dark-mode .equipment-page {
          background: #1e1e2a;
          border-color: #2a2a35;
        }
        body.dark-mode .recipe-meta,
        body.dark-mode .description {
          background: #2a2a35;
          color: #ccc;
        }
        body.dark-mode #recipe-title {
          background: linear-gradient(135deg, #2ecc71, #27ae60);
          background-clip: text;
          -webkit-background-clip: text;
        }
        
        /* Lazy Loading */
        img[data-src] {
          opacity: 0;
          transition: opacity 0.3s;
        }
        img.loaded {
          opacity: 1;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .fab-container {
            bottom: 20px;
            right: 20px;
          }
          .back-to-top-btn {
            bottom: 20px;
            left: 20px;
          }
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }
}

// Initialize the app when everything is loaded
const recipeApp = new RecipeApp();

// Export for debugging (optional)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecipeApp;
}
