# Task 8 Batch 7e — tiny suburban-only batch

## Scope

Assessed only the exact remaining canonical names 嘉南雲峰步道、瑞太古道、四大天王山步道. Hundred-peak records were not touched.

## Accepted

- 嘉南雲峰步道 — accepted using the Forestry and Nature Conservation Agency detailed route from 南側登山口 to 北側登山口: 4.6 km and 250 minutes, calculated by summing the page's explicit segment values. The page's 9.7 km summary is a broader trail figure, so the catalog records the explicitly bounded detailed traverse rather than mixing the two boundaries. Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=082
- 瑞太古道 — accepted using the complete Forestry and Nature Conservation Agency loop from 瑞里登山口（西登山口） back to the same trailhead: 5.2 km and 180 minutes, matching the page's detailed segments and whole-trail length. Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=083

Both records are `kind: suburban`, have no Small Hundred Peak designation, leave unpublished coordinates/ascent/evacuation data as `null`/`[]`, and assign every one of the 16 RouteInput fields exactly once to the registered Forestry source pair.

## Rejected

- 四大天王山步道 — rejected. The official page gives a 3.5 km whole-trail length, while its detailed segments sum to 3.9 km; the detailed segment times sum to 120 minutes while the same page separately states about 150 minutes round trip. The page also reports a current 0k+350 roadbed collapse and partial closure. No coherent single boundary is selected and no values are inferred. Source: https://recreation.forest.gov.tw/Trail/RT?tr_id=084

## Verification

- `export PATH="/opt/homebrew/opt/node@24/bin:$PATH"`
- `node --import tsx scripts/verify-route-catalog.ts` — passed schema, registered-source, field-source, and duplicate-slug checks; overall catalog coverage remains incomplete as expected.
- `git diff --check` — passed.
