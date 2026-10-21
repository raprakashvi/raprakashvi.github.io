# Vestigium delivery

Website: https://raprakashvi.github.io/roman-tool-lineage/

Source repository: https://github.com/raprakashvi/local_tinkering/tree/vestigium-2026-10-21/roman_tool_lineage
Website repository: https://github.com/raprakashvi/raprakashvi.github.io/tree/master/roman-tool-lineage

Initial hosted migration was committed and pushed as `238b7cf` before redesign.
Its live gate/original-tree checks passed. Final release uses dataset `v1-108ed1654c7f`.
Final source/website commit and live verification references are recorded below after publication.

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
