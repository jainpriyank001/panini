/* ============================================================
   PaniniX Labs - main.js
   Sticky nav, mobile drawer, scroll reveal, count-up, form
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Sticky nav shadow ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 60) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile drawer ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.querySelector('.nav-drawer');
  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ---------- Count-up for stat numbers ---------- */
  const countEls = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && countEls.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const duration = 1200;
      const startTime = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = target * eased;
        el.textContent = prefix + (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = prefix + target + suffix;
      };
      requestAnimationFrame(step);
    };
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          io2.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    countEls.forEach(el => io2.observe(el));
  }

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById('enquiry-form');
  if (form) {
    const success = document.getElementById('form-success');

    const validateRow = (row) => {
      const input = row.querySelector('input, select, textarea');
      if (!input) return true;
      let ok = true;
      const value = (input.value || '').trim();

      if (input.required && !value) ok = false;
      else if (input.type === 'email' && value) {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      } else if (input.type === 'tel' && value) {
        const digits = value.replace(/\D/g, '');
        ok = digits.length >= 10;
      }

      row.classList.toggle('invalid', !ok);
      return ok;
    };

    form.querySelectorAll('.form-row').forEach(row => {
      const input = row.querySelector('input, select, textarea');
      if (!input) return;
      input.addEventListener('blur', () => validateRow(row));
      input.addEventListener('input', () => {
        if (row.classList.contains('invalid')) validateRow(row);
      });
    });

    form.addEventListener('submit', async (e) => {
      let allOk = true;
      form.querySelectorAll('.form-row').forEach(row => {
        if (!validateRow(row)) allOk = false;
      });
      if (!allOk) {
        e.preventDefault();
        const firstBad = form.querySelector('.form-row.invalid');
        if (firstBad) firstBad.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // If Formspree action is configured, submit via fetch and show inline success
      const action = form.getAttribute('action') || '';
      if (action && action.includes('formspree.io')) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }
        try {
          const res = await fetch(action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          if (res.ok && success) {
            success.classList.add('show');
            success.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Request a Free Demo'; }
            alert('Something went wrong. Please email paninixlabs@gmail.com or message us on WhatsApp.');
          }
        } catch (err) {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Request a Free Demo'; }
          alert('Network error. Please email paninixlabs@gmail.com or message us on WhatsApp.');
        }
      }
    });
  }

  /* ---------- Year in footer ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
