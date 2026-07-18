# HikeSafe LINE Quick Reply 與雙語功能文字設計

日期：2026-07-18

## 目標

讓登山客可直接在 HikeSafe 官方 LINE 對話中，以文字或 Quick Reply 快速回報進度，不必切換到 LIFF 網頁。保留現有繁體中文，所有系統 UI、功能提示、LINE 回覆與通知文字增加英文翻譯，以支援國際黑客松展示。

本功能不提供背景定位、導航、持續 GPS 追蹤或自動救援。一般平安回報只更新行程資料；只有「需要協助」、預計下山提醒與逾時狀態會通知留守人。

## 使用流程

### 開始回報

登山客在官方 LINE 私訊、群組或聊天室輸入 `回報`，Bot 回覆雙語提示與 Quick Reply：

```text
請選擇回報方式
Choose a check-in method
```

按鈕使用精簡的雙語文字與圖示：

- `✅ 平安\nSafe`
- `🏠 已到山屋\nAt shelter`
- `📍 傳送位置\nSend location`
- `⚠️ 需要協助\nNeed help`

Quick Reply 使用 postback action 或 LINE 原生 location action。LINE 使用者可繼續輸入 `回報 已到山屋` 這類明確文字指令；一般聊天文字不會自動被視為回報。

### 一般進度回報

「平安」與「已到山屋」會呼叫既有 `recordCheckIn`，寫入文字型 check-in。成功後回覆：

```text
回報已成功送出
Check-in submitted successfully
```

這類回報不建立 LINE 推播通知，不增加留守人的通知量；它會成為行程的最後成功回報，供留守查看頁面與後續提醒使用。

### 位置回報

「傳送位置」使用 LINE 原生位置 action。收到位置 message event 後，將位置轉為既有 check-in 資料；位置回報本身不推播給留守人。

### 需要協助

點選「需要協助」後先顯示二次確認：

```text
即將通知留守人，確認需要協助嗎？
This will notify your guardian. Continue?
```

只有使用者再次確認後才呼叫既有 `requestHelp`，建立求助 alert event，交由目前運作中的 Supabase Cron 通知流程派送。取消則不建立 check-in 或 alert event。

### 其他行程操作

第一版的「開始登山」「安全下山」「延長時間」仍使用 LIFF：開始登山需要新鮮 GPS，延長需要明確時間，安全下山需要確認全隊狀態。LINE 對話支援這些操作列為後續功能，不納入本次範圍。

## 行程辨識與授權

LINE Webhook 先驗證 `x-line-signature`，再使用事件來源的 `source.userId` 對應 HikeSafe `users.lineUserId`。後端只允許該使用者所屬的 active trip 寫入 check-in 或發出求助，不接受訊息內自行提供的 user ID。

- 沒有對應 HikeSafe 使用者時，回覆雙語登入提示，不寫入資料。
- 沒有 active trip 時，回覆雙語提示並提供 LIFF 入口，不寫入資料。
- 有多個 active trip 時，顯示行程摘要與雙語選擇按鈕；postback 的 trip ID 仍必須在伺服器重新驗證成員資格與 active 狀態。
- 綁定指令 `綁定 ABC123` 維持現有行為。
- 使用 LINE webhook event ID 作為 idempotency key，避免 LINE 重送造成重複回報或重複求助。

## 雙語訊息設計

新增共用訊息字典與雙語格式化方法，供 React UI、LINE Webhook 回覆、LINE 通知卡片與錯誤訊息共用。顯示格式固定為中文在上、英文在下：

```text
中文文字
English text
```

本次翻譯範圍包含：

- LIFF 頁面標題、按鈕、欄位、提示與錯誤訊息
- LINE Quick Reply 標籤與回覆訊息
- 開始、延長、求助、完成、預計下山與逾時通知卡片
- 授權、登入、綁定與無 active trip 等系統提示

路線名稱、山名、地區、官方來源與許可備註維持資料原文；使用者自行輸入的回報內容、隊伍名稱與緊急資料不自動翻譯。Quick Reply 標籤使用精簡雙語文字，以符合 LINE 20 字元標籤限制。

## 資料與 API

不新增資料庫 migration。重用既有：

- `recordCheckIn`
- `requestHelp`
- `check_ins`
- `alert_events`
- `idempotency_keys`

擴充 LINE message model，使回覆可攜帶 Quick Reply；擴充 Webhook event parser，使其可處理 text、postback 與 location message。新增 LINE 對話服務負責：以 LINE user ID 找出 active trip、處理多行程選擇、組合 idempotency key，以及呼叫既有 trip commands。

LINE reply API 保持使用 webhook 的 reply token。postback 內可能帶行程識別值，但該值一律視為不可信；伺服器必須重新驗證 LINE user ID、行程成員資格與 active 狀態，不在訊息中暴露授權資訊或秘密。

## 失敗行為

- Webhook 簽章無效：回傳 401，不處理事件。
- 不支援的事件型別：忽略並回傳 200，避免 LINE 重試無效事件。
- 使用者不是行程成員：回覆無權限雙語訊息，不寫入資料。
- postback 對應的行程已完成或取消：回覆行程已不可回報，不寫入資料。
- LINE 回覆失敗：記錄不含秘密的錯誤；資料庫 command 的冪等結果仍保持一致。
- 重複 webhook event：回傳原本結果，不新增第二筆 check-in 或 alert event。
- 平安回報成功後不推播留守人；求助確認成功後才進入現有通知佇列。

## 範圍與限制

- 本次只新增 LINE 對話回報、Quick Reply 與全功能文字雙語化。
- 不新增 Rich Menu。
- 不將一般聊天文字自動判斷為回報。
- 不將所有路線資料或使用者輸入自動翻譯。
- 不改變既有的留守授權、通知排程、逾時判斷與安全語意。

## 驗收與測試

- `回報` 會回覆雙語 Quick Reply，且按鈕包含對應 icon/action。
- 「平安」與「已到山屋」只新增 check-in，不新增通知事件。
- 位置 action 會新增含位置的 check-in。
- 「需要協助」第一次點選不通知；確認後才建立一筆 help alert event。
- 非成員、無 active trip、多 active trip 與已完成行程都會得到正確雙語提示，且不越權寫入。
- LINE webhook 簽章驗證與綁定指令既有測試持續通過。
- 重複 webhook event 不會產生重複 check-in 或求助通知。
- 現有 LINE 通知卡片、LIFF 頁面與錯誤提示均保留繁體中文並附英文翻譯。
- 執行 `npm test` 與 `npm run build`。
