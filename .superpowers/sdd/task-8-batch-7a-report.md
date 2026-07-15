# Task 8 Batch 7a source review

Reviewed: 2026-07-15

## Scope

Only the three specified remaining canonical suburban targets were assessed. No
additional route research or catalog expansion was performed.

## Results

### Already accepted in an earlier batch

- 合歡東峰步道 is already present in catalog commit `a3eac14`, using the
  Agriculture Ministry Forestry and Nature Conservation Agency's official
  Taiwan Forest Recreation page (`tr_id=062`). Its recorded boundary is
  松雪樓登山口 → 合歡東峰頂 → 松雪樓登山口 (1.9 km, 120 min), and its one
  `sourceReferences` entry assigns all 16 `RouteInput` fields.
- 桃山瀑布步道 is already present in catalog commit `a3eac14`, using the
  same agency's official page (`tr_id=063`). Its recorded boundary is 武陵山莊
  → 桃山瀑布 → 武陵山莊 (8.6 km, 240 min), and its one `sourceReferences`
  entry assigns all 16 `RouteInput` fields.

### Rejected

- 八仙山主峰步道: the official page (`tr_id=052`) labels the trail as a
  6 km linear one-way trail, while its overview describes a roughly 13 km,
  eight-hour return journey. The detailed-route presentation does not publish
  a return leg whose distance and duration can be reconciled with both of
  those values. A catalog record would therefore have to choose or infer a
  boundary; it is intentionally not added.

## Changes

No catalog or source-registry change was needed: two in-scope targets already
have source-reviewed records, and the remaining target is not defensible under
the single-boundary rule.

## Verification

- `node --import tsx scripts/verify-route-catalog.ts` with Node 24.
- `git diff --check`.
