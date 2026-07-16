/* =========================================================
   PRONEXUS PMI — JavaScript Frontend (Versi Bahasa Indonesia)
   ========================================================= */

const NOMOR_WA = '6281234567890'; // ← GANTI dengan nomor WhatsApp Anda (tanpa +)

// ── Efek navbar saat scroll ───────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Menu hamburger ────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ── Scroll reveal ─────────────────────────────────────────
const elemen = document.querySelectorAll(
  '.service-card, .port-card, .team-card, .testi-card, ' +
  '.insight-card, .faq-item, .about-layout, .section-head, .wa-card, .contact-info'
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

elemen.forEach((el, i) => {
  el.classList.add('reveal');
  el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  observer.observe(el);
});

// ── Filter portofolio ─────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const portCards  = document.querySelectorAll('.port-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    portCards.forEach(card => {
      const cocok = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('hidden', !cocok);
    });
  });
});

// ── Akordion FAQ ──────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const terbuka = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!terbuka) item.classList.add('open');
  });
});

// ── Redirect WhatsApp ─────────────────────────────────────
function buatPesanWA(layanan) {
  const dasar = 'Halo Pronexus PMI, saya tertarik untuk konsultasi';
  if (!layanan) return encodeURIComponent(dasar + '. Bisa bantu saya?');
  return encodeURIComponent(`${dasar} terkait *${layanan}*. Bisa jadwalkan konsultasi gratis?`);
}

function bukaWhatsApp(layanan) {
  const pesan = buatPesanWA(layanan);
  window.open(`https://wa.me/${NOMOR_WA}?text=${pesan}`, '_blank');
}

document.querySelectorAll('.wa-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const layanan = btn.dataset.service || '';
    bukaWhatsApp(layanan);
  });
});

// ── Formulir Kontak ───────────────────────────────────────
const form      = document.getElementById('contactForm');
const statusEl  = document.getElementById('formStatus');
const submitBtn = document.getElementById('submitBtn');

function emailValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function tampilkanStatus(pesan, tipe) {
  statusEl.textContent = pesan;
  statusEl.className   = `form-status ${tipe}`;
}

function hapusError() {
  form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  statusEl.textContent = '';
  statusEl.className   = 'form-status';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hapusError();

  const nama     = form.name.value.trim();
  const email    = form.email.value.trim();
  const bisnis   = form.business.value.trim();
  const layanan  = form.service.value;
  const pesan    = form.message.value.trim();

  let adaError = false;

  if (!nama)               { form.name.classList.add('error');     adaError = true; }
  if (!emailValid(email))  { form.email.classList.add('error');    adaError = true; }
  if (!bisnis)             { form.business.classList.add('error'); adaError = true; }
  if (!layanan)            { form.service.classList.add('error');  adaError = true; }
  if (!pesan)              { form.message.classList.add('error');  adaError = true; }

  if (adaError) {
    tampilkanStatus('Harap isi semua kolom yang diperlukan dengan benar.', 'error-msg');
    return;
  }

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Mengirim…';

  try {
    const res = await fetch('/api/contact', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: nama, email, business: bisnis, service: layanan, message: pesan })
    });

    const data = await res.json();

    if (res.ok) {
      tampilkanStatus('✅ Pertanyaan terkirim! Kami akan menghubungi Anda dalam 24 jam.', 'success');
      form.reset();
    } else {
      tampilkanStatus(data.error || 'Terjadi kesalahan. Silakan coba lagi.', 'error-msg');
    }
  } catch {
    // Backend tidak tersedia → alihkan ke WhatsApp
    tampilkanStatus('Server tidak tersedia — mengalihkan Anda ke WhatsApp…', 'error-msg');
    setTimeout(() => bukaWhatsApp(layanan), 1500);
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Kirim Pertanyaan';
  }
});

// ── Tautan navigasi aktif saat scroll ────────────────────
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navAs.forEach(a => {
          a.style.fontWeight = a.getAttribute('href') === `#${id}` ? '700' : '';
          a.style.color      = a.getAttribute('href') === `#${id}` ? 'var(--blue-500)' : '';
        });
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => sectionObserver.observe(s));

// ── Angka statistik hero: animasi hitung naik saat terlihat ──
const statNumbers = document.querySelectorAll('.stat-n[data-count]');

function animateCount(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

statNumbers.forEach(el => statObserver.observe(el));

// ── Slider testimoni ──────────────────────────────────────
const testiTrack = document.getElementById('testiTrack');
if (testiTrack) {
  const slides   = testiTrack.querySelectorAll('.testi-slide');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn  = document.getElementById('testiPrev');
  const nextBtn  = document.getElementById('testiNext');
  let current = 0;
  let autoTimer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Testimoni ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = dotsWrap.querySelectorAll('.testi-dot');

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    testiTrack.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    restartAuto();
  }

  function restartAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));
  restartAuto();
}