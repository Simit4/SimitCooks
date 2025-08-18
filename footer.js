(function renderFooter() {
  const footer = document.createElement('footer');
  footer.classList.add('site-footer');

  footer.innerHTML = `
    <div class="footer-content container">
      <div class="footer-brand">
        <h2 class="logo">
          <span class="logo-modern">Simit's</span>
          <span class="logo-traditional">Swaad</span>
        </h2>
        <p>Simple, home-style recipes made with love.</p>
      </div>
      <nav class="footer-nav">
        <a href="/">Home</a>
        <a href="/recipes">Recipes</a>
        <a href="/equipment">Equipment</a>
        <a href="/about">About</a>

      </nav>
     <div class="footer-social">
        <a href="https://www.youtube.com/channel/UCSNQHlvnpKrVDuLtiVAzMHQ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="red" xmlns="http://www.w3.org/2000/svg">
            <path d="M23.498 6.186a2.999 2.999 0 0 0-2.115-2.122C19.611 3.5 12 3.5 12 3.5s-7.611 0-9.383.564A2.999 2.999 0 0 0 .502 6.186 31.122 31.122 0 0 0 0 12a31.122 31.122 0 0 0 .502 5.814 2.999 2.999 0 0 0 2.115 2.122c1.772.564 9.383.564 9.383.564s7.611 0 9.383-.564a2.999 2.999 0 0 0 2.115-2.122A31.122 31.122 0 0 0 24 12a31.122 31.122 0 0 0-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"/>
          </svg>
        </a>
      </div>
    </div>
    <div class="footer-bottom">
      &copy; ${new Date().getFullYear()} Simit's Swaad. All rights reserved.
    </div>
  `;

  document.body.appendChild(footer);
})();
