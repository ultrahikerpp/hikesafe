# Task 8 single-route review: 崁頂步道

Review date: 2026-07-16
Source authority: 農業部林業及自然保育署，台灣山林悠遊網

## Decision

Rejected. No catalog record was added.

Official sources:

https://recreation.forest.gov.tw/Trail/RT?tr_id=107
https://www.forest.gov.tw/0002770

The official replacement page at `0002770` still does not support a catalog
addition. Its top-level summary says `來回往返約半小時`, while the page copy
also says `路程規劃半天`. Those are conflicting official duration statements,
not one explicit `durationMinutes` value, so `30` cannot be preserved as a
directly sourced catalog field.

The same page lists only an elevation range of 510–530 m. That supports the
terrain span but does not directly publish `elevationDifferenceM: 20`; 20 m
would be a derived value and is therefore not recorded as an official field.

The two same-name `福安宮後方` links on the page function as entrance links,
not ordered checkpoints along the route, so they cannot justify two sequential
checkpoint records. The page also does not directly publish precise numeric
coordinates, so `startLat`/`startLng` cannot be sourced from it either.

The existing uncommitted 崁頂步道 record was removed because it depended on
unsupported field assignments for duration, elevation difference, coordinates,
and ordered checkpoints. The `tr_id=107` source-registry entry remains in
`data/routes/sources.json`, and `0002770` also remains there because this
rejection report cites both sources. Conclusion unchanged: reject the route
addition.

## Verification

- Node 24 catalog verifier: source and duplicate-slug checks pass; only the
  expected overall 100/100/100 coverage errors remain.
- `git diff --check`: passed.
