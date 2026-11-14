/* Shared helpers: lookup, tiles, museum chips, query string, per-object shard loader. */
(function () {
  var S = window.SCI;
  S.by = {};
  S.items.forEach(function (it) { S.by[it.id] = it; });
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var lum = function (hex) { var n = parseInt(hex.slice(1), 16), f = function (v) { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); };
    return .2126 * f(n >> 16) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255); };
  var P = {};
  window.__sci_obj = function (o) { if (P[o.id]) P[o.id](o); };
  window.U = {
    esc: esc,
    $: function (s, r) { return (r || document).querySelector(s); },
    $$: function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); },
    q: function () { var o = {}; new URLSearchParams(location.search).forEach(function (v, k) { o[k] = v; }); return o; },
    mus: function (i) { return S.museums[i]; },
    thumb: function (it) { return 'img/t/' + it.h + '.jpg'; },
    objUrl: function (id) { return 'object.html?id=' + encodeURIComponent(id); },
    cmpUrl: function (a, b) { return 'compare.html?a=' + encodeURIComponent(a) + '&b=' + encodeURIComponent(b); },
    /* a photograph tile; museum colour as a thin rule on top of the photo */
    tile: function (it, o) {
      o = o || {}; var m = S.museums[it.m];
      return '<a class="tile" style="--c:' + m.color + '" href="' + U.objUrl(it.id) + '"><div class="ph"><img loading="lazy" decoding="async" src="' + U.thumb(it) +
        '" alt="' + esc(it.t) + '"></div><b>' + esc(it.t) + '</b><span>' + esc(m.short) + (it.dt ? ' · ' + esc(it.dt) : '') + '</span></a>' +
        (o.compare ? '<a class="more" href="' + U.cmpUrl(o.compare, it.id) + '">Compare</a>' : '');
    },
    legend: function () {
      return '<div class="legend" aria-label="Museum colours">' + S.museums.map(function (m) {
        return '<span style="--c:' + m.color + '"><i></i>' + esc(m.short) + '</span>'; }).join('') + '</div>';
    },
    chipHTML: function (i, on, extra) {
      var m = S.museums[i];
      return '<button type="button" class="chip' + (lum(m.color) > .25 ? ' dark' : '') + '" data-m="' + i + '" aria-pressed="' + (on ? 'true' : 'false') + '" style="--c:' + m.color + '">' + esc(m.short) + (extra || '') + '</button>';
    },
    /* load one object shard (works from file://, as a script tag) */
    loadObj: function (id) {
      return new Promise(function (res, rej) {
        P[id] = res;
        var s = document.createElement('script');
        s.src = 'data/obj/' + encodeURIComponent(id) + '.js';
        s.onerror = function () { rej(new Error('missing ' + id)); };
        document.head.appendChild(s);
      });
    },
    row: function (title, ids, compareFrom) {
      var its = (ids || []).map(function (i) { return S.by[i]; }).filter(Boolean);
      if (!its.length) return '';
      return '<section class="row"><h2>' + esc(title) + '</h2><div class="strip">' +
        its.map(function (it) { return '<div>' + U.tile(it, {compare: compareFrom}) + '</div>'; }).join('') + '</div></section>';
    }
  };
})();
