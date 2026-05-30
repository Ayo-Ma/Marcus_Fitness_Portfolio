/* ================================================
   about.js
   FitVault · Marcus Osei Fitness

   Handles:
   - Nav scroll behaviour
   - Mobile hamburger menu
   - Scroll reveal animations
   - SVG pillars animation (staggered entrance)
   - Philosophy amber rules animation
   - Experience stat counter animation
   ================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     NAV
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
    hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }


  /* ─────────────────────────────────────
     SCROLL REVEAL
  ───────────────────────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────
     HEADER SVG PILLARS ANIMATION
     Staggered entrance: line draws, then
     nodes fade in one by one
  ───────────────────────────────────── */
  const pillarsSection = document.getElementById('about-header');
  const pillarLine = document.getElementById('pillar-line');
  const pillar1 = document.getElementById('pillar-1');
  const pillar2 = document.getElementById('pillar-2');
  const pillar3 = document.getElementById('pillar-3');

  // Set initial opacity
  [pillar1, pillar2, pillar3].forEach(p => {
    if (p) {
      p.style.opacity = '0';
      p.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      p.style.transform = 'translateY(6px)';
    }
  });

  let pillarsAnimated = false;

  function animatePillars() {
    if (pillarsAnimated) return;
    pillarsAnimated = true;

    // Draw connecting line first (x2 from 40 to 300)
    if (pillarLine) {
      const start = performance.now();
      const duration = 1000;

      function drawLine(now) {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const x2 = 40 + (300 - 40) * eased;
        pillarLine.setAttribute('x2', x2.toFixed(1));
        if (t < 1) requestAnimationFrame(drawLine);
      }
      requestAnimationFrame(drawLine);
    }

    // Stagger pillar node entrances
    const delays = [200, 600, 1000];
    [pillar1, pillar2, pillar3].forEach((el, i) => {
      if (!el) return;
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, delays[i]);
    });
  }

  if (pillarsSection) {
    const pillarsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Small delay after page load so user sees the animation
          setTimeout(animatePillars, 400);
          pillarsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    pillarsObserver.observe(pillarsSection);
  }


  /* ─────────────────────────────────────
     PHILOSOPHY AMBER RULES
     Each section's rule line expands
     from 0 to 36px when block enters view
  ───────────────────────────────────── */
  const philRules = document.querySelectorAll('.phil-rule');

  const rulesObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('expanded');
        rulesObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  philRules.forEach(rule => rulesObserver.observe(rule));


  /* ─────────────────────────────────────
     EXPERIENCE STAT COUNTERS
     Count up numbers in the exp-grid
  ───────────────────────────────────── */
  function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

  function animateCount(el, target, duration, suffix = '') {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      const val = Math.round(easeOutQuad(t) * target);
      el.textContent = val + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const expNums = document.querySelectorAll('.exp-num');
  let expAnimated = false;

  const expGrid = document.querySelector('.exp-grid');
  if (expGrid) {
    const expObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !expAnimated) {
          expAnimated = true;

          // Map each stat to its target value
          const targets = [
            { el: expNums[0], val: 150, suffix: '+' },
            { el: expNums[1], val: 6, suffix: '' },
            { el: expNums[2], val: 3, suffix: '+' },
            { el: expNums[3], val: 0, suffix: '' },
          ];

          targets.forEach(({ el, val, suffix }, i) => {
            if (!el) return;
            setTimeout(() => {
              if (val === 0) {
                el.textContent = '0';
                return;
              }
              animateCount(el, val, 1600, suffix);
            }, i * 120);
          });

          expObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    expObserver.observe(expGrid);
  }


  /* ─────────────────────────────────────
     CRED CARD — Entrance animation
  ───────────────────────────────────── */
  const credCard = document.querySelector('.about-cred-card');
  if (credCard) {
    credCard.style.opacity = '0';
    credCard.style.transform = 'translateY(16px)';
    credCard.style.transition = 'opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s';

    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          credCard.style.opacity = '1';
          credCard.style.transform = 'translateY(0)';
          cardObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const photoWrap = document.querySelector('.about-photo-wrap');
    if (photoWrap) cardObserver.observe(photoWrap);
  }


  /* ─────────────────────────────────────
     SMOOTH SCROLL
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();