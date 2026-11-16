/**
 * EdTech Nigeria Landing Page - Vanilla JavaScript
 */

function init() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. NAVBAR: Scroll 40px Border + Mobile Menu + Smooth Scroll
     ========================================================================== */
  const navbar = document.getElementById('navbar');
  const navHamburger = document.getElementById('navHamburger');
  const navMobilePanel = document.getElementById('navMobilePanel');

  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  function closeMobileNav() {
    if (!navHamburger || !navMobilePanel) return;
    navHamburger.setAttribute('aria-expanded', 'false');
    navMobilePanel.classList.remove('is-open');
    navMobilePanel.setAttribute('aria-hidden', 'true');
  }

  function toggleMobileNav() {
    if (!navHamburger || !navMobilePanel) return;
    const isExpanded = navHamburger.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMobileNav();
    } else {
      navHamburger.setAttribute('aria-expanded', 'true');
      navMobilePanel.classList.add('is-open');
      navMobilePanel.setAttribute('aria-hidden', 'false');
    }
  }

  if (navHamburger) {
    navHamburger.addEventListener('click', toggleMobileNav);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
    }
  });

  if (navMobilePanel) {
    const mobileLinks = navMobilePanel.querySelectorAll('a');
    mobileLinks.forEach((link) => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  /* ==========================================================================
     2. HERO: Word-by-Word Headline Reveal
     ========================================================================== */
  const heroHeadline = document.getElementById('heroHeadline');

  if (heroHeadline) {
    const rawText = heroHeadline.textContent.trim();
    if (!heroHeadline.querySelector('.hero-word')) {
      const words = rawText.split(/\s+/);
      heroHeadline.innerHTML = '';

      words.forEach((word) => {
        const span = document.createElement('span');
        span.className = 'hero-word is-revealed';
        span.textContent = word;
        heroHeadline.appendChild(span);
      });
    }
  }

  /* ==========================================================================
     3. 3D APPLE-STYLE INTERACTIVE SHOWCASE CONTROLLER
     ========================================================================== */
  const showcaseViewport = document.getElementById('showcaseViewport');
  const showcaseRig = document.getElementById('showcaseRig');
  const showcaseNav = document.getElementById('showcaseNav');
  const pills = document.querySelectorAll('.showcase-pill');

  if (showcaseViewport && showcaseRig && pills.length > 0) {
    let currentPhase = 1;
    const totalPhases = 4;
    const phaseDurations = [3000, 2400, 4200, 3600]; // Duration per phase in ms
    let phaseStartTime = Date.now();
    let isUserPaused = false;
    let autoTimer = null;
    let animFrame = null;

    // Mouse Parallax & Gyro State
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    function getBaseRotation(phase) {
      switch (phase) {
        case 1: return { x: 0, y: 0, z: 0 };
        case 2: return { x: 0, y: -1.5, z: 0 };
        case 3: return { x: 6, y: -8, z: 1.5 }; // Clean subtle elevation
        case 4: return { x: 0, y: 0, z: 0 };
        default: return { x: 0, y: 0, z: 0 };
      }
    }

    function setPhase(phase, manual = false) {
      currentPhase = phase;
      showcaseViewport.setAttribute('data-active', String(phase));

      pills.forEach((p) => {
        const pPhase = parseInt(p.getAttribute('data-phase'), 10);
        const isActive = pPhase === phase;
        p.classList.toggle('is-active', isActive);
        p.setAttribute('aria-selected', String(isActive));

        const progressFill = p.querySelector('.pill-progress-fill');
        if (progressFill) {
          progressFill.style.width = pPhase < phase ? '100%' : '0%';
        }
      });

      phaseStartTime = Date.now();

      if (manual) {
        isUserPaused = true;
        // Resume autoplay after 9 seconds of inactivity
        clearTimeout(autoTimer);
        autoTimer = setTimeout(() => {
          isUserPaused = false;
          nextPhase();
        }, 9000);
      }
    }

    function nextPhase() {
      const next = currentPhase >= totalPhases ? 1 : currentPhase + 1;
      setPhase(next, false);
    }

    // Pill click triggers
    pills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const phase = parseInt(pill.getAttribute('data-phase'), 10);
        setPhase(phase, true);
      });
    });

    // Mouse Parallax on Desktop
    if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
      showcaseViewport.addEventListener('mousemove', (e) => {
        const rect = showcaseViewport.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const normX = (e.clientX - centerX) / (rect.width / 2);
        const normY = (e.clientY - centerY) / (rect.height / 2);

        // Limit tilt to +/- 9 degrees
        targetRotY = normX * 9;
        targetRotX = -normY * 8;
      });

      showcaseViewport.addEventListener('mouseleave', () => {
        targetRotX = 0;
        targetRotY = 0;
      });
    }

    // Main Animation Loop
    function updateShowcaseLoop() {
      const now = Date.now();
      const currentDuration = phaseDurations[currentPhase - 1] || 3200;
      const elapsed = now - phaseStartTime;

      if (!isUserPaused && !prefersReducedMotion) {
        const activePill = document.querySelector(`.showcase-pill[data-phase="${currentPhase}"]`);
        const fill = activePill ? activePill.querySelector('.pill-progress-fill') : null;
        if (fill) {
          const progress = Math.min(100, (elapsed / currentDuration) * 100);
          fill.style.width = `${progress}%`;
        }

        if (elapsed >= currentDuration) {
          nextPhase();
        }
      }

      // Smooth interpolation for 3D Rig
      if (!prefersReducedMotion) {
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        const base = getBaseRotation(currentPhase);
        const totalX = base.x + currentRotX;
        const totalY = base.y + currentRotY;
        const totalZ = base.z;

        showcaseRig.style.transform = `rotateX(${totalX.toFixed(2)}deg) rotateY(${totalY.toFixed(2)}deg) rotateZ(${totalZ}deg)`;
      }

      animFrame = requestAnimationFrame(updateShowcaseLoop);
    }

    // Initialize in Phase 1
    setPhase(1, false);
    animFrame = requestAnimationFrame(updateShowcaseLoop);
  }

  /* ==========================================================================
     4. REVEAL BEHAVIORS: DEFAULT VISIBLE EVERYWHERE
     ========================================================================== */
  const revealElements = [
    document.querySelector('.map-stage'),
    ...document.querySelectorAll('.story-block'),
    ...document.querySelectorAll('.exam-card'),
    ...document.querySelectorAll('.blog-card'),
    ...document.querySelectorAll('.table-row'),
    ...document.querySelectorAll('.js-reveal-item')
  ].filter(Boolean);

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const viewportHeight = window.innerHeight;

    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top >= viewportHeight) {
        el.classList.add('js-will-reveal');
      } else {
        el.classList.add('is-revealed');
        if (el.classList.contains('map-stage')) {
          el.classList.add('has-sway');
        }
      }
    });

    document.body.classList.add('js-observer-ready');

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;

        target.classList.remove('js-will-reveal');
        target.classList.add('is-revealed');

        if (target.classList.contains('map-stage')) {
          setTimeout(() => {
            target.classList.add('has-sway');
          }, 1150);
        }

        obs.unobserve(target);
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.js-will-reveal').forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-revealed'));
  }
}

// Support both already-loaded DOM (modules / deferred scripts) and DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
