/**
 * EdTech Nigeria Landing Page - Vanilla JavaScript
 */

function init() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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
     2. HERO ANIMATIONS: Word-by-Word + Character Entrance + Mouse Parallax
     ========================================================================== */
  const heroHeadline = document.getElementById('heroHeadline');
  const studentItems = document.querySelectorAll('.hero-student-item');

  // Ensure all student items are marked entered immediately
  studentItems.forEach(item => item.classList.add('is-entered'));

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

  // Stagger idle float animation
  if (!prefersReducedMotion) {
    studentItems.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('has-idle');
      }, 300 + index * 60);
    });
  }

  // Hero Mouse Parallax (4-14px shift; disabled on touch devices)
  const heroSection = document.getElementById('hero');
  if (isFinePointer && !prefersReducedMotion && heroSection) {
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let parallaxRaf = null;

    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = relX;
      targetY = relY;

      if (!parallaxRaf) {
        parallaxRaf = requestAnimationFrame(updateParallax);
      }
    });

    function updateParallax() {
      mouseX += (targetX - mouseX) * 0.1;
      mouseY += (targetY - mouseY) * 0.1;

      studentItems.forEach((item) => {
        const depth = parseFloat(item.getAttribute('data-depth') || '0.08');
        const shiftX = (mouseX * depth * 80).toFixed(2);
        const shiftY = (mouseY * depth * 65).toFixed(2);
        item.style.setProperty('--px-x', `${shiftX}px`);
        item.style.setProperty('--px-y', `${shiftY}px`);
      });

      if (Math.abs(targetX - mouseX) > 0.001 || Math.abs(targetY - mouseY) > 0.001) {
        parallaxRaf = requestAnimationFrame(updateParallax);
      } else {
        parallaxRaf = null;
      }
    }
  }

  /* ==========================================================================
     3. SCREENSHOTS MARQUEE (Infinite Loop with Smooth Hover Deceleration)
     ========================================================================== */
  const trackWrapper = document.getElementById('screenshotsTrackWrapper');
  const track = document.getElementById('screenshotsTrack');

  if (track && trackWrapper && !prefersReducedMotion) {
    let currentX = 0;
    const baseSpeed = 0.85;
    let targetSpeed = baseSpeed;
    let currentSpeed = baseSpeed;

    trackWrapper.addEventListener('mouseenter', () => {
      targetSpeed = 0;
    });

    trackWrapper.addEventListener('mouseleave', () => {
      targetSpeed = baseSpeed;
    });

    function animateMarquee() {
      currentSpeed += (targetSpeed - currentSpeed) * 0.06;
      currentX -= currentSpeed;

      const halfWidth = track.scrollWidth / 2;
      if (halfWidth > 0 && Math.abs(currentX) >= halfWidth) {
        currentX += halfWidth;
      }

      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      requestAnimationFrame(animateMarquee);
    }

    requestAnimationFrame(animateMarquee);
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
