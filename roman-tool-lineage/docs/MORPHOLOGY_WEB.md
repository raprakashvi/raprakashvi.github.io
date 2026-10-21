# Morphology in the versioned website

Run from the project directory:

```bash
MPLCONFIGDIR=/tmp/vestigium-mpl python scripts/web/build_site.py --gate-config gate.local.json
```

To regenerate a specific frozen release without changing the current pointer:

```bash
MPLCONFIGDIR=/tmp/vestigium-mpl python scripts/web/morphology.py --dataset-version v1-5ea6e0e1e84c --output /tmp/vestigium-morph-replay
```

Outputs: `results/figures/morphology_web.{pdf,svg,png}` (PNG 300 dpi),
`results/tables/morphology_web.csv`, and `morphology_web_methods.json`.
All plot styles come from `visuals/style.py` and the shared atlas palette. Website canvas
uses the same CSS variables and displays the full plotted dataset as a paginated table.
The full CSV is exportable; every plotted row opens its permanent item ID.

The new public view reads existing `data/processed/morph/analysis_set.csv` values, joins
on permanent-ID aliases, and plots outline **aspect ratio** (dimensionless, logarithmic
x axis) against **solidity** (dimensionless, linear y axis). All 2,600 existing included
specimens appear. New imports lacking images have no features; they stay in the dataset
and coverage denominator. The release has 2,826 records and 226 without existing shape
features. Invalid or missing feature values cause an error rather than silent exclusion.

Aspect ratio comes from the previous principal-frame outline extent ratio; solidity is
segmented area divided by convex-hull area. Inputs were background-separated photographs
with QC, scale-free orientation normalization and prior inclusion decisions. No photographs
are calibrated to physical size. Pose, folded metal, open handles, labels and segmentation
can affect values. Length values elsewhere are catalog metadata, not photo-derived size.
This view is a descriptive 2D feature plot, not an embedding, learned similarity model or
statistical cluster analysis. Point distance has no biological/functional/evolutionary
interpretation. No uncertainty interval is fabricated for single, unreplicated masks;
pose/segmentation uncertainty remains unquantified and is shown as a limitation.

`morphology_web_methods.json` records the exact dataset version, counts, input table and
existing preprocessing-script hashes, axis definitions and exclusions. No fitting occurs;
random seed is null. Numeric table membership is checked against the release. Interactive
filters change both plot and table; hover shows available image previews and a source-linked
record, and clicking a point or table entry opens the item. On touch/keyboard devices the
table provides complete record access. Empty subsets and loading failures remain visible.

## Retained earlier study

`legacy.html#morph` preserves the earlier shape study, its eight-neighbor graph and
seeded t-SNE visualization. `MORPHOLOGY.md` and `scripts/analysis/morph_*` document that
study: width/centerline profile, Fourier magnitudes, scalar descriptors, median-normalized
block distances, separate material distance and t-SNE. Its 2,600 rows map to stable
records through the versioned alias registry; legacy IDs are retained for compatibility.
The five new Pitt Rivers and three Smithsonian examples have no suitable new images and
are not assigned invented neighbors or coordinates. The prior study's statistical results
are carried forward, not rerun or independently validated in this delivery. The new plot
and its denominator report the updated collection honestly.

Do not equate the new 2D aspect/solidity distance with the old multiblock shape distance.
Neither is a physical distance, and t-SNE axes have no physical units. The old study's
photographic backgrounds and sibling objects can leak collection identity. Existing
function labels often come from titles or search queries and require independent review
before supervised learning. See the roadmap for grouped evaluation and uncertainty work.

The updated interface also exports multiblock nearest-outline comparisons for all or
other collections. See ACCESS_RECOVERY.md for distance semantics, hash-verified source
matching, cross-collection ranking and the exportable ranked-edge CSV. This is a separate
comparison from the 2D scatter.
