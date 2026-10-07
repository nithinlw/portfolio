/* site.js - shared behaviour for every page. Classic script, no dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = d.body.getAttribute('data-page') || '';
  var EMAIL = 'nithinlw@gmail.com', CV = 'assets/files/Nithin_Weerasinghe_CV.pdf';
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var sess = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} } };

  /* ---------- nav ---------- */
  var NAV = [['research', 'Research', 'index.html#research'], ['cv', 'CV', 'research.html'], ['posters', 'Posters', 'posters.html'], ['work', 'Other work', 'other-work.html'], ['about', 'About', 'about.html']];
  var nav = d.getElementById('nav');
  if (nav) {
    nav.className = 'nav';
    nav.innerHTML = '<a class="nav__home" href="index.html"><img src="assets/img/monogram.png" alt="" width="30" height="30"><span>Nithin Weerasinghe</span></a>' +
      '<ul class="nav__links" id="nav-links">' + NAV.map(function (n) { return '<li><a href="' + n[2] + '"' + (page === n[0] ? ' aria-current="page"' : '') + '>' + n[1] + '</a></li>'; }).join('') + '</ul>' +
      '<div class="nav__tools"><button type="button" class="tool" data-theme-toggle aria-label="Toggle light and dark theme"></button><button type="button" class="tool nav__menu" aria-expanded="false" aria-controls="nav-links">Menu</button></div>';
    var menu = nav.querySelector('.nav__menu');
    menu.addEventListener('click', function () { var o = nav.classList.toggle('is-open'); menu.setAttribute('aria-expanded', String(o)); menu.textContent = o ? 'Close' : 'Menu'; });
    nav.querySelectorAll('.nav__links a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = 'Menu'; }); });
    var sentinel = d.createElement('div'); sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:10px;pointer-events:none'; d.body.prepend(sentinel);
    new IntersectionObserver(function (e) { nav.classList.toggle('is-scrolled', !e[0].isIntersecting); }).observe(sentinel);
  }

  /* ---------- theme ---------- */
  function setTheme(t, keep) { root.setAttribute('data-theme', t); if (keep) store.set('theme', t); d.querySelectorAll('[data-theme-toggle]').forEach(function (b) { b.textContent = t === 'dark' ? 'Light' : 'Dark'; }); }
  setTheme(root.getAttribute('data-theme') || 'light', false);
  d.addEventListener('click', function (e) { if (e.target.closest('[data-theme-toggle]')) setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true); });

  /* ---------- footer ---------- */
  var foot = d.getElementById('foot');
  if (foot) {
    foot.className = 'foot';
    foot.innerHTML = '<div class="wrap"><div class="foot__grid"><div><p class="label">Contact</p><p class="foot__big"><a href="mailto:' + EMAIL + '">' + EMAIL.replace('@', '<wbr>@') + '</a></p></div>' +
      '<div class="btn-row"><a class="btn btn--solid" href="' + CV + '" target="_blank" rel="noopener">Download CV</a><a class="btn" href="https://github.com/nithinlw" target="_blank" rel="noopener">GitHub</a><button type="button" class="btn btn--plain" data-copy="' + EMAIL + '">Copy email</button></div></div>' +
      '<div class="foot__small"><span>Nithin Weerasinghe</span><span><a class="text" href="#top">Back to top</a></span></div></div>';
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]'); if (!b) return; var t = b.getAttribute('data-copy'), old = b.textContent;
    var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = old; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { window.prompt('Copy:', t); }); else window.prompt('Copy:', t);
  });

  /* ---------- Abe-style wires: header skies and project covers ---------- */
  function wires(h, poles) {
    var p = '<svg viewBox="0 0 1000 ' + h + '" preserveAspectRatio="none" aria-hidden="true">';
    if (poles) p += '<line x1="40" y1="0" x2="40" y2="' + h + '"/><line x1="18" y1="' + h * 0.18 + '" x2="62" y2="' + h * 0.18 + '"/><line x1="960" y1="0" x2="960" y2="' + h + '"/><line x1="938" y1="' + h * 0.2 + '" x2="982" y2="' + h * 0.2 + '"/>';
    p += '<g class="sway"><path d="M0 ' + h * 0.2 + ' Q500 ' + h * 0.62 + ' 1000 ' + h * 0.22 + '"/><path d="M0 ' + h * 0.26 + ' Q500 ' + h * 0.74 + ' 1000 ' + h * 0.28 + '"/><path d="M0 ' + h * 0.42 + ' Q520 ' + h * 0.95 + ' 1000 ' + h * 0.44 + '"/></g></svg>';
    return p;
  }
  d.querySelectorAll('.sky').forEach(function (s) { s.insertAdjacentHTML('afterbegin', wires(150, true).replace('<svg ', '<svg class="sky__wires" ')); });
  d.querySelectorAll('.cover-sky').forEach(function (c) { c.innerHTML = '<span class="disc"></span>' + wires(100, true) + '<span class="num">' + (c.getAttribute('data-n') || '') + '</span>'; });

  /* ---------- headings rise in, word by word ---------- */
  d.querySelectorAll('[data-split]').forEach(function (h) {
    if (RM) return; var n = 0, label = h.textContent.replace(/\s+/g, ' ').trim();
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (c) {
        if (c.nodeType === 3) { var f = d.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) { f.appendChild(d.createTextNode(' ')); return; } var s = d.createElement('span'); s.className = 'w'; s.setAttribute('aria-hidden', 'true'); var i = d.createElement('i'); i.textContent = w; i.style.setProperty('--e', n++); s.appendChild(i); f.appendChild(s); }); c.parentNode.replaceChild(f, c); }
        else if (c.nodeType === 1) walk(c);
      });
    })(h);
    h.setAttribute('aria-label', label);
  });
  function ready() { root.classList.add('is-ready'); }

  /* ---------- reveal on scroll ---------- */
  var rev = d.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) { var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }); rev.forEach(function (e) { io.observe(e); }); }
  else rev.forEach(function (e) { e.classList.add('in'); });

  /* ---------- section rails (CV and case studies) ---------- */
  var railLinks = d.querySelectorAll('[data-rail] a');
  if (railLinks.length && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) railLinks.forEach(function (l) { l.classList.toggle('is-on', l.getAttribute('href') === '#' + e.target.id); }); }); }, { rootMargin: '-30% 0px -62% 0px' });
    d.querySelectorAll('[data-sec]').forEach(function (s) { rio.observe(s); });
  }

  /* ---------- page transition: two blades, quick ---------- */
  var pt = d.createElement('div'); pt.className = 'pt'; pt.setAttribute('aria-hidden', 'true'); pt.innerHTML = '<i></i><i></i>'; d.body.appendChild(pt);
  if (sess.get('pt') && !RM) { sess.del('pt'); pt.classList.add('is-on', 'is-out'); root.classList.remove('pt-cover'); setTimeout(ready, 200); setTimeout(function () { pt.classList.remove('is-on', 'is-out'); }, 800); }
  else { root.classList.remove('pt-cover'); var t = setTimeout(ready, 700); if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { clearTimeout(t); ready(); }); }
  window.addEventListener('pageshow', function (e) { if (e.persisted) { pt.classList.remove('is-on', 'is-in', 'is-out'); root.classList.remove('pt-cover'); ready(); } });
  d.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || RM) return;
    var a = e.target.closest('a[href]'); if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var u = new URL(a.href, location.href); if (u.origin !== location.origin || !/\.html?$|\/$/.test(u.pathname)) return;
    if (u.pathname === location.pathname) return;
    e.preventDefault(); sess.set('pt', '1'); pt.classList.add('is-on', 'is-in'); setTimeout(function () { location.href = a.href; }, 520);
  });

  /* ---------- image viewer (gallery + posters) ---------- */
  var viewer = null;
  function openViewer(src, alt, caption, pdf) {
    if (!viewer) {
      viewer = d.createElement('dialog'); viewer.className = 'viewer'; viewer.setAttribute('aria-label', 'Image viewer');
      viewer.innerHTML = '<div class="viewer__img"><img alt=""></div><div class="viewer__bar"><p></p><span class="btn-row"><a class="btn" data-pdf target="_blank" rel="noopener" hidden>Download PDF</a><button type="button" class="btn btn--plain" data-close>Close</button></span></div>';
      d.body.appendChild(viewer);
      viewer.addEventListener('click', function (e) { if (e.target === viewer || e.target.closest('[data-close]')) viewer.close(); });
    }
    var img = viewer.querySelector('img'); img.src = src; img.alt = alt || ''; viewer.querySelector('p').textContent = caption || '';
    var p = viewer.querySelector('[data-pdf]'); if (pdf) { p.hidden = false; p.href = pdf; } else p.hidden = true;
    if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', '');
  }
  d.addEventListener('click', function (e) {
    var g = e.target.closest('[data-view]'); if (!g) return; e.preventDefault();
    var img = g.querySelector('img'); openViewer(g.getAttribute('href') || g.getAttribute('data-view'), img ? img.alt : '', g.getAttribute('data-caption') || (img ? img.alt : ''), g.getAttribute('data-pdf'));
  });

  /* ---------- posters (from assets/data/posters.json) ---------- */
  var wall = d.getElementById('wall');
  if (wall) {
    var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var path = function (f) { return f.indexOf('/') > -1 ? f : 'assets/posters/' + f; };
    fetch('assets/data/posters.json').then(function (r) { return r.json(); }).then(function (data) {
      var items = (data.items || []).slice().sort(function (a, b) { return b.year - a.year; });
      wall.innerHTML = items.map(function (p) {
        var frame = p.image ? '<button type="button" class="pframe" data-view="' + esc(path(p.image)) + '" data-caption="' + esc(p.venue + ' ' + p.year + '. ' + p.title) + '"' + (p.pdf ? ' data-pdf="' + esc(path(p.pdf)) + '"' : '') + ' aria-label="View poster: ' + esc(p.title) + '"><img src="' + esc(path(p.image)) + '" alt="Poster: ' + esc(p.title) + '" loading="lazy"></button>'
          : '<div class="pframe pframe--empty" aria-hidden="true"><span>' + esc(p.venue) + '</span><b>' + esc(p.title) + '</b><span>Poster to follow</span></div>';
        var links = (p.pdf ? '<a class="text" href="' + esc(path(p.pdf)) + '" target="_blank" rel="noopener">PDF</a> ' : '') + (p.link ? '<a class="text" href="' + esc(p.link) + '" target="_blank" rel="noopener">Link</a>' : '');
        return '<figure class="pcard" data-reveal>' + frame + '<figcaption><p class="venue">' + esc(p.type) + ', ' + esc(p.venue) + '</p><h2>' + esc(p.title) + '</h2><p class="auth">' + esc(p.authors) + '</p>' + links + '</figcaption></figure>';
      }).join('');
      wall.querySelectorAll('[data-reveal]').forEach(function (e, i) { e.style.setProperty('--i', i); requestAnimationFrame(function () { e.classList.add('in'); }); });
    }).catch(function () { wall.innerHTML = '<p>The poster list could not be loaded. See the <a class="text" href="research.html#publications">publications</a>.</p>'; });
  }
})();
