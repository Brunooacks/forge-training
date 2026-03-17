/**
 * FORGE Core — Shared JavaScript
 * Loaded at bottom of <body> on all pages
 */

/* ── Auth Guard ──────────────────────────────────────────────────── */
(function() {
  // Skip guard on login page itself
  if (!window.location.pathname.endsWith('login.html')) {
    const s = (function() {
      try { return localStorage; } catch(e) { return sessionStorage; }
    })();
    if (!s.getItem('forge_auth')) {
      window.location.replace('login.html');
    }
  }
})();

/* ── Storage helper (fallback to sessionStorage) ─────────────────── */
const forgeStorage = {
  get(key) { try { return localStorage.getItem(key); } catch(e) { return sessionStorage.getItem(key); } },
  set(key, val) { try { localStorage.setItem(key, val); } catch(e) { sessionStorage.setItem(key, val); } },
  getJSON(key) { try { return JSON.parse(this.get(key)); } catch(e) { return null; } },
  setJSON(key, val) { this.set(key, JSON.stringify(val)); }
};

/* ── Progress API ────────────────────────────────────────────────── */
const forgeProgress = {
  _key: 'forge_progress',
  _defaults() {
    return { level: 'E1', labs: {}, quizzes: {}, videos: {}, certs: [] };
  },
  get() { return forgeStorage.getJSON(this._key) || this._defaults(); },
  save(data) { forgeStorage.setJSON(this._key, data); },

  markLabComplete(labId, score) {
    const p = this.get();
    p.labs[labId] = { completed: true, score: score || 100, completedAt: new Date().toISOString().split('T')[0] };
    this._recalcLevel(p);
    this.save(p);
  },
  saveQuizScore(quizId, score, passed) {
    const p = this.get();
    if (!p.quizzes[quizId]) p.quizzes[quizId] = { attempts: 0, bestScore: 0, passed: false };
    p.quizzes[quizId].attempts++;
    if (score > p.quizzes[quizId].bestScore) p.quizzes[quizId].bestScore = score;
    if (passed) p.quizzes[quizId].passed = true;
    this.save(p);
  },
  markVideoWatched(videoId) {
    const p = this.get();
    p.videos[videoId] = true;
    this.save(p);
  },
  _recalcLevel(p) {
    const completed = Object.values(p.labs).filter(l => l.completed).length;
    if (completed >= 7) p.level = 'E4';
    else if (completed >= 5) p.level = 'E3';
    else if (completed >= 3) p.level = 'E2';
    else p.level = 'E1';
  },
  getCompletedCount() { return Object.values(this.get().labs).filter(l => l.completed).length; },
  isLabComplete(labId) { const p = this.get(); return p.labs[labId]?.completed || false; },
  getCurrentLevel() { return this.get().level; }
};

// Expose globally
window.forgeProgress = forgeProgress;
window.forgeStorage = forgeStorage;

/* ── Mobile hamburger menu ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.nav-hamburger');
  const mobileMenu = document.querySelector('.nav-mobile');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      const open = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  }

  /* ── Progress sidebar IntersectionObserver ─────────────────────── */
  const steps = document.querySelectorAll('.ps-step[data-section]');
  if (steps.length) {
    const sectionIds = Array.from(steps).map(s => s.dataset.section);
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    const bar = document.querySelector('.sidebar-progress .progress-fill');
    const pct = document.querySelector('.sidebar-progress-pct');
    let activeIdx = 0;

    function updateSidebar(idx) {
      steps.forEach((s, i) => {
        s.classList.toggle('active', i === idx);
        s.classList.toggle('completed', i < idx);
      });
      if (bar) {
        const p = Math.round(((idx) / (steps.length - 1)) * 100);
        bar.style.width = Math.min(p, 100) + '%';
        if (pct) pct.textContent = Math.min(p, 100) + '% completo';
      }
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = sections.indexOf(entry.target);
          if (idx !== -1) { activeIdx = idx; updateSidebar(idx); }
        }
      });
    }, { threshold: 0.3, rootMargin: '-64px 0px -30% 0px' });

    sections.forEach(s => observer.observe(s));
    updateSidebar(0);
  }

  /* ── Scroll animations ─────────────────────────────────────────── */
  const animEls = document.querySelectorAll('.anim-up');
  if (animEls.length) {
    const animObs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); animObs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    animEls.forEach(el => animObs.observe(el));
  }

  /* ── Video player lazy loading ─────────────────────────────────── */
  document.querySelectorAll('.forge-video-thumb').forEach(thumb => {
    thumb.addEventListener('click', function() {
      const container = this.closest('.forge-video');
      const embed = container.querySelector('.forge-video-embed');
      const videoSrc = container.dataset.src;
      const videoId = container.dataset.videoId;
      if (!videoSrc) return;
      embed.innerHTML = `<iframe src="${videoSrc}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
      embed.style.display = 'block';
      this.style.display = 'none';
      // Mark as watched after 30s
      if (videoId) setTimeout(() => {
        forgeProgress.markVideoWatched(videoId);
        const watched = container.querySelector('.forge-video-watched');
        if (watched) watched.style.display = 'flex';
      }, 30000);
    });
  });

  /* ── Logout buttons ────────────────────────────────────────────── */
  document.querySelectorAll('.btn-logout').forEach(btn => {
    btn.addEventListener('click', function() {
      forgeStorage.set('forge_auth', null);
      window.location.replace('login.html');
    });
  });
});
