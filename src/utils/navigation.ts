// Navigation utilities for smooth scrolling and active section highlighting

export interface NavigationOptions {
  offset?: number;
  duration?: number;
  easing?: string;
}

/**
 * Smooth scroll to a target element
 */
export function smoothScrollTo(target: string | Element, options: NavigationOptions = {}) {
  const { offset = 80, duration = 800 } = options;

  let targetElement: Element | null;

  if (typeof target === 'string') {
    targetElement = document.querySelector(target);
  } else {
    targetElement = target;
  }

  if (!targetElement) return;

  const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  function animation(currentTime: number) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Easing function (ease-in-out)
    const ease = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    window.scrollTo(0, startPosition + distance * ease);

    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }

  requestAnimationFrame(animation);
}

/**
 * Get the currently active section based on scroll position
 */
export function getCurrentSection(): string | null {
  const sections = ['hero', 'experience', 'education', 'projects', 'skills', 'publications', 'contact'];
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const headerOffset = 100; // Account for fixed header

  // Find the section that's most visible in the viewport
  let activeSection = 'hero';
  let maxVisibility = 0;

  for (const sectionId of sections) {
    const section = document.getElementById(sectionId);
    if (!section) continue;

    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + scrollPosition;
    const sectionBottom = sectionTop + rect.height;
    const viewportTop = scrollPosition + headerOffset;
    const viewportBottom = scrollPosition + windowHeight;

    // Calculate how much of the section is visible
    const visibleTop = Math.max(sectionTop, viewportTop);
    const visibleBottom = Math.min(sectionBottom, viewportBottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
    const visibility = visibleHeight / rect.height;

    // If this section is more visible than the current best, use it
    if (visibility > maxVisibility && visibility > 0.3) { // At least 30% visible
      maxVisibility = visibility;
      activeSection = sectionId;
    }
  }

  // Special case: if we're at the very top, always show hero
  if (scrollPosition < 50) {
    return 'hero';
  }

  // Special case: if we're at the very bottom, show contact
  if (scrollPosition + windowHeight >= document.documentElement.scrollHeight - 50) {
    return 'contact';
  }

  return activeSection;
}

/**
 * Update active navigation links based on current section
 */
export function updateActiveNavLinks(activeSection: string) {
  // Update desktop navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const section = link.getAttribute('data-section');
    if (section === activeSection) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update mobile navigation links
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    const section = link.getAttribute('data-section');
    if (section === activeSection) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Initialize navigation functionality
 */
export function initNavigation() {
  // Handle navigation link clicks
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  allNavLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        smoothScrollTo(href);

        // Update URL without triggering scroll
        if (history.pushState) {
          history.pushState(null, '', href);
        }
      }
    });
  });

  // Handle scroll events for active section highlighting
  let ticking = false;
  let lastActiveSection = '';

  function handleScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentSection = getCurrentSection();
        if (currentSection && currentSection !== lastActiveSection) {
          updateActiveNavLinks(currentSection);
          lastActiveSection = currentSection;
        }
        ticking = false;
      });
      ticking = true;
    }
  }

  // Throttled scroll event listener
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Also handle resize events as they can affect section positions
  window.addEventListener('resize', handleScroll, { passive: true });

  // Initial active section update
  const initialSection = getCurrentSection();
  if (initialSection) {
    updateActiveNavLinks(initialSection);
  }

  // Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    const hash = window.location.hash;
    if (hash) {
      smoothScrollTo(hash);
    }
  });

  // Handle direct hash navigation on page load
  if (window.location.hash) {
    // Small delay to ensure page is fully loaded
    setTimeout(() => {
      smoothScrollTo(window.location.hash);
    }, 100);
  }
}

/**
 * Initialize header scroll effects
 */
export function initHeaderEffects() {
  const header = document.getElementById('header');
  if (!header) return;

  let ticking = false;

  function updateHeader() {
    if (!header) return;

    const scrollY = window.scrollY;

    // Add/remove shadow based on scroll position
    if (scrollY > 10) {
      header.classList.add('shadow-md');
    } else {
      header.classList.remove('shadow-md');
    }

    ticking = false;
  }

  function handleHeaderScroll() {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // Initial header state
  updateHeader();
}

/**
 * Initialize all navigation functionality
 */
export function initializeNavigation() {
  initNavigation();
  initHeaderEffects();
}