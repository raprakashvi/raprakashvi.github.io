# Museums to mine for surgical and medical instruments

Tested 21 October 2026 · exploratory · counts are what *we* retrieved, not collection sizes

## How the ranking was made

Ranked by usefulness **to this project**, using four criteria: depth of medical-instrument holdings (my judgement from the institutions' public profiles, **not a measured census**), cultural breadth (non-Western material matters for the inclusion goal), whether a scripted route exists and is permitted (tested), and how much metadata each record carries (material, date, maker, dimensions). Where a route was blocked I stopped; none of the blocks below was bypassed.

## Top five

| # | Museum | Why it matters | What happened when we tried | Next step |
|---|---|---|---|---|
| 1 | **Science Museum Group, London** (includes the Wellcome collection loan) | I know of no larger holding of medical instruments, and it spans many cultures. Several of its photographs already illustrate the atlas | Scripted API access is refused (HTTP 403 from its CDN), also with an identifying User-Agent. **Not harvested** | Manual download or a data request to the museum. Drop records into `data/raw/morph_extra/` (see `MORPHOLOGY.md`) |
| 2 | **Smithsonian, National Museum of American History** (Medicine and Science) | Large, well catalogued US collection, CC0 metadata | API works with the public demo key, which allows only 10 requests per hour. 3,549 NMAH records matched our instrument query. **Only one has an open image**, so this is a metadata source, not a shape source | Free personal api.data.gov key for the full set; the open-access bulk files are an alternative (untested) |
| 3 | **Museum Boerhaave, Leiden** | Dutch national museum of the history of science and medicine; deep European surgical and obstetric holdings with makers and places | Its own website was unreachable from here. Reached through **Europeana**: 1,470 further records after removing 402 already in our PDFs. 1,851 specimens analysed in total | Already integrated. Request materials and dimensions from the museum directly |
| 4 | **Ingenium, Ottawa** (Canada Science and Technology Museum) | Very large medical-artifact collection published as open data (full CSV, XML) | The bulk-data host failed to connect and the main site returned 403. **Not harvested** | Download the CSV in a browser (URL in the data portal listing `open.canada.ca`) and filter with `morph_meta.classify_text` |
| 5 | **The Metropolitan Museum of Art, New York** | Not a medical museum, but the best open record for ancient and non-Western implements, with medium, dimensions and culture | Bulk CSV plus a polite per-object crawl. A first high-rate crawl was blocked and stopped. **167 objects, 142 usable shapes** (Egypt, Cyprus, Minoa, Rome, Franks, Andes, Colombia, Java, Korea, Islamic world) | Done. Only keyword-matched objects were screened; recall is unknown |

## Nominated by you

| Museum | Result |
|---|---|
| **Wellcome Collection** | The catalogue API is open and reachable but holds books, archives and **pictures**, not the loaned objects (those sit with the Science Museum Group). 973 picture records; 292 instrument-related with open licences. They are drawings and prints, analysed as a separate image role, not specimens |
| **US National Library of Medicine** | Its Digital Collections `robots.txt` explicitly disallows `anthropic-ai` and GPTBot. **Not crawled.** A person can download images and metadata themselves and drop them into the intake folder |

## Found along the way (via Europeana)

| Holder | Retrieved and relevant | Notes |
|---|---|---|
| Region Skåne medical history collections (Sweden) | 495 | Clean studio photographs; excellent shape data. Swedish titles: the English translations are sometimes wrong ("shell" for *skalpell*) so the classifier reads Swedish |
| Museum of Ethnography, Stockholm | 99 | Chinese (Sven Hedin collection), Peruvian, African pieces; burnt-in accession labels leak into some masks |
| Museum of World Culture, Gothenburg | 69 | Mostly Peruvian "tweezers" (flat folded plates) |
| Estonian Health Museum | 27 | Small, mostly scalpels, probes and forceps |
| Museum of Mediterranean and Near Eastern Antiquities, Stockholm | 17 | Egyptian and Near Eastern |
| Portable Antiquities Scheme (UK finds) | 519 | 245 Roman, 170 early medieval, 48 medieval tweezers and some probes. Photographs are **composite multi-view sheets with scale bars**, so silhouettes are invalid and they are excluded from shape analysis. Their metadata (counts by period) is still useful |

## Untested candidates for the gaps (Africa, East and South Asia, Arabic and Persian illustrated surgery)

Smithsonian units outside NMAH, the British Museum, Musée du quai Branly, the Pitt Rivers Museum, Wereldmuseum (Leiden/Amsterdam/Rotterdam), the National Museum of Korea, the Palace Museum collections, and manuscript drawings from the Suśruta and Al-Zahrawi traditions. None has been tested. Each needs its terms of use and access route checked before any harvest.

## Reproduce

```bash
python roman_tool_lineage/scripts/analysis/harvest_museums.py           # Europeana, Smithsonian, Wellcome metadata
python roman_tool_lineage/scripts/analysis/morph_harvest_normalize.py   # classify, screen, fetch images for relevant rows only
```

Every harvested record has a screening row (`data/raw/museums/screening_*.csv`) with its decision and reason, and access limits are in `data/raw/museums/access_notes.json`. Raw API dumps and downloaded images are not committed (third-party rights, size); the scripts regenerate them.
