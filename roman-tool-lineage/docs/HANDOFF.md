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
