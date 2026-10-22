# Vestigium local ML implementation status

This workstream implements local, reproducible research tools while the primary agent
overhauls the website. Canonical records, website files and dataset releases remain
unchanged. No substantial training, model download, remote inference or upload is authorized
by these commands. Human review is deferred and does not block exploratory analysis.

| Order | Status | Deliverable and acceptance | Verification |
|---|---|---|---|
| 1 | Complete | Freeze release files, record/asset hashes, modality masks, rights and separate user research authorization; deterministic leakage groups and splits | Repeated manifest identity; corrupt assets reported; known group split isolation |
| 2 | Complete | Source-text TF-IDF and original shape-distance retrieval with stable tie-break and duplicate/self exclusion | Fixture rankings, training-only vocabulary, full-corpus coverage report |
| 3 | Complete | PCA inspection and seeded cluster exports with missingness, institution composition and outlier reports | Deterministic outputs; explicit exploratory/transductive boundaries |
| 4 | Complete | Append-only, schema-valid provisional function suggestions and diverse review queue | Missing labels stay unobserved; evidence/run/hash references; no canonical writes |
| 5 | Complete | Supervised label masks and readiness reports; explicit opt-in lightweight classifier entry point | Multiple positives, uncertain/unobserved masking, empty labels without fabricated metrics |
| 6 | Complete | Dedicated regression tests, full-dataset CPU smoke run and operational handoff | Tests pass, timings/counts recorded, source release hashes unchanged |

Expanded image encoding beyond the bounded cached-weight smoke run, autoencoders,
transformer training, expert-ground-truth evaluation
and weight publication remain later stages. Current shape distances use corpus-wide
normalization and must be reported as an existing exploratory baseline; they do not
constitute a training-only fitted held-out experiment.

## Verified delivery

All six bounded baseline-tool tasks above are implemented and locally tested. The
dedicated suite passes 21 tests. Actual frozen-release demonstration: 2,830 records,
2,718 checksummed assets, 2,822 entity groups, 2,600 original matrix shapes and 114
records without images. TF-IDF covers all 2,830 rows after source-identifier removal.
The exploratory export records 22,640 per-function states: 3,163 provisional positive
hypotheses and 19,477 abstentions. These include existing rule hypotheses; they are
not 3,163 newly established functions. The source-balanced queue covers 14 sources.

The existing RTX 5080 / Conda `endosrt` environment completed an eight-view frozen
ResNet18 smoke run and immutable cache replay with outbound network connections
disabled. No checkpoint download or training occurred. Exact timings, runtime versions,
model/input hashes and preservation checks are in `results/ml/baseline_smoke.json`.
Operational commands and limitations are in [ML_TOOLS.md](ML_TOOLS.md).

## Still open beyond this bounded delivery

- Expand shape coverage and regenerate the full-corpus distance matrix before using
  supplemental outlines as ranked neighbors.
- Extend opt-in image encoding beyond the eight-view smoke after examining object and
  photography quality; add pinned local CLIP/DINO adapters and multimodal fusion.
- Complete category-prediction scaffolding, uncertainty calibration, group-bootstrap
  intervals and blinded retrieval/functional evaluation when independent labels exist.
- Treat human review as later validation; it does not block exploration or suggestions.
- Autoencoders, transformer training, substantial supervised fits and weight publication
  remain deferred. No deployment or website ML integration is claimed.
