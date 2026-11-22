/* ==========================================================================
   AERO & ROBOTICS CLUB (ARC) - BIT SINDRI
   Main Interactivity Script (Clean & Lightweight)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

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

  // ---- 2. Navbar Active Links on Scroll ----
  const sections = document.querySelectorAll('section[id], header[id]');
  const navItems = document.querySelectorAll('.nav-link');

  function onScroll() {
    const scrollY = window.scrollY + 100;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', onScroll);
  onScroll();

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

  // ---- 6. Join Form Submission Feedback ----
  const joinForm = document.getElementById('joinForm');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = joinForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Submitting...';

      setTimeout(() => {
        alert('Thank you! Your application has been submitted to ARC BIT Sindri.');
        joinForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 500);
    });
  }

});
