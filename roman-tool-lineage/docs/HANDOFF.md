# Vestigium delivery

Current dataset: `v1-804c1e7c3202`, 2,830 stable records, 5,974 reconciled source-row
references, 2,718 distinct linked assets. The main page restores the rich research
atlas with first-class tree, world/time maps and original morphology. The structured
collection, review workflow and updated outline plot remain available alongside it.

Website: https://raprakashvi.github.io/roman-tool-lineage/

Source repository: https://github.com/raprakashvi/local_tinkering/tree/vestigium-2026-10-21/roman_tool_lineage
Website repository: https://github.com/raprakashvi/raprakashvi.github.io/tree/master/roman-tool-lineage

Source branch: `vestigium-2026-10-21`. Website publishing branch: `master`.
Pre-restoration checkpoints: source `f6e06f5`, website `c7a99de`.
Current delivery commit references are recorded in PLAN.md after deployment.

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
| Restored views, routing, theme and performance | [DESIGN_RESTORATION.md](DESIGN_RESTORATION.md) |
| Credentials, build, deployment, backup and rollback | [OPERATIONS.md](OPERATIONS.md) |
| Metadata schema and reproducible releases | [DATASET.md](DATASET.md) |
| Source ingestion and access limits | [MUSEUM_INGESTION.md](MUSEUM_INGESTION.md), [ACCESS_RECOVERY.md](ACCESS_RECOVERY.md), [CLEVELAND_INGESTION.md](CLEVELAND_INGESTION.md) |
| Both morphology views and regeneration | [MORPHOLOGY_WEB.md](MORPHOLOGY_WEB.md) |
| Verification evidence and limits | [VERIFICATION.md](VERIFICATION.md) |
| ML tools for the next agent | [ML_AGENT_HANDOFF.md](ML_AGENT_HANDOFF.md) |
| Scientific experiment proposal | [ML_ROADMAP.md](ML_ROADMAP.md) |

Museum imports remain bounded: 50 Pitt Rivers editorial accession records, 38
Smithsonian Anthropology records and four Cleveland tools. Full Pitt catalog access
and additional source images remain source-dependent; these are not complete imports.
The original 2,600-shape matrix remains intact; five supplemental accepted outlines
join the descriptive plot, while one failed mask stays excluded with its reason.

Human validation is deferred. Contextual working annotations are provisional and
retain their evidence; they are not verified functions or expert ground truth.
Substantial local ML training, pretrained-model downloads and weight uploads remain
later work. The next agent can start retrieval and unsupervised tools from the handoff
without requiring immediate human annotation.
