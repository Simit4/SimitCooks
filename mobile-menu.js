(() => {
  const bp = 768; // breakpoint to switch to desktop behavior

  const header = document.querySelector('.main-header');
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.navbar');
  const menu = document.querySelector('.nav-links');

  if (!header || !hamburger || !nav || !menu) return;

  // Create an overlay for click-outside + dim background
  const overlay = document.createElement('div');
  overlay.setAttribute('data-nav-overlay', '');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.background = 'rgba(0,0,0,0.35)';
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.transition = 'opacity 200ms ease';
  overlay.style.zIndex = '1099';
  document.body.appendChild(overlay);

  // Accessibility setup
  hamburger.setAttribute('aria-label', 'Open menu');
  hamburger.setAttribute('aria-controls', 'primary-navigation');
  hamburger.setAttribute('aria-expanded', 'false');

  menu.id = menu.id || 'primary-navigation';
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-hidden', 'true');

  // Helpers
  const isMobile = () => window.matchMedia(`(max-width:${bp}px)`).matches;
  const bodyScrollLock = (lock) => {
    if (lock) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  };

  let lastFocused = null;

  const getFocusable = (root) =>
    [...root.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(el => el.offsetParent !== null);

  const openMenu = () => {
    hamburger.classList.add('active');
    menu.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');

    overlay.style.pointerEvents = 'auto';
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });

    bodyScrollLock(true);

    // Focus handling
    lastFocused = document.activeElement;
    const focusables = getFocusable(menu);
    if (focusables.length) focusables[0].focus();
  };

  const closeMenu = () => {
    hamburger.classList.remove('active');
    menu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');

    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';

    bodyScrollLock(false);

    // Return focus to hamburger for accessibility
    if (lastFocused && document.body.contains(lastFocused)) {
      hamburger.focus();
    }
  };

  const toggleMenu = () => {
    if (!isMobile()) return; // ignore on desktop
    const open = menu.classList.contains('active');
    open ? closeMenu() : openMenu();
  };

  // Clicks
  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  // Close on link click (only in mobile)
  menu.addEventListener('click', (e) => {
    const target = e.target.closest('a');
    if (target && isMobile()) closeMenu();
  });

  // ESC key + basic focus trap when open
  document.addEventListener('keydown', (e) => {
    if (!menu.classList.contains('active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeMenu();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = getFocusable(menu);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Reset on resize to desktop
  const handleResize = () => {
    if (!isMobile()) {
      // Ensure menu is visible inline on desktop and no locks/overlays are active
      hamburger.classList.remove('active');
      menu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'false'); // desktop = visible inline
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      bodyScrollLock(false);
    } else {
      // On mobile, menu should start hidden
      menu.setAttribute('aria-hidden', menu.classList.contains('active') ? 'false' : 'true');
    }
  };

  window.addEventListener('resize', handleResize);
  handleResize(); // initialize state on load
})();
