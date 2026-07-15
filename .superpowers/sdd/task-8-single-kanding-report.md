# Task 8 single-route review: 崁頂步道

Review date: 2026-07-16
Source authority: 農業部林業及自然保育署，台灣山林悠遊網

## Decision

Rejected. No catalog record was added.

Official source:

https://recreation.forest.gov.tw/Trail/RT?tr_id=107

The official page describes one coherent linear, two-way route and publishes
0.5 km length, 20 m height difference, elevation range 510–530 m, difficulty
level 1, and no mountain-entry application. It does not publish a numeric
duration: the summary says “來回往返約半小時” while the structured route
field says “建議時間：半天”. Because the two official statements are not one
explicit `durationMinutes` value for the same catalog boundary, recording 30
minutes would choose between conflicting representations rather than preserve
the source. No duration was inferred or estimated.

The existing uncommitted 崁頂步道 record was removed because it assigned
`durationMinutes: 30` and named checkpoints without an explicit field-level
official assignment under this review. The `tr_id=107` source-registry entry
was also removed because the route was rejected and no catalog record uses it.

## Verification

- Node 24 catalog verifier: source and duplicate-slug checks pass; only the
  expected overall 100/100/100 coverage errors remain.
- `git diff --check`: passed.
