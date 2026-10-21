# Website and dataset implementation plan

Started 2026-10-21. Status values: pending / in progress / blocked / complete.
Completion means acceptance verified; local implementation and live deployment are separate.
The explicit public GitHub Pages override governs all phases: a basic browser gate,
public static assets, no security or secrecy guarantee. No substantial ML training.

| # | Status | Task / dependencies | Acceptance and verification |
|---|---|---|---|
| 1 | complete | Inspect existing atlas, dataset, plots, rights and deployment; checkpoint before changes | Archive current project with SHA-256; measure actual payloads; preserve original files; record baseline and Git state |
| 2 | complete | Initial migration preserving current atlas; depends 1 | Build split static viewer with original modules and image credits, noindex, username/password gate; verify valid/invalid credentials and fail-closed missing config locally |
| 3 | complete | Deploy initial migration before redesign; depends 2 | GitHub project Pages at https://raprakashvi.github.io/roman-tool-lineage/; live gate verification; personal website unchanged. SSH access in user-provided website checkout verified; initial publish underway |
| 4 | complete | Versioned schema, stable identifier registry, lossless migration; depends 1 | Unique persistent META IDs for all existing record layers; JSON Schema validation; source counts reconcile; missingness, duplicates and asset failures reported; deterministic hashed release |
| 5 | complete | Museum source investigation and resumable pilot; depends 4 | Official Pitt Rivers interfaces/terms investigated; representative real records imported if permitted and accessible, otherwise exact blocker; retry/cache/resume pipeline, explicit outcomes and bounded coverage; additional feasible source pilot |
| 6 | complete | Research-oriented responsive browser, item detail and comparison; depends 4 | Search + category/function/material/geography/period/museum filters; pagination, lazy images; metadata and uncertainty visible; keyboard access; desktop/mobile browser scenarios pass |
| 7 | complete | Reproducible morphology update; depends 4,5 | Existing features audited, stable links, dataset coverage, uncalibrated-image limits, interactive filters and CSV alternative; regenerate PDF/SVG/PNG and methods/manifest without training |
| 8 | complete | ML research roadmap; depends 4,5,7 | Implementable staged image/text/multimodal baselines and transformer autoencoder study, leakage controls, metrics, compute, tracking and versioned manifests/weights; no training |
| 9 | complete | Maintenance, release and handoff; depends 2,4–8 | Document credentials, architecture, rights, backups/restore/rollback, ingestion and reproducibility; automated validation + browser results; meaningful scoped commits; deployment and remaining blockers accurately stated |

## Source-dependent follow-up and later phase

| Task | Status | Exact remaining work |
|---|---|---|
| Full Pitt Rivers catalog expansion | blocked | Modern database still returns a maintenance document. Establish documented API/export scope and cultural flags when service returns. Editorial access recovered in follow-up: 50 records, not a census. |
| Additional full ethnographic imports | pending (deferred) | Smithsonian bounded API frame now has 38 records; extend through saved offsets within quota or use a personal key for sustained work. Review Te Papa/Swedish source terms and cultural handling. |
| Substantial local model training | pending (deferred by request) | Annotation, rights, entity-group and compute audits from ML roadmap precede experiments. No training or weight upload performed. |
| Independent assistive-technology / cross-browser audit | pending (deferred) | Automated Chromium checks passed; independent screen-reader/Safari/Firefox checks not performed. |

## Architecture decision (initial inspection)

Retain the existing Python + buildless JavaScript atlas. Its single-file offline viewer is
62,108,929 bytes and modular index is 61,881,125 bytes: embedding images defeats the
modular layout. Catalog JSON is 1,149,330 bytes; morphology export is 1,484,878 bytes.
The existing graph/SQLite layer and 2,600-specimen study remain available locally.
Use a generated static deployment directory, paginated lightweight search index, separate
record shards, and external lazy-loaded images. Keep old research views as an on-demand
legacy viewer. New project Pages repository avoids changing the personal site or its workflow.
Do not publish raw caches, source PDFs or the embedded HTML itself. User subsequently authorized existing research-image inclusion; source rights and training eligibility remain separately recorded.

## Execution evidence

- Parent repository: `raprakashvi/local_tinkering`, branch `main`. Thousands of existing
  changes are executable-bit differences (no content differences on project baseline);
  leave them untouched and stage only this delivery's changes.
- GitHub CLI absent; no GitHub credential variable present. GitHub remote read failed DNS.
- Existing README specifically warns against publishing Boerhaave thumbnails without permission.
- Temporary pre-change archive is being created under `/tmp/roman-lineage-checkpoints/`.

- Checkpoint SHA-256: `8f98c4ff9e4d3e20744175f642a11c9c0db1ceaa6c7a5989c76beacf8bd4d8c4`; archive `/tmp/roman-lineage-checkpoints/pre-web-2026-10-21.tar.gz`.
- Initial local Chromium checks passed: wrong/right credentials, hidden interface before login, original tree rendering, noindex and session reload. Personal-site integrity checker: 0 failures, 0 warnings.
- User explicitly authorized inclusion of existing research images; 2,760 images externalized with original credits and rights. This is not a rights clearance or training authorization.
- Actual website checkout supplied by user: `/home/rp/rp_repo/raprakashvi.github.io`, branch `master`, SSH authenticated. Use its unlisted `roman-tool-lineage/` folder rather than creating a new repository.

- Initial website deployment: commit `238b7cf` on personal-site `master`, pushed successfully. Live URL and verifier return HTTP 200. Source-only changed directory: `roman-tool-lineage/`.
- Stable migration after pilot: 2,743 records (2,738 original + 5 new), 5,343 input row references, 2,600 morphology aliases reconciled. All records validated with Draft 2020-12; original data retained under `raw`.
- Pitt Rivers pilot: 5 discovered / 5 imported / 0 failed from 2 official editorial pages. Main modern catalogue and its robots endpoint return a maintenance page; full catalogue expansion remains blocked. No new images or shape features fabricated.
- New descriptive morphology regenerates 2,600 dimensionless aspect/solidity points and reports 143 records without features. Existing t-SNE and distance study retained in legacy atlas.

- Vestigium branding adopted at user request. Local end-to-end run: 29 passed checks, 0 exceptions, 0 HTTP errors; includes mobile tasks, missing gate config and failed dataset loading. Text contrast ratios: 10.74/5.34/5.86.
- Corrected one reversed BCE interval for Met accession 31.3.111b by min/max normalization, attached warning, preserved source bounds.
- Expanded source pilot: Smithsonian NMNH Anthropology official API query returned 13,281 matches; first 3 reviewed/imported. Main corpus now 2,746 records across 13 source-collection labels; not a museum census.
- Current dataset `v1-108ed1654c7f`; 5,890 input-row references, 2,708 distinct item-linked assets byte-verified, all 2,760 viewer images externalized.
- Full-catalog Pitt Rivers expansion remains blocked by maintenance and editorial robots HTTP 403; future acquisition is documented in docs/MUSEUM_INGESTION.md. This does not block the verified cached pilot.
- Morphology regenerated as PDF/SVG/PNG with 2,600 shape rows and 146 records without features. ML roadmap and experiment-manifest/config templates delivered without training.

- Final metadata correction preserves all 544 complete Boerhaave CSV rows and original museum source-layer declarations. Available source retrieval dates now carried to records. Final release `v1-108ed1654c7f`: 5,890 source-row references; no ID changes.

- Final source implementation `1dd77e8` pushed to `raprakashvi/local_tinkering`, branch `vestigium-2026-10-21`; remote main left unchanged. Final website code/data `114c028` pushed on personal-site `master`.
- Final live acceptance: 29 Chromium checks passed against `v1-108ed1654c7f`, 0 exceptions, 0 HTTP errors; right/wrong/missing-config access, mobile, details, comparison and morphology verified. Personal website checker: 0 failures, 0 warnings; all changes scoped to collection folder.
- Frozen-release morphology replay produced byte-identical PDF/SVG/PNG. Docs-only handoff commits may follow the implementation commits above; no current-phase implementation work remains. Blocked/deferred source expansion and later training are listed explicitly above.


## Follow-up: bounded access recovery and morphology comparisons

User requested another access attempt, a slow crawl if useful, then progress to the next point.

| # | Status | Work and verification |
|---|---|---|
| 10 | complete | Recheck official Pitt Rivers interfaces and robots behavior; try <=10 public editorial pages at >=2 s/request; actual content denials/429 stop the host. Preserve responses and scope. |
| 11 | complete | Expand an accessible official API source with a small request budget; retain original IDs/provenance, report discoveries/duplicates/failures and source restrictions. |
| 12 | complete | Add stable-ID nearest-shape comparisons using existing audited distances, with table access and clear distance semantics; no substantial training. |
| 13 | complete | Rebuild, validate, verify representative browser tasks, commit and publish the bounded update without changing main-site files. |

- Follow-up: robots-file 403 is handled as unavailable under RFC 9309, while actual page denials/429 still stop the host. Five public editorial pages fetched at >=2 s/request, adding 45 Pitt Rivers records. Three bounded Smithsonian API requests added 35 records; one cultural-review exclusion. Current dataset has 2,826 records, source totals Pitt Rivers 50 / Smithsonian Anthropology 38.
- Exported 41,600 ranked shape-neighbor edges for 2,600 specimens, with global and other-collection pools; original top-8 distances verified. No training performed.

- Follow-up local verification: 6 access/cache regression tests pass; all 2,826 records validate; 5,970 source-row references reconcile; all item-linked image hashes resolve; 32 Chromium checks pass including nearest/cross-collection matches, 0 exceptions or HTTP errors. Publishing underway.

- Follow-up live acceptance: 32 checks passed on `v1-5ea6e0e1e84c`, no exceptions or HTTP errors. Website implementation `cca42f5`, source implementation `413eb16`; source offsets now documented for resumable API requests. Main-site checker still reports zero failures/warnings.

## Follow-up: review pilot and image readiness

User authorized the next recommended step: review tools, a diverse 150-record pilot,
image follow-up, leakage controls, and evaluation preparation. No model training.
Recoverable source checkpoint: commit `91f7718`; website checkpoint `91b3ea9`.
Existing canonical dataset remains frozen at `v1-5ea6e0e1e84c` unless verified assets change it.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 14 | complete | Freeze deterministic 150-record pilot and conservative leakage groups; publish sampling/coverage and provisional group splits. Verify repeatability, stable references, no group crosses splits, no fabricated labels. |
| 15 | complete | Investigate missing images in all 88 imported records, including the latest 80. Produce source-linked acquisition queue and bounded access report; accept only explicitly associated images. |
| 16 | complete | Add accessible Review & annotate view with local persistence, independent function states and shape/mechanism/function pair judgments, evidence, revision history, JSON export/import and offline validation. Verify round trips, schema failures and conflicts; judgments remain separate from museum facts. |
| 17 | complete | Prepare masked evaluation exports and disagreement queue, document two-reviewer/adjudication protocol and training prerequisites. Verify empty reviews produce no ground-truth labels or quality claims. |
| 18 | in progress | Run integrity, deterministic pipeline and desktop/mobile browser checks; commit and publish review workflow, verify live, preserve personal website. Distinguish workflow delivery from human reviews still required. |

- Review delivery: 150 unreviewed records across all 13 collection labels (30 imports/120 existing), 297 independent shape/mechanism/function pair tasks, 2,818 conservative leakage groups, one representative per group. Seed 17; frozen pilot `pilot-aa58d2739f53` references dataset `v1-8a2634871c59` and hashed builder/group assignments. No known group crosses provisional splits; all training eligibility remains false.
- Image follow-up: two exact-accession Pitt Rivers photographs recovered and byte-verified (1942.12.62 and 1995.20.1). No new IDs or physical measurements. Queue covers all 88 imports and flags the latest 80. Smithsonian detail-page content returned HTTP 403: host stopped, second page not fetched. Remaining 86 imports, including all latest 80, lack local images; this source-dependent gap remains blocked.
- Review evidence: six offline pipeline/history/mask tests and six access/cache tests pass. Local Chromium: 19 review checks and 32 collection checks pass with zero uncaught exceptions; existing collection checks have zero HTTP errors. Review checks use synthetic fixtures removed afterward. Save/reload, multi-label states, pair dimensions, source reveal, revision ancestry, exact import deduplication, incompatible version rejection, conflict retention, unsaved changes and quota failure verified on desktop/mobile.
- Offline export with zero reviews produces 150 rows with null labels, false observed masks and zero eligible training rows. Independent expert reviews, duplicate/cultural/rights audits and adjudication remain required before experiments. No training performed; no review notes uploaded.

| Remaining task | Status | Blocker / next action |
|---|---|---|
| Independent review of the 150-item pilot | blocked (human input required) | Two knowledgeable reviewers must supply actual evidence-based judgments; no expert labels fabricated. Follow docs/REVIEW_WORKFLOW.md. |
| Remaining museum images | blocked (source-dependent) | 86 imported records have no accessible, explicitly verified local image. Latest 80 all remain in acquisition queue. Smithsonian detail page returns 403; modern Pitt catalogue maintenance persists. |
| Shared review server and adjudication UI | pending (deferred) | Browser-local histories and offline conflict reports are delivered. A centralized write backend and human adjudication workflow are later work; GitHub Pages remains static. |
