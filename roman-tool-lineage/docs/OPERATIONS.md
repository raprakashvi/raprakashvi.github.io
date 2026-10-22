# Vestigium operations and access

Current release: `v1-804c1e7c3202`, 2,830 records. The original research atlas is the
main page again; the paginated collection is at `collection.html`. The preserved
`legacy.html` URL opens the same branded research workspace. See
[DESIGN_RESTORATION.md](DESIGN_RESTORATION.md) for routing, theme and performance limits.

Public Pages URL: https://raprakashvi.github.io/roman-tool-lineage/
Website checkout: `/home/rp/rp_repo/raprakashvi.github.io`, publishing branch `master`.
Source: `raprakashvi/local_tinkering`, branch `vestigium-2026-10-21`, folder `roman_tool_lineage/` (current local baseline retained).
The website is static and has no runtime API, server database, registration or paid service.

## Credentials

Initial access is configured. Read the username/password locally in the ignored file
`roman_tool_lineage/.access.local` (mode 0600). The initial username is `research`.
Do not commit or copy this file into a deployment artifact. It is deliberately not repeated
in logs or documentation. Save it in your password manager before removing the local copy.

Change credentials from the project directory:

```bash
python scripts/web/configure_gate.py --output gate.local.json
MPLCONFIGDIR=/tmp/vestigium-mpl python scripts/web/build_site.py --gate-config gate.local.json
python scripts/web/verify.py
```

The prompt accepts a new username and a unique password (at least 12 characters).
`gate.local.json` contains a random salt, 210,000 PBKDF2-SHA256 iterations and a verifier
of `username + NUL + password`; it contains neither plaintext username nor password.
Only this verifier is deployed as `gate-config.json`. Keep a private recovery copy of the
actual credentials. The initial `.access.local` is not automatically updated when you
choose new credentials: update/delete that local initial-access note after rotation.
Publish the rebuilt gate configuration using the deployment command below. Credential
rotation changes the verifier and invalidates old browser-session entries on page load.
After eight hours or sign-out the next load requires login; an already open page is not
remotely revoked. A missing/invalid configuration fails closed at the interface.

**This is a basic interface gate, not authentication security.** All static HTML,
JavaScript, JSON, archives, images, source URLs and derived files remain publicly
retrievable and can bypass the interface. A public verifier allows offline password
guessing, and browser session flags are editable. Use credentials unique to this collection.
Do not put confidential content here. All three HTML entry points have `noindex,nofollow,noarchive`; the collection
has no sitemap or personal-site navigation entry. Neither arrangement prevents discovery
or guarantees that raw files cannot be indexed. Private hosting would require a different
server/access architecture, which the current request explicitly does not require.

## Rebuild, update and publish

Keep Python dependencies in a local environment and record exact versions for releases:

```bash
python -m pip install -r requirements-web.txt
python scripts/web/ingest.py           # cached, no network
python scripts/web/dataset.py
MPLCONFIGDIR=/tmp/vestigium-mpl python scripts/web/build_site.py --gate-config gate.local.json
python scripts/web/verify.py --reorder
```

Browser QA uses an installed Chrome and Node 22, with no npm dependency. Start a localhost
HTTP server and Chrome debugging as documented in `VERIFICATION.md`, then run
`node roman_tool_lineage/scripts/web/check_collection.mjs` from the parent repository.
That helper reads the initial ignored credentials; after credential rotation supply an
updated private test note or run the same scenarios manually. Do not upload the test note.

Deployment first checks a clean website checkout on `master`, verifies repository identity,
requires a configured gate, hashes all tracked personal-site files outside the collection,
copies only the collection subtree, runs the existing personal-site integrity checker, and
commits only `roman-tool-lineage/`. It retains earlier published dataset versions so old
tabs can still resolve their records. Inspect the dry run before applying:

```bash
python scripts/web/deploy.py --site dist --website /home/rp/rp_repo/raprakashvi.github.io
python scripts/web/deploy.py --site dist --website /home/rp/rp_repo/raprakashvi.github.io --apply --push
```

GitHub SSH write access is required for the last command. Push authorization has been
supplied for this delivery; the helper does not create new credentials or modify main-site
navigation, sitemap, scripts or settings. The personal site continues root-based GitHub
Pages publishing; do not switch it to a collection-only Actions artifact. Git records the
entire generated release as a recoverable deployment. Live-check the dataset version and
normal gate behavior after GitHub finishes publishing, since push success is not live QA.

A manual source-repository Actions workflow optionally builds a downloadable artifact.
Configure `VESTIGIUM_GATE_CONFIG` with the salted verifier JSON, not a plaintext password.
It is supplied on the source branch and was not executed here; merge it to the default
branch and configure the verifier secret before using its manual trigger. It does not
publish to or replace the personal site automatically. Browser QA is a local
release step. Source caches in the original embedded `index.html` make the build independent
of missing third-party thumbnail caches; museum refresh is separate and opt-in.

## Backups and restore

Before migration the entire 687 MB project was archived outside the working tree:
`/tmp/roman-lineage-checkpoints/pre-web-2026-10-21.tar.gz`.
SHA-256: `8f98c4ff9e4d3e20744175f642a11c9c0db1ceaa6c7a5989c76beacf8bd4d8c4`.
This is a session-local checkpoint; copy it to your normal durable backup location.
The original atlas, source dataset and assets were not edited. Git history retains the
pre-migration source as well. Restore the archive into a separate empty directory first:

```bash
mkdir -p /tmp/vestigium-restore
sha256sum /tmp/roman-lineage-checkpoints/pre-web-2026-10-21.tar.gz
tar -xzf /tmp/roman-lineage-checkpoints/pre-web-2026-10-21.tar.gz -C /tmp/vestigium-restore
```

Back up the authoritative ID registry, raw/curated sources, releases, scripts and Git
history. Store credentials separately, privately; ignored files are not covered by Git.
Dataset ZIPs include schema and hashes but not image bytes; preserve source images as well
as their asset manifests, with the appropriate access/rights handling. `data/processed/web/legacy_source_snapshot.json`
retains non-item study/graph data alongside original row values. Rebuilds never overwrite
the source offline atlas. Published files can be reproduced and rolled back independently.

## Rollback

The first hosted migration is website commit `238b7cf`; the pre-collection website is
`78ef5c9`. To roll back a later collection deployment, inspect its commit, then use
`git revert <collection-deployment-commit>` on website `master` and push. Each deployment
changes only `roman-tool-lineage/`, so reverting it leaves the main site intact. Revert the
initial collection commit only if you intend to remove the entire subpage. Avoid force
pushes. Confirm live Pages status afterward. To restore a dataset pointer, redeploy a
known-good complete artifact or revert its collection commit; do not point at absent shards.

## Scaling boundaries

The original HTML was 62.1 MB, of which embedded image JSON was 50.6 MB. The new HTML is
about 8 KB; search loads a roughly 1.3 MB metadata index after login, displays 24 cards per
page, and fetches 80-record shards only for detail/compare. Images are external, lazy and
browser-cached; existing museum thumbnails stay small. Catalog photos/scans remain original
bytes to preserve source checksums and ND constraints. Older research views load on demand.
Versioned shard paths use normal Pages/browser caching; the small version pointer and gate
config bypass stale HTTP caches. No service worker caches credentials or creates a second
access path. Direct static URLs are public by design.

At tens of thousands of records, measure index transfer/parse/filter time and DOM counts
again. Add indexed query shards or a client worker before adopting an API. A true backend
or private access would be a separate migration. The current static site does not promise
arbitrary-scale server search, confidential assets or model inference.


## Review drafts

Review histories are browser-local, scoped to the pilot version and retained on sign-out. Export JSON before clearing browser data, moving devices or changing the pilot. There is no server upload. Source deployments contain the blank tasks and image queue, never local review notes. Follow [REVIEW_WORKFLOW.md](REVIEW_WORKFLOW.md) for backup, import, offline validation and conflict handling. Preserve old `data/<version>/review/` assets for version-specific recovery.

## Enrichment and additional sources

`ingest_cleveland.py` reuses the shared source Fetcher and import file. Replay is offline;
refresh is bounded. `supplemental_shapes.py` reuses the original deterministic extractor
and writes masks/QC for every linked main-view image. `dataset.py` then validates both
item records and working annotations, preserves originals and emits a hashed release.
The build adds working-function exports/coverage, descriptive outline additions and a
prepared review workspace. `phase_acceptance.py` checks matching verification versions
before generating `reports/phase_acceptance.json`; pass `--live` only after live checks.

Working interpretations are generated from versioned rules and source context, separately
from documented functions, human reviews and predictions. Human review is deferred and
is not a deployment gate. Keep JSON exports from any later review with their original
pilot/release; a new dataset version creates a separate pilot and browser storage scope.

The site remains a buildless static application with a compact search index, 80-record
shards, paginated cards, lazy images and on-demand analysis. The current measured browse
index is about 1.45 MB decoded; no detail shards are fetched on the initial browse view.
Archive old dataset/pilot directories before pruning them for storage; Git history and
release manifests support rollback. Deployment only changes the collection subfolder.
