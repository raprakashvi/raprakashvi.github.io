# Vind het uit: four findings from the 2026-11-14 session, and what they change

Lead-directed note (DeepSeek), written after T-022. Numbers are measured, not estimated; the scripts that
produce them are named.

## 1. The platform is a shop window, not the collection

The study reasons on the 1,204 objects Vind het uit shows. Each museum's own catalogue answers the same
twelve object-type questions (`object_name='…'` in the Axiell API, hit count recorded):

| Museum | platform objects (12 types) | museum catalogue (same 12) | ratio |
|---|---:|---:|---:|
| NEMO | 223 | 3,328 | **×14.9** |
| Rijksmuseum Boerhaave | 20 | 236 | **×11.8** |
| Teylers Museum | 32 | 23 | ×0.7 |

Extremes at NEMO: `gloeilamp` 18 on the platform against 1,797 in the catalogue; `galvanometer` 1 against
110; `scheerapparaat` 40 against 893. Teylers is the exception — its catalogue is *not* larger for these
terms (its own naming differs, and its 270 platform objects include geology specimens the search terms do
not touch).

**What it changes.** Every blind-spot and gap statement computed on the 1,204 (T-012, RQ4) is a statement
about *the platform's curation*, not about the collections. The sentence "no single museum has enough data"
is true of the *platform*; at NEMO the data is fifteen times larger than the study assumes. The platform is
the right place for a labelled seed and the wrong place for prevalence claims.

Script: `scripts/analysis/catalogue_scale.py`; table: `results/tables/catalogue_scale.json`.
Caveat: two different indexes (platform tag vs free-text object-name match), so each ratio is an order of
magnitude, not a coverage percentage; every query is stored.

## 2. The museums' own catalogues carried almost everything upstream

Searching a catalogue by inventory number returns a **brief** record; the full record is behind the
**priref**. Reading the brief record — which is what we did for NEMO and Teylers at first — hides the
description, the material and the production place. Reading the full record changed the layer in one pass:

| Field | site | after the museum catalogues |
|---|---:|---:|
| description | 588 (48.8 %) | **1,077 (89.5 %)** — Teylers 0 → 270 |
| maker | 0 | **687** |
| material | 0 | **581** |
| date | 975 | 1,049 (643 narrower than the century) |
| production place | 0 | 238 |

Only **127 objects still lack a description**, and 124 of them are Groningen — the one museum that needs
Collectie Nederland. The 12-hour wait for CN is now about 124 objects, not 1,204.

Script: `scripts/enrich/upstream_records.py`; table: `results/tables/vindhetuit_upstream.json`.

## 3. The inventory number is a clock, but the gap it dates is smaller than it looks

Museums treat inventory numbers as administration. They also track acquisition order, and acquisition
follows production date. Spearman(inventory number, production year): Boerhaave **+0.70**, Teylers +0.39,
NEMO +0.18. A local estimator (median of the seven nearest neighbours on each side, leave-one-out on the
dated objects) does better than the raw correlation suggests:

| Museum | dated | median error | within ±10 y | within ±25 y |
|---|---:|---:|---:|---:|
| NEMO | 433 | 18.0 y | 33 % | 64 % |
| Teylers | 115 | 17.0 y | 41 % | 60 % |
| Boerhaave | 214 | 28.8 y | 22 % | 48 % |

Boerhaave has the strongest global correlation and the worst local error: its numbers are chronological in
bulk but noisy within a batch — a finding about cataloguing regimes, not about objects.

**The catch, and it is the interesting part.** 229 objects have no date at all, and **140 of them are
geology specimens** (Teylers' `M-…` series), where "production date" is not a meaningful field. Only 25 of
the undated objects sit in a sequence the clock can extrapolate to (18 NEMO, 7 Teylers). So the RQ2 "date
gap" is largely a **category artefact**: the undated objects are mostly not undated instruments. That
changes what gap-filling should promise.

Script: `scripts/analysis/accession_clock.py`; table: `results/tables/accession_clock.json`. Predictions
are inferences, labelled as such, and never enter the intake or any evidence file.

## 4. There is a curator-made ground truth that the project has not used

The benchmark so far is "shares a subject tag", a weak proxy. Teylers' catalogue carries **175 scholarly
references** on its own records: 141 to **G. L'E. Turner's printed catalogue** of the instrument
collection, plus 18 van de Ven, 8 van Marum, 8 van Breda. Turner's numbers are an expert ordering by
principle and instrument type — a curator's taxonomy, in the museum's own catalogue, not a keyword list.

Benchmarking bridges and lineages against Turner's grouping rather than against subject tags would be a
leap in *evaluation*: it asks whether the AI recovers a classification a specialist actually published.
It costs one mapping pass (number → group) and no new data collection.

## What I would do next, in order

1. **Turner as the benchmark** (half a day): map the 141 references to groups, re-score the T-007 link
   benchmark against them, report both numbers side by side.
2. **Groningen's 124 descriptions** (one slow CN pass, 6 s interval, tonight): the only real description
   gap left; everything else already has one.
3. **Scale the seed** (a day): take one type (vacuum cleaners, NEMO 39 on the platform against 212 in the
   catalogue) and run the link method on the museum's full set. That tests whether the method survives
   outside the curated 1,204 — the question the collaborator will ask.
4. **Do not** spend more effort enriching the 1,204. It is now 89.5 % described and 57 % maker-complete,
   which is enough for a seed.
