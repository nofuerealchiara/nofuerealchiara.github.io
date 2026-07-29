/**
 * script.js — nofuereal.com · Chiara Oliver
 * Header · Nav móvil · Reveal · Cuenta regresiva · Smooth scroll ·
 * Star trail · Easter egg · Archivo de eventos pasados (modal).
 * Todo con guard clauses: cada módulo solo actúa si su HTML existe.
 */
(function () {
  'use strict';

  /* 1 · HEADER Y BANNER: transparente al inicio → glass al hacer scroll */
  (function initHeader() {
    const header = document.getElementById('site-header');
    const banner = document.querySelector('.tour-banner2');
    if (!header) return;
    const onScroll = () => {
      const scrolled = window.scrollY > 40;
      header.classList.toggle('is-scrolled', scrolled);
      if (banner) banner.classList.toggle('is-scrolled', scrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* 2 · NAV MÓVIL */
  (function initNav() {
    const toggle = document.getElementById('nav-toggle');
    const nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    const lockScroll = (lock) => {
      if (lock) {
        document.body.dataset.scrollY = String(window.scrollY);
        document.documentElement.style.overflow = 'hidden';
        document.body.style.cssText = `position:fixed;top:-${window.scrollY}px;width:100%`;
      } else {
        const y = parseInt(document.body.dataset.scrollY || '0', 10);
        document.documentElement.style.overflow = '';
        document.body.style.cssText = '';
        window.scrollTo(0, y);
      }
    };

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      lockScroll(open);
    });
    nav.querySelectorAll('.nav-link').forEach((link) =>
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        lockScroll(false);
      })
    );
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        lockScroll(false);
        toggle.focus();
      }
    });
  })();

  /* 3 · REVEAL al hacer scroll */
  (function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    els.forEach((el) => obs.observe(el));
  })();

  /* 4 · CUENTA REGRESIVA (solo en /tour) */
  (function initCountdown() {
    const d = document.getElementById('cd-days');
    const h = document.getElementById('cd-hours');
    const m = document.getElementById('cd-minutes');
    const s = document.getElementById('cd-seconds');
    const clock = document.getElementById('countdown-clock');
    const expired = document.getElementById('countdown-expired');
    if (!d || !h || !m || !s) return;

    // 30 sep 2026, 21:00 CDMX (UTC-6) = 03:00 UTC del 1 oct
    const TARGET = new Date('2026-10-01T03:00:00Z').getTime();
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      const diff = TARGET - Date.now();
      if (diff <= 0) {
        if (clock) clock.setAttribute('hidden', '');
        if (expired) expired.removeAttribute('hidden');
        return false;
      }
      const t = Math.floor(diff / 1000);
      d.textContent = pad(Math.floor(t / 86400));
      h.textContent = pad(Math.floor((t % 86400) / 3600));
      m.textContent = pad(Math.floor((t % 3600) / 60));
      s.textContent = pad(t % 60);
      return true;
    };

    if (!tick()) return;
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
  })();

  /* 5 · SMOOTH SCROLL para anclas internas */
  (function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) =>
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 76;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH - 16;
        window.scrollTo({ top, behavior: 'smooth' });
      })
    );
  })();

  /* 6 · STAR TRAIL (solo escritorio) */
  (function initStarTrail() {
    if (window.innerWidth <= 1024 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last = 0;
    const STAR = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"/></svg>';
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - last < 55 || Math.random() > 0.5) return;
      last = now;
      const star = document.createElement('span');
      star.className = 'star-trail-el';
      star.innerHTML = STAR;
      star.style.left = (e.clientX + (Math.random() - 0.5) * 18) + 'px';
      star.style.top = (e.clientY + (Math.random() - 0.5) * 18) + 'px';
      star.style.transform = `scale(${0.3 + Math.random() * 0.7})`;
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1000);
    }, { passive: true });
  })();

  /* 7 · EASTER EGG: teclea "real" → la realidad se invierte */
  (function initEasterEgg() {
    const SECRET = 'real';
    let buf = '';
    document.addEventListener('keydown', (e) => {
      if (!e.key || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
      if (buf !== SECRET) return;
      buf = '';
      const body = document.body;
      body.classList.remove('is-easter-egg-dark');
      void body.offsetHeight;
      body.classList.add('is-easter-egg');
      setTimeout(() => {
        body.classList.remove('is-easter-egg');
        body.classList.toggle('is-easter-egg-dark');
        showToast('La realidad es una ilusión. Gracias por apoyar a Chiara.');
      }, 600);
    });
  })();

  /* 8 · TOAST */
  function showToast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    void el.offsetHeight;
    el.classList.add('is-visible');
    setTimeout(() => { el.classList.remove('is-visible'); setTimeout(() => el.remove(), 500); }, 5000);
  }

  /* 9 · ARCHIVO DE EVENTOS PASADOS + MODAL (solo /tour) */
  (function initTourArchive() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    if (!overlay || !closeBtn) return;

    const open = (city, dateStr) => {
      const c = document.getElementById('modal-city');
      const dt = document.getElementById('modal-date');
      if (c) c.textContent = city;
      if (dt) dt.textContent = dateStr;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; };

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    document.querySelectorAll('.date-row').forEach((row) => {
      const dateStr = row.getAttribute('data-date');
      if (!dateStr) return;
      if (new Date(dateStr + 'T23:59:59') >= new Date()) return; // aún no ha pasado

      const cityEl = row.querySelector('.date-row__city');
      const city = cityEl ? cityEl.textContent.trim() : 'Evento';
      const action = row.querySelector('.date-row__action');
      if (!action) return;

      const p = dateStr.split('-');
      const dd = new Date(p[0], p[1] - 1, p[2]);
      const formatted = dd.getDate() + ' de ' + months[dd.getMonth()] + ' de ' + dd.getFullYear();

      action.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'archive-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg><span>Ver Archivo del Evento</span>';
      btn.addEventListener('click', () => open(city, formatted));
      action.appendChild(btn);
    });
  })();

})();
