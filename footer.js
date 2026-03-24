export function renderFooter() {
  const footer = document.createElement('footer');
  footer.classList.add('site-footer');

  footer.innerHTML = `
    <div class="footer-content container">
      <div class="footer-brand">
    <a href="index.html">       
        <h2 class="logo">
          <span class="logo-modern">Simit's</span>
          <span class="logo-traditional">Swaad</span>
        </h2>
        </a>
        <p>Simple, home-style recipes made with love.</p>
      </div>

      <nav class="footer-nav">
        <a href="/">Home</a>
        <a href="/recipes">Recipes</a>
        <a href="/equipment">Equipment</a>
        <a href="/about">About</a>
      </nav>

      <div class="footer-social">
        <a href="https://www.youtube.com/channel/UCSNQHlvnpKrVDuLtiVAzMHQ" target="_blank" aria-label="YouTube">
          <i class="fab fa-youtube"></i>
        </a>
      </div>
      
    </div>

    <div class="footer-bottom">
      &copy; ${new Date().getFullYear()} Simit Cooks. All rights reserved.
    </div>
  `;

  document.body.appendChild(footer);
}

// Call the function
renderFooter();
