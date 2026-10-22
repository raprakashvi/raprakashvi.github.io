# Proposed study protocol, version 0.2

Phase II · 6 October 2026. Read with [RESEARCH_PLAN.md](RESEARCH_PLAN.md) and [CONTRIBUTIONS.md](CONTRIBUTIONS.md). Version 0.1 is preserved in the Phase I archive.

Status: **exploratory pilot executed; not preregistered or a systematic survey**. The 14-reading boundary pilot and one-page complete screen are reported in PILOT_FINDINGS.md. Historical-series sampling, human double coding and inferential models remain to be done. AI benchmarking is required only for a claimed automation benefit, not as the historical contribution. The PNAS ambition motivates rigor but does not determine the result.

## 1. Question and scope

Primary candidate question: do component materials and maintenance arrangements change more readily than task-specific mechanical configurations? Competing hypotheses and possible refutations appear in the atlas. Do not estimate a single “progress” score.

Begin with cutting soft tissue and urinary access/drainage as separate tasks with different mechanism/material constraints. Grasping/clamping is an extension after separating tissue grasping, vessel occlusion, bone cutting and extraction. A common label such as forceps does not make these a single performance class. Cross-tradition needling, cautery and cranial access are scoping comparisons, not additional members of one pooled outcome.

Treat the Roman evidence as a reference panel and a source of questions, not a compulsory root. For an initial quantitative phase, investigate whether defined maker/hospital series for 1750–1950 can support a regional comparison of materials, interfaces and maintenance. Do not claim that this narrower test establishes a two-thousand-year genealogy. Expansion through 2026 requires archived catalogs, standards histories, technical drawings, IFUs and dated introduction/adoption evidence. Live product pages establish availability at observation, not invention.

Choose geography and accessible complete series with a historian and museum collaborator before hypothesis testing. Keep Byzantine and Islamic sources visible in the longue durée reference panel; do not turn a gap in Latin Western European evidence into a global absence. Earlier Greek/Hellenistic and other medical traditions are required comparisons for any claim of Roman origin.

## 2. Sampling and the unit of analysis

Create linked tables for **source → witness → object/design → component → claim**. An object may occur in multiple catalogs and plates; a printed figure may be copied across editions. One object can have several restored components. An accession alone is not a globally unique ID: use institution + accession + part identifier, and retain identifiers from older catalogs as aliases.

For each institution or source series, save its coverage, search interface, languages, date searched, exact query, result count if available, records screened, inclusion/exclusion decisions and inaccessible items. Search named catalogs and bibliographies in addition to the web. An unsuccessful query is “not retrieved under this search,” never evidence of historical absence. Do not invent result counts for earlier conversational searches. Header-only templates in `data/templates/` are for prospective recording.

Include items for their stated scope relevance, not because a photo is attractive or their date fits a hypothesis. Set image acquisition after textual eligibility. Record excluded nonsurgical objects and ambiguous identifications with reasons. Complete source-series extraction is preferable to selecting isolated matches. Preserve taxonomic alternatives where a probe could also be cosmetic or pharmaceutical.

The current record-level shared-source clusters are an audit aid only. They neither fully deduplicate the corpus nor prove independence of records left in separate clusters. The analysis must cluster repeated observations by object, text tradition, archaeological context, maker or institution as appropriate to the question.

## 3. Measurement and attribution

Record original terminology, language, transliteration, translated term, source attribution and analyst category separately. Coding definitions should specify the scope of a character and its comparable states. Use task-specific modules alongside common component/provenance fields.

Each claim needs an exact page/folio/figure or catalog field, a source identifier, supporting passage where rights permit, date accessed, extraction method, coder, uncertainty and review history. Attach confidence to an identified claim—not an opaque overall tool score.

Separate alloy label from analytical results; retain method, sampled component and location, units, detection limits, surface treatment and corrosion condition. Do not determine carbon steel from image color or infer a steel substrate beneath unspecified plating. Record hardness only with method, units and test conditions. For dimensions specify preserved/complete, component, axes, calibration, uncertainty and scale provenance. Morphometry needs controlled views or 3D data; equal thumbnail sizes are not comparable geometry.

Keep composition, manuscript copy, edition, artifact manufacture, deposition, excavation, collection, restoration and digitization dates as different events. A date interval is not automatically a uniform probability distribution. Preserve alternative date claims and their reasons. Missing dates, unobserved parts and inapplicable characters are different states.

Pilot agreement study: two qualified coders independently characterize a stratified subset spanning evidence media, languages, uncertainty and tool families, before resolving disagreements. Report field-level agreement, confusion matrices, missingness and adjudication changes. Select an agreement statistic appropriate to data type and prevalence; do not rely on a single overall coefficient. Freeze revised definitions before held-out evaluation.

## 4. Acquisition transparency and optional AI evaluation

The intended pipeline is **retrieve → archive → locate passage → propose claims → check schema and citations → human adjudication → release**. Current code implements curation, validation and audit/export, not an autonomous or validated retrieval system.

Use a schema-constrained extraction prompt that requires component, historical event type, source span, uncertainty and an abstention option. Cache the model identifier/version when exposed, provider, date, prompt, parameters and raw output. OCR and translation must retain the original image/text locator. If a field cannot be read or its attribution resolved, abstain. Source images should identify which object or figure is being described before image-based claims are attempted.

Split sources by institution/text tradition, not randomly by rows. Near-duplicate plates, translations or records of the same object must not occur in both training/prompt development and evaluation sets. A human team should create the reference set without consulting model answers; adjudicate disagreements and publish the process.

Compare AI-assisted extraction with (a) manual-only extraction and (b) a simple keyword/rule baseline under the same sampling and time accounting. Measure retrieval recall within a bounded known-source collection, precision of eligible records, field-level factual accuracy, correct citations, correct date roles, duplicate detection, uncertainty/abstention behavior, and expert minutes per accepted record. Global web recall is not measurable from the current search.

Report sample sizes and uncertainty for each metric. Use bootstrap or other uncertainty estimation that respects source/object clusters when justified. Stratify errors by language, scan/OCR quality, historical period, source type and material ambiguity. An AI system that increases records while preferentially finding illustrated English catalogs could make historical inference worse even if extraction accuracy is high.

## 5. Analysis sequence

1. Publish coverage and source dependence first. Separate archaeological objects, textual prescriptions, illustrations, patents and commercial offerings. No curve of raw records is an innovation curve.
2. Estimate descriptive trait configurations within the preselected series. A “first observed” state is left-truncated by the archive and search; it is not invention. Missing historical intervals can make a transition interval-censored or entirely unidentified.
3. Compare changes in components, geometry and interfaces using a pre-specified trait dictionary. Treat substitutions, additions, losses, reuse and recombinations as different changes. Report joint observability; missing traits do not match one another by default.
4. Consider a similarity network only after character validation. Compare task/material-only baselines, alternative weights and missingness handling. A visual embedding or cluster cannot establish a transmission route. A phylogeny would require testing the strength and consistency of a tree-like signal and alternatives involving borrowing or convergence.
5. Propagate date uncertainty using source-justified models, or report bounds/scenarios if distributions are unsupported. Do not assign every interval to its midpoint. Do not treat a copy date as the origin of its design.
6. Test generalization by holding out source institutions, regions or families. Sensitivity runs should remove restorations, uncertain provenance, grouped finds, replicas, patents and copied figures in separately reported analyses. Retain exclusion ledgers.
7. Investigate causal events only if a local exposure, comparison group, pre-exposure evidence and stable-enough observation process can be established. Otherwise report associations and limitations. Printing/searchability, recycling/corrosion, collecting preferences and clinical selection remain rival explanations.

No fixed minimum n is prescribed. Simulate the intended model under realistic sampling, date widths, clustering and missingness before committing to a claim. If important alternatives are observationally indistinguishable, revise the question rather than increase apparent precision.

## 6. Interpretation and paper deliverables

Possible general contribution: evidence for differential persistence and recombination of technological components under changing production and care practices. The specific direction and existence of that result remain open.

Required deliverables: public codebook and inclusion protocol; legally shareable source-linked claim data; provenance/alias graph; coverage and missingness figures; independent coding results (and AI benchmark results if an AI-benefit claim is made); clearly defined estimands and comparison baselines; uncertainty and sensitivity analyses; accessible code and release metadata. Restricted source images can remain external links while shareable claim data and locators are released.

The first target is an independently validated pilot and a defensible sampling frame. A Roman-to-modern illustration atlas is useful infrastructure, but it is not itself the proposed general scientific result.

## 7. Cross-tradition and confluence protocol

The scoping register is deliberately separate from the instrument corpus and all statistical denominators. Its ten cases include source leads, textual witnesses, artifacts, a nonsurgical control and procedure traces. No missing object chronology is filled from an author’s lifetime, photograph date or the dates of a named civilization.

For every candidate connection, record source and target witness IDs; region/place and original language; the specific feature being compared; its observed date role; explicit citations or correspondence; evidence for a channel; independent use/manufacture evidence; and alternatives involving copied illustrations, convergent geometry, restoration or later translation choices. Classify the claim as general context, text/image transfer, design transfer, adoption or unresolved similarity. Use separate fields rather than an additive confidence score. A confluence claim additionally needs a defensible account of how features attributed to more than one tradition entered a later configuration.

Start with Al-Zahrawi’s Arabic–Latin tradition. Add MS 36617 supplies translation attribution and a glossary; it does not prove all illustrated tools were made. Collate specific passages and drawings with identified Arabic witnesses before proposing hardware links. Ottoman, South/East Asian and Roman–Fustat connections remain research questions. The Andean procedure comparison cannot establish an exact implement from a cranial opening alone.

Original-language validation is required for any claim depending on Sanskrit, Chinese, Arabic, Greek or Ottoman terminology. AI translation retains the source text and passage locator and remains provisional until specialist review. Scope labels must not erase regional and chronological variation, trade/workshop practices, or colonial collecting histories. Nonmedical blade/probe controls help estimate false surgical identifications.

## 8. Primary contrast and analysis freeze

The candidate primary estimand is the difference between probabilities of an observed material-state change and an observed mechanical-configuration change among eligible, ordered within-series pairs with both dimensions observed. Report the joint change table as well as the contrast. Interfaces are a separate secondary dimension. Define part matching, balanced trait granularity, repeated model versions and observation spacing before extracting the evaluation series. Use identical eligibility denominators for the compared dimensions; report missing/inapplicable pairs rather than treating them as unchanged.

This is not a hazard of invention or adoption. Uncertain ordering requires source-justified bounds/scenarios; convenience midpoint ordering is prohibited. Compare against series-specific task/material baselines and inspect dependence on vocabulary granularity. Do not fit a pooled effect until data support comparability. All choices, exclusions and sensitivity specifications must be frozen after the feasibility pilot and before the held-out historical analysis.

## 9. Reuse and exact-image matching

Images are acquired after textual eligibility. Each has a source, object or figure identifier, evidence role, license statement and file hash. Patent sheets are labeled drawings, never photographs. Thumbnail presence does not establish a recoverable full-size image. Image coloring does not establish an alloy. Record unresolved license wording rather than assigning a blanket dataset license; use source links where reuse or attribution is unresolved. The current offline gallery is not automatically cleared for journal figure reuse under a publisher’s license.

## 9. Exploratory boundary pilot (executed 6 October 2026)

This is an explicitly post-reading extension of the protocol. No hypothesis or inclusion rule in this pilot is presented as preregistered. Fourteen source readings and six qualitative dossiers are curated in `boundary_catalog.py`; source-anchor checks and table exports are implemented in `boundary_analysis.py`. Source images were visually checked by the assistant; independent review remains zero.

The complete screening unit is **one named printed entry on Weiss 1863 p. 19**. Wrapped lines count once; ditto labels inherit their preceding noun; notes and plate illustrations do not create new independent entries. The seven explicit catheter entries are included; accessories, syringes, bougies and retrieval instruments are excluded. One combined pilot item remains borderline because the page and plate key differ in naming. Both the strict total (7) and inclusive total (8) are reported with all 16 screened rows. No sampling error interval is appropriate for this fixed page; uncertainty is in eligibility and interpretation. The page was selected after a keyword search, so its complete screen is not a representative sample of the volume.

Missing feature cells mean **not coded from the selected passage**, not absent from the tool or whole book. Material and finish terms remain component-specific. A material note with ambiguous scope is not propagated to all models. Descriptions across translations of one passage are dependent; their dates cannot be used as successive independent hardware states. Retrieval dates of current products cannot supply introduction dates.

Two categories must be distinguished: (1) an **evidence boundary**, where our sources or categories prevent comparison; (2) a **historical knowledge boundary**, where identifiable actors or settings differ in access to knowledge necessary for making or using a device. The present dossiers establish source contrasts and propose candidate operational requirements. Claiming a historical boundary requires independent evidence of a channel, unequal access, adoption or failure. Silence in a text is insufficient because knowledge may have been supplied tacitly or through another medium.

Candidate explanatory contrasts are vocabulary/measurement, task and component role, making, quality assessment, classification and interface/supply. These emerged during the pilot; confirmatory series must be selected independently and include disconfirming cases. No numeric confidence score is assigned to qualitative interpretations. All dossiers retain alternatives and a concrete next test.

## 10. Agent review extension (7 October 2026)

Three role-separated AI agents reviewed the baseline and challenged one another; the worker implemented selected corrections. This does not satisfy independent human/specialist review. B7 adds one ancillary cross-task syringe reading (15 readings, seven dossiers total), with no change to the bounded catheter-screen denominator. Edge audit statistics measure coding availability only. Filing/publication are distinct events; same-event alternatives are audited separately. The feature dictionary now distinguishes geometry, channels, mechanisms, accessories, edge acceptance, selection context and package integrity. Remaining claim-level span, dependency and matched-task requirements are recorded in the cycle reports.

## 11. Completed bounded catalog screen (7 October 2026)

The new frame is Weiss 1863, Classified List printed pp. 1–45, ending before instrument sets. Frame selection follows source structure after the p. 19 discovery; it is not preregistered or held out. [Frame metadata](data/curated/weiss1863/frame.json) freezes page/OCR/XML hashes. Three agents read disjoint 15-page blocks and checked every page scan; the reviewer reconciled all nominations under an explicit rule. All 45 pages and all 187 nominated passages are scan-checked. This is not dual independent coding.

Primary coverage unit: printed page. Analytic register unit: nominated source passage, retaining repeated assertions. Named-entry count is null; no entry-normalized rate is permitted. Explicit relation includes source comparisons, attributed change/substitution, alternative use, stated coordinated use/support/testing, integrated combinations and fitment. Ordinary variants, accessory co-listings, non-instrument shape analogies and navigation/ambiguity are separate classes. Final counts are 119, 29, 22, 8 and 9 respectively. Cross-task is provisional and concerns named clinical procedure or anatomical application, not necessarily a new physical action.

The six linked repeat groups preserve all occurrences and do not establish complete deduplication. The 630 mechanically matched OCR lines are inspection controls; they are not a validated census of contiguous printed references or negative cases. Endpoint location requires its own page and exact anchor and is independent of source-passage scan status. Three targets are located within the same catalog; others remain unresolved. No physical equivalence follows.

The stage stops at a complete page screen and explicitly recorded endpoint status, not complete target-object resolution. All original role files and the separate hashed-input adjudication layer remain available. A stricter inference about shared components needs plate/object matching, independent human review and a second source series. The [stage report](research_cycles/2026-10-07-stage2/README.md) records deviations, source-selection limits and the next discriminating test.
