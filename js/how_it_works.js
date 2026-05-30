/* ================================================
   how_it_works.js
   FitVault · Marcus Osei Fitness

   Handles:
   - Nav scroll behaviour
   - Mobile hamburger menu
   - Scroll reveal animations (Intersection Observer)
   - SVG process diagram animation (scroll-triggered)
   - FAQ accordion (open all on desktop, toggle on mobile)
   ================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     NAV — frosted glass on scroll
  ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }


  /* ─────────────────────────────────────
     MOBILE MENU
  ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }


  /* ─────────────────────────────────────
     SCROLL REVEAL
     Fades + slides elements in as they enter viewport
  ───────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────
     SVG PROCESS DIAGRAM ANIMATION
     Draws the connecting line and fades in nodes/labels
     as the header section enters view
  ───────────────────────────────────── */
  const svgSection = document.getElementById('hiw-header');
  const connectLine = document.getElementById('connect-line');

  const svgElements = [
    { id: 'node-1',  delay: 200  },
    { id: 'label-1', delay: 400  },
    { id: 'node-2',  delay: 700  },
    { id: 'label-2', delay: 900  },
    { id: 'node-3',  delay: 1200 },
    { id: 'label-3', delay: 1400 },
  ];

  function animateSvg() {
    // Animate the dashed connecting line via stroke-dashoffset
    if (connectLine) {
      const lineLength = 300; // approximate length of line
      connectLine.style.strokeDasharray = `${lineLength}`;
      connectLine.style.strokeDashoffset = `${lineLength}`;
      connectLine.style.transition = 'stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1) 300ms';
      // Trigger
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          connectLine.style.strokeDashoffset = '0';
        });
      });
    }

    // Fade in each element with staggered delay
    svgElements.forEach(({ id, delay }) => {
      const el = document.getElementById(id);
      if (!el) return;
      setTimeout(() => {
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, delay);
    });
  }

  // Set initial state
  svgElements.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(8px)';
    }
  });

  let svgAnimated = false;
  if (svgSection) {
    const svgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !svgAnimated) {
          svgAnimated = true;
          animateSvg();
          svgObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    svgObserver.observe(svgSection);
  }


  /* ─────────────────────────────────────
     FAQ ACCORDION
     Desktop (≥768px): all open by default
     Mobile (<768px): all closed, toggle on click
  ───────────────────────────────────── */
  const faqItems = document.querySelectorAll('[data-faq]');

  function isMobile() {
    return window.innerWidth < 768;
  }

  function openFaq(item) {
    item.classList.add('open');
    const btn = item.querySelector('.faq-question');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function closeFaq(item) {
    item.classList.remove('open');
    const btn = item.querySelector('.faq-question');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function initFaqs() {
    if (isMobile()) {
      // Mobile: all closed
      faqItems.forEach(item => closeFaq(item));
    } else {
      // Desktop: all open
      faqItems.forEach(item => openFaq(item));
    }
  }

  // Click handler — always toggle on click regardless of viewport
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      if (isOpen) {
        closeFaq(item);
      } else {
        openFaq(item);
      }
    });
  });

  // Init on load
  initFaqs();

  // Re-init on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initFaqs, 150);
  });


  /* ─────────────────────────────────────
     PHASE BLOCKS — progressive reveal
     Each phase fades in as it enters view
     (handled by the .reveal system above,
     but this adds an extra progress indicator
     on the phase connector line)
  ───────────────────────────────────── */
  const phaseBlocks = document.querySelectorAll('.phase-block');

  const phaseObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('phase-in-view');
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -60px 0px'
  });

  phaseBlocks.forEach(block => phaseObserver.observe(block));


  /* ─────────────────────────────────────
     SMOOTH SCROLL for anchor links
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80; // account for fixed nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();