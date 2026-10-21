# Vestigium delivery

**Follow-up update:** public editorial access now works with corrected robots handling;
the collection has 2,826 records and stable-ID shape neighbors. See [ACCESS_RECOVERY.md](ACCESS_RECOVERY.md).
The earlier pilot statistics below describe the initial delivery.

Website: https://raprakashvi.github.io/roman-tool-lineage/

Source repository: https://github.com/raprakashvi/local_tinkering/tree/vestigium-2026-10-21/roman_tool_lineage
Website repository: https://github.com/raprakashvi/raprakashvi.github.io/tree/master/roman-tool-lineage

Initial hosted migration was committed and pushed as `238b7cf` before redesign.
Its live gate/original-tree checks passed. Final release uses dataset `v1-108ed1654c7f`.
Source implementation commit: `1dd77e8` on `vestigium-2026-10-21`.
Website implementation commit: `114c028` on `master`.
A later documentation-only commit may follow these code/data release commits.

Read initial access locally in `roman_tool_lineage/.access.local`; username `research`.
This file is ignored, mode 0600, and absent from published artifacts. Rotate credentials
with `scripts/web/configure_gate.py`, rebuild, verify, and deploy as described in
[OPERATIONS.md](OPERATIONS.md). The public site uses a salted verifier and a basic
interface gate; all static files remain public. It is excluded from personal-site
navigation and sitemap, with noindex in both HTML entry points.

Delivered: preserved on-demand research atlas; redesigned responsive browse/details/
comparison interface; 2,746 stable-ID records; versioned schema and lossless migration;
five Pitt Rivers editorial mentions and three Smithsonian Anthropology API records;
2,600 linked morphology rows; PDF/SVG/PNG publication plot and full CSV; cached/resumable
source pipeline; verification scripts; local ML roadmap and manifest/config templates.
No substantial model training, model download or weight upload was performed.

| Need | Entry point |
|---|---|
| Checklist and blockers | [../PLAN.md](../PLAN.md) |
| Architecture, credentials, backup, restore, update, rollback | [OPERATIONS.md](OPERATIONS.md) |
| Metadata schema, identifiers and reproducible releases | [DATASET.md](DATASET.md) |
| Source interfaces, inclusion, coverage and exact blockers | [MUSEUM_INGESTION.md](MUSEUM_INGESTION.md) |
| Updated plots and regeneration | [MORPHOLOGY_WEB.md](MORPHOLOGY_WEB.md) |
| Verification evidence and limits | [VERIFICATION.md](VERIFICATION.md) |
| Future experiments and compute | [ML_ROADMAP.md](ML_ROADMAP.md) |

Pitt Rivers' full modern database remains blocked by maintenance, and automated editorial
refresh stops at robots HTTP 403. The five imported mentions remain reproducible offline;
they are not a full museum import. Smithsonian scope is a three-record pilot. Missing
functions, images and measurements remain explicit. Historical terminology and
attributions are retained with source context. Image display authorization is separate
from redistribution and training eligibility. Independent assistive-technology and
non-Chromium audits remain deferred. All current-phase verification claims distinguish
local implementation from live delivery.

Final live acceptance: 29 Chromium checks passed for `v1-108ed1654c7f`, with 0 exceptions
and 0 HTTP errors. Personal-site checks: 0 failures, 0 warnings; no tracked file outside
the collection changed. Checklist current-phase tasks complete; explicit future/source
blockers remain listed. PDF/SVG/PNG morphology regeneration is byte-identical locally.

Follow-up delivered: 2,826 records, 45 additional Pitt Rivers editorial entries and
35 additional Smithsonian objects/assemblages, 41,600 ranked shape-comparison edges,
and 32 passing local/live browser checks. Modern Pitt Rivers service remains down;
bounded public editorial access is recovered. See ACCESS_RECOVERY.md.


## Review workflow update, 2026-10-21

Open https://raprakashvi.github.io/roman-tool-lineage/#review with the existing gate
credentials. Choose a reviewer alias, inspect evidence, save local judgments and export
JSON before changing devices or clearing browser data. Drafts do not upload or sync.
Independent reviewers use separate aliases and exchange exports after independent work.
Full instructions, offline validation and adjudication limits: [REVIEW_WORKFLOW.md](REVIEW_WORKFLOW.md).

Dataset `v1-8a2634871c59` keeps all 2,826 stable IDs and adds two verified Pitt Rivers
photographs. Pilot `pilot-aa58d2739f53` has 150 unreviewed records and 297 similarity
pairs; all training labels remain masked. `data/processed/web/review_current.json`
locates the hashed frozen files under `data/review/`.

The image queue covers all 88 museum imports, with 86 still lacking images (including
the latest 80). Smithsonian detail-page 403 and modern Pitt maintenance remain source
blockers. The existing personal website is preserved by scoped deployment. Source
branch remains `vestigium-2026-10-21`; implementation/deployment commits and live results
are recorded in PLAN.md after verification.

Review implementation source commit: `50bac76`; website implementation: `3286ffa`. Live acceptance passed 32 collection + 19 review checks, zero uncaught exceptions. The source branch and dataset/pilot hashes above identify reproducible artifacts; final evidence-only commits may follow.

## Current priority update

Website/dataset work proceeds without human review. The current source-grounded working
assignments, Cleveland import, additional descriptive outlines and button-based review
workspace are detailed in [PHASE_STATUS.md](PHASE_STATUS.md). This is the current
phase-by-phase acceptance and remaining-work map. Human validation and substantial
training remain later phases; the site does not ask the user to review now.

Current dataset: `v1-804c1e7c3202` (2,830 records); current later-review pilot:
`pilot-2254e7f3e6c4`. Source branch remains `vestigium-2026-10-21`. Existing gate credentials
and configuration instructions remain in OPERATIONS.md. New working-function exports,
QC masks, figures and source coverage are versioned with their respective manifests.

Expanded implementation: source `c559c08`, website `4cf9ebe`; final evidence-only commits follow. Live acceptance: 39 Chromium collection checks, 24 review checks and six Firefox smoke checks. Eighteen offline tests pass. Original personal-site files are byte-identical. All supplemental image bytes match the verified artifact, and six versioned figure exports reproduce byte-for-byte. The published `reports/phase_acceptance.json` records current deployment status and bounded acceptance; source-specific and deferred tasks remain listed explicitly.
