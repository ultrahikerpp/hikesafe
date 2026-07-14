# Task 8 — Batch 4 official Forestry Agency routes

Status: complete with three source-reviewed suburban routes. All accepted
records use a single Forestry and Nature Conservation Agency trail page; the
recorded distance and duration are the page's explicit detailed-route boundary.

| Route | Official trail page | Exact recorded boundary | Recorded facts |
| --- | --- | --- | --- |
| 鳩之澤自然步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=020 | 多望吊橋 → 休憩平臺 → 接回步道0.4K處 → 多望吊橋；1.5 km, 60 min | difficulty 2; height difference 180 m; no entry-mountain application |
| 朝陽步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=022 | 南澳漁港步道登山口 → 第一至第四觀景臺 → 建國路登山口；2.22 km, 80 min | difficulty 1; height difference 182 m; no entry-mountain application |
| 福巴越嶺國家步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=024 | 大羅蘭吊橋 → 茶墾山、模故山岔路 → 札孔（茶墾）、檜山、拉拉山駐在所 → 塔曼山岔路 → 拉拉山遊客中心；18 km, 510 min | difficulty 3; height difference 1,236 m; natural-reserve entry permission required (daily capacity 150) |

For each accepted route, `startLat`, `startLng`, and `elevationGainM` are
`null`; `evacuationPoints` and `designations` are `[]`. The source pages do
not publish a WGS84 start coordinate, a cumulative elevation-gain value, a
formal evacuation-point list, or an independently attributable Sports
Administration Small Hundred Peak classification. Each has one field-level
source reference covering all 16 `RouteInput` fields. All three source pairs
already existed in `data/routes/sources.json`, so that registry is unchanged.

Excluded after review:

- 望洋山步道: the 1.2 km stated trail length conflicts with the 1.9 km
  detailed-route segment total.
- 東滿步道: the 7.7 km stated trail length conflicts with the 13.36 km
  detailed route when its separately listed forest-park approaches are included.
- 北插天山登山步道: the 4.7 km stated length and detailed route state an
  out-and-back ascent, but do not publish a single unambiguous full-trip
  distance and duration.
- 霞喀羅國家步道: the 22 km stated length differs from the 22.2 km detailed
  segment total, so no rounded or inferred boundary was chosen.

Verification commands:

```sh
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"
node --import tsx scripts/verify-route-catalog.ts
git diff --check
```

The expected remaining 100/100/100 coverage errors are not Batch 4 defects.
The Node 24 verifier reported: `Hundred peaks: 0`, `Suburban routes: 17`,
`Small hundred peaks: 1`, `Missing sources: 0`, and `Duplicate slugs: 0`.
