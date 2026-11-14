# Vind het uit, Phase 0: check and decision

2026-11-14. Supervisor review of T-001 (scrape) and T-002 (VLM). Numbers below were recomputed by
the supervisor from `data/intake/vindhetuit/` unless marked "reported".

## Decision: go for Phases 1 to 3

The collection is complete and replayable, the photographs are usable, and the site's own
"related objects" turn out to be a weak baseline, which leaves real room for RQ1.

## Completeness per museum (n = 1,204 objects, 0 duplicates)

| Museum | Objects | Description | Date | Parsed dimensions | Photograph | Median megapixels |
|---|---:|---:|---:|---:|---|---:|
| NEMO | 488 | 100 % | 97 % | 0 % | museum original | 0.67 |
| Teylers Museum | 270 | 0 % | 21 % | 60 % | 128 original, 142 site crop | 1.0 |
| Rijksmuseum Boerhaave | 217 | 0 % | 100 % | 89 % | site crop | 1.0 |
| Universiteitsmuseum Groningen | 127 | 0 % | 99 % | 0 % | site crop | 1.0 |
| Universiteitsmuseum Utrecht | 102 | 100 % | 100 % | 97 % | site crop | 1.0 |

Maker: 0 % everywhere (the platform has no such field). Scraped totals equal the site's facet
counts for every museum. Offline replay reproduces `records.jsonl` byte for byte (checked).

## Observations

- **Text is lopsided.** Only NEMO and Utrecht have descriptions (590 of 1,204). For the other
  three museums the title and subject tags are the only text, so image evidence carries more weight.
- **Teylers is mostly undated** (214 of 270 without a date).
- **Photographs.** 588 of 1,204 are the site's 1000 px smart crop (Boerhaave's image server
  answered 503; one media host disallows robots). A crop can remove part of the object. This is a
  photography confound that differs by museum and must be measured in Phase 3.
- **The site's related-object lists are keyword overlap.** 53,304 links; 93.2 % of them join two
  objects that share a subject tag; 23.2 % cross a museum boundary; the page order is reshuffled
  on every fetch (reported), and a second list is a random 5-object sample of the same domain
  (reported). 8 objects have no related object.
- **Boerhaave overlap with the surgical study: 0 of 217** inventory numbers. No `same_object`
  links are needed; the two domains are disjoint today.
- **Subject tags** are a long tail: geologie 143, (demonstratie)modellen 77, huishoudtechniek 70,
  scheerapparaat 40, stofzuiger 39, elektrostatica 38, galvanometer 38.
- **VLM (T-002).** Qwen3-VL-8B NF4 fits (6.5 GB GPU, about 6 s per image). Descriptions are not
  yet trustworthy: a leading prompt, one invented mechanism, flat confidence. Text reading improved
  with more pixels on the one inscribed object.

## Inference

- Beating the related-object baseline on cross-museum links is plausible, because the baseline
  is mostly same-tag and 77 % within one museum. Not yet tested.
- RQ2 (gap filling) has the most room at Teylers (dates) and everywhere (maker).

## Known deviations in the scrape

- Early requests carried the engine's default User-Agent, not the generic one in the source file.
  Fixed for later requests (reported by DeepSeek).
- DeepSeek's report gives 11 and 57 for objects without related links in two places; the
  supervisor counts 8 objects with no outgoing link.

## Next

| Task | Who | What |
|---|---|---|
| T-006 | Sonnet | Science-technology release (`item-v2`, `SCI-` ids) per ADR 001 |
| T-007 | Sonnet, GPU | Image and text embeddings; cross-museum link benchmark against the related-object, keyword and random baselines, with bootstrap CIs and a per-museum photography confound table |
| T-008 | DeepSeek | Maker, model and type extraction from titles and descriptions, each with its quoted snippet; retry Boerhaave originals |
| T-009 | Sonnet, GPU | VLM descriptions with a neutral prompt, after T-007 frees the GPU |
