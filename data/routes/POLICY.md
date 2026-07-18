# Route catalog data policy

## Source tiers

Every entry in a record's `sourceReferences` array carries a `tier`:

- `official` (default) — government, national-park, or forestry-bureau source. Required for `evacuationPoints`, `permitNotes`, and any closure/safety determination.
- `community` — a named, citable hiking-community source (currently: 健行筆記 hiking.biji.co, 輝哥小百岳網). Allowed only for route-fact fields (`distanceKm`, `durationMinutes`, `difficulty`, `checkpoints`, `startLat`/`startLng`) when no official source publishes an exact value. Never used for evacuation or permit data.

A record with at least one `community`-tier reference must still carry a primary `official` `sourceOrganization`/`sourceUrl` for the designation itself (e.g. the 教育部體育署 small-hundred-peak page). The app surfaces a "路線資料含社群來源，行前請自行確認現況" reminder wherever such a route's duration is shown before trip creation (see `app/trips/new/TripForm.tsx`).

## Range values

When the only published figure is a range (e.g. 林務署 "3~4小時"), store the conservative upper bound (`3~4小時` → `durationMinutes: 240`) and keep the citing URL in `sourceReferences`. Do not average or take the midpoint.

## Nullable route-fact fields

`distanceKm`, `durationMinutes`, and `difficulty` may be `null` when no source (official or community) publishes an exact value for the field. A `null` value must never be estimated, derived, or backfilled — it renders as "資料未載明" to the end user. `checkpoints` remains required and non-empty: every record must have at least a two-point ordered sequence (trailhead → summit), since this is the app's core safety data, unlike `evacuationPoints` which authorities frequently do not designate at all.

## Difficulty mapping

Official numeric difficulty (0–6, 林務署 步道分級) is used as-is. A community source's own difficulty label (e.g. 健行筆記's 低/中/高/低-中 text scale) may be mapped 1:1 to the 0–6 scale only when the source's scale and mapping are stated explicitly in the record's research notes; never infer a numeric difficulty from prose with no stated scale.

## Closure checks (non-negotiable)

Before adding or updating any record, check the source page's full text (not just its data table) for closure, storm-damage, or maintenance notices. A record must never be published as an active route if its source indicates the trail is currently closed. This schema has no status field — a closed trail must be rejected, not added with a caveat.

## Deterministic-scrape workflow (`scripts/scrape/`)

`npm run routes:scrape:isports` / `:biji` / `:hiker` fetch every small-hundred-peak candidate page once (zero LLM tokens) into `data/routes/raw/{source}/{number}.json` (gitignored — third-party page text, not committed) and record a content hash per URL in `data/routes/raw-manifest.json` (committed). Batch review then reads only the pre-fetched bundles, not the live web, which is what makes review cheap.

The one exception: a bundle is a snapshot from its `fetchedAt` timestamp, so it cannot prove a trail is *still* open today. Before finalizing any ADD (not a reject), re-fetch the primary official source URL live and re-check for a closure notice. This is the only live web access batch review should need — everything else (finding sources, reading route facts) comes from the bundle.

To pick up new official designations or refresh stale data, rerun the scrapers and diff `raw-manifest.json` hashes against the previous commit; only bundles whose hash changed need re-review.
