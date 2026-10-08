/**
 * DeckForge Landing Page - Main JavaScript
 * Lightweight vanilla script for navigation, scroll interactions, and animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Smooth Scroll for Nav Links
  const internalLinks = document.querySelectorAll('a[href^="#"]');

  internalLinks.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // 2. Mobile Hamburger Toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('active');
    });

    // Close menu when a navigation link is clicked
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('active');
      });
    });
  }

  // 3. Scroll-Reveal Animation (Intersection Observer)
  const fadeElements = document.querySelectorAll('.fade-in');

  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    fadeElements.forEach((el) => revealObserver.observe(el));
  }

  // 4 & 5. Active Nav Link Highlighting & Navbar Background on Scroll
  const navbar = document.querySelector('.navbar');
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');
  let isTicking = false;

  const onScroll = () => {
    const scrollPos = window.scrollY;

    // Feature 5: Toggle navbar scrolled class past 50px
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollPos > 50);
    }

    // Feature 4: Active section highlighting
    let currentSectionId = '';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      if (scrollPos >= top) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navItems.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${currentSectionId}`);
    });

    isTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      window.requestAnimationFrame(onScroll);
      isTicking = true;
    }
  }, { passive: true });

  // 6. Start Now button development alert
  const startBtn = document.getElementById('start-now-btn');
  const devAlert = document.getElementById('dev-alert');
  let alertTimeout;

  if (startBtn && devAlert) {
    startBtn.addEventListener('click', (e) => {
      e.preventDefault();
      devAlert.classList.add('is-visible');

      clearTimeout(alertTimeout);
      alertTimeout = setTimeout(() => {
        devAlert.classList.remove('is-visible');
      }, 4000);
    });
  }

  // Initial check on load
  onScroll();
});
