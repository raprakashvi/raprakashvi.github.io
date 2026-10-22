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
