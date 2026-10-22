# Data representation and querying: does a graph help?

Exploratory design study · 21 October 2026 · measured on this project's own data

## Short answer

1. **A graph helps as a layer, not as the primary store.** Attributes (collection, region, family, date, material, text) are tabular and are queried by filtering and counting. Relationships (similar shape, comparison links, citations, documented relations) are edges. Keep both: columns for attributes, one typed edge table for relationships.
2. **Speed is not the constraint at this size, and will not be for a long time.** Every strategy answers every single query here in under 5 ms at 2,600 rows (a batch of 20 shortest paths takes 11–21 ms) and under 40 ms at 260,000 rows (100× today). The 30 MB `atlas.html` takes seconds to parse; the data layer takes about 12 ms to start (JSON parse 5.8 ms, index build 6.6 ms). Choose the representation for clarity and correctness, not speed.
3. **The graph that matters most is not yet a graph.** The Weiss 1863 relations connect *printed labels*, not resolved objects: 184 of 187 targets are marked unresolved by the register itself, and the explicit relations form 108 components, 100 of them isolated pairs. **Entity resolution, not database technology, is the bottleneck.**
4. **`atlas.html` keeps its single-file, offline design.** No WebAssembly, no server, no network. The same data also ships as `data/processed/atlas.sqlite` (4.7 MB) in the folder for anyone who wants SQL.

## What the data is

| Entity | Count | Source of truth | In `atlas.sqlite` |
|---|---|---|---|
| Curated instruments | 65 | `catalog.json` (built from Python curation modules) | `instrument` |
| Sources | 76 | same | `source` |
| Images | 37 | same | `image` |
| Specimens (shape study) | 2,600 | harvested records + masks + analysis tables | `specimen`, `specimen_material`, `collection` |
| Weiss 1863 relation nominations | 187 | `catalog.json` → `weiss_study` | edges of type `weiss_relation` |
| Edges, all types | 21,164 | built | `edge` |

Edge types and counts: `shape_knn` 20,800 (8 nearest neighbours per specimen), `weiss_relation` 187, `cites` 86, `depicts` 40, `functional_comparison` 49, `documented_transmission` 2. `same_object` (cross-source duplicates) is defined and currently empty because duplicates are removed upstream.

## Does a graph reveal anything tables do not?

**Yes, for shape similarity.** The 8-nearest-neighbour graph over the 2,600 specimens (`results/tables/graph_analysis.json`):

| Property | Observed | Random-mixing null (97.5th percentile) |
|---|---|---|
| Assortativity by **family** | 0.502 | 0.0085 |
| by **region** | 0.214 | 0.0098 |
| by **collection** | 0.202 | 0.0132 |
| by **non-Western** | 0.246 | 0.0113 |

- Neighbours share a **family** far more than a region or collection. Outline structure is organised by function, with weaker regional and collection effects (communities: NMI with family 0.213, region 0.093, collection 0.103).
- Non-Western specimens' neighbours are non-Western **29%** of the time against a 6.8% base rate (4.24× enrichment), yet **54 of 178** non-Western specimens have no non-Western neighbour at all. They sit inside Western families more than beside each other. This agrees with the inclusion finding in `MORPHOLOGY.md`.
- Hop distance between random specimens is 6 within a region and 7 across regions: the graph is one connected component with little regional separation.
- Hubness is mild (maximum in-degree 25 against a mean of 8; 64 specimens are nobody's neighbour), so nearest-neighbour lists are usable without hub correction.
- Only 54% of kNN edges are reciprocal. Use mutual neighbours for "similar to each other" claims (the pairs gallery does).

These are questions about *relationships between records*; they were not answerable by filtering. The atlas exposes the graph as **pin a specimen → see its eight nearest outlines** and as the reciprocal-pairs view.

**Not yet, for the Weiss relations.** 187 nominations (119 explicit): 178 distinct source labels and 177 distinct target labels, of which only 5 strings appear at both ends. The explicit relations form 108 connected components (largest has 5 nodes), so there is nothing to traverse. A graph view becomes useful only after targets are resolved to catalogue entries and plates. The register already records this (`target_check.status`, 3 located).

**No, for the curated comparison graph.** 65 instruments, 51 edges, 19 components, 6 isolated, maximum degree 5. A tree/timeline view is the right tool; a graph engine adds nothing.

## How fast can it be queried?

Medians of 7–9 runs, milliseconds, on one laptop (Python 3.9 / SQLite 3.38 / NumPy / Node 20). Scaled by replication: ids offset, dates jittered, kNN edges kept inside each replica so local graph structure stays realistic. This tests growth, not new kinds of data. Replicated rows are more regular than real harvests.

Tasks: **filter** = region + family + date overlap; **aggregate** = region × family counts under a collection filter; **text** = title contains "obstetric"; **neighbours** = 1,000 kNN lookups; **khop3** = from 20 seeds, non-Western specimens within 3 neighbour hops; **path** = 20 shortest paths.

### Python side (analysis, build, ad-hoc)

| Task | Implementation | 1× (2,600 rows) | 10× (26,000 rows) | 100× (260,000 rows) |
|---|---|---|---|---|
| aggregate | numpy columns | 0.011 | 0.055 | 0.521 |
| aggregate | pandas groupby | 0.540 | 0.803 | 3.4 |
| aggregate | python list of dicts | 0.245 | 2.5 | – |
| aggregate | sqlite indexed | 0.326 | 3.2 | 35.6 |
| filter | numpy columns | 0.018 | 0.065 | 0.535 |
| filter | pandas mask | 0.284 | 0.327 | 0.756 |
| filter | python list of dicts | 0.492 | 4.7 | – |
| filter | sqlite indexed | 0.379 | 3.6 | 36.8 |
| filter | sqlite no index | 0.309 | 2.9 | – |
| khop3 | networkx | 2.1 | 2.0 | – |
| khop3 | numpy kNN array (sparse frontier) | 1.9 | 1.9 | 1.8 |
| khop3 | python adjacency dict (BFS) | 0.803 | 0.780 | – |
| khop3 | scipy CSR (frontier) | 3.3 | 4.1 | 12.3 |
| khop3 | sqlite recursive CTE | 4.0 | 4.1 | 4.3 |
| neighbours | numpy row slice | 0.131 | 0.131 | 0.131 |
| neighbours | python adjacency dict | 0.067 | 0.072 | – |
| neighbours | scipy CSR | 0.385 | 0.401 | 0.383 |
| neighbours | sqlite indexed edge table | 4.2 | 4.4 | 4.7 |
| path | networkx bidirectional | 11.3 | 9.1 | – |
| path | python BFS on kNN array | 20.9 | 21.5 | 22.3 |
| path | sqlite recursive CTE (depth<=6) | 11.4 | 18.2 | – |
| text | python substring scan | 0.136 | 1.3 | 13.4 |
| text | sqlite FTS5 (token) | 0.005 | 0.006 | 0.007 |
| text | sqlite LIKE | 0.216 | 2.1 | 22.6 |

### Browser side (`app/query.js`, the engine inside `atlas.html`)

| Task | Implementation | 1× (2,600 rows) | 10× (26,000 rows) | 100× (260,000 rows) | 1000× (2,600,000 rows) |
|---|---|---|---|---|---|
| aggregate | ColumnStore (typed arrays) | 0.115 | 0.115 | 1.1 | 10.9 |
| aggregate | array of objects (.reduce) | 0.080 | 0.207 | 2.1 | – |
| filter | ColumnStore (typed arrays) | 0.192 | 0.185 | 1.9 | 18.5 |
| filter | array of objects (.filter) | 0.064 | 0.267 | 2.5 | – |
| khop3 | CSR graph (within) | 0.398 | 0.098 | 0.172 | 0.165 |
| khop3 | array of arrays (BFS) | 0.386 | 0.439 | 0.395 | – |
| neighbours | CSR graph | 0.297 | 0.247 | 0.234 | 0.232 |
| neighbours | array of arrays | 0.043 | 0.022 | 0.024 | – |
| path | CSR graph BFS | 4.5 | 4.8 | 4.6 | 4.5 |
| text | ColumnStore (typed arrays) | 0.135 | 1.3 | 3.4 | 32.0 |
| text | array of objects (.includes) | 0.058 | 0.472 | 5.2 | – |

Startup of the data layer for the real dataset: JSON parse 5.8 ms (1.28 MB) + index build 6.6 ms.

### What the numbers say

- **At today's size nothing matters for speed.** Every cell is sub-5 ms at 1×. A naive array-of-objects `.filter` is as fast as typed arrays at 2,600 rows (0.06 ms vs 0.19 ms) because typed arrays have fixed overhead.
- **Typed columns win from roughly 100,000 rows**, mostly through memory (a byte per categorical value instead of an object) and steadier scaling: 1.9 ms filter at 260k, 18 ms at 2.6 M rows.
- **SQLite is slower than in-memory columns for filters** (37 ms vs 0.5 ms at 260k rows). Its composite index does not help a range test on dates. Use it for what it is good at: joins, integrity (foreign keys), full-text search (**FTS5 answers a token search in 0.007 ms regardless of size**, while a substring scan costs 13 ms at 260k rows), and reuse from R, Python, GIS or BI tools.
- **Graph traversal cost is independent of dataset size** when adjacency is stored as arrays (CSR/kNN array: 0.2–1.9 ms for 20 three-hop expansions at 260,000 nodes, and 4.5 ms for 20 shortest paths at 2.6 M). SQL recursive queries work (4 ms) but cost an order of magnitude more per hop and scale poorly for path search. NetworkX needs the graph built first; it was 2.6× slower than a plain adjacency-list BFS for three-hop expansion and about 2× faster than a naive BFS for shortest paths, and it is the right tool for assortativity, communities and centrality (used in `graph_analysis.py`). Path pairs were drawn inside one replica, so path length does not grow with scale.
- **Parse time of the HTML file dominates load.** The 30 MB `atlas.html` (mostly embedded images and page scans) is the cost to watch, not the query engine. Lazy-loading images would cut it more than any change to the data layer.

## Recommended architecture

```
curated Python modules + harvested raw data (git)            <- source of truth
        │  build.py, morph_*.py, build_graph_db.py (deterministic)
        ├──► data/processed/atlas.sqlite   attributes as columns, one typed edge table, FTS5 index; for SQL, R, Python
        ├──► data/processed/atlas_morph.json   columnar arrays + CSR-ready kNN lists, 1.3 MB
        └──► atlas.html   everything embedded; app/query.js ColumnStore + Graph; no network, no WASM
```

- **Keep attributes in columns; keep relationships in `edge(src, dst, etype, weight, evidence, attrs)`.** Node ids are typed strings (`inst:…`, `spec:…`, `src:…`, `img:…`, `weiss:…`). New relationship kinds need no schema change.
- **Do not embed SQLite (sql.js/WASM) in `atlas.html`.** It would add roughly 1.5 MB of WASM plus the database, start-up cost, and a file:// risk, to speed up queries that already take under a millisecond. The dropdown filters, text search and neighbour graph cover the real questions. Revisit if users need ad-hoc SQL in the browser.
- **Thresholds for changing course:** under about 50,000 records, stay as is. Between 50,000 and 5 million, keep the typed-array engine and add a token index (FTS5-style) for text. Beyond that, serve Parquet via DuckDB-WASM (not tested here). A dedicated graph database (Neo4j, Kuzu) is not warranted at any foreseeable size: traversals here are 3 hops over fixed-degree neighbour lists.
- **Resolve entities before adding relationship types.** Next: link the 187 Weiss relation targets to catalogue entries and plates (`same_as` edges plus a `resolved` flag), give every instrument a stable identifier shared across sources, and keep unresolved endpoints as explicit placeholder nodes so that "what is still unresolved" is itself a query.

## Query cookbook

SQL (`sqlite3 roman_tool_lineage/data/processed/atlas.sqlite`):

```sql
-- non-Western specimens by collection and family
SELECT collection, family, COUNT(*) FROM specimen WHERE non_western=1 GROUP BY 1,2 ORDER BY 3 DESC;

-- full-text: obstetric forceps with a recorded maker place
SELECT s.id, s.title, s.maker_places FROM specimen_fts f JOIN specimen s ON s.id=f.rowid
WHERE specimen_fts MATCH 'obstetric' AND s.maker_places<>'';

-- the eight nearest outlines to specimen 17, with their regions
SELECT s.id, s.title, s.region, k.rank FROM v_specimen_knn k JOIN specimen s ON s.id=k.b WHERE k.a=17 ORDER BY k.rank;

-- which instruments cite a given source, and what depicts them
SELECT i.label, e.dst AS source FROM edge e JOIN instrument i ON 'inst:'||i.id=e.src WHERE e.etype='cites' AND e.dst='src:celsus7';

-- Weiss relations whose target is still unresolved
SELECT src, dst, json_extract(attrs,'$.relation_type') FROM edge WHERE etype='weiss_relation' AND json_extract(attrs,'$.target_status')='unresolved';

-- specimens within 2 neighbour hops of 17 that are non-Western
WITH RECURSIVE r(node,d) AS (SELECT 17,0 UNION SELECT k.b,r.d+1 FROM r JOIN v_specimen_knn k ON k.a=r.node WHERE r.d<2)
SELECT DISTINCT s.id, s.title, s.region FROM r JOIN specimen s ON s.id=r.node WHERE s.non_western=1;
```

Browser console (`atlas.html`, Morphology tab open):

```js
const T = Morph.store(), G = Morph.graph();
const sel = T.select({region: ['East Asia'], family: ['grasping (forceps/tweezers)']});   // Uint8Array mask
T.count(sel);  T.groupCount('coll', sel);  T.indices(sel, 20);
G.neighbours(17);  G.within(17, 3, sel);                                                      // Map(node -> hops)
```

## Reproduce

```bash
python roman_tool_lineage/scripts/analysis/build_graph_db.py      # atlas.sqlite (integrity-checked: no dangling edge endpoints)
python roman_tool_lineage/scripts/analysis/bench_queries.py       # Python benchmarks  -> results/tables/query_benchmarks_python.csv
node   roman_tool_lineage/scripts/analysis/bench_queries.mjs      # browser engine     -> results/tables/query_benchmarks_js.csv
python roman_tool_lineage/scripts/analysis/graph_analysis.py      # graph properties   -> results/tables/graph_analysis.json
```

## Limits of this study

- One machine, replicated data, medians of a few runs; relative orders of magnitude are reliable, exact milliseconds are not.
- The kNN graph depends on the shape descriptor (which the design-name test suggests is coarse) and on class imbalance between collections. Assortativity by collection partly reflects photographic style.
- Community detection was run once with the default resolution; the community NMI values are descriptive.
- Nothing here has been user-tested; the dropdown navigation passes scripted browser checks (`check_atlas_ui.py`) but has not been reviewed by a person.
