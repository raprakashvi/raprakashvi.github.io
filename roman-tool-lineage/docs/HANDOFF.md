# Vestigium delivery

Current dataset: `v1-804c1e7c3202`, 2,830 stable records, 5,974 reconciled source-row
references, 2,718 distinct linked assets. The main page uses the redesigned slate/cobalt workbench, with shared sidebar,
top bar, self-hosted typography, mobile drawer, tree, world/time maps and morphology. The structured
collection, review workflow and updated outline plot remain available alongside it.

Website: https://raprakashvi.github.io/roman-tool-lineage/

Source repository: https://github.com/raprakashvi/local_tinkering/tree/vestigium-2026-10-21/roman_tool_lineage
Website repository: https://github.com/raprakashvi/raprakashvi.github.io/tree/master/roman-tool-lineage

Source branch: `vestigium-2026-10-21`. Website publishing branch: `master`.
Pre-restoration checkpoints: source `f6e06f5`, website `c7a99de`.
Previous workbench implementation: source `ebba293`; ML tools `d1ac708`;
website `9ee153e`. Final evidence-only commits follow these implementation commits.
That release passed 49 workbench, 45 atlas, 39 collection, 24 review and six Firefox checks live;
18 website pipeline tests and 21 dedicated ML tests pass. Forty-one live files match
the reviewed artifact. Initial research JSON is 65.0% smaller, with deferred data
available on demand. Personal-site files and crawler rules remain preserved.
Earlier corrective restoration references remain in PLAN.md.

Access uses the configured username `research`. Credentials are held only in ignored
local files, not published documentation. To change them, run
`scripts/web/configure_gate.py --output gate.local.json`, rebuild, verify and deploy as
specified in OPERATIONS.md. The current user-requested credential configuration is
preserved by the restoration. All static files remain public under the explicitly
approved GitHub Pages interface-gate arrangement. Noindex applies to all three entry
pages; personal-site navigation and sitemap remain unchanged.

| Need | Entry point |
|---|---|
| Current checklist and remaining tasks | [../PLAN.md](../PLAN.md), [PHASE_STATUS.md](PHASE_STATUS.md) |
| Current workbench, routing, theme and deferred data | [WEBSITE_DESIGN.md](WEBSITE_DESIGN.md) |
| Credentials, build, deployment, backup and rollback | [OPERATIONS.md](OPERATIONS.md) |
| Metadata schema and reproducible releases | [DATASET.md](DATASET.md) |
| Source ingestion and access limits | [MUSEUM_INGESTION.md](MUSEUM_INGESTION.md), [ACCESS_RECOVERY.md](ACCESS_RECOVERY.md), [CLEVELAND_INGESTION.md](CLEVELAND_INGESTION.md) |
| Both morphology views and regeneration | [MORPHOLOGY_WEB.md](MORPHOLOGY_WEB.md) |
| Verification evidence and limits | [VERIFICATION.md](VERIFICATION.md) |
| Implemented local ML tools and GPU commands | [ML_TOOLS.md](ML_TOOLS.md), [ML_IMPLEMENTATION_STATUS.md](ML_IMPLEMENTATION_STATUS.md) |
| Website AI results: retrieval, clusters, provisional labels and provenance | [AI_METHODS.md](AI_METHODS.md) |
| Scientific experiment proposal | [ML_ROADMAP.md](ML_ROADMAP.md) |

Museum imports remain bounded: 50 Pitt Rivers editorial accession records, 38
Smithsonian Anthropology records and four Cleveland tools. Full Pitt catalog access
and additional source images remain source-dependent; these are not complete imports.
The original 2,600-shape matrix remains intact; five supplemental accepted outlines
join the descriptive plot, while one failed mask stays excluded with its reason.

Human validation is deferred. Contextual working annotations are provisional and
retain their evidence; they are not verified functions or expert ground truth.
Substantial local ML training, pretrained-model downloads and weight uploads remain
later work. The delegated agent has implemented bounded local retrieval, unsupervised and
provisional-annotation tools plus supervised readiness. Twenty-one tests pass; an
eight-view cached-weight ResNet18 GPU smoke run is verified. Expanded representation
learning, category models and independent evaluation remain open. See ML_TOOLS.md.

AI Methods is implemented under Research, with exact saved text/shape ranks, bounded
image retrieval, color-coded exploratory clusters with tables, and eight-state label
evidence. Live and local verification: 44 AI browser checks, 14 Firefox smoke checks,
34 website/export Python tests and 21 ML tests. All existing 49 workbench, 45 atlas,
39 collection and 24 review browser checks also pass live. See AI_METHODS.md for
public-result coverage, reproduction and limits.

Current AI integration: source `dc11c84` on `vestigium-2026-10-21`; website `b81a68d`
on `master`. Both are pushed. Final evidence-only publication follows. Open
https://raprakashvi.github.io/roman-tool-lineage/collection.html#ai or choose Research
→ AI Methods. All 86 checked live interface/result files match the tested artifact,
including every AI JSON payload. Personal homepage returns 200 and all personal-site
files outside the collection are preserved. Existing credentials continue to work.
