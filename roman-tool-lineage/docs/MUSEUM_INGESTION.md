# Museum ingestion and scope

**Follow-up update:** public editorial access now works with corrected robots handling;
the collection has 2,826 records and stable-ID shape neighbors. See [ACCESS_RECOVERY.md](ACCESS_RECOVERY.md).
The earlier pilot statistics below describe the initial delivery.

As observed 2026-10-21. Bounded pilots; no complete museum collection is claimed.

## Inclusion and review

Include source-identified, manually operated tools with a recognizable working role:
cutting, piercing, scraping, crushing, extracting, gripping or manipulating material.
Include archaeological and ethnographic comparators and explicitly mark modern experimental
reference pieces. A nonclinical comparator is not evidence of surgical practice. Keep
uncertain object names (e.g. pin or awl) uncertain. Exclude human remains, funerary/sacred or
restricted records pending cultural review, pure depictions from object morphology, and
objects without a stable source identifier. Do not infer use from silhouette alone.
An assemblage remains an assemblage; it cannot be split into invented independent records.

## Verified pilots

| Source | Accessible scope reviewed | Outcome |
|---|---|---|
| Pitt Rivers Museum, Oxford | Two official editorial pages, five accession-linked tool mentions | Five imported: obsidian blade 1942.12.62; experimental piece 1995.20.1; knife blade 1884.121.12; fork/grapple 1884.121.29; pin/awl 1884.140.485 |
| Smithsonian NMNH Anthropology | Official Open Access API, `unit_code:NMNHANTHRO AND knife`, first three relevance results | Three assemblage records imported with USNM object numbers E433559-0, E358378-0, E200466-0. Query reports 13,281 matches; only three reviewed. |

Pitt Rivers records are **editorial accession mentions**, with missing production dates
and no new images. They verify a pathway and identifiers, not full object descriptions or
museum coverage. The experimental piece has no ancient manufacture attribution.
Smithsonian API metadata is marked CC0; cultural/ethical review remains separate.
Accession and collection events stay in raw data, not manufacture intervals. The first
API probe used an incorrect unit code (NMNHANTH) and returned zero; it is not a valid
absence result. The correct identifier NMNHANTHRO returned the bounded pilot above.

Official sources and access investigation:

- [Pitt Rivers collections interface](https://www.prm.ox.ac.uk/collections-online): direct live request returned HTTP 200 with a **392-byte maintenance page**, not records. The official page/search documentation indicates a modern searchable catalog, but no live API, export scope or pagination could be established during the outage.
- [Lithic technology](https://england.prm.ox.ac.uk/englishness-Stone-tool-technology.html) and [Medhurst/Jordan Hill](https://england.prm.ox.ac.uk/englishness-James-Medhurst-and-Jordan-Hill.html): official editorial pages successfully retrieved and cached; candidate locators and accession tokens verified locally. The editorial host's `robots.txt` subsequently returned **HTTP 403**. Automated refresh now stops on that response. No bypass or further editorial crawl; use offline replay or obtain source clarification.
- [Pitt Rivers photographic services](https://www.prm.ox.ac.uk/photographic-services): distinguishes private-study uses and online/print reproduction licensing. Existing project image inclusion follows the owner's research instruction; it does not establish source permission. No new Pitt Rivers image service was bulk-harvested.
- [Pitt Rivers use of collections](https://prm.web.ox.ac.uk/using-our-collections): sensitivity flags and missing image explanations must be respected when a live adapter becomes available.
- [Smithsonian official data access](https://naturalhistory.si.edu/research/idsc/data-access) links to [Open Access API documentation](https://edan.si.edu/openaccess/apidocs/). The pilot used the published demo key; sustained harvesting needs a user key or reviewed bulk files. No private credential was used or stored.

## Pipeline

`data/curated/ingestion_candidates.json` holds versioned inclusion decisions, verified
locators, required accession/caption tokens and API scope. `scripts/web/ingest.py` shares
one cache/retry client across adapters. URL-hashed raw bodies and metadata record
retrieval date, checksum, byte count, ETag and Last-Modified. Cache replay is the default:

```bash
python scripts/web/ingest.py
```

Replays require no network and are idempotent. First-seen records are imported; changes
update the same institution/object-ID pair; unchanged records count as duplicates.
Sensitive candidates are skipped with a reason. Token/schema failures remain in outcomes.
`results/tables/ingestion_initial_import.json` preserves the first successful mixed-source
import; `ingestion_coverage.json` reports the latest run. Every run reports discovered,
imported, updated, skipped, duplicate and failed counts. The current export never deletes
previous successful records because a source is temporarily inaccessible.

`--refresh` checks page-host robots directives, applies conditional requests, <=1 request
per second, three attempts with backoff for temporary network/5xx failures, and a host
stop after 401/403/429. Pitt Rivers page refresh is currently blocked by robots HTTP 403;
replay remains possible. API use follows documented API terms rather than treating HTML
scraping permission as API authorization. Add approved adapters to this pipeline rather
than unrelated scrapers. API page size is deliberately bounded; expand only after a
representative review and source access/cultural review. No image downloader is enabled
for these pilots. Raw source caches are not included as raw HTML in the deployed site;
record-level original values and source references remain in dataset exports.

## Next sources and exact gaps

| Priority | Museum / interface | Feasibility and next step |
|---|---|---|
| 1 | Pitt Rivers modern database | Retry official maintenance status manually; establish documented API/export, robots terms and source sensitivity fields before implementing a catalog adapter. Do not scrape around the outage. |
| 2 | Smithsonian NMNH Anthropology | Extend working API adapter with a personal api.data.gov key, task-specific queries, object-level IDs and cultural flags. Demo query only; do not claim recall from the relevance-ranked first page. |
| 3 | Museum of Ethnography, Stockholm; Museum of World Culture, Gothenburg | 74 and 52 existing morphology specimens already migrated. Extend the shared Europeana route after defining reviewed tool queries, per-record rights, and a new cached search frame; existing samples are keyword/QC-limited. |
| 4 | [Te Papa](https://www.tepapa.govt.nz/learn/research/datasets/collections-api/api-terms-of-use) | Official API supports guest trials and a registration key for sustained work; metadata CC BY 4.0, media rights vary. Register for a key and establish taonga review before expansion. No Te Papa objects imported. |
| 5 | [Cleveland Museum of Art](https://openaccess-api.clevelandart.org/) | Documented keyless API and bulk CC0 metadata, with rights per image. Feasible comparative African/Asian implement source; inclusion screening not yet executed. No Cleveland import claimed. |

A future coverage report must specify query, total hits, pages reviewed, eligible objects,
duplicate groups, failures and exclusions, along with dates and adapter versions. Hit
counts from broad museum searches are not the number of relevant or accessible tools.
