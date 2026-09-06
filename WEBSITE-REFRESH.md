# September 2026 website refresh

## Content sources

Primary career source: `papers/CV_Prakash.pdf`, updated September 5, 2026. This supersedes the August TODO's filename, contact, patent number, and missing-work notes.

- JHU appointment begins August 2026; JHU email is in the current CV. The owner requested the title Postdoctoral Fellow, which supersedes the CV’s Associate wording on the website.
- Added invited Springer Nature chapter, OCTN, SonicFly, two workshop/preprint records, four invited talks, three patent applications, sponsored research roles, and current mentees.
- ASU is listed as an invited talk without date or virtual/upcoming wording, per the owner’s preference; the chapter remains invited; three manuscripts remain under review.
- Grants distinguish project amounts and Ravi's role from the faculty PI.
- SonicFly public sources: https://arxiv.org/abs/2608.00401 and https://generalroboticslab.com/SonicFly. Project assets confirm overview video GVpQvWdgkU4, short demonstration w1OSSJBS8dM (now featured), and the code repository.
- Advisor profile links checked against JHU and Duke institutional pages.

## Design and engineering

Research thesis and faculty availability lead the homepage. Added selected-work visuals, recognition/teaching/service links, a workshop callout, and selectable videos. Improved small-screen paper links, contrast, focus visibility, headings, semantic navigation, browser history, deep links, reduced-motion support, and print/no-JavaScript fallbacks. Added canonical/social metadata, Person JSON-LD, robots.txt, and sitemap.xml. The site remains static and dependency-free at runtime.

Hash sections are shareable but are not separate indexable pages; the sitemap deliberately lists the canonical homepage only. Search ranking or indexing cannot be guaranteed by local tests.

## Deliberately pending

- OCTN has no verified public manuscript or figure; its bibliographic record is included without invented links or imagery.
- No new ISMR event photographs were supplied.
- The workshop URL is supplied by the user's notes/CV context; Google’s page could not be parsed by the research tool; a subsequent HTTP check returned 200.
- Legacy Jekyll files and the unused MOV remain on disk; removing them is unnecessary for this refresh and could remove material the owner wants to keep. They are not loaded by the live page.
- Exact Ph.D. conferral month is unspecified; the site uses 2026.

## Validation

See `scripts/check_site.py` for repeatable, dependency-free local integrity checks. Browser validation covers shared URLs, browser history, publication filtering, keyboard/mobile navigation, video switching, responsive overflow, image loading, print, reduced motion, and no-JavaScript access. Accessibility is checked with axe-core in desktop and phone layouts.

Final checks: dependency-free integrity check passed; Chromium covered all seven sections at 1440, 1024, 768, 390, and 320 pixels. Fourteen axe-core 4.10.3 WCAG A/AA audits (desktop and phone) reported zero violations after contrast and link styling fixes. Navigation/history, direct paper links, category filters, video selection, mobile menu/Escape, print, reduced motion, and JavaScript-disabled content passed. Third-party media requests were blocked during deterministic UI testing; these tests do not certify YouTube playback or external service uptime.

Repeat browser checks with Playwright installed and a local server running: `AXE_PATH=/path/to/axe.min.js python scripts/browser_check.py`. Optional `CHROME_PATH` selects a Chrome executable; `SITE_TEST_OUTPUT` selects a screenshot/report directory. The default browser path targets macOS Google Chrome.

## Owner review refinements

Restored the original complete “see, decide, and act” headline with “Sensing for Informed Action” as its label and the owner's revised JHU/Duke bio. Restored Google Scholar, LinkedIn, CV, and JHU email buttons; retained all five sidebar contact/profile links. Availability now reads “On Job Market for Faculty and Research Scientist Positions.” Added the JHU student invitation for learning, imaging, and mechatronics work.

Removed the extra homepage callout strip. Featured video now sits directly before the research projects. Silent video previews rotate every six seconds while visible, pause on hover/focus or playback, and have an explicit pause/resume control. Reduced-motion users start with rotation paused. Research figures use larger image areas and open at full size.
