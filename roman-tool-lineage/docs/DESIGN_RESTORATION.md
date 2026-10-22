# Vestigium research workspace restoration

Historical corrective delivery. The subsequent complete UI workstream is documented
in [WEBSITE_DESIGN.md](WEBSITE_DESIGN.md), including the new theme and deferred startup data.

The first collection redesign made the original research tools difficult to discover.
The restored site makes the research atlas the home page and keeps the structured
collection alongside it. No original offline dataset, tree, map or scientific result
is removed. Dataset release `v1-804c1e7c3202` remains unchanged.

## Navigation and compatibility

| Destination | URL relative to the subpage | Contents |
|---|---|---|
| Family tree | `index.html#map` | Branch sidebar, lineage selection, zoom/pan, original images, dates, citations, timeline and exports |
| World and time | `index.html#world` | Global and regional maps, historical periods, color legends, city selection and source registers |
| Morphology | `index.html#morph` | Original shape space, silhouettes, region/family/material/date/collection colors, neighbors, coverage, workshops, cross-region pairs and method tables |
| Collection | `collection.html#browse` | Current 2,830-record paginated collection, search, metadata filters and permanent item pages |
| Compare | Atlas `#compare` or collection `#compare` | Original curated instrument comparisons and selected dataset records respectively; selections remain specific to each workspace |
| Evidence and sources | Primary navigation menu | Findings, 1863 catalog scans, Boerhaave study, research audit, study connections and source references |
| Annotate | `collection.html#review` | Existing button-based later-review workflow and browser-local history |
| Updated outlines | `collection.html#analysis` | Current 2,605 accepted outlines, color legend, text table, exports and original distance-rank links |

`legacy.html` retains the same restored Vestigium shell for historical links, including
`legacy.html#morph`. Root links previously published as `#item/META-…`, `#browse`,
`#analysis`, `#review` or `#about` redirect to the corresponding collection page.
`index.html#compare` now belongs to the original research comparison workspace;
collection comparisons use `collection.html#compare`. Browser Back restores atlas tabs.
Both pages use the same session gate and sign-out behavior.

## Visual decisions

The shared style is `visuals/workspace.css`. Scientific colors remain grounded in
`visuals/theme.css` and `visuals/style.py`: warm paper, dark ink, teal controls, bronze,
blue and the existing categorical region/family palette. The build publishes
`visuals/palette.json` for the updated plot. Color legends give names and counts;
the table exposes the selected color group in text. Circles and diamonds distinguish
original from supplemental outlines. Color is never the sole source of metadata.

UI text uses the local system sans-serif stack; short page titles and the Vestigium
wordmark use Georgia. There is no external font request. Heading scale, spacing,
controls, navigation and focus outlines are shared. Introductory marketing text and
the long legacy banner are removed. Methods and export explanations are expandable.
Navigation remains visible on scroll. Additional morphology/map filters open on demand,
so small screens show the visualization earlier. Filter state remains in the status.

## Scientific preservation

The original 2,600-shape space and original 41,600 ranked edges are preserved. The
updated descriptive plot contains 2,605 accepted outlines and reports 225 records
without accepted features. These are different views with explicit coverage. No new
embedding, training run, physical calibration or expanded matrix is claimed. Tree links
remain source comparisons or documentary relations rather than evidence of ancestry.
Stable-ID links connect tree and pinned silhouette details to structured records.

`atlas.html` and the embedded source `index.html` remain recoverable offline archives.
The build changes generated entry points; it does not migrate or replace those files.

## Performance and remaining work

The collection browser retains its approximately 1.45 MB decoded search index, 24-card
pagination, detailed-record shards and lazy images. Opening the rich original atlas
loads approximately 9 MB of research catalog JSON, 1.5 MB of morphology JSON and a
236 KB image-path register, plus code and visible images. These are decoded local file
sizes, not compressed live transfer sizes. The initial research bootstrap remains a
known bottleneck; this restoration does not claim to have solved it. Splitting the
original cross-linked museum/research initialization requires a separate migration
with preservation tests. It must not be achieved by hiding the research tools again.

Full Pitt catalog access, broader acquisition, additional verified outlines and a
separately versioned/recalibrated distance matrix remain research priorities. Independent
screen-reader/Safari/full-Firefox workflow audits remain later checks. ML implementation
is handed off in [ML_AGENT_HANDOFF.md](ML_AGENT_HANDOFF.md); no training occurs here.

## Verification

Run the build, integrity check and browser suites described in VERIFICATION.md.
`check_atlas.mjs` exercises the restored tree, keyboard map selection, time controls,
all original morphology views, evidence sections, Back, compatibility URLs, current
plot colors and legend counts. It captures desktop/mobile screenshots. Existing
collection/review suites remain separate and target `collection.html`. New source files
must be deployed through the scoped helper in OPERATIONS.md, preserving the personal
website. Live reports have `_live` suffixes; local checks alone do not imply deployment.
