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

Only an official managing authority URL can be registered. A route is admitted
only after a human reviewer can trace all required quantitative and safety fields
to that authority: distance, elevation gain, duration, checkpoints, evacuation
points, start coordinates, and review/source version metadata.

Research used `/browse` on 2026-07-12:

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

- Focused schema/import/API: 3 files, 18 tests passed.
- Full suite: 7 files, 35 tests passed after the final invariant correction.
- `next build`: compiled, type-checked, and generated routes successfully after
  the final invariant correction.
- `routes:verify`: exit 1 with the blocker above.
