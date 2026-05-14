// ============================================
// YAYASAN LINDUNGI ANAK BANGSA — Main JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initCounterAnimation();

  // Page-specific
  if (document.getElementById('gallery-grid')) initGallery();
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
      navbar.classList.add('bg-primary-dark/95', 'shadow-lg', 'backdrop-blur-md');
      navbar.classList.remove('bg-transparent');
    } else {
      navbar.classList.remove('bg-primary-dark/95', 'shadow-lg', 'backdrop-blur-md');
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
async function initGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  // Konfigurasi kategori dan folder
  const categories = {
    'belajar': { folder: 'Belajar', label: 'Kegiatan Belajar' },
    'ibadah': { folder: 'Beribadah', label: 'Bimbingan Rohani' },
    'olahraga': { folder: 'Olahraga', label: 'Olahraga & Kesehatan' },
    'bersama': { folder: 'kegiatan_bersama', label: 'Kegiatan Bersama' }
  };

  // Tampilkan loading state jika perlu (opsional)
  grid.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400"><i class="fa-solid fa-circle-notch fa-spin text-2xl mb-2"></i><p>Memuat foto...</p></div>';

  let allItemsHTML = '';
  
  // Loop setiap kategori untuk mencari foto secara berurutan
  for (const cat in categories) {
    const config = categories[cat];
    let i = 1;
    let failCount = 0;
    
    // Kita coba cari file 1, 2, 3... sampai tidak ketemu (max 2 kali gagal berturut-turut untuk jaga-jaga ada nomor terlewat)
    while (failCount < 2) {
      const fileName = `${cat}-${i}.jpg`;
      const filePath = `asset/Galeri/${config.folder}/${fileName}`;
      
      const exists = await checkImageExists(filePath);
      if (exists) {
        allItemsHTML += createGalleryItemHTML(cat, filePath, config.label);
        failCount = 0;
      } else {
        failCount++;
      }
      i++;
      
      // Safety break agar tidak infinite loop jika ada bug
      if (i > 100) break;
    }
  }

  // Masukkan ke grid
  grid.innerHTML = allItemsHTML || '<p class="col-span-full text-center text-gray-500">Belum ada foto di galeri.</p>';

  // Inisialisasi ulang scroll animation untuk item baru
  initScrollAnimations();
  
  // Pasang listener untuk filter dan lightbox
  attachGalleryListeners(grid);
}

// Fungsi bantu cek apakah gambar ada
function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Template HTML untuk item galeri
function createGalleryItemHTML(category, src, title) {
  return `
    <div class="gallery-item fade-up group cursor-pointer" data-category="${category}">
      <div class="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all bg-gray-200">
        <img src="${src}" alt="${title}" class="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy">
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
          <div>
            <p class="text-white font-semibold">${title}</p>
            <p class="text-white/70 text-sm">Yayasan Lindungi Anak Bangsa</p>
          </div>
        </div>
        <div class="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <i class="fa-solid fa-expand text-white"></i>
        </div>
      </div>
    </div>
  `;
}

function attachGalleryListeners(grid) {
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
        b.classList.remove('bg-accent', 'text-white');
        b.classList.add('bg-white', 'text-gray-700');
      });
      btn.classList.add('bg-accent', 'text-white');
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
