<script>
const hamburger = document.querySelector('.hamburger');

// create side menu dynamically
const navLinks = document.querySelector('.nav-links');
const sideMenu = document.createElement('div');
sideMenu.classList.add('side-menu');
sideMenu.innerHTML = navLinks.innerHTML;
document.body.appendChild(sideMenu);

// create overlay
const overlay = document.createElement('div');
overlay.classList.add('side-menu-overlay');
document.body.appendChild(overlay);

// toggle menu
function toggleMenu() {
  hamburger.classList.toggle('active');
  sideMenu.classList.toggle('active');
  overlay.classList.toggle('active');
}

hamburger.addEventListener('click', toggleMenu);
overlay.addEventListener('click', toggleMenu);
</script>
