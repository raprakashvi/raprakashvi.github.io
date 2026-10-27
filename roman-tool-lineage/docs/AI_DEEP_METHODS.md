# Deep representations of tools: methods, results and limits

Status 2026-10-22. Dataset `v1-804c1e7c3202` (2,830 records; 2,716 with an image). This
extends the CPU baselines in [ML_TOOLS.md](ML_TOOLS.md) with GPU encoders, a confound-
controlled benchmark, a bounded adaptation experiment, part-aware and zero-shot channels,
disagreement mining, multi-channel functional hypotheses and website exports. Literature:
[AI_LITERATURE.md](AI_LITERATURE.md). Website: **Research → AI Methods**
([AI_METHODS.md](AI_METHODS.md)). Machine-readable findings:
`results/ml/deep/findings.json`.

## What the evidence can and cannot support

There is **no expert-reviewed ground truth**. Every quantitative result below scores
agreement with weak, catalog-derived targets:

* a coarse category (six classes on the 2,545-record evaluation set: grasping forceps 1,356,
  probes/needles 468, specula/dilators 346, obstetric forceps 187, blades 140, clamp forceps 48),
  mapped from the source `categories` field (`scripts/deep/data.py: COARSE`);
* rule-based function labels from `derived.working_annotation` (gripping, extraction, cutting,
  scraping, probing, dilation; piercing and crushing are too rare).

Both come from catalog text. They are **non-circular for image and shape** representations
and circular for text representations (text rows are shown only as consistency checks).
Category labels partly mirror how Museum Boerhaave was harvested (forceps / probe /
specula query sets). Chance category P@10 is 0.345; the random cross-museum P@10 is 0.377.

## Pipeline

All code is in `scripts/deep/` (GPU venv) and `scripts/web/ai_deep_export.py` (base Python).
`scripts/deep/pipeline.sh` reproduces everything in order (about 45 minutes on the RTX 5080).

| Step | Module | Output |
|---|---|---|
| Views | `views.py` | per primary image: frame-trimmed `raw`, segmented `object_white`, binary `silhouette` (reusing `scripts/analysis/morph_shape.segment`); photographic nuisance descriptors. 2,525 / 2,716 pass segmentation QC; 2,673 have a mask; failures kept with reasons. |
| Encoders | `encoders.py`, `embed.py` | ResNet18 (ImageNet), DINOv2 B/14 and L/14 (registers), OpenAI CLIP L/14, SigLIP 2 B/16 (multilingual), multilingual-E5 base, CLIP and SigLIP text towers. Letterbox to square (never centre-crop: elongated tools would lose their ends). Weight SHA-256 recorded per feature file. |
| Leakage audit | `near_dups.py` | DINOv2-L raw cosine ≥ 0.98 across known groups = probable same photograph (79 pairs, 83 records; calibrated by visual inspection: pairs at 0.95–0.975 were distinct objects). Merged into groups for all splits. |
| Benchmark | `benchmark.py` | leave-one-group-out retrieval, probes, confound controls, 1,000-sample group bootstrap, paired differences. |
| Adaptation | `adapt.py`, `compare_adapt.py` | partial fine-tuning of DINOv2-B against catalog text with photography randomisation; 3 seeds × 3 variants; held-out comparisons. |
| Parts | `parts.py`, `parts_eval.py` | principal-axis alignment, two terminal 30 % crops, end embeddings, end geometry (taper, prongs, holes, hook). |
| Affordances | `affordances.py` | 17 zero-shot visible-form prompts (`configs/ml/affordance_prompts.json`). |
| Disagreements | `disagreements.py` | category conflicts, cross-category look-alikes, image/text divergence; manual coding in `results/ml/deep/disagreement_inspection.json`. |
| Hypotheses | `hypotheses.py` | eight function states per record with separated evidence channels (`configs/ml/hypotheses.json`). |
| Cross-modal | `crossmodal.py` | 26 multilingual text queries (`configs/ml/crossmodal_queries.json`). |
| Maps | `maps.py` | UMAP display maps (display only). |
| Figures | `scripts/plotting/deep_figures.py` | `results/figures/deep_{benchmark,confounds,adaptation,parts}.{pdf,svg,png}` |
| Tests | `test_deep.py` | 9 deterministic tests (no GPU, network or weights). |

Environment: `~/.venvs/vestigium-ml`, a venv with system site packages over the existing
`endosrt` Conda environment (PyTorch 2.11 + CUDA 12.8), adding open_clip, timm,
transformers, sentence-transformers and umap-learn. Exact versions:
`configs/ml/requirements-gpu.txt`. The existing environment was not modified. Pretrained
weights were downloaded once from Hugging Face into the local cache (this task explicitly
authorised external models); every run afterwards is offline (`HF_HUB_OFFLINE=1`).

Measured compute: frozen encoding of 2,716 images takes 3–9 s per encoder and view.
Adaptation takes 72–89 s training per model plus embedding, peak 2.9 GB GPU memory
(RTX 5080, 16 GB). The benchmark takes about 55 s on CPU.

## Metrics and controls

* **Category P@1 / P@10**: same-category share of the top neighbours; the query's whole known
  and near-duplicate group is excluded.
* **Cross-museum P@10**: candidates restricted to other museums; only queries whose category
  exists elsewhere. Random reference = expected share of same-category records among other-
  museum candidates.
* **Within-category museum enrichment**: among same-category neighbours, the same-museum share
  relative to the same-museum share of all same-category candidates. 1.0 = no museum
  clustering beyond category composition.
* **Nuisance R²**: grouped 5-fold ridge prediction of background colour, brightness, saturation,
  log pixel count and aspect from the embedding.
* **Photography-only control**: eight standardised nuisance descriptors used as a representation.
* **Held-out museum probe**: logistic regression fit on Boerhaave, tested on Region Skåne, and
  reverse, on shared classes.
* **Weak-function AP**: kNN label transfer among records with at least one rule label
  (unassigned functions treated as negative *for this proxy only*).
* **Paired group bootstrap** for differences between representations on identical queries.

## Results

### 1. Representation benchmark (`benchmark-acd27a8d7bde`, n = 2,545)

| Representation | Category P@10 [95% CI] | Cross-museum P@10 [CI] | Same-museum enrichment | Background R² |
|---|---|---|---|---|
| DINOv2 L/14, raw | 0.844 [0.834, 0.854] | 0.737 [0.723, 0.750] | 1.59× | 0.83 |
| DINOv2 B/14, raw | 0.831 | 0.709 | 1.61× | 0.86 |
| SigLIP 2 B/16, raw | 0.839 | 0.706 | 1.61× | 0.92 |
| CLIP L/14, raw | 0.785 | 0.631 | 1.62× | 0.84 |
| ResNet18, raw (earlier baseline) | 0.757 | 0.567 | 1.62× | 0.91 |
| DINOv2 L/14, object on white | 0.764 | 0.638 | 1.47× | 0.57 |
| DINOv2 L/14, silhouette | 0.695 | 0.557 | 1.38× | 0.05 |
| Outline descriptors (existing) | 0.660 | 0.551 | 1.27× | — |
| Photography descriptors only | 0.537 | 0.376 (random 0.377) | 1.64× | — |
| Fusion photo + silhouette | 0.845 | 0.724 | 1.56× | — |

Observations:

1. Self-supervised DINOv2 gives the best image retrieval and cross-museum transfer;
   +0.186 [0.174, 0.199] cross-museum P@10 over the outline baseline.
2. Raw-photo embeddings encode photography (background R² 0.83–0.92) and cluster by museum
   within categories (≈1.6×). Removing the background reduces both, and also reduces transfer.
3. Photography alone predicts category inside a museum (0.537 vs chance 0.345) but not across
   museums (exactly random), and does not transfer between museums (probe macro-F1 0.09/0.25).
4. On pure silhouettes, deep encoders equal the hand-crafted outline distance
   (DINOv2-L −outline +0.006 [−0.004, 0.017]). Deep models add value through internal
   structure, material and shading, the same channel that carries the confounds.
5. Image size is decodable even from catalog-text embeddings (R² ≈ 0.9): resolution is a
   museum marker, not an object property.
6. Image-only fusion adds nothing over DINOv2-L alone. Fusion with text scores higher only
   because the targets are text-derived.
7. Merging near-duplicates changes every metric by ≤ 0.001 (`benchmark-b390bd17f4df`).

Held-out museum probe (macro-F1, DINOv2-L vs ResNet18): Boerhaave → Region Skåne 0.65 vs
0.53 (5 classes, 462 records); Region Skåne → Boerhaave 0.78 vs 0.49 (4 classes, 1,569).

![Benchmark](../results/figures/deep_benchmark.png)
![Confounds](../results/figures/deep_confounds.png)

### 2. Photography-randomised adaptation (`adaptation-s17/18/19`)

DINOv2-B/14 with the last four blocks unfrozen, an MLP image head and a linear head on
frozen multilingual-E5 catalog text embeddings; multi-positive InfoNCE (texts with cosine ≥ 0.97
are positives), 20 epochs. Augmentation composites the segmented object (mask eroded by one
pixel) onto random backgrounds with p = 0.8. It also randomises resolution (longest side
48–260 px), rotation, flips, brightness, contrast, greyscale, blur and padding. Training uses
only `train`-split groups after near-duplicate merging (1,594 records, or 1,321 without Region
Skåne). Variants: all museums, Skåne excluded, no compositing; seeds 17, 18, 19.

| Unseen-museum set (all Skåne + other test groups, n = 886) | Cross-museum P@10 | Same-museum enrichment | Background R² |
|---|---|---|---|
| Frozen DINOv2 B/14 | 0.717 | 1.79× | 0.83 |
| Frozen DINOv2 L/14 | 0.760 | 1.75× | 0.81 |
| Adapted, Skåne never seen (mean ± SD, 3 seeds) | 0.763 ± 0.005 | 1.56× | 0.36 ± 0.03 |
| Adapted, Skåne train groups seen | 0.782 ± 0.005 | 1.82× | 0.41 ± 0.03 |
| Adapted without compositing | 0.761 ± 0.011 | 1.89× | 0.63 ± 0.04 |

* Versus its own frozen backbone, the never-seen-museum model gains +0.046 cross-museum P@10
  (seed range 0.041–0.051; seed-17 CI [0.029, 0.062]).
* Versus frozen DINOv2-L the gain is +0.003 (seed-17 CI [−0.011, 0.019]): no improvement over
  the larger frozen model. An earlier single-seed run that suggested +0.015 had 45
  same-photograph pairs crossing its split; it is superseded (`results/ml/deep/superseded/`).
* Compositing lowers background decodability (0.36–0.41 vs 0.63) and museum clustering
  without changing retrieval (paired CIs include zero).
* Adaptation is supervised by text naming the category, so the in-category gain (+0.054 test
  P@10) is expected, not a discovery.

![Adaptation](../results/figures/deep_adaptation.png)

### 3. Working ends (`parts-33b12c0935ee`)

Fine subtypes from Boerhaave English object names, excluding generic names: 31 subtypes, 988
records (for example artery / dental / stone / polyp / bone-cutting forceps; nasal / ear /
vaginal / oral specula; ridged / uterine probes). Within the same coarse category,
fine-subtype P@10 is 0.606 for the raw whole object, 0.566 on white, 0.573 for whole + ends,
0.520 for ends only and 0.426 for end geometry. Ends alone are worse than the whole object
(−0.046 [−0.059, −0.033]). The part-based hypothesis from the affordance literature is **not
supported at thumbnail resolution**. Ends of thin instruments are only a few pixels wide;
repeat on full-resolution images before rejecting the idea.

![Working ends](../results/figures/deep_parts.png)

### 4. Zero-shot affordance prompts (`affordances-49095365669a`)

Prompts describe visible form (hinged jaws, crossing blades, needle tip, scoop end, spreading
blades, finger rings, ratchet lock…). Mapped to functions, they agree only weakly with rule
labels: mAP 0.39 for SigLIP 2 raw and 0.29 for CLIP, against prevalence 0.19; extraction and
scraping are near chance. Neighbour transfer reaches 0.91. They are kept as a separate,
explicitly labelled **physical-affordance** channel, never as function evidence.

### 5. Cross-modal search (`crossmodal-94474c72616c`)

Test-split precision@20 over 18 category queries is 0.72 for zero-shot SigLIP 2 (English 0.78,
Dutch 0.67, Swedish 0.71) and 0.57 for the adapted model; base rate 0.19. The adapted text head
learned full catalog descriptions, so it is better at image → own-text retrieval (R@1 0.26 vs
0.07) but worse at short queries. The website defaults to SigLIP 2.

#### 5b. Task vocabulary for the website (`tasksearch-d80e56a358ec`)

`task_search.py` ranks SigLIP 2 raw-photo features against 66 queries in
`configs/ml/task_queries.json`, grouped by clinical need (deliver, hold open, grasp, cut,
probe, extract, scrape/burn/saw), by visible design feature, and by controls. The 26
cross-modal queries are included unchanged and reproduce `crossmodal-94474c72616c` exactly
(same top-20 IDs and cosines). Mixed-precision text embeddings depend slightly on batch
composition, so near-tied ranks can swap; the script therefore encodes the shared queries as
the original batch and the new ones separately. The 40 new queries were written **after** F10
was known, so they are exploratory: 13 are scorable (one coarse category with ≥ 20 test
records), with mean test P@20 0.66 against a base rate of 0.19. They are not pooled into F10.

Two observations shape how the website presents search:

- **No "is there a match" signal.** Controls ("a door key", "a comb", "a kitchen spoon")
  separate their top 20 from the collection median as strongly (2.4–3.0 SD) as real queries
  (1.5–4.4 SD). A zero-shot ranking always has a top, so rank is shown and separation is not.
- **Object names beat task descriptions.** "a small funnel for looking into the ear" gives
  P@20 0.95 and "scalpel" 0.80, but "an instrument that spreads apart to hold the vagina open"
  returns obstetric forceps (0.20) and "a dilator to widen a narrow passage" returns probes
  (0.05). SigLIP 2 matches named object types and visible form, not clinical function, which
  limits task-first discovery with zero-shot text alone.

### 6. Disagreements (`disagreements-db66d30058e3`)

A record is a category conflict when ≥ 7 of its 10 DINOv2-L neighbours share another category:
168 records after the mapping fix, 185 before. One coder visually coded the top 24 (thumbnail
plus three neighbours):

| Code | n | Meaning |
|---|---|---|
| resolution_limit | 5 | thin shafts; working ends unresolved |
| shared_lever_mechanism | 5 | specula and dilators built on the forceps lever, spreading instead of closing |
| taxonomy_boundary | 4 | clamp vs grasping forceps: same ring-handled form |
| shared_large_fenestrated_blades | 4 | look-alikes of obstetric forceps |
| label_mapping_error | 2 | our mapping put the 34 stone forceps under "Lithotomes" → blade |
| archaeological_incompleteness | 1 | Met bronze scalpel/dissector without its blade |
| photographic_style | 1 | scale-card photographs cluster together |
| possible_catalog_image_mismatch | 1 | "pliers, stranger" showing a wire loop |
| handle_without_blade | 1 | detachable-blade handle resembles tweezers |

The audit also surfaced a rule problem in the existing provisional annotations: the `edge`
rule assigns **cutting** to all 34 stone forceps because it matches the word "Lithotomes".
The frozen release is unchanged; the conflict is exposed in the hypotheses and recorded
for the next rules version. The near-duplicate audit found that META-002404, catalogued as
"seaweed", carries a mirrored copy of the photograph of META-002288, "grain pliers".

Image and text top-10 neighbour sets barely overlap (mean Jaccard 0.054). This is partly an
artefact: many records share identical texts (for example 77 × "Artery forceps"), so text
neighbours are effectively ties.

### 7. Multi-channel functional hypotheses (`hypotheses-84e39eb0321f`)

Channels are kept separate per record and function:

| Channel | Evidence type |
|---|---|
| documented source statements | documented use |
| existing context rule | weak inference, text-derived |
| photo neighbours (DINOv2-L) and silhouette neighbours (DINOv2-B), calibrated | inferred function |
| zero-shot prompt cues and end geometry | physical affordance (form, not use) |

Neighbour votes (k = 15, labelled neighbours outside the query's group) are isotonic-calibrated
on validation groups against rule labels. Test ECE is ≤ 0.051 for every function and channel.
The calibrated value estimates **agreement with the rules on held-out groups, not the
probability of actual use**.

The states use thresholds fixed before the outputs: image hypothesis ≥ 0.8; conflict ≤ 0.1.

| State | Count |
|---|---|
| corroborated | 2,419 |
| rule only | 512 |
| image hypothesis (new, single-object records only) | 147 |
| conflict | 74 |
| documented (function word in source) | 7 |
| abstain | 19,481 |

Flags: 69 image hypotheses are photography-dependent (photo supports, silhouette does not),
38 have silhouette agreement and 92 are atypical for their catalog category (40 are specula
receiving "gripping": the shared-mechanism effect). 48 conflicts are typical for their
category (for example dental forceps vs extraction: use is not visible in form).

Version 1.1.0 added two rules **after** inspecting the first outputs, without changing the
thresholds: withholding hypotheses for depictions and kits, and the category-profile flags.
See the config changelog.

### 8. External corpus: transfer and modern analogs (`external-81df30dd6be8`)

[EXTERNAL_DATA.md](EXTERNAL_DATA.md) documents 4,590 openly licensed images from Wikimedia
Commons (3,370) and the Wellcome Collection (1,220), with weak classes from titles and
categories, eras, licences, 2,686 recorded exclusions and near-duplicate groups. A probe fit only
on internal DINOv2-L features for four shared families (forceps, blade, probe, speculum) was
tested on 1,248 external photographs:

* raw view: balanced accuracy 0.61, macro-F1 0.60, accuracy 0.73 [0.70, 0.76] (majority 0.56;
  chance balanced accuracy 0.25);
* by era: contemporary 0.83 (n = 62), historical 0.55 (n = 589); by source: Commons 0.63,
  Wellcome 0.56. Probes are the weakest class (17 / 37 correct) and are often called blades;
* silhouette view: balanced accuracy 0.36. External segmentation was never validated, so this
  may be a segmentation failure rather than evidence against shape.

Modern analogs are the nearest of the 171 contemporary photographs used (of 177 contemporary images), top-5 vote. Grasping forceps →
forceps 555, needle holder 296, scissors 204; specula → speculum 107; blades → scalpel/knife 97.
These are family-level visual neighbours, not descent or equivalent use. One teaching-set
photographer dominates the contemporary set, which inflates needle holders. The website shows
analogs as title, class and source link only: some external images may show clinical scenes.

## Interpretation

* **Observation:** deep image models capture catalog-level instrument type well and transfer
  across museums, but raw photographs entangle object information with museum photography.
* **Observation:** for 2-D outline alone, interpretable descriptors are as good as deep features.
* **Inference:** whole-form similarity is driven by construction and mechanism (crossed levers,
  spring arms, fenestrated blades) more than by function; the same lever can close (forceps)
  or spread (specula).
* **Inference:** similarity cannot separate inherited design from convergent solutions; it
  proposes comparisons for documentary testing, not lineages.
* **Speculation:** cross-category silhouette look-alikes across Dutch, Swedish and
  ethnographic collections may include functional convergences worth expert comparison.

## Leakage and reproducibility controls

* Known groups (accession aliases, identical image hashes, pilot groups) plus 79
  embedding-near-duplicate pairs; the query's whole group is excluded from retrieval.
  Adaptation splits use the merged groups.
* Every result file records dataset version, config and code SHA-256, feature hashes
  (digest of rounded vectors) and seeds. Superseded results are kept with reasons.
* Deterministic letterboxing, seeded bootstrap, UMAP and training; GPU non-determinism in
  training is bounded by reporting three seeds.
* Caches (`data/processed/ml/`: views derived from museum images, vectors, adapted weights
  as safetensors) are ignored by Git; commit-sized JSON results are in `results/ml/deep/`.
* No images, vectors or weights are published; the website receives neighbour IDs, scores,
  states and summaries only.

## Reproduce

```bash
cd roman_tool_lineage
ALLOW_DOWNLOAD=1 bash scripts/deep/pipeline.sh       # first time: fills the weight cache
~/.venvs/vestigium-ml/bin/python -m unittest scripts.deep.test_deep -v
MPLCONFIGDIR=/tmp/mpl python scripts/plotting/deep_figures.py
# Website export runs inside the normal site build (scripts/web/build_site.py).
```

## Next experiments

See `next_experiments` in `results/ml/deep/findings.json`:

1. blinded expert pair judgments to replace weak-label proxies;
2. full-resolution images for the working-end test;
3. stratified review of the 147 hypotheses and 74 conflicts (and the Lithotomes rule);
4. mechanism-aware labels, separating closing, spreading, spring, screw and fixed-blade;
5. leave-one-museum-out at scale with an adversarial invariance comparison;
6. a larger, multi-photographer contemporary reference set and validated external segmentation;
7. explicit historical-relationship tests from dated designer and maker links.
