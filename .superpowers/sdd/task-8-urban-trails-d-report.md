# Task 8 urban suburban trails Batch D

## Scope

Assessed only the exact remaining canonical names `姜子寮山`、`無耳茶壺山半屏山`、`桃源谷`. No Hundred Peak records or unrelated working-tree changes were touched.

## Added

- `姜子寮山`: added as `姜子寮登山步道`, using the official loop boundary of 1.67 km and approximately 120 minutes. The official route page states numeric difficulty 0, no entry control, and the official Sports Administration page identifies the mountain as Small Hundred Peak no. 011 and supplies the route checkpoints. Elevation gain and difference, evacuation points, and start coordinates remain unpublished (`null`/`[]`).

## Rejected

- `無耳茶壺山半屏山`: rejected because the official sources describe separate routes or route components rather than one coherent route with the requested combined boundary and all required fields. The official New Taipei page describes the 無耳茶壺山步道 independently, while the National Natural Park article describes a separate 半屏山 loop.
- `桃源谷`: rejected because the official New Taipei page explicitly identifies three different access routes (內寮線、大溪線、草嶺線), without one coherent boundary, exact duration, and numeric difficulty for the combined canonical name. No values were inferred.

## Official sources

- [基隆市文化觀光局：姜子寮登山步道](https://travel.klcg.gov.tw/TourContent.aspx?n=7839&s=568)
- [教育部體育署：臺灣小百岳第 011 號姜子寮山](https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=11)
- [新北市政府觀光旅遊局：桃源谷](https://newtaipei.travel/zh-tw/Attractions/Detail/402692)
- [新北市政府觀光旅遊局：無耳茶壺山步道](https://newtaipei.travel/zh-tw/Attractions/Detail/109986)
- [內政部國家公園署國家自然公園管理處：半屏山路線](https://www.taiwan.nps.gov.tw/home/zh-tw/topic/18772.html)

## Verification

- Node 24 catalog verifier: run after the catalog and source registry edits; expected remaining failures are overall suburban and Small Hundred Peak coverage if other records remain incomplete.
- `git diff --check`: run after the catalog and report edits.
