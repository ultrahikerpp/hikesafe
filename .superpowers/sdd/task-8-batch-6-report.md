# Task 8 Batch 6 source review

Reviewed: 2026-07-14

## Added

All records use the Agriculture Ministry Forestry and Nature Conservation Agency's official Taiwan Forest Recreation pages. Each has one source reference covering all 16 `RouteInput` fields. Start coordinates and cumulative ascent are `null`; no official WGS84 route-start coordinate or cumulative ascent is published. Evacuation lists are empty because the pages do not publish evacuation points. No Small Hundred Peak designation is asserted.

| Route | Official source | Boundary recorded from detailed route |
| --- | --- | --- |
| 五指山登山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=044 | 竹林禪院登山口 → 中指峰 → 灶君堂 → 竹林禪院登山口; 4.5 km, 240 min. |
| 冬瓜山登山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=046 | 登山口 → 千年櫸木 → 原登山口; 3.2 km, 190 min. |
| 馬那邦山登山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=047 | 天然湖登山口（南線）至上湖登山口的穿越線; detailed segments total 4.3 km, 155 min. |
| 德芙蘭步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=051 | 登山口至停車場的單向 3 km 路線; listed segment times total 86 min. |
| 東卯山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=053 | 大道院登山口 → 東卯山三角點 → 原登山口; 13.4 km, 300 min. |
| 唐麻丹山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=054 | 裡冷登山口 → 唐麻丹山三角點 → 松鶴岔路 → 裡冷登山口; 6 km, 240 min. |
| 波津加山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=055 | 捎來端起點 → 波津加山三角點 → 捎來端; 7.2 km, 345 min. |

## Rejected

- 加里山登山步道: 鹿場主線標題寫 6.8 km，逐段距離卻加總為 7.8 km，且標題時間為 7–9 小時間隔；不選擇其一。
- 八仙山主峰步道: 官方總長為 6 km，詳細段落合計為 10.2 km，無法確認兩者採同一邊界。

## Verification

- `node --import tsx scripts/verify-route-catalog.ts` with Node 24: source registry, schema, and duplicate slug checks pass. The expected 100 百岳 / 100 郊山 / 100 小百岳 coverage gate remains incomplete.
- `git diff --check`: pass.
