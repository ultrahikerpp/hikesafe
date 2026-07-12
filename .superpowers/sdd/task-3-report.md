# Task 3 report: versioned Taiwan route catalog

## Status

`BLOCKED` for launch catalog approval. The importer, immutable version storage,
search API, verifier, tests, and production build are implemented. The catalog is
intentionally empty because the required 130 reviewed routes cannot be populated
from the authoritative material verified in this task without inventing fields.

## Inherited RED

- Inherited uncommitted Task 3 files were preserved and reviewed, not reset.
- The focused importer/API suite initially passed: 2 files, 8 tests.
- `npm run routes:verify` correctly failed with 0 hundred peaks and 0 suburban
  routes. This was treated as the catalog RED, not bypassed.

## Implemented

- Zod `RouteInput` validation, complete-file validation before transaction, and
  transactional slug upsert.
- Immutable route version creation when the source version or reviewed content
  changes; unchanged content keeps its active version.
- The database source-version index is non-unique so a reviewed-content change can
  create a new immutable row without corrupting `sourceVersion`. The one-active-row
  partial unique index and trip foreign key preserve active selection and old trip
  references.
- Active-only Traditional Chinese substring search with `region` and `kind`
  filters, plus `GET /api/routes` metadata output.
- Machine-readable route JSON schema, source registry, catalog verifier, and import
  script.
- Verifier coverage for count, registered sources, duplicate slugs, and all 30
  specifically approved day-hike names. Corrected the inherited typo from
  `鵝公髮山` to the approved `鵝公髻山`.

## Source strategy and research

Project governance permits only an official managing authority URL to be
registered. The code validates URL syntax, exact registry membership, review
metadata, and catalog coverage; it cannot determine whether an organization is an
authority or whether a page substantiates each field. A human reviewer must trace
all required quantitative and safety fields to the authority before adding a
record: distance, elevation gain, duration, checkpoints, evacuation points, start
coordinates, and review/source version metadata.

Research used `/browse` on 2026-07-12:

- The 100-name product baseline was cross-checked against the ranked list at
  <https://zh.wikipedia.org/zh-tw/%E5%8F%B0%E7%81%A3%E7%99%BE%E5%B2%B3>.
  This is a secondary naming reference, not accepted evidence for route metrics or
  safety fields.
- Taiwan Government Data Open Platform search for `台灣百岳`:
  <https://data.gov.tw/datasets/search?p=1&size=10&s=_score_desc&rft=%E7%99%BE%E5%B2%B3>
  did not expose a dataset covering the required route records and fields.
- Forestry and Nature Conservation Agency recreation trail entry:
  <https://recreation.forest.gov.tw/Trail/> returned HTTP 403 to the research
  browser. More importantly, no verified official unified dataset was found that
  supplies all mandatory quantitative and evacuation fields for the 100 peaks and
  the named 30 day hikes.

Search-engine fallbacks were blocked by bot challenges and were not treated as
evidence. No community guide, inferred GPX statistic, or synthetic value was used.
Consequently `data/routes/catalog.json` and `data/routes/sources.json` remain empty.

## Launch blocker

For each of 100 hundred-peak routes and all 30 named day hikes, an authorized human
reviewer still must provide a traceable official source supporting every required
field, especially `elevationGainM`, `checkpoints`, and `evacuationPoints`. There is
also no approved source/review version supplied to this task. Until those records
exist, the verifier must and does exit non-zero.

Current verifier result:

```text
Catalog invalid
Hundred peaks: 0
Suburban routes: 0
Missing sources: 0
Duplicate slugs: 0
```

It additionally lists the 100-count failure and all 30 missing approved day-hike
names. This is the intended launch gate.

## Verification

Run with Node 24 (`/opt/homebrew/opt/node@24/bin`):

- Focused schema/import/search/API: 5 files, 26 tests passed.
- Full suite: 9 files, 43 tests passed after the infrastructure review corrections.
- `next build`: compiled, type-checked, and generated routes successfully after
  the final invariant correction.
- `routes:verify`: exit 1 with the blocker above.
- `node --import tsx scripts/import-routes.ts`: exit 1 with `Route catalog
  rejected before import` and no environment/database initialization error.

## Infrastructure review corrections

The follow-up review added these test-driven gates without weakening the catalog
blocker:

- `data/routes/hundred-peaks.json` defines the product's exact 100-name baseline.
  Verification rejects arbitrary 100-name sets, omissions, duplicate substitutions,
  and spelling variants. This baseline is a naming/coverage rule, not automated
  evidence that any route details are authoritative.
- `scripts/import-routes.ts` reads both catalog and source registry and runs the
  complete analyzer before any database import. The empty launch catalog now fails
  with a catalog rejection instead of reaching environment/database initialization.
- Coordinates and distance are canonicalized to the database's 6/6/2 decimal
  precision before comparison and insertion; elevation gain must be an integer.
- A successful full-catalog import deactivates active versions whose slugs were
  withdrawn. Historical versions remain addressable by existing trips.
- Import and search have in-memory repository contract coverage. No live PostgreSQL
  service or credentials were supplied, so these tests do not claim live database
  integration coverage.

The human governance boundary remains explicit: schema validation, canonical-name
coverage, and source-registry matching do not prove that a source is official,
current, or supports the entered distance, elevation, duration, checkpoint, or
evacuation values. Launch approval requires that separate human review.
