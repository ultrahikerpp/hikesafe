# Task 8 urban suburban trails Batch C

## Scope

Assessed only the exact remaining canonical names `五寮尖`、`筆架連峰`、`南插天山`. No Hundred Peak records or unrelated working-tree changes were touched.

## Rejected

- `五寮尖`: official New Taipei tourism data states a 10.5 km route and classifies it as `荒野探險型`; the official Sanxia District Office route gives the same 10.5 km route and an approximate 6 hours 30 minutes. Neither source publishes the numeric 0–6 difficulty value required by the catalog, so no numeric difficulty was inferred from the category name.
- `筆架連峰`: official New Taipei tourism data states a 6.1 km route and classifies it as `荒野探險型`, but does not publish an exact duration. The official Forestry communication-point data identifies route points but does not supply a coherent route duration or full route boundary. No duration was inferred.
- `南插天山`: official Forestry sources identify the route and CT108 marker section, but do not publish one coherent complete route boundary with an exact duration and numeric difficulty for this catalog record. No route values were inferred from adjacent 北插天山 or other routes.

No catalog records were added. All three remain eligible for a later batch only if an official source publishes the missing required fields for the same route boundary.

## Official sources

- [新北市政府觀光旅遊局：五寮尖登山步道](https://newtaipei.travel/zh-tw/attractions/detail/110589)
- [三峽區公所：五寮尖登山步道](https://www.sanxia.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=0c2325202581f52a936fd5edb0247e92&id=dc5b21213dfb17e5)
- [新北市政府觀光旅遊局：筆架連峰登山步道](https://newtaipei.travel/zh-tw/attractions/detail/402599)
- [林業及自然保育署：山區手機可通訊點標示資訊](https://www.forest.gov.tw/UserFiles/001/Images/web/1120616_communication.pdf)
- [林業及自然保育署：步道山徑簡易路標標示資訊](https://www.forest.gov.tw/UserFiles/001/Images/web/sign_1150601.pdf)
- [林業及自然保育署新竹分署：插天山自然保留區路線說明](https://hsinchu.forest.gov.tw/0000009?p=46)
- [林業及自然保育署：登山步道標誌維護說明](https://www.forest.gov.tw/0000014/0070392)

## Verification

- Node 24 catalog verifier: expected remaining failure is overall 100/100/100 coverage; no source, schema, or duplicate-slug errors.
- `git diff --check`: passed.
