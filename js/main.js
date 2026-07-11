(function () {
  'use strict';

  /* ============ FAQ accordion ============ */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll('.faq-item'));
  faqItems.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      faqItems.forEach(function (i) { i.classList.remove('is-open'); });
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  /* ============ Lumi flying companion ============
     Built outside the normal layout flow and positioned purely via
     transform on a rAF loop so it never triggers layout thrashing.
     Three modes: hero (large, docked in the hero card) -> follow
     (small, tracks scroll down the left edge) -> dock (settles into
     the final CTA card). */

  var heroSlot = document.getElementById('lumi-hero-slot');
  var dockSlot = document.getElementById('lumi-dock-slot');
  var sectionEls = Array.prototype.slice.call(document.querySelectorAll('[data-lumi]'));
  var chatPanel = document.getElementById('tutor-chat');
  var chatCloseBtn = document.getElementById('tutor-chat-close');

  var host = document.createElement('div');
  host.className = 'lumi-companion';
  host.title = 'Συνομιλία με τη Lumi';
  var lumiEl = document.createElement('lumi-mascot-3d');
  lumiEl.setAttribute('variant', 'balanced');
  lumiEl.setAttribute('expression', 'happy');
  lumiEl.setAttribute('size', '360');
  lumiEl.setAttribute('shadow', 'off');
  host.appendChild(lumiEl);

  var bubble = document.createElement('div');
  bubble.className = 'lumi-companion-bubble';

  document.body.appendChild(host);
  document.body.appendChild(bubble);

  var state = {
    x: undefined, y: undefined, s: 0.27,
    rot: 0, vel: 0,
    lastY: window.scrollY,
    lastTick: 0,
    expr: '',
    exprAt: 0,
    bubbleTimer: null,
    geo: null,
    geoAt: 0,
    mode: 'hero',
    chatOpen: false,
  };

  function measure() {
    var sy = window.scrollY;
    function abs(el) {
      var r = el.getBoundingClientRect();
      return { top: r.top + sy, left: r.left, width: r.width, bottom: r.bottom + sy };
    }
    state.geo = {
      hero: heroSlot ? abs(heroSlot) : null,
      dock: dockSlot ? abs(dockSlot) : null,
      sections: sectionEls.map(function (s) {
        var a = abs(s);
        return { top: a.top, bottom: a.bottom, expr: s.getAttribute('data-lumi'), msg: s.getAttribute('data-lumi-msg') || '' };
      }),
      maxScroll: Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
    };
  }

  function openChat() {
    var size = 360 * (state.s || 0.27);
    var x = Math.min(Math.max(10, state.x || 26), window.innerWidth - 340);
    var y = Math.max(10, (state.y || 200) - 6);
    chatPanel.style.left = (x + size * 0.7) + 'px';
    chatPanel.style.top = y + 'px';
    chatPanel.classList.add('is-open');
    state.chatOpen = true;
  }

  function closeChat() {
    chatPanel.classList.remove('is-open');
    state.chatOpen = false;
  }

  host.addEventListener('click', openChat);
  chatCloseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    closeChat();
  });

  function tick(tsNow) {
    requestAnimationFrame(tick);
    // throttle to ~30fps — plenty smooth for this easing-based motion
    if (state.lastTick && tsNow - state.lastTick < 32) return;
    state.lastTick = tsNow;

    var vh = window.innerHeight;
    var now = Date.now();
    if (!state.geo || now - state.geoAt > 500) { measure(); state.geoAt = now; }
    var geo = state.geo;

    var sy = window.scrollY;
    var dv = sy - state.lastY;
    state.lastY = sy;
    state.vel = state.vel * 0.88 + dv * 0.12;

    var prog = Math.min(1, Math.max(0, sy / geo.maxScroll));
    var mode = 'follow';
    var tx = 26, ty = vh * (0.14 + prog * 0.55), ts = 96 / 360;
    if (geo.hero && (geo.hero.bottom - sy) > vh * 0.45) { mode = 'hero'; tx = geo.hero.left; ty = geo.hero.top - sy; ts = geo.hero.width / 360; }
    if (geo.dock && (geo.dock.top - sy) < vh * 0.85) { mode = 'dock'; tx = geo.dock.left; ty = geo.dock.top - sy; ts = geo.dock.width / 360; }
    if (state.chatOpen && mode === 'follow') ty = Math.max(ty, 360);
    state.mode = mode;

    if (state.x === undefined) { state.x = tx; state.y = ty; state.s = ts; }
    state.x += (tx - state.x) * 0.14;
    state.y += (ty - state.y) * 0.14;
    state.s += (ts - state.s) * 0.16;

    var rotTarget = (mode === 'follow' && !state.chatOpen) ? Math.max(-18, Math.min(18, state.vel * 0.9)) : 0;
    state.rot += (rotTarget - state.rot) * 0.14;
    var bobAmp = mode === 'dock' ? 0 : (mode === 'hero' ? 9 : 6);
    var bob = Math.sin(now / 650) * bobAmp;
    var sway = mode === 'follow' ? Math.sin(now / 1100) * 5 : 0;
    var x = state.x + sway, y = state.y + bob;
    host.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + state.rot + 'deg) scale(' + state.s + ')';
    bubble.style.transform = 'translate(' + (x + 360 * state.s + 10) + 'px,' + (y + 6) + 'px)';

    var expr = 'idle', msg = '';
    if (mode === 'hero') {
      expr = 'happy';
    } else if (mode === 'dock') {
      expr = 'celebrating';
    } else {
      var mid = sy + vh * 0.5;
      for (var i = 0; i < geo.sections.length; i++) {
        var s = geo.sections[i];
        if (s.top <= mid && s.bottom >= mid) { expr = s.expr; msg = s.msg; break; }
      }
      if (Math.abs(state.vel) > 34) expr = 'loading';
    }

    if (expr !== state.expr && now - state.exprAt > 350) {
      state.expr = expr;
      state.exprAt = now;
      lumiEl.setAttribute('expression', expr);
      if (msg) {
        bubble.textContent = msg;
        bubble.style.opacity = '1';
        clearTimeout(state.bubbleTimer);
        state.bubbleTimer = setTimeout(function () { bubble.style.opacity = '0'; }, 2200);
      }
    }
  }

  requestAnimationFrame(tick);
})();
