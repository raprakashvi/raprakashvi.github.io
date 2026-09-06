#!/usr/bin/env python3
"""Dependency-free integrity + SEO checks for the built site.

    python3 scripts/check_site.py
"""
import json, re, sys
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
PAGES = ["index.html"] + ["{0}/index.html".format(s) for s in
         ("research", "publications", "about", "teaching", "media", "portfolio")]
ORIGIN = "https://raprakashvi.github.io"
fail, warn = [], []


def local(path, page):
    """Resolve a root-relative or page-relative reference to a file on disk."""
    ref = unquote(path.split("#")[0].split("?")[0])
    if not ref:
        return None
    target = ROOT / ref.lstrip("/") if ref.startswith("/") else (ROOT / page).parent / ref
    if target.is_dir():
        target = target / "index.html"
    return target


def main():
    titles, descs = {}, {}
    for page in PAGES:
        html = (ROOT / page).read_text(encoding="utf-8")

        # --- assets and internal links resolve ---
        for attr, ref in re.findall(r'(?:src|href)="([^"]+)"', html) and \
                [("ref", r) for r in re.findall(r'(?:src|href)="([^"]+)"', html)]:
            if ref.startswith(("http", "mailto:", "#", "data:")):
                continue
            target = local(ref, page)
            if target and not target.exists():
                fail.append("{0}: missing target {1}".format(page, ref))

        # --- one h1, in order ---
        h1s = re.findall(r"<h1[^>]*>", html)
        if len(h1s) != 1:
            fail.append("{0}: expected exactly one <h1>, found {1}".format(page, len(h1s)))

        # --- title / description / canonical ---
        title = re.search(r"<title>(.*?)</title>", html, re.S)
        desc = re.search(r'<meta name="description" content="([^"]*)"', html)
        canon = re.search(r'<link rel="canonical" href="([^"]*)"', html)
        if not title or not (10 < len(title.group(1)) <= 75):
            fail.append("{0}: title missing or outside 10-75 chars".format(page))
        if not desc or not (70 <= len(desc.group(1)) <= 320):
            fail.append("{0}: description missing or outside 70-320 chars".format(page))
        if not canon:
            fail.append("{0}: no canonical".format(page))
        if title:
            titles.setdefault(title.group(1), []).append(page)
        if desc:
            descs.setdefault(desc.group(1), []).append(page)

        # --- social card completeness ---
        for tag in ('property="og:title"', 'property="og:description"', 'property="og:image"',
                    'property="og:url"', 'name="twitter:card"', 'name="twitter:image"'):
            if tag not in html:
                fail.append("{0}: missing meta {1}".format(page, tag))

        # --- structured data parses and is connected ---
        for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
            try:
                data = json.loads(block)
            except ValueError as exc:
                fail.append("{0}: JSON-LD does not parse ({1})".format(page, exc))
                continue
            nodes = data.get("@graph", [])
            kinds = [n.get("@type") for n in nodes]
            if "Person" not in kinds:
                fail.append("{0}: JSON-LD has no Person node".format(page))
            if page != "index.html" and "BreadcrumbList" not in kinds:
                fail.append("{0}: JSON-LD has no BreadcrumbList".format(page))

        # --- images carry dimensions and alt ---
        for tag in re.findall(r"<img[^>]*>", html):
            if 'alt="' not in tag:
                fail.append("{0}: <img> without alt: {1}".format(page, tag[:70]))
            if "width=" not in tag or "height=" not in tag:
                warn.append("{0}: <img> without width/height (layout shift): {1}".format(page, tag[:70]))

    for text, where in titles.items():
        if len(where) > 1:
            fail.append("duplicate <title> across {0}".format(", ".join(where)))
    for text, where in descs.items():
        if len(where) > 1:
            fail.append("duplicate description across {0}".format(", ".join(where)))

    # --- sitemap covers exactly the built pages ---
    sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
    listed = set(re.findall(r"<loc>(.*?)</loc>", sitemap))
    expected = {"{0}/".format(ORIGIN)} | {
        "{0}/{1}/".format(ORIGIN, s) for s in
        ("research", "publications", "about", "teaching", "media", "portfolio")}
    if listed != expected:
        fail.append("sitemap mismatch: missing {0} | unexpected {1}".format(
            sorted(expected - listed), sorted(listed - expected)))

    robots = (ROOT / "robots.txt").read_text(encoding="utf-8")
    if "Sitemap: {0}/sitemap.xml".format(ORIGIN) not in robots:
        fail.append("robots.txt does not point at the sitemap")

    # --- publication records survived the move ---
    records = json.loads((ROOT / "src" / "publications.json").read_text(encoding="utf-8"))
    pubs = (ROOT / "publications" / "index.html").read_text(encoding="utf-8")
    for rec in records:
        if 'id="{0}"'.format(rec["id"]) not in pubs:
            fail.append("publication missing from page: {0}".format(rec["id"]))
    print("publications rendered: {0}".format(len(records)))

    for line in warn:
        print("WARN  {0}".format(line))
    for line in fail:
        print("FAIL  {0}".format(line))
    print("\n{0} checks failed, {1} warnings".format(len(fail), len(warn)))
    return 1 if fail else 0


if __name__ == "__main__":
    sys.exit(main())
