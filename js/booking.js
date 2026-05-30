/* ================================================
   booking.js — Book a Call Page
   FitVault · Marcus Osei Fitness

   Handles:
   - Nav scroll
   - Scroll reveal
   - Animated SVG journey steps
   - Full custom calendar (month nav + day selection)
   - Time slot panels (Morning / Afternoon / Evening)
   - Custom country code dropdown (searchable)
   - Custom call format selector (radio replacement)
   - Textarea char counter
   - Form validation (real-time + on submit)
   - Booking confirmation animation
   - Smooth scroll
   ================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────
     NAV
  ───────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }


  /* ─────────────────────────────────────
     SCROLL REVEAL
  ───────────────────────────────────── */
  const revEls = document.querySelectorAll('.reveal');
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
  revEls.forEach(el => revObs.observe(el));


  /* ─────────────────────────────────────
     SVG JOURNEY ANIMATION
  ───────────────────────────────────── */
  const jNodes = [
    { id: 'jn1', delay: 100 },
    { id: 'jn2', delay: 500 },
    { id: 'jn3', delay: 900 },
  ];
  const jLabels = ['jl1', 'jl2', 'jl3'];
  const jTrack = document.getElementById('jtrack');

  jNodes.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) el.style.cssText += 'opacity:0;transform:translateY(6px);transition:opacity .5s ease,transform .5s ease;';
  });
  jLabels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.cssText += 'opacity:0;transition:opacity .6s ease;';
  });

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  let jDone = false;
  const jSection = document.getElementById('booking-header');
  if (jSection) {
    const jObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !jDone) {
          jDone = true;
          setTimeout(() => {
            // Draw track line from x=44 to x=402
            if (jTrack) {
              const start = performance.now();
              const dur = 1200;
              function draw(now) {
                const t = Math.min((now - start) / dur, 1);
                const x2 = 44 + (402 - 44) * ease(t);
                jTrack.setAttribute('x2', x2.toFixed(1));
                if (t < 1) requestAnimationFrame(draw);
              }
              requestAnimationFrame(draw);
            }
            // Nodes + labels
            jNodes.forEach(({ id, delay }, i) => {
              setTimeout(() => {
                const el = document.getElementById(id);
                if (el) { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }
                const lbl = document.getElementById(jLabels[i]);
                if (lbl) lbl.style.opacity = '1';
              }, delay);
            });
          }, 300);
          jObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    jObs.observe(jSection);
  }


  /* ─────────────────────────────────────
     CALENDAR STATE
  ───────────────────────────────────── */
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();
  let selectedDate = null;
  let selectedTime = null;

  // Simulated availability logic (replace with API in production)
  function dayStatus(year, month, day) {
    const d = new Date(year, month, day);
    const dow = d.getDay();
    if (d < today) return 'past';
    if (dow === 0 || dow === 6) return 'off';   // weekends
    if ([10, 17, 24].includes(day)) return 'full';
    const diff = (d - today) / 86400000;
    if (diff <= 1) return 'full';
    return 'avail';
  }

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function buildCalendar(year, month) {
    const grid = document.getElementById('cal-grid');
    document.getElementById('cal-month-name').textContent = `${MONTHS[month]} ${year}`;
    grid.innerHTML = '';

    const firstDow = new Date(year, month, 1).getDay();
    const offset = (firstDow + 6) % 7; // Mon = 0
    const days   = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < offset; i++) {
      const empty = document.createElement('div');
      empty.className = 'cday cday--empty';
      grid.appendChild(empty);
    }

    for (let d = 1; d <= days; d++) {
      const status = dayStatus(year, month, d);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = d;
      btn.className = 'cday cday--' + status;

      const thisDate = new Date(year, month, d);
      if (thisDate.getTime() === today.getTime()) btn.classList.add('cday--today');
      if (selectedDate && selectedDate.getTime() === thisDate.getTime()) btn.classList.add('cday--sel');

      if (status === 'avail') {
        btn.setAttribute('aria-label', thisDate.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' }));
        btn.addEventListener('click', () => {
          selectedDate = new Date(year, month, d);
          selectedTime = null;
          buildCalendar(viewYear, viewMonth); // re-render to show selection
          goStep(2);
        });
      }
      grid.appendChild(btn);
    }

    // Prev/next nav disable
    document.getElementById('cal-prev').disabled =
      (year === today.getFullYear() && month <= today.getMonth());
  }

  document.getElementById('cal-prev').addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    buildCalendar(viewYear, viewMonth);
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    buildCalendar(viewYear, viewMonth);
  });


  /* ─────────────────────────────────────
     TIME SLOTS
  ───────────────────────────────────── */
  function formatDate(d) {
    return d.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  }

  // All slots: 7am–7pm, 30-min increments
  const allSlots = [
    { t:'7:00 AM',  period:'morning'   },
    { t:'7:30 AM',  period:'morning'   },
    { t:'8:00 AM',  period:'morning'   },
    { t:'8:30 AM',  period:'morning'   },
    { t:'9:00 AM',  period:'morning'   },
    { t:'9:30 AM',  period:'morning'   },
    { t:'10:00 AM', period:'morning'   },
    { t:'10:30 AM', period:'morning'   },
    { t:'11:00 AM', period:'morning'   },
    { t:'11:30 AM', period:'morning'   },
    { t:'12:00 PM', period:'afternoon' },
    { t:'12:30 PM', period:'afternoon' },
    { t:'1:00 PM',  period:'afternoon' },
    { t:'1:30 PM',  period:'afternoon' },
    { t:'2:00 PM',  period:'afternoon' },
    { t:'2:30 PM',  period:'afternoon' },
    { t:'3:00 PM',  period:'afternoon' },
    { t:'3:30 PM',  period:'afternoon' },
    { t:'4:00 PM',  period:'afternoon' },
    { t:'5:00 PM',  period:'evening'   },
    { t:'5:30 PM',  period:'evening'   },
    { t:'6:00 PM',  period:'evening'   },
    { t:'6:30 PM',  period:'evening'   },
    { t:'7:00 PM',  period:'evening'   },
  ];

  // Simulate some busy slots per day-of-month
  function busySlots(date) {
    const busy = {
      3:  ['9:00 AM','2:00 PM','5:00 PM'],
      9:  ['10:00 AM','12:00 PM','3:30 PM'],
      16: ['8:00 AM','11:00 AM','4:00 PM'],
      23: ['7:00 AM','3:00 PM','6:00 PM'],
    };
    return busy[date.getDate()] || ['9:30 AM','2:30 PM'];
  }

  function buildTimeSlots(date) {
    const label = document.getElementById('time-date-label');
    label.textContent = date.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });

    const busy = busySlots(date);
    const periods = { morning: [], afternoon: [], evening: [] };

    allSlots.forEach(({ t, period }) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = t;
      const isBusy = busy.includes(t);
      btn.className = 'slot' + (isBusy ? ' slot--full' : '');
      if (!isBusy) {
        btn.addEventListener('click', () => {
          selectedTime = t;
          goStep(3);
        });
      }
      periods[period].push(btn);
    });

    ['morning', 'afternoon', 'evening'].forEach(p => {
      const sec  = document.getElementById('sec-' + p);
      const grid = document.getElementById('grid-' + p);
      grid.innerHTML = '';
      if (periods[p].length) {
        periods[p].forEach(btn => grid.appendChild(btn));
        sec.style.display = '';
      } else {
        sec.style.display = 'none';
      }
    });
  }


  /* ─────────────────────────────────────
     STEP NAVIGATION
  ───────────────────────────────────── */
  const STEP_IDS = { 1: 'wpanel-1', 2: 'wpanel-2', 3: 'wpanel-3', confirm: 'wpanel-confirm' };
  const WSTEP_NODES = [null, document.getElementById('wstep-1'), document.getElementById('wstep-2'), document.getElementById('wstep-3')];
  const LINE_12 = document.getElementById('wline-12');
  const LINE_23 = document.getElementById('wline-23');

  function goStep(step) {
    // Hide all panels
    Object.values(STEP_IDS).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    // Update step indicators
    for (let i = 1; i <= 3; i++) {
      const node = WSTEP_NODES[i];
      if (!node) continue;
      node.classList.remove('active', 'done');
      if (i === step) node.classList.add('active');
      else if (i < step) node.classList.add('done');
    }
    if (LINE_12) LINE_12.classList.toggle('done', step > 1);
    if (LINE_23) LINE_23.classList.toggle('done', step > 2);

    if (step === 2) {
      document.getElementById('wpanel-2').classList.add('active');
      buildTimeSlots(selectedDate);
    } else if (step === 3) {
      document.getElementById('wpanel-3').classList.add('active');
      updatePill();
    } else if (step === 'confirm') {
      document.getElementById('wpanel-confirm').classList.add('active');
      animateCheck();
    } else {
      document.getElementById('wpanel-1').classList.add('active');
    }

    // Scroll widget into view on mobile
    if (window.innerWidth < 1024) {
      const w = document.getElementById('booking-widget');
      if (w) {
        setTimeout(() => {
          const top = w.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 60);
      }
    }
  }

  function updatePill() {
    const pd = document.getElementById('pill-date');
    const pt = document.getElementById('pill-time');
    if (pd && selectedDate) pd.textContent = formatDate(selectedDate);
    if (pt && selectedTime) pt.textContent = `${selectedTime} WAT`;
  }

  document.getElementById('back-to-1').addEventListener('click', () => goStep(1));
  document.getElementById('back-to-2').addEventListener('click', () => goStep(2));


  /* ─────────────────────────────────────
     COUNTRY CODE DROPDOWN
  ───────────────────────────────────── */
  const COUNTRIES = [
    { flag:'🇳🇬', name:'Nigeria',      dial:'+234' },
    { flag:'🇬🇭', name:'Ghana',        dial:'+233' },
    { flag:'🇨🇮', name:"Côte d'Ivoire",dial:'+225' },
    { flag:'🇸🇳', name:'Senegal',      dial:'+221' },
    { flag:'🇨🇲', name:'Cameroon',     dial:'+237' },
    { flag:'🇰🇪', name:'Kenya',        dial:'+254' },
    { flag:'🇺🇬', name:'Uganda',       dial:'+256' },
    { flag:'🇹🇿', name:'Tanzania',     dial:'+255' },
    { flag:'🇿🇦', name:'South Africa', dial:'+27'  },
    { flag:'🇪🇹', name:'Ethiopia',     dial:'+251' },
    { flag:'🇲🇦', name:'Morocco',      dial:'+212' },
    { flag:'🇪🇬', name:'Egypt',        dial:'+20'  },
    { flag:'🇬🇧', name:'United Kingdom',dial:'+44' },
    { flag:'🇺🇸', name:'United States',dial:'+1'  },
    { flag:'🇨🇦', name:'Canada',       dial:'+1'  },
    { flag:'🇩🇪', name:'Germany',      dial:'+49' },
    { flag:'🇫🇷', name:'France',       dial:'+33' },
    { flag:'🇦🇪', name:'UAE',          dial:'+971'},
  ];

  const ccBtn    = document.getElementById('cc-btn');
  const ccPanel  = document.getElementById('cc-panel');
  const ccSearch = document.getElementById('cc-search-input');
  const ccOpts   = document.getElementById('cc-options');
  const ccFlag   = document.getElementById('cc-flag');
  const ccDial   = document.getElementById('cc-dial');

  let selectedCC = COUNTRIES[0]; // default Nigeria

  function renderCountries(filter = '') {
    ccOpts.innerHTML = '';
    const filtered = filter
      ? COUNTRIES.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.dial.includes(filter))
      : COUNTRIES;

    filtered.forEach(c => {
      const div = document.createElement('div');
      div.className = 'cc-option' + (c === selectedCC ? ' selected' : '');
      div.setAttribute('role', 'option');
      div.setAttribute('aria-selected', c === selectedCC);
      div.innerHTML = `<span class="cc-opt-flag">${c.flag}</span><span class="cc-opt-name">${c.name}</span><span class="cc-opt-dial">${c.dial}</span>`;
      div.addEventListener('click', () => {
        selectedCC = c;
        ccFlag.textContent = c.flag;
        ccDial.textContent = c.dial;
        closeCcPanel();
      });
      ccOpts.appendChild(div);
    });
  }

  function openCcPanel() {
    ccPanel.hidden = false;
    ccBtn.setAttribute('aria-expanded', 'true');
    ccSearch.value = '';
    renderCountries();
    ccSearch.focus();
  }

  function closeCcPanel() {
    ccPanel.hidden = true;
    ccBtn.setAttribute('aria-expanded', 'false');
    ccBtn.focus();
  }

  ccBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    ccPanel.hidden ? openCcPanel() : closeCcPanel();
  });

  ccSearch.addEventListener('input', () => renderCountries(ccSearch.value));

  ccSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCcPanel();
  });

  document.addEventListener('click', (e) => {
    if (!ccPanel.hidden && !ccPanel.contains(e.target) && e.target !== ccBtn) closeCcPanel();
  });

  renderCountries();


  /* ─────────────────────────────────────
     CUSTOM FORMAT SELECTOR
  ───────────────────────────────────── */
  const formatLabels = document.querySelectorAll('.format-opt');
  formatLabels.forEach(label => {
    label.addEventListener('click', () => {
      formatLabels.forEach(l => l.classList.remove('selected'));
      label.classList.add('selected');
      const radio = label.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });


  /* ─────────────────────────────────────
     TEXTAREA CHAR COUNTER
  ───────────────────────────────────── */
  const goalTA = document.getElementById('f-goal');
  const charN  = document.getElementById('char-n');
  if (goalTA && charN) {
    goalTA.addEventListener('input', () => {
      charN.textContent = goalTA.value.length;
    });
  }


  /* ─────────────────────────────────────
     FORM VALIDATION
  ───────────────────────────────────── */
  function validateField(inputId, errorId, check) {
    const input = document.getElementById(inputId);
    const errEl = document.getElementById(errorId);
    if (!input) return true;
    const v = input.value.trim();
    const { ok, msg } = check(v);
    input.classList.toggle('err', !ok);
    if (errEl) errEl.textContent = ok ? '' : msg;
    return ok;
  }

  const validations = {
    'f-name':  v => ({ ok: v.length >= 2,                             msg: 'Please enter your full name.' }),
    'f-email': v => ({ ok: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),     msg: 'Please enter a valid email address.' }),
    'f-phone': v => ({ ok: v.length >= 5 && /^[\d\s\-()]+$/.test(v), msg: 'Please enter a valid phone number.' }),
  };

  // Blur-time validation
  Object.entries(validations).forEach(([id, check]) => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('blur', () => validateField(id, 'e-' + id.replace('f-',''), check));
  });

  function validateAll() {
    return [
      validateField('f-name',  'e-name',  validations['f-name']),
      validateField('f-email', 'e-email', validations['f-email']),
      validateField('f-phone', 'e-phone', validations['f-phone']),
    ].every(Boolean);
  }


  /* ─────────────────────────────────────
     FORM SUBMISSION
  ───────────────────────────────────── */
  const form   = document.getElementById('booking-form');
  const btnSub = document.getElementById('btn-submit');

  form && form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    btnSub.classList.add('loading');
    btnSub.disabled = true;

    // Simulate API call — replace with real endpoint
    setTimeout(() => {
      btnSub.classList.remove('loading');
      btnSub.disabled = false;
      showConfirmation();
    }, 1800);
  });

  function showConfirmation() {
    // Populate confirmation detail
    const cdpDate = document.getElementById('cdp-date');
    const cdpTime = document.getElementById('cdp-time');
    if (cdpDate && selectedDate) cdpDate.textContent = formatDate(selectedDate);
    if (cdpTime && selectedTime) cdpTime.textContent = `${selectedTime} (WAT)`;

    // Mark all steps done
    WSTEP_NODES.slice(1).forEach(n => { if (n) { n.classList.remove('active'); n.classList.add('done'); } });
    if (LINE_12) LINE_12.classList.add('done');
    if (LINE_23) LINE_23.classList.add('done');

    goStep('confirm');
  }


  /* ─────────────────────────────────────
     CONFIRMATION CHECKMARK ANIMATION
  ───────────────────────────────────── */
  function animateCheck() {
    const pl = document.getElementById('check-pl');
    if (!pl) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        pl.style.strokeDashoffset = '0';
      });
    });
  }


  /* ─────────────────────────────────────
     SMOOTH SCROLL
  ───────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ─────────────────────────────────────
     INIT
  ───────────────────────────────────── */
  buildCalendar(viewYear, viewMonth);

})();