# The tags for catalogue records (T-034, replacing the T-032 domain rule)

The unified site has one collection with **two overlapping tags** in the header: **Medicine** and
**Science and technology**. A record of the three complete museum catalogues (T-025: NEMO,
Rijksmuseum Boerhaave, Teylers Museum; 50,063 records) may carry neither, one or both; there is no
third "not placed" state and no fourth chip. The code that implements it is
`scripts/web/unified/catalogue.py` (functions `tags` and `media_kind`) and the build that applies it
is `scripts/web/unified/build.py`. The counts below come from
`results/tables/catalogue_site.json`, written by every build.

## Why the change

The lead (2026-11-16) said a strong surgical/science sort is not needed: the objects are what they
are, and a record may belong to both. The T-032 three-way rule forced every record into one of three
boxes, which created a large "Not placed" bucket and a few clear errors. T-034 keeps the tags
overlapping and fixes only those clear errors.

## The tags

1. **Medicine** when the museum's own words say the object is a medical or surgical instrument:
   - a Boerhaave classification category under `10 Geneeskunde, hygiene, farmacie` (the packaging
     sub-tree — boxes, pots, tubes, labels — excluded);
   - a NEMO category that names medical technology;
   - or a term from the stated word list in `catalogue.py` (`SURGICAL_WORDS`: *scalpel, lancet,
     trepan, amputation saw, catheter, syringe, speculum, forceps, dental, obstetrics, endoscope,
     stethoscope, prosthesis, splint, bandage, anatomy, hospital, …*) in the object's name or
     categories. Dutch compounds are built by suffixing, so the word needs a **leading** word
     boundary and may continue (`aderlaat` matches `aderlaatmes`).
2. **Science and technology** when the T-030 codebook (`data/evidence/catalogue/principles_A.jsonl`)
   labelled the record with a named principle of physics, chemistry, life science or earth science —
   that is, `principle != "unclear"`.
3. **A record may carry both.** A medical instrument that the codebook also placed in a principle is
   under Medicine and under Science. The header counts therefore do not add up to *All*:
   `med + sci − both + neither = all`.
4. **Neither tag.** The record stays in the collection under *All*, is counted on the Data page, and
   is never dropped.

## Flat and paper media

A record whose museum category (or the first 40 characters of its title) names a flat medium is never
tagged Medicine by a word in its title: a print *about* a surgeon is a print. T-034 added two fixes:

- **Paper media get no Science tag from a label on their medium.** 3,107 paper records carry a
  T-030 principle that came from the medium word (a lantern slide of an optical instrument was
  placed as optics). They now carry no Science tag. The paper list is in `catalogue.py` (`PAPER`);
  struck metal (coins, medals, `FLAT_OTHER`) is flat but not paper and is not excluded this way.
- **Flat words match whole words, never substrings.** The T-032 test caught `diagnostiek` on `dia`,
  `magneetschakelaar` on `ets`, `fotometer` on `foto` and `plaats` on `plaat`, and blocked real
  instruments. Forms are spelled out because the museums write singular and plural and run Dutch
  compounds together (`glasnegatief`, `lantaarnplaat`, `werktuigtekening`).

## What the rule does, measured (2026-11-16 build)

| route (a record can be counted under more than one) | records |
|---|---:|
| medicine classification (Boerhaave 10.x, not packaging) | 2,390 |
| surgical word list | 238 |
| medical technology category (NEMO) | 39 |
| principle named by the codebook (science) | 31,324 read; 3,107 of them paper media, not tagged Science |
| **no tag at all** | 19,145 |

Before de-duplication the 50,063 records carry: Medicine only 292, Science only 28,042, both 2,584,
neither 19,145. After removing duplicates (the same museum and inventory number already in a
release) 48,756 records remain; their per-tag counts are in
`results/tables/catalogue_site.json` (`by_tags`) and on the Data page.

The three catalogues remain different kinds of collection: NEMO is electrical household appliances
(nearly all Science), Teylers is largely prints, drawings and minerals (mostly neither), Boerhaave
sits between. The platform's 1,204 curated instruments had 0.1 % `unclear` (T-030).

## Limits, stated

- The word list deliberately leaves out broad Dutch words (`tang`, `bril`, `spuit`, `sonde`,
  `naald`) because in these catalogues they are mostly pliers, spectacles, spray cans, probes and
  sewing needles. Instruments named only with such a word are tagged by the museum's own
  classification where one exists (Boerhaave) and otherwise fall to Science or to neither.
- The tags are a *filtering* device for the site, not a research claim about what an object is.
  "Neither" says the rule found no medical word and no codebook principle, not that the object is
  uninteresting.
- Teylers inventory numbers do not match the platform's, so its 270 platform objects were matched by
  inventory number after normalisation (`FK 0013` = `FK-0013`), not by name. No name matching is used
  anywhere.
- Within one catalogue the same inventory number can label two different records (Teylers: 13
  numbers, 26 records). They are different records and both are kept; the duplicate test only
  removes records that repeat an object already in a release.
- The T-030 labels are read as committed. The corrections in the T-030 review concern the
  *analyses*, not the per-record labels; no record is re-labelled by this build.
