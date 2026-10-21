# Cleveland comparative-tool pilot

Official interfaces were investigated before ingestion:
https://openaccess-api.clevelandart.org/ and
https://www.clevelandart.org/open-access-api . The museum documents CC0 metadata and
image links for records with `share_license_status=CC0`. Dimensions in the structured
API dictionary are meters; inch helper fields are retained in raw records and omitted
from normalized SI dimensions. Creation dates are source creation-date bounds, not
accession dates. Original wording and full JSON remain under `raw.imports`.

A bounded pilot requested the first 12 results for each query `tweezers`, `scraper`,
`adze`, `knife`, at two-second request intervals. This inspected 32 returned entries,
not all query matches. Exact utilitarian-title inclusion admits Tweezers, Scabbard
Tweezers, Scraper and Paper Knife; it excludes depicted tools, vanity kits, sheaths,
ceremonial/prestige objects and weapons. Scabbard Tweezers is explicitly a component,
with the parent/cover accession retained. Its source geography is Sudan. No clinical
use or cultural origin is inferred from visual appearance.

Four records are imported. Eight official 900-pixel web image views (main plus first
alternate where supplied) have preserved credits, CC0 source designation, bytes/checksums,
pixel dimensions and object-specific API locators. This is a comparative art-museum
source, not a claim that it is a dedicated ethnographic museum. Training eligibility
remains separate from image redistribution rights.

Run from the project root:

```sh
python scripts/web/ingest_cleveland.py             # reproducible cached replay
python scripts/web/ingest_cleveland.py --refresh   # <=16 requests, >=2 seconds apart
```

The adapter reuses `ingest.Fetcher` for cache hashes, conditional requests, retries,
request budgets and host stops. It upserts the existing shared import file by exact
institution/accession and records all discovered/imported/updated/duplicate/skipped/failed
outcomes in `results/tables/cleveland_ingestion.json`. Cached replay has been tested to
leave normalized imports and image-supplement bytes unchanged. API record IDs and URLs,
query total, inspected page frame and next offsets remain in the report. Broad query
hit counts are not eligible-object counts or recall estimates. The image supplement is
`data/curated/import_images.json`; image bodies and API responses are URL-hashed raw caches.

The initial run used 12 requests (four API pages and eight images), with no failures.
Later replay reports four duplicates and 28 exclusions, with zero network requests.
Pitt Rivers and Smithsonian access blockers are independent of this working adapter.
