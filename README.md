# raprakashvi.github.io

Personal academic site for **Ravi Prakash** — robotics, multimodal sensing and
surgical autonomy. Live at <https://raprakashvi.github.io/>.

Seven static pages, generated from one shell plus per-page content fragments.
No framework, no runtime dependencies, no server.

## Working on it

```bash
python3 scripts/build.py                          # generate the pages
python3 scripts/check_site.py                     # must print "0 checks failed"
python3 -m http.server 8765 --bind 127.0.0.1      # preview at localhost:8765
```

**Never hand-edit `index.html` or `*/index.html`** — they are build output and the
next build overwrites them. Edit the source, rebuild, then check.

## Layout

| Path | What it is |
|---|---|
| `src/pages/*.html` | page content: home, about, research, publications, teaching, media, portfolio, 404 |
| `src/publications.json` | one record per paper — drives the list, the filters, the deep links and the Schema.org data |
| `src/site.css` | the whole design system |
| `src/site.js` | behaviour: nav, filters, video players, legacy hash redirects |
| `scripts/build.py` | the generator |
| `scripts/check_site.py` | integrity and SEO checks |
| `index.html`, `*/index.html` | **generated** — do not edit |
| `assets/` | built CSS and JS, favicon, social images |
| `images/`, `papers/` | figures, photographs, PDFs |

Adding a paper, adding news, and the module grammar are documented in
[RESEARCH-README.md](RESEARCH-README.md).

## Deploying

GitHub Pages serves `master` from the repository root (`.nojekyll` is present, so
the files are served exactly as committed). Push to `master` and the site updates.

Rollback points are tagged:

- `pre-rebuild-2026` — the single-page site as it stood before the September 2026 rebuild
- `rebuild-2026-live` — the first seven-page release

```bash
git reset --hard pre-rebuild-2026 && git push --force-with-lease origin master
```

## Notes

- `googlef70927c106d4d785.html` is the Google Search Console verification file. Keep it.
- `.nojekyll` disables Jekyll processing. Keep it.
- Old `#hash` links redirect to the real URLs in `src/site.js`; keep that map in step
  if a page is ever renamed.
