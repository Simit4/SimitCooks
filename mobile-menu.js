const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active'); // animate hamburger
  navLinks.classList.toggle('active');  // show/hide nav
});
