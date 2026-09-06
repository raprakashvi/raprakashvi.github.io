"""Browser regression and accessibility checks for the local static site.
Requires Playwright, Chrome, and axe-core. Set AXE_PATH to the downloaded axe.min.js.
Serve the site at http://127.0.0.1:8765. Optional: CHROME_PATH, SITE_TEST_OUTPUT.
Third-party requests except fonts are blocked for deterministic local testing.
"""
from playwright.sync_api import sync_playwright, expect
from pathlib import Path
import os, tempfile
OUTPUT=Path(os.environ.get("SITE_TEST_OUTPUT", tempfile.mkdtemp(prefix="website-tests-")))
OUTPUT.mkdir(parents=True, exist_ok=True)
AXE=os.environ.get("AXE_PATH", "/private/tmp/axe.min.js")
import json
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROME_PATH','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),headless=True)
 page=browser.new_page(viewport={'width':1440,'height':1000},device_scale_factor=1)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 # Deterministic local UI checks: third-party availability is audited separately.
 page.route('**/*',lambda route:route.continue_() if route.request.url.startswith('http://127.0.0.1:8765') or 'fonts.go' in route.request.url else route.abort())
 page.goto('http://127.0.0.1:8765/#publications',wait_until='domcontentloaded')
 page.wait_for_function('document.fonts.status === "loaded"')
 assert page.locator('#page-publications').is_visible()
 assert page.locator('.pi').count()==19
 page.get_by_role('button',name='Under review',exact=True).click()
 assert page.locator('.pi:visible').count()==3
 page.get_by_role('button',name='Book chapters',exact=True).click()
 assert page.locator('.pi:visible').count()==1
 page.locator('.sb-nav a[href="#research"]').click()
 page.locator('.sb-nav a[href="#about"]').click()
 page.go_back();assert page.locator('#page-research').is_visible()
 page.go_back();assert page.locator('#page-publications').is_visible()
 page.goto('http://127.0.0.1:8765/#publication-octn',wait_until='domcontentloaded')
 assert page.locator('#publication-octn').is_visible()
 page.goto('http://127.0.0.1:8765/#unknown',wait_until='domcontentloaded');assert page.locator('#page-home').is_visible()
 assert page.locator('#page-home .video-poster').is_visible()
 page.locator('#page-home .video-poster').click()
 assert 'w1OSSJBS8dM' in page.locator('#page-home iframe').get_attribute('src')
 assert page.locator('#page-home .feat-video').evaluate('(el)=>el.compareDocumentPosition(document.querySelector("#page-home .bento")) & Node.DOCUMENT_POSITION_FOLLOWING')
 page.locator('#page-home [data-video="RGvBzVAV4XQ"]').click()
 assert 'RGvBzVAV4XQ' in page.locator('#page-home iframe').get_attribute('src')
 assert 'Olivia Liu' in page.locator('#page-home .feat-video-caption').inner_text()
 page.reload(wait_until='domcontentloaded')
 audits=[]
 for width in [1440,1024,768,390,320]:
  page.set_viewport_size({'width':width,'height':900})
  for section in ['home','about','research','publications','teaching','portfolio','media']:
   page.evaluate('(s)=>go(s)',section);page.wait_for_timeout(650)
   assert page.locator('#page-'+section).is_visible()
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'),f'Overflow {width} {section}'
   page.locator('.page.active img').evaluate_all('(imgs)=>imgs.forEach(x=>x.loading="eager")')
   broken=page.locator('.page.active img').evaluate_all('async(imgs)=>{await Promise.all(imgs.map(x=>x.decode().catch(()=>{})));return imgs.filter(x=>!x.naturalWidth).map(x=>x.src)}')
   assert not broken,broken
   if width in [1440,390]:
    page.add_script_tag(path=AXE)
    result=page.evaluate('async()=>await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})')
    audits.append({'width':width,'section':section,'violations':[{'id':v['id'],'nodes':[n['target'] for n in v['nodes']]} for v in result['violations']]})
   if width in [1440,390] and section in ['home','publications','about']:page.evaluate('document.activeElement.blur()');page.screenshot(path=str(OUTPUT/f'website-{section}-{width}.png'),full_page=True)
 (OUTPUT/'website-a11y.json').write_text(json.dumps(audits,indent=2))
 page.set_viewport_size({'width':390,'height':844})
 page.locator('.tn-btn').click();assert page.locator('#mob').is_visible()
 page.keyboard.press('Escape');assert not page.locator('#mob').is_visible()
 assert page.locator('.tn-btn').get_attribute('aria-expanded')=='false'
 page.locator('.tn-btn').click();page.locator('#mob a[href="#publications"]').click()
 expect(page.locator('#mob')).not_to_be_visible()
 assert page.locator('#page-publications .pls:visible').count()>0
 page.emulate_media(reduced_motion='reduce');page.evaluate('go("home")')
 assert page.locator('.hero-statement').evaluate('(el)=>getComputedStyle(el).opacity')=='1'
 page.emulate_media(media='print');assert page.locator('.page:visible').count()==7
 context=browser.new_context(java_script_enabled=False,viewport={'width':390,'height':844})
 nojs=context.new_page();nojs.goto('http://127.0.0.1:8765/',wait_until='domcontentloaded')
 assert nojs.locator('.page:visible').count()==7
 assert nojs.locator('#page-publications .pls:visible').count()>0
 assert not errors,errors
 (OUTPUT/'website-a11y.json').write_text(json.dumps(audits,indent=2))
 print(json.dumps([x for x in audits if x['violations']],indent=2))
 assert not any(x['violations'] for x in audits), 'Accessibility violations remain'
 print('PASS: 14 axe-core audits, zero WCAG A/AA violations.')
 print('PASS: deep links, history, filters, video switching, mobile menu, 35 responsive layouts, print, reduced motion, no-JS content, no JS errors.')
 browser.close()
