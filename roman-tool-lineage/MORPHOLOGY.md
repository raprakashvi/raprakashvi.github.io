# Comparing instruments by shape and material, across Europe and beyond

Exploratory study v0.2 · 21 October 2026 · independent review pending · interactive version: open `atlas.html` → **Morphology & regions**

This answers three points of feedback: (1) use the faster search/extraction workflow to see how instruments were **distributed through Europe**; (2) find a method to compare instruments **morphologically, by shape and material**; (3) **feed non-Western data** so the comparison is inclusive. Sources and access results are in [MUSEUM_SOURCES.md](MUSEUM_SOURCES.md); the data backend and query design are in [DATA_ARCHITECTURE.md](DATA_ARCHITECTURE.md). Headline numbers live in `results/tables/morph_results.json`.

## What was built

A pipeline that turns museum photographs into **dimensionless, pose-free shape descriptors**, pairs them with a **controlled material vocabulary**, and tests what they can and cannot support.

| Step | What it does | Output |
|---|---|---|
| Ingest PDFs | Reads the three Museum Boerhaave search-result PDFs: binds each of 525 grid cells to its accession number, title, maker credits and date using the PDF text layer; crops its thumbnail | `data/processed/morph/boerhaave_records.csv` |
| Harvest | Met Open Access bulk CSV (167 objects), Europeana (7 providers, 7,334 records), Smithsonian (3,743 records, 8 usable), Wellcome (973 pictures). Polite per-host rate limits; stop at the first 403/429 | `data/raw/met_morph/`, `data/raw/museums/` |
| Screen | Multilingual (English/Dutch/Swedish) keyword classifier assigns an instrument family or excludes. Every record gets a screening row with a reason | `data/raw/museums/screening_*.csv` |
| Silhouette | Background fitted as a smooth surface from the image border, Lab distance, hole-preserving mask. Every image gets a QC verdict; failures stay in the table | `shape_qc.csv`, `masks/` |
| Descriptors | Width profile + centreline bend along the principal axis, rotation-invariant Fourier magnitudes, six scalars. Dimensionless, rotation- and mirror-tolerant | `features.npz` |
| Distance | Three median-normalised blocks averaged. Material distance is separate: hierarchical vocabulary (bronze vs iron 0.5, metal vs bone 1) | `morph_distance_matrix.npz` |
| Tests | Function recovery vs baselines, region hold-out, region/design/time effects (permutation), shape–material Mantel tests, similarity nominations | `morph_results.json` |
| Export | Embedding, oriented silhouette outlines, 8-neighbour similarity graph, SQLite backend | `atlas_morph.json`, `atlas.sqlite` |

Thumbnails carry no scale, so **size is not used**. Material is used only where a catalogue records it (484 specimens); it is **missing, not inferred from photo colour**, for the Boerhaave PDF rows.

## Sample (after QC)

3,688 images in; **2,600 analysed**: Museum Boerhaave 1,851 (PDF + Europeana), Region Skåne 462, Met 138, Stockholm ethnography 74, Gothenburg world culture 52, Mediterranean museum 14, Estonia 4, Smithsonian 5. Exclusions (all itemised in `results/tables/morph_exclusions.csv`): 347 multi-object photographs, 306 drawings/prints or composite find sheets analysed as a separate stratum, 127 empty masks, 92 cases, 73 background failures, 63 frame-touching, 54 too small, 17 duplicates, 5 fragments, 4 other.

Region coding: Europe post-classical 2,332 (of which 1,851 Boerhaave); Greece/Rome/Cyprus 69; Americas 76; Egypt/Nile 29; sub-Saharan Africa 22; South/Southeast Asia 20; East Asia 17; West Asia 10; Oceania 4; North America 2; unassigned 19. **Non-Western: 178 of 2,600 (6.8 %); 149 (5.7 %) excluding Egypt/Nile.**

## Findings

Observation, inference and speculation are kept apart. P-values are not corrected across the study.

### 1. Outline carries function information (Boerhaave, n = 1,271)
- *Observation.* Leave-one-out balanced accuracy for obstetric forceps / other grasping forceps / blades: **0.79** (95 % CI 0.76–0.83; chance 0.33; permutation p = 0.001). The width/centreline profile alone gives 0.78. **Photo background colour alone gives 0.54**, so photographic habit explains some but not most of it. Dropping any one block leaves 0.73–0.79; excluding frame-touching images 0.78.
- *Limits.* Labels come from titles and search provenance, not expert coding.

### 2. Inclusion: the earlier result weakened as the data grew
- *Observation.* In the first Met-only pass, non-Western objects were classified at 0.68 with their region in the reference set and 0.57 held out. With **178 non-Western specimens from several collections**, class-balanced accuracy is **0.44 in-reference and 0.35 held out** (paired drop 0.06–0.11; chance 0.33). Held-out accuracy is essentially chance. By region (in-reference → held out): Americas 0.34 → 0.18, Egypt 0.57 → 0.49, sub-Saharan Africa 0.51 → 0.47, East Asia 0.67 → 0.67, South/Southeast Asia 0.29 → 0.28. West Asia (n = 10) and Oceania (n = 4) are not interpretable.
- *Why the Andean result is below chance.* 69 % of Andean "tweezers" are matched to **speculum** blades in the reference set. They are folded flat plates; a single-view silhouette cannot see the fold, so the plate looks like a speculum valve.
- *Inference.* A European-only reference does not recognise most non-Western forms, and silhouette-only description cannot separate flat forms with different mechanics. Two explanations remain open: catalogue names group morphologically different tools (the B3 naming problem), or the descriptor lacks the information to tell them apart. Side/edge views would discriminate; this study cannot.
- *Caveat.* Part of the in-reference gain is sibling objects from one find or collection.

### 3. Who is in the data (inclusion audit)
- 6.8 % non-Western. Sub-Saharan Africa and Oceania are no longer empty (22 and 4) only because two Swedish ethnographic museums appeared through Europeana; both are small and are mostly "tweezers"/spatulas of unrecorded use. **Few non-European objects are documented as surgical.** They test the form comparison, not clinical practice.
- South Asian surgical instruments (e.g. Suśruta's *yantra/śastra*) are essentially absent (20 Javanese bronzes). That needs targeted acquisition.

### 4. Distribution through Europe (what the data can and cannot say)
- Of 1,851 Boerhaave specimens, **465 (25 %)** name a workshop place; **51 % of those are outside the Netherlands**. Paris leads (108 records), then Amsterdam (80), Leiden (56), Rotterdam (34), Berlin (27), The Hague (25), London (23). Heidelberg appears mostly as **designer** credits (Naegele pattern).
- Holders in the sample: Leiden 1,851, Skåne 462, Stockholm and Gothenburg ethnography 126, Tallinn 4. This is **what these collections hold and name, not the European distribution of instruments**; one collection dominates. A Europe-wide claim needs several collections with maker places and the same fields.
- Portable Antiquities Scheme metadata (not shape): 245 Roman, 170 early-medieval, 48 medieval tweezers recorded as finds in Britain.

### 5. Regional or design signature?
- **Maker country** (NL 190, FR 83, GB 28, DE 25; n = 326): R² 0.019, p = 0.024 unstratified, **p = 0.095 within function × 50-year strata**. A 2 % effect; not established.
- **Named designs** (Naegele, Levret, Dubois, Smellie, Tarnier, Pajot, Kielland, Mursinna; n = 92): R² 0.10, p = 0.077 (0.21 within period). The descriptor does **not** reliably recover documented design names at thumbnail resolution. This is a positive-control miss: the method resolves function, not workshop or pattern lineage.
- **Time**, within function (Mantel ρ): blades 0.17 (p = 0.001, n = 116, 1650–2005); obstetric forceps 0.00 (p = 0.98; 1722–1962, form persistence); other grasping 0.00 (p = 0.89, n = 960).

### 6. Material and shape
- Of 484 specimens with catalogued material: iron/steel 213, copper alloy 143, textile/leather 96, silver 33, bone/ivory 28, gold 20. Shape and material distance correlate weakly (ρ = 0.07, p = 0.001, within family), but **within region for grasping forms the effect is not significant (ρ = 0.13, p = 0.28, n = 294)**. No shape–material coupling is established.

### 7. Similarity nominations
`morph_pairs` and the atlas "Similar outlines" view list reciprocal nearest neighbours across regions, excluding featureless thin rods (hubs at this resolution). **These are comparisons to check, not transmission.** Shared function, shared constraint and independent invention also give similar outlines.

## In the atlas: family tree and morphology are linked

- **Family tree → Museum layer.** The "Museum layer" toggle now carries 2,636 records: the 507 Boerhaave catalogue instruments of the museum tab plus **2,129 specimens from the morphology study** (1,380 further Boerhaave records, Region Skåne 462, Met 138, ethnographic museums 126, Mediterranean museum 14, Estonia 4, Smithsonian 5). 471 morphology specimens already in the Boerhaave catalogue layer are linked by accession, not duplicated. Records are placed by tool type (from catalogue wording) and date only, in one date-ordered grid per collection; **no link between records is asserted**. 621 records are undated. Built by `scripts/analysis/morph_layer.py`.
- **Both ways.** A tree record from the morphology study offers "Shape neighbours in the morphology view" (pins it in the shape space with its eight most similar outlines); a morphology specimen that is in the tree offers "Open in the family tree".
- **Caveat.** Tool type is the catalogue's wording, not expert coding; 1,176 "tweezers" and "forceps" share the one *Grasping forceps* branch, so the fitted view of that branch is small and needs zooming.

## Limits that apply to everything

- Single uncontrolled-pose photographs; no scale; burnt-in labels and shadows sometimes enter masks. Family labels come from catalogue wording.
- Many tests; no multiplicity correction. AI-curated; no independent human review.
- Access: Science Museum Group (403 from its CDN), Ingenium (host unreachable, site 403), NLM (robots.txt disallows `anthropic-ai`), Museum Boerhaave site (unreachable) were **not harvested and not bypassed**. The Met's firewall throttled a first fast crawl; we stopped and used the bulk CSV.
- Smithsonian's demo key allows 10 requests per hour, and only one NMAH record had an open image.
- Method choices that changed results are logged in `RESEARCH_LOG.md` (e.g. a bug that labelled every Andean object "African", a substring match of "iran" in "Pasiran", and an image-role rule that silently dropped all PDF rows until a test of counts caught it).

## Findings log for future work

1. **Count checks catch silent filters.** Two bugs (department string matching a region rule; an equality test excluding every PDF row) were visible only as impossible counts. Keep a per-source count assertion in the pipeline.
2. **A result that holds on 65 specimens can vanish at 178.** Report sample size next to every effect and rerun when data are added.
3. **Silhouettes cannot see folds, hinges or thickness.** Next data step: side/edge views or 3-D scans for tweezers and speculum-like plates.
4. **Composite sheets and burnt-in labels are the commonest segmentation failure** (PAS, Stockholm). A view-splitting step would recover PAS's 400+ Roman and medieval tweezers.
5. **Entity resolution is the bottleneck for any graph.** The Weiss relations connect printed labels, not resolved objects (see DATA_ARCHITECTURE.md).
6. **Next acquisitions, in priority order:** Science Museum Group (manual), Ingenium CSV (manual), NLM images (manual), South Asian and East Asian specimens and manuscript drawings, Smithsonian personal key.

## How to feed in more data

1. Copy `data/templates/morph_intake.csv` to `data/raw/morph_extra/<source>.csv` and put images next to it (`image_path` relative to that folder).
2. Fill at minimum: `source`, `accession`, `title`, `year_from`/`year_to` (BCE negative), `culture`, `region` (controlled names in `morph_meta.REGION_RULES`), `materials` (controlled classes, `;`-separated, or blank), `function`, `family`, `use_context`, `image_role` (`museum photograph` for specimens; anything else is held out as a stratum), `rights`, `source_url`.
3. Re-run the pipeline (below). The atlas rebuilds with the new rows.

## Reproduce

```bash
python roman_tool_lineage/scripts/analysis/morph_ingest_boerhaave.py           # needs Ghostscript
python roman_tool_lineage/scripts/analysis/cache_met_morph.py MetObjects.csv   # bulk CSV from github.com/metmuseum/openaccess
python roman_tool_lineage/scripts/analysis/harvest_museums.py                  # Europeana, Smithsonian, Wellcome
python roman_tool_lineage/scripts/analysis/morph_harvest_normalize.py
python roman_tool_lineage/scripts/analysis/morph_features.py                   # parallel segmentation, ~3 min
python roman_tool_lineage/scripts/analysis/morph_specimens.py
python roman_tool_lineage/scripts/analysis/morph_analysis.py                   # seeded permutation tests
python roman_tool_lineage/scripts/analysis/morph_export_atlas.py               # embedding, outlines, kNN graph
python roman_tool_lineage/scripts/plotting/morph_figures.py
python roman_tool_lineage/scripts/analysis/build_graph_db.py && python roman_tool_lineage/scripts/analysis/build.py
python roman_tool_lineage/scripts/analysis/test_morph.py
python roman_tool_lineage/scripts/analysis/check_atlas_ui.py                   # headless Chrome, needs websocket-client
```

Rights: Met images CC0; Europeana, Smithsonian and Wellcome records carry their own licences (in each record's `rights`). Third-party images are not committed (`.gitignore`); the atlas embeds only derived outlines, tables and figures. Confirm each museum's terms before publishing any thumbnail.
