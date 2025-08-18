// footer.js
(function() {
  const footer = document.createElement('footer');
  footer.classList.add('site-footer');

  footer.innerHTML = `
    <div class="footer-content container">
      <div class="footer-brand">
        <h2 class="logo logo-modern">The Home Cookery</h2>
      </div>
      <nav class="footer-nav">
        <a href="/recipes.html">Recipes</a>
        <a href="/equipment.html">Equipment</a>
        <a href="/about.html">About</a>
        <a href="/contact.html">Contact</a>
      </nav>
      <div class="footer-social">
        <a href="https://www.youtube.com" target="_blank" aria-label="YouTube">
          <i class="fa-brands fa-youtube"></i>
        </a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} The Home Cookery. All rights reserved.</p>
    </div>
  `;

  document.body.appendChild(footer);
})();
