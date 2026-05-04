// ============================================
// YAYASAN LINDUNGI ANAK BANGSA — Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initCounterAnimation();

  // Page-specific
  if (document.getElementById('gallery-grid')) initGallery();
  if (document.getElementById('contact-form')) initContactForm();
});

// ──────────────── NAVBAR ────────────────
function initNavbar() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const navbar = document.getElementById('navbar');
  const icon = btn?.querySelector('i');

  btn?.addEventListener('click', () => {
    const open = menu.classList.toggle('hidden');
    if (icon) {
      icon.className = open ? 'fa-solid fa-bars text-xl' : 'fa-solid fa-xmark text-xl';
    }
  });

  // Close mobile menu on link click
  menu?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      menu.classList.add('hidden');
      if (icon) icon.className = 'fa-solid fa-bars text-xl';
    })
  );

  // Sticky navbar background
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    if (window.scrollY > 50) {
      navbar.classList.add('bg-[#0f2a47]/95', 'shadow-lg', 'backdrop-blur-md');
      navbar.classList.remove('bg-transparent');
    } else {
      navbar.classList.remove('bg-[#0f2a47]/95', 'shadow-lg', 'backdrop-blur-md');
      navbar.classList.add('bg-transparent');
    }
  });

  // Trigger on load
  window.dispatchEvent(new Event('scroll'));
}

// ──────────────── SCROLL ANIMATIONS ────────────────
function initScrollAnimations() {
  const els = document.querySelectorAll('.fade-up');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  els.forEach(el => io.observe(el));
}

// ──────────────── COUNTER ANIMATION ────────────────
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => io.observe(c));
}

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 2000;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ──────────────── GALLERY (galeri.html) ────────────────
function initGallery() {
  const grid = document.getElementById('gallery-grid');
  const filterBtns = document.querySelectorAll('[data-filter]');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let currentItems = [];
  let currentIndex = 0;

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white');
        b.classList.add('bg-white', 'text-gray-700');
      });
      btn.classList.add('bg-blue-600', 'text-white');
      btn.classList.remove('bg-white', 'text-gray-700');

      const cat = btn.dataset.filter;
      const items = grid.querySelectorAll('.gallery-item');
      items.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
          setTimeout(() => item.classList.add('visible'), 50);
        } else {
          item.classList.remove('visible');
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox open
  grid.addEventListener('click', (e) => {
    const card = e.target.closest('.gallery-item');
    if (!card) return;
    const img = card.querySelector('img');
    if (!img) return;

    currentItems = [...grid.querySelectorAll('.gallery-item:not([style*="display: none"])')];
    currentIndex = currentItems.indexOf(card);
    openLightbox(img.src, img.alt);
  });

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbCaption.textContent = caption;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.add('hidden');
    lightbox.classList.remove('flex');
    document.body.style.overflow = '';
  }

  lbClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  lbPrev?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex - 1 + currentItems.length) % currentItems.length;
    const img = currentItems[currentIndex].querySelector('img');
    openLightbox(img.src, img.alt);
  });

  lbNext?.addEventListener('click', (e) => {
    e.stopPropagation();
    currentIndex = (currentIndex + 1) % currentItems.length;
    const img = currentItems[currentIndex].querySelector('img');
    openLightbox(img.src, img.alt);
  });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lbPrev?.click();
    if (e.key === 'ArrowRight') lbNext?.click();
  });
}

// ──────────────── CONTACT FORM ────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fields = ['nama', 'email', 'telepon', 'subjek', 'pesan'];
    let valid = true;

    fields.forEach(id => {
      const input = document.getElementById(id);
      const err = document.getElementById(id + '-error');
      if (!input.value.trim()) {
        valid = false;
        input.classList.add('border-red-500');
        if (err) err.classList.remove('hidden');
      } else {
        input.classList.remove('border-red-500');
        if (err) err.classList.add('hidden');
      }
    });

    // Email format
    const email = document.getElementById('email');
    const emailErr = document.getElementById('email-error');
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      valid = false;
      email.classList.add('border-red-500');
      if (emailErr) { emailErr.textContent = 'Format email tidak valid'; emailErr.classList.remove('hidden'); }
    }

    if (valid) {
      const toast = document.getElementById('toast-success');
      if (toast) {
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 4000);
      }
      form.reset();
    }
  });

  // Clear error on input
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('border-red-500');
      const err = document.getElementById(el.id + '-error');
      if (err) err.classList.add('hidden');
    });
  });
}

// ──────────────── SMOOTH SCROLL ────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
