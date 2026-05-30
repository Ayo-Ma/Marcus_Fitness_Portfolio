/* ================================================
   results.js
   FitVault · Marcus Osei Fitness

   Handles:
   - Nav scroll behaviour
   - Mobile hamburger menu
   - Scroll reveal animations
   - Animated stat counters (header)
   - Trust signal SVG bar animation
   - Staggered quote card entrance
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
     ANIMATED STAT COUNTERS
     Counts up from 0 to target value when
     the header stats row enters viewport
  ───────────────────────────────────── */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el, target, duration) {
    const start = performance.now();
    const isZero = target === 0;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = isZero ? 0 : Math.round(eased * target);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const statNums = document.querySelectorAll('.header-stat-num[data-target]');
  let statsAnimated = false;

  const statsRow = document.querySelector('.results-header-stats');
  if (statsRow && statNums.length) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          statNums.forEach(el => {
            const target = parseInt(el.dataset.target, 10);
            // Delay slightly for the "0 automated replies" to land differently
            const delay = target === 0 ? 800 : 200;
            setTimeout(() => animateCounter(el, target, 1800), delay);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statsObserver.observe(statsRow);
  }


  /* ─────────────────────────────────────
     TRUST SIGNAL SVG BAR ANIMATION
     Draws a line across 8 named dots
     when the bar enters viewport
  ───────────────────────────────────── */
  const trustBar = document.querySelector('.trust-signal-bar');
  const trustLine = document.getElementById('trust-line');
  const trustDots = document.querySelectorAll('#trust-dots circle');

  let trustAnimated = false;

  if (trustBar && trustLine) {
    const trustObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !trustAnimated) {
          trustAnimated = true;

          // Animate line extending from x=60 to x=840 over 1.8s
          const startX = 60;
          const endX = 840;
          const duration = 1800;
          const start = performance.now();

          function drawLine(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutQuart(progress);
            const currentX = startX + (endX - startX) * eased;

            trustLine.setAttribute('x2', currentX.toFixed(1));

            if (progress < 1) {
              requestAnimationFrame(drawLine);
            }
          }

          requestAnimationFrame(drawLine);

          // Stagger dot appearances as the line passes through each
          const dotXPositions = [60, 160, 260, 360, 460, 560, 660, 760, 840];
          dotXPositions.forEach((xPos, i) => {
            // Calculate when line reaches this x position
            const dotProgress = (xPos - startX) / (endX - startX);
            const dotDelay = dotProgress * duration;

            setTimeout(() => {
              if (trustDots[i]) {
                trustDots[i].style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                trustDots[i].style.opacity = '0.9';
                trustDots[i].style.transform = 'scale(1.3)';
                setTimeout(() => {
                  if (trustDots[i]) trustDots[i].style.transform = 'scale(1)';
                }, 300);
              }
            }, dotDelay);
          });

          trustObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    trustObserver.observe(trustBar);
  }


  /* ─────────────────────────────────────
     QUOTE CARDS — staggered entrance
     Cards in the grid animate in
     with increasing delays per row
  ───────────────────────────────────── */
  const quoteCards = document.querySelectorAll('.quote-card');

  // Assign stagger delays based on position in grid
  quoteCards.forEach((card, i) => {
    card.style.transitionDelay = `${(i % 3) * 0.08}s`;
  });


  /* ─────────────────────────────────────
     TRANSFORMATION STATS BADGE
     Subtle pulse animation on stat badges
     when transformations come into view
  ───────────────────────────────────── */
  const statBadges = document.querySelectorAll('.transformation-stats-badge');

  const badgeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('badge-visible');
        badgeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statBadges.forEach(badge => {
    badge.style.opacity = '0';
    badge.style.transform = 'translateY(12px)';
    badge.style.transition = 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s';
    badgeObserver.observe(badge);
  });

  // When badge becomes visible via observer
  document.addEventListener('animationstart', () => {}, false);
  statBadges.forEach(badge => {
    const parentObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            badge.style.opacity = '1';
            badge.style.transform = 'translateY(0)';
          }, 500);
          parentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    const article = badge.closest('.transformation');
    if (article) parentObserver.observe(article);
  });


  /* ─────────────────────────────────────
     PATTERN SECTION
     Animate the amber rule lines drawing
     out from 0 width when they enter view
  ───────────────────────────────────── */
  const patternRules = document.querySelectorAll('.pattern-rule');

  patternRules.forEach(rule => {
    rule.style.width = '0';
    rule.style.transition = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  });

  const patternObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = '32px';
        patternObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.8 });

  patternRules.forEach(rule => patternObserver.observe(rule));


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