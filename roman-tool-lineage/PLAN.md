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
| 18 | complete | Run integrity, deterministic pipeline and desktop/mobile browser checks; commit and publish review workflow, verify live, preserve personal website. Distinguish workflow delivery from human reviews still required. |

- Review delivery: 150 unreviewed records across all 13 collection labels (30 imports/120 existing), 297 independent shape/mechanism/function pair tasks, 2,818 conservative leakage groups, one representative per group. Seed 17; frozen pilot `pilot-aa58d2739f53` references dataset `v1-8a2634871c59` and hashed builder/group assignments. No known group crosses provisional splits; all training eligibility remains false.
- Image follow-up: two exact-accession Pitt Rivers photographs recovered and byte-verified (1942.12.62 and 1995.20.1). No new IDs or physical measurements. Queue covers all 88 imports and flags the latest 80. Smithsonian detail-page content returned HTTP 403: host stopped, second page not fetched. Remaining 86 imports, including all latest 80, lack local images; this source-dependent gap remains blocked.
- Review evidence: six offline pipeline/history/mask tests and six access/cache tests pass. Local Chromium: 19 review checks and 32 collection checks pass with zero uncaught exceptions; existing collection checks have zero HTTP errors. Review checks use synthetic fixtures removed afterward. Save/reload, multi-label states, pair dimensions, source reveal, revision ancestry, exact import deduplication, incompatible version rejection, conflict retention, unsaved changes and quota failure verified on desktop/mobile.
- Offline export with zero reviews produces 150 rows with null labels, false observed masks and zero eligible training rows. Independent expert reviews, duplicate/cultural/rights audits and adjudication remain required before experiments. No training performed; no review notes uploaded.

| Remaining task | Status | Blocker / next action |
|---|---|---|
| Independent review of the 150-item pilot | pending (deferred by user) | Later validation step. Website, source enrichment and exploratory analysis proceed with explicit provisional working annotations; no human review requested now. |
| Remaining museum images | blocked (source-dependent) | 86 imported records have no accessible, explicitly verified local image. Latest 80 all remain in acquisition queue. Smithsonian detail page returns 403; modern Pitt catalogue maintenance persists. |
| Shared review server and adjudication UI | pending (deferred) | Browser-local histories and offline conflict reports are delivered. A centralized write backend and human adjudication workflow are later work; GitHub Pages remains static. |

- Review workflow deployed and live-verified: dataset `v1-8a2634871c59`, pilot `pilot-aa58d2739f53`; 32 collection checks + 19 review checks pass on the hosted URL, zero uncaught exceptions and zero collection HTTP errors. Live review modules, pilot and both recovered image bytes match the local artifact. Synthetic browser judgments removed.
- Source implementation `50bac76` pushed to `raprakashvi/local_tinkering`, branch `vestigium-2026-10-21`; website implementation `3286ffa` pushed on personal-site `master`. Existing personal-site tracked files verified byte-identical; site checker has zero failures/warnings. Final documentation/evidence commits follow these implementation references.
- Current delivery is implemented, locally tested and deployed. Actual expert annotation/adjudication and restricted-source image acquisition remain explicit blockers; model training remains deferred. Review protocol notes single-tab editing and browser-local export/backup limits.

## Current priority: finish enrichment and simplify the later review workflow

User clarification: human review is deferred and does not block website, dataset,
source expansion or descriptive analysis. Use existing evidence and explicit working
interpretations now. Never promote contextual guesses to source facts or expert labels.
Recoverable checkpoints: source `4f234f7`, website `47996c3`.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 19 | complete | Reassess remaining work; replace human-review blocker with deferred status. Publish a current remaining-work report with source-specific blockers and completion conditions. |
| 20 | complete | Apply reproducible contextual working annotations and conservative source-text enrichment across the collection; retain original wording and evidence locators, distinguish inferred category/function/mechanism from documented claims, export missingness and coverage. No trained models or fabricated negatives. |
| 21 | complete | Extend a feasible official museum adapter through shared cache/retry/duplicate infrastructure; bounded inclusion, provenance, images where accessible, explicit discovered/imported/skipped/failed scope. Keep inaccessible sources documented. |
| 22 | complete | Overhaul review workspace for later use: image-first compact layout, function chips and explicit state toggles, separate pair rating buttons, fast skip/save-and-next, keyboard/mobile usability, progressive evidence and backup controls. Keep existing review histories compatible where release matches. |
| 23 | complete | Publish working-annotation analysis coverage and searchable evidence modes; refresh morphology against final release, document what remains unknown. Verify deterministic labels, schema, assets, frozen exports and browser paths. |
| 24 | complete | Commit, deploy and verify live; update checklist and handoff with remaining source-dependent work and later research tasks. No request for human review now. |

- Current acceptance audit: docs/PHASE_STATUS.md covers every Phase 1–6 acceptance area, remaining gaps and evidence paths. Human review is deferred, not an operational blocker.
- Enriched release `v1-804c1e7c3202`: 2,830 records, 5,974 reconciled source references, 2,718 distinct item-linked assets; 2,621 provisional contextual function assignments and 209 unassigned records; 21 explicit material extractions. Original 2,826 raw records, descriptions, dates and function fields remain unchanged. Eight function categories are reported, including zero supported crushing assignments; missing functions are not negatives.
- Cleveland expansion: four comparative tools and eight official CC0 image views; 32 query entries inspected, 28 excluded. Shared Fetcher, bounded 12-request initial run at >=2-second intervals; cached replay is byte-stable and reports four duplicates, zero new network requests. No complete-catalog claim.
- Morphology: five supplemental main-view outlines pass automatic QC, one broad-blade case fails and stays excluded with its mask/reason. Plot/table/CSV now cover 2,605 outlines; original 2,600-object neighbor matrix remains unchanged. Masks were visually inspected by the implementation agent; no physical calibration or independent expert validation claimed.
- Review redesign: image-first layout, function chips and independent Yes/No/Unsure/Clear controls, separate pair rating buttons, Save & next and Skip, compact evidence/backup settings, keyboard groups and mobile layout. No decision dropdowns. No human review requested; no expert labels fabricated.
- Local acceptance: 18 Python tests pass, 39 Chromium collection checks and 24 review checks pass, no uncaught exceptions or collection HTTP errors. Six Firefox 158 smoke checks also pass (gate, login/browse, toggles, mobile width, morphology). Independent screen-reader/Safari and full Firefox workflow audits remain deferred.
- Initial browse payload measured: 8,970-byte HTML, 1,453,820-byte decoded search index, 24 cards and zero detailed-record shard requests. This is a measured local payload check, not a production concurrency benchmark.

- Current implementation deployed and live-verified: source implementation `c559c08`, website implementation `4cf9ebe`. All 39 collection + 24 review checks and six Firefox smoke checks pass against the live URL. All new source image bytes, current collection/review/analysis modules, working coverage and frozen pilot match the verified artifact. Personal-site tracked files remain unchanged; site checker passes.
- Frozen release `v1-804c1e7c3202` reproduces both morphology and working-function PDF/SVG/PNG figure files byte-for-byte (six files). Detailed evidence: results/tables/reproducibility_verification.json and live_delivery_verification.json. Source cache replay remains offline/idempotent.
- Tasks 19–24 are implemented, locally tested and deployed. Remaining work is explicitly source-dependent acquisition/expansion, more outline coverage and a separately recalibrated neighbor matrix, independent screen-reader/Safari/full-Firefox audits, later human validation and later model experiments. Human review is deferred and does not block the current website/data delivery. No training or automatic weight upload performed.

## Restore the research workspace and unify Vestigium

User correction: the redesign hid essential research views and increased the amount
of introductory text. Preserve the original offline archive and all research modules.
Checkpoint: source `f6e06f5`, website `c7a99de`; dataset `v1-804c1e7c3202`.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 25 | complete | Audit original and current interfaces; restore the rich atlas as the main page with visible Family tree, World & time, Morphology, Collection and comparison navigation. Preserve source studies, scans, exports and historical links. Verify direct links and browser Back. |
| 26 | complete | After 25, unify Vestigium branding, colors, typography and navigation across research and collection pages. Remove promotional headings and long explanations above visualizations; retain methods through expandable controls. Inspect desktop and mobile screenshots and overflow. |
| 27 | complete | After 26, add family/region/collection color encoding, counted legend and matching table labels to the updated outline plot; keep the richer original morphology controls visible. Verify filtering, coverage, selection links and non-color alternatives. No recomputed distance matrix or physical calibration implied. |
| 28 | complete | Write an implementation-ready ML handoff for another agent: supervised, unsupervised and provisional self-annotation tools; explicit provenance, confidence, missing-label masks, leakage controls and acceptance tests. No substantial training in this delivery. |
| 29 | complete | After 25–28, verify original tree/map/morphology/evidence workflows alongside collection/review on desktop and mobile, run integrity checks, fix regressions and document limits. Dataset version and historical scientific content must remain unchanged. |
| 30 | complete | After 29, commit source, push authorized branch, deploy only the personal-site subpage, verify live behavior and update handoff/checklist. Distinguish local checks from live checks. |

Remaining research work: full Pitt Rivers catalog access; broader source acquisition;
more verified images and outlines; separately versioned expansion/recalibration of the
shape-distance matrix; later human validation and local ML experiments. These are
independent of restoring the delivered research interface.

- Restoration locally verified: 45 atlas checks (tree/zoom/selection, map/time/keyboard, five morphology workspaces, ten original evidence sections, Back, compatibility links, colors/counts and mobile widths); 39 collection checks; 24 review checks; six Firefox smoke checks; 18 Python tests. No uncaught Chromium exceptions or HTTP errors in atlas/collection workflows. Screenshots inspected at 1440×1050 and 390×844.
- Integrity: all 2,830 records validate; 5,974 source references reconcile; 2,718 linked assets hash-verify; reordering retains IDs and release; no plaintext credential enters the artifact. Dataset remains `v1-804c1e7c3202`. Original offline HTML archives remain unchanged.
- The ML implementation handoff is `docs/ML_AGENT_HANDOFF.md`; no ML tools or substantial training are claimed as delivered by this documentation task.
- Known performance limit: the rich atlas still bootstraps approximately 9 MB of catalog JSON plus 1.5 MB of morphology data; the scalable collection browser remains separate with a 1.45 MB search index and record shards. Future module/data splitting must preserve first-class research tools.

- Restoration is implemented, locally tested, deployed and live-verified. Source implementation commits: `e108523` (restored workspace/ML handoff) and `888891d` (mobile map refinement), pushed to `vestigium-2026-10-21`. Website implementation: `2557afb` on `master` (following initial restoration deployment `f8101bc`). The separately deployed crawler rules from `44ee007` are preserved.
- Live acceptance: 45 atlas + 39 collection + 24 review checks and six Firefox smoke checks pass. Atlas and collection workflows have zero uncaught exceptions and zero HTTP errors. Thirty-one live interface, method and analysis files match the verified artifact; personal homepage returns HTTP 200. All personal-site tracked files outside the collection, including current robots rules, were preserved by scoped deployment.
- Final evidence/checklist publication changes documentation and reports only. ML training, expanded-distance fitting and complete museum acquisition remain outside the completed restoration; the pending research work listed above remains explicit.

## Full website design overhaul and delegated ML tooling

The earlier restoration repaired missing navigation. The full Website interface overhaul is **implemented and live-verified**. Independent
accessibility/browser audits and the broader research work remain open. Acquisition, morphology expansion and the
broader research tasks remain open. Checkpoint: source `cb22a7e`, website `f0ada82`.
Dataset `v1-804c1e7c3202` and original offline HTML remain frozen.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 31 | complete | Audit screen hierarchy, CSS, navigation and startup payloads. Define a cohesive workbench design and preserve a feature inventory covering all tree/map/morphology/evidence/collection/review paths. |
| 32 | complete | After 31, replace the duplicated shell with one shared sidebar, top bar, navigation and mobile drawer. Apply a new slate/cobalt UI palette, self-hosted typography, coherent surfaces, controls and focus states; retain scientific category meanings. |
| 33 | complete | After 32, redesign tree, world/time and morphology workspaces around the visualization, compact contextual controls and useful inspection panels. Preserve original source studies, comparison paths, exports and compatibility URLs. |
| 34 | complete | After 32, redesign collection search/results/cards, item details, comparisons, review and access screen. Keep stable IDs, evidence distinctions, loading/empty/error states and local review histories. |
| 35 | complete | After 33–34, remove unnecessary startup data where safely separable; measure before/after payloads. Verify visual layouts, keyboard/mobile navigation, all original workflows, gate and record integrity. Publish screenshots and explicit remaining audit/performance limits. |
| 36 | complete | After 35, commit and push source, deploy only the existing subpage, verify live, publish the final design checklist and remaining project tasks. Preserve personal-site content and crawler rules. |
| ML | complete (bounded tools; later experiments open) | Agent `ml_tools` implements local manifest/retrieval/unsupervised/provisional-annotation tools and supervised scaffolding from docs/ML_AGENT_HANDOFF.md. Separate ML checklist and regular milestone/blocker reports. No substantial training or automatic downloads/uploads. |

Design direction: a research workbench with persistent grouped navigation, cool neutral
surfaces, dark slate text, cobalt interaction states and restrained categorical colors.
Use a compact content header and show visualizations before extended methods. Desktop
uses a sidebar; mobile uses an accessible drawer and full-width content. One shared
shell and token source replace accumulated presentation overrides.

- Delegated ML implementation reviewed and committed as `d1ac708`: 21 dedicated tests pass; actual 2,830-record CPU run and eight-view frozen-ResNet18 GPU smoke/cache replay verified. Existing RTX 5080 / Conda `endosrt` reused; no environment creation, download, substantial training or upload. Extended image/multimodal/category/model evaluation remains open. Agent milestone reports and exact commands/results are retained in ML_IMPLEMENTATION_STATUS.md, ML_TOOLS.md and results/ml/baseline_smoke.json.
- Website local regression so far: 45 atlas + 39 collection + 24 review checks, plus 41 workbench checks covering real pointer/keyboard interaction, mobile focus, progressive filters, list view, deferred museum failure/retry and full export reconciliation. Eighteen website Python tests pass. Final cross-browser, responsive and live verification are still in progress.

- Final local acceptance: 49 workbench + 45 atlas + 39 collection + 24 review checks and six Firefox smoke checks pass. Tested widths: 320/390/768/1024/1440; desktop/mobile screenshots inspected. Deferred museum recovery preserves 2,636 mergeable records, sources and full JSON exports. Initial decoded research JSON falls from 11,127,968 to 3,896,513 bytes (65.0%); no change to the frozen dataset or original offline HTML. Independent AT/Safari/full-Firefox audits and larger-corpus performance work remain open.

- Full workbench overhaul deployed and live-verified: source `ebba293`, ML baseline tools `d1ac708`, website implementation `9ee153e`. Source branch `vestigium-2026-10-21`; website branch `master`. Final evidence publication follows these implementation commits.
- Live acceptance: 49 workbench + 45 atlas + 39 collection + 24 annotation checks and six Firefox checks pass, with no uncaught Chromium exceptions or HTTP errors. Forty-one interface/font/data/documentation files match the verified artifact. Personal homepage returns 200; all personal-site tracked content outside the subpage and existing crawler rules are preserved.
- Tasks 31–36 and the bounded delegated ML tool delivery are complete. The overall project remains open: independent screen-reader/Safari/full-Firefox and researcher usability audits; further corpus scaling; full Pitt access and acquisition; additional images/outlines and a recalibrated matrix; expanded image/multimodal/category models and independent evaluation. Human review remains deferred, and no substantial model training or automatic weight upload occurred.

## AI Methods: connect completed local results to the website

Checkpoint: source `78f5269`, website `83cc977`; frozen dataset unchanged.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 37 | complete | Export actual verified baseline results into versioned, public-safe, lazy-loaded shards. Check run/release hashes, IDs, duplicate exclusion, counts, score direction and missing modalities. Preserve canonical records and publish provenance; no weights or local paths. Delegated exporter to `ml_tools`. |
| 38 | complete | After 37, add Research → AI Methods in both shells. Implement record-linked text/shape retrieval, bounded image retrieval, color-coded exploratory clusters with accessible tables, eight-state provisional function evidence and run/method details. Keep source truth separate; no new training. |
| 39 | complete | After 38, verify actual query/rank/state reconciliation, comparison links, filters, pagination, error/retry and no-result states; responsive/keyboard checks and screenshots; regression-test existing research/collection routes and data integrity. Document exact coverage and limits. |
| 40 | complete | After 39, commit/push the source branch, deploy only the subpage, verify live AI interactions and personal-site preservation, and publish updated handoff/evidence. Distinguish implemented, tested and deployed. |

- AI Methods implemented and locally verified so far: 42 Chromium interactions and 14 Firefox smoke checks; 34 website/exporter Python tests and 21 ML tests pass. All 2,830 records, 5,974 references and 2,718 assets verify; stable IDs/release survive reordering. Result coverage reconciles and browser checks exercise SHA-256 rejection/retry. Existing atlas/collection/review/workbench regressions and live deployment follow.

- Final local AI acceptance: 44 Chrome checks, 14 Firefox smoke checks, 34 website/export tests and 21 ML tests pass. Desktop/mobile screenshots inspected; initial AI result fetch is 1065464 decoded bytes (one result shard plus manifest/index). All 49 workbench, 45 atlas, 39 collection and 24 review regression checks pass. Current source and dataset originals remain intact; live publication is in progress.

- AI Methods is implemented, locally tested, deployed and live-verified at https://raprakashvi.github.io/roman-tool-lineage/collection.html#ai. Source implementation `dc11c84` is pushed on `vestigium-2026-10-21`; website implementation `b81a68d` is pushed on `master`. Final evidence-only publication follows. All 44 AI + 49 workbench + 45 atlas + 39 collection + 24 annotation Chrome checks and 14 Firefox smoke checks pass live, with no uncaught Chrome exceptions or unexpected HTTP errors. Eighty-six live interface/analysis files, including every AI result JSON, match the verified artifact. Personal homepage returns 200; personal-site content and existing crawler exclusions are preserved.
- Tasks 37–40 are complete. Overall research tasks remain open: full Pitt catalog access and broader acquisition; more verified images/outlines and a separately recalibrated distance matrix; expanded image/multimodal/category experiments and independent evaluation; independent accessibility/usability audits. Human review is deferred. This integration did not train a substantial model or publish weights.

## Control prominence and AI Methods layout refinement

Checkpoint: source `aa98630`, website `0de3bfb`. Dataset and ML results unchanged.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 41 | complete | Enlarge key research checkboxes; emphasize “Include museum items” with a 22px native control, generous label target, count badge and checked/focus states. Preserve keyboard behavior and deferred loading/retry. Check desktop/mobile sizes and actual toggling. |
| 42 | complete | Simplify AI Methods into clear section navigation and a query/result workspace. Move aggregate counts into run details; bring results higher on desktop/mobile. Preserve all retrieval, cluster, evidence, export and error states. Inspect screenshots and existing AI workflow checks. |
| 43 | complete | After 41–42, verify affected research/AI workflows, record results, commit/push and deploy only the subpage. Check live behavior and preserve the personal site. |

- Local refinement verified: 47 AI + 50 workbench + 45 atlas Chrome checks and 14 Firefox smoke checks pass. New checks cover 22px/44px checkbox sizing, whole-label loading, native Space-key toggling, side-by-side AI query/results and relocation of aggregate counts to run details. Desktop/mobile screenshots inspected. All 42 AI JSON files and the dataset manifest are byte-identical to the previous delivery; full integrity verifies 2,830 records, 5,974 references, 2,718 assets and stable IDs on reordering. Live publication follows.

- Refinement is implemented, locally tested, deployed and live-verified. Source implementation `497d2f7` and website implementation `1207986` are pushed. All 47 AI + 50 workbench + 45 atlas Chrome checks and 14 Firefox smoke checks pass live, with zero uncaught Chrome exceptions and unexpected HTTP errors. Eight interface/gate/dataset files match the tested artifact; personal homepage returns 200 and scoped deployment preserves all personal-site content. Final documentation/evidence publication follows; no dataset, ML result or training changes. Tasks 41–43 are complete.

## Deep representations, confounds and evidence-backed hypotheses

Checkpoint: source `aa98630` (+ uncommitted tasks 41–42), dataset `v1-804c1e7c3202` unchanged.
Research code checkpoint `77f263d`. Details: [docs/AI_DEEP_METHODS.md](docs/AI_DEEP_METHODS.md).

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 44 | complete | GPU environment (venv over existing `endosrt`, versions in configs/ml/requirements-gpu.txt); background-controlled views; frozen DINOv2/CLIP/SigLIP 2/E5 features with weight hashes. |
| 45 | complete | Grouped benchmark with confound controls (photography-only control, nuisance R², within-category museum enrichment, held-out-museum probe), group-bootstrap CIs and paired differences; embedding near-duplicate audit merged into leakage groups. |
| 46 | complete | Three-seed photography-randomised adaptation with unseen-museum test and compositing ablation; working-end, zero-shot affordance, cross-modal and disagreement analyses with manual inspection coding; multi-channel hypotheses with calibrated agreement and flags; figures; findings; literature review (delegated). |
| 47 | complete | External historical/contemporary instrument corpus (Wikimedia Commons, Wellcome; delegated) with licences and exclusions; transfer and modern-analog analysis (`scripts/deep/external.py`). |
| 48 | complete | Website: ai-deep export wired into the build; Research → AI Methods tabs for new similarity methods, evidence channels, text search, embedding map and experiments (delegated); regression and new browser checks. |
| 49 | complete | After 47–48: rerun export, verify locally and live, commit/push source and deploy the subpage only; publish evidence. |

- Deep-representation milestone implemented, tested, deployed and live-verified. Source `77f263d` (research pipeline) and `249c6c6` (website + external corpus) pushed on `vestigium-2026-10-21`; website `b8228a2` pushed on `master` (subpage only; personal-site tracked files verified unchanged; homepage 200).
- Local acceptance on the deploy build: 87 deep-AI + 47 AI + 50 workbench + 45 atlas + 39 collection + 24 review Chrome checks; 9 deep, 21 ML, 4 external and 46 website Python tests. Live: 87 deep-AI and 47 AI checks, 0 exceptions, 0 HTTP errors; live `ai-deep/summary.json` byte-identical to the verified build.
- Open research work: expert pair judgments; full-resolution images; review of 147 image hypotheses and 74 conflicts (incl. the Lithotomes `cutting` rule and META-002404); mechanism-aware labels; larger multi-photographer contemporary set and validated external segmentation; explicit historical-relationship tests. Independent screen-reader/Safari audits remain open.

## Focused AI Methods workspace and task search

Checkpoint: source `b30fbb4`, dataset `v1-804c1e7c3202` unchanged. Details: [docs/AI_METHODS.md](docs/AI_METHODS.md) (Focused workspace) and [docs/AI_DEEP_METHODS.md](docs/AI_DEEP_METHODS.md) §5b.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 50 | complete | Reduce similarity to two benchmark-backed methods (Photo = DINOv2-L raw, default; Outline shape) with inline cross-museum P@10, CI, random baseline and enrichment from `method_evidence`; other six behind a collapsed “More methods”. Ranked result list; record browser (category/collection filters, show more, random); compact Evidence verdict with abstentions collapsed. |
| 51 | complete | Search by task: 66-query SigLIP 2 vocabulary (`task-queries-1.0.0`, 9 groups incl. design features and controls) via `scripts/deep/task_search.py`; 26 shared queries must reproduce `crossmodal-latest`. New queries are exploratory and never pooled into F10. |
| 52 | complete | Commit and push source, deploy the subpage only, live verification. |
| 53 | complete | 3D view with catalog date as height for the AI embedding map and Morphology shape space (`app/space3d.js`): range whiskers, compressed/linear time, rotation and presets, fractional-count period histogram; undated records counted, never imputed; Boerhaave collecting caveat on screen. |

- Run `tasksearch-d80e56a358ec`: all 26 shared queries reproduce the saved cross-modal top 20 (cosines within 2e-4; original batch encoded separately because bf16 text embeddings depend on batch composition). 13 new scored queries: mean test P@20 0.658 vs base rate 0.186 (exploratory, written after F10 was seen). Separation SD is not a match signal (controls 2.4–3.0 SD) and is not shown. SigLIP matches object names and visible form rather than clinical function (e.g. “small funnel for the ear” 0.95; vagina-spreading description 0.20, returns obstetric forceps; “dilator” 0.05).
- Local acceptance on the scratch build: 103 deep-AI + 48 AI + 39 collection + 50 workbench + 45 atlas + 24 review Chrome checks, 0 exceptions, 0 unexpected HTTP errors; 40 website and 9 deep Python tests. Firefox smoke and live checks not yet run.
- Next research direction (proposed, not started): design-space discovery grounded in coded mechanism characters and a clinical-need taxonomy (N4), need→design mapping with convergence/exaptation and morphospace gaps, a pre-1850 retrodiction test, and only then a conditional VAE over outline descriptors.
- Deployed and live-verified: source `896e1b7` (focused workspace, task search) and `b5103f0` (3D time view) on `vestigium-2026-10-21`; website `239c84b` on `master` (subpage only; personal-site tracked files verified unchanged; homepage 200). Live: 114 deep-AI, 52 atlas and 48 AI Chrome checks, 0 exceptions, 0 HTTP errors. Collection, workbench and review suites passed locally only (39, 50, 24); Firefox smoke not run.

## Silhouette generation: a pre-registered discovery test

Checkpoint: dataset `v1-804c1e7c3202` unchanged; run `silgen-e605e67faa35`. Details: [docs/AI_DEEP_METHODS.md](docs/AI_DEEP_METHODS.md) §9.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 54 | complete | Pre-register `configs/ml/silhouette_generation.json` (`silgen-1.0.0`; six amendments, all made before training or sampling). Canonical-pose prep of 2,597 outlines with counted cleaning and exclusions. Text- and date-conditioned pixel DDPM (`scripts/deep/silgen*.py`). Held-out model (seed 17) and before-1850 retrodiction model (seeds 17/18/19), evaluated against nearest-name retrieval, same-family random, unconditional and name-only baselines with group-bootstrap CIs, memorisation, coverage, era and clamp subsets; figures. |
| 55 | complete | Website: `ai-deep/generate.json` (hash-verified; packed masks, no weights). New Research → AI Methods → Generated outlines tab with verdicts, prompt gallery, before/after-1850 rows and score tables; browser and export tests. |

- Result: **no evidence of generation beyond retrieval** in either test.
  - Held-out: generator minus retrieval IoU −0.034 [−0.044, −0.024], DINOv2 −0.024 [−0.033, −0.016]; n = 514.
  - After 1850: IoU −0.050 [−0.055, −0.045], DINOv2 −0.059 [−0.065, −0.053]; n = 1,505; 3 seeds.
- Conditioning steers the drawings in distribution: they beat the unconditional model and random same-family outlines on the held-out test. The out-of-range date makes after-1850 drawings worse than name-only ones.
- No memorisation: no generated outline has IoU ≥ 0.9 with any training outline.
- Next (proposed, not started): mechanism-coded characters and the clinical-need taxonomy before any further generative work.
- Deployed and live-verified: website `841ab8e` on `master` (subpage only; personal-site tracked files verified unchanged; homepage 200). Local: 127 deep-AI, 48 AI, 52 atlas, 39 collection, 50 workbench and 24 review Chrome checks; 41 website Python tests. Live: 127 deep-AI and 48 AI checks, 0 exceptions, 0 HTTP errors. `ai-deep/generate.json` is 707 KB (56 KB gzip). Source changes not yet committed.

## Decoding the shape space and the tempo of change

Checkpoint: dataset `v1-804c1e7c3202` unchanged. Details: [docs/AI_DEEP_METHODS.md](docs/AI_DEEP_METHODS.md) §10.

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 56 | deployed (`latdec-6c750b9d3c56`, `tempo-eb35961c30ed`) | Pre-register `configs/ml/latent_decoder.json` (`latdec-1.0.0`; one amendment before any trained decode). Frozen DINOv2-B latent of the pose-normalised outlines; a diffusion decoder trained on the train split. Tests: (1) reconstruction of held-out tools vs nearest training latent (decision rule); (2) paths between tools and Gaussian prior draws: do sparse regions decode to outlines that re-encode where asked; (3) paleoTS-style stasis / random walk / trend / one-jump comparison per family, now `configs/ml/tempo.json` with OU and model recovery. Result: decoder ≈ lookup (no gain); paths between tools stay in occupied latent space; jumps only in grasping tools and weak. |
| 57 | deployed | AI Methods silhouette map rebuilt from the pose-normalised latent (`maps-f2935ececfca`; 2,597 records), so photographed angle, mirror and scale no longer place points. Silhouette retrieval, evidence and multimodal fusion still use unrotated masks: switch after re-benchmarking. |
| 58 | deployed | Website: Generate tab split into three views (From a name · From the shape space · Gradual or jumps?), each opening with a method flowchart; long text folded into details. `ai-deep/latent.json`, browser and export tests. Flowchart figures `results/figures/deep_flow_*` via `visuals/flow.py`. |
| 59 | deployed (`mapdecode-2c9674c83fda`) | Hover preview: on the 2D outline-shape map, the side panel shows the real tool on a point, or else the decoder's outline for the 64 × 64 grid cell under the pointer (tiles loaded on demand; zoom and pan) (inverse UMAP, labelled as a blend or a guess far from tools) and the closest real tool. 3D view: not yet. |
| 60 | deployed | Plain-language pass for history and museum readers: "Map of tools" with one-sentence layer explanations and the outline map as default; Generate opens on "Fill the gaps?" / "Gradual or jumps?"; Input → Step → Output flowcharts; name-based generation demoted (names differ between museums); tempo cards with pattern pictures, plain verdicts, axis-end outlines and a stated evidence rule. Similar tools, Search by task, Evidence and Experiments reworded the same way; "Photo, object only" (adapted) is the default photo method. |
| 61 | deployed | Between-dates test (`configs/ml/between.json`, `between-0b9336a35ba9`): are 1750–1850 (primary, user-proposed) and 1800–1900 (alternative) outlines in between earlier and later ones in shape? Grasping: change mostly after 1900, driven by a growing share of artery forceps / clamps (exploratory). Probes in between; specula already late. On the website under Gradual or jumps?. |

- Deployed and live-verified on 2026-10-27: source `94f8bef`, `39c7a99`, `fe31440` on `vestigium-2026-10-21`; website `c3bc91a` on `master` (subpage only; personal-site tracked files verified unchanged; homepage 200). Local: 45 Python tests; 164 deep-AI, 48 AI, 52 atlas, 39 collection, 50 workbench and 24 review Chrome checks. Live: 164 deep-AI, 48 AI and 52 atlas checks.
- Done as task 69 (`posebench-a22875acfcb0`): the pose-normalised outline beats the photographed outline but not the adapted model, so it is offered as "Outline, any angle" rather than the default. Switching the evidence channel and fusion to it is a separate, untested change.

## Standard ingestion and one pipeline for new museums

Goal (2026-10-27): a museum gives us a website link, an API/IIIF endpoint or a PDF catalogue; we describe it in one small source file, fetch it politely, get standard records, and one command reruns everything downstream, including retraining. Priorities from the user: website catalogue links, API/IIIF, PDF catalogues; standardisation matters more than clever parsing (odd sources may use a small custom parser that emits the same standard records).

| # | Status | Dependencies, acceptance and verification |
|---|---|---|
| 62 | done | Intake format `data/schema/intake-v1.schema.json` and source files `data/sources/<id>.yaml` (documented in `data/sources/README.md`). Every fetched record is kept; excluded ones carry a reason. |
| 63 | done (13 offline tests; Cleveland golden test reproduces the earlier import exactly with 0 network requests) | Generic engine `scripts/ingest/`: polite cached fetcher (robots.txt, per-host interval, request budget, stop on 401/403/429, offline replay by default), adapters `api`, `iiif`, `html`, `custom`; normalisers for dates, dimensions and tool family. Offline fixture tests for each adapter; golden test: the Cleveland source re-expressed as `data/sources/cleveland.yaml` reproduces the existing records from the frozen cache. |
| 64 | done (golden test: 544 records equal `data/processed/boerhaave/objects.csv` in object number, kind, dates and images; 0 network requests) | Boerhaave as a `custom` source (`data/sources/boerhaave.yaml`, `scripts/ingest/sources/boerhaave.py`): PDF cards (refused if a PDF's hash differs from the frozen parse) → one catalogue record per card through the shared fetcher, parsed by the existing `boerhaave_records.parse_record`. Earlier downloads join the cache through their access logs (`frozen:`; bytes must match the logged hash). 479 single instruments included; 65 kits, prints and documents kept with a reason. |
| 65 | done (release unchanged at `v1-804c1e7c3202`; 2 tests) | `dataset.py` reads `data/intake/*/records.jsonl`. Included records whose accession or intake key is already in the release are linked, never rewritten (479 Boerhaave + 4 Cleveland); new ones become items with permanent IDs, parsed dates and dimensions, rights and content-addressed images (`images/intake/<sha256>`). Counts per source in `results/tables/dataset_coverage.json` (`intake`). The manifest lists an intake file as a source only when it adds records. |
| 66 | done (views); not needed yet (embeddings) | `scripts.deep.views` reuses rows and pictures of unchanged images (same views version and segmentation code); a full recompute gives byte-identical output (2,716 images, 54 s). Frozen embedding takes 3–9 s per encoder for the whole set, so it is not cached. Retraining stages rerun whenever their data change. |
| 67 | done (end-to-end run: ingest → release → tests → site → 6 browser suites, all passing) | `python -m scripts.pipeline status / run / adopt`, stages in `configs/pipeline.yaml`. A stage reruns when its code, config or upstream key changes; ingest and release are keyed by their output, so a re-ingest that gives the same records reruns nothing downstream. `adopt` recorded the existing ML results as current only after checking that each was computed on the current release. Logs in `results/pipeline/logs/`; publishing stays a separate, explicit step. |
| 68 | waiting for a new museum | Unseen-museum stage: score a newly added museum with the models trained without it (cross-museum P@10, museum signature) before it joins training. The method exists for Region Skåne (`no-skane` adaptation, §2 of `docs/AI_DEEP_METHODS.md`); it becomes a pipeline stage with the first new museum, which is needed to test it. |
| 69 | done (`posebench-a22875acfcb0`, pre-registered) | Pose-free outline: +6.2 points cross-museum P@10 over the photographed outline [4.3, 8.0], least photography of any option (background R² −0.64), but 11–14 points behind the adapted model, so not the default. Offered on the website as "Outline, any angle". `docs/AI_DEEP_METHODS.md` §11. |
| 70 | done | Website: every trend plot (tempo cards, between-dates cards, shape-space and training charts) has an Enlarge button that opens the whole card magnified, with zoom, pan and Escape to close. |
