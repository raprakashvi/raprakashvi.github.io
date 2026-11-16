# The domain rule for catalogue records (T-032)

The unified site has one collection with three states in the header filter: **Surgical instruments**,
**Science and technology** and **Not placed**. This note states how a record of the three complete museum
catalogues (T-025: NEMO, Rijksmuseum Boerhaave, Teylers Museum; 50,063 records) gets its state. The code that
implements it is `scripts/web/unified/catalogue.py` (function `domain`) and the build that applies it is
`scripts/web/unified/build.py`. The counts below are from `results/tables/catalogue_site.json`, written by every
build.

## The rule

Applied in this order; the first match wins.

1. **Flat or paper first.** A record whose museum category (or the start of its title) names a print, drawing,
   photograph, lantern slide, glass slide, negative, letter, book, map, coin, medal, painting, seal, pamphlet or
   manuscript is **never placed as surgical by a word in its title**. A print *about* a surgeon is a print. Such a
   record still falls to rules 3 or 4.
2. **Surgical** when the museum's own words say the object is a medical or surgical instrument:
   - a Boerhaave classification category under `10 Geneeskunde, hygiene, farmacie` (the museum's own medical
     sub-tree), excluding its packaging sub-tree (boxes, pots, tubes, labels);
   - a NEMO category that names medical technology (`medischetechniek`, `medische apparatuur`);
   - or a term from the stated word list in `catalogue.py` (`SURGICAL_WORDS`: *scalpel, lancet, trepan, amputation
     saw, catheter, syringe, speculum, forceps, dental, obstetrics, endoscope, stethoscope, prosthesis, splint,
     bandage, anatomy, hospital, …*) in the object's name or categories.
3. **Science** when the T-030 codebook (`data/evidence/catalogue/principles_A.jsonl`) labelled the record with a
   named principle of physics, chemistry, life science or earth science — that is, `principle != "unclear"`.
4. **Not placed** otherwise. The record stays in the collection under *All* and under *Not placed*, is counted in
   the published table, and is never dropped.

Records that duplicate an object already in the collection are not shown twice: a catalogue record is a
duplicate when the same museum and the same inventory number are already present (`CAT-…` vs the released
`META-…`/`SCI-…` records). Inventory numbers are compared on letters and digits only, because the platform writes
`FK-0013` where Teylers writes `FK 0013`. Every duplicate is counted in `results/tables/catalogue_site.json` and on
the Data page.

## What the rule does, measured

| route | records |
|---|---:|
| medicine classification (Boerhaave 10.x, not packaging) | 2,390 |
| surgical word list | 238 |
| medical technology category (NEMO) | 39 |
| principle named by the codebook (science) | 31,324 |
| no principle, no surgical term (**not placed**) | 16,072 |
| **total read** | **50,063** |

After removing 1,307 duplicates, 48,756 records were added; 2,335 are placed surgical and 30,362 science, and
16,059 are not placed. The remaining difference between the route counts and the placed counts is the duplicate
records.

The three catalogues are different kinds of collection and the rule shows it: NEMO is electrical household
appliances (8.5 % `unclear`, nearly all science), Teylers is largely prints, drawings and minerals (62 %
`unclear`, so most of it is *not placed*), Boerhaave sits between (41 %). The platform's 1,204 curated
instruments had 0.1 % `unclear` (T-030).

## Limits, stated

- The word list deliberately leaves out broad Dutch words (`tang`, `bril`, `spuit`, `sonde`, `naald`) because in
  these catalogues they are mostly pliers, spectacles, spray cans, probes and sewing needles. Instruments named
  only with such a word are placed by the museum's own classification where one exists (Boerhaave) and otherwise
  fall to *science* or *not placed*. This is a conservative rule: it under-places rather than over-places.
- The rule is a *placing* device for the site filter, not a research claim about what an object is. `Not placed`
  says the rule could not place the record, not that the object is uninteresting.
- Teylers inventory numbers do not match the platform's, so its 270 platform objects were matched by inventory
  number after normalisation (`FK 0013` = `FK-0013`), not by name. No name matching was used anywhere.
- Within one catalogue the same inventory number can label two different records (Teylers: 13 numbers, 26
  records, e.g. two prints both numbered `N044`). They are different records and both are kept; the duplicate test
  only removes records that repeat an object already in a release.
- The T-030 labels are read as committed. The corrections in the T-030 review concern the *analyses* (lags,
  reversals), not the per-record labels, and no record is re-labelled by this build.
