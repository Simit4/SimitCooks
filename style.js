// =================================================
// 🔹 Hamburger Menu Toggle (Header)
// =================================================
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

// =================================================
// 🔹 Back to Top Button (Footer)
// =================================================
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

// =================================================
// 🔹 Active Navigation Link Highlight
// =================================================
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinksItems = document.querySelectorAll('.nav-links a');

navLinksItems.forEach(link => {
  const linkPage = link.getAttribute('href');
  if (linkPage === currentPage) {
    link.style.color = 'var(--primary)';
    link.style.fontWeight = '700';
  }
});
