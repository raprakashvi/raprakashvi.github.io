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

### 9. Text- and date-conditioned silhouette generation (`silgen-e605e67faa35`)

An exploratory "discovery" test. Can a generative model draw a plausible outline for a tool
from its catalog name and date better than simply looking up the closest name? The setup was
pre-registered in `configs/ml/silhouette_generation.json` (`silgen-1.0.0`) before any training.
Six amendments are listed in the config, all made before training or sampling: narrower UNet,
speck and frame-strip cleaning, cheaper baselines, the prompt gallery and the era breakdown.

**Data.**

* 2,597 accepted morphology outlines in a canonical pose: principal axis horizontal,
  long side 116 px on a 128 px canvas. Size is removed.
* 58 masks had stray specks removed and 21 had a straight frame-edge strip removed. Three
  records were only a strip and are excluded (META-001139, -001141, -001147).
* Names have their accession numbers stripped and are embedded with frozen SigLIP 2 B/16
  text. Dates are encoded as z = log10(2026 − midpoint) − 2. The 614 undated records use a
  learned null.
* Known issue, not corrected: 114 Region Skåne records are named "seaweed", a probable
  machine translation of Swedish *tång* (tongs).

**Model.** Pixel-space DDPM: cosine schedule, v-prediction, UNet (32/64/128/256, about
17.9 M parameters), classifier-free dropout 0.15 per condition. Sampling uses DDIM, 50 steps,
guidance 2.0, with k = 4 samples per record.

**Two tests.**

* *Held-out*: trained on the release train split (1,532), 25,000 steps, seed 17. Scored on
  the test split (514 records, 551 validation records unused).
* *Retrodiction*: trained only on dated outlines ending ≤ 1850 (369 records: 206 grasping,
  125 probe, 20 speculum, 18 blade). 10,000 steps, seeds 17/18/19. Scored on records starting
  ≥ 1850 that share no leakage group with training (1,505). Excluded and counted: 614 undated,
  109 straddling 1850, 3 sharing a group.

**Metrics and baselines.**

* Metrics: flip-invariant mask IoU, and the DINOv2-B CLS cosine of black-on-white renders.
  Each is the mean over the k candidates per record, with 95% leakage-group bootstrap
  intervals (2,000 resamples) and paired per-record differences.
* Baselines: the k training outlines with the nearest SigLIP name; k random outlines of the
  same family; the unconditional generator; and a name-only ablation (retrodiction, seed 17).
* **Decision rule:** generation "adds information beyond retrieval" only if *both* paired
  differences against nearest-name retrieval have intervals above zero.

Mean-of-4 scores (95% CI):

| Method | Held-out IoU | Held-out DINOv2 | After-1850 IoU | After-1850 DINOv2 |
|---|---|---|---|---|
| Generator (name + date) | 0.280 [0.269, 0.291] | 0.674 [0.665, 0.683] | 0.231 [0.226, 0.236] | 0.615 [0.610, 0.620] |
| Generator (name only) | — | — | 0.257 [0.252, 0.262] | 0.633 [0.628, 0.638] |
| Nearest training name | 0.314 [0.301, 0.327] | 0.698 [0.689, 0.709] | 0.281 [0.276, 0.286] | 0.674 [0.668, 0.679] |
| Random, same family | 0.255 [0.246, 0.264] | 0.627 [0.619, 0.635] | 0.265 [0.261, 0.270] | 0.612 [0.606, 0.617] |
| Generator (no condition) | 0.205 [0.199, 0.211] | 0.615 [0.608, 0.622] | 0.235 [0.231, 0.238] | 0.621 [0.615, 0.626] |

**Decision: no evidence of generation beyond retrieval in either test.**

* Generator minus retrieval, held-out: IoU −0.034 [−0.044, −0.024], DINOv2 −0.024
  [−0.033, −0.016].
* After 1850 (three seeds pooled): IoU −0.050 [−0.055, −0.045], DINOv2 −0.059
  [−0.065, −0.053].
* Every seed is negative: IoU −0.062, −0.046, −0.043.

Secondary checks (descriptive):

* **Conditioning works within the training distribution.** In the held-out test, the
  generator beats the unconditional model (IoU +0.075 [0.066, 0.085]) and a random outline
  of the same family (IoU +0.025 [0.015, 0.036], DINOv2 +0.047 [0.038, 0.057]). In other
  words, the name steers the drawing.
* **The date hurts when it is outside training.** After 1850, name + date is no better than
  the unconditional model (IoU −0.004 [−0.008, 0.000]), and it is below name only
  (IoU −0.038 [−0.043, −0.033], seed 17). Every after-1850 date lies beyond the ≤ 1850
  training range, so the date embedding is extrapolated.
* **Era breakdown of the held-out test**, generator minus retrieval:

  | Era | n | IoU difference | DINOv2 difference |
  |---|---|---|---|
  | ≤ 1850 | 77 | −0.053 [−0.085, −0.023] | −0.050 [−0.074, −0.027] |
  | ≥ 1850 | 293 | −0.042 [−0.055, −0.030] | −0.032 [−0.045, −0.021] |
  | Straddling 1850 | 20 | −0.044 [−0.094, 0.001] | −0.039 [−0.087, 0.004] |
  | Undated | 124 | −0.002 [−0.020, 0.017] | +0.014 [−0.002, 0.031] |

  Retrieval keeps its advantage for after-1850 tools even when their era is in training.
* **By family** (held-out): the generator matches retrieval for grasping instruments (IoU
  0.278 vs 0.286) and specula (0.338 vs 0.326). It is far behind for probes (0.218 vs 0.344)
  and blades (0.384 vs 0.487), where thin parts break up.
* **Clamp subset**, after 1850: 145 records, against 5 clamp-named outlines before 1850.
  Generator minus retrieval: IoU −0.027 [−0.039, −0.016], DINOv2 −0.139 [−0.159, −0.118].
  The generator does not anticipate the ring-handled, ratcheted clamp from "Klemtang"/"artery
  forceps" plus a later date. Its samples are fragmented or blobby
  (`deep_silgen_retro_examples`).
* **Memorisation: none detected.** No generated outline has IoU ≥ 0.9 with any training
  outline. The median nearest-training IoU is 0.506 held-out and 0.437–0.483 after 1850,
  *below* the 0.613 and 0.541 of real held-out outlines. Samples are further from the
  training set than real tools are. Given the scores above, this reflects lower fidelity, not
  novelty.
* **Coverage** (k-NN precision/recall, DINOv2, k = 5): held-out 0.91 / 0.75; after 1850
  0.72–0.74 / 0.64–0.68 over the three seeds.
* **Gallery** (12 fixed prompts × 1750/1850/1950/undated, full model):
  * "Artery forceps" gives ring-handled clamps, and "Dental forceps" gives forceps.
  * Short object names work better than clinical descriptions.
  * The control "a kitchen spoon" yields a probe/spoon-like instrument (median nearest-train
    IoU 0.69): the model can only recombine what it was trained on.

Figures: `results/figures/deep_silgen_metrics`, `deep_silgen_retro_examples` and
`deep_silgen_gallery` (`.svg`/`.pdf`/`.png`, via `scripts/plotting/silgen_figures.py`). The
website's Research → AI Methods → **Generated outlines** tab shows the verdicts, the gallery,
fixed before/after-1850 rows and all score tables from `ai-deep/generate.json`. Masks are
packed bits; no weights are published.

Caveats:

* SigLIP's text tower learned language from modern web data. The retrodiction is therefore
  blind to later *shapes* but not to later *vocabulary*.
* Masks come from uncalibrated photographs, with no scale or mechanism.
* The pre-1850 set is small and dominated by two museums (Boerhaave 228, Met 138).
* The full model has one seed.
* After the results file was written, the evaluation's final console print raised a KeyError
  on the gallery entry. The print loop was fixed. Metrics, samples and the result file were
  unaffected, but the recorded `code_sha256.eval` refers to the version before that fix.

### 10. Decoding the shape space (`latdec-6c750b9d3c56`) and the tempo of change (`tempo-eb35961c30ed`)

The question: the 2-D map has white space between clusters. Is that real empty space, so that
tool forms jump between islands, or is there room for intermediate forms? Two pre-registered
studies address it. The first works only in the latent space: a frozen encoder, a trained
decoder, and decodes of chosen latent points (`configs/ml/latent_decoder.json`, `latdec-1.0.0`).
The second uses no decoder; it fits paleontology's models of tempo to the dated record
(`configs/ml/tempo.json`, `tempo-1.0.0`). Flowcharts: `results/figures/deep_flow_latdec`
and `deep_flow_tempo`.

**Which embedding is the map?** AI Methods → Embedding map is UMAP (n_neighbors 20,
min_dist 0.15, cosine, seed 17). Morphology → Shape space is t-SNE on a pose-free combined
shape distance. Neither plane preserves empty space. The UMAP plane keeps only 7% of each
tool's 10 nearest neighbours (`latent_geometry.map`), so white space on the map is judged
here in the 768-d latent, not on the plane.

**Pose-agnostic map.** The silhouette map was built from unrotated masks, so photographed
angle, mirror and scale moved points. It is now rebuilt from the pose-normalised latent below
(`maps-f2935ececfca`, 2,597 records). Its 10-NN agree with the old features in only 17% of
cases. Silhouette retrieval, the evidence channel and multimodal fusion still use unrotated
masks; they switch after re-benchmarking. The photo map is angle-dependent by construction.

**Latent and decoder.**

* **Latent.** DINOv2-B/14 CLS on the canonical-pose silhouettes from §9 (2,597 records,
  768-d, unit norm, frozen; four flips cached for training).
* **Decoder.** The §9 UNet and DDPM conditioned on z through the text slot, with the date
  always null. It is trained on the train split (1,532 records), 25k steps, seed 17, final
  loss 0.022.
* **Guidance.** Chosen on validation from {1, 1.5, 2, 3} by mean-of-4 IoU. It selected 1.0;
  IoU falls with stronger guidance (0.42 → 0.15).
* **Amendment before any trained decode.** The registered gap definition (a point is in a gap
  when its maximum cosine to a training latent is below τ = 0.760, the 5th percentile of real
  records' other-group maximum) cannot flag slerp midpoints, because a midpoint's cosine to
  each endpoint is cos(θ/2). A k = 10 mean-cosine density (τ10 = 0.718) and a prior arm were
  added. Both definitions are reported.

**Results.** Intervals are 95% leakage-group or pair bootstraps with 2,000 resamples.

| Test | Result |
|---|---|
| Reconstruction of held-out tools, n = 514 (506 groups) | Decoder IoU 0.41, DINOv2 cosine 0.82. Nearest training latent IoU 0.44, cosine 0.87. Difference IoU −0.025 [−0.035, −0.014], DINOv2 −0.056 [−0.060, −0.052]. **Decision: no evidence the decoder goes beyond latent retrieval.** |
| Cycle (re-encode the decode) | Mean cos(E(D(z)), z) on test = 0.80; "lands back" threshold ρ = 0.632 (5th percentile) |
| Memorisation | Decoded outlines' median nearest-train IoU 0.56 (real held-out: 0.61); 0.05% ≥ 0.9 |
| Path interior points in a gap (k = 10) | Neighbour pairs (200): 0.07%; random pairs (200): 0.5%; ≤1850 → ≥1850 same family (293): 0.05%. Registered definition: 0% everywhere. Least similar 2,000 test pairs (endpoint cosine ≤ 0.29): midpoint gap share 0.05%. |
| Path points that land back | 98–99.7% of occupied interior points. Gap points: 1 of 1, 3 of 7 and 0 of 1. |
| Abruptness of paths (largest step / total, 1/8 = even) | 0.27, 0.24 and 0.26. The largest step's position is spread across all 8 steps; one step carries over half the change in 0, 0 and 0.7% of paths. |
| Gaussian prior draws, n = 1,024 | 3.8% fall in a gap. Gap draws land back 36% [21, 51] (n = 39) vs 89% [87, 91] for the others. Spearman(density, cycle) = 0.65; the lowest density quintile lands back 62% vs 88–96% above it. |

Reading:

* **Observation.** In the 768-d latent, straight paths between tools pass through occupied
  space. This holds even between very dissimilar tools. Points drift toward the dense centre
  rather than through voids, and almost all of them decode to outlines that re-encode near
  where they were asked.
* **Observation.** Truly empty regions exist, but they are reached by random draws, not by
  paths between tools. They sit around unusual records (the nasal speculum endpoint is itself
  in a gap), and the decoder mostly fails there.
* **Inference.** The map's white space is a projection artefact, not evidence of
  punctuation. As far as this latent can tell, there is "room" for intermediate forms between
  most tools.
* **Limit.** The decoder adds no fidelity over looking up the nearest training latent, so
  decoded intermediates are plausible in-distribution outlines, not new designs. Abruptness
  of a decoded path describes the decoder; it is not history. No baseline for abruptness was
  registered, and 0.24–0.27 is what eight noisy steps give without a single jump.

**Tempo: gradual or punctuated (paleoTS).**

* **Data.**
  * Records with a catalog range of at most 100 years and a midpoint in 1650–2025: 1,844 of
    2,597. Not used: 614 undated, 115 with ranges wider than 100 years, 24 outside the window.
  * 1,840 of the 1,844 are Museum Boerhaave.
* **Series.**
  * Trait: per family, PC1 and PC2 of the latent (PCA per family).
  * 25-year bins of the midpoint; bins with fewer than 3 records dropped and counted; at
    least 6 bins per series.
  * Sampling error is the pooled within-bin variance divided by n.
* **Models.** Five models in the joint parameterisation, compared by AICc (Hurvich & Tsai
  1989) and Akaike weights:
  * stasis (Hunt 2007);
  * unbiased and directional random walks, URW and GRW (Hunt 2006);
  * Ornstein-Uhlenbeck, OU (Hunt, Bell & Travis 2008);
  * one-shift punctuation with at least 3 bins per segment (Hunt 2008).
* **Recovery.** Every fitted series and model is simulated 100 times at the observed bins and
  errors (seeds 17+), and all five models are refitted.
* **Registration.** The config was registered after an exploratory four-model fit; OU and
  the recovery simulation were added at registration.

| Family · axis | Outlines · bins | Best (Akaike weight) | Recovered when true | Max false-jump rate |
|---|---|---|---|---|
| blade · PC1 / PC2 | 116 · 6 | URW (0.58 / 0.51; stasis 0.35 / 0.47) | 31% / 39% | 0% (one shift position only) |
| grasping · PC1 | 1,151 · 14 | punctuation 0.48 (stasis 0.30), shift ≈ 1900 | 76% | 34% |
| grasping · PC2 | 1,151 · 14 | punctuation 0.95, shift ≈ 1875 | 85% | 35% |
| probe / spatula / spoon · PC1 / PC2 | 313 · 11 | GRW (0.40 / 0.36; punctuation 0.34 / 0.31) | 80% / 98% | 11% / 7% |
| speculum / dilator · PC1 | 264 · 8 | stasis 0.72 | 90% | 1% |
| speculum / dilator · PC2 | 264 · 8 | GRW 0.88 | 93% | 1% |

Pooled recovery (diagonal) across the 8 series:

| Stasis | URW | GRW | OU | Punctuation |
|---|---|---|---|---|
| 0.86 | 0.26 | 0.43 | 0.03 | 0.35 |

At these series lengths, OU is practically unrecoverable, so its never winning means
nothing. Random walks and trends are often taken for each other. In 50-year bins, grasping
becomes stasis (PC1) or URW (PC2); the other families have too few bins.

Reading:

* **Observation.** The record is mixed, as in fossil lineages. Hunt (2007) found directional
  change best in about 5% of more than 250 sequences, and Hunt, Hopkins & Lidgard (2015)
  found 13% with complex models often favoured for long series. Here, the best models across
  the 8 series are stasis 1, URW 2, GRW 3, OU 0 and punctuation 2. Trends are more common
  than in fossils, but trend and URW are weakly separable at these lengths.
* **Weak evidence.** The only jumps are in grasping tools (shift ≈ 1875–1900). A random walk
  or trend with the fitted parameters produces a false jump 30–35% of the time on the same
  bins, and the jump disappears in 50-year bins. Random walks can mimic punctuation
  (Hunt 2008).
* **Confounds.** A fitted jump can come from collecting or cataloguing history, or from a
  changing mix of sub-types within a family, rather than from design. With one museum, this
  is the main alternative. More institutions will test it.

Figures (`.svg`/`.pdf`/`.png`):

* `results/figures/deep_latdec_metrics`, `deep_latdec_paths` and `deep_latdec_prior`, via
  `scripts/plotting/latdec_figures.py`;
* `deep_tempo_series` and `deep_tempo_recovery`, via `scripts/plotting/tempo_figures.py`;
* `deep_flow_*`, via `scripts/plotting/flow_figures.py`.

The website's AI Methods → Generate tab has three views: From a name (§9), From the shape
space (`ai-deep/latent.json`) and Gradual or jumps? (`ai-deep/tempo.json`, with references
and DOIs). The export adds a descriptive step profile (`path_steps`) from the saved samples.

**Are middle-period tools in between? (`between-0b9336a35ba9`, `configs/ml/between.json`).**
The 1750–1850 window was proposed by the user. The test was registered after only the
per-period record counts had been seen. The setup:

* **Periods.** A record belongs to a period only if its whole catalog range lies inside it:
  * early: from 1600 (or 1650) to the window start;
  * middle: the window;
  * late: from the window end to 2025.
* **Families tested.** Only families with at least 10 records in every period.
* **Statistics.**
  * The middle records' mean position t on the axis from the early mean to the late mean.
  * The middle mean's offset from that axis, divided by the early–late distance.
  * 95% leakage-group bootstrap intervals (2,000 resamples).
  * A label-shuffle test that early and late differ at all (2,000 shuffles).

| Window · family | Early / middle / late | t [95% CI] | Change p | Verdict (registered rule) |
|---|---|---|---|---|
| 1750–1850 · grasping | 34 / 92 / 964 | 0.15 [0.05, 0.68] | 0.0075 | in between |
| 1800–1900 · grasping | 80 / 260 / 676 | 0.12 [−0.02, 0.37] | 0.0005 | still like the early tools |
| 1800–1900 · probe / spatula / spoon | 40 / 84 / 162 | 0.79 [0.65, 0.92] | 0.0005 | in between |
| 1800–1900 · speculum / dilator | 15 / 54 / 142 | 0.88 [0.76, 1.02] | 0.0005 | already like the late tools |

Families not tested:

* 1750–1850: blade 3 / 9 / 70, probe 1 / 26 / 244, speculum 12 / 4 / 230.
* 1800–1900: blade 5 / 52 / 54.

Reading:

* **Observation.** Grasping tools changed mostly after 1900. This agrees with the tempo fit,
  which places the grasping jump around 1875–1900. Probes had moved most of the way by
  1800–1900, and specula had already arrived.
* **Limit (offset measure).** Sampling noise always adds offset, so this measure has little
  power: the shuffled 95th percentile is 0.75–1.07, and none of the 4 tests flags it. The
  1750–1850 grasping middle mean lies 0.94 of the early–late distance off the line, which
  is borderline (shuffles reach it 5.3% of the time).
* **Exploratory, after the result.** Grasping positions are bimodal. Tools beyond
  t = 1.5 are 9% of early, 15% of middle and 36% of late grasping tools (1800–1900 window),
  mostly artery forceps and ring-handled clamps. Older forms (dental and obstetric forceps,
  tweezers) persist. The moving average therefore reflects a new form that is added and
  grows in share, not a gradual transformation of old forms. With one dominant museum,
  collecting history is an alternative explanation.

Pictures: the latent decoder draws the early, late and middle means and three stops between.
These are display only. Next to them are the four real middle-period outlines most similar to
the middle mean. Figure: `results/figures/deep_between` (`scripts/plotting/between_figures.py`).
Website: Generate → Gradual or jumps? → "Are tools from in-between dates in between in shape?"
(`ai-deep/between.json`). An earlier run of this configuration (`between-ab7331c73a59`, same
statistics) picked the example outlines by position on the axis instead of by shape; it is
superseded.

**Hover drawings on the map (`mapdecode-2c9674c83fda`, display only).**
`scripts/deep/map_decode.py` refits the silhouette UMAP with its recorded parameters and
requires that it reproduce the published plane exactly. The process:

* Each centre of a 64 × 64 grid over the plane is mapped back to the latent with UMAP's
  `inverse_transform` and normalised.
* Each point is decoded once, with guidance 1.0 and the same starting noise for every cell.
* Each cell records:
  * its plane distance to the nearest tool ("near" means within 3/64 of the map width);
  * k = 10 density;
  * cycle cosine;
  * the nearest real record.

What the grid shows:

* 2,412 of 4,096 cells are near a plotted tool.
* No cell falls in a latent gap, and all cells land back (median cycle cosine 0.89).
* This is expected: an inverse UMAP blends nearby tools, so these drawings are
  interpolations, not discoveries. Far cells are labelled as guesses on the page.

On the website, the drawings are published as 16 tiles of 16 × 16 cells
(`ai-deep/mapgen-{tx}-{ty}.json`), each loaded the first time the pointer reaches it. The
cell index is `ai-deep/mapgen.json`.

The page:

* shows the real tool when the pointer is on a plotted point, and the drawing only off a point;
* outlines the cell being drawn;
* supports zoom (scroll, + / −, up to 8×) and drag to pan.

A first 32 × 32 run (`mapdecode-8b4ee629e782`) is kept in `results/ml/deep/superseded/`.

**Plain-language layer (website).**

* AI Methods → Map of tools opens on the outline-shape map, with one sentence per layer on
  what places two tools close together. "Adapted" is now "Photo, object only". It is listed
  second, and it is the default in Similar tools; "Whole photo (incl. photography)" moves last
  or under More methods.
* The reason for the switch, on held-out test groups (n = 511, mean of 3 seeds), adapted vs
  frozen DINOv2-L:
  * same-type tools found in other museums: P@10 0.679 vs 0.681, a tie;
  * photo background predictable from the embedding: R² 0.33 vs 0.74.

  The adapted model learned from this collection's catalog categories. For tools it was
  trained on, its ranking therefore partly reflects their catalog category; the page says so.
* Search scores, evidence panels and similarity scores now lead with plain wording; the
  technical numbers stay in small print. Experiments has a "Words used here" glossary.
* Generate opens on "Fill the gaps?" and "Gradual or jumps?". Flowcharts read Input → Step →
  Ready-made AI / AI trained here → Output → Check, with no model names in the boxes.
* The catalog-name test (§9) is a secondary link, because museums name the same tool
  differently.
* Tempo cards:
  * show the five patterns as small curves, with plain names: stays put, wanders, trend,
    settles, one jump;
  * show real outlines at the lower and upper end of each axis;
  * state the evidence as strong, moderate or weak.
* The evidence rule:
  * **Strong:** Akaike weight ≥ 0.7 and recovery ≥ 0.8; for a jump, also false jumps ≤ 0.1.
  * **Weak:** weight < 0.5, recovery < 0.5, or (for a jump) false jumps > 0.2.
  * **Moderate:** otherwise.
* By that rule, only the speculum / dilator axes are strong; the other six are weak.
* The axis-end outlines come from recomputing the per-family PCA in the exporter. The
  exporter requires the recomputed bin means to equal the saved run, up to a principal
  axis's arbitrary sign; it aligns the sign to the run because LAPACK builds differ.

Hash caveats:

* `scripts/deep/latdec.py` was edited after training (feature export and an argv fix for
  `evaluate`). The training logic is unchanged, but the decoder meta's code hash refers to
  the earlier file.
* The decoder evaluation still contains the exploratory four-model tempo fit; `tempo-eb35961c30ed`
  supersedes it.

## Interpretation

* **Observation:** deep image models capture catalog-level instrument type well and transfer
  across museums, but raw photographs entangle object information with museum photography.
* **Observation:** for 2-D outline alone, interpretable descriptors are as good as deep features.
* **Inference:** whole-form similarity is driven by construction and mechanism (crossed levers,
  spring arms, fenestrated blades) more than by function; the same lever can close (forceps)
  or spread (specula).
* **Inference:** similarity cannot separate inherited design from convergent solutions; it
  proposes comparisons for documentary testing, not lineages.
* **Observation:** a small text- and date-conditioned diffusion model over silhouettes does not
  beat looking up the nearest catalog name, either on held-out tools or on tools after 1850
  when trained only on earlier ones (§9). With 369 pre-1850 outlines it cannot anticipate
  later forms such as the ring-handled clamp.
* **Observation:** in the 768-d pose-normalised latent, paths between tools stay in occupied
  space and decode to outlines that re-encode in place; the map's white space is a UMAP
  artefact (§10). A decoder trained on that latent does not beat nearest-latent lookup.
* **Inference:** tempo models fitted to the dated record mostly favour gradual change or
  stasis. The two jumps (grasping tools, ≈ 1875–1900) are weak: they are not robust to binning,
  can be produced by random walks 30–35% of the time, and come from one museum's collection.
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
# Silhouette generation (§9): ~1.5 h training + ~70 min evaluation on one 16 GB GPU
for s in prep 'train full --seed 17' 'train retro1850 --seed 17' 'train retro1850 --seed 18' 'train retro1850 --seed 19' evaluate; do
  PYTHONPATH=. HF_HUB_OFFLINE=1 ~/.venvs/vestigium-ml/bin/python -m scripts.deep.silgen $s; done
MPLCONFIGDIR=/tmp/mpl python scripts/plotting/silgen_figures.py
# Latent decoder (§10): ~1 h training + ~95 min evaluation; tempo: minutes on CPU
for s in latents train evaluate; do PYTHONPATH=. HF_HUB_OFFLINE=1 ~/.venvs/vestigium-ml/bin/python -m scripts.deep.latdec $s; done
PYTHONPATH=. ~/.venvs/vestigium-ml/bin/python -m scripts.deep.tempo
PYTHONPATH=. HF_HUB_OFFLINE=1 ~/.venvs/vestigium-ml/bin/python -m scripts.deep.map_decode   # hover drawings, ~13 min
PYTHONPATH=. HF_HUB_OFFLINE=1 ~/.venvs/vestigium-ml/bin/python -m scripts.deep.between      # between-dates test, <1 min
PYTHONPATH=. ~/.venvs/vestigium-ml/bin/python scripts/plotting/between_figures.py
for f in latdec tempo flow; do PYTHONPATH=. ~/.venvs/vestigium-ml/bin/python scripts/plotting/${f}_figures.py; done
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
