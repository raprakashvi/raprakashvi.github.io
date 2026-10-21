# Bounded access recovery and next morphology step

Follow-up on 2026-10-21. Release v1-5ea6e0e1e84c contains 2,826 records.

## What changed

The earlier crawler treated a robots.txt HTTP 403 as a blanket host denial. This was too
strict: [RFC 9309 section 2.3.1.3](https://www.rfc-editor.org/rfc/rfc9309.html#section-2.3.1.3)
distinguishes an unavailable robots file (4xx) from an actual content access restriction.
The shared fetcher now records that distinction. This is not a bypass of authentication,
anti-bot challenges, or a content 403. Successful robots rules and crawl delays are still
followed. Actual content 401/403 and all 429 responses stop the host. Robots network/5xx
errors and maintenance/HTML responses fail closed. No proxy rotation or disguised user-agent.

The three documented modern Oxford hosts (`www.prm.ox.ac.uk`, `prm.ox.ac.uk`,
`prm.web.ox.ac.uk`) still return a 392-byte maintenance page for collections-online.
Slower requests cannot repair that server condition. The public editorial pages work.

## Bounded slow crawl

`scripts/web/access_recovery.py --refresh --max-pages 5` requested five official editorial
pages plus robots, with at least two seconds between requests and a hard request budget.
Seeds are the two previously used official pages; further pages must be directly linked
and match a narrow tool-technology article allowlist. Search forms and the unavailable
modern database are not crawled. Each response and source checksum is cached.

The numbered-entry extractor screens leading, single accession identifiers. Range entries
are skipped rather than split into invented objects. Non-tool entries and potentially
sensitive text are excluded with reasons. Source transcriptions are preserved; normalized
names/categories are explicitly provisional. Object-specific place words remain source
context; dates, physical measurements and materials are not inferred. Explicit wording
about separating threads in weaving is retained as documented use for those entries.

Result: **45 additional Pitt Rivers records**, bringing that source to **50**. Examples
include needles, awls, weaving combs, spoons, knives, an adze and a hook. These are editorial
accession entries, not live full object records. The latest cached replay screens 93
numbered candidate entries: 47 duplicates already present and 46 exclusions. The other
three previously imported Pitt Rivers mentions remain in the collection. No complete
museum coverage or clinical function is claimed. See `results/tables/access_recovery.json`
for page checksums, decisions, robots outcomes and counts. Replay requires zero network:

```bash
python scripts/web/access_recovery.py --max-pages 5
```

The cache verifies its SHA-256 before reuse. Resume skips existing accession identities.
A failed later run does not delete successful imports. The live modern-catalog blocker
remains; use a documented museum API/export when service returns.

## Other source access

Three official Smithsonian Open Access requests (two seconds apart) queried knife
(start=3, rows=12), scraper (start=0, rows=12), and tweezers (start=0, rows=12) in unit
NMNHANTHRO. The public demo key worked and the response headers still showed a remaining
request budget. **35 additional records** were imported and **one was skipped for cultural
review**, bringing Smithsonian Anthropology to **38 records**. The queries report 13,281,
23,810 and 92 total hits respectively; those hit counts are not screened or imported totals.
No large crawl or full-collection claim. A personal key is useful for sustained work,
rather than a prerequisite for this small verified import. No private key is stored.

This step adds **80 records total**, from 2,746 to **2,826**, with **5,970 reconciled source
row references**. Existing META IDs remain unchanged. All new imports are metadata-only;
image/morphology features are not fabricated. `ingest.py` replays all cached API pages;
latest-run imported/duplicate counts differ from cumulative new-record counts by design.
Existing source objects, components and assemblages remain distinct evidence units.

Te Papa still needs a registration-key and cultural/media review for sustained ingestion;
the Swedish collections remain available through the existing Europeana route. Neither
blocks this bounded update, and no new Te Papa/Swedish import is claimed.

## Then: usable shape comparisons

The newer morphology view now provides **eight nearest outline matches**, either among
all source collections or restricted to other collections. Each match has a permanent
record link, a comparison button and a dimensionless distance. Keyboard users can open
matches from every row of the accessible morphology table; item pages link back to shape
comparisons. The full ranked-edge CSV is exportable.

This reuses the audited 2,600-specimen distance archive. It averages three median-normalized
blocks: width/centerline profile, Fourier magnitudes, and robust-standardized scalar shape
features. The exporter verifies every stored top-eight distance against that numeric
archive and source key order. It reads numeric arrays without unpickling object keys.
Cross-collection results are recomputed within the eligible pool, not filtered from an
already truncated eight. It exports 41,600 ranked edges (two pools x eight x 2,600), method
and source hashes, and the exact dataset version. Ties are deterministic by source row.

Lower distance means closer under this descriptor. It is not a confidence/probability,
physical size, clinical-function prediction or ancestry claim. Material is not part of the
shape distance. The 2D aspect/solidity scatter has different geometry from this multiblock
score. **226 records lack shape features** and remain in the coverage denominator; no
model fitting, substantial training, pretrained download or weight upload was performed.

## Verification

Six focused access-policy/cache regression tests cover robots-unavailable vs content-denied,
explicit disallow, rate-limit stop, cache corruption and paragraph extraction. Dataset
validation checks all records, aliases, source rows, assets and neighbor references. Browser
checks cover the expanded source filter and nearest/cross-collection comparison workflow.
The personal site remains unchanged outside the collection folder. Local browser validation passed 32 checks with zero exceptions or HTTP errors. Live
results are recorded separately after publication.
