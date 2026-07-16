# Task 8 urban suburban trails Batch E

## Scope

Assessed only the exact remaining canonical names `東眼山`、`拉拉山`、`飛鳳山`. No Hundred Peak records or unrelated working-tree changes were touched.

## Rejected

- `東眼山`: rejected because the official Forestry sources describe multiple route boundaries in the recreation area. The self-guided loop is about 4,130 metres, while the official education page gives 4,134 metres and 150 minutes; the official Sports Administration itinerary uses a different visitor-centre loop with 200 minutes. The official sources do not provide one shared numeric difficulty value for the same boundary. No route values were reconciled or inferred.
- `拉拉山`: rejected because the official Forestry source describes a selectable self-guided giant-tree loop of about 4,000 metres and about three hours, but does not publish the required numeric 0–6 difficulty value or a complete ordered checkpoint boundary for the selected loop. No difficulty or checkpoint values were inferred.
- `飛鳳山`: rejected because official sources describe different route boundaries: the Sports Administration page gives a first-parking-lot-to-peak itinerary of about 1.5–2 hours without a distance, the Health Promotion Administration page gives a separate 4 km `代勸堂－第3個涼亭` walking range with about 40 minutes, and Hsinchu County's project page gives a separate 2.8 km `觀日坪2800` route without an exact duration or numeric difficulty. No single coherent route record was constructed.

No catalog records were added. All three remain eligible for a later batch only if an official source publishes the missing required fields for one coherent route boundary.

## Official sources

- [農業部林業及自然保育署：東眼山國家森林遊樂區](https://recreation.forest.gov.tw/Forest/RA?typ_id=0200003)
- [農業部林業及自然保育署：東眼山自然教育中心](https://recreation.forest.gov.tw/Education/NC?typ_id=DYS)
- [教育部體育署：臺灣小百岳第 022 號東眼山](https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=22)
- [農業部林業及自然保育署：拉拉山國家森林遊樂區](https://recreation.forest.gov.tw/Forest/RA?typ_id=0200005)
- [衛生福利部國民健康署：飛鳳山健走步道](https://www.hpa.gov.tw/Pages/Detail.aspx?nodeid=554&pid=794&sid=800)
- [教育部體育署：臺灣小百岳第 027 號飛鳳山](https://isports.sa.gov.tw/Apps/TIS/TIS05/TIS0550M_02V1.aspx?PKNO=27)
- [新竹縣政府：飛鳳山觀日坪步道修繕工程](https://www.hchg.gov.tw/News_Content.aspx?n=153&s=279028)

## Verification

- Node 24 catalog verifier: expected remaining failure is overall suburban and Small Hundred Peak coverage; no source, schema, or duplicate-slug errors.
- `git diff --check`: run after the source registry and report edits.
