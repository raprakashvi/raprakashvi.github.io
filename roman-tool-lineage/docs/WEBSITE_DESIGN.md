# Vestigium workbench design

The Website workstream replaces the earlier restoration shell with a coherent research
application. Original tree, world/time, morphology and source-study functionality stays
available. The collection and atlas share one generated navigation system and UI tokens.
The wider acquisition, morphology-expansion and research programme remains open.

## Interface architecture

`scripts/web/shell.py` generates both document shells. `visuals/tokens.css` defines the
application palette and typography; `visuals/workspace.css` defines navigation, surfaces,
controls, research layouts and responsive behavior. `web/workspace.js` handles shared
breadcrumbs, page titles, global search, keyboard shortcuts and the mobile drawer.
The original `theme.css` retains module layout primitives and the preserved scientific
palette in `visuals/style.py`; publication-figure category meanings are unchanged.

Desktop uses a dark slate sidebar grouped into Explore, Analyze and Research, a compact
white top bar and cool-neutral content surfaces. Cobalt identifies interaction states;
existing family/region colors encode scientific categories. The main workspace starts
with the content rather than promotional copy. Manrope is self-hosted, with its OFL
license and source/checksums in `visuals/fonts/`. Its source is the
[official Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/manrope).
No remote font service is used during browsing.

Below 900 px the sidebar becomes a modal navigation drawer. Closed navigation is inert;
opening it traps keyboard focus and makes the background inert. Escape restores the
opener; choosing a destination focuses the main content. On narrow screens the search
icon opens the collection input. Ctrl/Cmd K focuses search. Both atlas and collection
use the same session gate and existing credentials.

## Workspaces

- **Family tree:** compact search/filter toolbar, branch selector, zoom controls,
  trace controls, branch sidebar, canvas and source-linked inspector. Timeline,
  museum merge, SVG/CSV/JSON exports and historical evidence remain available.
- **World and time:** paired maps, compact filters/time controls, keyboard city
  selection, source register, counted legends and the original period/persistence rules.
- **Morphology:** color keys immediately precede the plot, with a fitted silhouette
  inspector, nearest outlines, accessible table and all original subviews. Updated
  outline measurements remain a separate explicitly labeled analysis.
- **Collection:** source/category quick filters, additional metadata on demand,
  removable active-filter chips, grid/list displays, stable IDs and image placeholders.
  Global search enters the same bounded collection index; detail shards stay on demand.
- **Records, comparisons and annotation:** shared surfaces, typography, buttons and
  evidence hierarchy; original review decisions/history formats remain compatible.
- **Access:** redesigned sign-in layout; the basic gate/public-static-files limitation
  is visible. Credentials and gate verification logic are unchanged.

Primary routes and old `legacy.html` links stay compatible. The two comparison contexts
remain labeled separately within their pages; no object identities or source facts
are merged by this UI work.

## Startup data and preservation

The hosted atlas now fetches `legacy-data/atlas-core.json` and `images.json` initially.
The full `catalog.json` remains published for compatibility. Additional museum records
are in `museum-other.json`, fetched when enabling the museum layer or exporting the
full original catalog. Records, sources, threads, filters and counts are attached before
the merged tree is rendered. Failures leave the core tree usable and provide a retry.
The original JSON export explicitly waits for this data.

The 1.52 MB morphology payload loads on first opening the shape workspace. Calls from
item/tree links and direct subview links wait for initialization, preserving selections.
Rejected loads reset the pending promise so reopening can retry. The original offline
`index.html` and `atlas.html` stay unchanged, as does the frozen 2,830-record release.

Measured local decoded JSON bootstrap: **3,896,513 bytes**, containing the core and
image-path register. The old full catalog plus image register plus morphology was
11,127,968 bytes. This avoids **65.0%** of those startup JSON bytes.
The 5.71 MB additional-museum and 1.52 MB morphology payloads are deferred, not removed.
The collection still uses its approximately 1.45 MB search index, 24-card pagination,
80-record detail shards and lazy images. These are payload measurements, not a
production concurrency or network-latency benchmark. Further module-level splitting
and a smaller search index remain possible as the dataset grows.

## Verification and open checks

`check_workbench.mjs` tests actual pointer/keyboard navigation, responsive layout,
font loading, search, removable filters, list/grid state, deferred loading, simulated
museum-load failure/retry and complete export contents. It captures desktop/mobile
screenshots. The original atlas, collection, review and Firefox smoke suites remain
separate. Source integrity/reordering checks protect IDs, assets and raw records.
Local and live reports have separate filenames; deployment is claimed only after the
hosted checks pass. Check PLAN.md and results/tables for final counts/references.

Independent screen-reader and Safari audits, fuller Firefox testing and broader
researcher usability testing remain open. Missing images/measurements, full Pitt access,
additional acquisition, expanded shape distances and validated functional labels are
separate dataset/research tasks. ML tools are documented in ML_TOOLS.md; their current
bounded delivery does not establish predictive accuracy or historical ancestry.

Primary museum inclusion now uses a 22px native checkbox inside a minimum-46px
whole-label target, with 14px wording, a count badge and checked/focus styling. Other
research checkboxes use 20px controls and generous labels. AI Methods has a compact
section bar and query/result layout; large screens show a selected-tool rail beside
matches, while mobile uses a compact stacked picker. Experiment counts live in run
details rather than above retrieval results. No dataset or ML output changes.
