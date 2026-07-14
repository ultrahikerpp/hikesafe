# Task 8 Batch 5 source review

Reviewed: 2026-07-14

## Added

All source URLs are the Agriculture Ministry Forestry and Nature Conservation Agency's official Taiwan Forest Recreation trail pages. Each added catalog record assigns all 16 `RouteInput` fields exactly once to its official source. `startLat`, `startLng`, and `elevationGainM` are `null`; official pages do not publish a WGS84 route-start coordinate or cumulative ascent. `evacuationPoints` is `[]`; the official pages do not publish an evacuation-point list. No Small Hundred Peak designation was assigned.

| Route | Official source | Recorded route boundary |
| --- | --- | --- |
| 大霸尖山登山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=027 | The page's three-day detailed route: 觀霧山莊 → 九九山莊 → 大霸尖山霸基 → 九九山莊 → 觀霧山莊; 23 + 14.6 + 23 km and 10.5 + 14 + 9.5 hours. |
| 馬里光瀑布步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=036 | The page's detailed out-and-back: 登山口 → 瀑布觀景平台 → 登山口; 0.6 + 0.6 km and 10 + 15 minutes. |
| 鎮西堡巨木群步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=038 | The page's detailed loop returning to 鎮西堡巨木群登山口; segment total 7.1 km and 220 minutes. |
| 鳥嘴山登山步道 | https://recreation.forest.gov.tw/Trail/RT?tr_id=042 | The page's detailed loop: 上島山登山口 → 上島山三角點 → 上島山登山口; segment total 6.6 km and 330 minutes. |

`elevationDifferenceM`, difficulty, region, and permit notes preserve the same official page's published values. 大霸尖山登山步道 additionally retains its page's entry-certificate and conditional national-park permit notice; it does not rely on the page's bare `入山申請：否` line alone.

## Rejected

- 紅河谷越嶺步道: the official page publishes a 15 km total but no detailed segment list or exact duration.
- 哈盆越嶺步道: the page describes a 14 km out-and-back but gives a 6–7 hour interval, not one exact duration.
- 塔曼山步道: the page publishes a 3 km total and `半天`, while detailed route data is only an image rather than a machine-transcribed route boundary and exact duration.
- 北得拉曼巨木步道: the page publishes a 2.6 km total and `一天`, while detailed route data is only an image rather than a machine-transcribed route boundary and exact duration.

## Verification

- `node --import tsx scripts/verify-route-catalog.ts` with Node 24: schema/source/duplicate-slug checks pass; the expected 100 百岳 / 100 郊山 / 100 小百岳 coverage gate remains incomplete.
- `git diff --check`: pass.
