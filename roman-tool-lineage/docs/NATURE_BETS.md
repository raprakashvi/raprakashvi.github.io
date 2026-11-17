# Two bets for a Nature / PNAS-level result

Started 2026-11-16 (lead: "I want this piece to be in Nature, hence it needs a discovery or something
worth PNAS"). Written by the supervisor (Claude). Task status lives in `agents/HANDOFF.md`; this file
holds the claims, the fixed protocols, what has been tried and what is sealed. Change it only when
a claim or protocol changes, and say what changed and why at the bottom.

**State on 2026-11-17: neither bet is established.** Bet 1 has two suggestive types and one
contradicting check. Bet 2 is an idea with no measurement behind it.

## The bar

A headline claim must be about the history of technology or about collecting, with AI as the
instrument. It must be scored against something the same AI did not produce (a curator taxonomy, a
museum field, a published source, a non-museum corpus) and replicate on data that was not looked at
while the test was designed. Method validation is supporting material, not the claim.

## Review of AI use so far (2026-11-16)

Numbers from the board reports; not re-run in the review unless marked.

| Use | Evidence | Verdict |
|---|---|---|
| Frozen embeddings (DINOv2-L, SigLIP 2, E5) | Neighbours at median 4–5 Turner numbers apart against 7 for shared tags and 68.5 random (n = 127); Boerhaave leaf codes 4.5–5.9× chance | strong, small n |
| Time order inside a type | 13 of 22 groups; 6 survive Bonferroni after the photography control | solid |
| Platform against catalogue | Platform shows 0.26–2.2 % of three catalogues; type share 0.6 % to 59 % | solid, exact counts |
| Mutual nearest pairs across museums | 739 pairs; about 40 of the first 50 meaningful by DeepSeek's eye | promising, unscored |
| Learned shared space | Photo-only +0.036 is real; title and combined gains are circular; fails two of three site benchmarks | research view only |
| Groups by closeness | Purity 0.03–0.15 on large groups before T-037's naming rule; several follow background | weakest validated piece |
| LLM codebook on 50,063 records | AI-against-AI kappa 0.82; 33 % unclear; lags move with scale (optics 220 → −24 y) | lags not headline material |
| VLM descriptions, nameplates, external facts | No link gain beyond titles; 21 unverified plate readings; 15 of 63 names matched | weak |
| Generated silhouettes, latent decoder | Do not beat nearest-neighbour lookup | negative, kept |

**Unused curator-made ground truth, counted 2026-11-16 from `data/intake/catalogue_*/records.jsonl.gz`:**
10,282 Boerhaave records carry a hierarchical subject code (290 distinct codes, 181 with ≥ 10
records, 10,141 with an image reference); 309 Teylers records cite Turner's catalogue (240 with an
image reference). Benchmarks so far used 217 and 127. Only 14,000 of Boerhaave's 83,828 and 14,000 of
Teylers' 99,021 records are harvested.

Supporting directions from that review (method figures for either bet): train and score the shared
space on Boerhaave codes and test on Turner; score groups against those codes; catalogue error
detection with yield per 100 flags; dating undated objects (about 17,800 of 50,063 have no parsed
date); what reaches the platform; tempo of change per type.

## Probes run on 2026-11-16 (NEMO only, CPU, stored vectors)

| Probe | Script | Result | Reading |
|---|---|---|---|
| Variety of form per decade within a type | `scripts/analysis/bet1_probe_lifecycle_nemo.py` | shavers 0.70 (1930s) → 0.43 (1990s), ρ = −0.89, 7 decades; radios 0.61 (1920s) → 0.29 (1950s), 0.39 (1960s), ρ = −0.90; light bulbs ρ = −0.36; technical drawings +0.70 | suggestive; only 4 types eligible, one is not a device |
| Same, on object dimensions (SD of log largest dimension) | same script | shavers +0.18, radios +0.70, light bulbs −0.60 | **does not confirm** |
| Type less readable from the photograph in later decades | `scripts/analysis/bet1_probe_typereadability_nemo.py` | accuracy 0.81 (1880s) rising to 0.85–0.93 (1980s–90s); 9–11 of 20 types negative | **null, dropped** |
| Lag from production to acquisition | `scripts/analysis/bet1_probe_acquisition_lag.py` | Science Museum n = 1,662, Smithsonian n = 587; medians 2–33 y per bin, no consistent trend | thin, surgical only |

## Bet 1 — Early disparity: variety of form peaks early in a technology's life

**Claim to test.** Across many device types and independent collections, the variety of form within
a type is highest early and then falls. Biological counterpart: Hughes, Gerber and Wills (PNAS 2013),
98 clades, early high disparity predominant. Management counterpart: dominant design.

**Novelty: unverified.** A shallow search (2026-11-16) found dominant-design studies of single
products and deep-learning work on design-patent images, but no test across many technologies.

**The objection.** Museums keep odd early specimens and typical late ones. That alone produces the
pattern. The claim needs a non-museum replication (design patents) or it becomes a finding about
collecting.

### Protocol P1 (fixed 2026-11-17; implement, do not redesign)

- **Type.** A museum's own `object_name`, normalised with the T-029 normaliser, inside one museum.
  Paper media are excluded by name (drawing, photograph, slide, poster, print, book, letter) and the
  list of excluded names is reported.
- **Eligible object.** Photograph (not a registration card, `image_kind.json`), one object per image
  hash, production date range ≤ 10 years; the object's year is the range midpoint.
- **Eligible type.** At least 4 decades with at least 15 eligible objects each. Sensitivity run:
  range ≤ 25 years, 10 objects, 3 decades. Report both; the first is primary.
- **Disparity D(decade).** Mean pairwise cosine distance among 15 objects drawn without replacement,
  averaged over 300 draws, seed 20261116. Primary encoder DINOv2-L; SigLIP 2 image as second.
- **Per type.** Spearman ρ(decade, D) and the centre of gravity CG = Σ tᵢDᵢ / Σ Dᵢ with time scaled
  to 0–1 over the type's eligible decades (CG < 0.5 is early-heavy). Null: 1,000 permutations of
  objects across the type's decades.
- **Across types.** Share with CG < 0.5 (binomial against 0.5) and Wilcoxon signed-rank of CG − 0.5.
  Types still in production are flagged as truncated and also reported separately.
- **Controls, run before anything else.**
  1. The same curves on the photography descriptor alone (`scripts/analysis/photo_control.py`:
     colour histogram, brightness, saturation, border colour, aspect, bytes per pixel).
  2. The same curves on embeddings after regressing out that descriptor.
  3. Photography-free measures: SD of log largest dimension; entropy of the `material` field.
  4. Batch structure: per type and decade, the share of objects from the largest maker and from the
     longest run of consecutive object numbers; rerun with at most 3 objects per maker per decade.
- **Kill at the discovery stage.** If the descriptor alone gives a decline of similar size and the
  residual embedding shows none for shavers and radios, stop and report a photography artefact.
- **Kill at confirmation.** Fewer than two thirds of eligible types early-heavy on the sealed set,
  or failure on design patents.

### Sealed sets

- **Discovery:** NEMO.
- **Sealed for Bet 1:** the Boerhaave and Teylers catalogues, and every collection harvested later.
  On sealed sets only counts of eligible types and decades may be computed. No disparity values, no
  plots, no per-decade embedding statistics. Unsealing is a separate board task opened by the
  supervisor after the protocol and its code are reviewed.

### Stages

0. Power: count eligible types per museum (counts only on sealed sets). Fewer than about 30 in total
   means a larger technology collection must be harvested first (Science Museum Group is the obvious
   candidate; multi-hour job, lead decides).
1. Discovery on NEMO with all controls.
2. One run of the frozen code on the sealed museums.
3. Replication on US design patents by class and decade.
4. Surgical instrument types as a second domain (obstetric forceps, specula, lithotrites).
5. Figures: the law across types; the replications; the taxonomy validation; confirmed finds.

## Bet 2 — Lost instruments: how much of the surgical armamentarium survives in museums

**Idea.** Kestemont et al. (Science 2022) used ecology's unseen-species estimators to estimate lost
medieval literature: works are species, surviving copies are sightings. Here a *design* is a species
and each museum is a sampling unit. Groups by closeness that cross museums are the incidence data;
AI is needed because names differ by museum and language. Unlike the literature study, a slice of
the true universe exists: makers' trade catalogues (Weiss 1863 is already screened; Charrière,
Tiemann and others exist in digitised form). The claim would be an estimate of how many instrument
designs existed, what share survives, and which kinds were systematically lost, checked against a
catalogue slice.

**Status: gated.** Nothing is measured. A crude count on English names (Science Museum, Smithsonian,
Met, Cleveland) found 8,821 name strings of which 8,648 occur in one museum only. This shows that
free-text names cannot define a design; it is not an estimate of anything.

**Novelty: unverified.** The Science paper names stone tools and coins as possible applications; the
ERC project UNSEEN applies the models to Babylonian texts and Luristan bronzes. No application to
instruments or technology was found in a shallow search (2026-11-17). Coin-die studies in numismatics
are likely prior art for the estimator on objects and were not searched properly.

**Four gates, in order (feasibility task T-041).**

1. **Real sampling units.** Five of the 13 surgical intakes are aggregators. Smithsonian has 59
   images in 5,000 records; Wellcome has 0 included records. Count actual museums and their included,
   imaged objects.
2. **Match recall.** The same design in two museums must be found as the same design. Measure on
   eponymous instruments held in several museums (Spencer Wells, Péan, Kocher, Liston, Sims, Cusco…).
   Photography and language make one design look like two singletons, which inflates "lost".
3. **Granularity.** The estimate moves with how finely designs are split. Fix granularity on the
   eponym set and report across a range.
4. **Known universe.** Test the estimator on one bounded catalogue slice before estimating anything
   unknown.

No unseen-species estimate is to be computed or quoted until gates 1–3 are passed.

## Other surgical candidates considered

- **Convergence across independent traditions** (form constrained by anatomy): data for traditions
  without contact is thin; similarity cannot separate inheritance from convergence.
- **Stasis, then a rupture with asepsis (≈ 1875–1900):** the direction is already known to
  historians; the existing tempo fit is weak and rests on one museum. Worth repeating across museums
  as a figure, with `material` as a photography-free measure.
- **National styles that dissolve:** place of manufacture differs from holding museum, so style can
  be tested inside one museum's photography. Not probed.

## For the next agent: where to pick up, and what is still unexplored

**Start here.** Read this file, then `agents/reports/T-040.md` and `T-041.md` if they exist (second
DeepSeek agent, launched 2026-11-17 from `~/vestigium-agents/explorer_T040.sh`, log beside it). Review
those reports before building on them: re-run at least one number yourself, and check the sealed-set
rule was kept (no disparity values for Boerhaave or Teylers anywhere in `results/`).

**Next steps that depend on T-040.**
- Declines survive the photography test and ≥ 30 types are eligible: review the code, then open the
  unsealing task (one run on Boerhaave and Teylers).
- Declines survive but too few types: ask the lead about harvesting a larger technology collection
  (Science Museum Group; multi-hour job) and about US design patents (bulk download).
- Declines do not survive: record the null here, and move the weight to Bet 2 or to the candidates
  below. Do not rescue the claim by changing thresholds after the fact.

**Next steps that depend on T-041.** If fewer than about 8 real museums have 50 or more included,
imaged objects, or eponym match recall is near the random baseline, Bet 2 needs more surgical
harvesting or a better shared space before any estimate. Only then test the estimator on a catalogue
slice.

**Not yet explored (each needs one bounded probe with a kill criterion written first).**
1. **National styles that dissolve.** Does form predict place of manufacture inside one museum's
   photography, and does that fade after about 1900? Check `place` and `maker` coverage first.
2. **Asepsis rupture across museums.** Repeat the tempo fit per museum; use `material` (ebony, ivory →
   all metal) as a photography-free measure. Known direction, so a figure, not a headline.
3. **Surgical types as the second domain of Bet 1.** Obstetric forceps, specula, lithotrites: early
   variety then standardisation? The Science Museum intake has 30,535 records but median date range
   49 years, so check how many are narrowly dated before anything else.
4. **Design patents as the non-museum corpus.** Find the bulk source, classes and date coverage; no
   download without the lead's word.
5. **Curator codes as training labels.** 10,282 Boerhaave subject codes and 309 Turner references are
   unused at scale (see above); a space trained on them and tested on Turner is the method figure
   for either bet.
6. **Prior art for Bet 2.** Search coin-die estimation in numismatics and follow-ups to the Science
   2022 paper properly before calling the application new.
7. **Novelty for Bet 1.** A proper literature search (cultural evolution, industry life cycle,
   disparity through time for artefacts); the 2026-11-16 search was shallow.
8. **Collecting as the phenomenon** (fallback if Bet 1 turns out to be collection bias): what museums
   keep early versus late, redundancy between museums, what reaches the platform.

**Standing rules.** Exploratory probes on NEMO only for Bet 1; write the test and its kill criterion
before running; keep nulls in the probe table; shared machine limits apply; no curator-facing
deliverables unless the lead asks.

## Decision that stays with the lead

Ithaca, Aeneas and the Nazca survey rest on expert or field confirmation. A "confirmed finds" arm
needs curators at some stage; the standing instruction is no curator-facing deliverables for now.

## Sources

- Hughes, Gerber, Wills 2013, PNAS: https://pmc.ncbi.nlm.nih.gov/articles/PMC3752257
- Kestemont et al. 2022, Science: https://www.science.org/doi/10.1126/science.abl7655
- UNSEEN project: https://cordis.europa.eu/project/id/101281159/es
- Dominant design with phylogenetic networks: https://arxiv.org/pdf/2407.10206
- Shapes as product differentiation (font embeddings): https://arxiv.org/html/2107.02739v2
- Design-patent image retrieval: https://arxiv.org/pdf/2003.08741
- ArtiFact (error detection in museum records): https://arxiv.org/pdf/2606.09648
- SFO Museum shared embeddings: https://millsfield.sfomuseum.org/blog/2026/05/27/embeddings/

## Changes

- 2026-11-17: file created; protocol P1 fixed; Bet 2 added as gated.
