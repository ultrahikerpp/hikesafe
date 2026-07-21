# Phase 2 連結式留守人綁定 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 讓登山客產生一次性邀請連結，透過 LINE 分享或複製交給留守人，留守人點連結自行完成綁定，雙方都收到確認。

**Architecture:** 沿用 `src/features/trips/invites.ts` 已驗證的 token-hash 邀請模式：32-byte 隨機 token 只以 SHA-256 雜湊落庫、消費時鎖列。邀請寫在既有 `line_bindings` 表新增的 `invite_token_hash` 欄位，與現有文字綁定碼流程同構（建列 → 消費即綁定）。Feature 層不碰 HTTP，以 discriminated result 回報失敗原因，由 API route 轉成狀態碼。

**Tech Stack:** Next.js 16（App Router）、React 19、drizzle-orm、postgres.js、zod 4、@line/liff 2、vitest + @testing-library/react（jsdom）

## Global Constraints

- 所有使用者可見文案一律經 `src/features/i18n/copy.ts` 的 `bilingual(中文, English)`，中文第一行、英文第二行，不得在元件裡寫死字串。
- UI 只用 Phase 1 既有共用元件 `Button`／`Card`／`Chip`／`Notice`／`Expander`（`app/components/`），本期不新增元件。
- 禁止 `window.prompt`／`window.confirm`／`window.alert`。
- 禁止 production code 出現 `console.log`；需要記錄用 `console.error` 並帶上下文。
- 每個檔案 <800 行、函式 <50 行、巢狀 ≤4 層。
- token 一律 `randomBytes(32).toString('base64url')`，資料庫只存 `createHash('sha256').update(token).digest('hex')`。
- 邀請效期 24 小時，寫入既有 `line_bindings.code_expires_at` 欄位。
- 單一使用者未過期且未使用的邀請上限 10 條，以具名常數 `pendingInviteLimit` 表示。
- commit 訊息格式 `<type>: <description>`，不加 Co-Authored-By 或任何署名。
- React 元件測試一律用 `fireEvent`（`@testing-library/react`），不用 `userEvent`——`@testing-library/user-event` 不在這個 repo 的 `devDependencies` 裡。文字斷言用逐字 `.textContent` 比對（`const el = await screen.findByRole(...); expect(el.textContent).toBe(copy.xxx)`），不用 `toHaveTextContent`——jest-dom 只正規化收到的 DOM 文字，不正規化比對字串，對含字面 `\n` 的雙語文案（`bilingual()` 產生）永遠比不中。若計畫某個 task 的測試片段仍寫著 `userEvent` 或 `toHaveTextContent`，視為筆誤，一律照此規則改寫，不要照抄。
- 測試指令一律 `npx vitest run <path>`。全套**不要**用裸 `npm test`——它會撈到 `.worktrees/quick-trip-creation`（無關分支）與需要本機 Postgres 的整合測試，兩者的失敗都不是回歸。全套一律用 `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`（本計畫開工前基準：43 files / 243 tests 全綠）。

## File Structure

**新增**

| 檔案 | 責任 |
| --- | --- |
| `app/trips/[tripId]/request-action.ts` | 包裝 fetch 的 throw 與 non-ok 兩條路徑，統一回 `{ ok, error }`（Task 0） |
| `drizzle/0012_guardian_invites.sql` | `line_bindings` 加 `invite_token_hash` |
| `src/db/transaction.ts` | `DatabaseHandle` 型別：root db handle 與 transaction handle 的聯集（Task 1b） |
| `src/features/line/guardian-invites.ts` | 邀請建立／查詢／接受的 domain 邏輯與 repository 介面 |
| `app/api/guardian-invites/route.ts` | `POST` 建立邀請 |
| `app/api/guardian-invites/[token]/route.ts` | `GET` 查詢邀請狀態 |
| `app/api/guardian-invites/accept/route.ts` | `POST` 驗證 idToken 並綁定，push 通知登山客 |
| `app/api/guardian-bindings/[id]/route.ts` | `DELETE` 撤銷綁定 |
| `app/guardians/page.tsx` | `/guardians` 伺服器殼層 |
| `app/guardians/GuardiansContent.tsx` | `/guardians` 客戶端互動（清單、邀請、分享、複製、撤銷、群組碼） |
| `app/guardian/accept/page.tsx` | `/guardian/accept` 伺服器殼層，讀 `searchParams.token` |
| `app/guardian/accept/AcceptInvite.tsx` | 留守人端 LIFF 登入與接受流程 |

**修改**

| 檔案 | 變更 |
| --- | --- |
| `app/trips/[tripId]/TripActions.tsx` | help／finish／extend 改用 `request-action` helper（Task 0） |
| `src/db/schema.ts` | `lineBindings` 加 `inviteTokenHash` |
| `src/features/trips/invites.ts` | repository 的 `any` 換成 `DatabaseHandle`，移除 `databaseTransaction(undefined)` 假值（Task 1b） |
| `src/env.ts` | 加 `NEXT_PUBLIC_LINE_OA_URL`（optional） |
| `src/features/i18n/copy.ts` | 新增邀請／撤銷／accept 文案 |
| `app/trips/new/TripForm.tsx` | 【建立留守綁定碼】換成【邀請留守人】＋【複製連結】 |
| `app/HomeContent.tsx` | 加 `/guardians` 入口 |

**測試**

`tests/features/trip-actions.test.tsx`（修改）、`tests/features/trip-invites.test.ts`（Task 1b 的重構基準，內容不改）、`tests/features/schema.test.ts`（修改）、`tests/features/env.test.ts`（修改）、`tests/features/i18n.test.ts`（修改）、`tests/features/new-trip-page.test.tsx`（修改）、`tests/features/home.test.tsx`（修改）、`tests/features/guardian-invites.test.ts`（新增）、`tests/api/guardian-invites.test.ts`（新增）、`tests/api/guardian-invites-accept.test.ts`（新增）、`tests/api/guardian-bindings.test.ts`（修改）、`tests/features/guardians-page.test.tsx`（新增）、`tests/features/guardian-accept-page.test.tsx`（新增）

## 實作者須知（避免踩到的三個坑）

1. **accept 頁不可使用 `LiffBootstrap`。** `LiffBootstrap` 會 POST `/api/auth/line`，那會替留守人建立 `users` 列並發 session cookie。留守人不是 HikeSafe 使用者，只是一條 `line_bindings`。accept 頁必須自己做最小的 `liff.init` → `liff.login()` → `liff.getIDToken()`，不碰 `/api/auth/line`。`/guardians` 頁則相反，它是登山客本人，要用 `LiffBootstrap`。
2. **接受成功後不清除 `invite_token_hash`。** 清掉之後 `GET /api/guardian-invites/{token}` 查不到列只能回 404，`status='used'` 永遠出不來。以 `boundAt` 判定已使用。
3. **不要用 `...databaseTransaction(undefined)` 建 `databaseRepository`。** 那是 Task 1b 移除掉的舊寫法：它把 repository 方法綁在 `undefined` 上，只有在所有公開函式都包在 `transaction()` 裡時才碰巧不炸。`readGuardianInvite` 是不包交易的讀取路徑，照抄舊 pattern 會在正式環境拋 TypeError（單元測試用 fake repository，抓不到這個 bug）。一律用 Task 1b 建立的 `repositoryFor(database: DatabaseHandle)` ＋ 非交易方法委派給 `transaction` 的寫法。
4. **`createGuardianInvite` 用 throw、`acceptGuardianInvite` 用 discriminated result，這是刻意的。** 前者只有一種失敗（超過上限），與既有 `createTripInvite` 同風格；後者有五種失敗原因要對映不同 HTTP 狀態碼，用 result 才不會靠字串比對錯誤訊息。不要為了「一致」把其中一邊改掉。

---

### Task 0: 修正 fetch 例外時無使用者可見錯誤（Phase 1 遺留）

**Files:**
- Create: `app/trips/[tripId]/request-action.ts`
- Modify: `app/trips/[tripId]/TripActions.tsx:104-161`
- Test: `tests/features/trip-actions.test.tsx`

**Interfaces:**
- Consumes: 無
- Produces: `requestAction(url: string, body: unknown): Promise<{ ok: boolean }>`

`extend`／`finish`／`help` 目前只在 `response.ok` 為 false 時顯示錯誤 `Notice`。離線時 `fetch` 直接 reject，`try/finally` 沒有 `catch`，例外往外拋、使用者只看到按鈕解鎖而沒有任何訊息。`help` 是求助情境，這是安全問題。

- [ ] **Step 1: 寫失敗測試**

加到 `tests/features/trip-actions.test.tsx`：

```tsx
it('shows an error notice when the help request cannot be sent at all', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
  render(<TripActions tripId="trip-1" initialState={initialState} />);

  fireEvent.click(screen.getByRole('button', { name: copy.needHelp }));
  fireEvent.click(screen.getByRole('button', { name: copy.confirmHelp }));

  const alert = await screen.findByRole('alert');
  expect(alert.textContent).toBe(copy.helpError);
});
```

`initialState` 沿用該檔案既有的 fixture；若尚未抽出，複製檔案內既有測試使用的物件。`fireEvent`（不是 `userEvent`——`@testing-library/user-event` 不在這個 repo 的依賴裡）與逐字 `.textContent` 比對（不是 `toHaveTextContent`——jest-dom 會正規化收到的文字但不會正規化比對字串，對含字面 `\n` 的雙語文案永遠比不中）都是這個測試檔既有的慣例，見同檔案 `helpConfirmation`／`checkInSuccess` 等既有斷言。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/trip-actions.test.tsx -t "cannot be sent at all"`
Expected: FAIL — 未捕捉的 rejection，或找不到 `role="alert"`

- [ ] **Step 3: 建立 helper**

`app/trips/[tripId]/request-action.ts`：

```ts
export const requestAction = async (url: string, body: unknown): Promise<{ ok: boolean }> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { ok: response.ok };
  } catch (error) {
    console.error('Trip action request failed', { url, error });
    return { ok: false };
  }
};
```

- [ ] **Step 4: 三處改用 helper**

`TripActions.tsx` 頂部加 `import { requestAction } from './request-action';`，然後：

```tsx
  const extend = async (minutes: number) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    setBusy(true);
    try {
      const { ok } = await requestAction(`/api/trips/${tripId}/extend`, {
        plannedFinishAt: new Date(Date.now() + minutes * 60_000).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
      setNotice(ok
        ? { tone: 'success', text: copy.finishTimeExtended }
        : { tone: 'error', text: copy.finishTimeExtensionError });
      if (ok) setOpenAction(undefined);
    } finally {
      setBusy(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    try {
      const location = await captureLocation();
      const { ok } = await requestAction(`/api/trips/${tripId}/finish`, {
        location, idempotencyKey: crypto.randomUUID(),
      });
      setNotice(ok
        ? { tone: 'success', text: copy.tripFinished }
        : { tone: 'error', text: copy.tripFinishError });
      if (ok) setOpenAction(undefined);
    } finally {
      setBusy(false);
    }
  };

  const help = async () => {
    setBusy(true);
    try {
      const location = await captureLocation();
      const { ok } = await requestAction(`/api/trips/${tripId}/help`, {
        message: helpMessage.trim() || undefined,
        location,
        idempotencyKey: crypto.randomUUID(),
      });
      setNotice(ok
        ? { tone: 'success', text: copy.helpConfirmation() }
        : { tone: 'error', text: copy.helpError });
      if (ok) { setOpenAction(undefined); setHelpMessage(''); }
    } finally {
      setBusy(false);
    }
  };
```

注意行為變更：失敗時**不再**收合 Expander、不清空 `helpMessage`，讓使用者可以直接重試。原本無論成敗都收合。

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/features/trip-actions.test.tsx`
Expected: PASS，全檔既有測試也要綠

- [ ] **Step 6: Commit**

```bash
git add app/trips/\[tripId\]/request-action.ts app/trips/\[tripId\]/TripActions.tsx tests/features/trip-actions.test.tsx
git commit -m "fix: surface an error notice when trip action requests never reach the server"
```

---

### Task 1: 資料庫欄位

**Files:**
- Create: `drizzle/0012_guardian_invites.sql`
- Modify: `src/db/schema.ts:201-214`
- Test: `tests/features/schema.test.ts`

**Interfaces:**
- Consumes: 無
- Produces: `lineBindings.inviteTokenHash`（drizzle column，`text('invite_token_hash')`，nullable、unique）

- [ ] **Step 1: 寫失敗測試**

加到 `tests/features/schema.test.ts`：

```ts
import { readFileSync } from 'node:fs';
import { getTableConfig } from 'drizzle-orm/pg-core';

it('stores only a hash of the guardian invite token', () => {
  const columns = getTableConfig(lineBindings).columns;
  const inviteToken = columns.find((column) => column.name === 'invite_token_hash');

  expect(inviteToken).toBeDefined();
  expect(inviteToken?.notNull).toBe(false);
  expect(inviteToken?.isUnique).toBe(true);
  expect(columns.map((column) => column.name)).not.toContain('invite_token');
});

it('ships a migration that adds the guardian invite column', () => {
  const migration = readFileSync('drizzle/0012_guardian_invites.sql', 'utf8');
  expect(migration).toMatch(/ALTER TABLE line_bindings\s+ADD COLUMN invite_token_hash text UNIQUE/i);
});
```

`readFileSync` 與 `getTableConfig` 該檔案頂部已 import，重複的 import 不要再加。

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/schema.test.ts`
Expected: FAIL — `inviteToken` 為 undefined、找不到 migration 檔

- [ ] **Step 3: 建立 migration**

`drizzle/0012_guardian_invites.sql`：

```sql
ALTER TABLE line_bindings ADD COLUMN invite_token_hash text UNIQUE;
```

- [ ] **Step 4: 更新 schema**

`src/db/schema.ts` 的 `lineBindings`，在 `bindingCode` 那行下面加：

```ts
  inviteTokenHash: text('invite_token_hash').unique(),
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/features/schema.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add drizzle/0012_guardian_invites.sql src/db/schema.ts tests/features/schema.test.ts
git commit -m "feat: add guardian invite token hash column"
```

---

### Task 1b: drizzle repository 的共用型別

**Files:**
- Create: `src/db/transaction.ts`
- Modify: `src/features/trips/invites.ts:48-91`
- Test: `tests/features/trip-invites.test.ts`

**Interfaces:**
- Consumes: `src/db/schema`
- Produces: `type DatabaseHandle`（`src/db/transaction.ts`）——root db handle 與 transaction handle 的聯集，repository 查詢函式收這個型別就能在交易內外共用。

現有 `src/features/trips/invites.ts:56` 寫 `function databaseTransaction(database: any)`，並用 `...databaseTransaction(undefined)` 建立 `databaseRepository`。那個 `undefined` 是為了滿足型別而塞的假值：只有在**所有**公開函式都包在 `repository.transaction()` 裡時才碰巧安全，因為那些展開出來的方法永遠不會真的被呼叫。這個隱形前提很脆——Task 2 的 `readGuardianInvite` 就是一個不需要交易的讀取路徑，照抄這個 pattern 會直接呼叫到綁在 `undefined` 上的方法而拋 TypeError。

本 task 把型別補正，讓那個假值在編譯期就不可能存在，並改用「非交易方法一律委派給 `transaction`」的統一寫法。

下面 `DatabaseHandle` 的定義已用 `npx tsc --noEmit` 對 `select/from/where/for('update')/limit`、`insert/values`、`update/set/where/returning` 三組實際用法驗證過，drizzle-orm 0.45.2 下編譯乾淨。

- [ ] **Step 1: 建立型別檔**

`src/db/transaction.ts`：

```ts
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import type { PostgresJsDatabase, PostgresJsTransaction } from 'drizzle-orm/postgres-js';

import type * as schema from './schema';

type Schema = typeof schema;

/**
 * Either the root database handle or a transaction handle. Repository helpers
 * accept both so the same query code runs inside and outside a transaction.
 */
export type DatabaseHandle =
  | PostgresJsDatabase<Schema>
  | PostgresJsTransaction<Schema, ExtractTablesWithRelations<Schema>>;
```

- [ ] **Step 2: 執行既有測試建立基準**

Run: `npx vitest run tests/features/trip-invites.test.ts`
Expected: PASS（2 個測試）。這是重構前的綠燈基準——本 task 不改行為，測試自始至終都該是綠的。

- [ ] **Step 3: 改寫 invites.ts 的 repository**

`src/features/trips/invites.ts` 的 `databaseRepository` 與 `databaseTransaction`（第 48–91 行）整段換成：

```ts
const repositoryFor = (database: DatabaseHandle): TripInviteRepository => ({
  transaction: async (operation) => operation(repositoryFor(database)),
  async isDraftOwner(tripId, userId) {
    const [{ and, eq }, { trips }] = await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
    const [trip] = await database.select({ id: trips.id }).from(trips).where(and(eq(trips.id, tripId), eq(trips.ownerUserId, userId), eq(trips.status, 'draft'))).limit(1);
    return Boolean(trip);
  },
  async insertInvite(value) {
    const [{ tripInvites }] = await Promise.all([import('@/src/db/schema')]);
    await database.insert(tripInvites).values(value);
  },
  async consumeInvite({ tokenHash, userId, now }) {
    const [{ and, eq, gt, isNull }, { tripInvites, trips }] = await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
    const [candidate] = await database.select({ id: tripInvites.id, tripId: tripInvites.tripId }).from(tripInvites)
      .innerJoin(trips, eq(trips.id, tripInvites.tripId))
      .where(and(eq(tripInvites.tokenHash, tokenHash), gt(tripInvites.expiresAt, now), isNull(tripInvites.acceptedAt), eq(trips.status, 'draft'))).for('update').limit(1);
    if (!candidate) return undefined;
    const [invite] = await database.update(tripInvites).set({ acceptedByUserId: userId, acceptedAt: now })
      .where(and(eq(tripInvites.id, candidate.id), isNull(tripInvites.acceptedAt))).returning({ tripId: tripInvites.tripId });
    return invite?.tripId;
  },
  async addMember({ tripId, userId }) {
    const [{ tripMembers }] = await Promise.all([import('@/src/db/schema')]);
    const [member] = await database.insert(tripMembers).values({ tripId, userId, role: 'member' }).onConflictDoNothing().returning({ id: tripMembers.id });
    if (!member) throw new Error('Already a trip member');
  },
  async designateDeputy({ tripId, userId }) {
    const [{ and, eq, sql }, { tripMembers }] = await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
    const [member] = await database.select({ id: tripMembers.id }).from(tripMembers).where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId))).limit(1);
    if (!member) throw new Error('Trip membership is required');
    await database.update(tripMembers).set({ role: 'member' }).where(and(eq(tripMembers.tripId, tripId), sql`${tripMembers.role} = 'deputy'`));
    await database.update(tripMembers).set({ role: 'deputy' }).where(eq(tripMembers.id, member.id));
  },
});

const databaseRepository: TripInviteRepository = {
  transaction: async (operation) => {
    const { db } = await import('@/src/db/client');
    return db.transaction(async (transaction) => operation(repositoryFor(transaction)));
  },
  isDraftOwner: (tripId, userId) => databaseRepository.transaction((repository) => repository.isDraftOwner(tripId, userId)),
  insertInvite: (input) => databaseRepository.transaction((repository) => repository.insertInvite(input)),
  consumeInvite: (input) => databaseRepository.transaction((repository) => repository.consumeInvite(input)),
  addMember: (input) => databaseRepository.transaction((repository) => repository.addMember(input)),
  designateDeputy: (input) => databaseRepository.transaction((repository) => repository.designateDeputy(input)),
};
```

檔案頂部加 `import type { DatabaseHandle } from '@/src/db/transaction';`。查詢邏輯逐行沒有改動，只換了外層組裝方式與 `database` 的型別。

- [ ] **Step 4: 執行測試確認仍然通過**

Run: `npx vitest run tests/features/trip-invites.test.ts`
Expected: PASS，仍是 2 個測試。行為未變，測試不需修改——若測試變紅，是重構寫錯了，不要改測試。

- [ ] **Step 5: 型別檢查**

Run: `npx tsc --noEmit`
Expected: 無錯誤，且 `src/features/trips/invites.ts` 內不再有 `any`

- [ ] **Step 6: Commit**

```bash
git add src/db/transaction.ts src/features/trips/invites.ts
git commit -m "refactor: type drizzle repository handles instead of any"
```

---

### Task 2: 邀請 domain 邏輯

**Files:**
- Create: `src/features/line/guardian-invites.ts`
- Test: `tests/features/guardian-invites.test.ts`

**Interfaces:**
- Consumes: `lineBindings`、`users`（`src/db/schema`）
- Produces:
  - `type GuardianInviteStatus = 'pending' | 'expired' | 'used' | 'revoked'`
  - `interface GuardianInviteRow { id; userId; inviterDisplayName; inviterLineUserId; expiresAt: Date; boundAt: Date | null; revokedAt: Date | null }`
  - `interface GuardianInviteRepository`（見 Step 3）
  - `pendingInviteLimit: 10`
  - `createGuardianInvite({ userId, now }, repository?, dependencies?): Promise<{ token: string; expiresAt: Date }>`（超過上限時 throw `'Too many pending guardian invites'`）
  - `readGuardianInvite({ token, now }, repository?): Promise<{ inviterDisplayName: string; expiresAt: Date; status: GuardianInviteStatus } | undefined>`
  - `acceptGuardianInvite({ token, lineUserId, displayName, now }, repository?): Promise<AcceptGuardianInviteResult>`
  - `type AcceptGuardianInviteResult = { ok: true; bindingId: string; inviterDisplayName: string; inviterLineUserId: string } | { ok: false; reason: 'not_found' | 'expired' | 'used' | 'revoked' | 'already_bound' }`

- [ ] **Step 1: 寫失敗測試**

`tests/features/guardian-invites.test.ts`：

```ts
import { describe, expect, it } from 'vitest';

import {
  acceptGuardianInvite,
  createGuardianInvite,
  pendingInviteLimit,
  readGuardianInvite,
  type GuardianInviteRepository,
  type GuardianInviteRow,
} from '@/src/features/line/guardian-invites';

const base = new Date('2026-07-21T00:00:00Z');
const later = (minutes: number) => new Date(base.getTime() + minutes * 60_000);

const repository = () => {
  const rows = new Map<string, GuardianInviteRow>();
  const bindings: Array<{ userId: string; lineUserId: string }> = [];
  const store: GuardianInviteRepository & { rows: typeof rows; bindings: typeof bindings } = {
    rows, bindings,
    transaction: async (operation) => operation(store),
    countPendingInvites: async ({ userId, now }) => [...rows.values()].filter(
      (row) => row.userId === userId && !row.boundAt && !row.revokedAt && row.expiresAt > now,
    ).length,
    insertInvite: async ({ userId, tokenHash, expiresAt }) => {
      rows.set(tokenHash, {
        id: `binding-${rows.size + 1}`, userId, inviterDisplayName: '阿山',
        inviterLineUserId: 'U-hiker', expiresAt, boundAt: null, revokedAt: null,
      });
    },
    findInvite: async (tokenHash) => rows.get(tokenHash),
    hasActiveBinding: async ({ userId, lineUserId }) =>
      bindings.some((binding) => binding.userId === userId && binding.lineUserId === lineUserId),
    bindInvite: async ({ id, lineUserId, now }) => {
      const row = [...rows.values()].find((candidate) => candidate.id === id);
      if (!row || row.boundAt || row.revokedAt || row.expiresAt <= now) return undefined;
      row.boundAt = now;
      bindings.push({ userId: row.userId, lineUserId });
      return row.id;
    },
  };
  return store;
};

describe('guardian invites', () => {
  it('creates a 24-hour invite that stores only a hash of the token', async () => {
    const store = repository();
    const { token, expiresAt } = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);

    expect(expiresAt).toEqual(new Date(base.getTime() + 24 * 60 * 60_000));
    expect([...store.rows.keys()]).toHaveLength(1);
    expect([...store.rows.keys()][0]).not.toBe(token);
    expect([...store.rows.keys()][0]).toMatch(/^[0-9a-f]{64}$/);
  });

  it('refuses to create more than the pending invite limit', async () => {
    const store = repository();
    for (let index = 0; index < pendingInviteLimit; index += 1) {
      await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    }

    await expect(createGuardianInvite({ userId: 'hiker-1', now: base }, store))
      .rejects.toThrow('Too many pending guardian invites');
    await expect(createGuardianInvite({ userId: 'hiker-2', now: base }, store)).resolves.toBeDefined();
  });

  it('reports every invite status without leaking the token', async () => {
    const store = repository();
    const { token } = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);

    await expect(readGuardianInvite({ token, now: later(1) }, store))
      .resolves.toEqual({ inviterDisplayName: '阿山', expiresAt: later(24 * 60), status: 'pending' });
    await expect(readGuardianInvite({ token, now: later(24 * 60 + 1) }, store))
      .resolves.toMatchObject({ status: 'expired' });
    await expect(readGuardianInvite({ token: 'unknown-token', now: later(1) }, store))
      .resolves.toBeUndefined();
  });

  it('binds the guardian once and rejects replay of the same link', async () => {
    const store = repository();
    const { token } = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);

    await expect(acceptGuardianInvite(
      { token, lineUserId: 'U-guardian', displayName: '小美', now: later(1) }, store,
    )).resolves.toEqual({
      ok: true, bindingId: 'binding-1', inviterDisplayName: '阿山', inviterLineUserId: 'U-hiker',
    });
    await expect(acceptGuardianInvite(
      { token, lineUserId: 'U-other', displayName: '阿明', now: later(2) }, store,
    )).resolves.toEqual({ ok: false, reason: 'used' });
    await expect(readGuardianInvite({ token, now: later(2) }, store))
      .resolves.toMatchObject({ status: 'used' });
  });

  it('rejects expired, revoked, unknown, and duplicate acceptances', async () => {
    const store = repository();
    const expired = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    const revoked = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    const duplicate = await createGuardianInvite({ userId: 'hiker-1', now: base }, store);
    store.bindings.push({ userId: 'hiker-1', lineUserId: 'U-guardian' });
    [...store.rows.values()][1].revokedAt = later(1);

    const accept = (token: string, now: Date) =>
      acceptGuardianInvite({ token, lineUserId: 'U-guardian', displayName: '小美', now }, store);

    await expect(accept(expired.token, later(24 * 60 + 1))).resolves.toEqual({ ok: false, reason: 'expired' });
    await expect(accept(revoked.token, later(2))).resolves.toEqual({ ok: false, reason: 'revoked' });
    await expect(accept('unknown-token', later(2))).resolves.toEqual({ ok: false, reason: 'not_found' });
    await expect(accept(duplicate.token, later(2))).resolves.toEqual({ ok: false, reason: 'already_bound' });
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/guardian-invites.test.ts`
Expected: FAIL — 找不到模組 `@/src/features/line/guardian-invites`

- [ ] **Step 3: 實作**

`src/features/line/guardian-invites.ts`：

```ts
import { createHash, randomBytes } from 'node:crypto';

const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export const pendingInviteLimit = 10;
const inviteLifetimeMs = 24 * 60 * 60_000;

export type GuardianInviteStatus = 'pending' | 'expired' | 'used' | 'revoked';

export interface GuardianInviteRow {
  id: string;
  userId: string;
  inviterDisplayName: string;
  inviterLineUserId: string;
  expiresAt: Date;
  boundAt: Date | null;
  revokedAt: Date | null;
}

export type AcceptGuardianInviteResult =
  | { ok: true; bindingId: string; inviterDisplayName: string; inviterLineUserId: string }
  | { ok: false; reason: 'not_found' | 'expired' | 'used' | 'revoked' | 'already_bound' };

export interface GuardianInviteRepository {
  transaction<T>(operation: (repository: GuardianInviteRepository) => Promise<T>): Promise<T>;
  countPendingInvites(input: { userId: string; now: Date }): Promise<number>;
  insertInvite(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findInvite(tokenHash: string, lock?: boolean): Promise<GuardianInviteRow | undefined>;
  hasActiveBinding(input: { userId: string; lineUserId: string }): Promise<boolean>;
  bindInvite(input: { id: string; lineUserId: string; displayName: string; now: Date }): Promise<string | undefined>;
}

const statusOf = (row: GuardianInviteRow, now: Date): GuardianInviteStatus => {
  if (row.revokedAt) return 'revoked';
  if (row.boundAt) return 'used';
  if (row.expiresAt <= now) return 'expired';
  return 'pending';
};

export const createGuardianInvite = async (
  { userId, now }: { userId: string; now: Date },
  repository: GuardianInviteRepository = databaseRepository,
  dependencies: { token?: () => string } = {},
) => repository.transaction(async (transaction) => {
  if (await transaction.countPendingInvites({ userId, now }) >= pendingInviteLimit) {
    throw new Error('Too many pending guardian invites');
  }
  const token = dependencies.token?.() ?? randomBytes(32).toString('base64url');
  const expiresAt = new Date(now.getTime() + inviteLifetimeMs);
  await transaction.insertInvite({ userId, tokenHash: hash(token), expiresAt });
  return { token, expiresAt };
});

export const readGuardianInvite = async (
  { token, now }: { token: string; now: Date },
  repository: GuardianInviteRepository = databaseRepository,
) => {
  const row = await repository.findInvite(hash(token));
  if (!row) return undefined;
  return {
    inviterDisplayName: row.inviterDisplayName,
    expiresAt: row.expiresAt,
    status: statusOf(row, now),
  };
};

export const acceptGuardianInvite = async (
  { token, lineUserId, displayName, now }:
    { token: string; lineUserId: string; displayName: string; now: Date },
  repository: GuardianInviteRepository = databaseRepository,
): Promise<AcceptGuardianInviteResult> => repository.transaction(async (transaction) => {
  const row = await transaction.findInvite(hash(token), true);
  if (!row) return { ok: false, reason: 'not_found' };

  const status = statusOf(row, now);
  if (status !== 'pending') return { ok: false, reason: status };
  if (await transaction.hasActiveBinding({ userId: row.userId, lineUserId })) {
    return { ok: false, reason: 'already_bound' };
  }

  const bindingId = await transaction.bindInvite({ id: row.id, lineUserId, displayName, now });
  if (!bindingId) return { ok: false, reason: 'used' };
  return {
    ok: true,
    bindingId,
    inviterDisplayName: row.inviterDisplayName,
    inviterLineUserId: row.inviterLineUserId,
  };
});
```

- [ ] **Step 4: 實作資料庫 repository**

接在同一個檔案後面，形狀照抄 Task 1b 改造後的 `src/features/trips/invites.ts`（**不是**改造前那版——舊版的 `...databaseTransaction(undefined)` 會讓 `readGuardianInvite` 這種不包交易的讀取路徑打到 `undefined.select()`）。檔案頂部加 `import type { DatabaseHandle } from '@/src/db/transaction';`：

```ts
const repositoryFor = (database: DatabaseHandle): GuardianInviteRepository => {
  return {
    transaction: async (operation) => operation(repositoryFor(database)),
    async countPendingInvites({ userId, now }) {
      const [{ and, eq, gt, isNotNull, isNull }, { lineBindings }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const rows = await database.select({ id: lineBindings.id }).from(lineBindings).where(and(
        eq(lineBindings.userId, userId),
        isNotNull(lineBindings.inviteTokenHash),
        isNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
        gt(lineBindings.codeExpiresAt, now),
      ));
      return rows.length;
    },
    async insertInvite({ userId, tokenHash, expiresAt }) {
      const [{ lineBindings }] = await Promise.all([import('@/src/db/schema')]);
      await database.insert(lineBindings).values({
        userId, inviteTokenHash: tokenHash, codeExpiresAt: expiresAt,
      });
    },
    async findInvite(tokenHash, lock = false) {
      const [{ eq }, { lineBindings, users }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const query = database.select({
        id: lineBindings.id, userId: lineBindings.userId,
        inviterDisplayName: users.displayName, inviterLineUserId: users.lineUserId,
        expiresAt: lineBindings.codeExpiresAt, boundAt: lineBindings.boundAt,
        revokedAt: lineBindings.revokedAt,
      }).from(lineBindings)
        .innerJoin(users, eq(lineBindings.userId, users.id))
        .where(eq(lineBindings.inviteTokenHash, tokenHash));
      const [row] = await (lock ? query.for('update') : query).limit(1);
      return row;
    },
    async hasActiveBinding({ userId, lineUserId }) {
      const [{ and, eq, isNotNull, isNull }, { lineBindings }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const [row] = await database.select({ id: lineBindings.id }).from(lineBindings).where(and(
        eq(lineBindings.userId, userId),
        eq(lineBindings.sourceType, 'user'),
        eq(lineBindings.sourceId, lineUserId),
        isNotNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
      )).limit(1);
      return Boolean(row);
    },
    async bindInvite({ id, lineUserId, displayName, now }) {
      const [{ and, eq, gt, isNull }, { lineBindings }] =
        await Promise.all([import('drizzle-orm'), import('@/src/db/schema')]);
      const [row] = await database.update(lineBindings).set({
        sourceType: 'user', sourceId: lineUserId, displayName, boundAt: now,
      }).where(and(
        eq(lineBindings.id, id),
        isNull(lineBindings.boundAt),
        isNull(lineBindings.revokedAt),
        gt(lineBindings.codeExpiresAt, now),
      )).returning({ id: lineBindings.id });
      return row?.id;
    },
  };
};

const databaseRepository: GuardianInviteRepository = {
  transaction: async (operation) => {
    const { db } = await import('@/src/db/client');
    return db.transaction(async (transaction) => operation(repositoryFor(transaction)));
  },
  countPendingInvites: (input) => databaseRepository.transaction((repository) => repository.countPendingInvites(input)),
  insertInvite: (input) => databaseRepository.transaction((repository) => repository.insertInvite(input)),
  findInvite: (tokenHash, lock) => databaseRepository.transaction((repository) => repository.findInvite(tokenHash, lock)),
  hasActiveBinding: (input) => databaseRepository.transaction((repository) => repository.hasActiveBinding(input)),
  bindInvite: (input) => databaseRepository.transaction((repository) => repository.bindInvite(input)),
};
```

兩個刻意的設計，不要「順手改掉」：

- `bindInvite` 不寫 `inviteTokenHash: null`——保留雜湊才能在接受後回報 `used`。
- `findInvite` 的 `lock` 預設 false。只有 `acceptGuardianInvite` 傳 `true`（它接著要寫入，需要鎖列）；`readGuardianInvite` 是公開端點 `GET /api/guardian-invites/{token}` 的讀取路徑，不該對同一 token 的並行請求上 `FOR UPDATE` 鎖而互相排隊。

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/features/guardian-invites.test.ts`
Expected: PASS，5 個測試全綠

- [ ] **Step 6: Commit**

```bash
git add src/features/line/guardian-invites.ts tests/features/guardian-invites.test.ts
git commit -m "feat: add guardian invite token domain logic"
```

---

### Task 3: 文案與環境變數

**Files:**
- Modify: `src/features/i18n/copy.ts`, `src/env.ts`
- Test: `tests/features/i18n.test.ts`, `tests/features/env.test.ts`

**Interfaces:**
- Consumes: `bilingual`（`src/features/i18n/copy.ts:1`）
- Produces: 下列 `copy` 鍵與 `env.NEXT_PUBLIC_LINE_OA_URL?: string`

- [ ] **Step 1: 寫失敗測試**

加到 `tests/features/i18n.test.ts`：

```ts
it('keeps the guardian invite copy bilingual', () => {
  expect(copy.inviteGuardian).toBe('邀請留守人\nInvite a guardian');
  expect(copy.copyInviteLink).toBe('複製邀請連結\nCopy invite link');
  expect(copy.acceptInviteTitle('阿山')).toBe(
    '阿山 邀請你擔任留守人\n阿山 invited you to be their guardian',
  );
  expect(copy.guardianBoundNotice('小美')).toBe(
    '小美 已成為你的留守人。\n小美 is now your guardian.',
  );
  expect(copy.alreadyGuardian('阿山')).toBe(
    '你已經是 阿山 的留守人。\nYou are already a guardian for 阿山.',
  );
});
```

加到 `tests/features/env.test.ts`：

```ts
it('treats the official account link as optional', () => {
  const required = {
    DATABASE_URL: 'postgres://localhost/besafe',
    LINE_CHANNEL_ID: 'line', LINE_CHANNEL_SECRET: 'secret', LINE_CHANNEL_ACCESS_TOKEN: 'token',
    SESSION_SECRET: 'a'.repeat(32), JOB_SECRET: 'b'.repeat(32),
    GRANT_TOKEN_SECRET: 'c'.repeat(32), NEXT_PUBLIC_LIFF_ID: 'liff',
  };

  expect(parseEnv(required).NEXT_PUBLIC_LINE_OA_URL).toBeUndefined();
  expect(parseEnv({ ...required, NEXT_PUBLIC_LINE_OA_URL: 'https://line.me/R/ti/p/@hikesafe' })
    .NEXT_PUBLIC_LINE_OA_URL).toBe('https://line.me/R/ti/p/@hikesafe');
  expect(() => parseEnv({ ...required, NEXT_PUBLIC_LINE_OA_URL: 'not-a-url' })).toThrow();
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/i18n.test.ts tests/features/env.test.ts`
Expected: FAIL — `copy.inviteGuardian` 為 undefined、`NEXT_PUBLIC_LINE_OA_URL` 不在 schema

- [ ] **Step 3: 加入文案**

`src/features/i18n/copy.ts` 的 `copy` 物件內（靜態鍵放在 `createBindingCode` 附近、函式鍵放在檔案結尾的函式區）：

```ts
  myGuardians: bilingual('我的留守人', 'My guardians'),
  guardiansTitle: bilingual('留守人管理', 'Guardian management'),
  noGuardianBindings: bilingual('尚未綁定任何留守人。', 'No guardian is bound yet.'),
  inviteGuardian: bilingual('邀請留守人', 'Invite a guardian'),
  shareInviteToLine: bilingual('分享到 LINE', 'Share to LINE'),
  copyInviteLink: bilingual('複製邀請連結', 'Copy invite link'),
  inviteLinkCopied: bilingual('邀請連結已複製。', 'The invite link was copied.'),
  inviteCreateError: bilingual('無法建立邀請連結。', 'The invite link could not be created.'),
  inviteLimitReached: bilingual(
    '未使用的邀請太多，請等既有邀請被接受或過期後再試。',
    'Too many unused invites. Wait until existing invites are accepted or expire.',
  ),
  revokeBinding: bilingual('撤銷', 'Revoke'),
  revokeBindingError: bilingual('無法撤銷這個綁定。', 'The binding could not be revoked.'),
  groupBindingSection: bilingual('群組綁定（進階）', 'Group binding (advanced)'),
  acceptInviteAction: bilingual('成為留守人', 'Become a guardian'),
  inviteNotFound: bilingual('找不到這個邀請。', 'This invite could not be found.'),
  inviteExpired: bilingual(
    '這個邀請已過期，請登山客重新邀請。',
    'This invite has expired. Ask the hiker to send a new one.',
  ),
  inviteUsed: bilingual(
    '這個邀請已被使用，請登山客重新邀請。',
    'This invite was already used. Ask the hiker to send a new one.',
  ),
  inviteRevoked: bilingual('這個邀請已被取消。', 'This invite was cancelled.'),
  acceptInviteError: bilingual('無法完成綁定，請稍後再試。', 'The binding could not be completed. Try again later.'),
  addOfficialAccount: bilingual(
    '請加入 HikeSafe 官方帳號好友，否則收不到警示通知。',
    'Add the HikeSafe official account as a friend, otherwise you will not receive alerts.',
  ),
```

函式鍵（放在檔案結尾 `reportEvacuationPoints` 之前）：

```ts
  inviteExpiresAt: (time: string) => bilingual(`邀請有效至 ${time}`, `Invite valid until ${time}`),
  inviteShareMessage: (inviterName: string, url: string) => bilingual(
    `${inviterName} 邀請你擔任登山留守人，點連結完成綁定：${url}`,
    `${inviterName} invited you to be their hiking guardian. Open this link to accept: ${url}`,
  ),
  acceptInviteTitle: (inviterName: string) => bilingual(
    `${inviterName} 邀請你擔任留守人`,
    `${inviterName} invited you to be their guardian`,
  ),
  acceptInviteSuccess: (inviterName: string) => bilingual(
    `你已成為 ${inviterName} 的留守人。`,
    `You are now a guardian for ${inviterName}.`,
  ),
  alreadyGuardian: (inviterName: string) => bilingual(
    `你已經是 ${inviterName} 的留守人。`,
    `You are already a guardian for ${inviterName}.`,
  ),
  guardianBoundNotice: (guardianName: string) => bilingual(
    `${guardianName} 已成為你的留守人。`,
    `${guardianName} is now your guardian.`,
  ),
```

- [ ] **Step 4: 加入環境變數**

`src/env.ts` 的 schema 內，`NEXT_PUBLIC_LIFF_ID` 那行下面：

```ts
  NEXT_PUBLIC_LINE_OA_URL: z.string().url().optional(),
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/features/i18n.test.ts tests/features/env.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/i18n/copy.ts src/env.ts tests/features/i18n.test.ts tests/features/env.test.ts
git commit -m "feat: add guardian invite copy and optional official account link"
```

---

### Task 4: 建立與查詢邀請 API

**Files:**
- Create: `app/api/guardian-invites/route.ts`, `app/api/guardian-invites/[token]/route.ts`
- Test: `tests/api/guardian-invites.test.ts`

**Interfaces:**
- Consumes: `createGuardianInvite`、`readGuardianInvite`（Task 2）、`sessionCookie`／`verifySession`（`src/features/auth/session`）、`getEnv`（`src/env`）
- Produces:
  - `POST /api/guardian-invites` → 201 `{ inviteUrl: string; expiresAt: string }`｜401｜409
  - `GET /api/guardian-invites/{token}` → 200 `{ inviterDisplayName: string; expiresAt: string; status: GuardianInviteStatus }`｜404

- [ ] **Step 1: 寫失敗測試**

`tests/api/guardian-invites.test.ts`：

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/auth/session', () => ({
  verifySession: vi.fn(), sessionCookie: { name: 'besafe_session' },
}));
vi.mock('@/src/features/line/guardian-invites', () => ({
  createGuardianInvite: vi.fn(), readGuardianInvite: vi.fn(),
}));
vi.mock('@/src/env', () => ({ getEnv: () => ({ NEXT_PUBLIC_LIFF_ID: 'liff-1' }) }));

import { POST } from '@/app/api/guardian-invites/route';
import { GET } from '@/app/api/guardian-invites/[token]/route';
import { verifySession } from '@/src/features/auth/session';
import { createGuardianInvite, readGuardianInvite } from '@/src/features/line/guardian-invites';

const authenticated = () => new Request('http://localhost/api/guardian-invites', {
  method: 'POST', headers: { cookie: 'besafe_session=session' },
});

describe('guardian invites API', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    vi.mocked(createGuardianInvite).mockReset();
    vi.mocked(readGuardianInvite).mockReset();
  });

  it('rejects invite creation without a session', async () => {
    const response = await POST(new Request('http://localhost/api/guardian-invites', { method: 'POST' }));

    expect(response.status).toBe(401);
    expect(createGuardianInvite).not.toHaveBeenCalled();
  });

  it('returns a LIFF invite url for the authenticated hiker', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'hiker-1', lineUserId: 'U-hiker', expiresAt: new Date() });
    vi.mocked(createGuardianInvite).mockResolvedValue({
      token: 'invite-token', expiresAt: new Date('2026-07-22T00:00:00.000Z'),
    });

    const response = await POST(authenticated());

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      inviteUrl: 'https://liff.line.me/liff-1/guardian/accept?token=invite-token',
      expiresAt: '2026-07-22T00:00:00.000Z',
    });
    expect(createGuardianInvite).toHaveBeenCalledWith(expect.objectContaining({ userId: 'hiker-1' }));
  });

  it('reports the pending invite limit as a conflict', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'hiker-1', lineUserId: 'U-hiker', expiresAt: new Date() });
    vi.mocked(createGuardianInvite).mockRejectedValue(new Error('Too many pending guardian invites'));

    expect((await POST(authenticated())).status).toBe(409);
  });

  it('exposes the invite status to an unauthenticated holder of the token', async () => {
    vi.mocked(readGuardianInvite).mockResolvedValue({
      inviterDisplayName: '阿山', expiresAt: new Date('2026-07-22T00:00:00.000Z'), status: 'pending',
    });

    const response = await GET(
      new Request('http://localhost/api/guardian-invites/invite-token'),
      { params: Promise.resolve({ token: 'invite-token' }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      inviterDisplayName: '阿山', expiresAt: '2026-07-22T00:00:00.000Z', status: 'pending',
    });
  });

  it('returns 404 for an unknown token', async () => {
    vi.mocked(readGuardianInvite).mockResolvedValue(undefined);

    expect((await GET(
      new Request('http://localhost/api/guardian-invites/nope'),
      { params: Promise.resolve({ token: 'nope' }) },
    )).status).toBe(404);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/api/guardian-invites.test.ts`
Expected: FAIL — 找不到 route 模組

- [ ] **Step 3: 實作 POST**

`app/api/guardian-invites/route.ts`：

```ts
import { NextResponse } from 'next/server';

import { getEnv } from '@/src/env';
import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { createGuardianInvite } from '@/src/features/line/guardian-invites';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const POST = async (request: Request) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session;
  try { session = await verifySession(token); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  try {
    const invite = await createGuardianInvite({ userId: session.userId, now: new Date() });
    return NextResponse.json({
      inviteUrl: `https://liff.line.me/${getEnv().NEXT_PUBLIC_LIFF_ID}/guardian/accept?token=${invite.token}`,
      expiresAt: invite.expiresAt.toISOString(),
    }, { status: 201 });
  } catch (error) {
    console.error('Guardian invite creation failed', { userId: session.userId, error });
    return NextResponse.json({ error: 'Too many pending guardian invites' }, { status: 409 });
  }
};
```

- [ ] **Step 4: 實作 GET**

`app/api/guardian-invites/[token]/route.ts`：

```ts
import { NextResponse } from 'next/server';

import { readGuardianInvite } from '@/src/features/line/guardian-invites';

export const GET = async (_request: Request, { params }: { params: Promise<{ token: string }> }) => {
  const invite = await readGuardianInvite({ ...(await params), now: new Date() });
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
  return NextResponse.json({
    inviterDisplayName: invite.inviterDisplayName,
    expiresAt: invite.expiresAt.toISOString(),
    status: invite.status,
  });
};
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/api/guardian-invites.test.ts`
Expected: PASS，5 個測試全綠

- [ ] **Step 6: Commit**

```bash
git add app/api/guardian-invites tests/api/guardian-invites.test.ts
git commit -m "feat: add guardian invite creation and lookup endpoints"
```

---

### Task 5: 接受邀請 API

**Files:**
- Create: `app/api/guardian-invites/accept/route.ts`
- Test: `tests/api/guardian-invites-accept.test.ts`

**Interfaces:**
- Consumes: `acceptGuardianInvite`（Task 2）、`verifyLineIdToken`（`src/integrations/line/verify-id-token`）、`pushLineMessage`（`src/integrations/line/client`）、`copy.guardianBoundNotice`（Task 3）
- Produces: `POST /api/guardian-invites/accept`，body `{ token: string; idToken: string }` → 200 `{ inviterDisplayName: string }`｜400｜401｜404｜409 `{ reason }`｜410

失敗原因對映：`not_found`→404、`used`／`revoked`／`already_bound`→409（body 帶 `reason`）、`expired`→410。給登山客的 push 失敗只記 log，不影響回應——留守人已經綁定成功了。

- [ ] **Step 1: 寫失敗測試**

`tests/api/guardian-invites-accept.test.ts`：

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/features/line/guardian-invites', () => ({ acceptGuardianInvite: vi.fn() }));
vi.mock('@/src/integrations/line/verify-id-token', () => ({ verifyLineIdToken: vi.fn() }));
vi.mock('@/src/integrations/line/client', () => ({ pushLineMessage: vi.fn() }));

import { POST } from '@/app/api/guardian-invites/accept/route';
import { acceptGuardianInvite } from '@/src/features/line/guardian-invites';
import { verifyLineIdToken } from '@/src/integrations/line/verify-id-token';
import { pushLineMessage } from '@/src/integrations/line/client';

const request = (body: unknown) => new Request('http://localhost/api/guardian-invites/accept', {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

describe('POST /api/guardian-invites/accept', () => {
  beforeEach(() => {
    vi.mocked(acceptGuardianInvite).mockReset();
    vi.mocked(verifyLineIdToken).mockReset();
    vi.mocked(pushLineMessage).mockReset().mockResolvedValue(undefined);
  });

  it('rejects a malformed body before touching LINE', async () => {
    expect((await POST(request({ token: 'invite-token' }))).status).toBe(400);
    expect(verifyLineIdToken).not.toHaveBeenCalled();
  });

  it('rejects an invalid LINE identity token', async () => {
    vi.mocked(verifyLineIdToken).mockRejectedValue(new Error('Invalid LINE identity token'));

    expect((await POST(request({ token: 'invite-token', idToken: 'bad' }))).status).toBe(401);
    expect(acceptGuardianInvite).not.toHaveBeenCalled();
  });

  it('binds the guardian and notifies the hiker', async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({ lineUserId: 'U-guardian', displayName: '小美' });
    vi.mocked(acceptGuardianInvite).mockResolvedValue({
      ok: true, bindingId: 'binding-1', inviterDisplayName: '阿山', inviterLineUserId: 'U-hiker',
    });

    const response = await POST(request({ token: 'invite-token', idToken: 'good' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ inviterDisplayName: '阿山' });
    expect(acceptGuardianInvite).toHaveBeenCalledWith(expect.objectContaining({
      token: 'invite-token', lineUserId: 'U-guardian', displayName: '小美',
    }));
    expect(pushLineMessage).toHaveBeenCalledWith(expect.objectContaining({
      to: 'U-hiker', idempotencyKey: 'binding-1',
    }));
  });

  it('still reports success when the hiker notification cannot be delivered', async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({ lineUserId: 'U-guardian', displayName: '小美' });
    vi.mocked(acceptGuardianInvite).mockResolvedValue({
      ok: true, bindingId: 'binding-1', inviterDisplayName: '阿山', inviterLineUserId: 'U-hiker',
    });
    vi.mocked(pushLineMessage).mockRejectedValue(new Error('LINE push failed (403)'));

    expect((await POST(request({ token: 'invite-token', idToken: 'good' }))).status).toBe(200);
  });

  it('maps every rejection reason to its status code', async () => {
    vi.mocked(verifyLineIdToken).mockResolvedValue({ lineUserId: 'U-guardian', displayName: '小美' });
    const expected = {
      not_found: 404, used: 409, revoked: 409, already_bound: 409, expired: 410,
    } as const;

    for (const [reason, status] of Object.entries(expected)) {
      vi.mocked(acceptGuardianInvite).mockResolvedValue({ ok: false, reason: reason as 'used' });
      const response = await POST(request({ token: 'invite-token', idToken: 'good' }));

      expect(response.status).toBe(status);
      await expect(response.json()).resolves.toMatchObject({ reason });
    }
    expect(pushLineMessage).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/api/guardian-invites-accept.test.ts`
Expected: FAIL — 找不到 route 模組

- [ ] **Step 3: 實作**

`app/api/guardian-invites/accept/route.ts`：

```ts
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { copy } from '@/src/features/i18n/copy';
import { acceptGuardianInvite } from '@/src/features/line/guardian-invites';
import { pushLineMessage } from '@/src/integrations/line/client';
import { verifyLineIdToken } from '@/src/integrations/line/verify-id-token';

const schema = z.object({ token: z.string().min(1), idToken: z.string().min(1) }).strict();

const statusByReason = {
  not_found: 404, used: 409, revoked: 409, already_bound: 409, expired: 410,
} as const;

export const POST = async (request: Request) => {
  const parsed = schema.safeParse(await request.json().catch(() => undefined));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  let identity;
  try { identity = await verifyLineIdToken(parsed.data.idToken); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const result = await acceptGuardianInvite({
    token: parsed.data.token,
    lineUserId: identity.lineUserId,
    displayName: identity.displayName,
    now: new Date(),
  });
  if (!result.ok) {
    return NextResponse.json({ reason: result.reason }, { status: statusByReason[result.reason] });
  }

  try {
    await pushLineMessage({
      to: result.inviterLineUserId,
      messages: [{ type: 'text', text: copy.guardianBoundNotice(identity.displayName) }],
      idempotencyKey: result.bindingId,
    });
  } catch (error) {
    console.error('Guardian bound notification failed', { bindingId: result.bindingId, error });
  }

  return NextResponse.json({ inviterDisplayName: result.inviterDisplayName });
};
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run tests/api/guardian-invites-accept.test.ts`
Expected: PASS，5 個測試全綠

- [ ] **Step 5: Commit**

```bash
git add app/api/guardian-invites/accept tests/api/guardian-invites-accept.test.ts
git commit -m "feat: accept guardian invites and notify the hiker"
```

---

### Task 6: 撤銷綁定 API

**Files:**
- Create: `app/api/guardian-bindings/[id]/route.ts`
- Test: `tests/api/guardian-bindings.test.ts`

**Interfaces:**
- Consumes: `sessionCookie`／`verifySession`
- Produces: `DELETE /api/guardian-bindings/{id}` → 204｜401｜404

非本人的 binding 回 404 而非 403，避免洩露 id 是否存在。撤銷以 `revokedAt` 標記，不刪列。

- [ ] **Step 1: 寫失敗測試**

加到 `tests/api/guardian-bindings.test.ts`。既有檔案已 mock `@/src/db/client` 的 `select`，這裡要再補 `update`——把檔案頂部的 mock 區塊改成：

```ts
const orderBy = vi.fn().mockResolvedValue([{ id: 'owner-binding', sourceType: 'user', displayName: '小玉', sourceId: 'U-owner', boundAt: new Date() }]);
const where = vi.fn(() => ({ orderBy }));
const from = vi.fn(() => ({ where }));
const select = vi.fn(() => ({ from }));

const returning = vi.fn().mockResolvedValue([{ id: 'owner-binding' }]);
const updateWhere = vi.fn(() => ({ returning }));
const set = vi.fn(() => ({ where: updateWhere }));
const update = vi.fn(() => ({ set }));

vi.mock('@/src/features/auth/session', () => ({ verifySession: vi.fn(), sessionCookie: { name: 'besafe_session' } }));
vi.mock('@/src/features/line/bindings', () => ({ createBindingCode: vi.fn() }));
vi.mock('@/src/db/client', () => ({ db: { select, update } }));
```

並在檔案的 import 區加 `import { DELETE } from '@/app/api/guardian-bindings/[id]/route';`，然後新增測試：

```ts
describe('DELETE /api/guardian-bindings/[id]', () => {
  beforeEach(() => {
    vi.mocked(verifySession).mockReset();
    update.mockClear(); set.mockClear(); updateWhere.mockClear(); returning.mockClear();
    returning.mockResolvedValue([{ id: 'owner-binding' }]);
  });

  it('rejects revocation without a session', async () => {
    const response = await DELETE(
      new Request('http://localhost/api/guardian-bindings/owner-binding', { method: 'DELETE' }),
      { params: Promise.resolve({ id: 'owner-binding' }) },
    );

    expect(response.status).toBe(401);
    expect(update).not.toHaveBeenCalled();
  });

  it('revokes the binding owned by the authenticated hiker', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date() });

    const response = await DELETE(
      new Request('http://localhost/api/guardian-bindings/owner-binding', {
        method: 'DELETE', headers: { cookie: 'besafe_session=session' },
      }),
      { params: Promise.resolve({ id: 'owner-binding' }) },
    );

    expect(response.status).toBe(204);
    expect(set).toHaveBeenCalledWith(expect.objectContaining({ revokedAt: expect.any(Date) }));
  });

  it('hides bindings that belong to somebody else behind a 404', async () => {
    vi.mocked(verifySession).mockResolvedValue({ userId: 'owner-1', lineUserId: 'U-owner', expiresAt: new Date() });
    returning.mockResolvedValue([]);

    const response = await DELETE(
      new Request('http://localhost/api/guardian-bindings/other-binding', {
        method: 'DELETE', headers: { cookie: 'besafe_session=session' },
      }),
      { params: Promise.resolve({ id: 'other-binding' }) },
    );

    expect(response.status).toBe(404);
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/api/guardian-bindings.test.ts`
Expected: FAIL — 找不到 `@/app/api/guardian-bindings/[id]/route`

- [ ] **Step 3: 實作**

`app/api/guardian-bindings/[id]/route.ts`：

```ts
import { and, eq, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { sessionCookie, verifySession } from '@/src/features/auth/session';

const sessionToken = (request: Request) => request.headers.get('cookie')?.split(';')
  .map((part) => part.trim())
  .find((part) => part.startsWith(`${sessionCookie.name}=`))?.slice(sessionCookie.name.length + 1);

export const DELETE = async (request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const token = sessionToken(request);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let session;
  try { session = await verifySession(token); }
  catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }

  const { id } = await params;
  const [{ db }, { lineBindings }] = await Promise.all([
    import('@/src/db/client'), import('@/src/db/schema'),
  ]);
  const revoked = await db.update(lineBindings).set({ revokedAt: new Date() }).where(and(
    eq(lineBindings.id, id),
    eq(lineBindings.userId, session.userId),
    isNull(lineBindings.revokedAt),
  )).returning({ id: lineBindings.id });

  if (revoked.length === 0) return NextResponse.json({ error: 'Binding not found' }, { status: 404 });
  return new NextResponse(null, { status: 204 });
};
```

- [ ] **Step 4: 執行測試確認通過**

Run: `npx vitest run tests/api/guardian-bindings.test.ts`
Expected: PASS，既有兩個測試也要綠

- [ ] **Step 5: Commit**

```bash
git add app/api/guardian-bindings/\[id\] tests/api/guardian-bindings.test.ts
git commit -m "feat: allow hikers to revoke a guardian binding"
```

---

### Task 7: `/guardians` 留守人管理頁

**Files:**
- Create: `app/guardians/page.tsx`, `app/guardians/GuardiansContent.tsx`
- Test: `tests/features/guardians-page.test.tsx`

**Interfaces:**
- Consumes: Task 3 的 copy 鍵、Task 4 的 `POST /api/guardian-invites`、Task 6 的 `DELETE /api/guardian-bindings/{id}`、既有 `GET`／`POST /api/guardian-bindings`
- Produces: `GuardiansContent`（無 props 的 client component）

`liff.shareTargetPicker` 需要 LIFF console 開啟 `chat_message.write` scope。未開啟或在外部瀏覽器時 `liff.isApiAvailable('shareTargetPicker')` 回 false，此時**只**顯示複製鈕；複製鈕永遠存在。

- [ ] **Step 1: 寫失敗測試**

`tests/features/guardians-page.test.tsx`：

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

vi.mock('@/app/LiffBootstrap', () => ({ LiffBootstrap: () => null }));

import { GuardiansContent } from '@/app/guardians/GuardiansContent';
import { copy } from '@/src/features/i18n/copy';

const bindings = [
  { id: 'binding-1', sourceType: 'user', displayName: '小美', sourceId: 'U-guardian', boundAt: '2026-07-20T00:00:00.000Z' },
];

const respondWith = (routes: Record<string, unknown>) => vi.fn(async (url: string, init?: RequestInit) => {
  const key = `${init?.method ?? 'GET'} ${url}`;
  if (!(key in routes)) return new Response(null, { status: 500 });
  const body = routes[key];
  return new Response(body === null ? null : JSON.stringify(body), { status: body === null ? 204 : 200 });
});

describe('guardians page', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it('offers only the copy button when LINE sharing is unavailable', async () => {
    vi.stubGlobal('fetch', respondWith({
      'GET /api/guardian-bindings': { bindings },
      'POST /api/guardian-invites': {
        inviteUrl: 'https://liff.line.me/liff-1/guardian/accept?token=t', expiresAt: '2026-07-22T00:00:00.000Z',
      },
    }));
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));

    expect(await screen.findByRole('button', { name: copy.copyInviteLink })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: copy.shareInviteToLine })).not.toBeInTheDocument();
  });

  it('copies the invite link and confirms it', async () => {
    vi.stubGlobal('fetch', respondWith({
      'GET /api/guardian-bindings': { bindings },
      'POST /api/guardian-invites': {
        inviteUrl: 'https://liff.line.me/liff-1/guardian/accept?token=t', expiresAt: '2026-07-22T00:00:00.000Z',
      },
    }));
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));
    fireEvent.click(await screen.findByRole('button', { name: copy.copyInviteLink }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://liff.line.me/liff-1/guardian/accept?token=t',
    );
    const status = await screen.findByRole('status');
    expect(status.textContent).toBe(copy.inviteLinkCopied);
  });

  it('surfaces the pending invite limit', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) =>
      init?.method === 'POST' && url === '/api/guardian-invites'
        ? new Response(JSON.stringify({ error: 'Too many pending guardian invites' }), { status: 409 })
        : new Response(JSON.stringify({ bindings }), { status: 200 })));
    render(<GuardiansContent />);

    fireEvent.click(await screen.findByRole('button', { name: copy.inviteGuardian }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(copy.inviteLimitReached);
  });

  it('removes a binding from the list after revoking it', async () => {
    const fetchMock = respondWith({
      'GET /api/guardian-bindings': { bindings },
      'DELETE /api/guardian-bindings/binding-1': null,
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<GuardiansContent />);

    expect(await screen.findByText(/小美/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: copy.revokeBinding }));

    await waitFor(() => expect(screen.queryByText(/小美/)).not.toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith('/api/guardian-bindings/binding-1', { method: 'DELETE' });
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/guardians-page.test.tsx`
Expected: FAIL — 找不到 `@/app/guardians/GuardiansContent`

- [ ] **Step 3: 實作 client component**

`app/guardians/GuardiansContent.tsx`：

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';

import { LiffBootstrap } from '@/app/LiffBootstrap';
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { Notice } from '@/app/components/Notice';
import { copy } from '@/src/features/i18n/copy';
import { formatTime } from '@/src/lib/format-time';

interface GuardianBinding {
  id: string;
  sourceType: 'user' | 'group' | 'room' | null;
  displayName: string | null;
  sourceId: string | null;
  boundAt: string | null;
}

interface Invite { inviteUrl: string; expiresAt: string }

const shareAvailable = async () => {
  try {
    const { default: liff } = await import('@line/liff');
    return liff.isApiAvailable('shareTargetPicker');
  } catch { return false; }
};

export function GuardiansContent() {
  const [bindings, setBindings] = useState<GuardianBinding[]>([]);
  const [invite, setInvite] = useState<Invite>();
  const [canShare, setCanShare] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string }>();
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/guardian-bindings');
    if (!response.ok) return;
    const body = await response.json() as { bindings: GuardianBinding[] };
    setBindings(body.bindings.filter((binding) => binding.boundAt && binding.sourceId));
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { void shareAvailable().then(setCanShare); }, []);

  const createInvite = async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/guardian-invites', { method: 'POST' });
      if (response.status === 409) {
        setNotice({ tone: 'error', text: copy.inviteLimitReached });
        return;
      }
      if (!response.ok) {
        setNotice({ tone: 'error', text: copy.inviteCreateError });
        return;
      }
      setInvite(await response.json() as Invite);
      setNotice(undefined);
    } catch (error) {
      console.error('Guardian invite request failed', { error });
      setNotice({ tone: 'error', text: copy.inviteCreateError });
    } finally { setBusy(false); }
  };

  const copyLink = async () => {
    if (!invite) return;
    await navigator.clipboard.writeText(invite.inviteUrl);
    setNotice({ tone: 'success', text: copy.inviteLinkCopied });
  };

  const shareToLine = async () => {
    if (!invite) return;
    const { default: liff } = await import('@line/liff');
    const profile = await liff.getProfile();
    await liff.shareTargetPicker([
      { type: 'text', text: copy.inviteShareMessage(profile.displayName, invite.inviteUrl) },
    ]);
  };

  const revoke = async (id: string) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/guardian-bindings/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        setNotice({ tone: 'error', text: copy.revokeBindingError });
        return;
      }
      setBindings((current) => current.filter((binding) => binding.id !== id));
    } catch (error) {
      console.error('Guardian binding revocation failed', { id, error });
      setNotice({ tone: 'error', text: copy.revokeBindingError });
    } finally { setBusy(false); }
  };

  return <main>
    <Card>
      <h1>{copy.guardiansTitle}</h1>
      <LiffBootstrap />
    </Card>

    <Card title={copy.myGuardians}>
      {bindings.length === 0 && <p className="source-note">{copy.noGuardianBindings}</p>}
      {bindings.map((binding) => <div key={binding.id} className="card-row">
        <span>{binding.displayName || copy.boundGuardian}</span>
        <Chip tone={binding.sourceType === 'group' ? 'neutral' : 'success'}>
          {binding.sourceType === 'group' ? copy.boundGroup : copy.boundGuardian}
        </Chip>
        <span className="source-note">{formatTime(binding.boundAt ?? undefined)}</span>
        <Button variant="danger" disabled={busy} onClick={() => void revoke(binding.id)}>
          {copy.revokeBinding}
        </Button>
      </div>)}
    </Card>

    <Card title={copy.inviteGuardian}>
      <Button disabled={busy} onClick={() => void createInvite()}>{copy.inviteGuardian}</Button>
      {invite && <>
        <p className="source-note">{copy.inviteExpiresAt(formatTime(invite.expiresAt))}</p>
        {canShare && <Button variant="secondary" onClick={() => void shareToLine()}>
          {copy.shareInviteToLine}
        </Button>}
        <Button variant="secondary" onClick={() => void copyLink()}>{copy.copyInviteLink}</Button>
      </>}
    </Card>

    {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
  </main>;
}
```

`formatTime` 的簽名是 `(value?: string) => string`（`src/lib/format-time.ts:3`），不吃 `null`，所以上面必須寫 `binding.boundAt ?? undefined`。不要為此改動 `format-time.ts`。

- [ ] **Step 4: 加入群組綁定碼區塊**

在 `createInvite` 的 `Card` 之後、`{notice && ...}` 之前插入，並在元件頂部加 `const [bindingCode, setBindingCode] = useState('');`：

```tsx
    <details className="card">
      <summary>{copy.groupBindingSection}</summary>
      <Button variant="ghost" disabled={busy} onClick={() => void (async () => {
        const response = await fetch('/api/guardian-bindings', { method: 'POST' });
        if (!response.ok) { setNotice({ tone: 'error', text: copy.bindingCodeError }); return; }
        setBindingCode((await response.json() as { code: string }).code);
      })()}>{copy.createBindingCode}</Button>
      {bindingCode && <Notice tone="success">{copy.bindingCodeInstructions(bindingCode)}</Notice>}
    </details>
```

- [ ] **Step 5: 實作伺服器殼層**

`app/guardians/page.tsx`：

```tsx
import { GuardiansContent } from './GuardiansContent';

export default function GuardiansPage() {
  return <GuardiansContent />;
}
```

- [ ] **Step 6: 執行測試確認通過**

Run: `npx vitest run tests/features/guardians-page.test.tsx`
Expected: PASS，4 個測試全綠

- [ ] **Step 7: Commit**

```bash
git add app/guardians tests/features/guardians-page.test.tsx
git commit -m "feat: add guardian management page with link invites"
```

---

### Task 8: `/guardian/accept` 留守人接受頁

**Files:**
- Create: `app/guardian/accept/page.tsx`, `app/guardian/accept/AcceptInvite.tsx`
- Test: `tests/features/guardian-accept-page.test.tsx`

**Interfaces:**
- Consumes: Task 4 的 `GET /api/guardian-invites/{token}`、Task 5 的 `POST /api/guardian-invites/accept`、Task 3 的 copy 鍵與 `NEXT_PUBLIC_LINE_OA_URL`
- Produces: `AcceptInvite({ token }: { token?: string })`

**這一頁不可以用 `LiffBootstrap`**（見「實作者須知」第 1 點）。它自己做 `liff.init` → 未登入則 `liff.login()` → `liff.getIDToken()`，絕不呼叫 `/api/auth/line`。

六種畫面：無 token／載入中／`pending`（可接受）／`expired`／`used`／`revoked`；接受後再加成功畫面與 `already_bound` 提示。

- [ ] **Step 1: 寫失敗測試**

`tests/features/guardian-accept-page.test.tsx`：

```tsx
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

vi.mock('@line/liff', () => ({
  default: {
    init: vi.fn().mockResolvedValue(undefined),
    isLoggedIn: vi.fn().mockReturnValue(true),
    login: vi.fn(),
    getIDToken: vi.fn().mockReturnValue('id-token'),
  },
}));

import { AcceptInvite } from '@/app/guardian/accept/AcceptInvite';
import { copy } from '@/src/features/i18n/copy';

const inviteResponse = (status: string) => new Response(JSON.stringify({
  inviterDisplayName: '阿山', expiresAt: '2026-07-22T00:00:00.000Z', status,
}), { status: 200 });

describe('guardian accept page', () => {
  beforeEach(() => { vi.unstubAllGlobals(); });

  it('asks for a valid link when the token is missing', () => {
    render(<AcceptInvite />);
    expect(screen.getByRole('alert').textContent).toBe(copy.inviteNotFound);
  });

  it.each([
    ['expired', copy.inviteExpired],
    ['used', copy.inviteUsed],
    ['revoked', copy.inviteRevoked],
  ])('explains the %s invite state', async (status, message) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(inviteResponse(status)));
    render(<AcceptInvite token="invite-token" />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(message);
    expect(screen.queryByRole('button', { name: copy.acceptInviteAction })).not.toBeInTheDocument();
  });

  it('reports a token that does not exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 404 })));
    render(<AcceptInvite token="nope" />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(copy.inviteNotFound);
  });

  it('binds the guardian and confirms with the hiker name', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(inviteResponse('pending'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ inviterDisplayName: '阿山' }), { status: 200 })));
    render(<AcceptInvite token="invite-token" />);

    fireEvent.click(await screen.findByRole('button', { name: copy.acceptInviteAction }));

    const status = await screen.findByRole('status');
    expect(status.textContent).toBe(copy.acceptInviteSuccess('阿山'));
  });

  it('tells a returning guardian they are already bound', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(inviteResponse('pending'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ reason: 'already_bound' }), { status: 409 })));
    render(<AcceptInvite token="invite-token" />);

    fireEvent.click(await screen.findByRole('button', { name: copy.acceptInviteAction }));

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(copy.alreadyGuardian('阿山'));
  });
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/guardian-accept-page.test.tsx`
Expected: FAIL — 找不到 `@/app/guardian/accept/AcceptInvite`

- [ ] **Step 3: 實作 client component**

`app/guardian/accept/AcceptInvite.tsx`：

```tsx
'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Notice } from '@/app/components/Notice';
import { copy } from '@/src/features/i18n/copy';

type InviteStatus = 'pending' | 'expired' | 'used' | 'revoked';

interface Invite { inviterDisplayName: string; expiresAt: string; status: InviteStatus }

const statusMessage: Record<Exclude<InviteStatus, 'pending'>, string> = {
  expired: copy.inviteExpired,
  used: copy.inviteUsed,
  revoked: copy.inviteRevoked,
};

const identityToken = async () => {
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  if (!liffId) throw new Error('LIFF is not configured');
  const { default: liff } = await import('@line/liff');
  await liff.init({ liffId });
  if (!liff.isLoggedIn()) { liff.login(); return undefined; }
  const idToken = liff.getIDToken();
  if (!idToken) throw new Error('LINE ID token unavailable');
  return idToken;
};

export function AcceptInvite({ token }: { token?: string }) {
  const [invite, setInvite] = useState<Invite>();
  const [error, setError] = useState(token ? undefined : copy.inviteNotFound);
  const [accepted, setAccepted] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        const response = await fetch(`/api/guardian-invites/${encodeURIComponent(token)}`);
        if (!response.ok) { setError(copy.inviteNotFound); return; }
        setInvite(await response.json() as Invite);
      } catch (fetchError) {
        console.error('Guardian invite lookup failed', { error: fetchError });
        setError(copy.acceptInviteError);
      }
    })();
  }, [token]);

  const accept = async () => {
    if (!token || !invite) return;
    setBusy(true);
    try {
      const idToken = await identityToken();
      if (!idToken) return;
      const response = await fetch('/api/guardian-invites/accept', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, idToken }),
      });
      if (response.ok) { setAccepted(invite.inviterDisplayName); return; }
      const body = await response.json().catch(() => ({})) as { reason?: string };
      if (body.reason === 'already_bound') { setError(copy.alreadyGuardian(invite.inviterDisplayName)); return; }
      setError(body.reason && body.reason in statusMessage
        ? statusMessage[body.reason as Exclude<InviteStatus, 'pending'>]
        : copy.acceptInviteError);
    } catch (acceptError) {
      console.error('Guardian invite acceptance failed', { error: acceptError });
      setError(copy.acceptInviteError);
    } finally { setBusy(false); }
  };

  const officialAccountUrl = process.env.NEXT_PUBLIC_LINE_OA_URL;

  if (accepted) return <main><Card>
    <Notice tone="success">{copy.acceptInviteSuccess(accepted)}</Notice>
    <p className="source-note">{copy.addOfficialAccount}</p>
    {officialAccountUrl && <a className="btn btn-secondary" href={officialAccountUrl}>
      {copy.addOfficialAccount}
    </a>}
  </Card></main>;

  if (error) return <main><Card><Notice tone="error">{error}</Notice></Card></main>;
  if (!invite) return <main><Card>
    <p className="source-note" role="status">{copy.liffLoading}</p>
  </Card></main>;
  if (invite.status !== 'pending') return <main><Card>
    <Notice tone="error">{statusMessage[invite.status]}</Notice>
  </Card></main>;

  return <main><Card>
    <h1>{copy.acceptInviteTitle(invite.inviterDisplayName)}</h1>
    <p className="source-note">{copy.addOfficialAccount}</p>
    <Button disabled={busy} onClick={() => void accept()}>{copy.acceptInviteAction}</Button>
  </Card></main>;
}
```

- [ ] **Step 4: 實作伺服器殼層**

`app/guardian/accept/page.tsx`：

```tsx
import { AcceptInvite } from './AcceptInvite';

export default async function GuardianAcceptPage(
  { searchParams }: { searchParams: Promise<{ token?: string }> },
) {
  return <AcceptInvite token={(await searchParams).token} />;
}
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/features/guardian-accept-page.test.tsx`
Expected: PASS，7 個測試（含 `it.each` 三例）全綠

- [ ] **Step 6: Commit**

```bash
git add app/guardian tests/features/guardian-accept-page.test.tsx
git commit -m "feat: add guardian invite acceptance page"
```

---

### Task 9: 建立行程表單與首頁入口

**Files:**
- Modify: `app/trips/new/TripForm.tsx:265-279`, `app/HomeContent.tsx:31-36`
- Test: `tests/features/new-trip-page.test.tsx`, `tests/features/home.test.tsx`

**Interfaces:**
- Consumes: Task 4 的 `POST /api/guardian-invites`、Task 3 的 copy 鍵
- Produces: 無新介面

表單內的文字綁定碼 UI 移除（該能力已在 Task 7 移到 `/guardians` 的進階區塊）。webhook 端「綁定 CODE」處理邏輯完全不動。

- [ ] **Step 1: 寫失敗測試**

加到 `tests/features/new-trip-page.test.tsx`（`fetch` mock 沿用該檔案既有寫法，把 `POST /api/guardian-invites` 加進去）：

```tsx
it('offers a guardian invite link instead of a binding code', async () => {
  render(<TripForm />);

  expect(await screen.findByRole('button', { name: copy.inviteGuardian })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: copy.createBindingCode })).not.toBeInTheDocument();
});
```

加到 `tests/features/home.test.tsx`：

```tsx
it('links to the guardian management page', () => {
  render(<HomeContent />);

  expect(screen.getByRole('link', { name: copy.myGuardians })).toHaveAttribute('href', '/guardians');
});
```

- [ ] **Step 2: 執行測試確認失敗**

Run: `npx vitest run tests/features/new-trip-page.test.tsx tests/features/home.test.tsx`
Expected: FAIL — 找不到邀請按鈕、找不到 `/guardians` 連結

- [ ] **Step 3: 改寫表單的留守人卡**

`app/trips/new/TripForm.tsx`：把 `createBinding` 函式與 `bindingCode` state 換成邀請版本。

state 宣告改為：

```tsx
  const [inviteUrl, setInviteUrl] = useState('');
```

`createBinding` 整個換成：

```tsx
  const inviteGuardian = async () => {
    try {
      const response = await fetch('/api/guardian-invites', { method: 'POST' });
      if (response.status === 409) { setError(copy.inviteLimitReached); return; }
      if (!response.ok) { setError(copy.inviteCreateError); return; }
      setInviteUrl((await response.json() as { inviteUrl: string }).inviteUrl);
    } catch (requestError) {
      console.error('Guardian invite request failed', { error: requestError });
      setError(copy.inviteCreateError);
    }
  };
```

留守人 `Card` 內最後兩行換成：

```tsx
      <Button variant="secondary" onClick={() => void inviteGuardian()}>{copy.inviteGuardian}</Button>
      {inviteUrl && <Button variant="ghost" onClick={() => void (async () => {
        await navigator.clipboard.writeText(inviteUrl);
        setError(undefined);
      })()}>{copy.copyInviteLink}</Button>}
```

若檔案內已無其他 `bindingCode` 參照，一併移除該 state 與相關 import。

- [ ] **Step 4: 加入首頁入口**

`app/HomeContent.tsx` 的 `<nav className="action-grid">` 內，`/trips/active#finish` 那行之後加：

```tsx
      <a href="/guardians">{copy.myGuardians}</a>
```

- [ ] **Step 5: 執行測試確認通過**

Run: `npx vitest run tests/features/new-trip-page.test.tsx tests/features/home.test.tsx`
Expected: PASS

- [ ] **Step 6: 跑全套測試**

Run: `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"`
Expected: 全綠。若 `tests/features/quick-trip-form.test.tsx` 或 `tests/features/i18n.test.ts` 因移除 `createBindingCode` 的表單用法而失敗，修正測試對表單的預期，**不要**把 `copy.createBindingCode` 鍵刪掉——`/guardians` 進階區塊仍在用。

- [ ] **Step 7: Commit**

```bash
git add app/trips/new/TripForm.tsx app/HomeContent.tsx tests/features/new-trip-page.test.tsx tests/features/home.test.tsx
git commit -m "feat: replace the trip form binding code with guardian invite links"
```

---

## 完工驗證

- [ ] `npx vitest run --exclude "**/.worktrees/**" --exclude "**/tests/integration/**"` 全綠，貼出實際輸出（基準 43 files / 243 tests，本計畫應只增不減）。
- [ ] `npx vitest run --coverage tests/features/guardian-invites.test.ts tests/api/guardian-invites.test.ts tests/api/guardian-invites-accept.test.ts` 對 `src/features/line/guardian-invites.ts` 與三支 route 的覆蓋率 ≥80%。
- [ ] `npx tsc --noEmit` 無錯誤，且 `grep -n "database: any" src/features` 無命中。
- [ ] `npm run build` 成功（確認兩個新頁面能靜態分析通過）。
- [ ] `grep -rn "console.log" app src` 無新增命中。
- [ ] 人工確認：`git log --oneline` 有 11 個 commit（Task 0、1、1b、2–9），Task 0 的修正是獨立的第一個。

## 部署前的營運步驟（由操作者在 LINE console 執行，不屬於本計畫的程式工作）

1. LIFF app 開啟 `shareTargetPicker`（`chat_message.write` scope）。未開啟時前端自動只顯示複製鈕，功能不中斷。
2. 確認 LIFF endpoint 指向部署網址、size 設定 Full。
3. 設定 `NEXT_PUBLIC_LINE_OA_URL` 為 `https://line.me/R/ti/p/@{OA_ID}`。
4. LINE Login channel 確認 bot link（`bot_prompt`）已連結 Messaging API channel。
5. 部署後執行 `npm run db:migrate` 套用 `0012_guardian_invites.sql`。
