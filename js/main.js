/**
 * DeckForge Landing Page - Main JavaScript
 * Lightweight vanilla script for navigation, scroll interactions, and animations.
 */

// 0. Clean URLs: Immediately strip .html extensions from address bar on live server
if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
  const pathname = window.location.pathname;
  if (pathname.endsWith('.html')) {
    let clean = pathname.slice(0, -5);
    if (clean.endsWith('/index')) {
      clean = clean.slice(0, -5);
    }
    if (!clean) clean = '/';
    window.history.replaceState(null, '', clean + window.location.search + window.location.hash);
  }
}

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

  // 6. Hero CTA interaction (smooth scroll to waitlist + focus input)
  const heroCtaBtn = document.getElementById('hero-cta-btn') || document.getElementById('start-now-btn');
  const waitlistSection = document.getElementById('waitlist');
  const waitlistInput = document.getElementById('waitlist-email');

  if (heroCtaBtn) {
    heroCtaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (waitlistSection) {
        waitlistSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          if (waitlistInput) waitlistInput.focus();
        }, 500);
      }
    });
  }

  // 7. Waitlist form submission via FormSubmit
  const waitlistForm = document.getElementById('waitlist-form');
  const waitlistConsent = document.getElementById('waitlist-consent');

  if (waitlistForm) {
    // Dynamic origin adjustment for FormSubmit _next redirect
    const nextInput = waitlistForm.querySelector('input[name="_next"]');
    if (nextInput && window.location.origin && window.location.origin !== 'null' && window.location.protocol.startsWith('http')) {
      nextInput.value = `${window.location.origin}/thanks`;
    }

    waitlistForm.addEventListener('submit', (e) => {
      if (!waitlistForm.checkValidity()) {
        waitlistForm.reportValidity();
        e.preventDefault();
        return;
      }

      e.preventDefault();

      if (waitlistConsent && !waitlistConsent.checked) {
        alert('Please agree to the Privacy Policy to join the waitlist.');
        waitlistConsent.focus();
        return;
      }

      const emailVal = waitlistInput ? waitlistInput.value.trim() : '';

      if (emailVal && emailVal.includes('@')) {
        const submitBtn = waitlistForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Joining...';
        }

        // If testing locally (file:// protocol), simulate immediate submission and open thanks.html
        if (window.location.protocol === 'file:') {
          setTimeout(() => {
            window.location.href = 'thanks.html';
          }, 350);
          return;
        }

        const endpoint = waitlistForm.getAttribute('action') || 'https://formsubmit.co/deckforge@teletsia.xyz';
        const ajaxEndpoint = endpoint.replace('formsubmit.co/', 'formsubmit.co/ajax/');
        const redirectUrl = (nextInput && nextInput.value) ? nextInput.value : 'https://deckforge.teletsia.xyz/thanks';
        const thanksTarget = (window.location.protocol === 'file:') ? 'thanks.html' : '/thanks';

        fetch(ajaxEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            email: emailVal,
            _subject: 'New DeckForge Waitlist Submission',
            _captcha: 'false',
            _template: 'table',
            _next: redirectUrl
          })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success === 'true' || data.success === true) {
              window.location.href = thanksTarget;
            } else {
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Join Waitlist';
              }
              if (data.message && data.message.includes('Activation')) {
                alert('FormSubmit: Activation link sent to deckforge@teletsia.xyz for this domain. Please confirm it in your inbox.');
              } else {
                window.location.href = thanksTarget;
              }
            }
          })
          .catch(() => {
            window.location.href = thanksTarget;
          });
      }
    });
  }

  // 8. Progressive Local Link Resolver (ensures root links navigate locally on file:// protocol)
  if (window.location.protocol === 'file:') {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (href === '/') {
        link.setAttribute('href', 'index.html');
      } else if (href && href.startsWith('/') && !href.startsWith('//')) {
        let target = href.slice(1);
        if (!target.includes('.') && !target.includes('#')) {
          target += '.html';
        }
        link.setAttribute('href', target);
      }
    });
  }

  // Initial check on load
  onScroll();
});
