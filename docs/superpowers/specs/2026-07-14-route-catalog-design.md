# HikeSafe Route Catalog Design

## Goal

建立可匯入 HikeSafe 的台灣登山路線 catalog，包含 100 筆百岳、100 筆郊山與教育部體育署臺灣小百岳官方 100 座指定，且每筆資料都能由官方來源支持。

## Scope

- 保留現有 `data/routes/catalog.json`、`data/routes/sources.json` 與 `RouteInput` schema。
- 將驗證門檻調整為 100 筆百岳、至少 100 筆郊山、100 座小百岳指定、零缺少來源、零重複 slug。
- 保留 `kind` 作為既有百岳／郊山分類；以 `designations` 標示小百岳，避免同一路線建立重複記錄。
- 將無法由官方來源支持的累積爬升與撤離點明確表示為未提供，不修改為推測資料。
- 不加入尚未完成來源核對的路線，不使用估算值、測試 fixture 或虛構安全資訊。

## Data policy

每筆路線必須完整提供名稱、slug、區域、既有類型、距離、時間、檢查點、來源組織、來源 URL、來源版本與審核日期。起點 WGS84 座標、累積爬升、官方高度落差與許可資訊僅在官方明確發布時填入；未發布時一律保留 `null`。官方只發布高度落差時，以 `elevationDifferenceM` 儲存該原始語意。難度保留主管機關原始整數分級 `0–6`，不映射為 1–5。官方未載明撤離路線或撤離點時，`evacuationPoints` 為空陣列，產品與緊急報告須顯示「官方資料未載明」。

`sources.json` 登錄每個來源組織與 URL；`catalog.json` 的 `sourceOrganization` 與 `sourceUrl` 必須能對應到來源登錄。官方資料若缺少必要欄位，改找另一個官方來源；若仍未發布，保留未提供狀態，不自行補值。不得將「高度落差」轉填為累積爬升、由 KML 計算累積爬升，或以地理距離將 GIS 救難點配對到路線。

## Classification model

- `kind` 維持 `hundred_peak` 或 `suburban`，維持既有 API、匯入與查詢的相容性。
- `designations` 是零到多個官方指定；本次值為 `taiwan_small_hundred_peak:001` 至 `taiwan_small_hundred_peak:100`。
- `data/routes/small-hundred-peaks.json` 收錄教育部體育署官方編號、原始名稱、所屬縣市與來源版本；官方同名山以編號區分，不自行加入別名。
- 驗證器以 `designations` 計算小百岳數量，要求官方編號 001–100 各出現一次；一筆重疊路線可同時計入郊山與小百岳。
- 不新增重複 slug、重複 route version，或僅因分類不同而重複的路線記錄。

## Safety behavior

- `evacuationPoints` 只收錄官方明確指出的撤退路線、撤離點或等效安全位置；空值不代表安全或無需救援。
- 起點座標與許可資訊為空時，產品必須顯示「官方資料未載明」；不得轉換未標示 CRS 的座標、由 KML 計算座標，或將缺少許可資訊解讀為免申請。
- 難度必須顯示來源機關的原始 `0–6` 分級；不得將 `0` 或 `6` 映射為既有 `1–5` 值。
- 緊急報告的空撤離資訊固定輸出「官方資料未載明」，不選擇最近停機坪、通訊點或道路。
- UI 與 API 需將官方高度落差和官方累積爬升分別標示，避免使用者誤認兩者相同。

## Workflow

1. 盤點 100 筆百岳、100 筆郊山與體育署 100 座小百岳的官方來源；先完成重疊名稱審核。
2. 以資料庫 migration 與 importer 支援 designation、官方高度落差與未提供狀態。
3. 依批次建立 `sources.json` 與 `catalog.json`，每批完成後執行 `npm run routes:verify`。
4. 驗證通過後執行 `npm test` 與 `npm run build`。
5. 使用 Supabase 的 `DATABASE_URL` 執行 `npm exec tsx scripts/import-routes.ts`。
6. 重新部署 Vercel，驗證 Production `/api/routes` 回傳可用資料。

## Acceptance criteria

- `npm run routes:verify` 顯示 100 筆百岳、至少 100 筆郊山、100 座小百岳指定、零缺少來源與 `Catalog valid`。
- `npm test` 與 `npm run build` 通過。
- Supabase 匯入成功且具備 active route versions。
- Production `/api/routes` 不再回傳 `Route catalog unavailable`。
- 任何未能以來源支持的欄位都明確標示為未提供，不以推測資料取代。

## Non-goals

- 不建立自動爬蟲或週期性同步管線。
- 不改用 Supabase Data API、Supabase Auth 或其他資料庫 SDK。
- 不為了讓驗證通過而降低資料品質或修改安全門檻。
- 不以重複 route record 滿足重疊分類的計數。
