const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.navbar ul.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
});
