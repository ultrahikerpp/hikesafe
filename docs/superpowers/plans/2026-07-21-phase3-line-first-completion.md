# Phase 3｜LINE-first 補完 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓登山客能全程在 LINE 內完成行程生命週期（建立、開始、延長、結束、回報、求助），不必面對 Vercel 網址。

**Architecture:** 把 `src/features/line/` 從兩個混職責檔案拆成職責分明的模組——`prompts.ts`（登山客對話提示建構器）、`postback.ts`（postback 文法解析）、`messages.ts`（留守人警示卡）、`rich-menu.ts`、`trip-summary.ts`——`conversation.ts` 退回成純 routing orchestrator。領域層放寬 `startTrip` 的定位來源限制，使 LINE 位置訊息可用於開始行程。

**Tech Stack:** Next.js 16 (App Router)、React 19、drizzle-orm 0.45.2、zod 4、vitest 4 ＋ @testing-library/react（jsdom）、tsx（腳本）、sharp（僅腳本用，本期新增）

**Spec:** `docs/superpowers/specs/2026-07-21-phase3-line-first-completion-design.md`

## Global Constraints

- 測試指令一律為 `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`。裸 `npm test` 會撈到無關的 nested worktree 與需要 Postgres 的整合測試。
- master 起始基準：**48 files ／ 283 tests 全綠**。任何 task 結束時不得低於此數且不得有失敗。
- 本 repo **沒有** `@testing-library/user-event`；React 元件測試一律用 `fireEvent`。
- jest-dom 的 `toHaveTextContent` **不會**正規化比對字串，對含字面 `\n` 的 `bilingual()` 文案永遠比不中——請用逐字 `.textContent` 比對。
- `vitest.config.ts` 未開 `test.globals: true`，RTL 自動 cleanup 不會註冊；含多個 `it()` 的元件測試檔案**必須**手動 `afterEach(cleanup)`。
- 雙語文案一律用 `bilingual(chinese, english)`（`src/features/i18n/copy.ts`），其實作為 `chinese + '\n' + english`。
- 新增的 LINE 端字串放在使用它的模組內作為 module const（比照 `messages.ts`／`conversation.ts` 既有寫法）；已存在於 `copy.ts` 的鍵一律沿用，不重複定義。
- LINE quick reply 的 action label 上限 **20 字元**；新增選項必須符合，既有測試 `every(label.length <= 20)` 會把關。
- 不使用 `window.prompt`／`confirm`／`alert`。
- 生產程式碼不留 `console.log`；伺服器端錯誤用 `console.error` 記錄完整 context。
- 函式 <50 行、檔案 <800 行、巢狀 ≤4 層。
- 不引入新的測試框架或 mock 函式庫；沿用既有 repository-fake 依賴注入模式。
- 每個 task 結束都要 commit，commit 訊息格式 `<type>: <description>`（type ∈ feat/fix/refactor/docs/test/chore），**不加** Co-Authored-By。
- 全程在專用分支上作業，不直接commit 到 master。

## File Structure

| 檔案 | 職責 | Task |
| --- | --- | --- |
| `src/features/line/prompts.ts`（新增） | 登山客對話提示建構器（check-in／chooser／help／extend／finish／start location／usage） | 1 |
| `src/features/line/postback.ts`（新增） | `hikesafe:` postback 文法解析，純函式 | 2 |
| `src/features/line/messages.ts`（瘦身） | 留守人警示 Flex 卡 `buildLineMessage` ＋ 共用型別 | 1 |
| `src/features/line/conversation.ts`（改寫） | 純 routing orchestrator | 2,3,5,6,7,8 |
| `src/features/trips/commands.ts`（修改） | 放寬 `startTrip` 定位來源 | 4 |
| `app/trips/[tripId]/TripActions.tsx`（修改） | 延長基準改為 `plannedFinishAt + N` | 9 |
| `src/features/line/trip-summary.ts`（新增） | 行程摘要卡建構器＋推播 | 10 |
| `app/api/trips/route.ts`（修改） | 建立行程後觸發摘要卡推播 | 10 |
| `src/features/line/rich-menu.ts`（新增） | Rich menu SVG 與 payload 建構器 | 11 |
| `scripts/line/setup-rich-menu.ts`（新增） | Rich menu 佈建 CLI | 11 |

**任務排序理由：** Task 1 一次建好所有提示建構器（純函式、無相依），使後續 routing 任務不需前向參照；Task 2 一次定義完整 postback 文法（單一規格產物，拆成四次會變成同一個 60 行檔案被審四遍）；Task 4 的領域層放寬必須早於 Task 8 的聊天開始行程。

---

### Task 1: 抽出 `prompts.ts` 並補齊所有對話提示建構器

把三個既有建構器從 `messages.ts` 移入新的 `prompts.ts`，並補上本期需要的四個新建構器。`buildTripChooser` 新增 `intent` 參數。純函式，無 DB、無網路。

**Files:**
- Create: `src/features/line/prompts.ts`
- Modify: `src/features/line/messages.ts`（移除 `LineTripChoice`、`postback`、`conciseLabel`、`buildCheckInPrompt`、`buildTripChooser`、`buildHelpConfirmation`，即現行 30-33、60-61、63-103 行）
- Modify: `src/features/line/conversation.ts:5-10`（import 來源改為 `prompts`）
- Create: `tests/features/line-prompts.test.ts`
- Modify: `tests/features/line-messages.test.ts`（移除已搬走的四個 it，調整 import）
- Modify: `tests/integration/line-conversation.test.ts:8`（import 來源改為 `prompts`）

**Interfaces:**
- Consumes: `LineMessage`、`LineQuickReplyAction`（`src/features/line/messages.ts`，維持匯出）；`bilingual`（`src/features/i18n/copy.ts`）
- Produces:
  - `export type TripChooserIntent = 'select' | 'extend' | 'finish' | 'help'`
  - `export interface LineTripChoice { id: string; routeName: string }`
  - `buildCheckInPrompt(input: { tripId: string; includeLocation: boolean }): LineMessage`
  - `buildTripChooser(trips: LineTripChoice[], intent?: TripChooserIntent): LineMessage`（`intent` 預設 `'select'`）
  - `buildHelpConfirmation(tripId: string): LineMessage`
  - `buildExtendPrompt(tripId: string): LineMessage`
  - `buildFinishConfirmation(tripId: string): LineMessage`
  - `buildStartLocationPrompt(): LineMessage`
  - `buildUsageReply(): LineMessage`

- [ ] **Step 1: 建立 `tests/features/line-prompts.test.ts` 失敗測試**

```ts
import { describe, expect, it } from 'vitest';

import {
  buildCheckInPrompt,
  buildExtendPrompt,
  buildFinishConfirmation,
  buildHelpConfirmation,
  buildStartLocationPrompt,
  buildTripChooser,
  buildUsageReply,
} from '@/src/features/line/prompts';

const labelsWithin20 = (message: { quickReply?: { items: Array<{ action: { label: string } }> } }) =>
  message.quickReply?.items.every(({ action }) => Array.from(action.label).length <= 20) ?? true;

describe('line prompts', () => {
  it('builds a bilingual check-in prompt with concise typed Quick Reply actions', () => {
    const prompt = buildCheckInPrompt({ tripId: 'trip-1', includeLocation: true });

    expect(prompt).toMatchObject({
      type: 'text',
      text: expect.stringMatching(/\n/),
      quickReply: {
        items: expect.arrayContaining([
          { type: 'action', action: { type: 'location', label: '📍 傳送位置\nSend location' } },
          { type: 'action', action: { type: 'postback', label: '✅ 平安\nSafe', data: 'hikesafe:check-in:trip-1:safe' } },
          { type: 'action', action: { type: 'postback', label: '🏠 已到山屋\nAt shelter', data: 'hikesafe:check-in:trip-1:shelter' } },
        ]),
      },
    });
    expect(labelsWithin20(prompt)).toBe(true);
    expect(buildCheckInPrompt({ tripId: 'trip-1', includeLocation: false }).quickReply?.items
      .some(({ action }) => action.type === 'location')).toBe(false);
  });

  it('defaults the trip chooser to the check-in intent', () => {
    const chooser = buildTripChooser([
      { id: 'trip-1', routeName: '玉山主峰線' },
      { id: 'trip-2', routeName: '雪山東峰線' },
    ]);

    expect(chooser.text).toMatch(/\n/);
    expect(chooser.quickReply?.items).toEqual([
      { type: 'action', action: { type: 'postback', label: '玉山主峰線', data: 'hikesafe:trip:trip-1:select' } },
      { type: 'action', action: { type: 'postback', label: '雪山東峰線', data: 'hikesafe:trip:trip-2:select' } },
    ]);
    expect(chooser.quickReply?.items.some(({ action }) => action.type === 'location')).toBe(false);
    expect(labelsWithin20(chooser)).toBe(true);
  });

  it('carries the requested intent into every chooser postback', () => {
    for (const intent of ['extend', 'finish', 'help'] as const) {
      const chooser = buildTripChooser([{ id: 'trip-1', routeName: '玉山主峰線' }], intent);
      expect(chooser.quickReply?.items).toEqual([
        { type: 'action', action: { type: 'postback', label: '玉山主峰線', data: `hikesafe:trip:trip-1:${intent}` } },
      ]);
    }
  });

  it('gives each chooser intent its own bilingual prompt text', () => {
    const texts = (['select', 'extend', 'finish', 'help'] as const)
      .map((intent) => buildTripChooser([{ id: 'trip-1', routeName: '玉山主峰線' }], intent).text);

    expect(new Set(texts).size).toBe(4);
    for (const text of texts) expect(text).toMatch(/\n/);
  });

  it('uses a bilingual text-only web fallback for 14 active trips', () => {
    const chooser = buildTripChooser(Array.from({ length: 14 }, (_, index) => ({
      id: `trip-${index + 1}`,
      routeName: `行程 ${index + 1}`,
    })));

    expect(chooser.type).toBe('text');
    expect(chooser.text).toMatch(/請開啟 HikeSafe 網頁.*\n.*Open HikeSafe on the web/s);
    expect(chooser.quickReply).toBeUndefined();
  });

  it('builds a bilingual help confirmation with explicit confirm and cancel actions', () => {
    const confirmation = buildHelpConfirmation('trip-1');

    expect(confirmation).toMatchObject({
      type: 'text',
      text: expect.stringMatching(/\n/),
      quickReply: {
        items: [
          { type: 'action', action: { type: 'postback', label: '確認求助\nConfirm', data: 'hikesafe:help:trip-1:confirm' } },
          { type: 'action', action: { type: 'postback', label: '取消\nCancel', data: 'hikesafe:help:trip-1:cancel' } },
        ],
      },
    });
  });

  it('offers exactly the three supported extension lengths', () => {
    const prompt = buildExtendPrompt('trip-1');

    expect(prompt.text).toMatch(/\n/);
    expect(prompt.quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined)).toEqual([
      'hikesafe:extend:trip-1:30',
      'hikesafe:extend:trip-1:60',
      'hikesafe:extend:trip-1:120',
    ]);
    expect(labelsWithin20(prompt)).toBe(true);
  });

  it('builds a bilingual finish confirmation with confirm and cancel actions', () => {
    const confirmation = buildFinishConfirmation('trip-1');

    expect(confirmation.text).toMatch(/\n/);
    expect(confirmation.quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined)).toEqual([
      'hikesafe:finish:trip-1:confirm',
      'hikesafe:finish:trip-1:cancel',
    ]);
    expect(labelsWithin20(confirmation)).toBe(true);
  });

  it('asks for a location with only a location action when starting a trip', () => {
    const prompt = buildStartLocationPrompt();

    expect(prompt.text).toMatch(/\n/);
    expect(prompt.quickReply?.items).toEqual([
      { type: 'action', action: { type: 'location', label: '📍 傳送位置\nSend location' } },
    ]);
  });

  it('lists every supported chat command in the usage reply', () => {
    const usage = buildUsageReply();

    expect(usage.type).toBe('text');
    for (const command of ['回報', '延長', '平安下山', '需要協助', '說明']) {
      expect(usage.text).toContain(command);
    }
    expect(usage.text).toMatch(/\n/);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-prompts.test.ts`
Expected: FAIL — `Failed to resolve import "@/src/features/line/prompts"`

- [ ] **Step 3: 建立 `src/features/line/prompts.ts`**

```ts
import { bilingual } from '@/src/features/i18n/copy';
import type { LineMessage, LineQuickReplyAction } from '@/src/features/line/messages';

export interface LineTripChoice {
  id: string;
  routeName: string;
}

export type TripChooserIntent = 'select' | 'extend' | 'finish' | 'help';

const postback = (label: string, data: string): LineQuickReplyAction => ({ type: 'postback', label, data });
const conciseLabel = (label: string) => Array.from(label).slice(0, 20).join('');

const sendLocationLabel = bilingual('📍 傳送位置', 'Send location');
const cancelLabel = bilingual('取消', 'Cancel');

const chooserText: Record<TripChooserIntent, string> = {
  select: bilingual('請選擇要回報的行程', 'Choose a trip to check in'),
  extend: bilingual('請選擇要延長的行程', 'Choose a trip to extend'),
  finish: bilingual('請選擇要結束的行程', 'Choose a trip to finish'),
  help: bilingual('請選擇需要協助的行程', 'Choose a trip that needs help'),
};

const tooManyTrips = bilingual(
  '行程數量超過 LINE 可顯示的選項，請開啟 HikeSafe 網頁選擇行程。',
  'There are too many trips to show in LINE. Open HikeSafe on the web to choose a trip.',
);

const usageGuide = bilingual(
  [
    'HikeSafe 使用說明',
    '・建立行程：點選單「建立行程」',
    '・開始行程：建立後點摘要卡的「開始行程」，再傳送目前位置',
    '・回報平安：輸入「回報」，或直接傳送位置',
    '・延長下山時間：輸入「延長」',
    '・平安下山：輸入「平安下山」',
    '・需要協助：輸入「需要協助」',
    '・留守人：點選單「我的留守人」邀請或撤銷',
  ].join('\n'),
  [
    'HikeSafe usage',
    '- Create a trip: tap "Create trip" in the menu',
    '- Start a trip: tap "Start trip" on the summary card, then send your location',
    '- Check in: type "回報", or just send your location',
    '- Extend the planned finish: type "延長"',
    '- Finish safely: type "平安下山"',
    '- Need help: type "需要協助"',
    '- Guardians: tap "My guardians" in the menu to invite or revoke',
  ].join('\n'),
);

export const buildCheckInPrompt = ({ tripId, includeLocation }: { tripId: string; includeLocation: boolean }): LineMessage => ({
  type: 'text',
  text: bilingual('請選擇回報內容', 'Choose a check-in'),
  quickReply: {
    items: [
      ...(includeLocation ? [{ type: 'action' as const, action: { type: 'location' as const, label: sendLocationLabel } }] : []),
      { type: 'action', action: postback(bilingual('✅ 平安', 'Safe'), `hikesafe:check-in:${tripId}:safe`) },
      { type: 'action', action: postback(bilingual('🏠 已到山屋', 'At shelter'), `hikesafe:check-in:${tripId}:shelter`) },
    ],
  },
});

export const buildTripChooser = (trips: LineTripChoice[], intent: TripChooserIntent = 'select'): LineMessage => {
  if (trips.length > 13) return { type: 'text', text: tooManyTrips };
  return {
    type: 'text',
    text: chooserText[intent],
    quickReply: {
      items: trips.map((trip) => ({
        type: 'action',
        action: postback(conciseLabel(trip.routeName), `hikesafe:trip:${trip.id}:${intent}`),
      })),
    },
  };
};

export const buildHelpConfirmation = (tripId: string): LineMessage => ({
  type: 'text',
  text: bilingual('需要協助？確認後會通知留守人。', 'Need help? Confirm to notify guardians.'),
  quickReply: {
    items: [
      { type: 'action', action: postback(bilingual('確認求助', 'Confirm'), `hikesafe:help:${tripId}:confirm`) },
      { type: 'action', action: postback(cancelLabel, `hikesafe:help:${tripId}:cancel`) },
    ],
  },
});

export const buildExtendPrompt = (tripId: string): LineMessage => ({
  type: 'text',
  text: bilingual('要延長多久？時間會加在原本的預計下山時間上。', 'How long to extend? The time is added to the current planned finish.'),
  quickReply: {
    items: [30, 60, 120].map((minutes) => ({
      type: 'action',
      action: postback(bilingual(`+${minutes} 分`, `+${minutes} min`), `hikesafe:extend:${tripId}:${minutes}`),
    })),
  },
});

export const buildFinishConfirmation = (tripId: string): LineMessage => ({
  type: 'text',
  text: bilingual('確認全隊已安全下山？確認後會通知留守人。', 'Confirm everyone is safely down? Guardians will be notified.'),
  quickReply: {
    items: [
      { type: 'action', action: postback(bilingual('確認下山', 'Confirm'), `hikesafe:finish:${tripId}:confirm`) },
      { type: 'action', action: postback(cancelLabel, `hikesafe:finish:${tripId}:cancel`) },
    ],
  },
});

export const buildStartLocationPrompt = (): LineMessage => ({
  type: 'text',
  text: bilingual('請傳送目前位置以開始行程。', 'Send your current location to start the trip.'),
  quickReply: {
    items: [{ type: 'action', action: { type: 'location', label: sendLocationLabel } }],
  },
});

export const buildUsageReply = (): LineMessage => ({ type: 'text', text: usageGuide });
```

- [ ] **Step 4: 從 `messages.ts` 移除已搬走的成員**

刪除 `src/features/line/messages.ts` 的這些區塊：`LineTripChoice` 介面（30-33 行）、`postback` 與 `conciseLabel` 兩個 const（60-61 行）、`buildCheckInPrompt`（63-73 行）、`buildTripChooser`（75-92 行）、`buildHelpConfirmation`（94-103 行）。

`LineMessage`、`LineQuickReply`、`LineQuickReplyAction`、`AlertMessageTrip`、`buildLineMessage`、`formatTime` 等其餘內容全部保留不動。刪除後 `messages.ts` 內不得殘留對 `postback`／`conciseLabel` 的參照（`buildLineMessage` 用的是自己的 `card` helper，不受影響）。

- [ ] **Step 5: 更新 `conversation.ts` 的 import**

把 `src/features/line/conversation.ts:5-10` 改為：

```ts
import {
  buildCheckInPrompt,
  buildHelpConfirmation,
  buildTripChooser,
} from '@/src/features/line/prompts';
import type { LineMessage } from '@/src/features/line/messages';
```

- [ ] **Step 6: 更新兩個既有測試檔的 import**

`tests/integration/line-conversation.test.ts:8` 改為：

```ts
import { buildCheckInPrompt } from '@/src/features/line/prompts';
import type { LineMessage } from '@/src/features/line/messages';
```

`tests/features/line-messages.test.ts:3` 改為：

```ts
import { buildLineMessage } from '@/src/features/line/messages';
```

並刪除該檔中已搬到 `line-prompts.test.ts` 的四個測試：`'builds a bilingual check-in prompt with concise typed Quick Reply actions'`、`'builds a bilingual trip chooser without a location action for ambiguous trips'`、`'uses a bilingual text-only web fallback for 14 active trips'`、`'builds a bilingual help confirmation with explicit confirm and cancel actions'`。保留 `buildLineMessage` 的所有測試。

- [ ] **Step 7: 執行測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，總數應為 49 files ／ 289 tests（283 − 4 移出 ＋ 10 新增；`line-prompts.test.ts` 是新檔案，故檔案數 +1）。若檔案數或測試數與預期不符，先確認是否漏刪 `line-messages.test.ts` 的舊測試。

- [ ] **Step 8: 型別檢查**

Run: `npx tsc --noEmit 2>&1 | grep -E "^src/features/line" || echo "no type errors in src/features/line"`
Expected: `no type errors in src/features/line`

本 repo 有 53 個既有 tsc 錯誤基準，本任務不必修。此處只檢查 `src/features/line/` 底下的產品程式碼——測試檔對 `LineMessage` 聯集型別做 `messages[0].text`／`.quickReply` 存取本來就會產生 tsc 錯誤（既有測試同樣如此，屬於那 53 個基準的一部分），vitest 以 esbuild 去型別執行不受影響，不要為此改寫測試。

- [ ] **Step 9: Commit**

```bash
git add src/features/line/prompts.ts src/features/line/messages.ts src/features/line/conversation.ts tests/features/line-prompts.test.ts tests/features/line-messages.test.ts tests/integration/line-conversation.test.ts
git commit -m "refactor: split hiker conversation prompts out of line messages"
```

---

### Task 2: `postback.ts` 文法解析模組

把散在 `conversation.ts` 的三個正規式集中成一個完整、可獨立測試的文法解析器，並一次定義完本期需要的全部 postback 種類。

**Files:**
- Create: `src/features/line/postback.ts`
- Modify: `src/features/line/conversation.ts`（移除 61-63 行的三個正規式與 86-95 行 `isSupported` 內的 postback 判斷、146-155 行的比對邏輯，改用解析器）
- Create: `tests/features/line-postback.test.ts`

**Interfaces:**
- Consumes: `TripChooserIntent`（`src/features/line/prompts.ts`）
- Produces:
  - `export type ParsedPostback = { kind: 'check-in'; tripId: string; message: 'safe' | 'shelter' } | { kind: 'help'; tripId: string; action: 'confirm' | 'cancel' } | { kind: 'trip'; tripId: string; intent: TripChooserIntent } | { kind: 'start'; tripId: string; action: 'confirm' | 'cancel' } | { kind: 'extend'; tripId: string; minutes: 30 | 60 | 120 } | { kind: 'finish'; tripId: string; action: 'confirm' | 'cancel' }`
  - `parsePostback(data: string): ParsedPostback | undefined`

- [ ] **Step 1: 建立 `tests/features/line-postback.test.ts` 失敗測試**

```ts
import { describe, expect, it } from 'vitest';

import { parsePostback } from '@/src/features/line/postback';

describe('parsePostback', () => {
  it('parses check-in postbacks', () => {
    expect(parsePostback('hikesafe:check-in:trip-1:safe')).toEqual({ kind: 'check-in', tripId: 'trip-1', message: 'safe' });
    expect(parsePostback('hikesafe:check-in:trip-1:shelter')).toEqual({ kind: 'check-in', tripId: 'trip-1', message: 'shelter' });
  });

  it('parses help postbacks', () => {
    expect(parsePostback('hikesafe:help:trip-1:confirm')).toEqual({ kind: 'help', tripId: 'trip-1', action: 'confirm' });
    expect(parsePostback('hikesafe:help:trip-1:cancel')).toEqual({ kind: 'help', tripId: 'trip-1', action: 'cancel' });
  });

  it('parses every trip chooser intent', () => {
    for (const intent of ['select', 'extend', 'finish', 'help'] as const) {
      expect(parsePostback(`hikesafe:trip:trip-1:${intent}`)).toEqual({ kind: 'trip', tripId: 'trip-1', intent });
    }
  });

  it('parses start postbacks', () => {
    expect(parsePostback('hikesafe:start:trip-1:confirm')).toEqual({ kind: 'start', tripId: 'trip-1', action: 'confirm' });
    expect(parsePostback('hikesafe:start:trip-1:cancel')).toEqual({ kind: 'start', tripId: 'trip-1', action: 'cancel' });
  });

  it('parses the three supported extension lengths as numbers', () => {
    expect(parsePostback('hikesafe:extend:trip-1:30')).toEqual({ kind: 'extend', tripId: 'trip-1', minutes: 30 });
    expect(parsePostback('hikesafe:extend:trip-1:60')).toEqual({ kind: 'extend', tripId: 'trip-1', minutes: 60 });
    expect(parsePostback('hikesafe:extend:trip-1:120')).toEqual({ kind: 'extend', tripId: 'trip-1', minutes: 120 });
  });

  it('parses finish postbacks', () => {
    expect(parsePostback('hikesafe:finish:trip-1:confirm')).toEqual({ kind: 'finish', tripId: 'trip-1', action: 'confirm' });
    expect(parsePostback('hikesafe:finish:trip-1:cancel')).toEqual({ kind: 'finish', tripId: 'trip-1', action: 'cancel' });
  });

  it('rejects unknown, malformed, and unsupported values', () => {
    for (const data of [
      '',
      'hikesafe:unknown:trip-1:confirm',
      'hikesafe:check-in:trip-1:bogus',
      'hikesafe:extend:trip-1:45',
      'hikesafe:trip:trip-1:bogus',
      'hikesafe:check-in::safe',
      'hikesafe:check-in:trip:extra:safe',
      'nothikesafe:check-in:trip-1:safe',
    ]) {
      expect(parsePostback(data)).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-postback.test.ts`
Expected: FAIL — `Failed to resolve import "@/src/features/line/postback"`

- [ ] **Step 3: 建立 `src/features/line/postback.ts`**

```ts
import type { TripChooserIntent } from '@/src/features/line/prompts';

export type ParsedPostback =
  | { kind: 'check-in'; tripId: string; message: 'safe' | 'shelter' }
  | { kind: 'help'; tripId: string; action: 'confirm' | 'cancel' }
  | { kind: 'trip'; tripId: string; intent: TripChooserIntent }
  | { kind: 'start'; tripId: string; action: 'confirm' | 'cancel' }
  | { kind: 'extend'; tripId: string; minutes: 30 | 60 | 120 }
  | { kind: 'finish'; tripId: string; action: 'confirm' | 'cancel' };

const checkInPattern = /^hikesafe:check-in:([^:]+):(safe|shelter)$/;
const helpPattern = /^hikesafe:help:([^:]+):(confirm|cancel)$/;
const tripPattern = /^hikesafe:trip:([^:]+):(select|extend|finish|help)$/;
const startPattern = /^hikesafe:start:([^:]+):(confirm|cancel)$/;
const extendPattern = /^hikesafe:extend:([^:]+):(30|60|120)$/;
const finishPattern = /^hikesafe:finish:([^:]+):(confirm|cancel)$/;

export const parsePostback = (data: string): ParsedPostback | undefined => {
  const checkIn = checkInPattern.exec(data);
  if (checkIn) return { kind: 'check-in', tripId: checkIn[1], message: checkIn[2] as 'safe' | 'shelter' };

  const help = helpPattern.exec(data);
  if (help) return { kind: 'help', tripId: help[1], action: help[2] as 'confirm' | 'cancel' };

  const trip = tripPattern.exec(data);
  if (trip) return { kind: 'trip', tripId: trip[1], intent: trip[2] as TripChooserIntent };

  const start = startPattern.exec(data);
  if (start) return { kind: 'start', tripId: start[1], action: start[2] as 'confirm' | 'cancel' };

  const extend = extendPattern.exec(data);
  if (extend) return { kind: 'extend', tripId: extend[1], minutes: Number(extend[2]) as 30 | 60 | 120 };

  const finish = finishPattern.exec(data);
  if (finish) return { kind: 'finish', tripId: finish[1], action: finish[2] as 'confirm' | 'cancel' };

  return undefined;
};
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run tests/features/line-postback.test.ts`
Expected: PASS（7 tests）

- [ ] **Step 5: 讓 `conversation.ts` 改用解析器（行為不變）**

刪除 `src/features/line/conversation.ts` 的三個正規式 const（`checkInPostback`／`helpPostback`／`tripPostback`，61-63 行），改 import：

```ts
import { parsePostback } from '@/src/features/line/postback';
```

`isSupported` 的 postback 判斷改為：

```ts
const isSupported = (event: LineConversationEvent) => {
  if (event.location) return true;
  if (event.postbackData) return parsePostback(event.postbackData) !== undefined;
  const text = event.text?.trim();
  return text === '需要協助' || text === '求助' || text === '回報' || Boolean(text?.match(/^回報\s+/));
};
```

postback 處理區塊（146-155 行）改為：

```ts
  const postbackData = event.postbackData;
  if (postbackData) {
    const parsed = parsePostback(postbackData);
    if (!parsed || !activeTrips.some((trip) => trip.id === parsed.tripId)) {
      return [textMessage(unavailableTrip)];
    }
    const { tripId } = parsed;
    if (parsed.kind === 'trip') return [buildCheckInPrompt({ tripId, includeLocation: false })];
    if (parsed.kind === 'help' && parsed.action === 'cancel') return [];

    if (parsed.kind === 'help') {
      try {
        await requestHelp({
          tripId,
          userId: user.id,
          message: helpMessage,
          idempotencyKey: event.eventId,
          now: event.now,
        });
        return [textMessage(copy.helpConfirmation())];
      } catch {
        return [textMessage(copy.helpError)];
      }
    }

    if (parsed.kind !== 'check-in') return [textMessage(unavailableTrip)];

    try {
      await recordCheckIn({
        tripId,
        userId: user.id,
        message: parsed.message === 'safe' ? safeMessage : shelterMessage,
        idempotencyKey: event.eventId,
        now: event.now,
      });
      return [textMessage(copy.checkInSuccess())];
    } catch {
      return [textMessage(checkInError)];
    }
  }
```

註：`start`／`extend`／`finish` 三種 kind 此時尚未接線，會落到 `parsed.kind !== 'check-in'` 的 `unavailableTrip`。使用者此刻無法產生這些 postback（沒有任何提示會發出它們），Task 5-8 會逐一接上。

- [ ] **Step 6: 執行全套測試確認無回歸**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，50 files ／ 296 tests（289 ＋ 7 新增，`line-postback.test.ts` 是新檔案）

- [ ] **Step 7: Commit**

```bash
git add src/features/line/postback.ts src/features/line/conversation.ts tests/features/line-postback.test.ts
git commit -m "refactor: parse line postbacks through a dedicated grammar module"
```

---

### Task 3: 「說明」使用說明回覆

在任何 DB 查詢之前處理 `說明`，讓尚未註冊的使用者也能得到回覆。

**Files:**
- Modify: `src/features/line/conversation.ts`（`isSupported` 與 `handleLineConversation` 開頭）
- Modify: `tests/features/line-conversation.test.ts`

**Interfaces:**
- Consumes: `buildUsageReply(): LineMessage`（Task 1）

- [ ] **Step 1: 加入失敗測試**

在 `tests/features/line-conversation.test.ts` 的 `describe('handleLineConversation', ...)` 內加入：

```ts
  it('answers the usage command without touching the repository', async () => {
    const repository = makeRepository();
    const messages = await handleLineConversation(event({ text: '說明' }), { repository });

    expect(messages).toHaveLength(1);
    expect(messages[0].type).toBe('text');
    expect(messages[0].text).toContain('HikeSafe 使用說明');
    expect(repository.findUserByLineUserId).not.toHaveBeenCalled();
  });

  it('answers the usage command for an unregistered LINE user', async () => {
    const messages = await handleLineConversation(
      event({ text: '說明', lineUserId: 'line-user-unknown' }),
      { repository: makeRepository(trips.slice(0, 1), undefined) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('HikeSafe 使用說明');
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-conversation.test.ts -t "usage command"`
Expected: FAIL — 兩個測試都拿到空陣列（`isSupported` 回 false），`expect(messages).toHaveLength(1)` 失敗

- [ ] **Step 3: 實作**

在 `src/features/line/conversation.ts` 的 import 加入 `buildUsageReply`：

```ts
import {
  buildCheckInPrompt,
  buildHelpConfirmation,
  buildTripChooser,
  buildUsageReply,
} from '@/src/features/line/prompts';
```

`isSupported` 的文字判斷加入 `說明`：

```ts
  const text = event.text?.trim();
  return text === '需要協助' || text === '求助' || text === '回報' || text === '說明'
    || Boolean(text?.match(/^回報\s+/));
```

`handleLineConversation` 開頭，緊接在 `if (!isSupported(event)) return [];` 之後加入：

```ts
  if (event.text?.trim() === '說明') return [buildUsageReply()];
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，50 files ／ 298 tests

- [ ] **Step 5: Commit**

```bash
git add src/features/line/conversation.ts tests/features/line-conversation.test.ts
git commit -m "feat: answer the LINE usage command before any lookup"
```

---

### Task 4: 放寬 `startTrip` 的定位來源

`startTrip` 目前要求 `source === 'gps'`，但驗證後並未儲存 location（沒有 `insertCheckIn`），純粹是防誤觸閘門。放寬為接受任何 `CheckInLocation`（含 LINE 定位），location 仍為**必填**。同時消除 `start/route.ts:7` 允許 `network` 但領域層拒絕的既有落差。

**Files:**
- Modify: `src/features/trips/commands.ts:11`（移除 `type LocationFix` import）、`:62`（`StartTripCommand.location` 型別）、`:94-97`（刪除 `assertGps`）、`:175`（改用 `assertCheckInLocation`）
- Modify: `tests/features/trip-commands.test.ts`

**Interfaces:**
- Produces: `StartTripCommand.location` 型別由 `LocationFix` 變為 `CheckInLocation`（`src/lib/location.ts`，即 `LocationFix | LineLocationFix`）。Task 8 依賴此變更才能用 LINE 位置訊息開始行程。

- [ ] **Step 1: 加入失敗測試**

`tests/features/trip-commands.test.ts` 已有 `makeRepository()`（無參數，其 `trip` 預設就是 `status: 'draft'`）與 `now = new Date('2026-07-12T01:00:00.000Z')`、`freshGps`（`24.18/121.28`、`capturedAt: 00:59:00`）。在 `freshGps` 宣告之後加入一個 LINE 版本：

```ts
const freshLineFix = {
  latitude: 24.18,
  longitude: 121.28,
  capturedAt: new Date('2026-07-12T00:59:00.000Z'),
  source: 'line' as const,
};
```

並在 `describe('trip lifecycle commands', ...)` 內加入三個測試：

```ts
  it('starts a draft trip from a LINE location fix', async () => {
    const repository = makeRepository();

    const result = await startTrip({
      tripId: 'trip-1', userId: 'leader-1', location: freshLineFix, idempotencyKey: 'start-line-1', now,
    }, repository);

    expect(result).toMatchObject({ tripId: 'trip-1', status: 'active' });
    expect(repository.trip).toMatchObject({ status: 'active', startedAt: now });
  });

  it('rejects a stale LINE location fix when starting', async () => {
    await expect(startTrip({
      tripId: 'trip-1',
      userId: 'leader-1',
      location: { ...freshLineFix, capturedAt: new Date('2026-07-12T00:54:59.000Z') },
      idempotencyKey: 'start-line-stale',
      now,
    }, makeRepository())).rejects.toThrow('Location is stale');
  });

  it('rejects a LINE location fix outside Taiwan when starting', async () => {
    await expect(startTrip({
      tripId: 'trip-1',
      userId: 'leader-1',
      location: { ...freshLineFix, latitude: 35.68, longitude: 139.77 },
      idempotencyKey: 'start-line-abroad',
      now,
    }, makeRepository())).rejects.toThrow('Location coordinates are outside Taiwan');
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/trip-commands.test.ts -t "LINE location"`
Expected: FAIL — 第一個測試因 `assertGps` 丟出 `Location must be GPS`；另兩個測試目前也會拿到 `Location must be GPS` 而非預期訊息

- [ ] **Step 3: 修改 `src/features/trips/commands.ts`**

import 區塊（第 6-12 行）移除 `type LocationFix`：

```ts
import {
  assertFreshLineLocation,
  assertFreshLocation,
  type CheckInLocation,
} from '@/src/lib/location';
```

`StartTripCommand`（第 60-66 行附近）的 location 型別改為 `CheckInLocation`：

```ts
export interface StartTripCommand {
  tripId: string;
  userId: string;
  location: CheckInLocation;
  idempotencyKey: string;
  now: Date;
}
```

刪除整個 `assertGps`（第 94-97 行）：

```ts
const assertGps = (location: LocationFix, now: Date) => {
  if (location.source !== 'gps') throw new Error('Location must be GPS');
  return assertFreshLocation(location, now);
};
```

`startTrip` 內第 175 行改為：

```ts
    assertCheckInLocation(command.location, command.now);
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run --exclude "**/tests/integration/**" --exclude "**/.worktrees/**"`
Expected: PASS，50 files ／ 301 tests。已確認全 repo 沒有任何測試斷言 `Location must be GPS`（該字串目前只出現在 `commands.ts:95` 本身），因此本變更不應造成既有測試失敗。若仍有失敗，是真的回歸，請修實作而非改測試。

- [ ] **Step 5: 確認 `LocationFix` 沒有殘留參照**

Run: `grep -n "LocationFix" src/features/trips/commands.ts || echo "no LocationFix references remain"`
Expected: `no LocationFix references remain`

- [ ] **Step 6: Commit**

```bash
git add src/features/trips/commands.ts tests/features/trip-commands.test.ts
git commit -m "fix: accept LINE and network location fixes when starting a trip"
```

---

### Task 5: 行程選擇器意圖接線（順帶修正既有 help 缺陷）

多筆進行中行程時，選擇器目前一律發出 `:select`，而處理端固定回打卡提示——使用者輸入「需要協助」選完行程卻拿到打卡提示。這是**既有缺陷**，求助情境下尤其危險。本任務把意圖從選擇器一路帶到處理端。

**Files:**
- Modify: `src/features/line/conversation.ts`（`chooseAndRetry`、postback `trip` 分支、`需要協助` 文字分支）
- Modify: `tests/features/line-conversation.test.ts`

**Interfaces:**
- Consumes: `buildTripChooser(trips, intent?)`、`buildExtendPrompt(tripId)`、`buildFinishConfirmation(tripId)`、`buildHelpConfirmation(tripId)`（Task 1）；`ParsedPostback` 的 `{ kind: 'trip'; intent }`（Task 2）

- [ ] **Step 1: 加入失敗測試**

在 `tests/features/line-conversation.test.ts` 加入：

```ts
  it('offers a help chooser carrying the help intent for multiple active trips', async () => {
    const messages = await handleLineConversation(event({ text: '需要協助' }), { repository: makeRepository(trips) });

    expect(messages).toHaveLength(2);
    expect(messages[1].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:trip:trip-1:help', 'hikesafe:trip:trip-2:help']);
  });

  it('returns a help confirmation after choosing a trip with the help intent', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:help' }),
      { repository: makeRepository(trips) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:help:trip-1:confirm', 'hikesafe:help:trip-1:cancel']);
  });

  it('still returns a check-in prompt for the select intent', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:select' }),
      { repository: makeRepository(trips) },
    );

    expect(messages[0].quickReply?.items.some(({ action }) =>
      action.type === 'postback' && action.data === 'hikesafe:check-in:trip-1:safe')).toBe(true);
  });

  it('returns the matching prompt for the extend and finish intents', async () => {
    const extend = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:extend' }),
      { repository: makeRepository(trips) },
    );
    expect(extend[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:extend:trip-1:30', 'hikesafe:extend:trip-1:60', 'hikesafe:extend:trip-1:120']);

    const finish = await handleLineConversation(
      event({ postbackData: 'hikesafe:trip:trip-1:finish' }),
      { repository: makeRepository(trips) },
    );
    expect(finish[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:finish:trip-1:confirm', 'hikesafe:finish:trip-1:cancel']);
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-conversation.test.ts -t "intent"`
Expected: FAIL — help 選擇器仍發出 `:select`；`:help`／`:extend`／`:finish` 三種 postback 都落到 `unavailableTrip`

- [ ] **Step 3: 實作**

`src/features/line/conversation.ts` 的 import 補上兩個建構器：

```ts
import {
  buildCheckInPrompt,
  buildExtendPrompt,
  buildFinishConfirmation,
  buildHelpConfirmation,
  buildTripChooser,
  buildUsageReply,
  type TripChooserIntent,
} from '@/src/features/line/prompts';
```

`chooseAndRetry` 加上意圖參數：

```ts
const chooseAndRetry = (activeTrips: ActiveLineTrip[], intent: TripChooserIntent) => [
  textMessage(retryAfterChoosing),
  buildTripChooser(activeTrips, intent),
];
```

postback 的 `trip` 分支改為依意圖分派：

```ts
    if (parsed.kind === 'trip') {
      if (parsed.intent === 'help') return [buildHelpConfirmation(tripId)];
      if (parsed.intent === 'extend') return [buildExtendPrompt(tripId)];
      if (parsed.intent === 'finish') return [buildFinishConfirmation(tripId)];
      return [buildCheckInPrompt({ tripId, includeLocation: false })];
    }
```

文字分支的兩個 `chooseAndRetry` 呼叫補上意圖——`需要協助`／`求助` 用 `'help'`，自由文字回報用 `'select'`：

```ts
  if (text === '需要協助' || text === '求助') {
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'help');
    return [buildHelpConfirmation(activeTrips[0].id)];
  }
```

```ts
  if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'select');
```

`event.location` 分支的 `buildTripChooser(activeTrips)` 維持預設 `'select'`，不需改動。

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，50 files ／ 305 tests

- [ ] **Step 5: Commit**

```bash
git add src/features/line/conversation.ts tests/features/line-conversation.test.ts
git commit -m "fix: route trip chooser selections to the intent the user asked for"
```

---

### Task 6: 聊天內延長下山時間

新增 `延長` 文字觸發與 `hikesafe:extend:{tripId}:{30|60|120}` 的執行。延長基準為**原預計下山時間 ＋ N 分鐘**。

**Files:**
- Modify: `src/features/line/conversation.ts`（`isSupported`、postback `extend` 分支、`延長` 文字分支）
- Modify: `tests/features/line-conversation.test.ts`

**Interfaces:**
- Consumes: `extendTrip({ tripId, userId, plannedFinishAt, idempotencyKey, now })`（`src/features/trips/commands.ts`）；`ActiveLineTrip.plannedFinishAt: Date`；`buildExtendPrompt`（Task 1）；`ParsedPostback` 的 `{ kind: 'extend'; minutes }`（Task 2）

- [ ] **Step 1: 把 `extendTrip` 加入既有的 commands mock**

`tests/features/line-conversation.test.ts` 頂端的 mock 補上 `extendTrip`：

```ts
vi.mock('@/src/features/trips/commands', () => ({
  recordCheckIn: vi.fn(),
  requestHelp: vi.fn(),
  extendTrip: vi.fn(),
}));
```

import 與 `beforeEach` 一併補上：

```ts
import { extendTrip, recordCheckIn, requestHelp } from '@/src/features/trips/commands';
```

```ts
    vi.mocked(extendTrip).mockReset();
```

- [ ] **Step 2: 加入失敗測試**

```ts
  it('offers the extension options for one active trip', async () => {
    const messages = await handleLineConversation(event({ text: '延長' }), { repository: makeRepository() });

    expect(messages).toHaveLength(1);
    expect(messages[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:extend:trip-1:30', 'hikesafe:extend:trip-1:60', 'hikesafe:extend:trip-1:120']);
  });

  it('offers an extend-intent chooser for multiple active trips', async () => {
    const messages = await handleLineConversation(event({ text: '延長' }), { repository: makeRepository(trips) });

    expect(messages[1].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:trip:trip-1:extend', 'hikesafe:trip:trip-2:extend']);
  });

  it('extends from the planned finish time, not from now', async () => {
    vi.mocked(extendTrip).mockResolvedValue({
      tripId: 'trip-1', plannedFinishAt: new Date('2026-07-18T09:00:00.000Z'),
    } as never);

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:extend:trip-1:60' }),
      { repository: makeRepository() },
    );

    expect(extendTrip).toHaveBeenCalledWith(expect.objectContaining({
      tripId: 'trip-1',
      userId: 'user-1',
      plannedFinishAt: new Date('2026-07-18T09:00:00.000Z'),
      idempotencyKey: 'line-event-1',
      now,
    }));
    expect(messages).toEqual([{ type: 'text', text: copy.finishTimeExtended }]);
  });

  it('reports an extension failure with the shared bilingual error copy', async () => {
    vi.mocked(extendTrip).mockRejectedValue(new Error('Planned finish must extend the active trip'));

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:extend:trip-1:30' }),
      { repository: makeRepository() },
    );

    expect(messages).toEqual([{ type: 'text', text: copy.finishTimeExtensionError }]);
  });
```

註：`trips[0].plannedFinishAt` 是 `2026-07-18T08:00:00.000Z`，加 60 分鐘即 `09:00:00.000Z`。

- [ ] **Step 3: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-conversation.test.ts -t "extend"`
Expected: FAIL — `延長` 未被 `isSupported` 接受（回空陣列）；`hikesafe:extend:...` 落到 `unavailableTrip`

- [ ] **Step 4: 實作**

`src/features/line/conversation.ts` 的 commands import 補上 `extendTrip`：

```ts
import { extendTrip, recordCheckIn, requestHelp } from '@/src/features/trips/commands';
```

`isSupported` 的文字判斷加入 `延長`：

```ts
  return text === '需要協助' || text === '求助' || text === '回報' || text === '說明' || text === '延長'
    || Boolean(text?.match(/^回報\s+/));
```

在 postback 區塊、`parsed.kind !== 'check-in'` 那道防線**之前**加入 extend 分支：

```ts
    if (parsed.kind === 'extend') {
      const trip = activeTrips.find((item) => item.id === tripId);
      if (!trip) return [textMessage(unavailableTrip)];
      try {
        await extendTrip({
          tripId,
          userId: user.id,
          plannedFinishAt: new Date(trip.plannedFinishAt.getTime() + parsed.minutes * 60_000),
          idempotencyKey: event.eventId,
          now: event.now,
        });
        return [textMessage(copy.finishTimeExtended)];
      } catch {
        return [textMessage(copy.finishTimeExtensionError)];
      }
    }
```

在文字分支區，`需要協助` 判斷之後加入：

```ts
  if (text === '延長') {
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'extend');
    return [buildExtendPrompt(activeTrips[0].id)];
  }
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，50 files ／ 309 tests

- [ ] **Step 6: Commit**

```bash
git add src/features/line/conversation.ts tests/features/line-conversation.test.ts
git commit -m "feat: extend the planned finish time from LINE chat"
```

---

### Task 7: 聊天內平安下山

新增 `平安下山`／`結束行程` 文字觸發與 `hikesafe:finish:{tripId}:{confirm|cancel}` 的執行。聊天結束不帶位置（`finishTrip` 的 location 為選填）。

**Files:**
- Modify: `src/features/line/conversation.ts`（`isSupported`、postback `finish` 分支、文字分支）
- Modify: `tests/features/line-conversation.test.ts`

**Interfaces:**
- Consumes: `finishTrip({ tripId, userId, idempotencyKey, now })`（`src/features/trips/commands.ts`，`location` 與 `message` 皆為選填）；`buildFinishConfirmation`（Task 1）；`ParsedPostback` 的 `{ kind: 'finish'; action }`（Task 2）

- [ ] **Step 1: 把 `finishTrip` 加入 commands mock**

```ts
vi.mock('@/src/features/trips/commands', () => ({
  recordCheckIn: vi.fn(),
  requestHelp: vi.fn(),
  extendTrip: vi.fn(),
  finishTrip: vi.fn(),
}));
```

```ts
import { extendTrip, finishTrip, recordCheckIn, requestHelp } from '@/src/features/trips/commands';
```

```ts
    vi.mocked(finishTrip).mockReset();
```

- [ ] **Step 2: 加入失敗測試**

```ts
  it('asks for confirmation before finishing one active trip', async () => {
    for (const text of ['平安下山', '結束行程']) {
      const messages = await handleLineConversation(event({ text }), { repository: makeRepository() });

      expect(messages).toHaveLength(1);
      expect(messages[0].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
        .toEqual(['hikesafe:finish:trip-1:confirm', 'hikesafe:finish:trip-1:cancel']);
    }
  });

  it('offers a finish-intent chooser for multiple active trips', async () => {
    const messages = await handleLineConversation(event({ text: '平安下山' }), { repository: makeRepository(trips) });

    expect(messages[1].quickReply?.items.map(({ action }) => action.type === 'postback' ? action.data : undefined))
      .toEqual(['hikesafe:trip:trip-1:finish', 'hikesafe:trip:trip-2:finish']);
  });

  it('finishes the trip on confirmation without a location', async () => {
    vi.mocked(finishTrip).mockResolvedValue({ tripId: 'trip-1' } as never);

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:finish:trip-1:confirm' }),
      { repository: makeRepository() },
    );

    expect(finishTrip).toHaveBeenCalledWith(expect.objectContaining({
      tripId: 'trip-1', userId: 'user-1', idempotencyKey: 'line-event-1', now,
    }));
    expect(vi.mocked(finishTrip).mock.calls[0][0]).not.toHaveProperty('location');
    expect(messages).toEqual([{ type: 'text', text: copy.tripFinished }]);
  });

  it('stays silent when the user cancels finishing', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:finish:trip-1:cancel' }),
      { repository: makeRepository() },
    );

    expect(messages).toEqual([]);
    expect(finishTrip).not.toHaveBeenCalled();
  });

  it('reports a finish failure with the shared bilingual error copy', async () => {
    vi.mocked(finishTrip).mockRejectedValue(new Error('Trip is not active'));

    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:finish:trip-1:confirm' }),
      { repository: makeRepository() },
    );

    expect(messages).toEqual([{ type: 'text', text: copy.tripFinishError }]);
  });
```

- [ ] **Step 3: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-conversation.test.ts -t "finish"`
Expected: FAIL — 文字觸發回空陣列；`hikesafe:finish:...` 落到 `unavailableTrip`

- [ ] **Step 4: 實作**

commands import 補上 `finishTrip`：

```ts
import { extendTrip, finishTrip, recordCheckIn, requestHelp } from '@/src/features/trips/commands';
```

`isSupported` 的文字判斷加入兩個觸發詞：

```ts
  return text === '需要協助' || text === '求助' || text === '回報' || text === '說明' || text === '延長'
    || text === '平安下山' || text === '結束行程'
    || Boolean(text?.match(/^回報\s+/));
```

postback 區塊，在 extend 分支之後加入：

```ts
    if (parsed.kind === 'finish') {
      if (parsed.action === 'cancel') return [];
      try {
        await finishTrip({
          tripId,
          userId: user.id,
          idempotencyKey: event.eventId,
          now: event.now,
        });
        return [textMessage(copy.tripFinished)];
      } catch {
        return [textMessage(copy.tripFinishError)];
      }
    }
```

文字分支，在 `延長` 之後加入：

```ts
  if (text === '平安下山' || text === '結束行程') {
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'finish');
    return [buildFinishConfirmation(activeTrips[0].id)];
  }
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，50 files ／ 314 tests

- [ ] **Step 6: Commit**

```bash
git add src/features/line/conversation.ts tests/features/line-conversation.test.ts
git commit -m "feat: finish a trip from LINE chat"
```

---

### Task 8: 聊天內開始行程

新增 draft 行程查詢、拆解阻擋 start 的提早返回、實作位置訊息判定表與 start postback，並為兩個可預期的失敗原因給出可行動指引。

**Files:**
- Modify: `src/features/line/conversation.ts`（`LineConversationRepository`、`databaseRepository`、`isSupported`、`handleLineConversation` 主體）
- Modify: `tests/features/line-conversation.test.ts`（`makeRepository` 需補 `listDraftTripsForMember`）

**Interfaces:**
- Consumes: `startTrip({ tripId, userId, location, idempotencyKey, now })`，其 `location` 自 Task 4 起接受 `CheckInLocation`；`buildStartLocationPrompt()`（Task 1）；`ParsedPostback` 的 `{ kind: 'start'; action }`（Task 2）
- Produces: `LineConversationRepository` 新增 `listDraftTripsForMember(userId: string): Promise<ActiveLineTrip[]>`（沿用 `ActiveLineTrip` 型別，兩份清單結構相同）

**位置訊息判定表（進行中行程優先，既有行為零變更）：**

| activeTrips | draftTrips | 行為 |
| --- | --- | --- |
| 1 | 任意 | 對該行程打卡（既有行為） |
| >1 | 任意 | `ambiguousLocation` ＋ 選擇器（既有行為） |
| 0 | 1 | 開始該 draft 行程 |
| 0 | >1 | 回「多筆待開始行程，請開啟行程頁」 |
| 0 | 0 | `copy.noActiveTrip`（既有行為） |

- [ ] **Step 1: 更新測試 fake 並加入失敗測試**

`tests/features/line-conversation.test.ts` 的 mock 補上 `startTrip`：

```ts
vi.mock('@/src/features/trips/commands', () => ({
  recordCheckIn: vi.fn(),
  requestHelp: vi.fn(),
  extendTrip: vi.fn(),
  finishTrip: vi.fn(),
  startTrip: vi.fn(),
}));
```

```ts
import { extendTrip, finishTrip, recordCheckIn, requestHelp, startTrip } from '@/src/features/trips/commands';
```

`makeRepository` 加上第三個參數：

```ts
const makeRepository = (
  activeTrips: ActiveLineTrip[] = trips.slice(0, 1),
  user: { id: string } | undefined = { id: 'user-1' },
  draftTrips: ActiveLineTrip[] = [],
): LineConversationRepository => ({
  findUserByLineUserId: vi.fn(async (lineUserId) => lineUserId === 'line-user-1' ? user : undefined),
  listActiveTripsForMember: vi.fn(async () => activeTrips),
  listDraftTripsForMember: vi.fn(async () => draftTrips),
});
```

`beforeEach` 補 `vi.mocked(startTrip).mockReset();`。新增測試：

```ts
const lineLocation = { latitude: 23.47, longitude: 120.95, capturedAt: now, source: 'line' as const };
const draft: ActiveLineTrip = { id: 'draft-1', routeName: '合歡北峰線', plannedFinishAt: new Date('2026-07-18T10:00:00.000Z') };

  it('asks for a location when the start postback is confirmed', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:start:draft-1:confirm' }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].quickReply?.items).toEqual([
      { type: 'action', action: { type: 'location', label: bilingual('📍 傳送位置', 'Send location') } },
    ]);
  });

  it('rejects a start postback for a trip that is not one of the user drafts', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:start:other-1:confirm' }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages[0].text).toContain('此行程不在你的進行中行程內');
    expect(startTrip).not.toHaveBeenCalled();
  });

  it('stays silent when the user cancels starting', async () => {
    const messages = await handleLineConversation(
      event({ postbackData: 'hikesafe:start:draft-1:cancel' }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages).toEqual([]);
  });

  it('starts the only draft trip when a location arrives and no trip is active', async () => {
    vi.mocked(startTrip).mockResolvedValue({ tripId: 'draft-1', status: 'active', startedAt: now } as never);

    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(startTrip).toHaveBeenCalledWith(expect.objectContaining({
      tripId: 'draft-1', userId: 'user-1', location: lineLocation, idempotencyKey: 'line-event-1', now,
    }));
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('行程已開始');
    expect(recordCheckIn).not.toHaveBeenCalled();
  });

  it('still checks in when an active trip exists alongside a draft', async () => {
    vi.mocked(recordCheckIn).mockResolvedValue({ id: 'check-in-1' } as never);

    await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository(trips.slice(0, 1), { id: 'user-1' }, [draft]) },
    );

    expect(recordCheckIn).toHaveBeenCalled();
    expect(startTrip).not.toHaveBeenCalled();
  });

  it('points at the trip page when several drafts could be started', async () => {
    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft, { ...draft, id: 'draft-2' }]) },
    );

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toContain('多筆待開始的行程');
    expect(startTrip).not.toHaveBeenCalled();
  });

  it('reports no active trip when a location arrives with nothing to act on', async () => {
    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, []) },
    );

    expect(messages).toEqual([{ type: 'text', text: copy.noActiveTrip }]);
  });

  it('guides the user to assign a deputy when the domain rejects the start', async () => {
    vi.mocked(startTrip).mockRejectedValue(new Error('Multi-person trips require a deputy before start'));

    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages[0].text).toContain('副領隊');
  });

  it('asks for a fresh location when the location is unusable', async () => {
    vi.mocked(startTrip).mockRejectedValue(new Error('Location is stale'));

    const messages = await handleLineConversation(
      event({ location: lineLocation }),
      { repository: makeRepository([], { id: 'user-1' }, [draft]) },
    );

    expect(messages[0].text).toContain('重新傳送目前位置');
  });
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-conversation.test.ts -t "start"`
Expected: FAIL — `listDraftTripsForMember` 不存在於介面（型別錯誤），且所有位置訊息在無進行中行程時都回 `noActiveTrip`

- [ ] **Step 3: 擴充 repository 介面與實作**

`src/features/line/conversation.ts`：

```ts
export interface LineConversationRepository {
  findUserByLineUserId(lineUserId: string): Promise<{ id: string } | undefined>;
  listActiveTripsForMember(userId: string): Promise<ActiveLineTrip[]>;
  listDraftTripsForMember(userId: string): Promise<ActiveLineTrip[]>;
}
```

`databaseRepository` 內把既有的行程查詢抽成共用 helper 並加上 draft 版本：

```ts
const tripsForMemberByStatus = async (userId: string, status: 'active' | 'draft') => {
  const { db } = await import('@/src/db/client');
  return db.select({
    id: trips.id,
    routeName: routeVersions.routeName,
    plannedFinishAt: trips.plannedFinishAt,
  }).from(tripMembers)
    .innerJoin(users, eq(users.id, tripMembers.userId))
    .innerJoin(trips, eq(trips.id, tripMembers.tripId))
    .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
    .where(and(eq(users.id, userId), eq(trips.status, status)));
};

const databaseRepository: LineConversationRepository = {
  async findUserByLineUserId(lineUserId) {
    const { db } = await import('@/src/db/client');
    const [user] = await db.select({ id: users.id }).from(users)
      .where(eq(users.lineUserId, lineUserId)).limit(1);
    return user;
  },
  listActiveTripsForMember: (userId) => tripsForMemberByStatus(userId, 'active'),
  listDraftTripsForMember: (userId) => tripsForMemberByStatus(userId, 'draft'),
};
```

- [ ] **Step 4: 加入新訊息常數並改寫主體**

在 `conversation.ts` 既有的訊息常數區加入：

```ts
const tripStarted = bilingual('行程已開始，祝一路平安。', 'The trip has started. Stay safe.');
const startError = bilingual('無法開始行程，請稍後再試。', 'The trip could not be started. Try again later.');
const deputyRequired = bilingual(
  '多人行程需要先指派副領隊才能開始，請開啟行程頁指派。',
  'A multi-person trip needs a deputy before it can start. Open the trip page to assign one.',
);
const locationUnusable = bilingual(
  '無法使用這個位置，請重新傳送目前位置。',
  'That location cannot be used. Send your current location again.',
);
const multipleDrafts = bilingual(
  '你有多筆待開始的行程，請開啟行程頁選擇要開始哪一個。',
  'You have several trips waiting to start. Open the trip page to choose one.',
);
```

commands import 補上 `startTrip`：

```ts
import { extendTrip, finishTrip, recordCheckIn, requestHelp, startTrip } from '@/src/features/trips/commands';
```

同時載入兩份清單，並**移除**原本的 `if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];` 提早返回：

```ts
  const repository = dependencies.repository ?? databaseRepository;
  let user: { id: string } | undefined;
  let activeTrips: ActiveLineTrip[];
  let draftTrips: ActiveLineTrip[];
  try {
    user = await repository.findUserByLineUserId(event.lineUserId);
    if (!user) {
      return [textMessage(copy.authenticationError('使用 LINE 回報', 'using LINE check-ins'))];
    }
    [activeTrips, draftTrips] = await Promise.all([
      repository.listActiveTripsForMember(user.id),
      repository.listDraftTripsForMember(user.id),
    ]);
  } catch {
    return [textMessage(conversationError)];
  }
```

- [ ] **Step 5: 實作位置訊息判定表**

把 `event.location` 分支整段改為：

```ts
  if (event.location) {
    if (activeTrips.length > 1) {
      return [textMessage(ambiguousLocation), buildTripChooser(activeTrips, 'select')];
    }
    if (activeTrips.length === 1) {
      try {
        await recordCheckIn({
          tripId: activeTrips[0].id,
          userId: user.id,
          location: {
            latitude: event.location.latitude,
            longitude: event.location.longitude,
            capturedAt: event.now,
            source: 'line',
          },
          idempotencyKey: event.eventId,
          now: event.now,
        });
        return [textMessage(copy.checkInSuccess())];
      } catch {
        return [textMessage(checkInError)];
      }
    }
    if (draftTrips.length > 1) return [textMessage(multipleDrafts)];
    if (draftTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    return startDraftTrip(draftTrips[0].id, user.id, event);
  }
```

並在檔案內加入 helper（保持 `handleLineConversation` 在 50 行以內）：

```ts
const startDraftTrip = async (
  tripId: string,
  userId: string,
  event: LineConversationEvent & { location: LineLocationFix },
): Promise<LineMessage[]> => {
  try {
    await startTrip({
      tripId,
      userId,
      location: event.location,
      idempotencyKey: event.eventId,
      now: event.now,
    });
    return [textMessage(tripStarted)];
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message === 'Multi-person trips require a deputy before start') return [textMessage(deputyRequired)];
    if (message.startsWith('Location')) return [textMessage(locationUnusable)];
    return [textMessage(startError)];
  }
};
```

`message.startsWith('Location')` 涵蓋 `src/lib/location.ts` 丟出的全部四種訊息（`Location is stale`、`Location timestamp is invalid`、`Location timestamp is in the future`、`Location coordinates are outside Taiwan`）。

**設計取捨（已與專案負責人確認）：** 這裡刻意用錯誤訊息字串比對，而非型別化錯誤。領域層目前一律丟通用 `Error`；導入專屬錯誤類別要動 `src/features/trips/commands.ts` 與其所有呼叫端，超出本期範圍。spec §6 要求開始行程失敗必須給可行動指引，字串比對是現況下唯一能做到的方式。已列為 fast-follow，不在本期修。

- [ ] **Step 6: 接上 start postback 並補回各文字分支的空清單處理**

postback 區塊的授權檢查要先讓 start 走 draft 清單。把授權段改為：

```ts
    const parsed = parsePostback(postbackData);
    if (!parsed) return [textMessage(unavailableTrip)];
    const { tripId } = parsed;

    if (parsed.kind === 'start') {
      if (!draftTrips.some((trip) => trip.id === tripId)) return [textMessage(unavailableTrip)];
      if (parsed.action === 'cancel') return [];
      return [buildStartLocationPrompt()];
    }

    if (!activeTrips.some((trip) => trip.id === tripId)) return [textMessage(unavailableTrip)];
```

`isSupported` 已因 Task 2 改用 `parsePostback`，start postback 自動被接受，無需再改。

文字分支補上空清單處理（`回報` 與自由文字回報）：

```ts
  if (text === '回報') {
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    return activeTrips.length === 1
      ? [buildCheckInPrompt({ tripId: activeTrips[0].id, includeLocation: true })]
      : [buildTripChooser(activeTrips, 'select')];
  }
```

```ts
  const message = text?.match(/^回報\s+([\s\S]+)$/)?.[1].trim();
  if (!message) return [];
  if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
  if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'select');
```

`需要協助`／`求助` 分支同樣補：

```ts
  if (text === '需要協助' || text === '求助') {
    if (activeTrips.length === 0) return [textMessage(copy.noActiveTrip)];
    if (activeTrips.length !== 1) return chooseAndRetry(activeTrips, 'help');
    return [buildHelpConfirmation(activeTrips[0].id)];
  }
```

import 補上 `buildStartLocationPrompt` 與 `LineLocationFix` 型別（後者已在檔案頂端 import）。

- [ ] **Step 7: 執行測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，50 files ／ 323 tests

- [ ] **Step 8: 確認檔案仍在規模限制內**

Run: `wc -l src/features/line/conversation.ts`
Expected: 少於 400 行。若超過，把 postback 處理抽成獨立的 `handlePostback` helper 函式（同檔內），不要新增檔案。

- [ ] **Step 9: Commit**

```bash
git add src/features/line/conversation.ts tests/features/line-conversation.test.ts
git commit -m "feat: start a draft trip from a LINE location message"
```

---

### Task 9: 網頁延長基準改為 `plannedFinishAt + N`

`TripActions.tsx` 目前用 `now + N`，在預計下山時間尚遠時會被領域層拒絕。改為與聊天一致的 `plannedFinishAt + N`，並把 `plannedFinishAt` 納入 state，使連續延長以更新後的值為基準。

**Files:**
- Modify: `app/trips/[tripId]/TripActions.tsx:43-51`（新增 state）、`:105-120`（`extend`）、`:161`（顯示）
- Modify: `tests/features/trip-actions.test.tsx`

**Interfaces:**
- Consumes: `initialState.plannedFinishAt: string`（ISO 字串，`ActiveTripInitialState`）

- [ ] **Step 1: 加入失敗測試**

在 `tests/features/trip-actions.test.tsx` 加入（該檔已有 `afterEach(cleanup)`，沿用即可）：

```ts
  it('extends from the planned finish time rather than from now', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);

    fireEvent.click(screen.getByRole('button', { name: copy.extendFinishTime }));
    fireEvent.click(screen.getByRole('button', { name: copy.extendByMinutes(30) }));
    await screen.findByText((_, element) => element?.textContent === copy.finishTimeExtended);

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { plannedFinishAt: string };
    expect(body.plannedFinishAt).toBe('2026-07-12T05:30:00.000Z');
  });

  it('bases a second extension on the already extended finish time', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);

    fireEvent.click(screen.getByRole('button', { name: copy.extendFinishTime }));
    fireEvent.click(screen.getByRole('button', { name: copy.extendByMinutes(30) }));
    await screen.findByText((_, element) => element?.textContent === copy.finishTimeExtended);

    fireEvent.click(screen.getByRole('button', { name: copy.extendFinishTime }));
    fireEvent.click(screen.getByRole('button', { name: copy.extendByMinutes(60) }));
    await screen.findByText((_, element) => element?.textContent === copy.finishTimeExtended);

    const body = JSON.parse(fetchMock.mock.calls[1][1].body as string) as { plannedFinishAt: string };
    expect(body.plannedFinishAt).toBe('2026-07-12T06:30:00.000Z');
  });
```

`initialState.plannedFinishAt` 是 `2026-07-12T05:00:00.000Z`：＋30 分＝`05:30`，再＋60 分＝`06:30`。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/trip-actions.test.tsx -t "planned finish"`
Expected: FAIL — 實際送出的是 `Date.now() + 30 分鐘`，與 `2026-07-12T05:30:00.000Z` 不符

- [ ] **Step 3: 實作**

`app/trips/[tripId]/TripActions.tsx` 在既有 state 宣告區加入：

```ts
  const [plannedFinishAt, setPlannedFinishAt] = useState(initialState.plannedFinishAt);
```

`extend` 改為：

```ts
  const extend = async (minutes: number) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    setBusy(true);
    const next = new Date(new Date(plannedFinishAt).getTime() + minutes * 60_000).toISOString();
    try {
      const { ok } = await requestAction(`/api/trips/${tripId}/extend`, {
        plannedFinishAt: next,
        idempotencyKey: crypto.randomUUID(),
      });
      setNotice(ok
        ? { tone: 'success', text: copy.finishTimeExtended }
        : { tone: 'error', text: copy.finishTimeExtensionError });
      if (ok) {
        setPlannedFinishAt(next);
        setOpenAction(undefined);
      }
    } finally {
      setBusy(false);
    }
  };
```

狀態卡的顯示改用 state（原第 161 行）：

```ts
        <div><dt>{copy.plannedFinish}</dt><dd>{formatTime(plannedFinishAt)}</dd></div>
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，50 files ／ 325 tests

- [ ] **Step 5: Commit**

```bash
git add app/trips/[tripId]/TripActions.tsx tests/features/trip-actions.test.tsx
git commit -m "fix: extend the planned finish time from its own value on the web"
```

---

### Task 10: 行程摘要卡與建立後推播

建立行程成功後，對登山客推播一張含「開始行程」按鈕的 Flex 卡。推播失敗（多半是尚未加 OA 好友）對使用者靜默，且**絕不**影響建立行程的 201 回應。

**Files:**
- Create: `src/features/line/trip-summary.ts`
- Modify: `app/api/trips/route.ts`（`handleCreateTrip` 成功路徑）
- Create: `tests/features/line-trip-summary.test.ts`
- Modify: `tests/api/create-trip.test.ts`

**Interfaces:**
- Consumes: `pushLineMessage({ to, messages, idempotencyKey })`（`src/integrations/line/client.ts`）；`LineMessage`（`src/features/line/messages.ts`）
- Produces:
  - `export interface TripSummary { tripId: string; routeName: string; plannedFinishAt: Date; team: string[]; guardianCount: number; liffId: string }`
  - `buildTripSummaryCard(summary: TripSummary): LineMessage`
  - `export interface TripSummaryRepository { findTripSummary(input: { tripId: string; ownerUserId: string }): Promise<{ lineUserId: string; routeName: string; plannedFinishAt: Date; team: string[]; guardianCount: number } | undefined> }`
  - `pushTripSummary(input: { tripId: string; ownerUserId: string }, dependencies?: { repository?: TripSummaryRepository; push?: typeof pushLineMessage; logger?: Pick<Console, 'error'> }): Promise<void>` — 永不 throw

- [ ] **Step 1: 建立 `tests/features/line-trip-summary.test.ts` 失敗測試**

```ts
import { describe, expect, it, vi } from 'vitest';

import { buildTripSummaryCard, pushTripSummary } from '@/src/features/line/trip-summary';

const summary = {
  tripId: 'trip-1',
  routeName: '玉山主峰線',
  plannedFinishAt: new Date('2026-07-18T08:00:00.000Z'),
  team: ['阿山', '小玉'],
  guardianCount: 2,
  liffId: 'liff-id',
};

const lookup = {
  lineUserId: 'line-owner-1',
  routeName: '玉山主峰線',
  plannedFinishAt: new Date('2026-07-18T08:00:00.000Z'),
  team: ['阿山', '小玉'],
  guardianCount: 2,
};

describe('buildTripSummaryCard', () => {
  it('shows the route, planned finish, team, and guardian count', () => {
    const serialized = JSON.stringify(buildTripSummaryCard(summary));

    expect(serialized).toContain('玉山主峰線');
    expect(serialized).toContain('2026-07-18 16:00 Asia/Taipei');
    expect(serialized).toContain('阿山、小玉');
    expect(serialized).toContain('2');
  });

  it('offers a start postback and a LIFF trip page fallback', () => {
    const card = buildTripSummaryCard(summary);
    const serialized = JSON.stringify(card);

    expect(card.type).toBe('flex');
    expect(serialized).toContain('hikesafe:start:trip-1:confirm');
    expect(serialized).toContain('https://liff.line.me/liff-id/trips/trip-1');
  });
});

describe('pushTripSummary', () => {
  it('pushes the card to the owner with the trip id as the retry key', async () => {
    const push = vi.fn(async () => undefined);
    const repository = { findTripSummary: vi.fn(async () => lookup) };

    await pushTripSummary({ tripId: 'trip-1', ownerUserId: 'user-1' }, { repository, push });

    expect(repository.findTripSummary).toHaveBeenCalledWith({ tripId: 'trip-1', ownerUserId: 'user-1' });
    expect(push).toHaveBeenCalledWith(expect.objectContaining({
      to: 'line-owner-1',
      idempotencyKey: 'trip-1',
    }));
  });

  it('stays silent and logs when the push fails', async () => {
    const push = vi.fn(async () => { throw new Error('LINE push failed (403)'); });
    const repository = { findTripSummary: vi.fn(async () => lookup) };
    const logger = { error: vi.fn() };

    await expect(pushTripSummary({ tripId: 'trip-1', ownerUserId: 'user-1' }, { repository, push, logger }))
      .resolves.toBeUndefined();
    expect(logger.error).toHaveBeenCalled();
  });

  it('does nothing when the trip summary cannot be found', async () => {
    const push = vi.fn(async () => undefined);
    const repository = { findTripSummary: vi.fn(async () => undefined) };

    await pushTripSummary({ tripId: 'trip-1', ownerUserId: 'user-1' }, { repository, push });

    expect(push).not.toHaveBeenCalled();
  });
});
```

註：`2026-07-18T08:00:00.000Z` 在 Asia/Taipei 是 16:00，格式沿用 `messages.ts` 的 `formatTime`。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-trip-summary.test.ts`
Expected: FAIL — `Failed to resolve import "@/src/features/line/trip-summary"`

- [ ] **Step 3: 從 `messages.ts` 匯出 `formatTime` 供重用**

`src/features/line/messages.ts` 內既有的 `formatTime`（第 35 行）改為具名匯出，避免在 `trip-summary.ts` 重複實作同一套 Asia/Taipei 格式：

```ts
export const formatTime = (value: Date) => {
```

- [ ] **Step 4: 建立 `src/features/line/trip-summary.ts`**

```ts
import { eq } from 'drizzle-orm';

import { getEnv } from '@/src/env';
import { bilingual } from '@/src/features/i18n/copy';
import { formatTime, type LineMessage } from '@/src/features/line/messages';
import { pushLineMessage } from '@/src/integrations/line/client';

export interface TripSummary {
  tripId: string;
  routeName: string;
  plannedFinishAt: Date;
  team: string[];
  guardianCount: number;
  liffId: string;
}

interface TripSummaryLookup {
  lineUserId: string;
  routeName: string;
  plannedFinishAt: Date;
  team: string[];
  guardianCount: number;
}

export interface TripSummaryRepository {
  findTripSummary(input: { tripId: string; ownerUserId: string }): Promise<TripSummaryLookup | undefined>;
}

const title = bilingual('行程已建立', 'Trip created');
const startLabel = bilingual('開始行程', 'Start trip');
const openLabel = bilingual('開啟行程頁', 'Open trip page');
const startHint = bilingual(
  '點「開始行程」後傳送目前位置即可啟程。',
  'Tap "Start trip", then send your current location to begin.',
);

export const buildTripSummaryCard = (summary: TripSummary): LineMessage => ({
  type: 'flex',
  altText: title,
  contents: {
    type: 'bubble',
    styles: { header: { backgroundColor: '#06C755' } },
    header: {
      type: 'box', layout: 'vertical',
      contents: [{ type: 'text', text: title, color: '#FFFFFF', weight: 'bold' }],
    },
    body: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'text', text: summary.routeName, weight: 'bold', wrap: true },
        { type: 'text', text: bilingual(`預計下山：${formatTime(summary.plannedFinishAt)}`, `Planned finish: ${formatTime(summary.plannedFinishAt)}`), wrap: true },
        { type: 'text', text: bilingual(`隊伍：${summary.team.join('、') || '未提供'}`, `Team: ${summary.team.join(', ') || 'Not provided'}`), wrap: true },
        { type: 'text', text: bilingual(`留守人：${summary.guardianCount} 位`, `Guardians: ${summary.guardianCount}`), wrap: true },
        { type: 'text', text: startHint, wrap: true, size: 'sm' },
      ],
    },
    footer: {
      type: 'box', layout: 'vertical', spacing: 'sm', contents: [
        { type: 'button', style: 'primary', action: { type: 'postback', label: startLabel, data: `hikesafe:start:${summary.tripId}:confirm` } },
        { type: 'button', style: 'link', action: { type: 'uri', label: openLabel, uri: `https://liff.line.me/${summary.liffId}/trips/${summary.tripId}` } },
      ],
    },
  },
});

const databaseRepository: TripSummaryRepository = {
  async findTripSummary({ tripId, ownerUserId }) {
    const { db } = await import('@/src/db/client');
    const { guardians, routeVersions, tripMembers, trips, users } = await import('@/src/db/schema');

    const [owner] = await db.select({ lineUserId: users.lineUserId }).from(users)
      .where(eq(users.id, ownerUserId)).limit(1);
    if (!owner?.lineUserId) return undefined;

    const [trip] = await db.select({
      routeName: routeVersions.routeName,
      plannedFinishAt: trips.plannedFinishAt,
    }).from(trips)
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(eq(trips.id, tripId)).limit(1);
    if (!trip) return undefined;

    const members = await db.select({ name: users.displayName }).from(tripMembers)
      .innerJoin(users, eq(users.id, tripMembers.userId))
      .where(eq(tripMembers.tripId, tripId));
    const bound = await db.select({ id: guardians.id }).from(guardians)
      .where(eq(guardians.tripId, tripId));

    return {
      lineUserId: owner.lineUserId,
      routeName: trip.routeName,
      plannedFinishAt: trip.plannedFinishAt,
      team: members.map(({ name }) => name).filter(Boolean),
      guardianCount: bound.length,
    };
  },
};

export const pushTripSummary = async (
  input: { tripId: string; ownerUserId: string },
  dependencies: {
    repository?: TripSummaryRepository;
    push?: typeof pushLineMessage;
    logger?: Pick<Console, 'error'>;
  } = {},
): Promise<void> => {
  try {
    const summary = await (dependencies.repository ?? databaseRepository).findTripSummary(input);
    if (!summary) return;
    await (dependencies.push ?? pushLineMessage)({
      to: summary.lineUserId,
      messages: [buildTripSummaryCard({
        tripId: input.tripId,
        routeName: summary.routeName,
        plannedFinishAt: summary.plannedFinishAt,
        team: summary.team,
        guardianCount: summary.guardianCount,
        liffId: getEnv().NEXT_PUBLIC_LIFF_ID,
      })],
      idempotencyKey: input.tripId,
    });
  } catch (error) {
    (dependencies.logger ?? console).error('Trip summary push failed', { tripId: input.tripId, error });
  }
};
```

欄位名稱已對照 `src/db/schema.ts` 確認：`users.displayName`（第 71 行）、`users.lineUserId`、`tripMembers.tripId`／`tripMembers.userId`（第 177 行起）、`guardians.tripId`（第 217 行起）、`trips.plannedFinishAt`、`routeVersions.routeName`。`import { and, eq }` 中的 `and` 若未被用到請一併移除，只留 `eq`。

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/features/line-trip-summary.test.ts`
Expected: PASS（5 tests）

- [ ] **Step 6: 在建立行程路由接上推播（先寫失敗測試）**

`tests/api/create-trip.test.ts` 頂端加入 mock：

```ts
vi.mock('@/src/features/line/trip-summary', () => ({ pushTripSummary: vi.fn() }));
```

```ts
import { pushTripSummary } from '@/src/features/line/trip-summary';
```

`beforeEach` 加入 `vi.mocked(pushTripSummary).mockReset();`，並新增：

```ts
  it('pushes the trip summary card to the owner after creation', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1',
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    });
    vi.mocked(createTrip).mockResolvedValue({ tripId: 'trip-1', viewerGrants: [] });
    vi.mocked(pushTripSummary).mockResolvedValue(undefined);

    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST',
      headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify(payload),
    }));

    expect(response.status).toBe(201);
    expect(pushTripSummary).toHaveBeenCalledWith({
      tripId: 'trip-1',
      ownerUserId: '11111111-1111-4111-8111-111111111112',
    });
  });

  it('still returns 201 when the summary push rejects', async () => {
    vi.mocked(verifySession).mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111112',
      lineUserId: 'line-owner-1',
      expiresAt: new Date('2026-08-01T00:00:00Z'),
    });
    vi.mocked(createTrip).mockResolvedValue({ tripId: 'trip-1', viewerGrants: [] });
    vi.mocked(pushTripSummary).mockRejectedValue(new Error('unexpected'));

    const response = await handleCreateTrip(new Request('http://localhost/api/trips', {
      method: 'POST',
      headers: { cookie: 'besafe_session=session-token' },
      body: JSON.stringify(payload),
    }));

    expect(response.status).toBe(201);
  });
```

Run: `npx vitest run tests/api/create-trip.test.ts -t "summary"`
Expected: FAIL — `pushTripSummary` 未被呼叫

- [ ] **Step 7: 修改 `app/api/trips/route.ts`**

import 加入：

```ts
import { pushTripSummary } from '@/src/features/line/trip-summary';
```

成功路徑改為下列形式。

**設計取捨（已與專案負責人確認）：** `pushTripSummary` 的契約是永不 throw，且已有專屬測試驗證，因此這層 `.catch()` 在目前程式碼路徑下確實不會被觸發。仍要保留，理由是這裡是 API 邊界，而失敗後果是「行程其實已建立成功，使用者卻收到 500 並可能重送」——這個縱深防禦值得那一行。Task 10 Step 6 的「push 拒絕仍回 201」測試就是釘住這個保證，兩者要一起保留或一起移除。

```ts
    const result = await createTrip({
      ...parsed.data,
      ownerUserId: session.userId,
      members: [
        { userId: session.userId, role: 'leader' },
        ...parsed.data.members,
      ],
    });
    await pushTripSummary({ tripId: result.tripId, ownerUserId: session.userId })
      .catch((error) => console.error('Trip summary push failed', { tripId: result.tripId, error }));
    return NextResponse.json({ tripId: result.tripId }, { status: 201 });
```

- [ ] **Step 8: 執行全套測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，51 files ／ 332 tests（`line-trip-summary.test.ts` 是新檔案）

- [ ] **Step 9: Commit**

```bash
git add src/features/line/trip-summary.ts src/features/line/messages.ts app/api/trips/route.ts tests/features/line-trip-summary.test.ts tests/api/create-trip.test.ts
git commit -m "feat: push a trip summary card with a start action after trip creation"
```

---

### Task 11: Rich menu 建構器與佈建腳本

純建構器（可測）＋ IO 外殼（CLI）。2 欄 × 3 列，每格 1250×562。

**Files:**
- Create: `src/features/line/rich-menu.ts`
- Create: `scripts/line/setup-rich-menu.ts`
- Create: `tests/features/line-rich-menu.test.ts`
- Modify: `package.json`（新增 `sharp` devDependency 與 `line:rich-menu` script）
- Modify: `.gitignore`（新增 `scripts/line/out/`）

**Interfaces:**
- Produces:
  - `export const RICH_MENU_NAME = 'hikesafe-main'`
  - `export const RICH_MENU_SIZE = { width: 2500, height: 1686 }`
  - `buildRichMenuPayload(liffId: string): Record<string, unknown>`
  - `buildRichMenuSvg(): string`

- [ ] **Step 1: 建立 `tests/features/line-rich-menu.test.ts` 失敗測試**

```ts
import { describe, expect, it } from 'vitest';

import { buildRichMenuPayload, buildRichMenuSvg, RICH_MENU_NAME, RICH_MENU_SIZE } from '@/src/features/line/rich-menu';

describe('buildRichMenuPayload', () => {
  it('declares a 2500x1686 default menu named hikesafe-main', () => {
    const payload = buildRichMenuPayload('liff-id') as {
      size: { width: number; height: number };
      selected: boolean;
      name: string;
      chatBarText: string;
    };

    expect(payload.size).toEqual({ width: 2500, height: 1686 });
    expect(payload.selected).toBe(true);
    expect(payload.name).toBe(RICH_MENU_NAME);
    expect(Array.from(payload.chatBarText).length).toBeLessThanOrEqual(14);
  });

  it('lays out six cells in two columns and three rows without gaps or overlap', () => {
    const { areas } = buildRichMenuPayload('liff-id') as {
      areas: Array<{ bounds: { x: number; y: number; width: number; height: number } }>;
    };

    expect(areas).toHaveLength(6);
    expect(areas.map(({ bounds }) => [bounds.x, bounds.y])).toEqual([
      [0, 0], [1250, 0],
      [0, 562], [1250, 562],
      [0, 1124], [1250, 1124],
    ]);
    for (const { bounds } of areas) {
      expect(bounds.width).toBe(1250);
      expect(bounds.height).toBe(562);
    }
    const covered = areas.reduce((total, { bounds }) => total + bounds.width * bounds.height, 0);
    expect(covered).toBe(RICH_MENU_SIZE.width * RICH_MENU_SIZE.height);
  });

  it('wires each cell to its LIFF page or chat command', () => {
    const { areas } = buildRichMenuPayload('liff-id') as {
      areas: Array<{ action: Record<string, string> }>;
    };

    expect(areas.map(({ action }) => action)).toEqual([
      { type: 'uri', label: '建立行程', uri: 'https://liff.line.me/liff-id/trips/new' },
      { type: 'uri', label: '進行中行程', uri: 'https://liff.line.me/liff-id/trips/active' },
      { type: 'message', label: '回報平安', text: '回報' },
      { type: 'uri', label: '我的留守人', uri: 'https://liff.line.me/liff-id/guardians' },
      { type: 'message', label: '需要協助', text: '需要協助' },
      { type: 'message', label: '使用說明', text: '說明' },
    ]);
  });

  it('keeps every action label within the 20 character limit', () => {
    const { areas } = buildRichMenuPayload('liff-id') as { areas: Array<{ action: { label: string } }> };
    for (const { action } of areas) expect(Array.from(action.label).length).toBeLessThanOrEqual(20);
  });
});

describe('buildRichMenuSvg', () => {
  it('renders a 2500x1686 canvas carrying every cell label', () => {
    const svg = buildRichMenuSvg();

    expect(svg).toContain('width="2500"');
    expect(svg).toContain('height="1686"');
    for (const label of ['建立行程', '進行中行程', '回報平安', '我的留守人', '需要協助', '使用說明']) {
      expect(svg).toContain(label);
    }
  });

  it('uses the Phase 1 palette and marks the help cell as dangerous', () => {
    const svg = buildRichMenuSvg();

    expect(svg).toContain('#06C755');
    expect(svg).toContain('#F7F8FA');
    expect(svg).toContain('#D93025');
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/line-rich-menu.test.ts`
Expected: FAIL — `Failed to resolve import "@/src/features/line/rich-menu"`

- [ ] **Step 3: 建立 `src/features/line/rich-menu.ts`**

```ts
export const RICH_MENU_NAME = 'hikesafe-main';
export const RICH_MENU_SIZE = { width: 2500, height: 1686 };

const COLUMN_WIDTH = 1250;
const ROW_HEIGHT = 562;

const PALETTE = {
  background: '#F7F8FA',
  card: '#FFFFFF',
  primary: '#06C755',
  danger: '#D93025',
  text: '#111827',
  muted: '#8B8F98',
};

interface Cell {
  label: string;
  caption: string;
  tone: 'primary' | 'danger' | 'muted';
  action: (liffId: string) => Record<string, string>;
}

const liffUri = (liffId: string, path: string) => `https://liff.line.me/${liffId}${path}`;

const cells: Cell[] = [
  { label: '建立行程', caption: 'Create trip', tone: 'primary', action: (liffId) => ({ type: 'uri', label: '建立行程', uri: liffUri(liffId, '/trips/new') }) },
  { label: '進行中行程', caption: 'Active trip', tone: 'primary', action: (liffId) => ({ type: 'uri', label: '進行中行程', uri: liffUri(liffId, '/trips/active') }) },
  { label: '回報平安', caption: 'Check in', tone: 'primary', action: () => ({ type: 'message', label: '回報平安', text: '回報' }) },
  { label: '我的留守人', caption: 'My guardians', tone: 'primary', action: (liffId) => ({ type: 'uri', label: '我的留守人', uri: liffUri(liffId, '/guardians') }) },
  { label: '需要協助', caption: 'Need help', tone: 'danger', action: () => ({ type: 'message', label: '需要協助', text: '需要協助' }) },
  { label: '使用說明', caption: 'Usage', tone: 'muted', action: () => ({ type: 'message', label: '使用說明', text: '說明' }) },
];

const boundsFor = (index: number) => ({
  x: (index % 2) * COLUMN_WIDTH,
  y: Math.floor(index / 2) * ROW_HEIGHT,
  width: COLUMN_WIDTH,
  height: ROW_HEIGHT,
});

export const buildRichMenuPayload = (liffId: string) => ({
  size: RICH_MENU_SIZE,
  selected: true,
  name: RICH_MENU_NAME,
  chatBarText: 'HikeSafe 選單',
  areas: cells.map((cell, index) => ({ bounds: boundsFor(index), action: cell.action(liffId) })),
});

const toneColor = (tone: Cell['tone']) =>
  tone === 'danger' ? PALETTE.danger : tone === 'muted' ? PALETTE.muted : PALETTE.primary;

const cellSvg = (cell: Cell, index: number) => {
  const { x, y } = boundsFor(index);
  const centerX = x + COLUMN_WIDTH / 2;
  return [
    `<rect x="${x + 8}" y="${y + 8}" width="${COLUMN_WIDTH - 16}" height="${ROW_HEIGHT - 16}" rx="24" fill="${PALETTE.card}"/>`,
    `<rect x="${x + 8}" y="${y + 8}" width="${COLUMN_WIDTH - 16}" height="10" rx="5" fill="${toneColor(cell.tone)}"/>`,
    `<text x="${centerX}" y="${y + ROW_HEIGHT / 2}" text-anchor="middle" font-size="104" font-weight="bold" fill="${PALETTE.text}">${cell.label}</text>`,
    `<text x="${centerX}" y="${y + ROW_HEIGHT / 2 + 84}" text-anchor="middle" font-size="52" fill="${PALETTE.muted}">${cell.caption}</text>`,
  ].join('');
};

export const buildRichMenuSvg = () => [
  `<svg xmlns="http://www.w3.org/2000/svg" width="${RICH_MENU_SIZE.width}" height="${RICH_MENU_SIZE.height}" viewBox="0 0 ${RICH_MENU_SIZE.width} ${RICH_MENU_SIZE.height}">`,
  `<rect width="${RICH_MENU_SIZE.width}" height="${RICH_MENU_SIZE.height}" fill="${PALETTE.background}"/>`,
  ...cells.map(cellSvg),
  '</svg>',
].join('');
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run tests/features/line-rich-menu.test.ts`
Expected: PASS（6 tests）

- [ ] **Step 5: 安裝 `sharp` 並新增 npm script**

Run: `npm install --save-dev sharp`

`package.json` 的 `scripts` 加入：

```json
    "line:rich-menu": "tsx scripts/line/setup-rich-menu.ts",
```

- [ ] **Step 6: 建立 `scripts/line/setup-rich-menu.ts`**

```ts
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import { getEnv } from '@/src/env';
import { buildRichMenuPayload, buildRichMenuSvg, RICH_MENU_NAME } from '@/src/features/line/rich-menu';

const OUTPUT_DIR = path.join(process.cwd(), 'scripts/line/out');

const api = async (url: string, init: RequestInit, token: string) => {
  const response = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...init.headers },
  });
  if (!response.ok) {
    throw new Error(`${init.method ?? 'GET'} ${url} failed (${response.status}): ${await response.text()}`);
  }
  return response;
};

const removeExistingMenus = async (token: string) => {
  const response = await api('https://api.line.me/v2/bot/richmenu/list', { method: 'GET' }, token);
  const { richmenus } = await response.json() as { richmenus: Array<{ richMenuId: string; name: string }> };
  for (const menu of richmenus.filter(({ name }) => name === RICH_MENU_NAME)) {
    await api(`https://api.line.me/v2/bot/richmenu/${menu.richMenuId}`, { method: 'DELETE' }, token);
    console.info(`Deleted existing rich menu ${menu.richMenuId}`);
  }
};

const main = async () => {
  const dryRun = process.argv.includes('--dry-run');
  const env = getEnv();
  const payload = buildRichMenuPayload(env.NEXT_PUBLIC_LIFF_ID);
  const png = await sharp(Buffer.from(buildRichMenuSvg())).png().toBuffer();

  if (dryRun) {
    await mkdir(OUTPUT_DIR, { recursive: true });
    await writeFile(path.join(OUTPUT_DIR, 'rich-menu.png'), png);
    await writeFile(path.join(OUTPUT_DIR, 'rich-menu.json'), JSON.stringify(payload, null, 2));
    console.info(`Dry run complete. Review ${OUTPUT_DIR} before running without --dry-run.`);
    return;
  }

  const token = env.LINE_CHANNEL_ACCESS_TOKEN;
  await removeExistingMenus(token);

  const created = await api('https://api.line.me/v2/bot/richmenu', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }, token);
  const { richMenuId } = await created.json() as { richMenuId: string };

  await api(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
    method: 'POST',
    headers: { 'content-type': 'image/png' },
    body: new Uint8Array(png),
  }, token);

  await api(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, { method: 'POST' }, token);
  console.info(`Rich menu ${richMenuId} uploaded and set as default.`);
};

main().catch((error) => {
  console.error('Rich menu setup failed', error);
  process.exitCode = 1;
});
```

- [ ] **Step 7: 把輸出目錄加入 `.gitignore`**

在 `.gitignore` 末尾加入一行：

```
scripts/line/out/
```

- [ ] **Step 8: 驗證 dry-run 可實際產出檔案**

Run: `npm run line:rich-menu -- --dry-run`
Expected: 印出 `Dry run complete...`，且 `scripts/line/out/rich-menu.png` 與 `rich-menu.json` 存在。

Run: `ls -la scripts/line/out/ && file scripts/line/out/rich-menu.png`
Expected: PNG 檔案存在且 `file` 回報 `PNG image data, 2500 x 1686`

若因缺少中文字型導致 PNG 上的中文變成空白方框，記錄於 task 報告的 concerns，**不要**改用圖片檔硬編或移除中文標籤——dry-run 的用途正是讓操作者在上傳前發現這件事。

- [ ] **Step 9: 執行全套測試確認通過**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: PASS，52 files ／ 338 tests（`line-rich-menu.test.ts` 是新檔案）

- [ ] **Step 10: Commit**

```bash
git add src/features/line/rich-menu.ts scripts/line/setup-rich-menu.ts tests/features/line-rich-menu.test.ts package.json package-lock.json .gitignore
git commit -m "feat: add rich menu builders and provisioning script"
```

---

## 完成後

全部 task 完成後，執行完整驗證：

```bash
npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"
npx tsc --noEmit
```

測試須全綠，預期 **52 files ／ 338 tests**（起始 48 files ／ 283 tests，新增 4 個測試檔、淨增 55 個測試）。各 task 標示的期望數字是「照本計畫所列測試逐字實作」的結果；若實作者額外補了測試而數字偏高，不算問題，數字偏低才需要回頭確認是否漏寫。

`tsc` 有 53 個既有錯誤基準，本期不得**新增**任何錯誤——比對方式是在乾淨的 master worktree 跑同一指令取得基準清單再比對。

接著使用 `superpowers:finishing-a-development-branch` 收尾。
