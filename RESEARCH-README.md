# Research & Publications — Quick Reference

## How the site is built (read this first)

The site is **generated**. Seven real URLs are produced from one shell plus per-page
content fragments:

```
src/pages/*.html      page content (home, research, publications, about, teaching, media, portfolio, 404)
src/publications.json every paper — drives the list, the filters AND the Schema.org records
src/site.css          the whole design system
src/site.js           behaviour
scripts/build.py      python3 scripts/build.py   ← run after every edit
scripts/check_site.py python3 scripts/check_site.py  ← must print "0 checks failed"
```

**Never hand-edit `index.html` or `*/index.html`** — the next build overwrites them.
Edit the file in `src/`, run the build, run the check.

Preview locally: `python3 -m http.server 8765 --bind 127.0.0.1` then open
<http://127.0.0.1:8765/>.

## Adding a new paper

Add one object to `src/publications.json`, then rebuild. That single record produces
the row on `/publications/`, its filter category, its deep link, and its
`ScholarlyArticle` structured data.

```json
{
 "id": "publication-short-slug",
 "type": "conference",
 "thumb": "images/publications/paper-name.jpg",
 "title": "Full Paper Title",
 "authors": "<strong>Prakash, R.</strong>, Coauthor, A.",
 "venue": "<span>ICRA 2027</span> *equal contribution",
 "links": [{"label": "PDF", "href": "papers/paper-name.pdf"}]
}
```

- `id` — keep it stable; it is the permanent deep link (`/publications/#id`).
- `type` — one of `journal`, `conference`, `review`, `chapter`, `preprint`.
  Preserve explicit review/invitation status; **never imply acceptance.**
- `thumb` — optional. Put the image in `images/publications/`. Use `null` if none.
- `venue` — text inside `<span>` renders as the status tag.
- `links` — in this order, omitting what you don't have:
  **Website → PDF → arXiv → Code** (or `Paper` for a publisher page).
  Paths are made root-absolute at build time; write them relative to the repo root.

Add the PDF to `papers/` and the thumbnail to `images/publications/`.

## Adding news, research systems, or press

Edit the relevant fragment in `src/pages/` using the module grammar:
`<div class="mod s6">…</div>` inside `<div class="grid">`. Spans are `s2`–`s12`
against a 12-column lattice; they collapse automatically on small screens.
`.slab` turns a module into the graphite panel. `.state` is the live availability chip.

## What the checker enforces

`scripts/check_site.py` fails the build if any of these regress:

- a broken internal link, image, or PDF reference
- a missing or duplicated `<title>` / meta description, or one outside its length band
- a missing canonical, Open Graph, or Twitter card tag
- JSON-LD that does not parse, or a page missing its `Person` / `BreadcrumbList` node
- an `<img>` without `alt`
- a sitemap that does not match the built pages
- a publication in `publications.json` that never made it onto the page

Image `width`/`height` are stamped automatically at build time from the real files,
so nothing reflows while loading.

## SEO notes

- Each page owns its URL, `<title>`, description, canonical, OG/Twitter card and
  1200×630 social image (`assets/og/`).
- All 19 publications emit `ScholarlyArticle` records inside an `ItemList`.
- Old hash links (`#research`, `#publication-…`) redirect to the new URLs in
  `src/site.js` — keep that map in step if a page is ever renamed.
- `papers/CV_Prakash.pdf` is a stable URL. Keep the filename when replacing the PDF.
