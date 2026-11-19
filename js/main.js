
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
const NAVIGATION = Object.freeze({
  sidebarId: 'mobile-sidebar',
  focusOnOpen: true
});

/* =========================================================
   2. INITIALIZATION
   ========================================================= */

let websiteInitialized = false;

function initializeWebsite() {
  if (websiteInitialized) return;

  websiteInitialized = true;

  const initializers = [
    initializeSiteLinks,
    initializeNavigation,
    initializeCommissionStatus,
    initializeDynamicYear,
    initializeBackToTop,
    initializeExternalLinks
  ];

  initializers.forEach(initializer => {
    try {
      initializer();
    } catch (error) {
      console.error(
        `Niami._04: ${initializer.name} failed.`,
        error
      );
    }
  });
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

  initializeActiveNavigation();

  if (!toggle || !sidebar || !overlay || !closeButton) {
    return;
  }

  if (toggle.dataset.navigationInitialized === 'true') {
    return;
  }

  toggle.dataset.navigationInitialized = 'true';

  if (!sidebar.id) {
    sidebar.id = NAVIGATION.sidebarId;
  }

  toggle.setAttribute('aria-controls', sidebar.id);

  const focusableSelector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  let previousFocus = null;
  let isOpen = false;

  function setNavigationState(open) {
    isOpen = open;

    document.body.classList.toggle('sidebar-open', open);

    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute(
      'aria-label',
      open ? 'Close navigation' : 'Open navigation'
    );

    sidebar.setAttribute('aria-hidden', String(!open));
    sidebar.inert = !open;

    overlay.setAttribute('aria-hidden', String(!open));
  }

  setNavigationState(false);

  function getFocusableElements() {
    return Array.from(
      sidebar.querySelectorAll(focusableSelector)
    ).filter(element => {
      return (
        !element.disabled &&
        element.getAttribute('aria-hidden') !== 'true' &&
        !element.closest('[inert]') &&
        element.getClientRects().length > 0
      );
    });
  }

  function openSidebar() {
    if (isOpen) return;

    previousFocus = document.activeElement;

    setNavigationState(true);

    if (NAVIGATION.focusOnOpen) {
      closeButton.focus();
    }
  }

  function closeSidebar(restoreFocus = true) {
    if (!isOpen) return;

    setNavigationState(false);

    if (
      restoreFocus &&
      previousFocus instanceof HTMLElement &&
      previousFocus.isConnected
    ) {
      previousFocus.focus();
    }

    previousFocus = null;
  }

  function trapFocus(event) {
    if (event.key !== 'Tab' || !isOpen) return;

    const focusable = getFocusableElements();

    if (!focusable.length) {
      event.preventDefault();
      closeButton.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const activeElement = document.activeElement;

    if (!sidebar.contains(activeElement)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
      return;
    }

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  toggle.addEventListener('click', () => {
    if (isOpen) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  closeButton.addEventListener('click', () => {
    closeSidebar();
  });

  overlay.addEventListener('click', () => {
    closeSidebar();
  });

  document.addEventListener('keydown', event => {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeSidebar();
      return;
    }

    trapFocus(event);
  });

  sidebar.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
      closeSidebar(false);
    });
  });
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
  const validStatuses = ['open', 'closed', 'limited'];

  const status = validStatuses.includes(COMMISSION.status)
    ? COMMISSION.status
    : 'closed';

  const defaultMessages = {
    open: 'Commissions Open',
    closed: 'Commissions Closed',
    limited: 'Limited Commission Slots'
  };

  const message = (
    typeof COMMISSION.message === 'string' &&
    COMMISSION.message.trim()
  )
    ? COMMISSION.message.trim()
    : defaultMessages[status];

  document.querySelectorAll('#commission-status').forEach(element => {
    element.textContent = `✦ ${message}`;
    element.dataset.status = status;

    element.setAttribute(
      'aria-label',
      `Commission status: ${message}`
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
    link.relList.add('noopener', 'noreferrer');
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
