# External reference corpus (surgical instruments)

As built 2026-10-22 (`external-build-1.0.0`, classes `external-classes-1.0.0`,
sources `external-sources-1.0.0`). This corpus is **separate from the frozen
Vestigium release**: it never edits `data/releases/`, and it is not part of the
website. Its purpose is to test whether embedding relationships learned on the
internal collection (mostly Museum Boerhaave thumbnails) transfer to other
photography, other cataloguing language and contemporary instruments, and to
link old tools to modern instrument classes.

## Counts (from `data/external/summary.json`)

* **4,590 images** kept (wikimedia_commons 3,370, wellcome_collection 1,220); **2,686 candidates excluded**, each with a reason in
  `exclusions.json` (not_instrument_focus 1,271, work_type_not_harvested 1,080, licence_not_permitted 238, svg_diagram 40, non_image_media 37, multi_canvas_manifest 15, too_small 4, exact_duplicate 1).
* Era: historical 2,514, unknown 1,899, contemporary 177. Image kind: photograph 2,224, unknown 1,293, drawing 652, catalog plate 396, diagram 25.
* Instrument-class labels (multi-label; 372 images carry more than one): unknown 1,906, forceps 761, other 420, scalpel_knife 323, catheter_tube 216, speculum 213, needle_syringe 183, lancet 165, trephine_drill 140, saw 130, hemostat_clamp 123, scissors 106, hook 91, probe_sound 76, spatula_elevator 56, needle_holder 54, cautery 50, retractor 43, curette_scraper 37.
* Licences: CC BY 4.0 1,101, Attribution 4.0 International (CC BY 4.0) 849, CC BY-SA 4.0 574, Public domain 485, No known copyright restrictions 447, CC BY-SA 3.0 376, Public Domain Mark 371, CC0 222, CC BY 3.0 46, CC BY 2.0 42, CC BY-SA 2.0 17, CC BY 2.5 10, CC BY 3.0 de 10, CC BY-SA 3.0 at 9, CC BY-SA 2.0 uk 7, CC BY-SA 2.5 7, CC BY-SA 3.0 de 5, CC BY-SA 2.0 fr 5, CC BY-SA 3.0 fr 4, CC BY-SA 1.0 2, CC BY 3.0 br 1.
* Near-duplicate groups: 613 groups containing 1,706 images; 3,497 independent units
  (singletons have `dup_group: null`).

## Sources and access

| Source | Interface | Scope harvested | Status |
|---|---|---|---|
| Wikimedia Commons | MediaWiki API (`categorymembers`, `imageinfo` + `extmetadata` + `commonmetadata`) | Category trees listed below, with explicit deny list | Used |
| Wellcome Collection | Catalogue API v2 `/works` (+ IIIF Presentation v2 manifests for single-image archive works; IIIF Image API for pixels) | 26 queries listed below, `availabilities=online` | Used |
| Smithsonian Open Access | `api.si.edu` with `DEMO_KEY`; S3 bulk metadata | — | **Not used.** DEMO_KEY responses reported `x-ratelimit-limit: 10` and search rows for `unit_code:NMAH AND "surgical instrument" AND online_media_type:Images` (766 hits) carried no `online_media`. A bulk NMAH shard (1 of 256, ~10 MB each) had media on ~1% of records. Needs a personal api.data.gov key; then extend this pipeline with a `smithsonian_harvest.py`. |
| Science Museum Group | `collection.sciencemuseumgroup.org.uk` JSON | — | **Not used.** `robots.txt` disallows `/api/` and every URL with a query string (`Disallow: /*?*`); SMG image licence is generally CC BY-NC-SA, which is outside the permitted licence set. |

All requests use the User-Agent
`VestigiumResearchCorpus/1.0 (academic surgical-instrument reference corpus; contact …) python-requests`,
at most one request per second per host, three attempts with backoff for network/5xx
errors, and a host stop after 401/403/429 (429 on images is retried after `Retry-After`
up to twice first). Every request outcome (success, cache hit is silent, client error,
server error, network error, host stop) is appended to `data/external/access_log.jsonl`.

### Wikimedia Commons queries

Roots and maximum depth (`configs/external/sources.json → commons.roots`):
`Category:Surgical instruments` (3), `Category:Historical surgical instruments` (3),
`Category:Catheters` (2), `Category:Trephines` (1), `Category:Bone saws` (1),
`Category:Lancets` (1), `Category:Surgical needles` (2), `Category:Surgical staplers` (1),
`Category:Paquelin's thermocautery` (1). Requested categories that do not exist on
Commons (checked 2026-10-22): `Hemostats` (empty), `Retractors` (use `Surgical retractors`),
`Specula` (subcats only; reached via `Speculums`), `Laparoscopic instruments`,
`Surgical probes`, `Probes (medical)`, `Suture needles`.

Commons category trees drift into unrelated material. Branches **not descended** are
listed with reasons in `commons.deny_categories` / `deny_category_patterns` (e.g.
`Tweezers` — 417+ ancient toilet tweezers; `Human branding`/BDSM reached via
cauterization; imaging (`X-rays of`, `CT images`), procedure categories
(`…catheterization`), implanted devices, containers (gallipots, bleeding bowls),
Kom Ombo reliefs, a milkfish-deboning category). Every category seen, its depth,
parents, file count and status (`crawled` / `denied` / `depth_limit`) is in
`data/external/raw/commons_category_tree.json`.

### Wellcome Collection queries

`configs/external/sources.json → wellcome.queries`: subject `Surgical Instruments`,
subject `Instruments`, genre `Museum object`, and free-text queries (forceps, scalpel,
surgical knife, amputation instruments, lancet, fleam, scarificator, trephine, trepan,
speculum, catheter, retractor, surgical scissors, amputation saw, curette, cautery,
needle holder, bistoury, tenaculum, surgical probe, syringe, surgical instruments,
surgical set), each with a page cap. Per-query totals/pages/returned counts are in
`data/external/raw/wellcome_query_stats.json`. Relevance-ranked free-text queries were
capped because later pages were dominated by irrelevant works (e.g. `lancet` → *The Lancet*
journal; `syringe` → vaccination ephemera).

Image resolution per work: a `iiif-image` location is used directly; otherwise a
single-image `iiif-presentation` manifest (≤4 canvases) is resolved to its image
service. Books/e-books/AV works and manifests with more than four canvases are not
split into images (recorded as harvest exclusions).

## Screening rules (in order; first failing rule is recorded)

1. `metadata_error` – Commons returned no imageinfo.
2. `non_image_media` – PDF, DjVu, Ogg, WebM, WAV.
3. `svg_diagram` – SVG not labelled as a drawing/engraving/line art.
4. `licence_not_permitted` – Commons: only `pd`, `cc0`, `cc-by-*`, `cc-by-sa-*`
   licence templates (GFDL-only, GPL, FAL, WTFPL, "Copyrighted free use",
   generic "Attribution" are excluded). Flickr Commons *"No known copyright
   restrictions"* (Internet Archive Book Images) is accepted **only** when the Commons
   date field (the scanned book's publication year) is before 1931 — public domain in
   the US by publication date; this inference is written to `license_basis`.
   Wellcome: only `pdm`, `cc-0`, `cc-by` (excluded: `inc` in copyright, `cc-by-nc`).
5. `not_instrument_focus` –
   * Commons: file title/categories match an explicit deny pattern (radiographs,
     CT/MRI/ultrasound, logos/icons, heraldry, stamps, paintings, caricatures,
     sculptures, patient/clinical photographs, orthopaedic implants and fixation
     hardware such as plates, screws, nails, K-wires, external fixators).
   * Wellcome: the title (catalogue prefixes such as `M0008197:` removed) must name
     an instrument (any class pattern) or say *instrument(s)/surgical set/kit/case*; scene
     depictions (surgeon/patient/figures/operation) are excluded unless the title
     also says *instruments/apparatus/forceps/plate*; deny patterns remove text pages,
     pamphlets, reliefs/statuettes/tapestries, ethnographic knives, and non-medical
     scientific instruments. Subject/genre tags alone are not enough.
6. `overlaps_internal_release` – same Wellcome IIIF image or work, same Met object ID or
   accession (when the text names the Met), or same Commons file as a record in
   `data/releases/v1-804c1e7c3202`.
7. `too_small` – original shorter side < 96 px.
8. `download_failed` / `image_decode_failed`.
9. `exact_duplicate` – identical Commons original SHA-1, identical downloaded bytes
   (SHA-256) or identical stored file (SHA-256); the first `ext_id` in sorted order is kept
   and the kept ID is named in the exclusion detail.

Every dropped candidate is listed in `data/external/exclusions.json` with stage,
reason, detail, title, source page and the query/category that found it.

## Files

| Path | Content |
|---|---|
| `scripts/external/common.py` | cached/rate-limited fetcher + access log, HTML stripping, date-range parser, class mapper |
| `scripts/external/commons_harvest.py` | Commons category crawl and metadata |
| `scripts/external/wellcome_harvest.py` | Wellcome works/manifests |
| `scripts/external/build_corpus.py` | screening, download, resize, hashing, labels, dedupe, reports |
| `scripts/external/test_external.py` | offline unit checks |
| `configs/external/sources.json` | roots, queries, deny lists, licence rules, era / image-kind markers |
| `configs/external/instrument_classes.json` | versioned class vocabulary and patterns |
| `data/external/raw/*` | harvested candidates, category tree, query stats, download index |
| `data/external/manifest.jsonl` | one row per retained image |
| `data/external/exclusions.json` | every dropped candidate + reason |
| `data/external/summary.json` | counts |
| `data/external/access_log.jsonl` | every network request outcome |
| `data/external/images/` | `<sha256>.jpg|png`, longest side ≤ 640 px (**git-ignored**) |
| `data/external/cache/` | raw API responses keyed by sha256(url) (**git-ignored**, regenerable) |

### Manifest fields

`ext_id` (`COMMONS-<pageid>` or `WELLCOME-<workId>-<iiifImageId>`), `source`,
`source_page_url`, `image_url` (the exact URL downloaded: a Commons standard-width
thumbnail or the original if smaller; Wellcome IIIF `full/!640,640`), `image_url_basis`,
`original_url`, `original_sha1` (Commons), `original_width/height`, `download_sha256`
(bytes as downloaded), `local_path`, `sha256` (stored file), `width`, `height`, `dhash`
(64-bit difference hash), `title`, `description` (source wording, HTML stripped; Wellcome
lettering appended after `| Lettering:`), `source_categories` (Commons categories or
Wellcome subjects + genres, verbatim), `date_text` + `date_text_role`,
`object_year_start/end` + `object_date_basis`, `place`, `license`, `license_code`,
`license_url`, `license_basis`, `attribution_required`, `restrictions`, `artist`, `credit`,
`attribution` (ready-to-display line), `retrieved_at`, `found_by` (query or category),
`image_kind` + basis, `era` + `era_basis`, `instrument_class` (list) +
`instrument_class_basis`, `class_mapping_version`, `dup_group` + `dup_basis`.
Wellcome rows add `work_id`, `work_type`, `reference_number`, `physical_description`,
`n_images_in_work`.

## Labels and how far to trust them

* **instrument_class** is a weak label from verbatim wording only: Commons category
  names (both the crawl category and the file's own categories) and titles; Wellcome
  subjects and titles. Descriptions are never used. Each hit is recorded as
  `field: 'matched words' in "text" -> class`. Several labels may apply; `unknown` when
  nothing matches; `other` when the source names an instrument outside the vocabulary
  (trocar, tourniquet, osteotome, scarificator, lithotrite, endoscopes…). Plates and sets
  showing many instruments receive whatever the title names; they are not segmented.
* **era**: `historical` if an object date (title/category; for Wellcome prints the work's
  production date, i.e. the depiction date) ends before 1950, if a photograph or scanned
  publication is itself dated before 1950, or if an explicit historical marker is present
  (Ancient/Roman/Greek/Egyptian/medieval/Islamic Golden Age, Commons historical category,
  "Wellcome Collection", a pre-1950 year in a catalogue category name). `contemporary`
  only if an object date starts ≥1950 or an explicit modern marker is present (disposable,
  laparoscopic/robotic, modern manufacturer names, plastic construction, the Netha
  Hussain teaching-set photographs of instruments in current clinical use). A Commons
  photograph taken after 1950 is **not** evidence of a modern instrument. Conflicting
  markers → `unknown`. The rule that fired is in `era_basis`.
* **image_kind**: from title/category/genre words (catalogue/plate → `catalog plate`;
  diagram/clip art/SVG → `diagram`; engraving/lithograph/drawing/illustration →
  `drawing`; photograph/museum object → `photograph`), then camera EXIF Make/Model, then
  the Wellcome L/M photographic reference prefix; otherwise `unknown`.
* **dup_group** joins (union-find) images with the same normalised title within a source,
  the same Wellcome image reference (Commons re-uploads named "Wellcome L00…", across
  sources), or dHash Hamming distance ≤ 4. Groups mean "probably the same object or the
  same picture"; split train/test by `dup_group`, not by image.

## Known biases and quality problems

* **Contemporary instruments are scarce**: only 177 images are confidently `contemporary`
  (mostly one teaching-set photographer on Commons). Modern-analog results therefore describe
  a small, single-photographer reference set and are reported at family level only.
* **Historical images dominate and are mixed media**: drawings (652) and catalogue plates (396)
  depict many instruments at once; `unknown` image kind (1,293) is common for Commons scans.
* **Class labels are sparse**: 1,906 images have no recognised class; label words come from
  titles and categories, so generic titles ("Surgical instruments") give no class.
* **Photographer and uploader concentration**: a few Commons contributors and Wellcome's
  L/M photographic series account for large shares (see `top_artists`), so photography style
  is clustered within sources, which is the same confound measured internally.
* **Clinical photographs**: screening removes most, but some images of instruments in use on
  patients remain (e.g. titles describing a clamp applied to an injury). The website shows
  external analogs as title, class and link only, never inline pixels.
* **Era rule is conservative**: a post-1950 photograph of an old object stays `historical`
  or `unknown`; 1,899 images have `unknown` era.

## Website display guidance

* **Wikimedia Commons, CC BY / CC BY-SA / CC0 / PD**: may be displayed with attribution.
  Prefer hotlinking the Commons thumbnail (`image_url`) and linking `source_page_url`.
  Show `attribution` (author, licence short name, "via Wikimedia Commons") with a link to
  `license_url`. CC BY-SA images re-hosted from our resized copies must carry the same
  licence notice; do not place them behind terms that restrict reuse. Check
  `restrictions` (e.g. personality rights, trademark) before display.
* **Commons "No known copyright restrictions" (pre-1931 book scans)**: display is
  defensible as public domain by publication date, but this is our inference (see
  `license_basis`), not a licence statement from the uploader. Prefer link-out plus a
  small hotlinked thumbnail with "Internet Archive Book Images via Wikimedia Commons".
* **Wellcome Collection, PDM / CC0**: free to display; credit "Wellcome Collection" as a
  courtesy and link `source_page_url`. Hotlinking IIIF (`image_url`) is permitted and
  avoids re-hosting.
* **Wellcome Collection, CC BY 4.0**: display with "<title>. Wellcome Collection. CC BY 4.0"
  linking `source_page_url` and the licence.
* Items excluded for licence (`inc`, `cc-by-nc`, GFDL-only, etc.) are **link-only**: show
  the title and `source_page_url`, never the pixels.
* Do not present weak `instrument_class` / `era` labels as curatorial facts on the site;
  label them "automatic, from source wording".
* Commons clinical photographs that slipped through screening must not be displayed;
  report them so they can be added to `file_deny_patterns`.

## Rerun

From `roman_tool_lineage/` (the venv provides `requests` and Pillow; `-I` = isolated
mode because downloaded content is untrusted and is only decoded by Pillow):

```bash
PY=/home/rp/.venvs/vestigium-ml/bin/python
$PY -I scripts/external/test_external.py
$PY -I scripts/external/commons_harvest.py      # add --offline to replay the API cache only
$PY -I scripts/external/wellcome_harvest.py     # add --offline to replay the API cache only
$PY -I scripts/external/build_corpus.py --dry-run /tmp/decisions.jsonl   # screening only
$PY -I scripts/external/build_corpus.py --prune-orphans                  # download + build
```

Harvesters replay `data/external/cache/` when present, so reruns are deterministic and
offline-capable; delete the cache (or the relevant `cache/<source>/api` folder) to
refresh from the live APIs. `build_corpus.py` is resumable: `raw/download_index.jsonl`
records every downloaded/decoded image (bytes SHA-256, stored SHA-256, sizes, dHash);
already-downloaded images are not refetched, transient failures are retried on the next
run, and `--offline` builds from the index alone. Rows are written in sorted `ext_id`
order. Changing `configs/external/*.json` only requires rerunning `build_corpus.py`.
