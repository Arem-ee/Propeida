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
