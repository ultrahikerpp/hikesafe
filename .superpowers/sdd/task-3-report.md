# Task 3: Validate and import designations

## Outcome

Route imports now accept only canonical Small Hundred Peak designation keys in the form `taiwan_small_hundred_peak:001` through `taiwan_small_hundred_peak:100`. The official Small Hundred Peak source is validated by its numeric identities, never by mountain name.

## Changes

- Added nullable elevation gain and elevation difference fields, optional designation arrays, reusable ordered-place validation, and empty evacuation-point support to `RouteInput`.
- Loaded `small-hundred-peaks.json`; its official numbers must be exactly 1–100 once each before deriving canonical designation keys.
- Added launch-catalog reporting and explicit missing, duplicate, and unexpected designation errors. A Small Hundred Peak route can also be a suburban route.
- Mapped designations and both nullable elevation fields through active-version reads and inserts.
- Updated fixtures and tests for null ascent, nullable elevation difference validation, empty evacuation points, missing/duplicate designation rejection, and overlapping suburban/Small Hundred Peak counts.

## Verification

- `npm test -- tests/features/route-import.test.ts` — 13 passed.
- `npm test` — passed (exit 0).
- `npm run build` — passed.

## Scope and staging

Only `src/features/routes/import.ts`, `tests/features/route-import.test.ts`, and `tests/fixtures/routes.ts` are staged for this task. Pre-existing 100-suburban route changes remain unstaged and were not included.

## Commit

`ed3f3f1 feat: validate official route designations`

## Review follow-up (2026-07-14)

### Actions

- Added the required 100-route suburban baseline in `data/routes/suburban-routes.json`, loaded it as the exact `requiredSuburbanRouteNames` fixture, and raised the catalog gate from 30 to 100 routes.
- Kept the baseline assertion in the focused import test so the clean checkout verifies the 100-entry fixture alongside the 100 designation keys.
- Preserved schema validation and added pre-schema string designation counting. This reports an explicit unexpected Small Hundred Peak designation even when the designation format causes `routeInputSchema` to fail.
- Added the regression case for `taiwan_small_hundred_peak:101`, asserting both `Catalog schema validation failed` and the explicit unexpected-designation error.

### Verification

- Red: `npm test -- tests/features/route-import.test.ts` — 1 failed, 13 passed; the new assertion was absent from the report as expected.
- Green: `npm test -- tests/features/route-import.test.ts` — 14 passed, 0 failed.

### Scope

- Staged only the 100-suburban baseline and Task 3 review-fix files. `data/routes/sources.json`, documentation, `.DS_Store` files, and other unrelated working-tree changes remain unstaged.
