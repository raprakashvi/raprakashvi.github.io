# Research & Publications — Quick Reference

## Folders

| Folder | Purpose |
|--------|---------|
| `images/publications/` | Thumbnail images for each paper (jpg, png, gif) |
| `papers/` | Local PDF files to link from publications |

## Adding a New Paper

### 1. Add thumbnail (optional)
Place image in `images/publications/paper-name.jpg`, then in `index.html`:
```html
<img src="images/publications/paper-name.jpg" alt="Paper Title">
```

### 2. Add PDF (optional)
Place PDF in `papers/paper-name.pdf`, then link:
```html
<a href="papers/paper-name.pdf" class="pls" target="_blank">PDF</a>
```

### 3. Button order
Use this order, omit what you don't have:
1. **Website** — project page
2. **PDF** — local (`papers/`) or external (arXiv, journal)
3. **arXiv** — abstract page
4. **Code** — GitHub, etc.

### 4. Where to edit
- **Research page** (bento cards): `.blink` buttons in `.blinks`
- **Publications page**: `.pls` buttons in `.plc`

## September 2026 refresh

- The live site is `index.html`; legacy Jekyll folders and `index-dynamic-papers.html` are dormant.
- Current CV: `papers/CV_Prakash.pdf` (September 5, 2026). Keep this stable URL when replacing the PDF.
- Sections use shareable hash links (`#research`, `#publications`). Individual publication IDs also open the publications section and clear filters.
- Publication categories: `journal`, `conference`, `review`, `preprint`, `chapter`. Preserve explicit review/invitation status; never imply acceptance.
- Video selectors use `data-video` YouTube IDs. Iframes use `data-src`, with the active section loaded by the router.
- Keep `Person` JSON-LD, description, social metadata, contact email, and visible appointment text aligned.
- Run `python3 scripts/check_site.py` for local links, assets, anchors, and metadata integrity.
- Preview with `python3 -m http.server 8765 --bind 127.0.0.1`.
- Research image sources: SonicFly thumbnail from the General Robotics Lab project assets; See_Plan_Cut.jpg rendered from Figure 1 of the local paper. Other thumbnails are existing author-provided assets.
- Featured videos now use a local thumbnail poster before loading YouTube. Short SonicFly demo: `w1OSSJBS8dM`; overview: `GVpQvWdgkU4`. Keep the video title, thumbnail, `data-video`, and `data-src` aligned when changing the default.
- Full browser/accessibility regression suite: `AXE_PATH=/path/to/axe.min.js python scripts/browser_check.py` (requires Playwright and Chrome, with the preview server running).
