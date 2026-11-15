# Vind het uit: four findings from the 2026-11-14 session, and what they change

Lead-directed note (DeepSeek), written after T-022. Numbers are measured, not estimated; the scripts that
produce them are named.

## 1. The platform is a shop window, not the collection

The study reasons on the 1,204 objects Vind het uit shows. The catalogues' own totals (`object_number=*`):

| Museum | catalogue records | on the platform | share |
|---|---:|---:|---:|
| NEMO | 22,063 | 488 | **2.2 %** |
| Teylers Museum | 99,021 | 270 | **0.27 %** |
| Rijksmuseum Boerhaave | 83,828 | 217 | **0.26 %** |

That is the headline: **the platform shows between a quarter of one percent and two percent of the three
catalogues we can measure** (Groningen and Utrecht not measured). The same twelve object-type questions
give the finer picture (`object_name='…'`, hit count recorded):

| Museum | platform objects (12 types) | museum catalogue (same 12) | ratio |
|---|---:|---:|---:|
| NEMO | 223 | 3,328 | **×14.9** |
| Rijksmuseum Boerhaave | 20 | 236 | **×11.8** |
| Teylers Museum | 32 | 23 | ×0.7 |

Extremes at NEMO: `gloeilamp` 18 on the platform against 1,797 in the catalogue; `galvanometer` 1 against
110; `scheerapparaat` 40 against 893. Teylers is the exception — its catalogue is *not* larger for these
terms (its own naming differs, and its 270 platform objects include geology specimens the search terms do
not touch).

**And the selection is type-skewed by two orders of magnitude.** Of NEMO's 37 platform tags, 13 name an
object the catalogue can be searched for; their platform share runs from **0.6 %** (`gasmeter`: 1 of 159) and
**0.9 %** (`galvanometer`: 1 of 110), **1 %** (`gloeilamp`: 18 of 1,822) to **28 %** (`fornuis`), **53 %**
(`haardroger`) and **59 %** (`platenspeler`). Aspect tags (`huishoudtechniek`, `elektrotechniek`) return 0
because they are not object names — the matrix reports only what can be matched.

**What it changes.** Every blind-spot and gap statement computed on the 1,204 (T-012, RQ4) is a statement
about *the platform's curation*, not about the collections — and, worse, the curation is not uniform across
types, so the platform distorts the *shape* of the collection as well as its size. The sentence "no single museum has enough data"
is true of the *platform*; at NEMO the data is fifteen times larger than the study assumes. The platform is
the right place for a labelled seed and the wrong place for prevalence claims.

Script: `scripts/analysis/catalogue_scale.py`; table: `results/tables/catalogue_scale.json`.
Caveat on the per-type ratios: two different indexes (platform tag vs object-name match), and the museum
catalogues name things differently — NEMO's `radio` returns 0 catalogue hits where the platform shows 28,
because the catalogue writes `radiotoestel` and `omroepontvanger`. The per-type ratios are therefore an
order of magnitude at best; the **totals above are exact counts of the catalogues' own records** and are
what the share column rests on.

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

**First result (2026-11-14, `scripts/analysis/turner_benchmark.py`).** With the stored embeddings (T-007) and
the 127 Teylers objects that carry a Turner number, the question "are an object's embedding neighbours
closer to it in Turner's numbering than chance?" is answered:

| Pair set | median \|Δ Turner nr\| | bootstrap 95 % | within 5 numbers |
|---|---:|---|---:|
| random pairs | 68.5 | — | — |
| pairs sharing a subject tag (the current baseline) | 7.0 | — | — |
| DINOv2 image kNN | **5.0** | 4.0 – 10.5 | 50.8 % |
| E5 title kNN | 13.0 | 10 – 21 | 35.8 % |
| E5 machine-description (VLM) kNN | **4.0** | 3.5 – 6.0 | 53.4 % |

Label-permutation p < 0.002 for all three (500 shuffles, one-sided). Among neighbours that share **no**
subject tag, the VLM representation still sits at median Δ 22 (image 50) against 68.5 for random pairs.

So an image embedding and a machine description of the photograph both recover part of Turner's published
ordering more tightly than the museum's own keywords, and the VLM text keeps that signal where no keyword
is shared. That is the evaluation the project has been missing: not "do embeddings agree with tags" but "do
they agree with a curator's own taxonomy". Caveats: n = 127 objects over two editions (1973: 69, 1996: 58),
pairs are not independent, and the tag baseline pools all tag-sharing pairs while kNN takes ten per object,
so the comparison is indicative rather than a strict head-to-head. The permuted-null and the bootstrap both
say the Turner signal itself is not an artefact.

## 5. T-012's "lineages are not testable yet" does not survive the new dates

T-012 concluded that lineages could not be tested because dates were century-wide. The museum catalogues
now give production dates for 1,049 objects, so the question can be asked directly: *within one museum and
one type, is an object more similar to its temporal neighbours than to a random other object of that type?*
Adjacent pairs in date order versus 10,000 permutations of the order (`scripts/analysis/time_order_test.py`):

| Representation | groups (n ≥ 10 dated) | p < 0.05 | survives Bonferroni (p < 0.0023) |
|---|---:|---:|---:|
| DINOv2 image | 22 | **13** | **7** |
| E5 machine description | 22 | 10 | 4 |

Strongest: NEMO household technology (n=55, p<0.001), NEMO radio (28, p<0.001), NEMO television (22, p<0.001),
Teylers thermometers (21, p<0.001), Boerhaave demonstration models (24, p<0.001). The image representation is
the sharp one; the machine description is too uniform (cosines around 0.9) to discriminate much of the time.

**What it changes.** With documented dates the temporal structure inside a type is measurable, and it is
mostly there. The earlier negative verdict was a data problem, not a property of the collections.

**The photography control is done and the result holds.** A pure photography descriptor per image
(4×4×4 colour histogram, brightness, saturation, border/background colour, aspect, compressed size per pixel
— no object, no shape) predicts a time gradient in 6 of the 22 groups by itself (1 survives Bonferroni), so
the confound is real but limited. Regressing each embedding similarity on that descriptor (intercept and
slope, per museum) and re-running the test on the residual
(`scripts/analysis/photo_control.py`, `results/tables/time_order_photo_control.json`):

| After removing the photography component | p < 0.05 | survives Bonferroni |
|---|---:|---:|
| photography descriptor alone | 6 | 1 |
| DINOv2 image | **12** | **6** |
| E5 machine description | 10 | 3 |

Strongest survivors after the control: NEMO razor housings (40 objects, p<0.001), Teylers thermometers
(21, p<0.001), NEMO televisions (22, p<0.001), NEMO street lamps (21, p=0.003), NEMO vacuum cleaners (39,
p=0.010), Boerhaave electrostatics (12, p=0.013). So the temporal structure inside these types is not a
batch-photography artefact — within the limits of a descriptor that sees colour, light and framing but not
lens or studio layout.

## 6. Turner's catalogue is a taxonomy, and we now have its chapter list

Found by two low-effort search agents (URLs in the board report). One continuous numbered series: the 1973
volume covers roughly 1–350, the 1996 volume continues from **351 to 804** (a review in *Technology and
Culture*: "numbered from 350 to 804"; a Dutch newspaper review: "pakt de draad op bij instrumentnummer 351 …
om te eindigen bij 804"). The 1996 volume runs through topical chapters in a fixed order (Google Books
contents): Timekeeping · Weights and Measures · Mechanics · Hydrostatics · Pneumatics · Heat · Conductivity of
Heat · Physical Effects · Oil Lamps · Meteorology · Acoustics · Telephony · Optics · Interference ·
Polarization · Luminescence · Microscopes · Telescopes · Spectroscopy · Optical Devices · Projectors ·
Magnetism · Electricity · Voltaic Electricity · Electric Machines · Electro-Magnetic Machines · Induction Coils.

**The numbering groups by type, measurably** (`scripts/analysis/turner_catalogue_grouping.py`): among the 127
Teylers objects that carry a Turner number and a catalogue category, the median |Δ number| for two objects
**of the same category is 14**, against a permutation null of 65.5 (10,000 shuffles, p < 0.0001). So the
catalogue's own order is a class index — which is what the embedding test assumed without proving.

That makes the earlier result sharper: embedding neighbours sit at median |Δ Turner| **4.0** (machine
description) and **5.0** (image), i.e. *closer than the catalogue's own within-category spread of 14*. The
representation is not merely reproducing the museum's categories; it resolves inside them.

## 7. How deep does an embedding resolve a taxonomy? Boerhaave's subject hierarchy

Boerhaave's `03.09.0`-style subject codes are a documented hierarchy (the museum's own help text: 00
mathematics, 01 astronomy, 02 earth sciences, 03 physics, 04 chemistry, 05 biology, 10 medicine/hygiene/
pharmacy, 11 technology; prefix-searchable). That gives a curator-made label at four depths at once
(`scripts/analysis/boerhaave_hierarchy_benchmark.py`, 217 objects, neighbours restricted to Boerhaave):

| Depth (example) | queries | chance P@10 | DINOv2 | E5 title | E5 machine description |
|---|---:|---:|---:|---:|---:|
| 1 — `03` physics | 213 | 0.487 | 0.611 | **0.667** | 0.629 |
| 2 — `03.08` | 202 | 0.222 | 0.392 | **0.474** | 0.398 |
| 3 — `03.08.0` | 129 | 0.157 | 0.350 | **0.475** | 0.380 |
| 4 — leaf `03.08.1.0` | 69 | 0.068 | 0.309 | **0.406** | 0.338 |

Read the lift, not the raw number: at the coarsest depth any representation beats chance by a quarter; at the
leaf, title text is **5.9× chance** and the photograph **4.5×**. The taxonomy ceiling is not reached at these
depths — the leaf is still resolved.

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
