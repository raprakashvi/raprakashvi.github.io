# Vestigium machine learning implementation handoff

Build local research tools for similarity search, unsupervised exploration, supervised
prediction and provisional self-annotation. Start with reproducible baselines and
cached representations. Human review is deferred; it must not block exploratory
retrieval or provisional suggestions. Keep those suggestions separate from source
facts and expert judgments. The website restoration is a separate workstream.

This specification now has a bounded baseline implementation, documented in
[ML_TOOLS.md](ML_TOOLS.md) and [ML_IMPLEMENTATION_STATUS.md](ML_IMPLEMENTATION_STATUS.md).
Text/shape retrieval, unsupervised inspection, provisional suggestions and supervised
readiness are implemented. Expanded image/multimodal encoders, category models,
calibration and substantial learning experiments below remain planned. The broader scientific proposal is in
[ML_ROADMAP.md](ML_ROADMAP.md).

## Current inputs and scientific limits

Work from `roman_tool_lineage/` in the source repository, branch
`vestigium-2026-10-21`. Discover the release through `data/processed/web/current.json`,
then freeze the resolved version and file hashes for each run. At handoff the release
is `v1-804c1e7c3202`, with 2,830 stable records and 2,718 distinct linked image assets.
114 records have no image. Record-level units include objects, kits, witnesses and
catalog groups; they are not all independent physical instruments.

| Input | Location and interpretation |
|---|---|
| Frozen records and assets | `data/releases/<version>/{manifest.json,records.jsonl,assets.json,identifiers.json,item.schema.json}` |
| Source functions | `functions.documented`; record source role and locator. Museum wording can still be uncertain. |
| Existing provisional labels | `derived.working_annotation`; 2,621 records have contextual function hypotheses, 209 remain unassigned. Rules and evidence are versioned; these are weak labels. |
| Original descriptions | `description`, `raw`, `provenance`; preserve wording. Generated `context_summary` is not independent evidence. |
| Original shape features | `data/processed/morph/analysis_set.csv`; 2,600 silhouettes, with existing QC and multiblock distances. |
| Additional outlines | `data/processed/morph/supplemental/features.json`; five automatic-QC passes and one retained failure. No physical scale. |
| Leakage groups and pilot | `data/review/pilot-2254e7f3e6c4/`; resolve the current pilot through `data/processed/web/review_current.json`. Regenerate into a disposable site using `scripts/web/review_pilot.py`. `leakage_groups.json`, `provisional_splits.csv`, `pilot.json` are frozen, provisional group assignments. |
| Review history and masks | Browser exports from the annotation page; `scripts/web/review_exports.py` validates and exports explicit observed masks. No expert-reviewed ground truth exists yet. |

The user has authorized use of the available images for local research. Record that
run-level authorization separately from museum rights/eligibility fields; do not rewrite
unknown source rights into a claimed license. Pilot `training_eligible: false` also
reflects unreviewed labels and must not block text/shape exploration or user-authorized
local representation experiments. Public redistribution and automatic uploads remain
outside this handoff's default actions.

Confirm all paths and counts from the manifest rather than hardcoding these values.
The original neighbor matrix covers 2,600 shapes, not all 2,830 records. Supplemental
outlines do not yet have recalibrated matrix ranks. Photographic shape proximity,
embedding similarity and historical ancestry are different quantities.

## Proposed package and command contract

Add a small `scripts/ml/` package with reusable loaders rather than duplicating the
website ingestion code. Put experiment configs in `configs/ml/`, local caches in
`data/processed/ml/`, and run artifacts in `results/ml/<run_id>/`. Keep weights and
large feature arrays ignored by Git. Commit code, configs, schemas and compact
reports; never commit gate credentials or annotate the canonical release in place.

Implement the following CLI contract. These commands are proposed interfaces:

```bash
python -m scripts.ml.manifest --dataset-version VERSION --config configs/ml/baseline.json
python -m scripts.ml.features --manifest MANIFEST --modalities text,shape
python -m scripts.ml.retrieve --run RUN --item META-000001 --top-k 20
python -m scripts.ml.cluster --run RUN --method kmeans --seed 17
python -m scripts.ml.suggest --run RUN --config configs/ml/suggestions.json
python -m scripts.ml.evaluate --run RUN --judgments REVIEW_EXPORT
```

The manifest command must report eligibility and exclusion reasons. Load exact
asset IDs and checksums; choose explicit image roles and keep alternate views
attached to the same object group. Missing modalities remain represented by masks.
No command should silently download weights, access paid APIs, start training or
upload artifacts. Add an explicit opt-in command for any later fit/download step.

## Ordered implementation checklist

1. **Input audit and manifests.** Validate release hashes, stable IDs, image roles,
   rights fields, source units, missingness and groups. Freeze a run manifest with
   dataset hash, eligible asset list, exclusions, group split, feature configuration,
   code commit, environment lock and seed 17. Distinguish display, redistribution and
   training eligibility. Record user research authorization separately from the
   museum's rights statements; public availability does not supply a license.
2. **Interpretable baselines.** Implement deterministic source-text TF-IDF/cosine
   retrieval and the existing outline-distance baseline. Fit vocabulary, IDF,
   normalization and any dimensional reduction on training groups only for held-out
   evaluation. Preserve an explicitly labeled exploratory full-corpus mode. Remove
   identifiers, source institution and generated labels from semantic text by
   default; provide ablations rather than allowing hidden target leakage.
3. **Optional frozen encoders.** Add adapters for locally available image and text
   encoders, each with exact model revision, preprocessing and checksum. A CLIP-style
   aligned image/text model is a candidate, not a promised best method. Cache features
   per asset hash and model config. Aggregate multiple views explicitly and retain
   per-view vectors. Compare image-only, text-only and normalized late fusion with
   fixed weights. No fine-tuning is required to make retrieval useful.
4. **Unsupervised tools.** Provide nearest-neighbor search, PCA inspection and seeded
   clustering with a small documented sensitivity grid. Keep clustering and display
   projection separate: a 2-D scatter distance is not the full feature distance.
   Export neighbors, assignments, outliers, missing-modality coverage and institution
   composition. Inspect whether clusters mostly track background, plate layout,
   photography, museum or material. No function label is implied by membership.
5. **Provisional annotation tools.** Combine independent evidence channels and issue
   versioned suggestions under the contract below. Offer a queue ranked by novelty,
   uncertainty, evidence conflict and source coverage. Export suggestions now;
   integrate later into the existing chip-based review workspace without requiring
   the user to review during implementation.
6. **Supervised scaffolding.** Implement masked label loading and experiment entry
   points. With independently reviewed labels later, compare regularized linear
   category classifiers and one-vs-rest multi-label classifiers against nearest-
   neighbor label transfer. Allow weak-label experiments only under an explicit
   `label_source=provisional` flag, with separate metrics and outputs. Empty eligible
   labels must produce a readiness report, not a model or fabricated accuracy.
7. **Research extensions.** After baselines, evaluate a small autoencoder over frozen
   features before a transformer autoencoder over image patches or modality tokens.
   Attention/fusion can model cross-modality context, but requires capacity control,
   modality masking, group-separated validation and comparison against simpler
   methods. Substantial local training is a later, explicit stage.

## Provisional self annotation contract

Self-annotation means generating traceable hypotheses. It does not mean silently
promoting a model's output to truth. Keep four channels separate:

- **Source extraction:** a quoted source span supports a recorded statement, with
  field locator and parser version. Historical terminology remains attributed.
- **Context rules:** current name/type-to-function mappings are weak labels, preserving
  rule ID, evidence text and uncertainty. A source term such as “knife” can nominate
  cutting; it does not independently validate historical use.
- **Representation suggestions:** frozen encoder prompts or neighbor votes nominate
  functions. Log prompts, model revision, neighbor IDs/distances and modality masks.
  Do not transfer functions from neighbors without labeling the transfer inferred.
- **Later teacher or student predictions:** any fitted classifier or language-model
  output carries its run ID and training-label provenance. Repeated iterations on
  the same pseudo-labels are not independent corroboration.

Use independent per-function states and scores. Initial vocabulary: extraction,
crushing, cutting, gripping, scraping, piercing, probing and dilation. Several may
apply. Missing labels are `unobserved`, never negative. Low support should abstain.
An uncalibrated similarity or prompt score must not be called a probability.
Do not invent numeric certainty for existing low/medium/high rule confidence.

Write append-only `suggestions.jsonl` plus a versioned JSON schema. Each suggestion
must include:

```json
{
  "suggestion_id": "content-hash-derived",
  "item_id": "META-000001",
  "dataset_version": "v1-804c1e7c3202",
  "run_id": "immutable-run-reference",
  "target": "functions",
  "label": "cutting",
  "state": "hypothesis",
  "method": "neighbor_label_transfer",
  "score": {"value": null, "meaning": "uncalibrated support", "calibrated": false},
  "evidence": [],
  "modality_mask": {"image": false, "text": true, "shape": false},
  "abstained": true,
  "reason": "example only; insufficient evidence",
  "training_ground_truth": false,
  "supersedes": null
}
```

Define source/asset locators inside `evidence`; require hashes or immutable run
references for all feature/model inputs. Preserve dissenting channels instead of
averaging away a source contradiction. Version any threshold and do not select it
using test judgments. In later semi-supervised experiments, generate pseudo-labels
from training groups only, cap their weight and count, and keep validation/test
labels and assets out of fitting. Compare against the same model without
pseudo-labels. Uncertainty sampling should include diverse sources, not only the
largest museum. Never write predictions into `functions.documented`.

## Evaluation and leakage controls

Known accession aliases, identical assets, alternate crops, repeated plates, kit
membership and duplicates must stay in one split. Current groups cover exact known
links; audit near duplicates before claiming independent testing. Keep a held-out
institution experiment where feasible. Report per-source and per-image-role results
and bootstrap uncertainty by group rather than treating every view as independent.

| Objective | Evaluation and required controls |
|---|---|
| Retrieval | Recall@1/5/10, mAP@10 and graded nDCG from independent pair judgments. Exclude self, same-object alternate views and known duplicates. Distinguish shape, mechanism and function relevance. |
| Category prediction | Macro-F1, balanced accuracy and per-class confusion; reviewed categories or clearly labeled source-category agreement. |
| Multi-label function | Per-label AP/F1, macro/micro summaries and observed-label masks. Report positive/negative/uncertain support per function; omit unsupported metric cells explicitly. |
| Hypothesis generation | Expert validation yield and evidence sufficiency later. Current weak-label agreement measures consistency only. |
| Clustering | Stability across seeds/settings, source composition and expert inspection. Silhouette score alone does not validate tool function. |
| Evolution questions | Separate later historical analysis with interval dates, documentary evidence and sampling controls; no ancestry inferred from embeddings. |

Include text/image/shape-only and combined runs; source text versus generated context;
background/crop controls; weak labels versus independently reviewed labels; missing
modality handling; and autoencoder versus raw frozen features. Hold out test judgments
until the method and thresholds are fixed. Report unavailable ground-truth metrics as
unavailable. Do not use current function rules as both training targets and test truth.

## Compute and artifact requirements

First audit the actual local CPU, RAM and GPU. Text/shape baselines should run on CPU
in bounded batches. Start frozen image encoding in batches of 4–16 and adapt to
measured memory. A GPU with roughly 8–12 GB VRAM is a planning target for modest
frozen encoding; larger transformer experiments need separate profiling. These are
estimates, not measured requirements or a reason to purchase hardware now.

Each run must save `manifest.json`, config, environment versions, feature references,
exclusion report, group splits, neighbor/cluster/suggestion tables and evaluation
coverage. Record dtype, distance normalization, seed and code commit. Store tensor
weights in a non-executable format such as safetensors where supported; save optimizer
state separately for trusted local resume. Include model/config/tokenizer/preprocessor
hashes and a model card. An optional later upload command must produce a preview
manifest/checksums and require an explicit destination and authorization; no automatic
upload of images, notes, restricted data or weights.

## Acceptance tests for the next agent

- Same release/config/seed produces identical manifests and deterministic baseline
  rankings, with a stable ID tie-break; cache replay does not access the network.
- Corrupt/missing assets and ineligible training inputs have explicit reports.
- No known group crosses a split; features fitted on training data cannot inspect
  validation/test labels; duplicate/self retrieval candidates are excluded.
- Empty descriptions, missing images, zero reviewed labels and unsupported classes
  produce useful outputs without fabricated labels or metrics.
- Multiple positive labels and uncertain/unobserved masks survive all round trips.
- Suggestions validate, remain provisional and retain evidence and supersession.
- A frozen-encoder smoke run is opt-in and small. Default tests use deterministic
  fixtures, run without external APIs and do not start substantial training.
- The web build, gate, source dataset hash and restored tree/map/morphology views
  remain unchanged. Finish with commands, tests, actual compute measurements and
  clearly separated implemented versus proposed experiments.
