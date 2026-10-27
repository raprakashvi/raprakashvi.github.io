# AI Methods on the website

Open **Research → AI Methods**, or
[the direct workspace](https://raprakashvi.github.io/roman-tool-lineage/collection.html#ai).
Choose a record by name, accession or permanent identifier. Item pages also link back
to their AI results. The basic browsing gate and existing credentials are unchanged;
all static analysis files remain publicly reachable.

## Delivered interactions

- **Similarity:** top eight catalog-text or original-outline candidates, thumbnails,
  source-record links, shared comparison selection, query switching and JSON exports.
  The image option exposes the actual bounded frozen-feature test only.
- **Clusters:** separate text and scalar-shape PCA projections, eight numbered color
  groups, source and record filters, point previews and record links. A paginated
  table contains every point, both coordinates and its feature-space center distance.
  Cluster exports contain source composition, terms, exclusions and method provenance.
- **Provisional labels:** all eight function states for the chosen item; positive
  hypotheses and abstentions; expandable source/context or weak-neighbor evidence;
  content-derived suggestion IDs, rule/configuration hashes and downloadable evidence.
  The workspace does not write labels or modify collection records.
- **Run & methods:** coverage, experiment identity, missing evaluation metrics, GPU
  scope, provenance/file hashes, export integrity and links to local experiment tools.

The family tree, world/time view, original morphology workspaces and research studies
remain in their existing navigation destinations. The new workspace uses the shared
Vestigium shell, typeface and plot palette.

## Actual scope and interpretation

The current dataset is `v1-804c1e7c3202`. The exploratory run is
`baseline-4b286bb1a4717b14`; its training/evaluation development counterpart is
separate and is not substituted for these full-corpus exploratory results.

| Output | Verified scope | Interpretation |
|---|---|---|
| Text retrieval / text clusters | 2,830 records | TF–IDF catalog wording; cosine is higher-closer. Source terminology and photography/catalog bias remain. |
| Shape retrieval | Original 2,600-record matrix; 230 absent | Equal mean of median-normalized profile, Fourier and scalar blocks. Lower dimensionless distance is closer. Full-corpus normalization is transductive; no calibrated physical dimensions. |
| Scalar-shape clusters | 2,600 records | Median/IQR descriptors, centered PCA and K-means; independent of the multiblock retrieval ranking. |
| Provisional function states | 22,640 = 8 × 2,830 | 3,163 positive hypotheses; 19,477 abstentions. Counts describe label states, not verified tools or newly discovered functions. |
| Image retrieval | 8 views / 5 objects | Frozen ImageNet ResNet18, 512 dimensions per view; mean normalized views per object followed by L2 normalization. Existing local checkpoint/GPU; no weight updates/download. |
| Independent performance evaluation | 0 adjudicated retrieval pairs; 0 eligible supervised cells in this run | No accuracy, recall or calibrated function-probability claim. |

Both text and shape retrieval exclude the query's entire **known** duplicate group.
Unknown duplicates can remain. Cluster IDs are arbitrary, with seed 17 and eight
clusters for each representation. PCA axis variance is shown in expandable methods;
projected proximity is not the original full feature distance. Source composition and
text terms help inspect bias; clusters do not establish function or ancestry.

Functions include extraction, crushing, cutting, gripping, scraping, piercing, probing
and dilation. The zero supported crushing hypotheses are still represented by explicit
abstentions. Context rules and labels transferred from those rules share dependent
evidence. Numeric neighbor support is an uncalibrated vote fraction, not probability.
Missing labels are unknown, never negative. Source functions, hypotheses and future
reviewed training labels remain distinct. Human validation is deferred.

## Architecture and reproducibility

`web/ai.js` is imported only on the collection's `#ai[/META-ID]` route. It loads a
small analysis manifest/index and the selected record's 80-record result shard.
Clusters load only when requested. Published shards are SHA-256 verified in the
browser against the manifest and must match the collection release and run.

`scripts/web/ai_export.py` validates immutable local run/release/code/input/record
hashes, suggestion schemas and evidence, cluster membership, image-cache identity,
neighbor references and duplicate exclusion before publishing. It uses the actual
ML lookup classes; the browser does not run a model or load weights. The exporter
stages the complete result tree before replacing its target. It never copies raw
local manifests/paths, vectors, gate credentials or pretrained weights.

Current public outputs live at `data/v1-804c1e7c3202/ai/`: `summary.json`, `index.json`,
36 `ai-records-NNNN.json` shards, `clusters-text.json`, `clusters-shape.json`,
`images.json` and `export-report.json`. Each cluster/table/export uses permanent IDs.
Total uncompressed result payload is about 37.4 MB; the largest item shard is about
1.13 MB. These files are fetched on demand. Total payload is not an initial-page
transfer measurement. The collection's existing search index is also loaded.

From the parent checkout, using the current locally preserved run/cache:

```bash
MPLCONFIGDIR=/tmp/vestigium-mpl OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 \
  python roman_tool_lineage/scripts/web/build_site.py \
  --output /tmp/vestigium-ai \
  --gate-config roman_tool_lineage/gate.local.json
```

Bulk local runs are ignored in Git. On a fresh workstation, recreate the saved
results first using [ML_TOOLS.md](ML_TOOLS.md): `python -m scripts.ml.demo` from the
project root creates the CPU exploratory run, including inspections/suggestions/
readiness; `scripts.ml.image_features` creates a bounded cache from an existing
checkpoint. Neither command downloads weights. Preserve the printed run directory
and image-cache directory. A new Git/environment identity may produce a new run ID.
Use the explicit build options rather than changing recorded IDs:

```bash
python roman_tool_lineage/scripts/web/build_site.py \
  --output /tmp/vestigium-ai --gate-config roman_tool_lineage/gate.local.json \
  --ai-run /absolute/path/to/baseline-CONTENT_HASH \
  --ai-image-cache /absolute/path/to/image-CONTENT_HASH
```

Custom runs must satisfy the same contracts: exploratory full-corpus mode, frozen
current release, exactly one text and one shape inspection, eight states per record
and a validated saved 512D image cache. Build failure is explicit if saved artifacts
are absent/stale; it does not silently fabricate results, train, or fetch weights.
No source code or frozen scientific data need to change to reproduce an export.

For rollback, use the existing scoped deployment workflow and a prior website commit;
never replace the personal-site root. Source and website commits for this delivery
are recorded in PLAN.md and HANDOFF.md. Credential changes use the existing
[hosting instructions](OPERATIONS.md); do not put a plaintext password in Git.

## Verification and remaining work

`check_ai.mjs` exercises exact exported ranking/state reconciliation, comparison
links, record picking, keyboard activation, cluster filtering/pagination, missing
modalities, failed-shard recovery, unknown IDs and responsive layouts. It writes
`results/tables/ai_browser_verification[_live].json` and desktop/mobile screenshots.
`test_ai_export.py` checks real lookup classes with small frozen fixtures and rejects
corruption/mismatched inputs. Existing atlas, collection, review and workbench suites
continue to cover the original features. Firefox has a bounded AI smoke extension.

Independent screen-reader/Safari/full-Firefox audits remain open. Full image-corpus
features, multimodal fusion, independently reviewed retrieval/function benchmarks,
category classifiers, autoencoder comparisons and uncertainty calibration remain
research work. Museum acquisition, outline coverage and a separately recalibrated
expanded distance matrix remain open. No substantial training or weight upload was
part of this website integration.

Delivery verified live: source implementation `dc11c84`, website implementation
`b81a68d`; both pushed. Forty-four AI Chrome checks, 14 Firefox smoke checks, all
existing workbench/atlas/collection/review browser suites, 34 website/export tests
and 21 ML tests pass. Every AI JSON file matches the tested artifact on the live
site. Initial AI result transfer is 1,065,464 decoded bytes (manifest, index and one
item shard), in addition to the shared collection index and interface resources.
No original collection, scientific dataset or substantial model training changed.

The interface now uses an underlined section bar and a query/results layout: the
selected tool stays in a left-hand panel on wide screens; mobile stacks a compact
record picker above the matches. Aggregate counts are in Run & methods. Research
results, provenance, retrieval ranks, cluster data and annotation states are unchanged.

## Deep-representation views

The deep-representation study ([AI_DEEP_METHODS.md](AI_DEEP_METHODS.md)) is published
beside the baseline export and shown in the same workspace. Its views use the shared
tab and segment controls and the shared tokens. Map colours come from the new
colour-blind-safe `COLORBLIND_COLORS` / `COLORBLIND_MARKERS` in `visuals/style.py`
(Okabe-Ito hues without yellow, each paired with a marker shape), exposed through
`visuals/palette.json`. Benchmark view markers reuse `VIEW_COLORS`.

- **Similarity:** adds Photo (DINOv2-L), Silhouette (DINOv2-B), Adapted, Working ends
  and Multimodal beside catalog text, outline shape and the image sample. Each method
  shows its note, thumbnails, record links, comparison selection and a JSON export of
  the exact published ranks (cosine, higher is closer). If a record has no rank for a
  method, the page says why and imputes nothing. The reasons are: no image, no
  segmentable image, an outline that failed quality control (so no working-end crops),
  or a missing component for Multimodal.
- **Evidence:** eight function rows for the selected record. State chips (documented,
  corroborated, rule only, image hypothesis, conflict, abstain) use an icon, text and
  border style, not colour alone. Rows also show plain-language flags, rule evidence
  text, and photo/silhouette values labelled *agreement with existing rules on
  held-out groups* (never probability), with neighbour thumbnails. A separate panel
  covers **physical affordance cues (visible form, not use)**: prompt cues and
  outline geometry. The tab also shows documented statements, near-duplicate links,
  any category-conflict note with its inspection code, and modern analogs when they
  are published. The baseline **Provisional labels** tab is unchanged.
- **Text search:** the 26 precomputed English/Dutch/Swedish queries, with SigLIP 2
  zero-shot and adapted results side by side. Where a query is scored, its test
  precision@20 is shown against the base rate. No model runs in the browser.
  On narrow screens a grouped selector replaces the query buttons.
- **Embedding map:** a canvas UMAP display of the photo, silhouette, adapted or text
  map, coloured by catalog category or museum (the seven largest classes get colours,
  the rest are drawn as "other"). It has hover and keyboard (arrow/Enter) tooltips;
  clicking a point selects that record and stays on the map. A highlightable counted
  legend, a paginated table of every point and the display-only caveat are included.
- **Experiments:** a section bar, then Findings (status: observation / inference /
  speculation; a "pending" placeholder when `findings` is null). It is followed by the
  benchmark dot-and-interval plot (95% group-bootstrap CI, random cross-museum
  reference, text rows marked *circular: labels derived from text*), confound
  controls, adaptation (mean ± SD over three seeds, paired differences, loss curves),
  working ends vs whole object, zero-shot affordance AP vs prevalence, cross-modal
  summary, near-duplicate audit with example pairs, disagreement gallery with
  inspection codes, hypothesis state counts and calibration, literature by topic,
  limitations, next experiments and provenance hashes.

### Focused workspace (October 2026)

The workspace was narrowed to the methods the benchmark supports.

- **Sections:** Similar tools, Search by task, Evidence, Embedding map and Experiments; the
  earlier baseline (Provisional labels, Clusters, Run & methods) sits behind a quieter
  *Baseline* divider in the same tab bar.
- **Similar tools** offers two methods. **Photo (DINOv2-L)** is the default: the best
  non-circular cross-museum retrieval (P@10 0.737 [0.723, 0.750] vs random 0.377).
  **Outline shape** is the form-only alternative with the weakest museum signature
  (within-category enrichment 1.22×). Each shows its benchmark line from
  `summary.method_evidence`, derived from the saved benchmark at export. Catalog text, the image
  sample, Silhouette (no gain over outline, F4), Adapted (equal to DINOv2-L on an unseen
  museum, F5), Working ends (worse on subtypes, F6) and Multimodal (partly circular) remain
  under a collapsed **More methods**. Results are one numbered ranking with catalog category,
  score and actions per row.
- **Record browser** in the query panel: filter by weak coarse category (`browse.json`) and
  collection, photographed records first; with no category chosen the grid interleaves
  categories. *Random tool* picks a photographed record within the current filter. The
  selected record is labelled *Querying* with its category.
- **Search by task:** SigLIP 2 zero-shot only, 66 precomputed queries grouped by clinical
  need, design feature and controls, with a filter box, test P@20 vs base rate where scorable,
  the top-20 category mix and a ranked top 20 (`tasks.json`, from `tasksearch-*`). The adapted
  comparison remains in Experiments → Cross-modal.
- **Evidence:** a one-line verdict names the supported functions; their rows come first and
  bare abstentions collapse into one *No evidence for* row (an abstention with rule or
  documented text keeps its full row).

Photo is now the default, so the first AI view also loads `ai-deep.js`, the deep
`summary.json`, `browse.json` and one item shard (≈ 0.5 MB decoded in headless Chrome).
`check_ai_deep.mjs` now has 103 checks (method layout, benchmark line, ordered ranking, record
browser, task-search reproduction of `crossmodal.json`, filter, category mix, evidence verdict).
`check_ai.mjs` has 48.

### 3D view with time (October 2026)

Embedding map (AI Methods) and Morphology shape space have a **3D · time** option. The plane is the
unchanged 2D layout (UMAP or shape space, normalised 0–1); height is the catalog date. Shared code:
`app/space3d.js` (orthographic canvas projection, no WebGL or dependency).

- Each point sits at the midpoint of its catalog date range; a faint vertical line spans the range.
  Dates use the dataset convention (signed years, negative = BCE, no year zero). Reversed ranges are
  drawn earliest to latest and counted in the note (one Morphology record, 31.3.111b).
- Undated records are never imputed. They are left out of the 3D view, counted on screen and kept in
  the 2D view and tables. Photo map: 2,098 of 2,716 plotted records dated, 618 undated. Morphology:
  1,975 of 2,600 dated, 625 undated (mostly Region Skåne, 462).
- Time scale: compressed (log10 of years before 2025, so the 19th–20th centuries are legible next
  to antiquity) or linear.
- "Dated records per period" histogram: 24 bins of equal width on the displayed scale. Each record
  is spread evenly over its catalog range (fractional counts), so wide ranges are not piled on their
  midpoint. A highlighted class (AI) or the current filter (Morphology) is overlaid on all dated
  records.
- Caveat shown on screen: Museum Boerhaave supplies 1,914 of 2,098 dated map records (1,833 of 1,975
  in Morphology). Concentrations in time therefore mostly show what museums collected and dated, not
  when a tool type appeared or how common it was.
- Interaction: drag to rotate (horizontal drag only on touch, so vertical swipes still scroll), camera
  presets (oblique, side, top) and ±22.5° rotation buttons. In 3D, arrow keys step through records in
  date order.
- Checks: `check_ai_deep.mjs` 114 (+11: counts against `index.json`, histogram sum equals dated count,
  drag rotates without selecting, date-order keyboard stepping, class overlay, scale toggle, mobile
  fit); `check_atlas.mjs` 52 (+7).

### Data contract and loading

`scripts/web/ai_deep_export.py` runs inside `build_site.py` right after the baseline
export. It writes `data/<version>/ai-deep/` and records its report in
`results/tables/ai_deep_export.json`, which is copied to `reports/`. It reads saved
results only. A missing pointer, result or feature cache stops the build with an
explicit `Missing saved …` error. Files: `summary.json` (methods, functions, shard
map, provenance, limitations, SHA-256 per file), 29 × `items-NNNN.json` (100 records:
neighbours, hypotheses, near-duplicates, category conflict, modern analogs),
`experiments.json`, `crossmodal.json`, `maps.json` and `literature.json`. No vectors,
weights or local paths are published. The total is about 9.58 MB.

`web/ai-deep.js` is a separate module. `ai.js` imports it only when a deep tab or
method is first used. Every deep file except `summary.json` is SHA-256 checked
against `summary.files` and must carry the current `dataset_version`. Failed or
rejected files are evicted from the cache, so **Retry results** refetches them.
Decoded first-use transfer, measured in headless Chrome (local, not a network
benchmark):

| View | Additional files | Decoded bytes |
|---|---|---|
| Initial AI page (unchanged path) | `ai.js`, `ai.css`, baseline `summary.json`, `index.json`, one shard | 1,257,914 |
| First deep method or Evidence | `ai-deep.js` (60 KB), deep `summary.json` (102 KB), one item shard (17–194 KB) | ≈ 339,000 |
| Search by task | `tasks.json` | ≈ 72,000 |
| Embedding map | `maps.json` | 784,104 |
| Experiments | `experiments.json`, `crossmodal.json`, `literature.json` | 248,187 |

### Verification

```bash
# from the parent checkout, after a build served on localhost (any free port)
ATLAS_URL=http://127.0.0.1:8771/ CDP_PORT=9227 node roman_tool_lineage/scripts/web/check_ai_deep.mjs
VESTIGIUM_SITE=/path/to/site python -m unittest discover -s roman_tool_lineage/scripts/web -p 'test_*.py'
```

`check_ai_deep.mjs` (87 checks) confirms that the initial view requests no deep
module or file. It checks that displayed neighbour IDs and cosines for all five deep
methods match the shards, along with exports, keyboard method switching and the
explicit null-neighbour reasons. On Evidence it checks states, photo thumbnails,
flags, conflict codes, affordance cues and near-duplicate links. It verifies that
text-search top-12 and P@20 values match `crossmodal.json`. On the map it checks
counts, legend sums, hover, click and keyboard selection, table filtering and
paginated toggles. It reconciles state counts with both `experiments.json` and
every shard, and checks benchmark values, circular marking, CIs and section
navigation. It also tests checksum rejection and 503 retry, a 390 px mobile layout
with a compact query selector, and 320/768/1024 px widths. It writes
`results/tables/ai_deep_browser_verification[_live].json` and
`results/figures/ai-deep-<tab>-{desktop,mobile}.png`. `test_ai_deep_export.py`
tests the explicit missing-result failures, published hashes, shard coverage, state
reconciliation and the absence of vectors and paths. All CDP suites now accept
`CDP_PORT` (default 9227). The Firefox smoke run adds five deep-tab checks.

The website shows weak-label research outputs faithfully. It does not validate
them: similarity is not ancestry, function states are not ground truth, and the map
is a display projection.
