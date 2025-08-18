// footer.js
export function renderFooter() {
  const footer = document.createElement('footer');
  footer.classList.add('site-footer');

  footer.innerHTML = `
    <div class="footer-content container">
      <!-- Logo / Brand -->
      <div class="footer-brand">
        <h2 class="logo logo-modern">The Home Cookery</h2>
      </div>

      <!-- Footer Navigation -->
      <nav class="footer-nav">
        <a href="/recipes.html">Recipes</a>
        <a href="/equipment.html">Equipment</a>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
      </nav>

      <!-- Social Media Links -->
      <div class="footer-social">
        <a href="https://www.facebook.com" target="_blank" aria-label="Facebook">
          <i class="fa-brands fa-facebook-f"></i>
        </a>
        <a href="https://www.instagram.com" target="_blank" aria-label="Instagram">
          <i class="fa-brands fa-instagram"></i>
        </a>
        <a href="https://www.youtube.com" target="_blank" aria-label="YouTube">
          <i class="fa-brands fa-youtube"></i>
        </a>
        <a href="https://www.pinterest.com" target="_blank" aria-label="Pinterest">
          <i class="fa-brands fa-pinterest"></i>
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} The Home Cookery. All rights reserved.</p>
    </div>
  `;

  document.body.appendChild(footer);
}
