# Phase 1：UI 設計系統與頁面重構 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 依 `docs/superpowers/specs/2026-07-19-line-first-ux-redesign-design.md` §3–§4，建立 LINE 原生風設計系統（tokens＋五個共用元件），重構首頁、建立行程、行程頁（草稿＋進行中）、周邊頁面，並全面移除 `window.prompt`／`window.confirm`。

**Architecture:** 純前端視覺與互動層重構：`globals.css` 改為 CSS variables tokens；新增 `app/components/` 共用元件；各頁改用元件組合。API routes、feature 層、資料庫**零改動**。行程操作從彈窗改為 Expander 原地展開。

**Tech Stack:** Next.js 16（App Router）、React 19、vitest + jsdom + @testing-library/react（既有，無新依賴）。

## Global Constraints

- 所有 UI 文案一律經 `src/features/i18n/copy.ts` 的 `bilingual('中文', 'English')`（產出 `中文\n英文`）；CSS 必須保留 `white-space: pre-line` 讓兩行呈現。
- 禁用 `window.prompt`、`window.confirm`、`window.alert`——完成後 `grep -rn "window.prompt\|window.confirm" app src` 必須零筆。
- Design tokens 精確色值（spec §3）：primary `#06c755`、pressed `#05a94a`、bg `#f7f8fa`、surface `#ffffff`、text `#111827`、secondary `#8b8f98`、danger `#d93025`、警示三階段 `#f5a623`→`#ff7a1a`→`#d93025`、卡片圓角 `14px`、控制項圓角 `10px`。
- 觸控目標 ≥44px，主按鈕 48px；`main` 要有 `env(safe-area-inset-bottom)` padding；保留 `prefers-reduced-motion` 區塊。
- 不新增任何 npm 依賴；不改動 `app/api/**`、`src/features/**`（`i18n/copy.ts` 除外）、`src/db/**`。
- 測試指令：整體 `npm test`；單檔 `npx vitest run <path>`。RTL 查詢慣例：`getByRole` 可直接用 `copy.*` 字串當 name；`getByLabelText`／`getByText` 對雙語文案要用測試檔內的 `copyName()` regex helper（見 `tests/features/quick-trip-form.test.tsx:8`）。
- Commit 格式 `<type>: <description>`，**不加** Co-Authored-By。
- Immutability（不改動輸入參數）、單檔 <800 行、函式 <50 行。

---

### Task 1: Design tokens 與基礎樣式（globals.css 全面改寫）

**Files:**
- Modify: `app/globals.css`（整檔覆寫）

**Interfaces:**
- Produces: CSS class 名稱供後續所有 task 使用——`card`、`card-title`、`btn`、`btn-primary|secondary|danger|ghost`、`chip`、`chip-success|neutral|warning|danger`、`notice`、`notice-success|warning|error`、`expander`、`expander-body`、`action-grid`、`status-list`、`source-note`、`card-row`、`missing-fields`、`report-text`。
- 保留過渡期 legacy 規則 `.alert-label`、`.secondary-action`（Task 9 全部改完後由 Task 10 刪除）。

- [ ] **Step 1: 覆寫 `app/globals.css` 為以下完整內容**

```css
:root {
  --color-primary: #06c755;
  --color-primary-pressed: #05a94a;
  --color-primary-soft: #e8f9ee;
  --color-primary-strong: #06a64b;
  --color-bg: #f7f8fa;
  --color-surface: #ffffff;
  --color-text: #111827;
  --color-text-secondary: #8b8f98;
  --color-border: #e0e2e7;
  --color-danger: #d93025;
  --color-danger-soft: #ffecec;
  --color-warning-soft: #fff5e6;
  --color-warning-text: #7a4b00;
  --color-alert-stage1: #f5a623;
  --color-alert-stage2: #ff7a1a;
  --color-alert-stage3: #d93025;
  --radius-card: 14px;
  --radius-control: 10px;
  --shadow-card: 0 1px 4px rgba(0, 0, 0, 0.06);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  color: var(--color-text);
  background: var(--color-bg);
  font-family: system-ui, -apple-system, 'PingFang TC', 'Noto Sans TC', sans-serif;
}

h1,
h2,
p,
a,
button,
label,
legend,
summary,
dt,
dd,
option,
span {
  white-space: pre-line;
}

h1 {
  font-size: 1.35rem;
  margin: 0.5rem 0;
}

main,
.trip-form {
  margin: 0 auto;
  max-width: 42rem;
  padding: 1rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom));
}

.card {
  background: var(--color-surface);
  border: none;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
  padding: 1rem;
  margin: 0.75rem 0;
}

.card-title {
  font-size: 1rem;
  margin: 0 0 0.5rem;
}

.btn {
  display: block;
  width: 100%;
  min-height: 48px;
  margin-top: 0.6rem;
  padding: 0.65rem 1rem;
  border: 1.5px solid transparent;
  border-radius: var(--radius-control);
  font: inherit;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  touch-action: manipulation;
  cursor: pointer;
}

a.btn {
  display: grid;
  place-items: center;
}

.btn-primary {
  background: var(--color-primary);
  color: #fff;
}

.btn-primary:active {
  background: var(--color-primary-pressed);
}

.btn-secondary {
  background: var(--color-surface);
  color: var(--color-primary-strong);
  border-color: var(--color-primary);
}

.btn-ghost {
  background: var(--color-surface);
  color: var(--color-text);
  border-color: var(--color-border);
}

.btn-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.chip {
  display: inline-block;
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.75rem;
  font-weight: 700;
}

.chip-success {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.chip-neutral {
  background: #eef0f3;
  color: var(--color-text-secondary);
}

.chip-warning {
  background: var(--color-warning-soft);
  color: var(--color-warning-text);
}

.chip-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.notice {
  border-radius: var(--radius-control);
  padding: 0.75rem;
  margin: 0.75rem 0;
  font-weight: 700;
}

.notice-success {
  background: var(--color-primary-soft);
  color: var(--color-primary-strong);
}

.notice-warning {
  background: var(--color-warning-soft);
  color: var(--color-warning-text);
  border-left: 0.35rem solid var(--color-alert-stage2);
}

.notice-error {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.expander {
  margin-top: 0.6rem;
}

.expander > .btn {
  margin-top: 0;
}

.expander-body {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  margin-top: 0.4rem;
  padding: 0.75rem;
  display: grid;
  gap: 0.5rem;
}

.expander-body .btn {
  margin-top: 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1.25rem 0;
}

.action-grid a {
  display: grid;
  min-height: 48px;
  place-items: center;
  border-radius: var(--radius-control);
  color: #fff;
  background: var(--color-primary);
  font-weight: 700;
  text-decoration: none;
}

.action-grid a:active {
  background: var(--color-primary-pressed);
}

button,
input,
select,
textarea {
  min-height: 44px;
  font: inherit;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-control);
  background: var(--color-surface);
}

textarea {
  min-height: 5rem;
}

button,
a {
  touch-action: manipulation;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
a:focus-visible,
summary:focus-visible {
  outline: 3px solid #0b63ce;
  outline-offset: 3px;
}

.status-list {
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.status-list > div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
}

.status-list dt {
  color: var(--color-text-secondary);
}

.status-list dd {
  margin: 0;
  font-weight: 700;
  text-align: right;
}

.source-note {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.missing-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
  margin-top: 0.75rem;
}

.missing-fields .label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.report-text {
  white-space: pre-wrap;
  font-size: 0.875rem;
  margin: 0;
}

.trip-new {
  margin: 0 auto;
  max-width: 32rem;
  padding: 1rem;
}

.trip-form label {
  display: block;
  margin-top: 0.75rem;
  font-weight: 700;
}

.trip-form input[type='checkbox'] {
  display: inline-block;
  width: auto;
  min-height: auto;
  margin-right: 0.5rem;
}

.trip-form details.card summary {
  min-height: 44px;
  cursor: pointer;
  font-weight: 700;
}

.quick-time-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.confirmation-row {
  padding: 0.75rem;
  border-left: 0.35rem solid var(--color-primary);
  background: var(--color-primary-soft);
  border-radius: 0 var(--radius-control) var(--radius-control) 0;
}

/* legacy：Task 9 完成後由 Task 10 刪除 */
.alert-label {
  border-left: 0.35rem solid var(--color-alert-stage2);
  padding: 0.75rem;
  font-weight: 700;
  background: var(--color-warning-soft);
}

.secondary-action {
  color: var(--color-primary-strong);
  border: 1px solid var(--color-primary);
  background: var(--color-surface);
}

nav[aria-label^='主要操作'] {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 1.25rem 0;
}

nav[aria-label^='主要操作'] a {
  display: grid;
  min-height: 44px;
  place-items: center;
  border-radius: var(--radius-control);
  color: #fff;
  background: var(--color-primary);
  text-decoration: none;
}

@media (max-width: 36rem) {
  .quick-time-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

- [ ] **Step 2: 跑既有測試確認無破壞（jsdom 不解析 CSS，理應全綠）**

Run: `npm test`
Expected: 全數 PASS

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat: add LINE-native design tokens and base styles"
```

---

### Task 2: UI 共用元件（Button／Card／Chip／Notice／Expander）

**Files:**
- Create: `app/components/Button.tsx`
- Create: `app/components/Card.tsx`
- Create: `app/components/Chip.tsx`
- Create: `app/components/Notice.tsx`
- Create: `app/components/Expander.tsx`
- Test: `tests/features/ui-components.test.tsx`

**Interfaces:**
- Consumes: Task 1 的 CSS classes。
- Produces（後續所有 UI task 依賴的精確簽名）:
  - `Button({ variant?: 'primary'|'secondary'|'danger'|'ghost', type?: 預設 'button', ...HTML button props })`；export `type ButtonVariant`
  - `Card({ title?: ReactNode, ...HTML section props })`
  - `Chip({ tone?: 'success'|'neutral'|'warning'|'danger', children })`
  - `Notice({ tone?: 'success'|'warning'|'error', children })`——`error` → `role="alert"`，其餘 `role="status"`
  - `Expander({ label: string, open: boolean, onToggle: () => void, variant?: ButtonVariant（預設 'ghost'）, children })`——受控元件，開闔由呼叫端管理

- [ ] **Step 1: 寫失敗測試 `tests/features/ui-components.test.tsx`**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';

import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { Expander } from '@/app/components/Expander';
import { Notice } from '@/app/components/Notice';

describe('Button', () => {
  it('defaults to a non-submitting primary button', () => {
    render(<Button>送出</Button>);
    const button = screen.getByRole('button', { name: '送出' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  it('applies the requested variant and keeps custom class names', () => {
    render(<Button variant="danger" className="extra">求助</Button>);
    expect(screen.getByRole('button', { name: '求助' })).toHaveClass('btn', 'btn-danger', 'extra');
  });
});

describe('Card', () => {
  it('renders an optional title as a heading with its content', () => {
    render(<Card title="路線"><p>七星山</p></Card>);
    expect(screen.getByRole('heading', { name: '路線' })).toBeInTheDocument();
    expect(screen.getByText('七星山')).toBeInTheDocument();
  });
});

describe('Chip', () => {
  it('applies the tone class', () => {
    render(<Chip tone="success">進行中</Chip>);
    expect(screen.getByText('進行中')).toHaveClass('chip', 'chip-success');
  });
});

describe('Notice', () => {
  it('announces errors assertively and other tones politely', () => {
    render(<><Notice tone="error">錯誤</Notice><Notice tone="warning">警告</Notice></>);
    expect(screen.getByRole('alert')).toHaveTextContent('錯誤');
    expect(screen.getByRole('status')).toHaveTextContent('警告');
  });
});

const ExpanderHarness = () => {
  const [open, setOpen] = useState(false);
  return <Expander label="回報平安" open={open} onToggle={() => setOpen((value) => !value)}>
    <p>展開內容</p>
  </Expander>;
};

describe('Expander', () => {
  it('shows its body only while expanded', () => {
    render(<ExpanderHarness />);
    expect(screen.queryByText('展開內容')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: '回報平安' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(screen.getByText('展開內容')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/features/ui-components.test.tsx`
Expected: FAIL（Cannot find module '@/app/components/Button'）

- [ ] **Step 3: 建立五個元件**

`app/components/Button.tsx`：

```tsx
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  variant = 'primary',
  type = 'button',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button
    type={type}
    className={['btn', `btn-${variant}`, className].filter(Boolean).join(' ')}
    {...props}
  />;
}
```

`app/components/Card.tsx`：

```tsx
import type { HTMLAttributes, ReactNode } from 'react';

export function Card({
  title,
  className,
  children,
  ...props
}: Omit<HTMLAttributes<HTMLElement>, 'title'> & { title?: ReactNode }) {
  return <section className={['card', className].filter(Boolean).join(' ')} {...props}>
    {title != null && <h2 className="card-title">{title}</h2>}
    {children}
  </section>;
}
```

`app/components/Chip.tsx`：

```tsx
import type { ReactNode } from 'react';

export function Chip({
  tone = 'neutral',
  children,
}: { tone?: 'success' | 'neutral' | 'warning' | 'danger'; children: ReactNode }) {
  return <span className={`chip chip-${tone}`}>{children}</span>;
}
```

`app/components/Notice.tsx`：

```tsx
import type { ReactNode } from 'react';

export function Notice({
  tone = 'success',
  children,
}: { tone?: 'success' | 'warning' | 'error'; children: ReactNode }) {
  return <p role={tone === 'error' ? 'alert' : 'status'} className={`notice notice-${tone}`}>
    {children}
  </p>;
}
```

`app/components/Expander.tsx`：

```tsx
import type { ReactNode } from 'react';

import { Button, type ButtonVariant } from './Button';

export function Expander({
  label,
  open,
  onToggle,
  variant = 'ghost',
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  variant?: ButtonVariant;
  children: ReactNode;
}) {
  return <div className="expander">
    <Button variant={variant} aria-expanded={open} onClick={onToggle}>{label}</Button>
    {open && <div className="expander-body">{children}</div>}
  </div>;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx vitest run tests/features/ui-components.test.tsx`
Expected: PASS（6 tests）

- [ ] **Step 5: Commit**

```bash
git add app/components tests/features/ui-components.test.tsx
git commit -m "feat: add shared LINE-native UI components"
```

---

### Task 3: i18n 新文案條目

**Files:**
- Modify: `src/features/i18n/copy.ts`
- Test: `tests/features/i18n.test.ts`

**Interfaces:**
- Produces（後續 task 依賴的 key）：`checkInAction`、`quickCheckInSafe`、`quickCheckInShelter`、`customCheckInLabel`、`sendCheckIn`、`extendByMinutes(minutes)`、`customMinutesLabel`、`confirmExtend`、`finishAction`、`confirmHelp`、`missingFieldsLabel`、`sectionTime`、`fieldTimeWindow`、`fieldConfirmation`、`goToTrip`。

- [ ] **Step 1: 在 `tests/features/i18n.test.ts` 檔尾加入失敗測試**

```ts
it('keeps the phase-1 action copy bilingual', () => {
  expect(copy.quickCheckInSafe).toBe('平安\nSafe');
  expect(copy.extendByMinutes(30)).toBe('+30 分鐘\n+30 minutes');
  expect(copy.finishAction).toBe('平安下山（結束行程）\nSafely down (finish trip)');
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/features/i18n.test.ts`
Expected: FAIL（copy.quickCheckInSafe is undefined）

- [ ] **Step 3: 在 `src/features/i18n/copy.ts` 的 `safeFinish:` 條目之後插入**

```ts
  checkInAction: bilingual('回報平安', 'Check in'),
  quickCheckInSafe: bilingual('平安', 'Safe'),
  quickCheckInShelter: bilingual('已到山屋', 'At shelter'),
  customCheckInLabel: bilingual('自訂訊息（會嘗試附上 GPS）', 'Custom message (GPS attached when available)'),
  sendCheckIn: bilingual('送出回報', 'Send check-in'),
  extendByMinutes: (minutes: number) => bilingual(`+${minutes} 分鐘`, `+${minutes} minutes`),
  customMinutesLabel: bilingual('自訂延長分鐘數', 'Custom extension minutes'),
  confirmExtend: bilingual('確認延長', 'Confirm extension'),
  finishAction: bilingual('平安下山（結束行程）', 'Safely down (finish trip)'),
  confirmHelp: bilingual('確認求助', 'Confirm help request'),
  missingFieldsLabel: bilingual('還差這些就能送出：', 'Still needed before submitting:'),
  sectionTime: bilingual('時間', 'Timing'),
  fieldTimeWindow: bilingual('有效的出發與下山時間', 'Valid start and finish times'),
  fieldConfirmation: bilingual('勾選最後確認', 'Final confirmation checkbox'),
  goToTrip: bilingual('開啟行程頁', 'Open trip page'),
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx vitest run tests/features/i18n.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/i18n/copy.ts tests/features/i18n.test.ts
git commit -m "feat: add phase-1 UI copy entries"
```

---

### Task 4: 抽出 formatTime／formatElapsed 至共用模組

**Files:**
- Create: `src/lib/format-time.ts`
- Modify: `app/trips/[tripId]/TripActions.tsx:16-30`（刪除本地定義，改為 import＋re-export）

**Interfaces:**
- Produces: `formatTime(value?: string): string`、`formatElapsed(startedAt?: string, now?: string): string`（行為與現有 `TripActions.tsx:16-30` 完全相同，僅搬移）。`TripActions` 續 re-export 兩者（`trip-actions.test.tsx` 與 Task 5 首頁都會用到）。

- [ ] **Step 1: 建立 `src/lib/format-time.ts`（內容自 TripActions 原樣搬移）**

```ts
import { copy } from '@/src/features/i18n/copy';

export const formatTime = (value?: string) => {
  if (!value) return copy.notAvailableYet;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')} Asia/Taipei`;
};

export const formatElapsed = (startedAt?: string, now = new Date().toISOString()) => {
  if (!startedAt) return copy.notAvailableYet;
  const minutes = Math.max(0, Math.floor((new Date(now).getTime() - new Date(startedAt).getTime()) / 60_000));
  const hours = Math.floor(minutes / 60);
  return copy.elapsedTime(hours, minutes % 60);
};
```

- [ ] **Step 2: 修改 `TripActions.tsx`——刪除本地 `formatTime`／`formatElapsed` 定義（原第 16–30 行），在 import 區塊加入**

```tsx
import { formatElapsed, formatTime } from '@/src/lib/format-time';

export { formatElapsed, formatTime };
```

- [ ] **Step 3: 跑既有測試確認搬移無破壞**

Run: `npx vitest run tests/features/trip-actions.test.tsx`
Expected: PASS（3 tests，`formatElapsed` 仍可自 TripActions import）

- [ ] **Step 4: Commit**

```bash
git add src/lib/format-time.ts "app/trips/[tripId]/TripActions.tsx"
git commit -m "refactor: extract trip time formatting to src/lib"
```

---

### Task 5: 首頁改版（HomeContent＋進行中行程卡）

**Files:**
- Create: `app/HomeContent.tsx`
- Modify: `app/page.tsx`（整檔覆寫為 async server component）
- Test: `tests/features/home.test.tsx`（整檔改寫）

**Interfaces:**
- Consumes: `Card`、`Chip`（Task 2）、`copy.goToTrip`（Task 3）、`formatTime`（Task 4）、既有 `sessionCookie`／`verifySession`。
- Produces: `HomeContent({ activeTrip?: HomeActiveTrip })`、`interface HomeActiveTrip { id: string; routeName: string; plannedFinishAt: string }`（`plannedFinishAt` 為**已格式化**顯示字串，由 server 端先轉好）。

- [ ] **Step 1: 改寫 `tests/features/home.test.tsx` 為失敗測試**

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { HomeContent } from '@/app/HomeContent';
import { copy } from '@/src/features/i18n/copy';

describe('home content', () => {
  afterEach(cleanup);

  it('keeps the four primary trip actions available as semantic navigation', () => {
    render(<HomeContent />);
    expect(screen.getByRole('heading', { name: copy.homeTitle })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: copy.primaryActions })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.createTrip })).toHaveAttribute('href', '/trips/new');
    expect(screen.getByRole('link', { name: copy.startHike })).toHaveAttribute('href', '/trips/active');
    expect(screen.getByRole('link', { name: copy.progressReport })).toHaveAttribute('href', '/trips/active#check-in');
    expect(screen.getByRole('link', { name: copy.safeDown })).toHaveAttribute('href', '/trips/active#finish');
  });

  it('shows the active trip card with a link to the trip page when one exists', () => {
    render(<HomeContent activeTrip={{ id: 'trip-1', routeName: '七星山主峰步道', plannedFinishAt: '2026-07-20 17:30 Asia/Taipei' }} />);
    expect(screen.getByText('七星山主峰步道')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.goToTrip })).toHaveAttribute('href', '/trips/trip-1');
  });

  it('shows the create-first instructions when no trip is active', () => {
    render(<HomeContent />);
    expect(screen.getByText((_, element) => element?.textContent === copy.homeTripInstructions)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/features/home.test.tsx`
Expected: FAIL（Cannot find module '@/app/HomeContent'）

- [ ] **Step 3: 建立 `app/HomeContent.tsx`**

```tsx
import Link from 'next/link';

import { LiffBootstrap } from '@/app/LiffBootstrap';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { copy } from '@/src/features/i18n/copy';

export interface HomeActiveTrip {
  id: string;
  routeName: string;
  plannedFinishAt: string;
}

export function HomeContent({ activeTrip }: { activeTrip?: HomeActiveTrip }) {
  return <main>
    <Card>
      <h1>{copy.homeTitle}</h1>
      <p className="source-note">{copy.metadataDescription}</p>
      <LiffBootstrap />
      <p className="source-note">{copy.homeLoginInstructions}</p>
    </Card>
    {activeTrip
      ? <Card title={copy.activeTrip}>
          <div className="card-row">
            <span>{activeTrip.routeName}</span>
            <Chip tone="success">{copy.activeTrip}</Chip>
          </div>
          <p className="source-note">{copy.reportPlannedFinish(activeTrip.plannedFinishAt)}</p>
          <Link className="btn btn-primary" href={`/trips/${activeTrip.id}`}>{copy.goToTrip}</Link>
        </Card>
      : <p className="source-note">{copy.homeTripInstructions}</p>}
    <nav className="action-grid" aria-label={copy.primaryActions}>
      <a href="/trips/new">{copy.createTrip}</a>
      <a href="/trips/active">{copy.startHike}</a>
      <a href="/trips/active#check-in">{copy.progressReport}</a>
      <a href="/trips/active#finish">{copy.safeDown}</a>
    </nav>
    <p className="source-note" aria-label={copy.alertLegendLabel}>{copy.alertLegend}</p>
  </main>;
}
```

- [ ] **Step 4: 覆寫 `app/page.tsx`**

```tsx
import { and, eq } from 'drizzle-orm';
import { cookies } from 'next/headers';

import { sessionCookie, verifySession } from '@/src/features/auth/session';
import { formatTime } from '@/src/lib/format-time';

import { HomeContent, type HomeActiveTrip } from './HomeContent';

const loadActiveTrip = async (): Promise<HomeActiveTrip | undefined> => {
  const token = (await cookies()).get(sessionCookie.name)?.value;
  if (!token) return undefined;
  try {
    const session = await verifySession(token);
    const [{ db }, { routeVersions, tripMembers, trips }] = await Promise.all([
      import('@/src/db/client'), import('@/src/db/schema'),
    ]);
    const [trip] = await db
      .select({ id: trips.id, routeName: routeVersions.routeName, plannedFinishAt: trips.plannedFinishAt })
      .from(trips)
      .innerJoin(tripMembers, and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, session.userId)))
      .innerJoin(routeVersions, eq(routeVersions.id, trips.routeVersionId))
      .where(eq(trips.status, 'active'))
      .limit(1);
    if (!trip) return undefined;
    return { id: trip.id, routeName: trip.routeName, plannedFinishAt: formatTime(trip.plannedFinishAt.toISOString()) };
  } catch {
    return undefined;
  }
};

export default async function Home() {
  return <HomeContent activeTrip={await loadActiveTrip()} />;
}
```

- [ ] **Step 5: 跑測試確認通過**

Run: `npx vitest run tests/features/home.test.tsx`
Expected: PASS（3 tests）

- [ ] **Step 6: Commit**

```bash
git add app/HomeContent.tsx app/page.tsx tests/features/home.test.tsx
git commit -m "feat: redesign home with active trip card"
```

---

### Task 6: TripActions 重構——四個 Expander、移除所有彈窗

**Files:**
- Modify: `app/trips/[tripId]/TripActions.tsx`（整檔覆寫）
- Test: `tests/features/trip-actions.test.tsx`（整檔改寫）

**Interfaces:**
- Consumes: `Button`、`Card`、`Expander`、`Notice`（Task 2）、Task 3 copy、Task 4 format helpers；既有 offline queue／`ActiveTripInitialState` 不變。
- Produces: `TripActions({ tripId, initialState })` props 不變；`export type ActiveTripState`、re-export `formatElapsed`／`formatTime` 保留。四個操作按鈕名稱＝`copy.checkInAction`、`copy.extendFinishTime`、`copy.finishAction`、`copy.needHelp`。錨點 `id="check-in"`（回報區）與 `id="finish"`（結束區）供首頁深連結。

- [ ] **Step 1: 改寫 `tests/features/trip-actions.test.tsx` 為新行為的失敗測試**

```tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatElapsed, TripActions } from '@/app/trips/[tripId]/TripActions';
import { copy } from '@/src/features/i18n/copy';

const initialState = {
  startedAt: '2026-07-12T00:00:00.000Z',
  plannedFinishAt: '2026-07-12T05:00:00.000Z',
  lastSuccessfulCheckInAt: '2026-07-12T00:30:00.000Z',
  gpsFreshness: copy.gpsFreshness(1),
  now: '2026-07-12T01:00:00.000Z',
  pendingQueueCount: 0,
};

const okFetch = () => vi.fn(async () => new Response('{}', { status: 200 }));

describe('TripActions', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('calculates elapsed time from the supplied server now and start time', () => {
    expect(formatElapsed('2026-07-12T00:00:00.000Z', '2026-07-12T01:02:03.000Z')).toBe(copy.elapsedTime(1, 2));
  });

  it('shows the status card and four stacked actions without prompt dialogs', () => {
    const prompt = vi.fn();
    vi.stubGlobal('prompt', prompt);
    render(<TripActions tripId="trip-1" initialState={{ ...initialState, pendingQueueCount: 2 }} />);
    for (const action of [copy.checkInAction, copy.extendFinishTime, copy.finishAction, copy.needHelp]) {
      expect(screen.getByRole('button', { name: action })).toBeInTheDocument();
    }
    expect(screen.getByText((_, element) => element?.textContent === copy.reportCount(2))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: copy.retryPendingReports })).toBeInTheDocument();
    expect(prompt).not.toHaveBeenCalled();
  });

  it('sends a quick safe check-in from the expander', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.checkInAction }));
    fireEvent.click(screen.getByRole('button', { name: copy.quickCheckInSafe }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.checkInSuccess())).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/trips/trip-1/check-ins');
    expect(JSON.parse(String(init.body)).message).toBe(copy.quickCheckInSafe);
  });

  it('sends a custom check-in message from the expander', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.checkInAction }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '過黑水塘山屋' } });
    fireEvent.click(screen.getByRole('button', { name: copy.sendCheckIn }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.checkInSuccess())).toBeInTheDocument();
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(String(init.body)).message).toBe('過黑水塘山屋');
  });

  it('extends the planned finish time from a quick option', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.extendFinishTime }));
    fireEvent.click(screen.getByRole('button', { name: copy.extendByMinutes(30) }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.finishTimeExtended)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/trips/trip-1/extend');
    expect(typeof JSON.parse(String(init.body)).plannedFinishAt).toBe('string');
  });

  it('finishes only after the expanded confirmation', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    expect(screen.queryByRole('button', { name: copy.safeFinish })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: copy.finishAction }));
    const confirm = screen.getByRole('button', { name: copy.safeFinish });
    expect(confirm).toHaveAttribute('aria-describedby', 'finish-description');
    fireEvent.click(confirm);
    expect(await screen.findByText((_, element) => element?.textContent === copy.tripFinished)).toBeInTheDocument();
    expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe('/api/trips/trip-1/finish');
  });

  it('sends a help request with an optional message', async () => {
    const fetchMock = okFetch();
    vi.stubGlobal('fetch', fetchMock);
    render(<TripActions tripId="trip-1" initialState={initialState} />);
    fireEvent.click(screen.getByRole('button', { name: copy.needHelp }));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '腳扭傷' } });
    fireEvent.click(screen.getByRole('button', { name: copy.confirmHelp }));
    expect(await screen.findByText((_, element) => element?.textContent === copy.helpConfirmation())).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/trips/trip-1/help');
    expect(JSON.parse(String(init.body)).message).toBe('腳扭傷');
  });
});
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/features/trip-actions.test.tsx`
Expected: FAIL（找不到 `copy.checkInAction` 名稱的按鈕等）

- [ ] **Step 3: 覆寫 `app/trips/[tripId]/TripActions.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Expander } from '@/app/components/Expander';
import { Notice } from '@/app/components/Notice';
import {
  createIndexedDbCheckInStore,
  enqueueCheckIn,
  flushCheckIns,
  type QueuedCheckIn,
} from '@/src/offline/check-in-queue';
import type { ActiveTripInitialState } from '@/src/features/trips/active-trip';
import { copy } from '@/src/features/i18n/copy';
import { formatElapsed, formatTime } from '@/src/lib/format-time';

export { formatElapsed, formatTime };

export type ActiveTripState = ActiveTripInitialState;

type OpenAction = 'checkIn' | 'extend' | 'finish' | 'help';

const locationFix = (): Promise<{ latitude: number; longitude: number; accuracyMeters: number; capturedAt: string; source: 'gps' } | undefined> =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        capturedAt: new Date(position.timestamp).toISOString(),
        source: 'gps',
      }),
      () => resolve(undefined),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15_000 },
    );
  });

export function TripActions({ tripId, initialState }: { tripId: string; initialState: ActiveTripState }) {
  const [lastSuccessfulCheckInAt, setLastSuccessfulCheckInAt] = useState(initialState.lastSuccessfulCheckInAt);
  const [gpsFreshness, setGpsFreshness] = useState(initialState.gpsFreshness);
  const [pendingQueueCount, setPendingQueueCount] = useState(initialState.pendingQueueCount);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string }>();
  const [openAction, setOpenAction] = useState<OpenAction>();
  const [customMessage, setCustomMessage] = useState('');
  const [customMinutes, setCustomMinutes] = useState('30');
  const [helpMessage, setHelpMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const refreshQueue = useCallback(async () => {
    if (typeof indexedDB === 'undefined') return;
    const queue = createIndexedDbCheckInStore();
    setPendingQueueCount((await queue.list()).length);
  }, []);

  useEffect(() => { void refreshQueue(); }, [refreshQueue]);

  const sendCheckIn = useCallback(async (item: Pick<QueuedCheckIn, 'message' | 'location' | 'idempotencyKey'>) => {
    const response = await fetch(`/api/trips/${tripId}/check-ins`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error('Check-in was not accepted');
    setLastSuccessfulCheckInAt(new Date().toISOString());
  }, [tripId]);

  const toggleAction = (action: OpenAction) =>
    setOpenAction((current) => (current === action ? undefined : action));

  const captureLocation = async () => {
    const location = await locationFix();
    setGpsFreshness(location
      ? copy.freshLocationAt(new Date(location.capturedAt).toLocaleTimeString())
      : copy.unavailableLocation());
    return location;
  };

  const submitCheckIn = async (message: string) => {
    setBusy(true);
    const location = await captureLocation();
    const item = { tripId, message, location, idempotencyKey: crypto.randomUUID() };
    try {
      await sendCheckIn(item);
      setNotice({ tone: 'success', text: copy.checkInSuccess() });
    } catch {
      const queue = createIndexedDbCheckInStore();
      await enqueueCheckIn(item, queue);
      await refreshQueue();
      setNotice({ tone: 'success', text: copy.checkInPending });
    }
    setBusy(false);
    setOpenAction(undefined);
    setCustomMessage('');
  };

  const retryPending = async () => {
    const queue = createIndexedDbCheckInStore();
    await flushCheckIns(queue, sendCheckIn);
    await refreshQueue();
  };

  const extend = async (minutes: number) => {
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    setBusy(true);
    const response = await fetch(`/api/trips/${tripId}/extend`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        plannedFinishAt: new Date(Date.now() + minutes * 60_000).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    setNotice(response.ok
      ? { tone: 'success', text: copy.finishTimeExtended }
      : { tone: 'error', text: copy.finishTimeExtensionError });
    setBusy(false);
    setOpenAction(undefined);
  };

  const finish = async () => {
    setBusy(true);
    const location = await captureLocation();
    const response = await fetch(`/api/trips/${tripId}/finish`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ location, idempotencyKey: crypto.randomUUID() }),
    });
    setNotice(response.ok
      ? { tone: 'success', text: copy.tripFinished }
      : { tone: 'error', text: copy.tripFinishError });
    setBusy(false);
    setOpenAction(undefined);
  };

  const help = async () => {
    setBusy(true);
    const location = await captureLocation();
    const response = await fetch(`/api/trips/${tripId}/help`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: helpMessage.trim() || undefined,
        location,
        idempotencyKey: crypto.randomUUID(),
      }),
    });
    setNotice(response.ok
      ? { tone: 'success', text: copy.helpConfirmation() }
      : { tone: 'error', text: copy.helpError });
    setBusy(false);
    setOpenAction(undefined);
    setHelpMessage('');
  };

  return <section aria-label={copy.activeTripLabel}>
    <Notice tone="warning">{copy.safetyNotice}</Notice>
    <Card>
      <dl className="status-list">
        <div><dt>{copy.elapsedTimeLabel}</dt><dd>{formatElapsed(initialState.startedAt, initialState.now)}</dd></div>
        <div><dt>{copy.plannedFinish}</dt><dd>{formatTime(initialState.plannedFinishAt)}</dd></div>
        <div><dt>{copy.lastSuccessfulCheckIn}</dt><dd>{formatTime(lastSuccessfulCheckInAt)}</dd></div>
        <div><dt>{copy.currentGps}</dt><dd>{gpsFreshness}</dd></div>
        <div><dt>{copy.pendingReports}</dt><dd>{copy.reportCount(pendingQueueCount)}</dd></div>
      </dl>
      {pendingQueueCount > 0 &&
        <Button variant="ghost" onClick={() => void retryPending()}>{copy.retryPendingReports}</Button>}
    </Card>

    <div id="check-in">
      <Expander label={copy.checkInAction} variant="primary"
        open={openAction === 'checkIn'} onToggle={() => toggleAction('checkIn')}>
        <Button disabled={busy} onClick={() => void submitCheckIn(copy.quickCheckInSafe)}>
          {copy.quickCheckInSafe}
        </Button>
        <Button variant="secondary" disabled={busy} onClick={() => void submitCheckIn(copy.quickCheckInShelter)}>
          {copy.quickCheckInShelter}
        </Button>
        <label>{copy.customCheckInLabel}
          <textarea value={customMessage} onChange={(event) => setCustomMessage(event.target.value)} />
        </label>
        <Button variant="secondary" disabled={busy || !customMessage.trim()}
          onClick={() => void submitCheckIn(customMessage.trim())}>
          {copy.sendCheckIn}
        </Button>
      </Expander>
    </div>

    <Expander label={copy.extendFinishTime}
      open={openAction === 'extend'} onToggle={() => toggleAction('extend')}>
      <div className="quick-time-grid">
        {[30, 60, 120].map((minutes) =>
          <Button key={minutes} variant="secondary" disabled={busy} onClick={() => void extend(minutes)}>
            {copy.extendByMinutes(minutes)}
          </Button>)}
      </div>
      <label>{copy.customMinutesLabel}
        <input type="number" min="1" value={customMinutes}
          onChange={(event) => setCustomMinutes(event.target.value)} />
      </label>
      <Button variant="secondary" disabled={busy} onClick={() => void extend(Number(customMinutes))}>
        {copy.confirmExtend}
      </Button>
    </Expander>

    <div id="finish">
      <Expander label={copy.finishAction}
        open={openAction === 'finish'} onToggle={() => toggleAction('finish')}>
        <p>{copy.finishConfirmation}</p>
        <span id="finish-description" hidden>{copy.safeFinishDescription}</span>
        <Button aria-describedby="finish-description" disabled={busy} onClick={() => void finish()}>
          {copy.safeFinish}
        </Button>
      </Expander>
    </div>

    <Expander label={copy.needHelp} variant="danger"
      open={openAction === 'help'} onToggle={() => toggleAction('help')}>
      <label>{copy.helpPrompt}
        <textarea value={helpMessage} onChange={(event) => setHelpMessage(event.target.value)} />
      </label>
      <Button variant="danger" disabled={busy} onClick={() => void help()}>{copy.confirmHelp}</Button>
    </Expander>

    {notice && <Notice tone={notice.tone}>{notice.text}</Notice>}
  </section>;
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npx vitest run tests/features/trip-actions.test.tsx`
Expected: PASS（7 tests）

- [ ] **Step 5: 確認彈窗已絕跡**

Run: `grep -rn "window.prompt\|window.confirm" "app/trips/[tripId]/TripActions.tsx"`
Expected: 無輸出

- [ ] **Step 6: Commit**

```bash
git add "app/trips/[tripId]/TripActions.tsx" tests/features/trip-actions.test.tsx
git commit -m "feat: replace trip action dialogs with inline expanders"
```

---

### Task 7: DraftTrip 套用新元件

**Files:**
- Modify: `app/trips/[tripId]/DraftTrip.tsx`（僅 JSX 區塊；state 與 handlers 不動）

**Interfaces:**
- Consumes: `Button`、`Card`、`Notice`（Task 2）。
- Produces: props 與對外行為不變（`tests/features/draft-trip.test.tsx` 應原樣通過）。

- [ ] **Step 1: 將 `DraftTrip.tsx` 的 import 補上元件，`return` 區塊改為**

```tsx
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Notice } from '@/app/components/Notice';
```

```tsx
  return <section aria-label={copy.tripDraft}>
    <h1>{copy.tripDraft}</h1>
    <Card>
      <dl className="status-list">
        <div><dt>{copy.route}</dt><dd>{routeName}</dd></div>
        <div><dt>{copy.plannedFinish}</dt><dd>{new Date(plannedFinishAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}</dd></div>
        <div><dt>{copy.guardians}</dt><dd>{guardians.length ? copy.guardianNames(guardians) : copy.noBoundGuardian}</dd></div>
        <div><dt>{copy.members}</dt><dd>{copy.memberNames(members)}</dd></div>
      </dl>
    </Card>
    {isOwner && <Card>
      <Button variant="secondary" onClick={() => void invite()}>{copy.createSquadInvite}</Button>
      {inviteUrl && <Notice tone="success">{copy.inviteLink(inviteUrl)}</Notice>}
      {members.filter((member) => member.role === 'member').map((member) =>
        <Button key={member.id} variant="ghost" onClick={() => void deputy(member.id)}>
          {copy.assignDeputy(member.name)}
        </Button>)}
    </Card>}
    <Button onClick={() => void start()}>{copy.startAndNotify}</Button>
    {notice && <Notice tone="warning">{notice}</Notice>}
  </section>;
```

- [ ] **Step 2: 跑既有測試確認通過**

Run: `npx vitest run tests/features/draft-trip.test.tsx tests/features/trip-actions.test.tsx`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add "app/trips/[tripId]/DraftTrip.tsx"
git commit -m "feat: restyle draft trip with shared components"
```

---

### Task 8: 建立行程表單——缺件提示（TDD）＋卡片分區

**Files:**
- Modify: `app/trips/new/quick-trip-form.ts`（新增 `missingQuickTripFields`，`canSubmitQuickTrip` 改由其派生）
- Modify: `app/trips/new/TripForm.tsx`（JSX 重排為卡片分區；資料邏輯不動）
- Test: `tests/features/quick-trip-form-state.test.ts`（新增單元測試）
- Test: `tests/features/quick-trip-form.test.tsx`（新增一個缺件提示測試；既有測試不改）

**Interfaces:**
- Consumes: `Button`、`Card`、`Chip`、`Notice`（Task 2）、Task 3 copy。
- Produces: `type QuickTripField = 'route' | 'guardians' | 'timeWindow' | 'vehicle' | 'confirmation'`；`missingQuickTripFields(input): QuickTripField[]`（input 與 `canSubmitQuickTrip` 相同）；`canSubmitQuickTrip` 行為不變。

- [ ] **Step 1: 在 `tests/features/quick-trip-form-state.test.ts` 檔尾加入失敗測試**

```ts
import { missingQuickTripFields } from '@/app/trips/new/quick-trip-form';

it('lists every missing quick-trip field in a stable order', () => {
  expect(missingQuickTripFields({
    routeVersionId: '',
    guardianBindingIds: [],
    startsAt: '2026-07-18T08:00',
    plannedFinishAt: '',
    vehicle: ' ',
    confirmed: false,
  })).toEqual(['route', 'guardians', 'timeWindow', 'vehicle', 'confirmation']);
});

it('returns no missing fields for a submittable quick trip', () => {
  expect(missingQuickTripFields({
    routeVersionId: 'route-1',
    guardianBindingIds: ['binding-1'],
    startsAt: '2026-07-18T08:00',
    plannedFinishAt: '2026-07-18T12:00',
    vehicle: '汽車',
    confirmed: true,
  })).toEqual([]);
});
```

（若該檔已有 import 區塊，將 `missingQuickTripFields` 併入既有 import。）

- [ ] **Step 2: 跑測試確認失敗**

Run: `npx vitest run tests/features/quick-trip-form-state.test.ts`
Expected: FAIL（missingQuickTripFields is not exported）

- [ ] **Step 3: 在 `quick-trip-form.ts` 將 `canSubmitQuickTrip` 整段換成**

```ts
export type QuickTripField = 'route' | 'guardians' | 'timeWindow' | 'vehicle' | 'confirmation';

export const missingQuickTripFields = (input: {
  routeVersionId: string;
  guardianBindingIds: string[];
  startsAt: string;
  plannedFinishAt: string;
  vehicle: string;
  confirmed: boolean;
}): QuickTripField[] => [
  ...(input.routeVersionId ? [] : ['route' as const]),
  ...(input.guardianBindingIds.length > 0 ? [] : ['guardians' as const]),
  ...(isValidTripWindow(input.startsAt, input.plannedFinishAt) ? [] : ['timeWindow' as const]),
  ...(input.vehicle.trim() ? [] : ['vehicle' as const]),
  ...(input.confirmed ? [] : ['confirmation' as const]),
];

export const canSubmitQuickTrip = (input: Parameters<typeof missingQuickTripFields>[0]) =>
  missingQuickTripFields(input).length === 0;
```

- [ ] **Step 4: 跑測試確認通過（含既有 canSubmit 測試）**

Run: `npx vitest run tests/features/quick-trip-form-state.test.ts`
Expected: PASS

- [ ] **Step 5: 在 `tests/features/quick-trip-form.test.tsx` 檔尾（describe 內）加入缺件提示的失敗測試**

```tsx
  it('lists what is still missing while the submit button is disabled', async () => {
    render(<TripForm />);
    await screen.findByRole('option', { name: '南投縣｜合歡山主峰｜合歡山主峰線' });

    expect(screen.getByText(copyName(copy.missingFieldsLabel))).toBeInTheDocument();
    expect(screen.getByText(copyName(copy.fieldConfirmation))).toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: copyName(copy.useLastRoute(route.routeName)) }));
    fireEvent.click(screen.getByRole('checkbox', { name: copyName(copy.confirmTripDetails) }));
    await waitFor(() =>
      expect(screen.queryByText(copyName(copy.missingFieldsLabel))).not.toBeInTheDocument());
    expect(screen.getByRole('button', { name: copyName(copy.createTripDraft) })).toBeEnabled();
  });
```

- [ ] **Step 6: 跑測試確認新測試失敗、其餘通過**

Run: `npx vitest run tests/features/quick-trip-form.test.tsx`
Expected: 僅新測試 FAIL（找不到 missingFieldsLabel 文字）

- [ ] **Step 7: 修改 `TripForm.tsx`**

Import 區塊加入：

```tsx
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Chip } from '@/app/components/Chip';
import { Notice } from '@/app/components/Notice';
```

並將 `missingQuickTripFields, type QuickTripField` 併入自 `./quick-trip-form` 的 import。在元件外（`splitLines` 之後）加入：

```tsx
const fieldLabels: Record<QuickTripField, string> = {
  route: copy.route,
  guardians: copy.tripGuardians,
  timeWindow: copy.fieldTimeWindow,
  vehicle: copy.vehicle,
  confirmation: copy.fieldConfirmation,
};
```

把 `const canSubmit = ...` 換成：

```tsx
  const missing = missingQuickTripFields({
    routeVersionId,
    guardianBindingIds: selectedGuardianBindingIds,
    startsAt,
    plannedFinishAt,
    vehicle,
    confirmed,
  });
  const canSubmit = catalogAvailable && !submitting && missing.length === 0;
```

`return` 的 JSX 整段換成（欄位事件處理與現版完全相同，僅容器與按鈕元件改變）：

```tsx
  return <form className="trip-form" onSubmit={submit}>
    <h1>{copy.quickCreateTrip}</h1>
    <p className="source-note">{copy.verifiedRoutesOnly}</p>

    <Card title={copy.route}>
      {lastRoute && <Button variant="secondary" onClick={() => chooseRoute(lastRoute.id)}>
        {copy.useLastRoute(lastRoute.routeName)}
      </Button>}
      <label>{copy.searchVerifiedRoutes}
        <input type="search" value={routeQuery} onChange={(event) => setRouteQuery(event.target.value)} />
      </label>
      <label>{copy.route}
        <select required value={routeVersionId} onChange={(event) => chooseRoute(event.target.value)}>
          <option value="">{copy.selectOption}</option>
          {renderedRoutes.map((route) => <option key={route.id} value={route.id}>
            {route.region}｜{route.mountainName}｜{route.routeName}
          </option>)}
        </select>
      </label>
      {selectedRoute && <p className="source-note"><a href={selectedRoute.sourceUrl}>
        {selectedRoute.durationMinutes !== null
          ? copy.routeSourceSummary(selectedRoute.durationMinutes, selectedRoute.sourceOrganization, selectedRoute.sourceVersion, selectedRoute.reviewedAt)
          : copy.routeSourceMissingDuration(selectedRoute.sourceOrganization, selectedRoute.sourceVersion, selectedRoute.reviewedAt)}
      </a></p>}
      {selectedRoute?.sourceReferences?.some((reference) => reference.tier === 'community') &&
        <p className="source-note">{copy.communitySourceWarning}</p>}
    </Card>

    <Card title={copy.sectionTime}>
      <div className="quick-time-grid">
        <label>{copy.startsAt}
          <input required type="datetime-local" value={startsAt} onChange={(event) => changeStart(event.target.value)} />
        </label>
        <label>{copy.plannedFinishAt}
          <input required type="datetime-local" value={plannedFinishAt} onChange={(event) => {
            setPlannedFinishAt(event.target.value);
            setFinishWasEdited(true);
            setConfirmed(false);
          }} />
        </label>
      </div>
    </Card>

    <Card title={copy.tripGuardians}>
      {activeBindings.map((binding) => <label key={binding.id}>
        <input type="checkbox" checked={guardianBindingIds.includes(binding.id)} onChange={(event) => {
          defaultsTouched.current.guardians = true;
          setConfirmed(false);
          setGuardianBindingIds((ids) => event.target.checked
            ? [...new Set([...ids, binding.id])]
            : ids.filter((id) => id !== binding.id));
        }} />
        {binding.displayName || (binding.sourceType === 'group' ? copy.boundGroup : copy.boundGuardian)}
      </label>)}
      {activeBindings.length === 0 && <p className="source-note">{copy.noActiveBindings}</p>}
      <Button variant="secondary" onClick={() => void createBinding()}>{copy.createBindingCode}</Button>
      {bindingCode && <Notice tone="success">{copy.bindingCodeInstructions(bindingCode)}</Notice>}
    </Card>

    <details className="card">
      <summary>{copy.tripEmergencyDetails}</summary>
      <label>{copy.vehicle}
        <input required value={vehicle} onChange={(event) => {
          defaultsTouched.current.vehicle = true;
          setVehicle(event.target.value);
          setConfirmed(false);
        }} />
      </label>
      <label>{copy.equipment}
        <textarea value={equipment} onChange={(event) => {
          defaultsTouched.current.equipment = true;
          setEquipment(event.target.value);
        }} />
      </label>
      <label>{copy.leaderPhone}
        <input type="tel" value={leaderPhone} onChange={(event) => {
          defaultsTouched.current.leaderPhone = true;
          setLeaderPhone(event.target.value);
        }} />
      </label>
    </details>

    <label className="confirmation-row">
      <input type="checkbox" checked={confirmed} onChange={(event) => {
        defaultsTouched.current.confirmed = true;
        setConfirmed(event.target.checked);
      }} />
      {copy.confirmTripDetails}
    </label>

    {missing.length > 0 && <div className="missing-fields" role="status">
      <span className="label">{copy.missingFieldsLabel}</span>
      {missing.map((field) => <Chip key={field} tone="warning">{fieldLabels[field]}</Chip>)}
    </div>}
    <Button type="submit" disabled={!canSubmit}>
      {submitting ? copy.creatingTrip : copy.createTripDraft}
    </Button>
    {error && <Notice tone="error">{error}</Notice>}
  </form>;
```

原 fieldset／legend 改為 Card；若既有測試因結構改變失敗，修元件保住原本的 role 與 label 語意，**不得改舊測試的預期**。

- [ ] **Step 8: 跑測試確認全部通過**

Run: `npx vitest run tests/features/quick-trip-form.test.tsx tests/features/quick-trip-form-state.test.ts`
Expected: PASS（含新缺件提示測試）

- [ ] **Step 9: Commit**

```bash
git add app/trips/new/quick-trip-form.ts app/trips/new/TripForm.tsx tests/features/quick-trip-form-state.test.ts tests/features/quick-trip-form.test.tsx
git commit -m "feat: card-section trip form with missing-field hints"
```

---

### Task 9: 周邊頁面套版（active／join／guardian-viewer／LiffBootstrap）

**Files:**
- Modify: `app/trips/active/page.tsx`（return 區塊）
- Modify: `app/trips/join/[token]/JoinTrip.tsx`（return 區塊）
- Modify: `app/trips/[tripId]/guardian-viewer/GuardianViewer.tsx`（return 區塊＋移除無作用的 useEffect）
- Modify: `app/LiffBootstrap.tsx`（回傳的訊息元素）

**Interfaces:**
- Consumes: `Button`、`Card`、`Notice`（Task 2）。
- Produces: 各元件 props 與 role 語意不變（`deep-links.test.tsx`、`new-trip-page.test.tsx` 應原樣通過）。

- [ ] **Step 1: `app/trips/active/page.tsx`——import 加 `Card`，未登入／無行程的 return 改為**

```tsx
import { Card } from '@/app/components/Card';
```

```tsx
  return <main>
    <h1>{copy.currentTrip}</h1>
    <Card>
      <p>{copy.noActiveTrip}</p>
      <p className="source-note">{copy.noActiveTripInstructions}</p>
      <Link className="btn btn-primary" href="/trips/new">{copy.createTrip}</Link>
    </Card>
  </main>;
```

- [ ] **Step 2: `JoinTrip.tsx`——return 改為**

```tsx
import { Button } from '@/app/components/Button';
import { Card } from '@/app/components/Card';
import { Notice } from '@/app/components/Notice';
```

```tsx
  return <main>
    <LiffBootstrap onReady={() => setReady(true)} />
    <h1>{copy.joinSquad}</h1>
    <Card>
      <p className="source-note">{copy.joinInstructions}</p>
      <Button disabled={!ready} onClick={() => void join()}>{copy.joinTrip}</Button>
    </Card>
    {notice && <Notice tone="error">{notice}</Notice>}
  </main>;
```

- [ ] **Step 3: `GuardianViewer.tsx`——刪除無作用的 `useEffect`（`if (!viewer && !error) return;` 那段，連同 `useEffect` import），return 改為**

```tsx
import { Card } from '@/app/components/Card';
import { Notice } from '@/app/components/Notice';
```

```tsx
  return <main>
    <LiffBootstrap onReady={() => void load()} />
    <h1>{copy.guardianTripInfo}</h1>
    {viewer && <>
      <Card>
        <p>{viewer.route}</p>
        <p>{copy.viewerTeam(viewer.team)}</p>
        {location && <div>
          <p>{copy.reportLocation(location.latitude, location.longitude)}</p>
          <p>{copy.reportLocationTime(location.source, location.capturedAt)}</p>
          {accuracy && <p>{accuracy}</p>}
        </div>}
      </Card>
      <Card><pre className="report-text">{viewer.report}</pre></Card>
    </>}
    {error && <Notice tone="error">{error}</Notice>}
  </main>;
```

- [ ] **Step 4: `LiffBootstrap.tsx`——三個訊息 return 改為**

```tsx
import { Notice } from '@/app/components/Notice';
```

```tsx
  if (state === 'ready') return null;
  if (state === 'unconfigured') return <Notice tone="warning">{copy.liffUnconfigured}</Notice>;
  if (state === 'error') return <Notice tone="error">{copy.liffLoginError}</Notice>;
  return <p className="source-note" role="status">{copy.liffLoading}</p>;
```

- [ ] **Step 5: 跑受影響測試**

Run: `npx vitest run tests/features/deep-links.test.tsx tests/features/new-trip-page.test.tsx tests/features/home.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/trips/active/page.tsx "app/trips/join/[token]/JoinTrip.tsx" "app/trips/[tripId]/guardian-viewer/GuardianViewer.tsx" app/LiffBootstrap.tsx
git commit -m "feat: apply design system to remaining pages"
```

---

### Task 10: Legacy 清理與總驗證

**Files:**
- Modify: `app/globals.css`（刪除 legacy 區塊）

- [ ] **Step 1: 確認 legacy class 已無人使用**

Run: `grep -rn "alert-label\|secondary-action" app src`
Expected: 無輸出（若有殘留，回到對應 task 改完再繼續）

- [ ] **Step 2: 刪除 `globals.css` 中「legacy」註解起的三段規則（`.alert-label`、`.secondary-action`、`nav[aria-label^='主要操作']` 兩條）**

- [ ] **Step 3: 全套件測試**

Run: `npm test`
Expected: 全數 PASS，無 skip

- [ ] **Step 4: production build**

Run: `npm run build`
Expected: build 成功、無 type error

- [ ] **Step 5: 冒煙驗證（新樣式確實出現在頁面）**

```bash
npm run dev &
sleep 8
curl -s http://localhost:3000 | grep -c "action-grid"
kill %1
```

Expected: 輸出 ≥1（新版 class 已出現在首頁 HTML）

- [ ] **Step 6: Commit**

```bash
git add app/globals.css
git commit -m "chore: remove legacy pre-redesign styles"
```
