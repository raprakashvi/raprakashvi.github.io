/* Columnar query engine for the atlas: no dependencies, runs in the browser (file://) and in Node.
 *
 * Why this shape (see DATA_ARCHITECTURE.md): the atlas holds thousands, not millions, of records and every question
 * is "filter on a few categorical/numeric columns, then count / group / list / follow a few edges".
 * Typed-array columns plus one linear scan per filter answer that in well under a millisecond per 10^4 rows,
 * with no index to build or keep in sync.  Edges live in a CSR adjacency (offsets + targets), so neighbour lookups are O(degree).
 *
 *   const T = new ColumnStore(n);
 *   T.addCategorical('region', arrayOfStrings);   // dictionary-encoded into Uint8/Uint16 codes
 *   T.addNumeric('year', arrayOfNumbersOrNull);   // Float32 with NaN for missing
 *   T.addBitmask('mat', arrayOfInts);              // multi-label flags in an Int32
 *   const sel = T.select({region: ['East Asia'], mat: {any: 0b101}, year: {from: 1700, to: 1800}});   // -> Uint8Array mask
 *   T.count(sel); T.groupCount('family', sel); T.indices(sel, 50);
 *   const G = Graph.fromPairs(n, [[0,3],[0,5]]);  G.neighbours(0);   // -> [3,5]
 */
(function (root) {
  'use strict';

  class ColumnStore {
    constructor(n) { this.n = n; this.cols = {}; }
    addCategorical(name, values) {
      const dict = [], index = new Map();
      const codes = values.length > 255 ? new Uint16Array(this.n) : new Uint8Array(this.n);
      for (let i = 0; i < this.n; i++) {
        const v = values[i] == null ? '' : String(values[i]);
        let c = index.get(v);
        if (c === undefined) { c = dict.length; dict.push(v); index.set(v, c); }
        codes[i] = c;
      }
      this.cols[name] = { kind: 'cat', codes, dict, index };
      return this;
    }
    addNumeric(name, values) {
      const a = new Float32Array(this.n);
      for (let i = 0; i < this.n; i++) a[i] = values[i] == null ? NaN : values[i];
      this.cols[name] = { kind: 'num', a };
      return this;
    }
    addBitmask(name, values) {
      const a = new Int32Array(this.n);
      for (let i = 0; i < this.n; i++) a[i] = values[i] | 0;
      this.cols[name] = { kind: 'bits', a };
      return this;
    }
    addText(name, values) {            // lower-cased haystack for substring search
      this.cols[name] = { kind: 'text', a: values.map(v => (v == null ? '' : String(v)).toLowerCase()) };
      return this;
    }
    /* spec: {col: [values]} categorical any-of | {col:{from,to}} numeric overlap of [lo,hi] intervals if col has companion `${col}_hi`
     *       {col:{any:mask}} / {col:{all:mask}} bitmask | {col:'substring'} text.  Missing columns are ignored.  Returns Uint8Array 0/1. */
    select(spec, base) {
      const n = this.n, out = base ? Uint8Array.from(base) : new Uint8Array(n).fill(1);
      for (const [name, cond] of Object.entries(spec || {})) {
        const c = this.cols[name];
        if (!c || cond == null || (Array.isArray(cond) && cond.length === 0) || cond === '') continue;
        if (c.kind === 'cat') {
          const want = new Uint8Array(c.dict.length);
          for (const v of cond) { const code = c.index.get(String(v)); if (code !== undefined) want[code] = 1; }
          for (let i = 0; i < n; i++) if (out[i] && !want[c.codes[i]]) out[i] = 0;
        } else if (c.kind === 'num') {
          const hi = this.cols[name + '_hi'] ? this.cols[name + '_hi'].a : c.a;
          const from = cond.from == null ? -Infinity : cond.from, to = cond.to == null ? Infinity : cond.to;
          for (let i = 0; i < n; i++) if (out[i]) { const lo = c.a[i], h = hi[i]; if (!(lo <= to && h >= from)) out[i] = 0; }   // NaN fails -> undated excluded
        } else if (c.kind === 'bits') {
          if (cond.any != null) { for (let i = 0; i < n; i++) if (out[i] && !(c.a[i] & cond.any)) out[i] = 0; }
          if (cond.all != null) { for (let i = 0; i < n; i++) if (out[i] && (c.a[i] & cond.all) !== cond.all) out[i] = 0; }
          if (cond.none != null) { for (let i = 0; i < n; i++) if (out[i] && (c.a[i] & cond.none)) out[i] = 0; }
        } else if (c.kind === 'text') {
          const q = String(cond).toLowerCase();
          for (let i = 0; i < n; i++) if (out[i] && c.a[i].indexOf(q) < 0) out[i] = 0;
        }
      }
      return out;
    }
    count(sel) { let k = 0; for (let i = 0; i < this.n; i++) k += sel[i]; return k; }
    indices(sel, limit) { const r = []; for (let i = 0; i < this.n && (!limit || r.length < limit); i++) if (sel[i]) r.push(i); return r; }
    groupCount(name, sel) {
      const c = this.cols[name], counts = new Int32Array(c.dict.length);
      for (let i = 0; i < this.n; i++) if (!sel || sel[i]) counts[c.codes[i]]++;
      return c.dict.map((label, k) => ({ label, n: counts[k] })).filter(r => r.n > 0).sort((a, b) => b.n - a.n);
    }
    crossCount(rowCol, colCol, sel) {                 // contingency table: {rows, cols, m[r][c]}
      const R = this.cols[rowCol], C = this.cols[colCol];
      const m = R.dict.map(() => new Int32Array(C.dict.length));
      for (let i = 0; i < this.n; i++) if (!sel || sel[i]) m[R.codes[i]][C.codes[i]]++;
      return { rows: R.dict, cols: C.dict, m };
    }
    label(name, i) { const c = this.cols[name]; return c.kind === 'cat' ? c.dict[c.codes[i]] : c.a[i]; }
    codeOf(name, value) { const c = this.cols[name]; return c.index.get(String(value)); }
  }

  /* Compressed-sparse-row adjacency for directed or undirected edge lists. */
  class Graph {
    constructor(n, offsets, targets, weights) { this.n = n; this.off = offsets; this.to = targets; this.w = weights || null; }
    static fromPairs(n, pairs, undirected, weights) {
      const deg = new Int32Array(n + 1);
      for (const [a, b] of pairs) { deg[a + 1]++; if (undirected) deg[b + 1]++; }
      for (let i = 0; i < n; i++) deg[i + 1] += deg[i];
      const to = new Int32Array(deg[n]), w = weights ? new Float32Array(deg[n]) : null, fill = deg.slice(0, n);
      pairs.forEach(([a, b], k) => {
        to[fill[a]] = b; if (w) w[fill[a]] = weights[k]; fill[a]++;
        if (undirected) { to[fill[b]] = a; if (w) w[fill[b]] = weights[k]; fill[b]++; }
      });
      return new Graph(n, deg, to, w);
    }
    static fromKnn(nnLists) { const n = nnLists.length, off = new Int32Array(n + 1); nnLists.forEach((l, i) => off[i + 1] = off[i] + l.length); const to = new Int32Array(off[n]); nnLists.forEach((l, i) => l.forEach((j, k) => to[off[i] + k] = j)); return new Graph(n, off, to); }
    neighbours(i) { return Array.from(this.to.subarray(this.off[i], this.off[i + 1])); }
    degree(i) { return this.off[i + 1] - this.off[i]; }
    /* breadth-first: nodes within `hops`, optionally restricted to a selection mask */
    within(i, hops, sel) {
      const seen = new Map([[i, 0]]); let frontier = [i];
      for (let h = 1; h <= hops; h++) {
        const next = [];
        for (const u of frontier) for (let e = this.off[u]; e < this.off[u + 1]; e++) {
          const v = this.to[e];
          if (!seen.has(v) && (!sel || sel[v])) { seen.set(v, h); next.push(v); }
        }
        frontier = next;
      }
      seen.delete(i); return seen;
    }
  }

  const api = { ColumnStore, Graph };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Query = api;
})(typeof window !== 'undefined' ? window : globalThis);
