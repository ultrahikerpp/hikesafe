# Task 8 — Batch 3 official Forestry Agency routes

Status: complete with three source-reviewed suburban routes. Each accepted
record uses the official detailed-route boundary: the page explicitly returns
to its starting point, so recorded distance and duration include that return.
The separate `步道全長` display is not used for these round-trip records.

| Route | Official trail page | Exact recorded boundary | Populated facts |
| --- | --- | --- | --- |
| 松羅步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=006 | 登山口 → 吊橋 → 環狀路段岔路 → 終點 → 折返登山口；4.0 km, 110 min | difficulty 1; height difference 120 m; no entry-mountain application |
| 聖母登山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=009 | 通天橋 → 500公尺路標 → 箭竹林 → 聖母山莊 → 觀景平臺 → 通天橋；3.2 km, 150 min | difficulty 2; height difference 550 m; no entry-mountain application |
| 見晴懷古步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=019 | 宜專一線23.1K → 轉轍器 → 1、2號吊橋 → 終點 → 宜專一線23.1K；1.8 km, 50 min | difficulty 1; height difference 110 m; no entry-mountain application |

For all accepted records, `startLat`, `startLng`, and `elevationGainM` are
`null`; `evacuationPoints` and `designations` are `[]`. The pages do not
publish a WGS84 starting coordinate, a cumulative elevation-gain value, a
formal evacuation-point list, or a Sports Administration Small Hundred Peak
classification. Each has one field-level source reference covering all 16
`RouteInput` fields. Their page URLs already existed in `data/routes/sources.json`.

Excluded after review because the page's stated trail length and detailed-route
boundary conflict or the page exposes multiple independent paths without a
single record boundary: 南澳古道, 拳頭姆自然步道, 新寮瀑布步道, 九寮溪自然步道,
台灣山毛櫸步道, 茂興懷舊步道, 鐵杉林自然步道.

Verification command:

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
node --import tsx scripts/verify-route-catalog.ts
git diff --check
```

The expected remaining 100/100/100 coverage errors are not Batch 3 defects.
