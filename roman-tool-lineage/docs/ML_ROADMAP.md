# Vestigium: local ML research roadmap

Proposal, 2026-10-21. No substantial training, pretrained-weight download, or weight upload
is part of this delivery. The website and versioned dataset are the completed foundation.

## Research questions and separate claims

| Objective | Task and evidence | Primary evaluation |
|---|---|---|
| Similarity and retrieval | Rank related tools from image, text or both; experts judge form, mechanism and task similarity separately | Recall@1/5/10, mAP@10, nDCG@10 with graded relevance; report by museum, region and image role |
| Tool category | Predict independently reviewed categories such as forceps or blade | Macro-F1, balanced accuracy, per-class precision/recall, confusion matrix |
| Multi-label function | Predict extraction, crushing, cutting, gripping, scraping, piercing and other reviewed actions; several can apply | Per-label and macro/micro AP and F1, PR curves, calibration and abstention coverage |
| Undocumented function hypotheses | Nominate possibilities for expert examination; do not convert missing labels into negatives or source facts | Blinded expert plausibility/specificity ratings, inter-rater agreement, prospective verification yield |
| Surgical tool evolution | Test associations between reviewed morphology, mechanics, materials and time while accounting for sampling | Stratified effect sizes and uncertainty; documentary controls and competing explanations, not ancestry from clusters |

Source similarity does not establish function or evolutionary ancestry. Label source
statements, expert interpretations and predictions separately in every output. Attention
maps are model diagnostics, not mechanistic explanations or historical evidence.

## Stage 0: readiness and annotations

Freeze a dataset release and eligible asset manifest before experiments. Current collection:
2,746 record-level units, 2,600 legacy silhouettes, eight new metadata-only imports;
most detailed clinical-function labels are missing. Collection imbalance is severe and
many existing labels were inferred from titles/search terms. The corpus is too limited
and biased to justify a transformer trained from scratch as the default.

Create `annotations/v1/labels.csv` with columns `item_id`, `label`, `state`
(positive/negative/uncertain/unobserved), `source_role`, `source_locator`, `annotator_id`,
`reviewed_at`, `confidence`, `review_notes`, `label_schema_version`. Two domain experts
independently review a diverse 150-record pilot; adjudicate disagreements while preserving
both original decisions. This is a proposed sample target, not a completed annotation set.
Sample across category, institution, geography, period, image role and missing modalities.
Separate physical affordance, documented use, observed use and hypothesized use.

Do not fabricate ground truth from historical names. Curate multi-label action definitions
and positive/negative examples (e.g. gripping as an action vs forceps as a tool category).
A missing action label is unobserved, not false. Train supervised losses only on reviewed
labels with an observation mask; exploratory positive-unlabeled methods need sensitivity
analysis. Report annotated sample sizes, exclusions and per-label support.

## Stage 1: freeze leakage-safe evaluation

Build an object/entity audit graph linking all views, duplicate photos, shared plates,
accession aliases, kits, catalog variants and re-photographed specimens. Split connected
groups, not files. Detect exact hashes first, then perceptual duplicates with expert
review; similar tools alone are not duplicates. Group pages and cropped figures from the
same publication. Keep images of the same object and related catalog descriptions together.

Use fixed seeds 17/29/43. Propose group-stratified 60/20/20 development/validation/test
partitions only if reviewed per-label support allows them; otherwise use nested grouped
cross-validation and state the effective group count. Freeze a final test set once,
including one held-out collection where feasible. Add region and period stress tests,
reporting sparse strata without pooled overclaims. Bootstrap at object/entity-group level
(2,000 replicates, 95% percentile intervals) and use paired resampling for model differences.
No method selection on the held-out test museum. A collection holdout can confound region,
photography and chronology; report overlap and limitations.

Titles may literally name a target function. Evaluate text with and without category,
function and eponym terms, source/museum tokens and catalog boilerplate. The former is
source-based retrieval; the latter probes transfer beyond explicit label leakage.
Exclude labels and analyst notes from text features. Record what each model can see.

## Stage 2: cheap baselines before representation learning

| Variant | Features / model | Purpose |
|---|---|---|
| Random/popularity | Random ranking; majority categories; per-label prevalence | Quantify chance/imbalance without imagery |
| Source-only | Institution, image background/color and photo layout | Detect museum-photography shortcuts |
| Existing morphology | Standardized shape descriptors, cosine/Euclidean or existing block distance; kNN, logistic regression | Transparent shape baseline, preserving original preprocessing |
| Text-only | TF-IDF word/character n-grams, truncated SVD fit only on training, cosine; linear category/multi-label classifiers | Strong low-cost retrieval/classification baseline |
| Frozen image | Licensed CLIP-style and DINOv2 small/base encoders, explicit pinned revisions | Compare semantic multimodal alignment and self-supervised visual representation |
| Frozen text | CLIP text branch plus a separately selected licensed sentence encoder | Separate text quality from image quality |
| Simple multimodal | Per-modality L2 normalization; validation-selected weighted distance or concatenated frozen features + linear head | Determine whether fusion adds benefit before attention |
| Small autoencoder | PCA and shallow MLP reconstruction on frozen features | Compare reconstruction objectives with simple compression |

CLIP jointly learns image/text alignment ([Radford et al.](https://arxiv.org/abs/2103.00020));
DINOv2 provides self-supervised visual features ([Oquab et al.](https://arxiv.org/abs/2304.07193)).
Their reported benchmark performance is not evidence of tool-domain accuracy. Pin model
revision, tokenizer, preprocessing and license before downloading weights locally. Use no
remote inference endpoint for restricted collection data. Cache one embedding per approved
asset with item/asset ID, view role, input SHA-256, model/revision and preprocessing hash.
Report image-only, text-only and multimodal results on both a common paired subset and each
method's full eligible subset; do not compare incompatible denominators as model gains.

## Stage 3: candidate transformer/attention autoencoder

Proceed only after readiness and baseline review, with a predeclared small compute budget.
[MAE](https://arxiv.org/abs/2111.06377) reconstructs masked image patches with an asymmetric
encoder/decoder; [Transformer attention](https://arxiv.org/abs/1706.03762) supplies the
architecture. Neither guarantees that reconstruction learns functionally meaningful tools.

Candidate A: a bottleneck autoencoder over frozen image/text tokens. Project each modality
to dimension 256; add modality and view-role encodings; use 2–4 attention blocks, 4 heads,
latent dimensions 32/64/128, and a small decoder. Mask whole modalities and subsets of tokens
with a recorded missing-modality mask. Reconstruct normalized frozen features first; add
reviewed-label heads only after unlabeled retrieval evaluation. Compare a parameter-matched
MLP autoencoder and PCA. A contrastive alignment term requires genuine positive pairs,
not arbitrary matching by tool category. Tune no more than a predeclared 12 configurations
on validation data; report parameter counts, compute and failures.

Candidate B: a licensed pretrained small/base vision MAE, frozen initially, then limited
adapter/last-block tuning on eligible training images. Record 224-pixel input, patch size,
mask ratio sweep 0.5/0.75, visible-token processing, reconstruction target and feature
pooling. Use batch size chosen by a local memory probe, mixed precision where supported,
AdamW, early stopping on validation retrieval (not only pixel reconstruction), and at most
50 exploratory epochs. These are starting design choices, not validated hyperparameters.
Training a large image transformer from scratch is deferred unless several-fold data
expansion and learning curves justify it.

Useful ablations: remove text; remove images; remove names/functions from text; remove
background; object crops vs full photos; silhouette vs RGB; remove material/date/museum;
mask missing modalities; per-view vs object pooling; linear vs nonlinear fusion; attention
vs parameter-matched MLP; reconstruction vs contrastive objective; frozen vs adapters;
within-museum vs museum holdout; curated labels vs noisy title labels. A low reconstruction
loss can favor backgrounds and captions; retrieval and external-label evaluation decide.

## Stage 4: uncertainty and expert validation

Tune thresholds per function only on validation labels. Report reliability diagrams,
Brier score and expected calibration error, with binning and sample counts. Compare
validation-fitted temperature scaling for category logits; multi-label calibration needs
adequate per-label examples. Track ensemble/seed disagreement and retrieval neighbor
coverage; use an explicit abstain state for novel museums, outliers and uncertain evidence.
A small data set does not justify claiming guaranteed uncertainty coverage.

Present blinded retrieval panels to two experts, randomizing method order and hiding
museum/method identity when feasible. Record graded form/working-end/mechanism/task
similarity separately, annotation time and confidence. Stratify hypothesis-generation
reviews by evidence availability. New hypothesized uses remain in interpretations or a
versioned prediction artifact until independent documentary/experimental validation.

For surgical-evolution analyses, preregister a bounded family/time/source frame; compare
reviewed mechanism/working-end descriptors against simpler date/material/geography
baselines. Use interval dates, sensitivity to alternative dating, museum and source
stratification, and specimen/group dependence. Explicit transfer documents are positive
controls; functional convergence and preservation bias are competing explanations. Do not
infer a phylogeny from nearest neighbors, chronology or an aesthetically separated UMAP.

## Local compute and experiment contract

Planning estimates, not measured guarantees: CPU baselines should fit a 16–32 GB RAM
workstation. Frozen 224-pixel encoders may be batched on one 8–16 GB GPU; adapter/MAE
experiments may need 16–24 GB and gradient accumulation. Probe peak memory, examples/s,
wall time and energy before committing to a run. Current-scale numeric embeddings are
small (e.g. 3,000 x 768 float32 is about 9.2 MB before multiple views); images/checkpoints
and cache revisions dominate storage. Reserve 20–50 GB for a bounded pilot, then measure.
No cloud spend is planned. CPU-only frozen extraction is acceptable with longer run time.

`experiments/example.yaml` and `experiments/manifest.example.json` specify the future run
contract; they are templates, not executed jobs. Implement later commands `prepare_manifest`,
`audit_groups`, `extract_features`, `fit_baselines`, `evaluate`, and `train_autoencoder`,
with explicit `--manifest` and `--config` arguments and no default training side effects.
Manifest rows contain item/asset IDs, SHA-256, image/text roles, rights-review ID, split,
entity-group ID, label version and observed-label mask. Stop if any train/test group overlaps
or training eligibility is unresolved; the current default manifest is ineligible.

Store runs locally as `experiments/runs/<run_id>/`: frozen config, input/split/label manifest,
Git SHA, dependency lock, hardware/driver versions, RNG states, logs, metrics.json,
per-item predictions and model card. Fit transforms on training only. Use JSON/CSV/NPZ for
outputs; save tensor weights in a versioned safetensors checkpoint where practical and
record optimizer/RNG resume state in a local trusted format. Never load arbitrary pickle
checkpoints from untrusted sources. Distinguish inference weights from local resume state.

Before any later upload: manually review data/model licenses and cultural restrictions,
memorization/leakage risk, absence of source images/text/credentials in the artifact, model
card and evaluation limits. Package only approved inference weights + config + schema +
manifest hashes + checksum/signature. Assign `model-v<semver>+dataset-<hash>`, upload by an
explicit user-requested release step, retain local backups, and keep deprecated versions
traceable. Do not automatically upload data, embeddings, optimizer state or weights.

## Stopping and decision gates

1. Complete label/rights/group audits before any supervised experiment; unknown labels stay unknown.
2. Run simple/frozen baselines before fine-tuning. If fusion/autoencoders fail to improve paired grouped evaluation, retain the simpler model and report the null result.
3. If gains vanish in museum holdout or background controls, prioritize new acquisition and photography rather than enlarging the architecture.
4. Submit function hypotheses for expert validation. No clinical-use, causal-history or ancestry claim follows from retrieval alone.
