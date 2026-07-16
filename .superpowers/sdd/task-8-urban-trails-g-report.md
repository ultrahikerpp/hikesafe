# Task 8 suburban trails batch G

## Result

- Added the exact canonical route `大塔山` by correcting the existing `tashan-trail` record's canonical `mountainName`; the official route name remains `塔山步道`.
- Kept the official detailed out-and-back boundary: 7 km and 240 minutes, with 11 listed checkpoints. The record retains 16/16 field-level source assignments to the Forestry and Nature Conservation Agency page.
- Rejected `八仙山`: the official page labels the trail as linear one-way and reports a 6 km total, while its detailed route returns to the trailhead and the overview describes an approximately eight-hour round trip. These are not one coherent boundary.
- Rejected `尾寮山`: the official page reports a 15 km trail length, while its detailed route reports 9.3 km to the summit plus 9.3 km return. The summary and detailed boundary conflict, so no duration or distance was inferred.

## Official sources

- [八仙山主峰步道](https://recreation.forest.gov.tw/Trail/RT?tr_id=052)
- [塔山步道](https://recreation.forest.gov.tw/Trail/RT?tr_id=080)
- [尾寮山登山步道](https://recreation.forest.gov.tw/Trail/RT?tr_id=131)

## Verification

- Node 24 catalog verifier: source registry, schema, source assignments, canonical names, and duplicate slugs pass; remaining failure is overall catalog coverage.
- `git diff --check`: pass.
