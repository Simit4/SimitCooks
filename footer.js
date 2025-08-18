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
<li><a href="/index.html"><i class="fas fa-home"></i> Home</a></li>
<li><a href="/recipes.html"><i class="fas fa-book"></i> Recipes</a></li>
<li><a href="/equipment.html"><i class="fas fa-blender"></i> Equipment</a></li>
<li><a href="/about.html"><i class="fas fa-address-card"></i> About</a></li>
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
