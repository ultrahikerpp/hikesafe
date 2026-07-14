# Task 8 — Batch 2 official Forestry Agency routes

Status: complete with ten source-reviewed suburban routes.  All use a single
Forestry and Nature Conservation Agency trail page.  The recorded distance is
the page's stated trail length; the detailed-route segment totals and stated
times were checked against that same boundary.  `startLat`, `startLng`, and
`elevationGainM` are `null`, `evacuationPoints` is `[]`, and `designations` is
`[]` because the reviewed page did not provide the required official data.

| Route | Official trail page | Boundary evidence | Recorded facts |
| --- | --- | --- | --- |
| 金瓜寮魚蕨步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=004 | 1.0 km; 0.4 + 0.6 km; 15 + 20 min | difficulty 1, height difference 10 m, no entry-mountain application |
| 礁溪跑馬古道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=007 | 5.0 km; 0.6 + 1.55 + 0.55 + 0.3 + 2.0 km; 135 min | difficulty 2, height difference 169 m, no entry-mountain application |
| 林美石磐步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=008 | 1.7 km; detailed loop totals 1.7 km and 60 min | difficulty 2, height difference 100 m, no entry-mountain application |
| 翠峰湖環山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=014 | 3.95 km; detailed route totals 3.95 km and 135 min | difficulty 2, height difference 160 m, no entry-mountain application |
| 桶後越嶺步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=028 | 7.0 km; detailed route totals 7.0 km and 180 min | difficulty 2, height difference 280 m, no entry-mountain application |
| 橫嶺山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=048 | 6.6 km; detailed route totals 6.6 km and 210 min | difficulty 2, height difference 350 m, no entry-mountain application |
| 鳶嘴稍來小雪山國家步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=060 | 15.2 km; detailed route totals 15.2 km and 540 min | difficulty 3, height difference 800 m, no entry-mountain application |
| 合歡尖山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=061 | 0.4 km; detailed route totals 0.4 km and 30 min | difficulty 3, height difference 107 m, no entry-mountain application |
| 特富野古道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=081 | 6.32 km; detailed route totals 6.32 km and 150 min | difficulty 2, height difference 484 m, no entry-mountain application |
| 二萬坪步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=095 | 0.3 km; detailed route totals 0.3 km and 15 min | difficulty 1, height difference 9 m, no entry-mountain application |

All ten page URLs already existed in `data/routes/sources.json`; no source
registry entry was added or changed.  No Small Hundred Peak designation was
assigned because this batch did not establish an independently attributable
Sports Administration classification source.

Verification command:

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
node --import tsx scripts/verify-route-catalog.ts
```

Expected remaining global catalog-coverage errors are acceptable at this
stage; Batch 2 must add no schema, source-registry, or duplicate-slug errors.
