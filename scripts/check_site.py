"""Static-site integrity checks. Run with Python 3 (no dependencies)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
class Site(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[]; self.references=[]; self.errors=[]; self.schema=False; self.json=''; self.schemas=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs:self.ids.append(attrs['id'])
        if tag=='img' and 'alt' not in attrs:self.errors.append('Image missing alt')
        if tag=='iframe' and not attrs.get('title'):self.errors.append('Iframe missing title')
        if tag=='script' and attrs.get('type')=='application/ld+json':self.schema=True;self.json=''
        for key in ('href','src','data-src'):
            if attrs.get(key):self.references.append(attrs[key])
    def handle_data(self, data):
        if self.schema:self.json+=data
    def handle_endtag(self, tag):
        if tag=='script' and self.schema:self.schemas.append(json.loads(self.json));self.schema=False
site=Site(); site.feed((ROOT/'index.html').read_text())
assert len(site.ids)==len(set(site.ids)), 'Duplicate element IDs'
for url in site.references:
    parsed=urlsplit(url)
    if parsed.scheme or parsed.netloc:continue
    if parsed.path:assert (ROOT/unquote(parsed.path)).is_file(),f'Missing local asset: {url}'
    if parsed.fragment:assert parsed.fragment in site.ids or 'page-'+parsed.fragment in site.ids,f'Missing anchor: {url}'
assert not site.errors,site.errors
assert any(s.get('@type')=='Person' for s in site.schemas)
assert ET.parse(ROOT/'sitemap.xml').find('.//{*}loc').text=='https://raprakashvi.github.io/'
assert 'Sitemap: https://raprakashvi.github.io/sitemap.xml' in (ROOT/'robots.txt').read_text()
print(f'PASS: {len(site.ids)} unique IDs, {len(site.references)} references, local assets, anchors, image/iframe labels, Person schema and sitemap.')
