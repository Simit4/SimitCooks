export function renderFooter() {
  const footer = document.createElement('footer');
  footer.classList.add('site-footer');

  footer.innerHTML = `
    <div class="footer-content container">
      <div class="footer-brand">
        <h2 class="logo">
          <span class="logo-modern">Simi's</span>
          <span class="logo-traditional">Swaad</span>
        </h2>
        <p>Simple, home-style recipes made with love.</p>
      </div>
      <nav class="footer-nav">
        <a href="/">Home</a>
        <a href="/recipes">Recipes</a>
        <a href="/equipment">Equipment</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </nav>
      <div class="footer-social">
        <a href="https://www.youtube.com" target="_blank" aria-label="YouTube">▶️</a>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; ${new Date().getFullYear()} Simi's Swaad. All rights reserved.
    </div>
  `;

  document.body.appendChild(footer);
}
