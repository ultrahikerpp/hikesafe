# 桃源里森林步道 alternate-source review

## Decision

拒絕新增「桃源里森林步道」。本次只重新評估此 exact canonical name；`data/routes/catalog.json` 未修改。

## Official sources reviewed

- 農業部林業及自然保育署：
  <https://recreation.forest.gov.tw/Trail/RT?tr_id=067>
- 彰化縣政府旅遊資訊網：
  <https://tourism.chcg.gov.tw/AttractionsContent.aspx?chk=f3b99a56-7ac0-48e5-aa4a-d1777b184522&id=440&l=CN>
- 彰化縣登山步道資訊網：
  <https://hiking.chcg.gov.tw/TrailPage.aspx?TrailID=97>
- 交通部觀光署參山國家風景區管理處：
  <https://www.trimt-nsa.gov.tw/zh-tw/trail/79/>

## Findings

- 林業及自然保育署頁面將桃源里森林步道描述為由森林步道、龍鳳谷步道、幽蘭谷步道與體適能區步道組合而成，基本資料為 2.835 km、難度 1、路程規劃半天；沒有精確分鐘數，也不是單一路線邊界。
- 彰化縣政府旅遊資訊網的「桃源里森林步道」頁面描述三清宮森林步道有兩個環線，並列 2.1 km／1.93 km 的不同長度；其「桃源里森林步道群」頁面另列約 3 km、樹枝型多分支與多個起訖方向。
- 彰化縣登山步道資訊網的體適能區頁面另列 2.79 km 的系統敘述、1.38 km 的步道長度、線型型態與 1 小時步行時間，與前述森林步道群不是同一可確定邊界。
- 參山國家風景區管理處頁面使用「桃源里森林步道（三清宮步道）」名稱，列虎崗路入口折返、5 km、53 分鐘、第一級／低難度，並列歡喜園、三清宮、彰師大寶山校區等路線點；其長度與其他官方頁面不一致，無法證明是同一邊界。

因此，現有官方資料無法形成一個同時支持精確里程、精確時間、數值難度、完整 checkpoints 與其餘欄位的 coherent route boundary。依資料政策不推算、不拼接不同邊界，維持拒絕新增。

## Verification

- Node 24 verifier: source registry and duplicate-slug checks passed; overall coverage failure remains expected.
- `git diff --check`: passed.
