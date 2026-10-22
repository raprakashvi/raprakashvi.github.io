# Vestigium search exclusions

The collection uses public GitHub Pages hosting and a browser interface gate.
Search exclusions reduce discovery by compliant search engines; they do not
prevent unauthenticated downloads or access through the public repository.

All collection HTML entry points carry `noindex,nofollow,noarchive,nosnippet,
noimageindex,max-image-preview:none`. Keep these pages crawlable: Google must
retrieve the HTML to discover `noindex`. The root personal-site `robots.txt`
excludes collection data, legacy data, images, figures, docs, reports and Markdown
files from compliant crawling. A specific Googlebot-Image rule excludes the
whole collection from Google image crawling. The main website and its sitemap
remain indexable; the collection is absent from personal navigation and sitemap.

After building a new artifact, apply and check the rules before deploying:

```bash
python scripts/web/search_privacy.py --site /tmp/vestigium-build --apply
python scripts/web/search_privacy.py --site /tmp/vestigium-build
```

The deployment must retain the marked Vestigium block in the website's **root**
`robots.txt`. To apply it idempotently as well:

```bash
python scripts/web/search_privacy.py --site /tmp/vestigium-build \
  --robots /home/rp/rp_repo/raprakashvi.github.io/robots.txt --apply
```

A `robots.txt` inside `/roman-tool-lineage/` has no effect. Do not add a blanket
HTML crawl block alongside `noindex`. GitHub Pages does not offer the required
custom response-header configuration here, so non-HTML files do not receive an
`X-Robots-Tag: noindex` response header. A crawl exclusion can leave a linked URL
listed without content; it does not guarantee that every raw file URL stays out
of search results. Crawlers may ignore voluntary restrictions.

Existing Google results can take time to disappear after a recrawl. If urgent
removal is needed, the owner can request removal of the collection URL prefix
through a verified Google Search Console property. No Search Console request is
claimed as completed by this change. Indexing status has not been independently
certified. Actual privacy requires server or edge authentication covering every
page and asset, with publicly reachable origins and repository copies addressed.

References: [Google noindex guidance](https://developers.google.com/search/docs/crawling-indexing/block-indexing),
[robot meta and response-header rules](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag),
[Google robots.txt specification](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec).

## Published verification

Website commit `44ee007` publishes these restrictions. Seven live checks passed on
2026-10-22 UTC: scoped root rules, data crawl exclusion, HTML crawlability for
noindex, strengthened meta tags in both currently hosted HTML entry points,
collection absence from sitemap and the unchanged indexable personal homepage.
Evidence: `results/tables/search_privacy_verification.json`. The build pipeline now
applies the same meta rules to future artifacts through `search_privacy.html_rules`;
this preserves them when the main-thread interface restoration is deployed.
