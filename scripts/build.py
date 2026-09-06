#!/usr/bin/env python3
"""Build the static site: one shell + seven content fragments -> seven real URLs.

    python3 scripts/build.py

Stdlib only, no dependencies. Edit content in src/pages/*.html, styling in
src/site.css, behaviour in src/site.js, then rerun. Never edit the generated
index.html files by hand -- the next build overwrites them.
"""
import hashlib, json, re, shutil, datetime
from urllib.parse import unquote
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
ORIGIN = "https://raprakashvi.github.io"
BUILT = datetime.date.today().isoformat()

NAME = "Ravi Prakash"
ROLE = "Postdoctoral Fellow, Johns Hopkins University"

# slug, nav label, <title>, meta description, h1, og image
PAGES = [
    ("", "Home", "Ravi Prakash — Robotics, Multimodal Sensing & Surgical Autonomy",
     "Ravi Prakash builds robots that turn multimodal sensing into precise autonomous action — "
     "surgical, medical and aerial systems. Postdoctoral Fellow at Johns Hopkins University, "
     "on the job market for faculty and research scientist positions.",
     "Robots that see, decide, and act", "og-home.jpg"),
    ("about", "About", "About — Background, Awards, Grants & Invited Talks | Ravi Prakash",
     "Ravi Prakash's background, education, awards, sponsored research, patent applications and "
     "invited talks. Ph.D. in Mechanical Engineering from Duke University, now at Johns Hopkins.",
     "About", "og-about.jpg"),
    ("research", "Research", "Research — Multimodal Sensing for Autonomous Robotic Systems | Ravi Prakash",
     "Full-stack robotic platforms integrating hardware, multimodal sensing and control: autonomous "
     "laser surgery, OCT and fluorescence tissue sensing, tactile palpation, and passive aeroacoustic "
     "perception for aerial robots.",
     "Research", "og-research.jpg"),
    ("publications", "Publications", "Publications — Robotics & Surgical Autonomy Papers | Ravi Prakash",
     "Peer-reviewed papers, manuscripts under review and invited contributions by Ravi Prakash, "
     "including ICRA, IROS, WACV, RoboSoft, ISMR, IEEE T-MRB, Scientific Reports and JMIR Aging.",
     "Publications", "og-publications.jpg"),
    ("teaching", "Teaching", "Teaching & Mentorship — Student Research Outcomes | Ravi Prakash",
     "Mentorship across high school, undergraduate and graduate research, with student results at "
     "ICRA, RoboSoft and IEEE-EMBS BSN and placements at Google, Microsoft, Medtronic and Ethicon.",
     "Teaching & mentorship", "og-teaching.jpg"),
    ("media", "Media", "Media & Press Coverage | Ravi Prakash, Robotics Researcher",
     "Research videos and press coverage of Ravi Prakash's work, including IEEE Spectrum Video Friday, "
     "India Today, DroneXL, Circuit Digest and Duke Bass Connections features.",
     "Media & press", "og-media.jpg"),
    ("portfolio", "Portfolio", "Portfolio — Leadership & Community Innovation | Ravi Prakash",
     "Beyond the lab: leadership, community innovation and institution-building work by Ravi Prakash.",
     "Portfolio", "og-portfolio.jpg"),
]

KEYWORDS = ("robotics researcher, surgical robotics, medical robotics, multimodal sensing, "
            "surgical autonomy, robotic laser surgery, optical coherence tomography, "
            "aeroacoustic perception, aerial robots, Johns Hopkins, Duke University, Ravi Prakash")

PERSON = {
    "@type": "Person",
    "@id": f"{ORIGIN}/#ravi-prakash",
    "name": NAME,
    "givenName": "Ravi",
    "familyName": "Prakash",
    "url": f"{ORIGIN}/",
    "image": f"{ORIGIN}/images/profile%20pic_small-min.png",
    "jobTitle": "Postdoctoral Fellow",
    "description": ("Robotics researcher working on multimodal sensing and closed-loop autonomy for "
                    "surgical, medical and aerial robotic systems."),
    "worksFor": {"@type": "CollegeOrUniversity", "name": "Johns Hopkins University",
                 "url": "https://www.jhu.edu/"},
    "alumniOf": [
        {"@type": "CollegeOrUniversity", "name": "Duke University", "url": "https://duke.edu/"},
        {"@type": "CollegeOrUniversity", "name": "National Institute of Technology Warangal"},
    ],
    "email": "mailto:ravi.prakash@jhu.edu",
    "knowsAbout": ["Robotics", "Surgical robotics", "Multimodal perception", "Surgical autonomy",
                   "Acoustic sensing", "Optical coherence tomography", "Model predictive control",
                   "Medical imaging", "Aerial robotics"],
    "sameAs": ["https://orcid.org/0000-0002-4020-1590",
               "https://scholar.google.com/citations?user=BX_yW-kAAAAJ",
               "https://github.com/raprakashvi",
               "https://www.linkedin.com/in/raprakashvi/"],
}


IMG_SIZE_CACHE = {}


def image_size(ref):
    """Intrinsic pixel size of a local image, for layout stability."""
    path = ROOT / unquote(ref.lstrip("/").split("?")[0])
    key = str(path)
    if key in IMG_SIZE_CACHE:
        return IMG_SIZE_CACHE[key]
    size = None
    try:
        data = path.read_bytes()
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            size = (int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big"))
        elif data[:2] == b"\xff\xd8":
            i = 2
            while i < len(data) - 9:
                if data[i] != 0xFF:
                    i += 1
                    continue
                marker, length = data[i + 1], int.from_bytes(data[i + 2:i + 4], "big")
                if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB):
                    size = (int.from_bytes(data[i + 7:i + 9], "big"),
                            int.from_bytes(data[i + 5:i + 7], "big"))
                    break
                i += 2 + length
    except (OSError, IndexError, ValueError):
        size = None
    IMG_SIZE_CACHE[key] = size
    return size


def stamp_images(markup):
    """Give every local <img> explicit width/height so nothing reflows on load."""
    def fix(match):
        tag = match.group(0)
        if "width=" in tag and "height=" in tag:
            return tag
        src = re.search(r'src="([^"]+)"', tag)
        if not src or src.group(1).startswith("http"):
            return tag
        size = image_size(src.group(1))
        if not size:
            return tag
        body = tag[:-1].rstrip()
        if body.endswith("/"):                      # self-closing form
            body = body[:-1].rstrip()
        return body + ' width="{0}" height="{1}">'.format(size[0], size[1])
    return re.sub(r"<img\b[^>]*>", fix, markup)


def absolutise(markup):
    """Sub-directory pages need root-absolute asset paths."""
    return re.sub(r'(src|href)="(images|papers|assets|files)/', r'\1="/\2/', markup)


def strip_comments(markup):
    """Authoring notes and template snippets are not shipped."""
    return re.sub(r"<!--.*?-->", "", markup, flags=re.S)


def strip(markup):
    """Plain text from a fragment of authored markup."""
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", markup or "")).strip()


def authors_list(markup):
    text = strip(markup).replace("*", "")
    out, buf = [], ""
    for part in text.split(","):
        buf = (buf + "," + part) if buf else part
        # an author is "Surname, X." — join a name with its following initials
        if re.search(r"[A-Z]\.\s*$|^\s*et al\.?$", part.strip()) or "." in part:
            name = buf.strip().rstrip(",")
            if name and not name.lower().startswith("et al"):
                out.append(name)
            buf = ""
    return out or [NAME]


def render_publications(records):
    """The publication list and its ScholarlyArticle graph, from one source."""
    kinds = [("all", "All"), ("journal", "Journal"), ("conference", "Conference"),
             ("review", "Under review"), ("chapter", "Chapter"), ("preprint", "Preprint")]
    present = {r["type"] for r in records}
    kinds = [(k, label) for k, label in kinds if k == "all" or k in present]
    filters = "".join(
        '<button type="button" data-filter="{k}" aria-pressed="{p}">{label}</button>'.format(
            k=k, p="true" if k == "all" else "false", label=label)
        for k, label in kinds)

    rows, graph = [], []
    seen_year = None
    for rec in records:
        year = rec.get("year") or 0
        if year != seen_year:
            seen_year = year
            rows.append('<p class="yearmark"><span>{0}</span></p>'.format(year or "Earlier"))
        venue = re.sub(r"<span>(.*?)</span>", r'<span class="tag">\1</span>', rec["venue"])
        thumb = ""
        if rec["thumb"]:
            thumb = ('<div class="rec-thumb"><img src="{src}" alt="" loading="lazy" '
                     'decoding="async" width="300" height="200"></div>').format(src=rec["thumb"])
        parts = []
        for l in rec["links"]:
            external = not l["href"].startswith(("#", "papers/", "images/"))
            attrs = ' rel="noopener" target="_blank"' if external else ""
            parts.append('<a href="{h}"{a}>{t}</a>'.format(h=l["href"], a=attrs, t=l["label"]))
        links = '<div class="links">{0}</div>'.format("".join(parts)) if parts else ""
        rows.append(
            '<article class="rec" id="{id}" data-kind="{kind}">'
            '<div class="rec-when">{thumb}</div>'
            '<div class="rec-what"><h3 class="h3">{title}</h3>'
            '<p class="rec-authors">{authors}</p>'
            '<p class="spec">{venue}</p>{links}</div></article>'.format(
                id=rec["id"], kind=rec["type"], thumb=thumb, title=rec["title"],
                authors=rec["authors"], venue=venue, links=links))

        node = {"@type": "ScholarlyArticle",
                "@id": "{0}/publications/#{1}".format(ORIGIN, rec["id"]),
                "headline": strip(rec["title"]),
                "name": strip(rec["title"]),
                "author": [{"@type": "Person", "name": a} for a in authors_list(rec["authors"])],
                "publication": strip(rec["venue"]),
                "isPartOf": {"@id": "{0}/publications/#page".format(ORIGIN)},
                "url": "{0}/publications/#{1}".format(ORIGIN, rec["id"])}
        year = re.search(r"\b(20\d{2})\b", strip(rec["venue"]))
        if year:
            node["datePublished"] = year.group(1)
        for l in rec["links"]:
            if l["label"] in ("PDF", "Paper", "arXiv", "Website"):
                href = l["href"] if l["href"].startswith("http") else "{0}/{1}".format(ORIGIN, l["href"])
                node.setdefault("sameAs", []).append(href)
        graph.append(node)

    html_out = ('<div class="mod s12"><div class="filters" role="group" '
                'aria-label="Filter publications by type">{f}</div></div>'
                '<div class="mod s12 flush" id="publist">{r}</div>').format(
                    f=filters, r="".join(rows))
    return html_out, graph


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


ASSET_V = {"css": digest(SRC / "site.css"), "js": digest(SRC / "site.js")}

CONTRACT = """<!--
  THESIS: A research record assembled from a visible kit of docking modules, not
  composed as a document. Refuses the academic-portfolio arrangement of headshot,
  bio and a list beneath a serif headline.
  OWN-WORLD: Warm bone ground, graphite structure ink, one electric signal colour
  reserved for anything live. Every element docks to a visible hairline lattice:
  square corners, 1px rules, mono runs for measured facts. Archivo across two
  widths; Martian Mono for data only.
  STORY: A search committee reads the thesis at full scale in one viewport, the
  built systems as modules with their evidence attached, and availability as a lit
  state chip; they leave able to state the research program, one click from proof.
  FIRST VIEWPORT: identity module top-left, thesis spanning the lattice at display
  scale, a research figure docked beside it, counted record and a signal-filled
  contact module along the closing rule.
  FORM: modular kit-of-parts; brief-pinned by the owner after two re-rolls,
  superseding seed 4255b777.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the
  finish review, the verdict, and DESIGN.md
-->"""

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Archivo:wdth,wght@62..125,400..700&"
         "family=Martian+Mono:wght@400..700&display=swap")


def nav(active):
    rail, drawer = [], []
    for slug, label, *_ in PAGES:
        href = "/" if slug == "" else "/{0}/".format(slug)
        cur = ' aria-current="page"' if slug == active else ""
        rail.append('<a href="{h}"{c}>{l}</a>'.format(h=href, c=cur, l=label))
        drawer.append('<a href="{h}"{c}>{l}</a>'.format(h=href, c=cur, l=label))
    return "".join(rail), "".join(drawer)


def jsonld(slug, title, desc, url, og):
    page_type = "ProfilePage" if slug == "" else "CollectionPage" if slug in ("publications", "media") else "WebPage"
    graph = [{
        "@type": "WebSite",
        "@id": "{0}/#website".format(ORIGIN),
        "url": "{0}/".format(ORIGIN),
        "name": "{0} — Robotics Researcher".format(NAME),
        "inLanguage": "en",
        "publisher": {"@id": "{0}/#ravi-prakash".format(ORIGIN)},
    }, {
        "@type": page_type,
        "@id": "{0}#page".format(url),
        "url": url,
        "name": title,
        "description": desc,
        "isPartOf": {"@id": "{0}/#website".format(ORIGIN)},
        "about": {"@id": "{0}/#ravi-prakash".format(ORIGIN)},
        "inLanguage": "en",
        "primaryImageOfPage": {"@type": "ImageObject", "url": "{0}/assets/og/{1}".format(ORIGIN, og)},
    }]
    if slug == "":
        graph[1]["mainEntity"] = {"@id": "{0}/#ravi-prakash".format(ORIGIN)}
        graph.append(PERSON)
    else:
        graph.append(PERSON)
        graph.append({
            "@type": "BreadcrumbList",
            "@id": "{0}#breadcrumb".format(url),
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": "{0}/".format(ORIGIN)},
                {"@type": "ListItem", "position": 2, "name": title.split(" — ")[0], "item": url},
            ],
        })
    return graph


def shell(slug, title, desc, h1, og, content, extra_graph=None):
    url = "{0}/".format(ORIGIN) if slug == "" else "{0}/{1}/".format(ORIGIN, slug)
    rail_nav, drawer_nav = nav(slug)
    graph = jsonld(slug, title, desc, url, og)
    if extra_graph:
        graph.extend(extra_graph)
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph},
                    ensure_ascii=False, separators=(",", ":"))

    crumb = ('<a href="/">Home</a> / <span aria-current="page">{0}</span>'.format(h1)
             if slug else '<span aria-current="page">Home</span>')

    foot_links = "".join(
        '<li><a href="{h}">{l}</a></li>'.format(h="/" if s == "" else "/{0}/".format(s), l=lb)
        for s, lb, *_ in PAGES)

    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="keywords" content="{kw}">
<meta name="author" content="{name}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
<meta name="theme-color" content="#efece5">
<link rel="canonical" href="{url}">
<meta property="og:type" content="{ogtype}">
<meta property="og:site_name" content="{name} — Robotics Researcher">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="en_US">
<meta property="og:image" content="{origin}/assets/og/{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{name} — {role}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{origin}/assets/og/{og}">
<meta name="twitter:image:alt" content="{name} — {role}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="{fonts}">
<link rel="stylesheet" href="/assets/site.css?v={cssv}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/images/profile%20pic_small-min.png">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<script type="application/ld+json">{ld}</script>
</head>
<body>
{contract}
<a class="skip" href="#main">Skip to content</a>
<nav class="rail" aria-label="Primary">
  <a class="rail-mark" href="/"><b>RAVI PRAKASH</b></a>
  <div class="rail-nav">{rail_nav}</div>
  <span class="rail-dot" aria-hidden="true"></span>
</nav>
<div class="bar">
  <a class="bar-mark" href="/">RAVI PRAKASH</a>
  <button class="bar-toggle" type="button" aria-expanded="false" aria-controls="drawer">Menu</button>
</div>
<nav class="drawer" id="drawer" aria-label="Primary">{drawer_nav}</nav>
<div class="shell">
  <p class="crumb">{crumb}</p>
  <main id="main" class="wrap" tabindex="-1">
{content}
  </main>
  <footer class="foot">
    <div class="foot-grid">
      <div>
        <h2>{name}</h2>
        <p class="spec">{role}</p>
      </div>
      <div>
        <h2>Pages</h2>
        <ul>{foot_links}</ul>
      </div>
      <div>
        <h2>Elsewhere</h2>
        <ul>
          <li><a href="https://scholar.google.com/citations?user=BX_yW-kAAAAJ" rel="noopener me" target="_blank">Google Scholar</a></li>
          <li><a href="https://orcid.org/0000-0002-4020-1590" rel="noopener me" target="_blank">ORCID</a></li>
          <li><a href="https://github.com/raprakashvi" rel="noopener me" target="_blank">GitHub</a></li>
          <li><a href="https://www.linkedin.com/in/raprakashvi/" rel="noopener me" target="_blank">LinkedIn</a></li>
        </ul>
      </div>
      <div>
        <h2>Contact</h2>
        <ul>
          <li><a href="mailto:ravi.prakash@jhu.edu">ravi.prakash@jhu.edu</a></li>
          <li><a href="/papers/CV_Prakash.pdf">Curriculum vitae (PDF)</a></li>
        </ul>
      </div>
    </div>
    <p class="foot-legal"><span>© {year} {name}</span><span>Built {built}</span></p>
  </footer>
</div>
<script src="/assets/site.js?v={jsv}" defer></script>
</body>
</html>
""".format(title=title, desc=desc, kw=KEYWORDS, name=NAME, role=ROLE, url=url,
           ogtype="profile" if slug == "" else "article", origin=ORIGIN, og=og,
           fonts=FONTS, ld=ld, contract=CONTRACT, rail_nav=rail_nav,
           drawer_nav=drawer_nav, crumb=crumb, content=stamp_images(absolutise(strip_comments(content))),
           foot_links=foot_links, year=BUILT[:4], built=BUILT,
           cssv=ASSET_V["css"], jsv=ASSET_V["js"])


def sitemap(urls):
    rows = "".join(
        "\n  <url><loc>{0}</loc><lastmod>{1}</lastmod>"
        "<changefreq>{2}</changefreq><priority>{3}</priority></url>".format(u, BUILT, cf, pr)
        for u, cf, pr in urls)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{0}\n</urlset>\n'.format(rows))


ROBOTS = """User-agent: *
Allow: /

# Generated pages only; sources and dormant scaffolding are not content.
Disallow: /src/
Disallow: /_site/
Disallow: /_pages/
Disallow: /_publications/
Disallow: /_portfolio/
Disallow: /_teaching/
Disallow: /_talks/
Disallow: /vendor/
Disallow: /index-dynamic-papers.html

Sitemap: {origin}/sitemap.xml
""".format(origin=ORIGIN)


def main():
    records = json.loads((SRC / "publications.json").read_text(encoding="utf-8"))
    pub_html, pub_graph = render_publications(records)

    urls = []
    for slug, label, title, desc, h1, og in PAGES:
        fragment = (SRC / "pages" / "{0}.html".format(slug or "home")).read_text(encoding="utf-8")
        extra = None
        if slug == "publications":
            fragment = fragment.replace("<!--PUBLICATIONS-->", pub_html)
            extra = [{
                "@type": "ItemList",
                "@id": "{0}/publications/#list".format(ORIGIN),
                "name": "Publications by {0}".format(NAME),
                "numberOfItems": len(records),
                "itemListElement": [
                    {"@type": "ListItem", "position": i + 1, "url": n["url"], "name": n["name"]}
                    for i, n in enumerate(pub_graph)],
            }] + pub_graph
        page = shell(slug, title, desc, h1, og, fragment, extra)
        out = ROOT / "index.html" if slug == "" else ROOT / slug / "index.html"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(page, encoding="utf-8")
        priority = "1.0" if slug == "" else "0.9" if slug in ("research", "publications") else "0.7"
        freq = "weekly" if slug in ("", "publications") else "monthly"
        urls.append(("{0}/".format(ORIGIN) if slug == "" else "{0}/{1}/".format(ORIGIN, slug),
                     freq, priority))
        print("  {0:24} {1:>7,} bytes".format(str(out.relative_to(ROOT)), len(page)))

    notfound = shell("", "Page not found | Ravi Prakash",
                     "The requested page does not exist on Ravi Prakash's research site. "
                     "Jump to the index, research, or the publication list.",
                     "Not found", "og-home.jpg",
                     (SRC / "pages" / "404.html").read_text(encoding="utf-8"))
    notfound = notfound.replace('<link rel="canonical"', '<meta name="robots" content="noindex">\n<link rel="canonical"')
    (ROOT / "404.html").write_text(notfound, encoding="utf-8")
    print("  404.html")

    (ROOT / "assets").mkdir(exist_ok=True)
    shutil.copy(SRC / "site.css", ROOT / "assets" / "site.css")
    shutil.copy(SRC / "site.js", ROOT / "assets" / "site.js")
    (ROOT / "sitemap.xml").write_text(sitemap(urls), encoding="utf-8")
    (ROOT / "robots.txt").write_text(ROBOTS, encoding="utf-8")
    print("  sitemap.xml              {0} urls".format(len(urls)))
    print("  robots.txt, assets/site.css, assets/site.js")


if __name__ == "__main__":
    main()
