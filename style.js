// =================================================
// 🔹 Render Header HTML
// =================================================
export function renderHeader() {
  // Check if header already exists
  if (document.querySelector('.main-header')) return;
  
  const header = document.createElement('header');
  header.className = 'main-header';
  
  header.innerHTML = `
    <div class="container header-wrapper">
      <a href="index.html">
        <div class="logo" aria-label="Simit Cooks">
          <span class="logo-modern">Simit</span>
          <span class="logo-traditional">Cooks</span>
        </div>
      </a>
      <nav class="navbar">
        <ul class="nav-links" id="navLinks">
          <li><a href="/index.html"><i class="fas fa-home"></i> Home</a></li>
          <li><a href="/recipes.html"><i class="fas fa-book"></i> Recipes</a></li>
          <li><a href="/gallery.html"><i class="fas fa-images"></i> Gallery</a></li>
          <li><a href="/equipment.html"><i class="fas fa-blender"></i> Equipment</a></li>
          <li><a href="/about.html"><i class="fas fa-address-card"></i> About</a></li>
        </ul>
        <button class="hamburger" id="hamburgerBtn" aria-label="Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
    </div>
  `;
  
  document.body.insertBefore(header, document.body.firstChild);
}

// =================================================
// 🔹 Render Footer HTML
// =================================================
export function renderFooter() {
  // Check if footer already exists
  if (document.querySelector('.site-footer')) return;
  
  const footer = document.createElement('footer');
  footer.classList.add('site-footer');

  footer.innerHTML = `
    <div class="footer-content">
      <!-- Brand Section -->
      <div class="footer-section footer-brand">
        <a href="index.html" style="text-decoration: none;">
          <div class="logo">
            <span class="logo-modern">Simit's</span>
            <span class="logo-traditional">Cooks</span>
          </div>
        </a>
        <p>Bringing authentic Nepali flavors to your kitchen with love and tradition.</p>
        <p class="tagline">✦ Taste the Tradition ✦</p>
      </div>

      <!-- Quick Links -->
      <div class="footer-section">
        <h3>Quick Links</h3>
        <div class="/footer-nav">
          <a href="/index.html"><i class="fas fa-home"></i> Home</a>
          <a href="/recipes.html"><i class="fas fa-book"></i> Recipes</a>
          <a href="/gallery.html"><i class="fas fa-images"></i> Gallery</a>
          <a href="/equipment.html"><i class="fas fa-blender"></i> Equipment</a>
          <a href="/about.html"><i class="fas fa-info-circle"></i> About</a>
        </div>
      </div>

      <!-- Social Media Section -->
      <div class="footer-section">
        <h3>Follow Us</h3>
        <div class="social-icons">
          <a href="https://www.youtube.com/channel/UCSNQHlvnpKrVDuLtiVAzMHQ" target="_blank" aria-label="YouTube" rel="noopener noreferrer">
            <i class="fab fa-youtube"></i>
          </a>
          <a href="https://www.facebook.com/simitcooks" target="_blank" aria-label="Facebook" rel="noopener noreferrer">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.tiktok.com/@simitcooks" target="_blank" aria-label="TikTok" rel="noopener noreferrer">
            <i class="fab fa-tiktok"></i>
          </a>
          <a href="https://www.instagram.com/simitcooks" target="_blank" aria-label="Instagram" rel="noopener noreferrer">
            <i class="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="copyright">
        © ${new Date().getFullYear()} Simit Cooks. All rights reserved.
      </div>
      <div class="footer-bottom-links">
        <a href="privacy.html">Privacy Policy</a>
        <a href="terms.html">Terms of Service</a>
        <a href="sitemap.html">Sitemap</a>
      </div>
    </div>
  `;

  document.body.appendChild(footer);
  
  // Add Back to Top Button
  addBackToTopButton();
}

// =================================================
// 🔹 Add Back to Top Button
// =================================================
function addBackToTopButton() {
  // Check if button already exists
  if (document.getElementById('backToTop')) return;
  
  const backToTop = document.createElement('div');
  backToTop.className = 'back-to-top';
  backToTop.id = 'backToTop';
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTop);
}

// =================================================
// 🔹 Hamburger Menu Toggle
// =================================================
function initHamburgerMenu() {
  const hamburger = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
}

// =================================================
// 🔹 Back to Top Button Functionality
// =================================================
function initBackToTop() {
  const backTop = document.getElementById('backToTop');

  if (backTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backTop.classList.add('show');
      } else {
        backTop.classList.remove('show');
      }
    });

    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// =================================================
// 🔹 Active Navigation Link Highlight
// =================================================
function highlightActiveLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinksItems = document.querySelectorAll('.nav-links a');

  navLinksItems.forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.style.color = 'var(--primary)';
      link.style.fontWeight = '700';
    }
  });
}

// =================================================
// 🔹 Initialize Everything
// =================================================
export function initStyle() {
  renderHeader();
  renderFooter();
  initHamburgerMenu();
  initBackToTop();
  highlightActiveLink();
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initStyle();
  });
} else {
  initStyle();
}

// Export all functions for use in other modules
export { 
  initHamburgerMenu, 
  initBackToTop, 
  highlightActiveLink,
  addBackToTopButton
};
