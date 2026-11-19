
const SITE = {
  name: 'Niami._04',
  instagram: 'https://www.instagram.com/niami._04/',
  email: 'nianami04@gmail.com'
};

// Commission status — change these values when needed.
const COMMISSION = {
  status: 'open',
  message: 'Commissions Open'
};

// Identify current page
const here = location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';

// Update website links
document.querySelectorAll('[data-site]').forEach(el => {
  const k = el.dataset.site;

  if (k === 'name') {
    el.textContent = SITE.name;
  } else if (k === 'instagram') {
    el.href = SITE.instagram;
  } else {
    el.href = 'mailto:' + SITE.email;
    if (k === 'email') el.textContent = SITE.email;
  }
});

// Mobile sidebar
const toggle = document.querySelector('.sidebar-toggle');
const sidebar = document.querySelector('.mobile-sidebar');
const overlay = document.querySelector('.sidebar-overlay');
const close = document.querySelector('.sidebar-close');

const setSidebar = open => {
  document.body.classList.toggle('sidebar-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute(
    'aria-label',
    open ? 'Close navigation' : 'Open navigation'
  );
};

if (toggle && sidebar && overlay && close) {
  toggle.addEventListener('click', () => {
    setSidebar(!document.body.classList.contains('sidebar-open'));
  });

  close.addEventListener('click', () => setSidebar(false));

  overlay.addEventListener('click', () => setSidebar(false));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setSidebar(false);
  });
}

// Update active navigation link on desktop and mobile
document.querySelectorAll('header.site nav a, .mobile-sidebar nav a')
  .forEach(link => {
    const page = link.getAttribute('href').replace(/\.html$/, '');

    link.removeAttribute('aria-current');

    if (page === here) {
      link.setAttribute('aria-current', 'page');
    }

    link.addEventListener('click', () => {
      if (toggle && sidebar && overlay && close) {
        setSidebar(false);
      }
    });
  });

// Update commission status automatically
const statusElement = document.getElementById('commission-status');

if (statusElement) {
  statusElement.textContent = '✦ ' + COMMISSION.message;
  statusElement.dataset.status = COMMISSION.status;
}