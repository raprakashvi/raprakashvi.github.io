# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Hand-authored single-file static HTML. `index.html` at the repo root is the entire live site: inline `<style>`, inline `<script>`, and a client-side page switcher (`go(page)`) that toggles `.page` sections without routing. Deployed as a static GitHub Pages site from `raprakashvi/raprakashvi.github.io` (master branch).

Confirmed decision: the single-file static approach is the real codebase. The repo also carries a dormant academicpages/Jekyll scaffold (`_layouts/`, `_pages/`, `_sass/`, `_portfolio/`, `_publications/`, `_talks/`, `_teaching/`, `Gemfile`, `package.json`) with **no `_config.yml`** — it does not build and does not serve the live site. Treat it as dead weight slated for deletion, not as design authority. `index-dynamic-papers.html` is an uncommitted-to-nav experimental variant, not the live page.

## Career Status

**Postdoctoral Associate, Mechanical Engineering, Johns Hopkins University, 2026–present, with Axel Krieger.** Ph.D. (MEMS, Duke, 2022–2026) complete. Prior: M.S. MEMS Duke 2021 (Xiaoyue Ni); B.Tech ME NIT Warangal 2019 (P. Bangaru Babu); Ph.D. advised by Patrick Codd and Boyuan Chen.

Source of truth for all career and publication facts: `papers/Prakash_Ravi_CV.pdf` (updated 4 Aug 2026).

**The live site has not caught up.** As of this writing `index.html` still presents Ravi as a final-year PhD candidate at Duke in four places (meta description, `.sb-aff`, hero paragraph, About bio), still shows the `.sb-status` chip "Open to faculty & postdoc positions," and still lists three `ravi.prakash@duke.edu` addresses. Every one of those is stale, not a design decision.

**The postdoc is a waypoint, not a destination.** Ravi is actively on the **faculty job market**; research positions in industry are a secondary path. Availability signaling stays a first-class, permanently visible element of the site — the sidebar status chip is not to be quietly retired now that the JHU role is confirmed. What changes is only its wording: it currently reads "Open to faculty & postdoc positions," and "postdoc" no longer applies.

Open: exact graduation month, JHU start month, whether contact stays at Duke or moves to a JHU address, and the exact replacement wording for the status chip.

## Users

The site serves an **active faculty job search**. When audiences conflict, the faculty search committee wins — every time, without splitting the difference.

**Primary: faculty search committees.** Department chairs and hiring committee members evaluating Ravi for tenure-track robotics positions. They arrive with a name from an application packet, skim for evidence of an *independent* research program, and leave within a minute or two unless something holds them. They are comparing many candidates in one sitting, often on a phone or a laptop between meetings.

What convinces them, roughly in the order they look for it:

- a research thesis statable in one line, and visibly Ravi's own rather than an advisor's;
- first-author papers at top venues, with the venue names legible at a glance;
- evidence the program has a future — open directions, not just completed work;
- funding, fellowships, and named awards;
- teaching and mentorship with real outcomes (a committee reads this as future PhD advising);
- service that shows standing in the field: reviewing, workshops organized, invited talks.

**Secondary audiences**, served without ever displacing the above:

- **Research collaborators and PIs** — peers deciding whether to cite, collaborate, co-organize, or invite a talk. Papers, venues, code, video.
- **Industry research hiring managers** — a real fallback path, weighting working systems, patents, and translation. Serve them by making the systems evidence excellent; do not restructure the site around them.
- **Press and prospective mentees** — occasional. The Media and Teaching pages already serve them.

**Design consequence:** the scholarly record is the spine — thesis, venues, awards, teaching, service. The systems record (working hardware, video, runnable code, patents) is the *proof* that spine hangs on, not a parallel track competing for the first viewport. Availability must stay legible without hunting, and the whole committee-facing case must survive being read on a phone.

## Product Purpose

A personal academic site that presents Ravi Prakash's research program as a coherent, evaluable body of work carried across institutions, in support of an active faculty job search. Success is a visitor who arrives from a CV, a paper, or a conference and leaves able to state what Ravi's research thesis is, what systems he has actually built, and where the evidence lives — then contacts him or advances his candidacy.

The move from Duke to JHU raises the stake on continuity: the site must read as one research program with a thesis, not as a résumé of two labs' outputs. To a search committee, mobility across three advisors and two institutions is either evidence of an independent agenda or evidence of drift — the site decides which.

## Positioning

The through-line, framed on the CV as **"Sensing for Informed Action"** and on the site as "systems that see, decide, and act": full-stack closed-loop robotic platforms where the same person owns the hardware, the multimodal sensing, and the algorithms. Not a perception paper author, not an actuation lab — the integration of OCT + fluorescence + cutting lasers into working autonomous surgical systems with submillimeter accuracy in real tissue.

The scope is broader than surgical: multimodal perception and closed-loop autonomy for **medical, surgical, and aerial** robotic systems, spanning acoustics, imaging, optomechanics, embedded platforms, and learning-based models. The aeroacoustic drone work is not a side project — it is the same thesis applied to a second embodiment, and it is evidence that the mechanism generalizes.

Secondary distinguishing dimensions: healthcare access for under-resourced communities (rural NC clinics, India diagnostics deployment) and a documented mentorship record with publication-level outcomes.

## Operating Context

- Visitors overwhelmingly arrive via an external reference: a CV PDF link, a paper's author line, Google Scholar, a conference program, or LinkedIn. Direct navigation is rare. Deep entry into a specific paper matters more than a funnel.
- The academic evaluation ritual is scan-first: name → affiliation → advisors → venue list → one artifact that proves capability. Committees compare many candidates in one sitting.
- The site is maintained by Ravi directly, by hand, between research deadlines. Edits are single-file HTML changes committed straight to master. Any structure future work introduces has to survive being updated at 1am the night before a deadline.
- Content updates cluster around conference cycles (ICRA, IROS, ISMR, RoboSoft, BSN) and the fall/winter faculty application season.

## Capabilities and Constraints

**Sections (client-side pages in `index.html`):** Home (hero statement, bento grid of active projects, featured YouTube video, reverse-chronological News by year), Research, Publications, Teaching & Mentorship, Portfolio, Media (videos + conference photos), About (bio, education, reviewing service, awards).

**Persistent chrome:** fixed left sidebar (240px) with name, affiliation, profile photo, nav, availability status, social links; collapses to a top bar + full-screen mobile menu under the responsive breakpoints.

**Technical constraints:**
- No build step, no server, no framework. Everything must work as a static file opened over plain HTTP.
- Google Fonts (Fraunces, Outfit, IBM Plex Mono) are the only external stylesheet dependency; YouTube iframes and locally hosted MP4s carry the video content.
- Several images are referenced by absolute `https://raprakashvi.github.io/...` URLs while others are relative — inconsistent, and the absolute ones break local preview.
- No client-side routing or deep links: every section is `index.html`, so a visitor cannot be sent to a specific paper or the Publications list by URL. This is a known limitation of the current implementation, not a decision to preserve.

**Undecided / open:**
- Whether to delete the dormant Jekyll scaffold outright or leave it in place.
- Whether the site needs real per-section URLs.

## Brand Commitments

- Name presented as "Ravi**.** Prakash" with the period accented in the sidebar mark; "Ravi**.**" alone in the mobile top bar.
- Voice: first person, plain, specific, evidence-led. States what a system does and to what precision. No hype adjectives, no "revolutionary," no exclamation points.
- Affiliations and advisors always credited and linked: Axel Krieger (JHU, current); Patrick Codd, M.D. and Boyuan Chen, Ph.D. (PhD, Duke, Brain Tool Lab); Xiaoyue Ni (M.S., Duke); P. Bangaru Babu (B.Tech, NIT Warangal). Moving institutions does not retire the Duke credit.
- The sidebar status chip is live copy tied to Ravi's actual availability. It must stay accurate — its current text is stale (see Career Status) and its replacement wording is an open decision.

## Evidence on Hand

Real, verifiable, and already on the site:

- **Papers with PDFs, arXiv links, project sites, and code repos** — TumorMap (under review, arXiv 2511.05723, project site, GitHub), See Plan Cut (ICRA 2026, arXiv 2511.17777, video, code), PalpAid (RoboSoft 2026, video, code), Portable Dual Sensor (ISMR 2025, IEEE), SurgXBench (WACV 2026), plus published work in *Scientific Reports*, *JMIR Aging*, IROS 2023, and IEEE T-MRB.
- **Video** — a produced overview film (YouTube RGvBzVAV4XQ) plus per-paper demo videos; local MP4s in `images/media/`.
- **Awards, dated and named** — STAUBLI Medical Robotics Rising Star (ISMR 2026), Rhodes Graduate Fellowship, Bass Connections Student Research Award, Duke India Initiative travel award, Maclin Community Connections Grant, Dean's Research Award, Woo Center Fellowship, Design Health Fellow, S.N. Bose Fellowship.
- **Service** — reviewer for IEEE TRO, T-MECH, RA-L, CoRL, IROS, ISMR, BSN, RoboSoft, JMRR; co-organizer of the ICRA 2025 surgical robotics workshop; Lab Manager, Brain Tool Lab; Instructor of Record for a Bass Connections course.
- **Mentorship outcomes** — 15+ students with results at ICRA, RoboSoft, and BSN, and placements at Google, Microsoft, and Medtronic.
- **Assets** — `papers/` (PDFs), `images/publications/` (thumbnails), `images/media/`, `images/events/`, profile photo.

**Absences future work must not paper over:** no citation counts, h-index, impact metrics, testimonials, endorsements, or letters are on the site. Do not fabricate them. The hero previously carried a stats row (16+ publications / 2 patents / 15+ mentees) that is currently commented out — treat it as available but deliberately unused, not as a fact to reintroduce unasked.

**Not yet on the site, confirmed by CV** — future work should expect these to land: two journal papers under review (Liu, Prakash, Lo, Roede, Chen — *Embodied Passive Aeroacoustic Perception*; Prakash, McNabb, Codd, Lin — *OCTN: Neural OCT Tissue Representations*); two preprints/workshop papers; **three patents** (OCTN 63/045,412 provisional; Acoustically Guided Surgery 63/988,766 provisional; Device for Treating Orthostatic Syncope US 18/618,762); **two organized workshops** (ELSR @ IROS 2026, ELSR @ ICRA 2025); **three invited talks** (JHU Mar 2026, IIT Patna Feb 2024, Duke Family Medicine Grand Rounds Sep 2021). Patents, workshops, and invited talks have no section on the site at all — that is a structural gap, and it is exactly the material that reads as an independent program to a search committee.

**Known content bug (not a design decision):** the hero CV button links `papers/CV_Prakash.pdf`, which has been deleted; the only CV on disk is `papers/Prakash_Ravi_CV.pdf`. That is the sole reference to the old filename anywhere in the repo, and the button 404s on the live site.

**Asset weight:** the repo is 56 MB packed. `papers/` alone is 124 MB on disk with individual PDFs at 32 MB (SurgXBench), 30 MB (TumorMap), and 20 MB (ISMR 2025); `images/media/Day_In_Life.mov` (20 MB) is tracked in git but never referenced — only the `.mp4` is. Any restructuring should treat PDF compression and the orphaned `.mov` as real wins, not housekeeping.

## Product Principles

1. **Facts are load-bearing and verbatim.** Venue names, dates, award titles, coauthor credit, and paper status ("Under Review" vs. accepted) are factual claims to an audience that will check them. Never paraphrase, upgrade, round, or invent them. When copy must change, ask.
2. **Credit is non-negotiable.** Named students (Zach Chen, Alexa Cahilig, Olivia Liu, Yongjun), advisors, collaborators, and lab affiliations keep their names, roles, and links wherever they appear. Mentorship attribution is part of the record, not decoration to be trimmed for layout.
3. **Preserve the authoring workflow.** `RESEARCH-README.md` documents how a paper gets added: PDF into `papers/`, thumbnail into `images/publications/`, link buttons in a fixed order (Website → PDF → arXiv → Code) using the existing `.blink` / `.pls` classes. Any change must keep that flow — and `RESEARCH-README.md` — accurate.
4. **Evidence over assertion.** Every claim on the site should be one click from its proof: a PDF, an arXiv page, a repo, a video, a project site. Prefer showing the artifact to describing it.
5. **Survivable by hand.** A single person maintains this file between deadlines. Structure, naming, and any new pattern must be obvious enough to extend at speed without a build step or a framework.

## Accessibility & Inclusion

No formal standard was established for this project. Two product-specific needs are real: the audience includes senior academics reading on varied hardware, and navigation currently runs through `<button onclick>` handlers with no focus management or landmark structure — keyboard and screen-reader access is a known weak point worth fixing rather than a constraint already met.
