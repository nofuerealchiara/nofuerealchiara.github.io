/**
 * script.js — nofuereal.com · Chiara Oliver
 * Módulos: Header scroll, IntersectionObserver, Cuenta regresiva, Carrusel.
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════
     1. HEADER — transparente → glassmorphism
  ═══════════════════════════════════════════════ */
  (function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const THRESHOLD = 40; // px tras los que activa el glassmorphism

    function onScroll() {
      if (window.scrollY > THRESHOLD) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    }

    // Passive para mejor rendimiento en scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // estado inicial
  })();

  /* ═══════════════════════════════════════════════
     2. NAV TOGGLE — menú móvil
  ═══════════════════════════════════════════════ */
  (function initNavToggle() {
    const toggle = document.getElementById('nav-toggle');
    const nav    = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      // Bloquea el scroll del body cuando el menú está abierto
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cierra el menú al hacer click en un enlace
    nav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Cierra con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        toggle.focus();
      }
    });
  })();

  /* ═══════════════════════════════════════════════
     3. INTERSECTION OBSERVER — animaciones .reveal
  ═══════════════════════════════════════════════ */
  (function initRevealObserver() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    // Verifica soporte; si no lo hay, muestra los elementos directamente
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Una vez visible, deja de observar para mejorar rendimiento
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,         // activa cuando el 12% del elemento es visible
        rootMargin: '0px 0px -60px 0px' // margen inferior negativo para trigger algo antes
      }
    );

    revealEls.forEach(el => observer.observe(el));
  })();

  /* ═══════════════════════════════════════════════
     4. CUENTA REGRESIVA — solo se ejecuta si el
        elemento existe en el DOM (tour.html)
  ═══════════════════════════════════════════════ */
  (function initCountdown() {
    // Guard: sale silenciosamente si no estamos en tour.html
    const cdDays    = document.getElementById('cd-days');
    const cdHours   = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');
    const cdClock   = document.getElementById('countdown-clock');
    const cdExpired = document.getElementById('countdown-expired');

    if (!cdDays || !cdHours || !cdMinutes || !cdSeconds) return;

    // Fecha objetivo: 30 de septiembre de 2026 a las 21:00h (CDMX, UTC-6)
    // 21:00 CST = 03:00 UTC del día siguiente
    const TARGET = new Date('2026-10-01T03:00:00Z');

    /**
     * Formatea un número a dos dígitos: 3 → "03"
     */
    function pad(n) {
      return String(n).padStart(2, '0');
    }

    /**
     * Actualiza los dígitos del reloj.
     * Devuelve false si la cuenta regresiva ha terminado.
     */
    function tick() {
      const now  = Date.now();
      const diff = TARGET.getTime() - now;

      if (diff <= 0) {
        // Muestra el mensaje de evento pasado/en curso
        if (cdClock)   cdClock.setAttribute('hidden', '');
        if (cdExpired) cdExpired.removeAttribute('hidden');
        return false; // señal para detener el intervalo
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days    = Math.floor(totalSeconds / 86400);
      const hours   = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600)  / 60);
      const seconds = totalSeconds % 60;

      cdDays.textContent    = pad(days);
      cdHours.textContent   = pad(hours);
      cdMinutes.textContent = pad(minutes);
      cdSeconds.textContent = pad(seconds);

      return true;
    }

    // Primera ejecución inmediata para evitar el flash de "--"
    if (!tick()) return;

    // Después, actualiza cada segundo
    const interval = setInterval(() => {
      if (!tick()) clearInterval(interval);
    }, 1000);
  })();

  /* ═══════════════════════════════════════════════
     5. SMOOTH SCROLL para anclas internas
  ═══════════════════════════════════════════════ */
  (function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        const top     = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  })();

  /* ═══════════════════════════════════════════════
     6. STAR TRAIL — desktop only, pooled nodes
  ═══════════════════════════════════════════════ */
  (function initStarTrail() {
    if (window.innerWidth <= 1024) return;

    const POOL = 12;
    const pool = [];
    let idx = 0;
    let raf = null;
    let queue = [];

    for (let i = 0; i < POOL; i++) {
      const el = document.createElement('span');
      el.className = 'star-trail-el';
      el.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
      el.style.display = 'none';
      document.body.appendChild(el);
      pool.push(el);
    }

    function flush() {
      raf = null;
      for (const pos of queue) {
        const el = pool[idx];
        el.style.left = (pos.x - 7) + 'px';
        el.style.top  = (pos.y - 7) + 'px';
        el.style.display = '';
        el.style.animation = 'none';
        void el.offsetHeight; // reflow
        el.style.animation = 'starFade 1s ease-out forwards';
        idx = (idx + 1) % POOL;
      }
      queue = [];
    }

    document.addEventListener('mousemove', (e) => {
      queue.push({ x: e.clientX, y: e.clientY });
      if (!raf) raf = requestAnimationFrame(flush);
    });
  })();

  /* ═══════════════════════════════════════════════
     7. EASTER EGG — teclea "real"
  ═══════════════════════════════════════════════ */
  (function initEasterEgg() {
    const SECRET = 'real';
    let buf = '';

    document.addEventListener('keydown', (e) => {
      buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
      if (buf !== SECRET) return;
      buf = '';

      const body = document.body;
      body.classList.remove('is-easter-egg-dark');
      void body.offsetHeight;
      body.classList.add('is-easter-egg');
      setTimeout(() => {
        body.classList.remove('is-easter-egg');
        body.classList.add('is-easter-egg-dark');
        showToast('La realidad es una ilusión. Gracias por apoyar a Chiara.');
      }, 600);
    });
  })();

  /* ═══════════════════════════════════════════════
     8. TOAST
  ═══════════════════════════════════════════════ */
  function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    void el.offsetHeight;
    el.classList.add('is-visible');
    setTimeout(() => {
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 500);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════
     9. TOUR PAST EVENTS + MODAL (tour.html)
  ═══════════════════════════════════════════════ */
  (function initTourArchive() {
    const modal = document.getElementById('event-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    if (!modal || !overlay || !closeBtn) return;

    function openModal(city, dateStr) {
      document.getElementById('modal-city').textContent = city;
      document.getElementById('modal-date').textContent = dateStr;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });

    // Check each date row
    document.querySelectorAll('.date-row').forEach(row => {
      const dateStr = row.getAttribute('data-date');
      if (!dateStr) return;
      const eventDate = new Date(dateStr + 'T23:59:59');
      if (eventDate >= new Date()) return;

      const cityEl = row.querySelector('.date-row__city');
      const city = cityEl ? cityEl.textContent.trim() : 'Evento';
      const action = row.querySelector('.date-row__action');
      if (!action) return;

      const parts = dateStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      const formatted = d.getDate() + ' de ' + months[d.getMonth()] + ' de ' + d.getFullYear();

      action.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'archive-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg><span>Ver Archivo del Evento</span>';
      btn.addEventListener('click', () => openModal(city, formatted));
      action.appendChild(btn);
    });
  })();

})();
