# HikeSafe Phase 3｜LINE-first 補完 設計

日期：2026-07-21
狀態：已與使用者逐節確認
上游：`docs/superpowers/specs/2026-07-19-line-first-ux-redesign-design.md` §1、§7（Phase 3）

## 背景

Phase 1（UI 設計系統，107ae7b）與 Phase 2（連結式留守人邀請，6b78fa7）皆已合併 master。Phase 3 是三期規劃的最後一期：讓登山客能**全程在 LINE 內**完成行程生命週期，不必面對 Vercel 網址。

本設計對照 master 現況重新盤點，**未沿用 07-19 spec §7 的細項**——該節寫於 Phase 1／2 實作之前，屬預測性質，本次核對後發現多處與現況不符（見「對上游 spec 的六項修正」）。

## 範圍

### 納入

1. Rich menu 佈建腳本（2×3 六格）
2. 聊天內**開始行程**（摘要卡 postback → 位置 quick reply → 位置訊息完成開始）
3. 聊天內**延長下山時間**（文字「延長」→ quick reply 30／60／120）
4. 聊天內**結束行程**（文字「平安下山」「結束行程」→ 確認 quick reply）
5. 建立行程後推播給登山客的**行程摘要 Flex 卡**（含「開始行程」按鈕）
6. **「說明」**使用說明回覆

### 排除（07-19 spec 列入 Phase 3，但現況已完成）

- 留守人端生命週期 Flex 卡（started／extended／help／finished／due／overdue_60／overdue_120）——`src/features/line/messages.ts:139` `buildLineMessage` 已完整實作，經 `src/features/alerts/process.ts` 推播。
- Guardian viewer 頁視覺——Phase 1 已套用設計系統（913ffbd）。
- 聊天內回報平安／需要協助——`src/features/line/conversation.ts` 已實作。
- `NEXT_PUBLIC_LINE_OA_URL` env——Phase 2 已加入 `src/env.ts:12`。

### 非目標

- 不改動警示排程、retention、offline queue 的行為。
- 不做背景追蹤、導航、自動求援。
- 不改動路線目錄資料與驗證流程。
- 群組綁定流程（「綁定 CODE」）不變。

## 對上游 spec 的六項修正

| # | 上游 spec 假設 | 現況 | 本設計採取 |
| --- | --- | --- | --- |
| 1 | start postback 沿用現有授權檢查即可 | `listActiveTripsForMember`（`conversation.ts:72`）只查 `status='active'`，draft 行程永遠不在清單內；且 `conversation.ts:121` 在 postback 處理**之前**就以 `copy.noActiveTrip` 提早返回 | 新增 `listDraftTripsForMember`，並重排 routing 順序 |
| 2 | start 需要 GPS 是硬性安全需求 | `startTrip`（`commands.ts:168-181`）驗證後**未儲存** location——無 `insertCheckIn`，純粹是防誤觸閘門 | 放寬為接受 `CheckInLocation`（含 LINE 定位），location 仍為必填 |
| 3 | start postback「無 GPS」即可開始，之後再以 quick reply 邀請傳位置 | location 為必填，postback 不帶位置，無法成立 | 改為兩段式：postback → 位置 quick reply → 位置訊息才真正開始 |
| 4 | —（未討論） | 位置訊息目前一律視為打卡 | 新增「無進行中行程時，位置訊息開始唯一的 draft 行程」規則，**進行中行程優先**，現有行為零變更 |
| 5 | —（未討論） | `start/route.ts:7` 的 zod 允許 `source: 'network'`，但 `assertGps` 拒絕之——潛在的混淆 422 | 一併修正：`assertGps` 移除，改用 `assertCheckInLocation` |
| 6 | 「延長 N 分鐘」語意未定義 | 網頁 `TripActions.tsx:110` 用 `now + N`；當預計下山時間尚遠時 `commands.ts:212` 會拒絕 | 網頁與聊天**一致**改為 `plannedFinishAt + N` |

## 1. 聊天內行程生命週期

### Postback 文法

沿用 `hikesafe:` 前綴：

| Postback | 行為 |
| --- | --- |
| `hikesafe:start:{tripId}:confirm` | 回一則位置 quick reply，邀請傳送位置 |
| `hikesafe:start:{tripId}:cancel` | 不回覆（同現有 help cancel） |
| `hikesafe:extend:{tripId}:{30\|60\|120}` | 直接延長（不二次確認，與網頁點按即生效一致） |
| `hikesafe:finish:{tripId}:confirm` | 結束行程（不帶位置） |
| `hikesafe:finish:{tripId}:cancel` | 不回覆 |

授權：`start` 比對 draft 行程清單，其餘比對 active 行程清單；不符一律回現有的 `unavailableTrip` 文案。`idempotencyKey` 一律為 webhook event id（沿用現有 check-in 模式）。

### 文字觸發

| 文字 | 行為 |
| --- | --- |
| `延長` | 單一進行中行程 → 30／60／120 quick reply；多筆 → 帶 `extend` 意圖的行程選擇器 |
| `平安下山`、`結束行程` | 單一進行中行程 → 確認／取消 quick reply；多筆 → 帶 `finish` 意圖的行程選擇器 |
| `說明` | 回使用說明文字 |

### 行程選擇器需攜帶意圖（順帶修正既有缺陷）

現行 `buildTripChooser` 產生的 postback 一律是 `hikesafe:trip:{tripId}:select`，而該 postback 的處理（`conversation.ts:155`）**固定回傳打卡提示**。因此多筆行程時：

- 使用者輸入「需要協助」→ 拿到行程選擇器 → 選了行程 → 卻收到打卡提示。這是**現存缺陷**，非本期引入；求助情境下尤其危險。
- 若本期沿用同一個選擇器，「延長」「平安下山」會踩到同一個坑。

因此將文法一般化為 `hikesafe:trip:{tripId}:{select|extend|finish|help}`（`select` 維持既有線上格式與打卡語意，不變），`buildTripChooser(trips, intent)` 依意圖產生對應 postback，處理端據此回傳對應提示。既有 help 缺陷一併修正。

### Routing 順序（`handleLineConversation` 重排）

現有的「先 `activeTrips.length === 0` 就返回」會擋掉 start，必須拆解：

1. `說明` → 直接回覆，**不做任何 DB 查詢**（未註冊使用者也可用）
2. 解析使用者；查無 → `copy.authenticationError`
3. 同時載入 `activeTrips` 與 `draftTrips`
4. 位置訊息 → 見下方判定表
5. postback → 依類型比對對應清單
6. 文字觸發 → 各分支自行處理「無進行中行程」

`copy.noActiveTrip` 由原本的單一提早返回，下放到各需要它的分支。

### 位置訊息判定（進行中行程優先，現有行為零變更）

| activeTrips | draftTrips | 行為 |
| --- | --- | --- |
| 1 | 任意 | 對該行程打卡（**現有行為，不變**） |
| >1 | 任意 | `ambiguousLocation` ＋ 行程選擇器（**現有行為，不變**） |
| 0 | 1 | **開始**該 draft 行程 |
| 0 | >1 | 回「多筆待開始行程，請開啟行程頁選擇」 |
| 0 | 0 | `copy.noActiveTrip`（**現有行為，不變**） |

此規則不引入任何對話狀態儲存。

### 延長基準

聊天與網頁一致採 `plannedFinishAt + N`：

- 聊天：`ActiveLineTrip.plannedFinishAt` 已可取得，直接計算。
- 網頁：`TripActions.tsx` 的 `extend()` 改以 `plannedFinishAt` 為基準；並須將 `plannedFinishAt` 納入 component state，於延長成功後更新——否則連續兩次延長會以過期的初始值計算。

## 2. 領域層調整

`src/features/trips/commands.ts`：

- `StartTripCommand.location` 型別由 `LocationFix` 改為 `CheckInLocation`（仍為必填）。
- `startTrip` 內 `assertGps(...)` 改為 `assertCheckInLocation(...)`。
- 移除 `assertGps`（`commands.ts:94`，變更後無其他使用者）。

其餘不動：`assertStatus(trip, 'draft')`、deputy 檢查、alert schedule、lifecycle notification 全部維持。

## 3. Rich menu

`src/features/line/rich-menu.ts`（純函式，可測）：

- `buildRichMenuSvg()` → SVG 字串
- `buildRichMenuPayload(liffId)` → rich menu 物件

`scripts/line/setup-rich-menu.ts`（IO 外殼）：SVG → `sharp` → 2500×1686 PNG → Messaging API 建立／上傳／設為預設。可重複執行（先刪除同名 `hikesafe-main`）。`--dry-run` 只把 PNG 與 payload JSON 寫到 gitignored 輸出目錄，不呼叫任何 API。

**2 欄 × 3 列**，每格 1250×562（2500÷2＝1250、1686÷3＝562，皆整除；3 欄會得到 833.33 的非整數寬度）：

| 位置 | 標籤 | Action |
| --- | --- | --- |
| 左上 `(0,0)` | 建立行程 | uri `https://liff.line.me/{LIFF_ID}/trips/new` |
| 右上 `(1250,0)` | 進行中行程 | uri `.../trips/active` |
| 左中 `(0,562)` | 回報平安 | message `回報` |
| 右中 `(1250,562)` | 我的留守人 | uri `.../guardians` |
| 左下 `(0,1124)` | 需要協助 | message `需要協助` |
| 右下 `(1250,1124)` | 使用說明 | message `說明` |

配色沿用 Phase 1 tokens：主色 `#06C755`、底 `#F7F8FA`、卡片 `#FFFFFF`、主文字 `#111827`、次要 `#8B8F98`；「需要協助」格用危險色 `#D93025`。

Messaging API 呼叫以原生 `fetch` 手寫，與 `src/integrations/line/client.ts` 及 webhook 既有做法一致。（註：`@line/bot-sdk` 已在 dependencies 但**全 repo 無任何引用**，本次不動它，另行決定是否移除。）

## 4. 行程摘要卡

`src/features/line/trip-summary.ts`：

- `buildTripSummaryCard(trip)` → Flex bubble：路線名稱、預計下山時間、隊伍、留守人數；footer 兩顆按鈕——「開始行程」postback `hikesafe:start:{tripId}:confirm`、「開啟行程頁」LIFF uri（推播成功但使用者想走網頁時的備援）。
- `pushTripSummary({ tripId, ownerUserId }, repository?)` → 自行查詢 `users.lineUserId`、路線名稱、預計下山時間、隊伍與留守人數，呼叫 `pushLineMessage`，`idempotencyKey` 用 `tripId`（穩定重試鍵）。任何失敗只 `console.error`，不向外拋。

呼叫點：`app/api/trips/route.ts` 的 `handleCreateTrip`，在 `createTrip` 成功返回**之後**、回 201 之前。**不得置於 transaction 內**，且不得使建立行程請求失敗。

## 5. 檔案結構與拆分

`conversation.ts` 現為 213 行，加入本期功能後將達約 400 行；`messages.ts` 現為 190 行，混合了留守人警示卡與登山客對話提示兩種職責。拆分如下：

| 檔案 | 職責 |
| --- | --- |
| `src/features/line/postback.ts`（新增） | `hikesafe:` postback 文法解析，純函式回 discriminated union |
| `src/features/line/prompts.ts`（新增） | 登山客對話提示建構器：現有 `buildCheckInPrompt`／`buildTripChooser`／`buildHelpConfirmation` 移入，加上新增的 extend／finish／start location／usage |
| `src/features/line/messages.ts`（保留） | 留守人警示 Flex 卡（`buildLineMessage`）與共用型別（`LineMessage`／`LineQuickReply`／`LineTripChoice`） |
| `src/features/line/rich-menu.ts`（新增） | Rich menu SVG 與 payload 建構器 |
| `src/features/line/trip-summary.ts`（新增） | 行程摘要卡與推播 |
| `src/features/line/conversation.ts`（修改） | 純 routing orchestrator |
| `scripts/line/setup-rich-menu.ts`（新增） | Rich menu 佈建 CLI |

移動 `buildCheckInPrompt`／`buildTripChooser`／`buildHelpConfirmation` 只影響 `conversation.ts`、`tests/features/line-messages.test.ts`、`tests/integration/line-conversation.test.ts` 三處 import，一併更新，不留 re-export shim。

其他修改：`src/features/trips/commands.ts`、`app/api/trips/route.ts`、`app/trips/[tripId]/TripActions.tsx`、`src/features/i18n/copy.ts`、`package.json`（新增 `sharp` devDependency 與 `line:rich-menu` script）、`.gitignore`（rich menu 輸出目錄）。

## 6. 錯誤處理

- 所有新增文案走 `src/features/i18n/copy.ts` 的 `bilingual()` 雙語模式。
- postback 授權失敗沿用既有 `unavailableTrip`；start／extend／finish 各有專屬失敗文案。
- 領域層例外一律轉為使用者可讀訊息，不外洩內部錯誤字串。
- 聊天開始行程失敗的兩個可預期原因須給可行動指引，不能只回通用錯誤：多人行程尚未指派副領隊（`commands.ts:177`）→ 指引開啟行程頁指派；位置逾時或不在台灣範圍 → 指引重新傳送目前位置。
- 摘要卡推播失敗對使用者靜默（多半是尚未加 OA 好友），server 端 `console.error` 記錄完整 context。
- 位置訊息在多筆 draft 時給明確下一步（開啟行程頁），不留死路。

## 7. 測試策略

TDD，vitest ＋ repository fakes，沿用現有模式。指令一律為：

```
npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"
```

master 現行基準：48 files ／ 283 tests 全綠。

涵蓋項目：

- `postback.ts`：各文法的解析與拒絕（單元）。
- `conversation.ts`：三個新 postback 的授權與成功路徑、三個新文字觸發、`說明` 在無使用者時仍可回覆、位置判定表五種組合、routing 順序不破壞既有行為、開始失敗兩種可預期原因各自的指引文案。
- 行程選擇器意圖：四種意圖（`select`／`extend`／`finish`／`help`）各自導向正確提示；其中 `help` 是既有缺陷的迴歸測試。
- `commands.ts`：`startTrip` 接受 LINE 定位、拒絕逾時與台灣範圍外座標；`extendTrip` 的 `plannedFinishAt + N` 迴歸測試。
- `TripActions.tsx`：延長基準改動的迴歸測試，含連續兩次延長需以更新後的時間計算。
- `rich-menu.ts`：payload 與 SVG 快照測試。
- `trip-summary.ts`：卡片建構器；推播失敗被吞掉且不影響建立行程回應。
- `app/api/trips/route.ts`：建立行程成功時觸發推播、推播失敗仍回 201。

變更模組覆蓋率目標 80%+（`--cov` 範圍限變更檔案）。

## 8. 測試慣例（Phase 2 實作中發現，務必遵守）

- 本 repo **沒有** `@testing-library/user-event`，React 元件測試一律用 `fireEvent`。
- jest-dom 的 `toHaveTextContent` 不會正規化比對字串，對含字面 `\n` 的 `bilingual()` 文案永遠比不中——請用逐字 `.textContent` 比對。
- `vitest.config.ts` 未開 `test.globals: true`，RTL 自動 cleanup 不會註冊；含多個 `it()` 的元件測試檔案必須手動 `afterEach(cleanup)`。

## 9. 其他全域約束

- 不使用 `window.prompt`／`confirm`／`alert`。
- 生產程式碼不留 `console.log`（`console.error` 用於伺服器端錯誤記錄可）。
- 函式 <50 行、檔案 <800 行、巢狀 ≤4 層。
- 不硬編秘密；新增設定走 env 或常數。
- 沿用既有 repository-fake 依賴注入模式，不引入新的測試框架或 mock 函式庫。

## 10. 營運前置作業（實作完成後由操作者執行）

1. 執行 `npm run line:rich-menu -- --dry-run` 檢視產出的 PNG 與 payload。
2. 執行 `npm run line:rich-menu` 佈建並設為預設 rich menu。
3. 確認 LIFF endpoint 指向部署網址、size 設定 Full。
4. 確認 LINE Login channel 的 bot link（`bot_prompt`）已連結 Messaging API channel，使建立行程後的摘要卡推播可送達。

（07-19 spec §8 的 shareTargetPicker scope 與 OA 加好友連結兩項已於 Phase 2 完成。）
