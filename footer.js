document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="container footer-content">
        <div class="footer-logo">
          <span class="logo-modern">Simit’s</span>
          <span class="logo-traditional">Swaad</span>
        </div>

        <nav class="footer-nav">
          <a href="recipes.html">Recipes</a>
          <a href="equipment.html">Equipment</a>
          <a href="about.html">About</a>
        </nav>

        <div class="footer-social">
          <a href="#"><i class="fab fa-youtube"></i></a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Simit’s Swaad. All Rights Reserved.</p>
      </div>
    </footer>
  `;
});
