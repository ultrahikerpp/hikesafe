# Single-route review: 能高越嶺道：東段

## Decision

Reject. No catalog record was added.

## Official evidence

- [農業部林業及自然保育署自然步道資料](https://recreation.forest.gov.tw/Trail/RT?tr_id=066)
  identifies the canonical route as `能高越嶺道：東段`, with a coherent boundary from the east trailhead to 光被八表碑, 11 km, difficulty 5, and 1,205 m elevation gain.
- The same official page gives the route planning time as `一天以上`, not an exact number of minutes.

## Rejection reason

`RouteInput.durationMinutes` is required and must be a positive integer. Converting `一天以上` to minutes would be an unsupported estimate, so the route cannot satisfy the requirement that all 16 catalog fields be explicitly assigned once through `sourceReferences`. The official page's current route-condition and closure notices do not provide a precise duration that resolves this gap.

## Scope check

- `data/routes/catalog.json`: unchanged.
- `data/routes/sources.json`: the official `tr_id=066` source was already registered; no duplicate entry was added.
- No 百岳 data was modified.

Reviewed at: 2026-07-16
