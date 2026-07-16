# 石夢谷步道單筆查核報告

查核日期：2026-07-16

結論：拒絕新增 `石夢谷步道` 至 `data/routes/catalog.json`。

## 官方來源

1. 農業部林業及自然保育署步道基本資料 API  
   URL: https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail

   直接查核結果：
   - 官方步道清單可查得 `TR_CNAME`、`TR_POSITION`、`TR_LENGTH_NUM`、`TR_TOUR`、`TR_DIF_CLASS`、`TR_permit` 等欄位。
   - 以 `石夢谷`、`夢谷`、`豐山`、`千人洞` 關鍵字查核，未找到 `石夢谷步道` 或 `石夢谷` 對應步道條目。
   - 因無 exact canonical 條目，無法自此官方來源取得 `distanceKm`、`durationMinutes`、`difficulty`、`region`、`checkpoints`、`permitNotes` 的 route-level 直接值。

2. 阿里山國家風景區管理處景點快搜  
   URL: https://www.ali-nsa.net/zh-tw/attractions/list

   直接查核結果：
   - 官方景點列表頁顯示共有 115 處景點。
   - 列表中可找到 `天雲谷`，但未找到 `石夢谷`。
   - 此頁本身不是 `石夢谷步道` 的 detail page，也未提供 exact canonical 路線名稱、里程、時間、數值難度、檢查點或申請規定。

3. 阿里山國家風景區管理處 sitemap  
   URL: https://www.ali-nsa.net/sitemap.xml

   直接查核結果：
   - sitemap 僅明確列出景點總列表 `https://www.ali-nsa.net/zh-tw/attractions/list` 等索引頁。
   - 未提供可直接指向 `石夢谷` 或 `石夢谷步道` 的明確 detail URL。

## 可直接支持的值

- canonical route name：不足；未找到 `石夢谷步道` 官方單一路線頁
- region：不足
- distanceKm：不足
- durationMinutes：不足
- difficulty：不足
- checkpoints：不足
- permitNotes：不足

## 缺欄與不足

1. 林業保育署官方步道資料沒有 `石夢谷步道` / `石夢谷` 條目。
2. 阿里山官方觀光來源目前只確認到景點索引層級，沒有 `石夢谷步道` 的 official route detail page。
3. 即使阿里山官方列表存在 `天雲谷` 等豐山周邊景點，也不能據此把 `石夢谷` 視為已存在的同一條 canonical route。
4. 在缺少 exact canonical route page 的情況下，不能合法填入 schema 所需的精確 `distanceKm`、`durationMinutes`、`difficulty`、`region`、`checkpoints`、`permitNotes`。

## 拒絕理由

截至 2026-07-16，可取得的官方來源只足以證明 `石夢谷` 屬阿里山／豐山地區脈絡中的名稱，無法證明存在一筆可直接映射到 schema 的 exact canonical `石夢谷步道` 官方單一路線頁。依要求，不可：

- 以非官方資料補欄
- 從模糊景點介紹拼成 route
- 將步道群、周邊景點或其他不同邊界路線合併成一筆
- 將 `半天` 等模糊時間換算成分鐘
- 宣稱 `slug`、`kind`、空值內部欄位由來源支持

因此本次不修改 `data/routes/catalog.json`。

## source registry 一致性檢查

- `https://recreation.forest.gov.tw/mis/api/BasicInfo/Trail` 已存在於 `data/routes/sources.json`。
- `https://www.ali-nsa.net/zh-tw/attractions/list` 與 `https://www.ali-nsa.net/sitemap.xml` 目前未寫入 `data/routes/sources.json`。
- 本次因拒絕新增 route，未修改 source registry。
