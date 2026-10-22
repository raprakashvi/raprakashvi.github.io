# Vestigium local research tools

The local package now freezes inputs, retrieves similar text and outlines, exports
PCA/clustering inspections, and generates provisional function suggestions. It also
prepares observed-label masks for later supervised experiments. These are research
utilities; no tool-function accuracy has been established and no substantial training
has run. [ML_IMPLEMENTATION_STATUS.md](ML_IMPLEMENTATION_STATUS.md) tracks delivery.

## Run the CPU demonstration

The existing Conda `base` environment already contains the required CPU packages.
The measured package versions are in `configs/ml/requirements-cpu.txt`. Start from
the source repository's `roman_tool_lineage/` directory:

```bash
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python -m scripts.ml.demo
python -m unittest scripts.ml.test_ml -v
```

The demo prints its immutable run directory. Set `RUN` to that directory; run IDs
change when the dataset, configuration, code hashes, environment or recorded Git
commit changes. Run artifacts live under `results/ml/runs/`, which is ignored by Git.
Keep a run directory with the corresponding code checkout for later reproduction.
No command needs a network connection.

```bash
python -m scripts.ml.manifest --config configs/ml/baseline.json
python -m scripts.ml.features --manifest "$RUN/manifest.json" --modalities text,shape
python -m scripts.ml.retrieve --run "$RUN" --item META-000066 --modality text --top-k 20
python -m scripts.ml.retrieve --run "$RUN" --item META-000066 --modality shape --top-k 20
python -m scripts.ml.cluster --run "$RUN" --modality text --method kmeans --clusters 8 --seed 17
python -m scripts.ml.cluster --run "$RUN" --modality shape --clusters 8 --seed 17 --sensitivity
python -m scripts.ml.suggest --run "$RUN" --config configs/ml/suggestions.json
python -m scripts.ml.supervised --run "$RUN"
python -m scripts.ml.evaluate --run "$RUN"
```

The optional `--asset-root PATH` on the manifest command validates an existing site
artifact. Without it, original embedded images and exact imported-image caches are
resolved locally and checksummed. Missing/corrupt assets remain in the audit; their
modality mask is false. Source display, redistribution and training-rights fields
remain separate from the user's local research authorization. No image is downloaded.

## Read the outputs

| Artifact | Interpretation |
|---|---|
| `manifest.json`, `audit.json` | Release/config/code/environment hashes, stable IDs, exact views, source units, rights, modality masks and grouped provisional splits |
| `text_model.json`, `text_features.npz` | L2 TF-IDF word/bigram features from name and original description; exact accession, institution and stable-ID strings removed even when embedded in titles |
| `shape_model.json`, `shape_features.npy` | Scale-free image scalar descriptors, fit-mode median/IQR normalization; missing shapes remain NaN |
| `inspection-*.json` | Per-item PCA coordinates, cluster assignments, descriptive silhouette, source composition, terms and outliers; stable links to collection records |
| `suggestions.jsonl` | Append-only per-function hypotheses/abstentions, content-derived IDs, exact evidence, qualitative rule confidence and uncalibrated neighbor support |
| `suggestion_queue-*.json` | Source-balanced queue; heuristic novelty and differing weak channels; no review is required to generate it |
| `supervised-*/readiness.json` | Positive/negative support, uncertain/unobserved masks and explicit unavailable metrics |
| `evaluation-*.json` | Retrieval-readiness report, or explicitly adjudicated judged-pool scores when supplied later |

The TF-IDF baseline excludes generated summaries, function fields, analyst notes and
source institution metadata. Original titles may still name the tool category; this
is a transparent source-text baseline, not evidence of inference beyond source words.
Numeric support from weak neighbors is a vote fraction, never calibrated probability.
Existing qualitative rule confidence is retained verbatim rather than converted to
an invented number. Weak neighbors that repeat the same rules are dependent evidence.
Missing functions remain unobserved; abstention does not mean a negative function.

Known duplicate image hashes, accession aliases and prior pilot groups are connected
before splitting. Retrieval excludes the query and its whole known group, with stable
ID tie-breaking. Unknown near duplicates may remain. Text and shape inspection report
all exclusions explicitly; no record is silently deleted.

## Exploratory versus held-out mode

`configs/ml/baseline.json` explicitly fits transforms on the full corpus for exploration.
For held-out development, create a separate run:

```bash
python -m scripts.ml.manifest --config configs/ml/baseline-heldout.json
python -m scripts.ml.features --manifest "$HELDOUT_RUN/manifest.json"
```

Use the printed directory as `HELDOUT_RUN`. Vocabulary/IDF, scalar normalization,
SVD/PCA and clustering fit only training groups in this mode. Retrieval candidates are
restricted to training groups. Label loading never changes the split.

The **original 2,600-shape distance matrix** uses full-corpus normalization inherited
from the original study. Its lookup remains explicitly exploratory/transductive even
inside a held-out run. It is not a newly fitted, independent held-out shape model.
Its three equally weighted, median-normalized blocks are width/centerline profile,
Fourier magnitude and robust scalar morphology. Distances are dimensionless. Physical
size and material are not part of this distance. The scalar descriptors used for the
new PCA inspection are a separate representation, not a replacement distance matrix.
Supplemental outlines are excluded until the matrix is regenerated and calibrated.

Text inspection uses noncentered SVD up to 64 dimensions, followed by centered PCA
for its two-dimensional display; k-means uses the SVD features. Shape inspection uses
centered PCA for display and normalized scalar features for clustering. Display-plane
distances are not the original feature distance. Neither clusters nor silhouettes
establish shared function or ancestry. Inspect museum, material and photography bias.

## Existing GPU environment and frozen-image smoke check

Read-only hardware inspection confirmed an NVIDIA GeForce RTX 5080 with 16,303 MiB
VRAM, driver 595.91.07 and compute capability 12.0. The existing `endosrt` environment
provides Python 3.11.16, PyTorch 2.11.0+cu128, torchvision 0.26.0+cu128 and working CUDA
12.8. A new Conda environment was unnecessary. The base environment has no PyTorch;
run CPU baselines there and the optional image adapter with the existing GPU Python.

This workstation's restricted sandbox hides `/dev/nvidia*`; its ordinary sandbox
`nvidia-smi` call fails. The host driver works outside that restriction. This is an
execution permission boundary, not evidence that the GPU or driver is missing. Do
not reinstall the driver to address this sandbox behavior.

A trusted checkpoint was already cached at
`/home/rp/.cache/torch/hub/checkpoints/resnet18-f37072fd.pth`, SHA-256
`f37072fd47e89c5e827621c5baffa7500819f7896bbacec160b1a16c560e07ec`.
The adapter calls `resnet18(weights=None)` and then
`torch.load(local_path, weights_only=True)`; it contains no torch-hub loading or
weight-download fallback. Its small actual GPU check also ran with outbound socket
connections disabled. ImageNet features have not been validated for tool-domain use.

```bash
/home/rp/anaconda3/envs/endosrt/bin/python -m scripts.ml.image_features \
  --run "$RUN" --asset-root /tmp/vestigium-complete \
  --checkpoint /home/rp/.cache/torch/hub/checkpoints/resnet18-f37072fd.pth \
  --device cuda --limit 8 --batch-size 4
```

`--asset-root` must contain the frozen release's exact image files. Replace the
example temporary artifact with the current verified site artifact if it is removed.
Use `--device cpu` in the same environment for the CPU fallback. Encoding is opt-in,
bounded to eight views by default, and filters for photograph roles. Per-view 512D
features are L2-normalized and retained with exact view hashes and source rights.
The cache identity includes checkpoint bytes, preprocessing, runtime, exact asset
hashes and settings. Replaying it verifies hashes and does not run the encoder again.
Changing model bytes, preprocessing, asset bytes or settings invalidates the cache.

```bash
python -m scripts.ml.image_retrieve --image-cache "$IMAGE_CACHE" \
  --item META-002827 --top-k 5
```

Set `IMAGE_CACHE` to the printed `image-*` run subdirectory and use one of its listed
item IDs. The command explicitly averages available normalized views then L2
normalizes per item; known duplicate groups remain excluded. The eight-view smoke
cache does not provide full-collection image retrieval. CLIP/DINO adapters, multimodal
fusion, autoencoders and expanded encoding remain later work.

## Supervised readiness and later fitting

`supervised` defaults to readiness only. Supply independently adjudicated
`masked_labels.jsonl` later: each row needs an ID, explicit `adjudicated: true`,
`training_eligible: true`, `labels`, and boolean `observed_mask`. Several positive
functions may coexist. Only positive/negative observed states enter loss; uncertain
and unobserved states stay masked. Browser votes are not adjudicated automatically.

```bash
python -m scripts.ml.supervised --run "$HELDOUT_RUN" --labels masked_labels.jsonl
# Later, explicit lightweight fit only when reviewed positive and negative support exists:
python -m scripts.ml.supervised --run "$HELDOUT_RUN" \
  --labels masked_labels.jsonl --fit-linear
# Explicit weak-label readiness; current missing labels are never fabricated as negatives:
python -m scripts.ml.supervised --run "$HELDOUT_RUN" --label-source provisional
```

A later opt-in fit uses separate regularized per-function logistic classifiers.
Unsupported classes return null metrics; an empty eligible label set fits nothing.
Fixed thresholds and hyperparameters are recorded. Current positive-only weak labels
cannot supply an invented negative class. Category prediction, group-bootstrap
intervals, calibrated thresholds and full supervised evaluation remain future work.

`evaluate --judgments FILE` accepts either a raw browser export (readiness only) or
an explicitly adjudicated package with `dataset_version`, `adjudicated: true`, and
`pairs: [{query_id, candidate_id, relevance: 0..3}]`. The latter reports judged-pool
Recall@1/5/10, AP@10 and nDCG@10. Unjudged items are not assumed irrelevant; these
scores must not be described as full-corpus recall. Shape, mechanism and function
judgments should be provided in separate packages and reported as separate tasks.

## Verified delivery and remaining work

Compact actual-run measurements and hashes are in
`results/ml/baseline_smoke.json`. The dedicated fixture suite checks deterministic
manifests/cache reuse, train-only vocabulary, group isolation, corrupt/missing assets,
self/duplicate exclusion, missing modalities, abstention, multiple labels, uncertainty
masks, and cache invalidation. Frozen release bytes and original offline HTML files
were verified unchanged. Bulk vectors, suggestions and source text remain local.

No expert-ground-truth accuracy, calibrated function prediction, clinical claim,
historical ancestry result, substantial training or weight publication has occurred.
The detailed later experiment design remains in [ML_ROADMAP.md](ML_ROADMAP.md).
