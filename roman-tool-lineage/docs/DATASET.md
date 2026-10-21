# Vestigium dataset v1

Schema: `data/schema/item-v1.schema.json`, JSON Schema Draft 2020-12. Validate with
`python scripts/web/verify.py`. Main export is UTF-8 JSONL, one record per line.
A record can be a single object, grouped artifacts, a catalog assemblage, an image/text
witness, or an editorial accession mention. Record counts are not physical-object counts.

## Permanent identity and releases

`data/registry/identifiers.json` is authoritative and must be committed and backed up.
IDs are append-only `META-000001`, displayed `#META-000001`. Never derive them from
row position. Alias namespaces map old atlas IDs, morphology keys and exact
institution/object-number pairs onto permanent IDs. Sorting/reordering cannot change IDs.
Removed records leave aliases reserved; never recycle an ID. Review a collision rather
than merging by title or image. An institution name change requires an explicit alias
migration; otherwise it can create a second identity. Correct a mistaken merge with a
reviewed split and deprecation/cross-reference release; never silently reuse an ID.

The migration reconciles 2,738 legacy rows, 544 full Boerhaave catalog CSV rows and 2,600 morphology rows into 2,738 initial
records; the latter are aliases for objects already represented in the atlas. Eight pilot
imports bring the current collection to 2,746 records. Original curated records remain
separate where accession strings are ambiguous or refer to grouped witnesses. The
coverage JSON identifies candidate duplicate accessions for human review.

`data/releases/v1-<records-sha256-prefix>/` freezes records, image asset registry, JSON
schema, identifier aliases and a manifest of input/output hashes. `records_sha256` is
computed from canonical sorted-key JSONL. The website uses an immutable versioned path
plus a small `data/current.json` pointer. Published ZIPs have fixed timestamps, sorted
members and recorded hashes. Preserve previous releases; do not rewrite them when source
records change. Snapshot figures separately with their methods JSON and source hashes.
Rebuilding the same inputs produces the same records hash and dataset ZIP.

## Data fields and interpretation

| Field | Convention |
|---|---|
| source | Holding institution, object-level accession/catalog ID, URL, actual source retrieval date or null |
| unit | Evidence unit; never assume one record equals one tool |
| name, description | Extracted source wording; historical or questionable terminology retained as evidence |
| reviewed_description | Null until a recorded human review; never silently replace source language |
| categories, materials | Available source/curated wording; original values remain in raw |
| dimensions | Numeric catalog measurements with units and extraction basis, not estimates from photographs |
| dates | Primary catalog interval and its role; null when absent; no year-zero event; alternative claims remain in raw |
| geography | Source context/geography. Some older curated rows contain archaeological or bibliographic context, not a geocodable manufacturing place |
| cultural_attribution | Source attribution, not an inference from shape; no endorsement of historic terminology |
| functions.documented | Source-described use or subject classification; multiple entries allowed |
| functions.interpretations | Analyst-coded tasks and keyword-derived type labels, with basis/source references |
| functions.predictions | Empty in this release; reserve model/version/uncertainty metadata before use |
| images | Stable asset ID, original URL, actual local path, image role, caption, credit, source rights and byte checksum |
| provenance | Field-level method, source path, locator, source URL and retrieval date; source_refs distinguish individual function claims |
| derived | Existing morphology key, dimensionless measurements, source table and QC; future embedding references can be added via a schema minor version |
| raw | Complete pre-migration row/object data, including source alternatives, inscriptions, dates, places, people and raw API records |

Null means unknown; an empty list means no recorded entries, not proven absence. A missing
description is displayed as missing rather than copied from a title. The retained legacy
source snapshot preserves graph edges, study passages and non-item source relationships.

Boerhaave `catalog overall length` is the previous extraction of the largest of height,
width and depth. Its measurement protocol is unknown; retain original dimension wording
and do not interpret it as a newly measured shaft length. Smithsonian knife/sheath
measurements describe an assemblage and remain in its original API row until a reviewed
component-aware measurement mapping is introduced. API date facets mix accession and
collection events and are not used as manufacture dates.

## Images and rights

Image asset IDs hash the immutable origin key; byte checksums detect content revisions.
An asset can appear on several records (reference plates, kit images); shared images do
not prove duplicate objects. Paths refer to generated deployment assets. Unknown source
URLs remain null; no URL or date is fabricated. The existing 2,760 cached atlas images
include source-page scans as well as museum thumbnails, so image count differs from item
count. All are copied as separate files under owner authorization for research display.
The supplied original source rights statements are retained. Display authorization is
separate from redistribution and training eligibility. `training: review_required` is not
an eligible-training manifest. Open metadata and a public webpage do not clear all
cultural, personal, copyright or training restrictions. No new pilot images were fetched.

## Migration and verification

From the project directory:

```bash
python scripts/web/ingest.py               # frozen source cache, no network
python scripts/web/dataset.py              # stable-ID migration + schema validation
MPLCONFIGDIR=/tmp/vestigium-mpl python scripts/web/build_site.py --gate-config gate.local.json
python scripts/web/verify.py               # counts, identities, hashes, paths, provenance, no plaintext credentials
```

Required Python packages are in `requirements-web.txt`. One Met record (31.3.111b) has reversed original BCE bounds -664 to -688. Normalized
browsing uses -688 to -664 with an explicit warning; original values remain in raw,
and dating accuracy is unverified. No row was discarded.

The migration reports missing
fields, candidate duplicates and asset failures; it aborts on schema errors, identity
conflicts or changed permanent aliases. Verification checks every source-row mapping and
every published asset checksum. Input files are not altered. The original offline atlas
and all research scripts remain available alongside this delivery.

Layer-level source retrieval statements (Boerhaave 2026-10-14; other museums 2026-10-21)
are carried into item records, with the original source-layer declaration retained under raw.
The 544 full Boerhaave CSV rows are preserved under raw.boerhaave_catalog, including
created/modified fields, source dimension strings and any unparsed original fields.
