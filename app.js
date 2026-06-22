/* =====================================================================
   Friction Frog: site behavior
   Loaded on every page. All analytics calls are guarded and never block
   navigation. No external dependencies.
   ===================================================================== */
(function () {
  'use strict';

  var REDUCED_MOTION =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- GoatCounter helper -----------------------------------------
     The GoatCounter <script> in the page <head> loads asynchronously, so
     wait (briefly) until window.goatcounter.count exists, then run cb.   */
  function gc(cb) {
    var tries = 0;
    (function attempt() {
      try {
        if (window.goatcounter && typeof window.goatcounter.count === 'function') {
          cb(window.goatcounter);
          return;
        }
      } catch (e) { /* ignore */ }
      if (tries++ < 40) setTimeout(attempt, 50); // up to ~2s
    })();
  }

  /* ---- Source / traffic detection ----------------------------------
     Priority: ?utm_source  ->  ?src  ->  first path segment (e.g. /ig).
     Normalised to a channel name and cached in sessionStorage.          */
  var SOURCE_MAP = {
    ig: 'instagram', insta: 'instagram', instagram: 'instagram',
    tt: 'tiktok', tiktok: 'tiktok',
    yt: 'youtube', youtube: 'youtube',
    reddit: 'reddit', r: 'reddit',
    x: 'twitter', twitter: 'twitter',
    fb: 'facebook', facebook: 'facebook'
  };

  function normalize(raw) {
    if (!raw) return null;
    var key = String(raw).toLowerCase().trim();
    return SOURCE_MAP[key] || key.replace(/[^a-z0-9_-]/g, '').slice(0, 32) || null;
  }

  function detectSource() {
    try {
      var cached = sessionStorage.getItem('ff_source');
      if (cached) return cached;
    } catch (e) { /* sessionStorage may be unavailable */ }

    var src = null;
    try {
      var params = new URLSearchParams(window.location.search);
      src = normalize(params.get('utm_source')) || normalize(params.get('src'));
      if (!src) {
        var seg = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
        if (seg && !/\.[a-z0-9]+$/i.test(seg)) src = normalize(seg); // ignore file names
      }
    } catch (e) { /* ignore */ }

    src = src || 'direct';
    try { sessionStorage.setItem('ff_source', src); } catch (e) { /* ignore */ }
    return src;
  }

  var SOURCE = detectSource();

  // Record the channel as a custom GoatCounter event (once per session).
  function trackSource() {
    try {
      if (sessionStorage.getItem('ff_source_sent')) return;
    } catch (e) { /* ignore */ }
    gc(function (g) {
      try {
        g.count({ path: 'source/' + SOURCE, title: 'Source: ' + SOURCE, event: true });
        sessionStorage.setItem('ff_source_sent', '1');
      } catch (e) { /* ignore */ }
    });
  }

  /* ---- Conversion: download_click on ANY App Store CTA -------------- */
  function trackDownload() {
    try {
      gc(function (g) {
        try { g.count({ path: 'download_click', title: 'Download (' + SOURCE + ')', event: true }); }
        catch (e) { /* ignore */ }
      });
    } catch (e) { /* never block navigation */ }
  }

  document.addEventListener('click', function (e) {
    var cta = e.target.closest && e.target.closest('[data-download-cta]');
    if (cta) trackDownload();
  }, true);

  /* ---- Obfuscated contact email ------------------------------------ */
  function buildEmail() {
    var address = ['thefrog', 'frictionfrog.com'].join('@');
    var nodes = document.querySelectorAll('[data-email]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      el.setAttribute('href', 'mailto:' + address);
      if (!el.dataset.keepText) el.textContent = address;
    }
  }

  /* ---- App Store badge fallback (missing SVG -> styled placeholder) - */
  function badgeFallback() {
    var imgs = document.querySelectorAll('.appstore-badge img');
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      img.addEventListener('error', function () {
        var a = this.closest('.appstore-badge');
        if (!a) return;
        a.classList.add('appstore-badge--fallback');
        a.innerHTML =
          '<span class="apple-glyph" aria-hidden="true"></span>' +
          '<span class="badge-txt"><small>Download on the</small><b>App Store</b></span>';
      });
      // Force the handler if the image already failed before JS ran.
      if (img.complete && img.naturalWidth === 0) {
        img.dispatchEvent(new Event('error'));
      }
    }
  }

  /* ---- Dynamic copyright year -------------------------------------- */
  function setYear() {
    var y = String(new Date().getFullYear());
    var nodes = document.querySelectorAll('[data-year]');
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = y;
  }

  /* ---- Mobile nav toggle ------------------------------------------- */
  function navToggle() {
    var btn = document.querySelector('.nav__toggle');
    var links = document.querySelector('.nav__links');
    if (!btn || !links) return;
    btn.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- Active-section indicator in nav ------------------------------ */
  function activeSection() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      if (id) map[id] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('active'); });
          if (map[en.target.id]) map[en.target.id].classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ---- Sticky download button (appears after the hero) -------------- */
  function stickyCta() {
    var sticky = document.querySelector('.sticky-cta');
    var hero = document.querySelector('.hero');
    if (!sticky || !hero || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        sticky.classList.toggle('visible', !en.isIntersecting);
      });
    }, { threshold: 0 });
    io.observe(hero);
  }

  /* ---- Reveal-on-scroll -------------------------------------------- */
  function reveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Init -------------------------------------------------------- */
  function init() {
    buildEmail();
    badgeFallback();
    setYear();
    navToggle();
    activeSection();
    stickyCta();
    reveal();
    trackSource();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
