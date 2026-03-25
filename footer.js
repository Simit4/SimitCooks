export function renderFooter() {
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
        <div class="footer-nav">
          <a href="index.html"><i class="fas fa-home"></i> Home</a>
          <a href="recipes.html"><i class="fas fa-utensils"></i> Recipes</a>
          <a href="gallery.html"><i class="fas fa-images"></i> Gallery</a>
          <a href="equipment.html"><i class="fas fa-blender"></i> Equipment</a>
          <a href="about.html"><i class="fas fa-info-circle"></i> About</a>
        </div>
      </div>

      <!-- Social Media Section -->
      <div class="footer-section">
        <h3>Follow Us</h3>
        <div class="social-icons">
          <a href="https://www.youtube.com/channel/UCSNQHlvnpKrVDuLtiVAzMHQ" target="_blank" aria-label="YouTube">
            <i class="fab fa-youtube"></i>
          </a>
          <a href="https://www.facebook.com/simitcooks" target="_blank" aria-label="Facebook">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://www.tiktok.com/@simitcooks" target="_blank" aria-label="TikTok">
            <i class="fab fa-tiktok"></i>
          </a>
          <a href="https://www.instagram.com/simitcooks" target="_blank" aria-label="Instagram">
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
  const backToTop = document.createElement('div');
  backToTop.className = 'back-to-top';
  backToTop.id = 'backToTop';
  backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(backToTop);

  // Back to Top functionality
  const backToTopButton = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });
  
  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Auto-render footer when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    renderFooter();
  });
} else {
  renderFooter();
}
