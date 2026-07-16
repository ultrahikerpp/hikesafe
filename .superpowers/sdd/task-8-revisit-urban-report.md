# Task 8 suburban-only alternate-source reassessment

## Scope

Assessed only the exact canonical names `無耳茶壺山半屏山`、`桃源谷`、`東眼山`, using additional official authorities beyond the previously checked pages. No Hundred Peak records or unrelated working-tree changes were touched.

## Rejected

- `無耳茶壺山半屏山`: the additional official Ruifang District Office source confirms the 無耳茶壺山 trail as a separate trail, while the official National Natural Park source describes a separate 半屏山 loop. The official Forestry route document also treats 半屏山 and 無耳茶壺山 as connected points in a longer ridge route rather than publishing one complete route record for this canonical combined name. These sources do not define one coherent boundary with a single exact duration, numeric difficulty, ordered checkpoints, and all remaining required fields. No route was combined or inferred.
- `桃源谷`: the additional official Tourism Administration source identifies three main approaches with different boundaries and distances: 內寮線 about 2 km one way, 草嶺線 about 4.5 km one way, and 大溪線 about 5 km one way. The official Gongliao District Office source likewise presents 桃源谷 as part of a network of different ancient trails. Because the canonical name does not select one route boundary and the official sources do not provide one exact duration, numeric difficulty, and checkpoint set for a single selected boundary, no route was added.
- `東眼山`: the additional official Taoyuan Tourism source describes the recreation area as a 16 km trail system and separately describes the self-guided route to the main peak as about one hour. The previously checked Forestry education source defines a different 4,134 m, 150-minute self-guided loop, while other official material describes a separate main-peak route. The additional authority does not publish a matching numeric difficulty and ordered checkpoint boundary for one of those routes, so the required fields cannot be attributed to one coherent record. No route values were reconciled or inferred.

No catalog records were added and no Small Hundred Peak designation was added.

## Additional official sources

- [新北市瑞芳區公所：無耳茶壺山](https://www.ruifang.ntpc.gov.tw/home.jsp?id=b6ef2e53ee690ce6)
- [交通部觀光署：桃源谷](https://www.tad.gov.tw/m1.aspx?id=A12-00562&sNo=0001091)
- [新北市貢寮區公所：古道地圖](https://www.gongliao.ntpc.gov.tw/home.jsp?id=d1350b7a0bdca3ae)
- [桃園市政府觀光旅遊局：山林區](https://travel.tycg.gov.tw/zh-tw/travel/mountainous)

## Verification

- Node 24 catalog verifier: source registry, schema, and duplicate-slug checks pass; only the expected overall suburban and Small Hundred Peak coverage failures remain.
- `git diff --check`: passed.
