
/* =========================================================
   NIAMI._04 — MAIN WEBSITE JAVASCRIPT
   Centralized website configuration and shared functionality
   ========================================================= */


/* =========================================================
   1. WEBSITE CONFIGURATION
   ========================================================= */

const SITE = Object.freeze({
  name: 'Niami._04',
  instagram: 'https://www.instagram.com/niami._04/',
  email: 'nianami04@gmail.com'
});

const COMMISSION = Object.freeze({
  status: 'open', // open | closed | limited
  message: 'Commissions Open'
});


/* =========================================================
   2. INITIALIZATION
   ========================================================= */

function initializeWebsite() {
  initializeSiteLinks();
  initializeNavigation();
  initializeCommissionStatus();
  initializeDynamicYear();
  initializeBackToTop();
  initializeExternalLinks();
}


/* =========================================================
   3. CENTRALIZED WEBSITE LINKS
   ========================================================= */

function initializeSiteLinks() {
  document.querySelectorAll('[data-site]').forEach(element => {
    const type = element.dataset.site;

    switch (type) {
      case 'name':
        element.textContent = SITE.name;
        break;

      case 'instagram':
        element.href = SITE.instagram;
        element.target = '_blank';
        element.rel = 'noopener noreferrer';
        break;

      case 'email':
        element.href = `mailto:${SITE.email}`;
        element.textContent = SITE.email;
        break;

      default:
        break;
    }
  });
}


/* =========================================================
   4. MOBILE NAVIGATION
   ========================================================= */

function initializeNavigation() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.mobile-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const closeButton = document.querySelector('.sidebar-close');

  const navigationLinks = document.querySelectorAll(
    'header.site nav a, .mobile-sidebar nav a'
  );

  if (!toggle || !sidebar || !overlay || !closeButton) {
    initializeActiveNavigation();
    return;
  }

  let previousFocus = null;

  // Initial accessibility attributes
  if (!sidebar.id) {
  sidebar.id = 'mobile-sidebar';
}

toggle.setAttribute('aria-expanded', 'false');
toggle.setAttribute('aria-controls', sidebar.id);

sidebar.setAttribute('aria-hidden', 'true');
sidebar.inert = true;

overlay.setAttribute('aria-hidden', 'true');

  if (!sidebar.id) {
    sidebar.id = 'mobile-sidebar';
  }

  function openSidebar() {
    if (document.body.classList.contains('sidebar-open')) return;

    previousFocus = document.activeElement;

    document.body.classList.add('sidebar-open');
sidebar.inert = false;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation');

    sidebar.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('aria-hidden', 'false');

    closeButton.focus();
  }

  function closeSidebar() {
    if (!document.body.classList.contains('sidebar-open')) return;

    document.body.classList.remove('sidebar-open');
    sidebar.inert = true;

    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');

    sidebar.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('aria-hidden', 'true');

    if (previousFocus && previousFocus.isConnected) {
      previousFocus.focus();
    } else {
      toggle.focus();
    }
  }

  function trapFocus(event) {
    if (event.key !== 'Tab') return;

    const focusableElements = sidebar.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), ' +
      '[tabindex]:not([tabindex="-1"])'
    );

    const focusable = Array.from(focusableElements).filter(element => {
      return element.getAttribute('aria-hidden') !== 'true';
    });

    if (!focusable.length) {
      event.preventDefault();
      closeButton.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // Open navigation
  toggle.addEventListener('click', openSidebar);

  // Close navigation
  closeButton.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  // Keyboard controls
  document.addEventListener('keydown', event => {
    if (!document.body.classList.contains('sidebar-open')) return;

    if (event.key === 'Escape') {
      closeSidebar();
    }

    trapFocus(event);
  });

  // Close after selecting a navigation link
  sidebar.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  initializeActiveNavigation();
}


/* =========================================================
   5. ACTIVE NAVIGATION LINK
   ========================================================= */

function initializeActiveNavigation() {
  const currentPath = window.location.pathname
    .split('/')
    .pop()
    .replace(/\.html$/, '') || 'index';

  const links = document.querySelectorAll(
    'header.site nav a, .mobile-sidebar nav a'
  );

  links.forEach(link => {
    const href = link.getAttribute('href');

    if (!href) return;

    let page;

    try {
      const url = new URL(href, window.location.href);

      // Ignore external links and links to other locations.
      if (url.origin !== window.location.origin) return;

      page = url.pathname
        .split('/')
        .pop()
        .replace(/\.html$/, '') || 'index';
    } catch {
      return;
    }

    if (page === currentPath) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}


/* =========================================================
   6. COMMISSION STATUS
   ========================================================= */

function initializeCommissionStatus() {
  const statusElements = document.querySelectorAll(
    '#commission-status'
  );

  statusElements.forEach(element => {
    element.textContent = `✦ ${COMMISSION.message}`;

    element.dataset.status = COMMISSION.status;

    element.setAttribute(
      'aria-label',
      `Commission status: ${COMMISSION.message}`
    );
  });
}


/* =========================================================
   7. AUTOMATIC COPYRIGHT YEAR
   ========================================================= */

function initializeDynamicYear() {
  const currentYear = new Date().getFullYear();

  document.querySelectorAll('[data-year]').forEach(element => {
    element.textContent = currentYear;
  });
}


/* =========================================================
   8. BACK TO TOP BUTTON
   ========================================================= */

function initializeBackToTop() {
  const button = document.querySelector('[data-back-to-top]');

  if (!button) return;

  button.hidden = true;

  function updateButton() {
    button.hidden = window.scrollY < 400;
  }

  window.addEventListener('scroll', updateButton, {
    passive: true
  });

  button.addEventListener('click', () => {
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'instant' : 'smooth'
    });
  });

  updateButton();
}


/* =========================================================
   9. EXTERNAL LINK SECURITY
   ========================================================= */

function initializeExternalLinks() {
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.relList.add('noopener');
    link.relList.add('noreferrer');
  });
}


/* =========================================================
   10. START WEBSITE
   ========================================================= */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebsite, {
    once: true
  });
} else {
  initializeWebsite();
}
