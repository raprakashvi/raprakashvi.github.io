# Vind het uit × Vestigium: AI as a pattern estimator for museum collections

Started 2026-11-14. Owner: project lead. Supervisor: Fable (see `agents/SUPERVISOR.md`).
Status of every task lives in `agents/HANDOFF.md`; this file holds the research plan and only
changes when the plan changes.

## Why

Museum Boerhaave's head of research and collections pointed us to *Vind het uit!*
(https://vindhetuit.nl), a shared platform for five Dutch science museums. It aims to connect
the same kinds of objects across collections into "family trees", but those links do not exist
yet. The thesaurus approach is not a failure; objects across museums are simply not linked to
each other, and no single museum has enough data. Vind het uit pools 1,204 objects:

| Museum | Objects | Kind of institution |
|---|---|---|
| NEMO Science Museum | 488 | science centre |
| Teylers Museum | 270 | oldest museum in NL, 18th–19th c. physics cabinet |
| Rijksmuseum Boerhaave | 217 | national museum of science and medicine |
| Universiteitsmuseum Groningen | 127 | university museum |
| Universiteitsmuseum Utrecht | 102 | university museum |

(Facet counts read on 2026-11-14. Also 43 stories and 10 articles by young editors.)

What the site gives per object: title, a Dutch description (not always), one photograph, free-text
dimensions, a century-wide period ("1900-1999"), about 130 free subject keywords (geology 143,
demonstration models 77, household technology 67, shavers 40, vacuum cleaners 39,
galvanometers 38, electrostatics 37, then a long tail), and an untyped "Gerelateerde objecten"
(related objects) list. No maker, material, inventory link, standard vocabulary or licence.
Object pages: `/collectie/dcn_<museum-slug>_<inventory-id>`. Data arrive through
Collectie Nederland / Delving; images come from each museum's own catalogue server through a
smart-crop proxy.

The project owner states that the licences for this use are in place. A data export is not
available, so the public website is scraped (politely, cached, replayable).

## The question

Can AI act as a **pattern estimator** for museum curation? That means analysing collections,
monitoring their quality, filling gaps, building bridges between collections, and showing blind
spots no single museum can see. And can it connect an old science museum, a national museum, a
modern science centre and two university museums in one coherent picture? If it works well for
general science and technology, it should transfer to other domains, including back to surgical
instruments (the original Vestigium study, which is kept).

| # | Research question | Baseline it must beat or explain |
|---|---|---|
| RQ1 | **Bridges.** Do multimodal links (image, outline, text, documents) connect objects across the five museums that shared keywords do not? | The site's own related-object lists; subject-keyword overlap |
| RQ2 | **Gaps.** Can AI fill missing maker, model and date from the photograph (nameplates, inscriptions) and from external sources, with citations and calibrated confidence? | Fields as published; nearest-neighbour copy of metadata |
| RQ3 | **Lineages.** Within a type (shavers, vacuum cleaners, galvanometers, radios, electrostatic machines…), do dated sequences show series, inspiration or derivation? | Random time orderings; keyword-only grouping |
| RQ4 | **Blind spots.** Which types, periods, makers or mechanisms are missing, duplicated or unusually concentrated per museum and across all five? | Per-museum facet counts |
| RQ5 | **Transfer.** Do methods built on surgical tools (photography control, pose-free outlines, typed links) work for heterogeneous 3-D science objects, and do lessons flow back? | Vestigium's existing benchmarks |

## What a "family tree" means here

Not only descent. A tree is a graph of **typed links**, each with its evidence and its
evidence level:

| Link type | Example evidence | Level |
|---|---|---|
| derivation | patent citation, maker's documented successor model | documented |
| series | same maker or product line, consecutive models | documented or inferred |
| category | same object type (thesaurus or catalogue term) | documented |
| inspiration | documented reference, demonstration copy of a research instrument | documented |
| similarity: form or mechanism | image or outline neighbours | inferred (AI) |
| similarity: described use | Dutch text neighbours | inferred (AI) |

Every link records its type, channels, sources (URL plus quoted snippet), confidence and level:
**documented / inferred / AI hypothesis**. Inferred links propose comparisons. They never claim
lineage.

## How AI is used

| Job | Tool | Rule |
|---|---|---|
| Visual description: parts, mechanism, controls, visible materials, era cues | local Qwen3-VL-8B NF4 (fallback 4B/2B), reusing neurovascular_robot's pinned weights, environment and runtime (read-only), under `scripts/run_limited.sh` | Stored as `machine_description` with model, prompt hash and date. Never merged into museum text. |
| Nameplates and inscriptions to maker, model, serial number | Qwen3-VL OCR on full-resolution images | Each reading keeps its image crop and confidence. |
| External facts: maker, model year, patents, ads | Wikidata, Wikipedia (nl/en), Espacenet / Google Patents, Delpher (Dutch newspapers), Europeana, Collectie Nederland, other museum catalogues | **No fact without a URL and a quoted snippet.** Searches are logged. |
| Entity extraction, Dutch normalisation, link proposals, short bridge texts | DeepSeek (text API, via OpenCode) or Claude | Writes only from cited facts. |
| Embeddings | DINOv2 B/L, SigLIP 2, multilingual-E5 (all cached); pose-free outlines only for types where shape is meaningful | Photography confound measured per museum, as in AI_DEEP_METHODS.md §1–2. |

A fabricated fact in front of curators would end the project's credibility. Citations and
evidence levels are not optional, but they live **in the background**. They are stored with
every fact and link (data files, run logs, an evidence export for curators), not printed on the
page. The site carries one plain, site-wide note that this is AI-assisted research: links and
enriched details are AI proposals with logged sources. No per-item citation lines, AI badges
or grey caveat text. Evidence can open on a deliberate click at most.

## Phases and acceptance

| Phase | Work | Accepted when |
|---|---|---|
| **0: Check** | Scrape everything (DeepSeek, task T-001); field-completeness audit; image resolution; Boerhaave overlap with our records; Qwen3-VL feasibility on 20 objects; decision memo | All objects, stories, related-object links and images cached and replayable; counts reconcile with the site's facets; completeness table per museum; memo in `docs/VINDHETUIT_PHASE0.md` |
| **1: Data model** | Multi-domain release (`domain: surgical` / `science-technology`) without disturbing the frozen surgical release; ID and alias scheme; Boerhaave cross-links | Surgical release byte-identical; new release validated; architecture decision recorded |
| **2: Enrichment** | VLM descriptions, nameplate OCR, cited external facts, refined dates | Before/after completeness per field with an evidence card for every added fact; 50-record manual spot-check logged |
| **3: Links** | Embeddings, typed link graph, photography controls | Benchmarks against keyword and related-object baselines with bootstrap CIs; per-museum confound table |
| **4: Patterns** | Lineages per type, bridges across museums and eras, blind-spot maps, monitoring indicators | Each finding marked observation / inference / speculation; negative results kept |
| **5: Website and demo** | Clean redesign; demo videos, GIFs and 3-D animation | See "Demo" below; browser checks pass; deployed |
| **6: Write-up** | Methods, results, limits; curator blinded judgments (later, with the existing review mechanism) | Draft for the collaborator |

## Demo ("show, don't tell")

1. **One object, five museums.** Pick a NEMO shaver or a Teylers electrostatic machine. Its typed
   links light up across collections and eras, and each one opens its evidence.
2. **Time-shape space fly-through.** A 3-D space with time as height and photographs as sprites,
   coloured by link type. Exported as MP4/GIF and interactive on the site.
3. **Lineage strips.** A dated photo sequence per type with smooth transitions (vacuum cleaners
   1900→2000).
4. **Gap filling, live.** Nameplate crop → reading → Wikidata/Delpher source → date, with
   completeness before and after.
5. **Blind-spot map.** Museum × type × decade, showing what each museum has that the others lack
   and where the old-to-modern bridges are.
6. **A 60–90 s captioned video** stitched from 1–5 for the collaborator and their head of research.

## Website direction

Clean and editorial, like a good museum catalogue, not like an AI product. The object
photographs lead. Use one restrained palette and the type scale from `visuals/`. Captions are
short and plain, with provenance kept in the background. Keep small grey text to a minimum.
Same site and URL as before (https://raprakashvi.github.io/roman-tool-lineage/), deployed from
`/home/rp/rp_repo/raprakashvi.github.io`. Avoid gradients, glows, emoji, sparkle icons, chat-style panels and
cards nested in cards. Prefer flowcharts and pictures to prose (user preference). The surgical
study stays as its own domain section. Navigation and section order may change. Older views are
kept, adapted where needed, not deleted.
