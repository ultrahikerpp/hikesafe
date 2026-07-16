# 龍過脈森林步道單筆查核報告

查核日期：2026-07-16

結論：拒絕新增 `龍過脈森林步道` 至 `data/routes/catalog.json`。

## 官方來源

1. 農業部林業及自然保育署步道基本資料 API  
   URL: https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail

   直接查核結果：
   - 官方步道清單可查得多筆 `TR_CNAME`、`TR_LENGTH_NUM`、`TR_DIF_CLASS`、`TR_TOUR`、`TR_POSITION`、`TR_permit` 等欄位。
   - 以 `龍過脈`、`林內` 等關鍵字查核，未找到 `龍過脈森林步道` 對應條目。
   - 因無對應條目，無法自此官方來源取得 exact canonical route 的 `distanceKm`、`durationMinutes`、`difficulty`、`region`、`checkpoints`、`permitNotes`。

2. 雲林縣政府文化觀光處「慢遊雲林」景點查詢  
   URL: https://tour.yunlin.gov.tw/mainssl/modules/MySpace/index.php?pg=ZC10358673&sn=yunlin

   直接查核結果：
   - 此頁為官方「景點查詢」總入口，非 `龍過脈森林步道` 的 route detail page。
   - 頁面本身未提供可直接對應 `龍過脈森林步道` 的 exact canonical 路線名稱、長度、時間、難度、檢查點、申請規定。

3. 雲林縣政府文化觀光處 sitemap  
   URL: https://tour.yunlin.gov.tw/sitemap.xml

   直接查核結果：
   - sitemap 僅列出一批 `PrdList.php?...` 類別頁 URL。
   - 未發現可直接指向 `龍過脈森林步道` 的明確 detail URL。

## 可直接支持的值

- canonical route name：無可對應 exact canonical detail page
- region：不足
- distanceKm：不足
- durationMinutes：不足
- difficulty：不足
- checkpoints：不足
- permitNotes：不足

## 衝突與不足

1. 林業保育署官方步道清單沒有 `龍過脈森林步道` 條目。
2. 雲林官方觀光站目前只找到總入口／類別層級頁，沒有可直接對應此 route 的單一路線頁。
3. 在缺少官方 exact route page 的情況下，無法合法填入 schema 所需精確欄位。
4. 依要求，不可：
   - 以非官方或轉載資料補足欄位
   - 將單程／支線自行換算為完整路線
   - 將「半天」自行換算成分鐘
   - 宣稱 `slug`、`kind`、空值欄位由來源支持

## 拒絕理由

`龍過脈森林步道` 雖在 `data/routes/suburban-routes.json` 的 required suburban 名單內，但截至 2026-07-16 可取得的官方來源不足以支持新增一筆符合 schema 的 `kind: suburban` route。為避免把 route group、景點入口頁或非精確資料誤寫為 canonical route，這次不修改 `data/routes/catalog.json`。

## source registry 一致性檢查

- `https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail` 已存在於 `data/routes/sources.json`。
- 本次報告引用的兩個雲林官方 URL 未寫入 `data/routes/sources.json`；本次因拒絕新增 route，未修改 source registry。
