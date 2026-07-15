# Task 8 Batch 7f report

## Result

Accepted one exact canonical suburban route:

- 獨立山-大巃頂步道 — official Forestry route `tr_id=086`
  - Boundary: the official single-direction route from 奉天岩 to the area near 大巃頂休閒民宿.
  - Catalog distance: 1.6 km, matching the official summary field; the official narrative describes the same segment as approximately 1,550 m.
  - Duration: 60 minutes, matching the official narrative's single-trip estimate.
  - Difficulty: 1, elevation difference: 350 m, permit: not required.
  - Start coordinates, cumulative elevation gain, and evacuation points remain null/empty because the official page does not publish them.
  - No Small Hundred Peak designation was added.

Rejected without inference:

- 獨立山步道 — rejected because the official summary says 5 km while the detailed route segments describe a different 3.4 km loop; no single boundary was selected.
- 石夢谷步道 — rejected because the official summary says 4.8 km while the detailed route text totals 7.3 km including the return; no single boundary was selected.

## Verification

- Every accepted `RouteInput` field has exactly one source reference assignment.
- The source registry contains the exact organization/URL pair used by the accepted record.
- The record is `kind: suburban`, has no unproven designation, and preserves unpublished facts as `null`/`[]`.
