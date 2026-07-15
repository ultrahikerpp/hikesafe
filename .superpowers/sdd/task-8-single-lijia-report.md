# Task 8 single-route review: 里佳-山美步道

## Decision

Add `里佳-山美步道` as one suburban route record.

## Official evidence

Source: 農業部林業及自然保育署，台灣山林悠遊網，
<https://recreation.forest.gov.tw/Trail/RT?tr_id=098>

- Current usable boundary: `里美步道入口 →（1.2K，30分鐘）→觀瀑亭 →（1.2K，30分鐘）→里美步道入口`.
- Catalog boundary: 2.4 km round trip and 60 minutes.
- Difficulty: 3.
- Elevation difference: 200 m.
- Permit: required.
- The page does not publish a start coordinate, cumulative elevation gain, or evacuation points; these remain `null` and `[]`.
- No official designation is published for this route; `designations` remains `[]`.

The page describes the historical trail as about 5.6 km but states that disaster damage has interrupted sections and that the currently accessible section ends at the 1.2 km waterfall pavilion. The catalog therefore uses only the explicit current round-trip route boundary, not the historical total.

## Source assignment

The single official source is registered in `data/routes/sources.json` and assigns all 16 `RouteInput` fields exactly once through `sourceReferences`.

## Verification

- Node 24 verifier: passed schema, source registry, canonical-name, source-assignment, and duplicate-slug checks; overall coverage remains incomplete by project design.
- `git diff --check`: passed.

## Files owned by this task

- `data/routes/catalog.json`
- `data/routes/sources.json`
- `.superpowers/sdd/task-8-single-lijia-report.md`
