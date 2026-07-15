# Task 8 urban suburban trails A

## Scope

Assessed only the exact remaining canonical names `七星山主峰東峰`、`大屯山主峰`、`面天山向天山`. No Hundred Peak records or unrelated working-tree changes were touched.

## Accepted

All three records use one explicit route variant from the Yangmingshan National Park Headquarters trail-classification page:

- `七星山主峰東峰`: `七星主峰－東峰步道（小油坑至冷水坑）`, 3.7 km, 150 minutes, difficulty 2, 380 m elevation difference.
- `大屯山主峰`: `大屯主峰連峰步道`, 5.8 km, 270 minutes, difficulty 3, 640 m elevation difference.
- `面天山向天山`: `面天山向天山步道`, 4.0 km, 180 minutes, difficulty 2, 577 m elevation difference.

Each record is `kind: suburban`, has no unproven Small Hundred Peak designation, and assigns all 16 `RouteInput` fields exactly once to the registered official source pair. The source page does not publish WGS84 start coordinates, cumulative ascent, evacuation points, or permit notes for these route entries, so those values remain `null`/`[]`/`null` under the approved nullable contract.

## Official source

- 陽明山國家公園管理處：[步道分級](https://www.ymsnp.gov.tw/ch/sglarticle/trail-classification)

## Verification

- Node 24 catalog verifier: run after changes; expected remaining failure is overall 100/100/100 coverage.
- `git diff --check`: run after changes.
