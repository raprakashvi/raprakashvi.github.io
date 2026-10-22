# Current phase acceptance and remaining work

Updated 2026-10-21. Human review is deferred at the user's request. It is not a blocker
for collection development, contextual enrichment or descriptive exploration. Working
assignments are provisional hypotheses with explicit evidence and rules, not expert
judgments or verified use. Substantial model training is also deferred.

## Acceptance audit

| Phase | Implemented and verified | Limits and remaining work |
|---|---|---|
| 1 — Hosting/access | Git-managed Pages subpage, username/password interface gate, salted verifier, noindex, unlisted navigation/sitemap, original personal site preserved; backup/update/rollback documentation | The user-approved public Pages override applies: static data/images remain public. This is not private hosting or protected-asset authentication. |
| 2 — Research website | Restored primary family tree, world/time maps and all original research studies; browse, details, compare, color-coded morphology, methods; category/function/material/context/period/source search filters; documented vs working evidence mode; multiple previews, source provenance, citations, related records; missing/loading/empty/error states; responsive desktop/mobile and keyboard controls; shared contrast-tested palette; lazy images, shards and pagination | Six local Firefox smoke checks also pass. Independent assistive-technology and Safari checks remain pending; the full Chromium workflow suite has not been replicated in Firefox. Collection search downloads a compact index, while detailed records/images load on demand. The rich original atlas still bootstraps a larger research payload; see DESIGN_RESTORATION.md. A much larger corpus may need a compressed or partitioned search index. |
| 3 — Structured dataset | Stable META IDs, append-only aliases, versioned schema/releases, originals, field provenance, explicit unknowns, separate documented/interpretation/prediction fields, multiple functions/images, image IDs/checksums/rights and separate training eligibility, deterministic ZIP exports, duplicate grouping, validation/count reconciliation | Contextual functions and mechanisms are explicitly provisional. Historical/source terminology remains intact. Near-duplicate crops, kits and undocumented object aliases need later audit; exact hashes are not exhaustive duplicate detection. |
| 4 — Museum expansion | 50 Pitt Rivers editorial accession records; 38 Smithsonian Anthropology records; four Cleveland comparative-tool records with eight official CC0 image views; shared cache/retry/budget infrastructure, accession deduplication, coverage and exclusion reports | Full Pitt catalogue remains unavailable in the last official probe; Smithsonian object-page media access returned 403. These are bounded samples, not censuses. Of the original 88 imports, 86 still lack local images, including the latest 80. New Cleveland records have their images. |
| 5 — Morphology | Versioned interactive aspect/solidity plot, filters, hover previews, stable links, comparisons, CSV table, PDF/SVG/PNG figures, explicit units/methods/QC and no physical calibration; 2,600 original shapes plus five new outlines passing automated QC; original 41,600 ranked neighbor edges retained | One of six new main views failed automated QC and remains excluded with a retained mask/reason. Original multiblock distance ranks cover 2,600 specimens; supplemental outlines are not silently inserted into that matrix. Pose, background, segmentation and uncertainty remain explicit. No trained embeddings or ancestry claims. |
| 6 — Future ML | Research proposal separates retrieval, category, multi-label function, hypothesis generation and surgical-evolution questions; simple/frozen baselines, attention/transformer autoencoders, modality comparisons, leakage controls, metrics/uncertainty/ablations, local compute, tracking/manifests/checkpoints and explicit versioned upload policy | Proposal and experiment contracts are delivered, with an implementation-ready ML_AGENT_HANDOFF.md for the next agent. Actual expert validation, supervised training, pretrained-weight extraction/fine-tuning and uploads are later work. No weights or restricted data are uploaded automatically. |

## Remaining tasks, in priority order

1. **Source-dependent image and catalogue acquisition.** Retry official Pitt maintenance
   status later; obtain a usable official catalogue/API/export. For Smithsonian, use
   supported media endpoints when available; do not bypass 403 responses. The image
   queue names every missing import. Continued bounded API expansion is possible through
   saved query offsets; sustained Smithsonian/Te Papa harvesting needs the appropriate key.
2. **Additional collection expansion.** Cleveland's narrow pilot is operational. Continue
   its cached query offsets within inclusion criteria. Swedish existing specimens are
   preserved; a larger Europeana frame needs current API access and documented scope.
   Do not describe the first relevance-ranked page as complete coverage.
3. **More shape coverage and improved segmentation.** Acquire object-specific images,
   retain failures, and test additional views. Expanding the multiblock distance matrix
   requires a separately versioned recalibration of all blocks; current supplemental
   aspect/solidity results already use the updated release.
4. **Independent accessibility audit.** Screen-reader and Safari testing remain pending. Six local Firefox smoke checks pass; the full workflow suite in Firefox is still a later check. Desktop/mobile Chromium, keyboard behavior and contrast are checked locally
   and after publication; these checks do not replace an independent audit.
5. **Later human validation.** The redesigned review page is ready when desired. No action
   from reviewers is requested now. Contextual assignments support the current website
   and exploration; their scientific validation can follow dataset completion.
6. **Later ML experiments.** Start with simple baselines on a frozen, eligible dataset,
   then compare frozen representations and small autoencoders. Keep predictions separate
   and hypotheses uncertain; validate before claiming function or evolutionary relations.

A shared annotation server, authenticated protected assets and automatic weight upload
are outside this approved static-hosting phase. The browser review workflow supports
local drafts and JSON export/import; it does not claim centralized collaboration.

## Evidence and handoff map

- Site: https://raprakashvi.github.io/roman-tool-lineage/
- Access configuration/maintenance/rollback: [OPERATIONS.md](OPERATIONS.md).
- Ordered tracked work and commit references: [../PLAN.md](../PLAN.md).
- Schema, stable identifiers, releases: [DATASET.md](DATASET.md).
- Inclusion and source access: [MUSEUM_INGESTION.md](MUSEUM_INGESTION.md),
  [CLEVELAND_INGESTION.md](CLEVELAND_INGESTION.md), [ACCESS_RECOVERY.md](ACCESS_RECOVERY.md).
- Morphology and regeneration: [MORPHOLOGY_WEB.md](MORPHOLOGY_WEB.md).
- Later review workflow: [REVIEW_WORKFLOW.md](REVIEW_WORKFLOW.md).
- Research proposal: [ML_ROADMAP.md](ML_ROADMAP.md).
- Machine-readable coverage and test evidence: `reports/working_coverage.json`,
  `reports/cleveland_ingestion.json`, `reports/phase_acceptance.json`, and browser reports.

Local implementation and live deployment evidence are tracked separately. An acceptance
row describes the bounded delivered capability; the limits column is part of its status.
