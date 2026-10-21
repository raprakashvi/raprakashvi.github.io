# Vestigium review pilot

Open **Review & annotate** after the interface gate. This release prepares reviews;
it contains **zero expert judgments**, no trained models and no claimed retrieval accuracy.
Canonical museum records, analyst interpretations and model predictions are unchanged.

## Review and backup

1. Use a pseudonymous alias, e.g. `reviewer-a`. Do not put credentials or personal
   information in the alias or evidence notes. A second reviewer uses a different alias.
2. Select an item task. Inspect its photograph/drawing and, when needed, reveal source
   descriptions, credits and links. Source wording remains historically situated.
3. Assess each of eight functions independently. `positive` means supported by the
   cited evidence; `negative` requires evidence against it; `uncertain` means assessed
   but unresolved; `unobserved` means not assessed. Undocumented is never automatically
   negative. Multiple positives are allowed. This pilot vocabulary is incomplete;
   put other functions and proposed definitions in notes for later schema review.
4. Record evidence basis, URL/locator, reasoning, confidence and alternatives. Source
   documentation needs its URL; visual affordances remain hypotheses. Explain evidence
   for each selected function in the shared reasoning field. Use unobserved for labels
   whose evidence has not been assessed. Confidence is a reviewer judgment, not a calibrated probability.
5. Save a local revision. Changes are explicit; every prior revision remains in history.
   Save before switching tasks, or discard unsaved changes. Browser storage limits and
   failures appear as errors; a failed write is not reported as saved.
6. Export JSON regularly. Drafts are stored in localStorage on this browser and origin,
   scoped to the exact pilot version. They do not sync or upload. Clearing site data,
   switching browser/device, or a changed origin loses access unless you export/import.
   Edit in one browser tab at a time; localStorage read/merge/write is not a cross-tab transaction.
   File imports retain revision branches, but simultaneous editing tabs can race.
   Sign-out restores the interface gate and retains local drafts on a shared device.
   Browser-local notes are not encrypted. Store sensitive reviews outside this site.
7. Import a compatible JSON export to merge histories. Exact repeated revision IDs
   deduplicate; different content under the same ID is rejected. Separate aliases remain
   independent. Concurrent branches are retained and require explicit reconciliation;
   the UI refuses to append to an ambiguous branch. Keep original exports when versions
   differ; do not edit their release identifiers to force an import.

A draft saved with every label unobserved is not an assessed item. The progress display
counts assessed targets, not clicks or saves. Alias names do not certify expertise.
No source facts or labels are written into the public repository by this workflow.

## Pair review and blinding limits

Pair tasks independently grade **shape**, **working mechanism**, and **function**:
0 no supported similarity, 1 limited, 2 moderate, 3 strong; `unassessable` when evidence
is insufficient, `unobserved` when not yet assessed. This ordinal scale needs calibration
on a few examples before formal review; a difference between 1 and 2 is not a physical distance.

Pairs include existing shape-neighbor, other-collection and deterministic random-control
candidates. The UI hides candidate pool, rank, score and object names initially; the
frozen task manifest retains selection provenance. Images/roles may remain recognizable,
so this is partial masking, not a blinded experiment. Revealing metadata is logged on the
revision. Record missing/ambiguous images as unassessable rather than guessing. Source
credits are available on reveal. Shape alone cannot establish function or ancestry.

Have two experts work independently before exchanging review histories. Review pair-task
order effects, use the same evidence access policy, and separate image-only and
source-informed analyses using the reveal flag. After independent review, discuss
conflicts with a third adjudicator; retain both original opinions and the adjudication
rationale. An adjudication UI and verified reviewer identities are later work.

## Frozen pilot, entity groups and provisional splits

The builder selects 150 records: 30 imported museum records and 120 existing records,
one per known leakage group. It balances institution counts first, then category,
context, date bin, evidence unit and image coverage, with SHA-256 tie-breaking, seed 17.
It is a purposive coverage pilot, not a statistically representative museum sample.
Categories used for sampling include provisional/source labels; they are not ground truth.

Exact shared image hashes/assets and institution/accession aliases form conservative
leakage groups. A shared plate can group different objects; groups do not assert object
identity. All known views remain in one provisional split. Near-duplicate crops,
re-encoded plates, kits and unrecognized aliases still need review. Add cited links to
`data/curated/review/leakage_links.json`, then rebuild before freezing experiments.
The builder records its own hash, dataset hash, grouping hash and seed.

All-record 60/20/20 hash partitions are **provisional**, not training-ready. All rows
have `training_eligible=false`. Pair candidates may cross provisional partitions: they
are annotation tasks, not a ready evaluation fold. Later retrieval evaluations must
freeze allowed query/gallery roles and keep query entity groups out of fitted models.
Source holdout, temporal holdout and minimum per-label support must be designed after
label review; do not fit on this pilot or report test performance from tuning it.

## Reproduce and validate

From `roman_tool_lineage/`:

```sh
python scripts/web/build_site.py --output /tmp/vestigium-review --gate-config gate.local.json
python scripts/web/review_pilot.py --site /tmp/vestigium-review
# Find exact pilot path in data/processed/web/review_current.json.
python scripts/web/review_exports.py \
  --pilot data/review/PILOT_VERSION/pilot.json \
  --output /tmp/review-validated reviewer-a.json reviewer-b.json
VESTIGIUM_SITE=/tmp/vestigium-review python -m unittest discover -s scripts/web -p 'test_review.py'
```

`data/schema/review-v1.schema.json` validates review packages. The offline validator also
checks matching release/tasks, evidence, revision ancestry, collisions and chronology.
It exports combined history, all votes, disagreements, branch conflicts and masked
labels. Without adjudication every training label remains null and its observed mask
false, including unanimous votes. Human review is required before selecting a supervised
target, interpreting negatives, or promoting consensus. No automatic clinical or
functional conclusions follow from similarity.

Future evaluation: use nDCG@k/Recall@k and expert graded relevance for retrieval;
per-label precision/recall, macro/micro F1, PR-AUC and calibration for adjudicated
multi-label targets with observed masks. Confidence intervals resample entity groups,
not image rows. Report reviewers, sources, modalities, sample sizes and label coverage;
assess agreement separately for shape/mechanism/function. See `ML_ROADMAP.md` for staged
baselines and local compute requirements. No substantial training is part of this delivery.

## Image queue

The frozen pilot directory contains `image_queue.json` for all 88 museum imports,
flagging the latest 80-record batch. It records source links, exact-accession image
candidates, available local assets and next actions. The bounded follow-up recovered
Pitt Rivers 1942.12.62 and 1995.20.1 from explicitly captioned full-size image links.
Original bytes, pixel sizes, checksums, association evidence and rights uncertainty
are stored in `data/curated/import_images.json`; caches remain under `data/raw/ingestion`.
Both image files are small enough to serve directly and are lazy-loaded.

Smithsonian API search metadata in this import contains no linked image URLs. This does
not establish that the museum has no photographs. Remaining editorial images without
matching accessions must not be assigned to imported objects. A bounded Smithsonian detail-page follow-up returned HTTP 403 on the first object page; the host was stopped, and the second candidate was not requested. Exact outcomes appear in `results/tables/smithsonian_image_access.json`. All latest 80 imports remain without local images. Additional official-media lookup is source-specific work; the modern Pitt Rivers catalogue remains unavailable.
Research display authorization is recorded separately from redistribution and training
eligibility. No image-derived physical dimensions were inferred.

## Current priority and redesigned interface

**Human review is deferred by the user.** It is not required to continue website work,
museum ingestion, contextual annotation or descriptive exploration. The collection now
uses explicit working hypotheses derived from catalog context. No review is requested now.

When later review begins, the page uses function chips and Yes/No/Unsure/Clear buttons;
multiple functions can be selected. Click a function chip again to clear it. Pair tasks
use independent None/Slight/Moderate/Strong/Cannot tell buttons for shape, mechanism and
function. Keyboard Tab/Enter/Space and left/right within a button group are supported.
Save & next persists and advances; Skip leaves the task untouched. Session/backup and
additional evidence fields are collapsed initially. State meanings and revision/export
semantics from the protocol above remain the same; there are no decision dropdowns.

The evidence field starts from the actual displayed-image or catalog context, clearly
marked as an interpretation. A user can select Documented use only with a source URL
and specific evidence locator; untouched function rows remain unobserved. Working
suggestions can be copied explicitly as an editable starting point. They are not
silently pre-filled as a review and never become model ground truth automatically.

The old review format remains valid for its exact dataset/pilot. A changed dataset
creates a new frozen pilot, and old exports remain usable with their original offline
validator inputs. Do not rename version fields to force a cross-version import.
