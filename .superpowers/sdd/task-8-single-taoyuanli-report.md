# 桃源里森林步道 alternate-source review

## Decision

拒絕新增「桃源里森林步道」。本次只重新評估此 exact canonical name；`data/routes/catalog.json` 未修改。

## Official sources reviewed

- 農業部林業及自然保育署：
  <https://recreation.forest.gov.tw/Trail/RT?tr_id=067>
- 彰化縣政府旅遊資訊網：
  <https://tourism.chcg.gov.tw/AttractionsContent.aspx?chk=f3b99a56-7ac0-48e5-aa4a-d1777b184522&id=440&l=CN>

## Findings

- 林業及自然保育署頁面將桃源里森林步道描述為由森林步道、龍鳳谷步道、幽蘭谷步道與體適能區步道組合而成；現頁面基本資料顯示步道全長 2.84 km、難度 1、建議時間半天。這支持的是組合型步道系統，不是單一路線邊界；前版報告寫成 2.835 km，若那是較早擷取到的原始值，也不能誤稱為現頁面值。
- 彰化縣政府旅遊資訊網的 exact canonical「桃源里森林步道」頁面本身就同時出現 2.1 km 與 1.93 km，且以「三清宮森林步道」敘述兩個環線；單憑這一頁仍無法確定與林保署頁面相同的單一路線邊界。

因此，僅看 exact canonical 官方來源就已存在清楚衝突：林保署頁面支持的是 2.84 km、半天的組合型步道系統；彰化縣政府旅遊資訊網的 exact canonical 頁面則同時出現 2.1 km 與 1.93 km，且敘述焦點是「三清宮森林步道」的兩個環線。這兩筆 exact canonical 官方資料仍無法形成一個同時支持精確里程、精確時間、數值難度、完整 checkpoints 與其餘欄位的 coherent route boundary。依資料政策不推算、不拼接不同邊界，維持拒絕新增。

## Verification

- Node 24 verifier: source registry and duplicate-slug checks passed; overall coverage failure remains expected.
- `git diff --check`: passed.
