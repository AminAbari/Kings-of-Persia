(function () {
  var KEY = 'eop-theme';
  var root = document.documentElement;
  var order = ['auto', 'light', 'dark'];
  var icons = { auto: '◑', light: '☀', dark: '☽' };
  var labels = { auto: 'Auto', light: 'Light', dark: 'Dark' };

  function current() {
    var stored = null;
    try { stored = localStorage.getItem(KEY); } catch (e) {}
    return order.indexOf(stored) !== -1 ? stored : 'auto';
  }

  function apply(mode) {
    if (mode === 'auto') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', mode);
    }
    var btn = document.querySelector('[data-theme-toggle]');
    if (btn) {
      var icon = btn.querySelector('.icon');
      var label = btn.querySelector('.label');
      if (icon) icon.textContent = icons[mode];
      if (label) label.textContent = labels[mode];
      btn.setAttribute('aria-label', 'Theme: ' + labels[mode] + '. Click to change.');
    }
  }

  function set(mode) {
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    apply(mode);
  }

  apply(current());

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!btn) return;
    var idx = order.indexOf(current());
    var next = order[(idx + 1) % order.length];
    set(next);
  });
})();

(function () {
  var overlay = document.querySelector('[data-about-overlay]');
  if (!overlay) return;

  function open() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('[data-about-toggle]')) {
      open();
      return;
    }
    if (e.target === overlay || (e.target.closest && e.target.closest('[data-about-close]'))) {
      close();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });
})();

(function () {
  var cards = document.querySelectorAll('.card-flip');
  if (!cards.length) return;

  function unflipAll(except) {
    cards.forEach(function (c) {
      if (c !== except) c.classList.remove('is-flipped');
    });
  }

  cards.forEach(function (card) {
    var btns = card.querySelectorAll('.flip-hint');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (card.classList.contains('is-flipped')) {
          card.classList.remove('is-flipped');
        } else {
          unflipAll(card);
          card.classList.add('is-flipped');
        }
      });
    });
  });

  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.card-flip')) {
      unflipAll(null);
    }
  });
})();

(function () {
  var counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  var runs = new WeakMap();

  function run(el, delay) {
    var token = {};
    runs.set(el, token);
    var end = parseFloat(el.dataset.count);
    var suf = el.dataset.suf || '';
    var pre = el.dataset.pre || '';
    el.textContent = pre + '0' + suf;
    setTimeout(function () {
      if (runs.get(el) !== token) return;
      var t0 = performance.now();
      var dur = 1200;
      function step(t) {
        if (runs.get(el) !== token) return;
        var k = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - k, 3);
        var v = Math.round(end * eased);
        el.textContent = pre + v.toLocaleString() + suf;
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, delay || 0);
  }

  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        run(entry.target, 0);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  var FLIP_DELAY = 350;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

  document.querySelectorAll('.card-flip').forEach(function (card) {
    var el = card.querySelector('[data-count]');
    if (!el) return;
    var flipped = card.classList.contains('is-flipped');

    function restart() { run(el, FLIP_DELAY); }

    new MutationObserver(function () {
      var now = card.classList.contains('is-flipped');
      if (now === flipped) return;
      flipped = now;
      restart();
    }).observe(card, { attributes: true, attributeFilter: ['class'] });

    if (canHover) {
      card.addEventListener('mouseenter', restart);
      card.addEventListener('mouseleave', restart);
    }
  });
})();
