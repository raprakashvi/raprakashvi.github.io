/* Shared 3D "layout + time" projection for the Morphology shape space and AI Methods embedding map.
 * Plane = the existing 2D layout (normalised 0–1); height = catalog date. Orthographic canvas projection,
 * no WebGL or dependency. Loaded as a classic script (atlas) or with import() (collection page), so it
 * only assigns a global and has no import/export statements. */
globalThis.Space3D = (() => {
  const REF = 2025, TOP = [0, Math.PI / 2], SIDE = [0, 0], OBLIQUE = [-0.6, 0.42];
  const PRESETS = { map: TOP, time: SIDE, oblique: OBLIQUE };
  // Dataset convention: signed historical years, negative = BCE, no year zero.
  const yearText = y => y < 0 ? `${-y} BCE` : `${Math.max(1, y)} CE`, astro = y => y < 0 ? y + 1 : y;
  // Catalog date range of a record: [lo, hi] (reversed ranges are reordered and counted by the caller), or null.
  const range = (a, b) => a == null ? null : [Math.min(a, b ?? a), Math.max(a, b ?? a)];

  // 'compressed': log10 of years before REF, so the dense 19th–20th centuries stay legible next to
  // antiquity; 'linear': calendar years. f(year) -> 0 (earliest) .. 1 (latest).
  function timeScale(mode, lo, hi) {
    const ref = Math.max(REF, hi + 1), u = y => Math.log10(ref + 1 - astro(y));
    const f = mode === 'linear' ? y => (y - lo) / ((hi - lo) || 1) : y => (u(lo) - u(y)) / ((u(lo) - u(hi)) || 1);
    const ticks = [];
    for (const y of [1, 1000, 1500, 1800, 1900, 2000, -1000, -2000, -3000, -5000, -7000, 500, 1700, 1850, 1950, -500, 1600, 1750, 1975, 1200])
      if (y >= lo && y <= hi && ticks.every(t => Math.abs(f(t) - f(y)) > 0.075)) ticks.push(y);
    return { mode, lo, hi, f, ticks: ticks.sort((a, b) => a - b),
      label: mode === 'linear' ? 'Catalog date (calendar years)' : `Catalog date (log scale of years before ${ref})` };
  }

  // World axes: x = layout x, z = layout y (depth), y = time (up). yaw about the vertical axis, pitch = elevation.
  function camera(view, w, h, left) {
    const [yaw, pitch] = view, cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const s = Math.min(w - left - 24, h - 44) / 1.74, ox = left + (w - left) / 2, oy = h / 2 - 4;
    return (x, y, t) => { const X = x - 0.5, Z = y - 0.5, T = t - 0.5, rx = X * cy - Z * sy, rz = X * sy + Z * cy;
      return [ox + rx * s, oy - (T * cp + rz * sp) * s, rz * cp - T * sp]; };  // third value: depth, larger = farther
  }

  // Draws frame, time ticks, optional range whiskers, then calls paint(p, sx, sy, depth01) far-to-near.
  // points: [{x, y, t0, t1, ...}] with x, y in 0–1 and dates in years. Returns [{p, x, y}] in screen px.
  function render(g, { w, h, view, scale, points, css, paint, whiskers = true, highlight = () => true }) {
    const P = camera(view, w, h, 58), f = scale.f, line = (a, b) => { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
    g.lineWidth = 1; g.strokeStyle = css.border;
    const corners = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (const t of [0, 1]) for (let k = 0; k < 4; k++) line(P(...corners[k], t), P(...corners[(k + 1) % 4], t));
    for (const c of corners) line(P(...c, 0), P(...c, 1));
    // Time ticks on the leftmost vertical edge, with faint level rings.
    const edge = corners.reduce((a, b) => P(...b, 0)[0] < P(...a, 0)[0] ? b : a);
    g.font = '11px system-ui'; g.textAlign = 'right'; g.fillStyle = css.muted;
    if (Math.cos(view[1]) > 0.15) for (const y of scale.ticks) {
      const t = f(y); g.globalAlpha = 0.28; for (let k = 0; k < 4; k++) line(P(...corners[k], t), P(...corners[(k + 1) % 4], t));
      g.globalAlpha = 1; const [x0, y0] = P(...edge, t); line([x0 - 4, y0], [x0, y0]); g.fillText(yearText(y), x0 - 6, y0 + 4);
    }
    const out = points.map(p => { const m = (p.t0 + p.t1) / 2, [x, y, d] = P(p.x, p.y, f(m)); return { p, x, y, d }; });
    if (whiskers) { g.lineWidth = 1; for (const o of out) if (o.p.t1 > o.p.t0 && highlight(o.p)) { g.globalAlpha = 0.22; g.strokeStyle = o.p.color || css.muted; line(P(o.p.x, o.p.y, f(o.p.t0)), P(o.p.x, o.p.y, f(o.p.t1))); } }
    g.globalAlpha = 1;
    const dmin = Math.min(...out.map(o => o.d)), dmax = Math.max(...out.map(o => o.d)), span = (dmax - dmin) || 1;
    for (const o of [...out].sort((a, b) => b.d - a.d)) paint(o.p, o.x, o.y, (o.d - dmin) / span);
    g.globalAlpha = 1; g.fillStyle = css.muted; g.textAlign = 'right';
    g.fillText(w < 640 ? `Height: ${scale.mode === 'linear' ? 'catalog date' : 'catalog date (log scale)'} · drag to rotate` : `${scale.label} · plane: 2D layout, dimensionless · drag to rotate`, w - 8, h - 6);
    return out.map(({ p, x, y }) => ({ p, x, y }));
  }

  // Records per time bin, each record spread uniformly over its catalog range (fractional counts), so wide
  // ranges are not piled onto their midpoint. Bins are equal width on the displayed scale.
  function bins(scale, points, n = 24) {
    const inv = v => { let a = scale.lo, b = scale.hi; for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (scale.f(m) < v) a = m; else b = m; } return (a + b) / 2; };
    const edges = Array.from({ length: n + 1 }, (_, k) => k === 0 ? scale.lo : k === n ? scale.hi : inv(k / n));
    const count = sel => edges.slice(0, -1).map((e, k) => sel.reduce((s, p) => {
      const a = p.t0, b = p.t1, hi = edges[k + 1], last = k === n - 1;
      if (b === a) return s + (a >= e && (a < hi || (last && a <= hi)) ? 1 : 0);
      return s + Math.max(0, Math.min(b, hi) - Math.max(a, e)) / (b - a);
    }, 0));
    return { edges, count };
  }

  // Inline SVG histogram: all dated points (grey) and the highlighted subset (colour), with exact counts in titles.
  function histogram(scale, all, subset, { color, grey, ink, label }) {
    const b = bins(scale, all), A = b.count(all), S = subset ? b.count(subset) : null, max = Math.max(...A, 1), W = 600, H = 92, n = A.length;
    const span = k => `${yearText(Math.round(b.edges[k]))} – ${yearText(Math.round(b.edges[k + 1]))}`, bar = (k, v, c, o) => {
      const x = k / n * W, hh = v / max * (H - 18); return `<rect x="${(x + 1).toFixed(1)}" y="${(H - 16 - hh).toFixed(1)}" width="${(W / n - 2).toFixed(1)}" height="${hh.toFixed(1)}" fill="${c}" opacity="${o}"/>`; };
    const peak = (S || A).indexOf(Math.max(...(S || A)));
    return `<svg class="space3d-hist" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}. Highest bin ${span(peak)} with ${(S || A)[peak].toFixed(1)} records.">${A.map((v, k) =>
      `<g><title>${span(k)}: ${v.toFixed(1)} of ${all.length} dated records${S ? `; highlighted ${S[k].toFixed(1)}` : ''}</title>${bar(k, v, grey, 0.55)}${S ? bar(k, S[k], color, 0.95) : ''}</g>`).join('')}
      ${scale.ticks.map(y => `<text x="${(scale.f(y) * W).toFixed(1)}" y="${H - 3}" text-anchor="middle" font-size="10" fill="${ink}">${yearText(y)}</text>`).join('')}</svg>`;
  }

  // Pointer drag rotates; a press that moves less than 4 px stays a click. Returns a "was this a drag" probe.
  function rotate(canvas, getView, setView) {
    let start = null, moved = false;
    canvas.addEventListener('pointerdown', e => { if (!canvas.dataset.space3d) return; start = [e.clientX, e.clientY, ...getView()]; moved = false; canvas.setPointerCapture?.(e.pointerId); });
    canvas.addEventListener('pointermove', e => {
      if (!start) return; const dx = e.clientX - start[0], dy = e.clientY - start[1];
      if (!moved && dx * dx + dy * dy < 16) return; moved = true;
      setView([start[2] + dx * 0.01, Math.max(0, Math.min(Math.PI / 2, start[3] + dy * 0.01))]);
    });
    const end = () => { start = null; }; canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    return () => { const m = moved; moved = false; return m; };
  }
  return { PRESETS, REF, yearText, range, timeScale, camera, render, bins, histogram, rotate };
})();
