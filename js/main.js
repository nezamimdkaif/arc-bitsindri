/* ==========================================================================
   AERO & ROBOTICS CLUB (ARC) - BIT SINDRI
   Main Interactivity Script (Clean & Lightweight)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- 0. Theme Switcher (System / Dark / Light) ----
  const themeButtons = document.querySelectorAll('.theme-opt-btn');
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const THEMES = ['system', 'dark', 'light'];

  function getPref() {
    let saved = null;
    try { saved = localStorage.getItem('arc-theme'); } catch (e) {}
    return THEMES.includes(saved) ? saved : 'system';
  }

  function applyTheme(pref, save = true) {
    const resolved = pref === 'system' ? (darkQuery.matches ? 'dark' : 'light') : pref;
    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-theme-pref', pref);
    if (save) {
      try { localStorage.setItem('arc-theme', pref); } catch (e) {}
    }

    themeButtons.forEach(btn => {
      const on = btn.getAttribute('data-theme') === pref;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', on);
    });

    window.dispatchEvent(new Event('arc-theme-change'));
  }

  applyTheme(getPref(), false);

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme'), true));
  });

  const onSystemChange = () => { if (getPref() === 'system') applyTheme('system', false); };
  if (darkQuery.addEventListener) darkQuery.addEventListener('change', onSystemChange);
  else if (darkQuery.addListener) darkQuery.addListener(onSystemChange);

  // ---- 1. Mobile Menu Toggle ----
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }

  // ---- 2. Navbar Active Links on Scroll (IntersectionObserver, no scroll listener) ----
  const sections = document.querySelectorAll('section[id], header[id]');
  const navItems = document.querySelectorAll('.nav-link');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = en.target.id;
        navItems.forEach(i => i.classList.toggle('active', i.getAttribute('href') === '#' + id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(sec => spy.observe(sec));
  }

  // ---- 3. The 2 Competitions Switcher Tabs ----
  const compBtns = document.querySelectorAll('.comp-tab-btn');
  const compPanels = document.querySelectorAll('.comp-panel');

  compBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      compBtns.forEach(b => b.classList.remove('active'));
      compPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  // ---- 4. Team Filter (All / Exec / Tech / Ops) ----
  const filterBtns = document.querySelectorAll('.team-filter-btn');
  const memberCards = document.querySelectorAll('.member-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      memberCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ---- 5. Lightbox Modal for Photos & Result ----
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalCaption = document.getElementById('modalCaption');
  const modalClose = document.querySelector('.modal-close-btn');

  function openModal(src, caption) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modalCaption.textContent = caption || '';
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-src') || el.querySelector('img')?.src;
      const caption = el.getAttribute('data-caption') || el.querySelector('img')?.alt || '';
      if (src) {
        openModal(src, caption);
      }
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // ---- 6. Join Form: opens the user's email app with the details filled in (no backend needed) ----
  const joinForm = document.getElementById('joinForm');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const lines = [];
      joinForm.querySelectorAll('input, select, textarea').forEach(el => {
        if (el.type === 'submit' || !el.value) return;
        const label = el.closest('div') && el.closest('div').querySelector('label');
        lines.push((label ? label.textContent.trim() : el.id || el.name) + ': ' + el.value);
      });
      const subject = encodeURIComponent('ARC Membership Application');
      const body = encodeURIComponent(lines.join('\n'));
      window.location.href = 'mailto:arc.bitsindri@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  // ---- 7. UI Enhancements (hero network, reveal, counters, progress, spotlight) ----
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 7a. Hero node-network canvas (robot swarm / sensor graph feel)
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const hero = canvas.parentElement;
    let w = 0, h = 0, nodes = [], rafId = null, visible = true, color = '59,130,246';

    function readColor() {
      const hex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      const m = /^#([0-9a-f]{6})$/i.exec(hex);
      if (m) {
        const n = parseInt(m[1], 16);
        color = `${n >> 16}, ${(n >> 8) & 255}, ${n & 255}`;
      }
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth;
      h = hero.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(70, Math.round(w / 22)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const maxD = 130;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (let k = i + 1; k < nodes.length; k++) {
          const b = nodes[k];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < maxD) {
            ctx.strokeStyle = `rgba(${color}, ${(1 - d / maxD) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = `rgba(${color}, 0.65)`;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
      rafId = (!reduceMotion && visible && !document.hidden) ? requestAnimationFrame(draw) : null;
    }

    function start() { if (!rafId) rafId = requestAnimationFrame(draw); }

    readColor();
    resize();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); start(); }, 150);
    });
    window.addEventListener('arc-theme-change', () => { readColor(); start(); });
    document.addEventListener('visibilitychange', start);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }).observe(hero);
  }

  // 7b. Rotating hero word
  const rotator = document.getElementById('rotatorWord');
  if (rotator && !reduceMotion) {
    const words = ['Planetary Rovers', 'Autonomous Drones', 'Sounding Rockets', 'Space Robotics'];
    let wi = 0;
    setInterval(() => {
      rotator.classList.add('swap');
      setTimeout(() => {
        wi = (wi + 1) % words.length;
        rotator.textContent = words[wi];
        rotator.classList.remove('swap');
      }, 350);
    }, 2600);
  }

  // 7c. Scroll reveal (class removed after the animation so hover effects stay intact)
  const revealSel = '.section-header, .philosophy-card, .subsystem-card, .video-card, .step-card, .about-photo-card, .contact-item, .comp-photo-item';
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('in');
        io.unobserve(el);
        setTimeout(() => el.classList.remove('reveal', 'in'), 900);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(revealSel).forEach(el => {
      const idx = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.transitionDelay = Math.min(idx, 6) * 70 + 'ms';
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // 7d. Count-up numbers
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        cio.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / 1200, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(el => cio.observe(el));
  }

  // 7e. Scroll progress bar + back-to-top button
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.appendChild(bar);

  const toTop = document.createElement('button');
  toTop.className = 'back-to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  document.body.appendChild(toTop);

  const navbarEl = document.getElementById('navbar');
  let ticking = false;
  function updateScrollUI() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = window.scrollY;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle('show', y > 600);
    if (navbarEl) navbarEl.classList.toggle('scrolled', y > 24);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScrollUI); }
  }, { passive: true });
  updateScrollUI();

  // 7f. Cursor spotlight on cards
  const spotSel = '.subsystem-card, .philosophy-card, .step-card, .video-card, .member-card';
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest && e.target.closest(spotSel);
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // ---- 8. Robotics HUD touches (navbar state, hero glow, IST clock, title decode) ----

  const heroEl = document.getElementById('home');
  const gridEl = heroEl && heroEl.querySelector('.hero-grid');
  if (heroEl && gridEl) {
    heroEl.addEventListener('mousemove', (e) => {
      const r = heroEl.getBoundingClientRect();
      gridEl.style.setProperty('--hx', (e.clientX - r.left) + 'px');
      gridEl.style.setProperty('--hy', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  const telemetry = document.querySelector('.telemetry-bar');
  if (telemetry) {
    const item = document.createElement('div');
    item.className = 'telemetry-item';
    item.innerHTML = '<span class="t-key">IST:</span> <span class="t-val" id="missionClock">--:--:--</span>';
    telemetry.appendChild(item);
    const clock = item.querySelector('#missionClock');
    const tickClock = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false }); };
    tickClock();
    setInterval(() => { if (!document.hidden) tickClock(); }, 1000);
  }

  const accent = document.querySelector('.hero-title .hero-accent');
  if (accent && !reduceMotion) {
    const finalText = accent.textContent.trim();
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/';
    const t0 = performance.now();
    (function scramble(now) {
      const p = Math.min((now - t0) / 1000, 1);
      const lock = Math.floor(p * finalText.length);
      accent.textContent = finalText.split('').map((ch, i) =>
        ch === ' ' || i < lock ? ch : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
      if (p < 1) requestAnimationFrame(scramble); else accent.textContent = finalText;
    })(t0);
  }

});
