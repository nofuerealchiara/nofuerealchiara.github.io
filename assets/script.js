/**
 * script.js — nofuereal.com · Chiara Oliver
 * Header · Nav móvil · Reveal · Cuenta regresiva · Smooth scroll ·
 * Star trail · Easter egg · Archivo de eventos pasados (modal).
 * Todo con guard clauses: cada módulo solo actúa si su HTML existe.
 */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

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

    // Próximo show: 27 nov 2026, 21:00 Madrid (CET / UTC+1) = 20:00 UTC
    const TARGET = new Date('2026-11-27T20:00:00Z').getTime();
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
    document.querySelectorAll('a[href^="#"]:not([data-edition-link])').forEach((a) =>
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

  /* 7 · MODO ALTERNATIVO: teclea "real" → paleta clara (sin filtros globales) */
  (function initAltMode() {
    const SECRET = 'real';
    const KEY = 'nfr-alt-mode';
    const root = document.documentElement;
    let buf = '';

    document.addEventListener('keydown', (e) => {
      if (!e.key || e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;

      buf = (buf + e.key.toLowerCase()).slice(-SECRET.length);
      if (buf !== SECRET) return;
      buf = '';

      const on = !root.classList.contains('theme-alt');
      const swap = () => {
        root.classList.toggle('theme-alt', on);
        try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (_) { }
      };
      if (document.startViewTransition && !prefersReduced) document.startViewTransition(swap);
      else swap();

      showToast(on ? 'Modo alternativo activado. Teclea “real” para volver.' : 'La realidad vuelve a su sitio.');
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

  /* 9 · ARCHIVO DE EVENTOS PASADOS + MODAL (con setlists, fotos y hashtags en X) */
  (function initTourArchive() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');
    if (!overlay || !closeBtn) return;

    // Repertorios, fotos y hashtags específicos para cada show finalizado
    const tourSetlists = {
      "chile": {
        setlist: [
          "me puse a escribir (intro)",
          "margaritas",
          "no fue real",
          "si te tuviera aquí",
          "parte de mí",
          "3 de febrero",
          "Melancolía (cover)",
          "es mejor así",
          "bucle",
          "lo siento por ser yo",
          "calle luna (intro \"kiss me\")",
          "me & my girls",
          "un minuto +",
          "tulipanes",
          "2+2=5",
          "como aprender a volar",
          "puzzle",
          "una más"
        ],
        photos: [
          "https://pbs.twimg.com/media/HUANNXcX0AAUHI_?format=jpg&name=900x900",
          "https://pbs.twimg.com/media/HUAFMz0WEAA9BRS?format=jpg&name=small",
          "https://pbs.twimg.com/media/HUANNXTXIAAE1n9?format=jpg&name=900x900",
          "https://pbs.twimg.com/media/HUAFMzwWsAAd8Ol?format=jpg&name=small"
        ],
        hashtag: "NFRTourChile"
      },
      "argentina": {
        setlist: [
          "me puse a escribir (intro)",
          "margaritas",
          "si te tuviera aquí",
          "como aprender a volar",
          "parte de mi",
          "3 de febrero",
          "Flaca (cover)",
          "es mejor así x la invitada (mashup)",
          "bucle",
          "lo siento x ser yo",
          "calle luna (intro \"kiss me\")",
          "me & my girls",
          "un minuto +",
          "tulipanes",
          "Entre tu y yo (cover)",
          "no fue real",
          "2+2=5",
          "puzzle",
          "una más"
        ],
        photos: [
          "https://pbs.twimg.com/media/HTwDaY_XYAApWez?format=jpg&name=4096x4096",
          "https://pbs.twimg.com/media/HTvy-HCXcAARak8?format=jpg&name=large",
          "https://pbs.twimg.com/media/HTwGkmVXYAAvNz6?format=jpg&name=4096x4096",
          "https://pbs.twimg.com/media/HTwI3LhXoAAIW5j?format=jpg&name=large"
        ],
        hashtag: "NFRTourArgentina"
      },
      "mexico": {
        setlist: [
          "me puse a escribir (intro)",
          "margaritas",
          "si te tuviera aquí",
          "como aprender a volar",
          "parte de mi",
          "3 de febrero",
          "Ven devórame otra vez (cover)",
          "es mejor así x la invitada (mashup)",
          "bucle",
          "lo siento x ser yo",
          "calle luna (intro \"kiss me\")",
          "me & my girls",
          "un minuto +",
          "tulipanes",
          "puzzle (ft. nicole zagato)",
          "2+2=5",
          "no fue real",
          "una más"
        ],
        photos: [
          "https://pbs.twimg.com/media/HThOtUDaAAAJoD8?format=jpg&name=large",
          "https://pbs.twimg.com/media/HThQoFiWoAAkSbX?format=jpg&name=large",
          "https://pbs.twimg.com/media/HThF2OUWoAIjWgF?format=jpg&name=large",
          "https://pbs.twimg.com/media/HTggq-iXgAEobHn?format=jpg&name=medium"
        ],
        hashtag: "NFRTourMéxico"
      },
      "dublin": {
        setlist: [
          "Margaritas", "Cada vez", "About time", "3 de febrero", "Otro día",
          "Todas las versiones de mi", "Galway girl", "The man who can't be moved",
          "Sweet guitar'o boy", "Breathless", "La invitada", "No fue real",
          "Linger", "Tulipanes", "Como aprender a volar", "Puzzle", "Bucle", "Fa dies (acapella)"
        ],
        photos: [
          "https://pbs.twimg.com/media/HGn7dzLW4AAx8Mj?format=jpg&name=4096x4096",
          "https://pbs.twimg.com/media/HGnQviAXAAET1Vr?format=jpg&name=large",
          "https://pbs.twimg.com/media/HGnD47IXQAAcLcb?format=jpg&name=large",
          "https://pbs.twimg.com/media/HGn7d1BXQAAlOSz?format=jpg&name=large"
        ],
        hashtag: "NoFueRealTourDublin"
      },
      "londres": {
        setlist: [
          "Margaritas", "Cada vez / About time", "3 de febrero / Otro día", "Todas las versiones de mi",
          "Sweet guitar'o boy", "Say you'll be there (cover)",
          "La invitada", "No fue real", "Beattles mashup", "Tulipanes",
          "Como aprender a volar", "Puzzle", "Bucle (bis)"
        ],
        photos: [
          "https://pbs.twimg.com/media/HGsv_idWEAAtsBK?format=jpg&name=large",
          "https://pbs.twimg.com/media/HGsrsyMWsAAFF1n?format=jpg&name=large",
          "https://pbs.twimg.com/media/HGst57oXYAAlvsl?format=jpg&name=large",
          "https://pbs.twimg.com/media/HGsrsyPWUAAtZrT?format=jpg&name=large"
        ],
        hashtag: "NoFueRealTourLondres"
      },
      "paris": {
        setlist: [
          "Margaritas", "Cada vez / About time", "3 de febrero", "Otro día",
          "Todas las versiones de mi", "Un minuto más", "Sweet guitar'o boy",
          "Invitada", "La vie en rose (Cover)", "No fue real", "Tulipanes",
          "Les Champs Elysées (Cover)", "CAAV", "Puzzle", "Bucle (Bis)"
        ],
        photos: [
          "https://pbs.twimg.com/media/HGxyQF0bQAAZ_ig?format=jpg&name=large",
          "https://pbs.twimg.com/media/HHAPRvxaMAAyjIS?format=jpg&name=large",
          "https://pbs.twimg.com/media/HGxY7UkaMAAvTvD?format=jpg&name=large",
          "https://pbs.twimg.com/media/HGx1VNLbgAA_Tg4?format=jpg&name=large"
        ],
        hashtag: "NoFueRealTourParis"
      }
    };

    const open = (city, dateStr, cityKey) => {
      const c = document.getElementById('modal-city');
      const dt = document.getElementById('modal-date');
      if (c) c.textContent = city;
      if (dt) dt.textContent = dateStr;

      // Cargar el setlist personalizado correspondiente
      const setlistContainer = overlay.querySelector('.modal-setlist');
      if (setlistContainer && tourSetlists[cityKey]) {
        setlistContainer.innerHTML = '';
        tourSetlists[cityKey].setlist.forEach(song => {
          const li = document.createElement('li');
          li.textContent = song;
          setlistContainer.appendChild(li);
        });
      }

      // Cargar la galería de fotos correspondiente de forma centrada
      const galleryContainer = overlay.querySelector('.modal-gallery');
      if (galleryContainer && tourSetlists[cityKey] && tourSetlists[cityKey].photos) {
        galleryContainer.innerHTML = '';
        tourSetlists[cityKey].photos.forEach(src => {
          const div = document.createElement('div');
          div.className = 'modal-gallery-placeholder';
          div.innerHTML = `<img src="${src}" alt="Foto del concierto" style="width: 100%; height: 100%; object-fit: cover; display: block; margin: 0 auto; border-radius: 6px;" onerror="this.parentElement.textContent='Foto del concierto';" />`;
          galleryContainer.appendChild(div);
        });
      }

      // Cargar el enlace al hashtag en X (Twitter)
      const socialContainer = document.getElementById('modal-social-link');
      if (socialContainer && tourSetlists[cityKey] && tourSetlists[cityKey].hashtag) {
        const tag = tourSetlists[cityKey].hashtag;
        socialContainer.innerHTML = `
          <a href="https://x.com/search?q=%23${encodeURIComponent(tag)}" target="_blank" rel="noopener" class="cta-secondary" style="font-size: 0.75rem; display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem;">
            Ver interacción en X · #${tag}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 14px; height: 14px;"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        `;
      } else if (socialContainer) {
        socialContainer.innerHTML = '';
      }

      // Asegurar que el modal siempre se abra desde arriba
      const modalContent = overlay.querySelector('.modal');
      if (modalContent) modalContent.scrollTop = 0;

      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const close = () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; };

    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) close(); });

    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

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

      // Detectar la clave de la ciudad para asignar su setlist, fotos y hashtag
      let cityKey = '';
      const cityLower = city.toLowerCase();
      if (cityLower.includes('santiago') || cityLower.includes('chile')) cityKey = 'chile';
      else if (cityLower.includes('buenos aires') || cityLower.includes('argentina')) cityKey = 'argentina';
      else if (cityLower.includes('méxico') || cityLower.includes('mexico')) cityKey = 'mexico';
      else if (cityLower.includes('dublín') || cityLower.includes('dublin')) cityKey = 'dublin';
      else if (cityLower.includes('londres')) cityKey = 'londres';
      else if (cityLower.includes('parís') || cityLower.includes('paris')) cityKey = 'paris';

      action.innerHTML = '';
      const btn = document.createElement('button');
      btn.className = 'archive-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4"/></svg><span>Ver Archivo del Evento</span>';
      btn.addEventListener('click', () => open(city, formatted, cityKey));
      action.appendChild(btn);
    });
  })();

  /* 10 · MARQUEE CINÉTICO (duplica la lista para un bucle sin saltos) */
  (function initMarquee() {
    document.querySelectorAll('[data-marquee]').forEach((track) => {
      const list = track.querySelector('.marquee__list');
      if (!list) return;
      const clone = list.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
      const setSpeed = () => track.style.setProperty('--marquee-speed', (list.offsetWidth / 70).toFixed(1) + 's'); // ~70 px/s
      setSpeed();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(setSpeed);
      window.addEventListener('resize', setSpeed, { passive: true });
    });
  })();

  /* 11 · MURO DE LETRAS (palabra a palabra al hacer scroll) */
  (function initLyricsWall() {
    const lines = document.querySelectorAll('.lyrics-line');
    if (!lines.length) return;

    lines.forEach((line) => {
      const text = line.textContent.trim();
      line.textContent = '';
      const sr = document.createElement('span');          // texto íntegro para lectores de pantalla
      sr.className = 'sr-only';
      sr.textContent = text;
      line.appendChild(sr);
      const words = text.split(/\s+/);
      words.forEach((word, i) => {
        const s = document.createElement('span');
        s.className = 'w';
        s.setAttribute('aria-hidden', 'true');
        s.style.setProperty('--i', i);
        s.textContent = word;
        line.appendChild(s);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });

    if (prefersReduced || !('IntersectionObserver' in window)) {
      lines.forEach((l) => l.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { threshold: 0.5, rootMargin: '0px 0px -15% 0px' }
    );
    lines.forEach((l) => io.observe(l));
  })();

  /* 12 · PARALLAX DEL AURA (suavizado con lerp + rAF) */
  (function initAuraParallax() {
    if (!finePointer || prefersReduced) return;
    const root = document.documentElement;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      root.style.setProperty('--aura-x', x.toFixed(3));
      root.style.setProperty('--aura-y', y.toFixed(3));
      raf = (Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002) ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener('mousemove', (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 … 1
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
  })();

  /* 13 · BOTONES MAGNÉTICOS (.cta-primary) */
  (function initMagnetic() {
    if (!finePointer || prefersReduced) return;
    const btns = [...document.querySelectorAll('.cta-primary')];
    if (!btns.length) return;
    const PAD = 70, STRENGTH = 0.3, MAX = 14;
    const clamp = (v) => Math.max(-MAX, Math.min(MAX, v));

    btns.forEach((b) => { b._tx = 0; b._ty = 0; });
    document.addEventListener('mousemove', (e) => {
      btns.forEach((b) => {
        const r = b.getBoundingClientRect();
        const cx = r.left + r.width / 2 - b._tx;       // centro "real", sin el desplazamiento actual
        const cy = r.top + r.height / 2 - b._ty;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const near = Math.abs(dx) < r.width / 2 + PAD && Math.abs(dy) < r.height / 2 + PAD;
        b._tx = near ? clamp(dx * STRENGTH) : 0;
        b._ty = near ? clamp(dy * STRENGTH) : 0;
        b.style.setProperty('--tx', b._tx.toFixed(1) + 'px');
        b.style.setProperty('--ty', b._ty.toFixed(1) + 'px');
      });
    }, { passive: true });
  })();

  /* 14 · SNIPPET PLAYER nativo (10 s, sin iframes) */
  (function initSnippetPlayer() {
    const root = document.querySelector('[data-snippet]');
    if (!root) return;
    const btn = root.querySelector('.snippet__btn');
    const label = root.querySelector('.snippet__label');
    const SRC = root.dataset.src;
    const DUR = parseFloat(root.dataset.duration) || 10;
    const START = parseFloat(root.dataset.start) || 0;
    const FADE = 0.6;                       // segundos de fade-out final
    let audio = null, raf = 0;

    const setP = (p) => btn.style.setProperty('--p', p.toFixed(4));
    const setState = (on) => {
      root.classList.toggle('is-playing', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Detener fragmento' : `Escuchar fragmento de ${DUR} segundos`);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      if (audio) { audio.pause(); audio.volume = 1; audio.currentTime = START; }
      setState(false);
      setP(0);
    };
    const tick = () => {
      const t = audio.currentTime - START;
      setP(Math.min(t / DUR, 1));
      const left = DUR - t;
      if (left <= FADE) audio.volume = Math.max(left / FADE, 0);
      if (t >= DUR || audio.ended) { stop(); return; }
      raf = requestAnimationFrame(tick);
    };
    const ensureAudio = () => {
      if (audio) return audio;
      audio = new Audio();
      audio.preload = 'none';
      audio.src = SRC;
      audio.addEventListener('ended', stop);
      audio.addEventListener('error', () => {
        stop();
        btn.disabled = true;
        if (label) label.textContent = 'Audio no disponible';
      });
      return audio;
    };

    btn.addEventListener('click', async () => {
      if (root.classList.contains('is-playing')) { stop(); return; }
      const a = ensureAudio();
      const seek = () => { a.currentTime = START; };
      if (a.readyState >= 1) seek(); else a.addEventListener('loadedmetadata', seek, { once: true });
      a.volume = 1;
      try {
        await a.play();
        setState(true);
        raf = requestAnimationFrame(tick);
      } catch (_) {
        stop();
      }
    });

    document.addEventListener('visibilitychange', () => { if (document.hidden && audio) stop(); });
    window.addEventListener('pagehide', () => { if (audio) stop(); });
  })();

  /* ═══════════════════════════════════════════════════════════════
     15 · EDICIÓN DELUXE — (no) fue real
     Toda la configuración está aquí: fechas (hora peninsular, CET = UTC+1
     en noviembre) y enlaces. Cambia solo este bloque para actualizar la web.

     Para probar una fase sin esperar, añade a la URL:
       ?deluxe-now=2026-11-03T12:00:01+01:00   (preventa)
       ?deluxe-now=2026-11-04T12:00:01+01:00   (venta general)
       ?deluxe-now=2026-11-20T00:00:01+01:00   (lanzamiento)
  ═══════════════════════════════════════════════════════════════ */
  const DELUXE = {
    dates: {
      preorder: '2026-11-03T12:00:00+01:00', // Fase 2: abre la preventa
      sale: '2026-11-04T12:00:00+01:00',     // Fase 2b: venta general
      release: '2026-11-20T00:00:00+01:00',  // Fase 3: lanzamiento
    },
    links: {
      // TODO: sustituir por la URL específica de la deluxe cuando se publique
      store: 'https://chiaraoliveroficial.com/collections/no-fue-real',
      presave: '', // opcional: enlace de pre-save (vacío = no se muestra)
      // TODO: sustituir por el enlace de streaming de la deluxe el día del lanzamiento
      listen: 'https://chiaraoliver.lnk.to/NoFueRealAlbum',
      follow: 'https://instagram.com/nofuerealdiaries',
    },
  };

  const DELUXE_T = {
    preorder: Date.parse(DELUXE.dates.preorder),
    sale: Date.parse(DELUXE.dates.sale),
    release: Date.parse(DELUXE.dates.release),
  };

  // Reloj (con desfase opcional para pruebas vía ?deluxe-now=)
  const clockOffset = (() => {
    try {
      const raw = new URLSearchParams(location.search).get('deluxe-now');
      if (!raw) return 0;
      const t = Date.parse(raw.replace(' ', '+')); // "+" llega como espacio en la query
      return isNaN(t) ? 0 : t - Date.now();
    } catch (_) { return 0; }
  })();
  const deluxeNow = () => Date.now() + clockOffset;

  // countdown → preorder → sale → released
  function deluxePhase(t) {
    if (t < DELUXE_T.preorder) return 'countdown';
    if (t < DELUXE_T.sale) return 'preorder';
    if (t < DELUXE_T.release) return 'sale';
    return 'released';
  }

  const DELUXE_NEXT = { countdown: 'preorder', preorder: 'sale', sale: 'release', released: null };

  // Archivo .ics para "Añadir al calendario"
  function icsHref(key) {
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const titles = {
      preorder: 'Preventa (no) fue real — Chiara Oliver',
      release: 'Lanzamiento (no) fue real — Chiara Oliver',
    };
    const body = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//nofuereal.com//deluxe//ES',
      'BEGIN:VEVENT',
      `UID:${key}-no-fue-real-deluxe@nofuereal.com`,
      `DTSTAMP:${fmt(new Date())}`,
      `DTSTART:${fmt(new Date(DELUXE_T[key]))}`,
      `DTEND:${fmt(new Date(DELUXE_T[key] + 3600e3))}`,
      `SUMMARY:${titles[key]}`,
      'URL:https://nofuereal.com/#deluxe',
      'END:VEVENT', 'END:VCALENDAR',
    ].join('\r\n');
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(body);
  }

  // Contenido de cada fase. Las acciones sin href se omiten.
  const L = DELUXE.links;
  const DELUXE_PHASES = {
    countdown: {
      eyebrow: 'Edición deluxe · Anunciada',
      desc: 'La edición deluxe de <em>no fue real</em> llega el <strong>20 de noviembre</strong>. La preventa abre el <strong>2 de noviembre a las 12:00</strong>.',
      label: 'La preventa abre en',
      teaser: 'Preventa · 2 nov, 12:00',
      actions: [
        { label: 'Preventa · 2 NOV 12:00', primary: true, disabled: true },
        { label: 'Añadir al calendario', ics: 'preorder' },
        { label: 'Seguir novedades', href: L.follow, external: true },
      ],
    },
    preorder: {
      eyebrow: 'Preventa abierta',
      desc: 'La preventa de <em>(no) fue real</em> ya está abierta en la tienda oficial. La venta general empieza el <strong>3 de noviembre a las 12:00</strong>.',
      label: 'La venta general empieza en',
      teaser: 'Preventa abierta',
      actions: [
        { label: 'Reservar ahora', href: L.store, primary: true, external: true },
        { label: 'Pre-save', href: L.presave, external: true },
        { label: 'Recordar el lanzamiento', ics: 'release' },
      ],
    },
    sale: {
      eyebrow: 'Ya a la venta',
      desc: 'Ya puedes reservar <em>(no) fue real</em>. Sale el <strong>20 de noviembre</strong> a medianoche.',
      label: 'Disponible en',
      teaser: 'Lanzamiento · 20 nov',
      actions: [
        { label: 'Reservar ahora', href: L.store, primary: true, external: true },
        { label: 'Pre-save', href: L.presave, external: true },
        { label: 'Recordar el lanzamiento', ics: 'release' },
      ],
    },
    released: {
      eyebrow: 'Edición deluxe · Fuera ya',
      desc: '<em>(no) fue real</em> ya está aquí. Escúchala entera o hazte con tu copia.',
      label: null,
      teaser: 'Ya disponible',
      actions: [
        { label: 'Escuchar deluxe', href: L.listen, primary: true, external: true },
        { label: 'Comprar', href: L.store, external: true },
      ],
    },
  };

  const pad2 = (n) => String(n).padStart(2, '0');
  const splitTime = (ms) => {
    const t = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(t / 86400), h: Math.floor((t % 86400) / 3600), m: Math.floor((t % 3600) / 60), s: t % 60 };
  };
  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

  function buildAction(a) {
    if (!a.disabled && !a.href && !a.ics) return null;
    const el = document.createElement(a.disabled ? 'span' : 'a');
    el.className = a.primary ? 'cta-primary' : 'cta-ghost';
    if (a.disabled) {
      el.classList.add('is-disabled');
      el.setAttribute('aria-disabled', 'true');
    } else if (a.ics) {
      el.href = icsHref(a.ics);
      el.download = a.ics === 'preorder' ? 'preventa-no-fue-real.ics' : 'lanzamiento-no-fue-real.ics';
    } else {
      el.href = a.href;
      if (a.external) { el.target = '_blank'; el.rel = 'noopener'; }
    }
    const span = document.createElement('span');
    span.textContent = a.label;
    el.appendChild(span);
    if (!a.disabled) el.insertAdjacentHTML('beforeend', ARROW);
    return el;
  }

  /* 16 · VISTA DELUXE + AVISO FLOTANTE (un solo reloj para ambos) */
  (function initDeluxe() {
    const panel = document.querySelector('[data-deluxe]');
    const box = document.getElementById('diary-teaser');
    if (!panel && !box) return;
    const root = document.documentElement;
    let current = null;

    const q = (sel) => (panel ? panel.querySelector(sel) : null);
    const eyebrow = q('[data-deluxe-eyebrow]');
    const desc = q('[data-deluxe-desc]');
    const cdWrap = q('[data-deluxe-countdown]');
    const cdLabel = q('[data-deluxe-countdown-label]');
    const cd = { d: q('[data-cd="d"]'), h: q('[data-cd="h"]'), m: q('[data-cd="m"]'), s: q('[data-cd="s"]') };
    const actions = q('[data-deluxe-actions]');
    const steps = panel ? panel.querySelectorAll('.deluxe-timeline__step') : [];
    const STEP_KEY = { preorder: 'preorder', sale: 'sale', released: 'release' };

    const tLabel = box && box.querySelector('[data-diary-label]');
    const tCount = box && box.querySelector('[data-diary-count]');

    const render = (phase, now) => {
      const p = DELUXE_PHASES[phase];
      root.dataset.deluxePhase = phase;
      if (eyebrow) eyebrow.textContent = p.eyebrow;
      if (desc) desc.innerHTML = p.desc;
      if (cdWrap) cdWrap.hidden = !p.label;
      if (cdLabel && p.label) cdLabel.textContent = p.label;
      if (actions) {
        actions.textContent = '';
        p.actions.map(buildAction).filter(Boolean).forEach((el) => actions.appendChild(el));
      }
      let nextMarked = false;
      steps.forEach((li) => {
        const done = now >= DELUXE_T[STEP_KEY[li.dataset.step]];
        const isNext = !done && !nextMarked;
        li.classList.toggle('is-done', done);
        li.classList.toggle('is-next', isNext);
        if (isNext) nextMarked = true;
      });
      if (tLabel) tLabel.textContent = p.teaser;
    };

    let timer = 0;
    const tick = () => {
      const now = deluxeNow();
      const phase = deluxePhase(now);
      if (phase !== current) { current = phase; render(phase, now); }
      const nextKey = DELUXE_NEXT[phase];
      if (!nextKey) {
        if (tCount) tCount.textContent = '¡Ya está aquí!';
        clearInterval(timer);
        return;
      }
      const t = splitTime(DELUXE_T[nextKey] - now);
      if (cd.d) { cd.d.textContent = pad2(t.d); cd.h.textContent = pad2(t.h); cd.m.textContent = pad2(t.m); cd.s.textContent = pad2(t.s); }
      if (tCount) tCount.textContent = `${pad2(t.d)}d ${pad2(t.h)}h ${pad2(t.m)}m ${pad2(t.s)}s`;
    };
    tick();
    timer = setInterval(tick, 1000);

    // Aviso flotante: aparece tras el hero; si se cierra, no vuelve en esta sesión
    if (!box) return;
    const KEY = 'nfr-deluxe-teaser-closed';
    let closed = false;
    try { closed = sessionStorage.getItem(KEY) === '1'; } catch (_) { }
    if (closed) return;
    let dismissed = false;
    const hide = () => {
      dismissed = true;
      box.classList.remove('is-visible');
      setTimeout(() => { box.hidden = true; }, 600);
    };
    setTimeout(() => {
      if (dismissed) return;
      box.hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('is-visible')));
    }, 2500);
    box.querySelector('.diary-teaser__close').addEventListener('click', () => {
      try { sessionStorage.setItem(KEY, '1'); } catch (_) { }
      hide();
    });
    // Si ya está mirando la deluxe, el aviso sobra
    document.addEventListener('nfr:edition', (e) => { if (e.detail === 'deluxe') hide(); });
  })();

  /* 17 · SELECTOR DE EDICIÓN (Álbum ↔ Deluxe) */
  (function initEditionSwitch() {
    const section = document.querySelector('.editions');
    if (!section) return; // en /tour/ los enlaces /#album y /#deluxe llevan a la portada
    const panels = [...section.querySelectorAll('[data-edition-panel]')];
    const tabs = [...section.querySelectorAll('[role="tab"][data-edition-link]')];
    const HASH = { standard: 'album', deluxe: 'deluxe' };
    const fromHash = (h) => (h === '#deluxe' ? 'deluxe' : h === '#album' ? 'standard' : null);

    const scrollToSection = (smooth) => {
      const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 76;
      const top = section.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: smooth && !prefersReduced ? 'smooth' : 'auto' });
    };

    const show = (name, { hash = false, animate = true } = {}) => {
      const target = panels.find((p) => p.dataset.editionPanel === name);
      if (!target) return;
      const changed = section.dataset.edition !== name;
      panels.forEach((p) => {
        const on = p === target;
        p.hidden = !on;
        p.classList.toggle('is-active', on);
      });
      section.dataset.edition = name;
      tabs.forEach((t) => {
        const on = t.dataset.editionLink === name;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      // En el menú solo se marca cuando hay una edición elegida (no al cargar la portada)
      if (hash || location.hash) {
        document.querySelectorAll('.nav-link[data-edition-link]').forEach((l) =>
          l.classList.toggle('nav-link--active', l.dataset.editionLink === name));
      }
      // Los .reveal de un panel recién mostrado deben verse sin esperar al scroll
      target.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
      if (changed && animate && !prefersReduced) {
        target.classList.remove('is-entering');
        void target.offsetWidth;
        target.classList.add('is-entering');
      }
      // Detiene el avance de audio al salir de la edición estándar
      if (name !== 'standard') {
        const btn = section.querySelector('.snippet.is-playing .snippet__btn');
        if (btn) btn.click();
      }
      if (hash) history.replaceState(null, '', '#' + HASH[name]);
      document.dispatchEvent(new CustomEvent('nfr:edition', { detail: name }));
    };

    // Clicks en cualquier enlace de edición (nav, hero, selector, aviso)
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-edition-link]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      show(a.dataset.editionLink, { hash: true });
      if (!a.closest('.edition-switch')) scrollToSection(true);
    });

    // Flechas izquierda/derecha dentro del selector
    const switcher = section.querySelector('.edition-switch');
    if (switcher) switcher.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      e.preventDefault();
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      show(next.dataset.editionLink, { hash: true });
    });

    window.addEventListener('hashchange', () => {
      const name = fromHash(location.hash);
      if (name) { show(name); scrollToSection(true); }
    });

    const initial = fromHash(location.hash);
    show(initial || 'standard', { animate: false });
    section.classList.add('is-ready');
    if (initial) {
      // Tras cargar fuentes/imágenes para que la posición sea la buena
      requestAnimationFrame(() => scrollToSection(false));
      window.addEventListener('load', () => scrollToSection(false), { once: true });
    }
  })();

})();
