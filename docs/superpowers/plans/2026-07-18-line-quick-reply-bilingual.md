# HikeSafe LINE Quick Reply and Bilingual Messaging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (- [ ]) syntax for tracking.

**Goal:** Let authenticated HikeSafe members submit explicit check-ins, LINE locations, and confirmed help requests through LINE Quick Reply while adding Chinese-first English translations to all user-facing feature copy.

**Architecture:** Keep the signed LINE webhook as the only inbound boundary. Add a conversation service that resolves the LINE sender to one or more active trip memberships, emits Quick Reply messages, and calls the existing recordCheckIn and requestHelp commands after server-side authorization. Add a dedicated line location source for LINE coordinates whose accuracy is unknown, and centralize bilingual system copy without translating route catalog or user-entered data.

**Tech Stack:** Next.js App Router, TypeScript, LINE Messaging API, PostgreSQL, Drizzle ORM, Vitest, existing Supabase/Vercel deployment.

## Global Constraints

- Preserve LINE HMAC signature validation, sender-to-user mapping, trip membership authorization, idempotency, and retry behavior.
- Keep normal check-ins silent to guardians; only confirmed help, lifecycle, due, and overdue events notify guardians.
- gps and network locations must retain accuracy; line locations may have accuracyMeters = NULL and must never satisfy start-trip GPS validation.
- Show bilingual system copy as Chinese on the first line and English on the second line.
- Keep route names, mountain names, official route data, and user-entered content in their original form.
- Do not add Rich Menu, LINE start-trip, LINE finish-trip, or LINE extension commands in this scope.
- Do not modify existing migration files; add a new Drizzle migration and a separate manual Supabase incremental SQL file.
- Keep Node 24.x/npm requirements and do not add a localization dependency.
- Preserve unrelated working-tree changes.

## File Map

- Create: src/features/i18n/copy.ts
- Create: src/features/line/conversation.ts
- Create: drizzle/0011_line_location_source.sql
- Create: docs/supabase-line-location-migration.sql
- Modify: src/db/schema.ts, src/lib/location.ts, src/features/trips/commands.ts
- Modify: src/features/reports/build-report.ts, src/features/guardian-viewer/service.ts, src/features/alerts/process.ts, src/features/line/messages.ts
- Modify: app/api/line/webhook/route.ts
- Modify: the listed app pages/components under app/ to use bilingual system copy
- Add or modify tests under tests/features, tests/api, and tests/integration

---

### Task 1: Add the LINE location source without weakening GPS validation

Files:
- Create: drizzle/0011_line_location_source.sql
- Create: docs/supabase-line-location-migration.sql
- Modify: src/db/schema.ts
- Modify: src/lib/location.ts
- Modify: src/features/trips/commands.ts
- Test: tests/features/location.test.ts
- Test: tests/features/trip-commands.test.ts
- Test: tests/features/schema.test.ts

Interfaces:
- Consumes: existing LocationFix, check_ins schema, recordCheckIn, and startTrip.
- Produces: LineLocationFix, CheckInLocation, locationSourceEnum value line, and a database constraint accepting coordinates without precision only for line locations.

- [ ] Step 1: Write failing type and validation tests.

~~~ts
expect(() => assertFreshLineLocation({
  latitude: 23.47, longitude: 120.95,
  capturedAt: new Date('2026-07-18T08:00:00.000Z'), source: 'line',
}, new Date('2026-07-18T08:00:05.000Z'))).not.toThrow();

await expect(startTrip({
  tripId: 'trip-1', userId: 'member-1',
  location: { latitude: 23.47, longitude: 120.95, capturedAt: now, source: 'line' },
  idempotencyKey: 'start-1', now,
}, repository)).rejects.toThrow(/GPS/);
~~~

Add a schema assertion that line is declared and the migration allows null accuracy only for location_source = line.

- [ ] Step 2: Run focused tests and verify failure.

Run:

~~~bash
npm test -- tests/features/location.test.ts tests/features/trip-commands.test.ts tests/features/schema.test.ts
~~~

Expected: FAIL because the new type, enum value, and constraint do not exist.

- [ ] Step 3: Implement the new location types and validation.

Keep LocationFix restricted to gps | network and add:

~~~ts
export interface LineLocationFix {
  latitude: number;
  longitude: number;
  capturedAt: Date;
  source: 'line';
}

export type CheckInLocation = LocationFix | LineLocationFix;
~~~

Share coordinate and timestamp validation between sources. Keep the existing accuracy and five-minute freshness checks in assertFreshLocation; add assertFreshLineLocation that validates Taiwan bounds and a non-future timestamp without inventing accuracy. Make only check-in paths accept CheckInLocation; keep StartTripCommand.location as LocationFix.

- [ ] Step 4: Add the migration and manual Supabase SQL.

Create drizzle/0011_line_location_source.sql with:

~~~sql
ALTER TYPE "public"."location_source" ADD VALUE IF NOT EXISTS 'line';
--> statement-breakpoint
ALTER TABLE "public"."check_ins" DROP CONSTRAINT "check_ins_location_consistency";
--> statement-breakpoint
ALTER TABLE "public"."check_ins" ADD CONSTRAINT "check_ins_location_consistency" CHECK (
  (
    "location_status" = 'available'
    AND "latitude" IS NOT NULL AND "longitude" IS NOT NULL
    AND "location_captured_at" IS NOT NULL
    AND (("location_source" IN ('gps', 'network') AND "accuracy_meters" IS NOT NULL)
      OR ("location_source" = 'line' AND "accuracy_meters" IS NULL))
  )
  OR (
    "location_status" IN ('unavailable', 'redacted')
    AND "latitude" IS NULL AND "longitude" IS NULL
    AND "accuracy_meters" IS NULL AND "location_captured_at" IS NULL
    AND "location_source" IS NULL
  )
);
~~~

Create the same SQL without migration breakpoints in docs/supabase-line-location-migration.sql, with a comment explaining that it is for the already-bootstrapped Supabase database. Do not edit earlier migrations.

- [ ] Step 5: Update schema and run focused tests.

Add line to locationSourceEnum, update stored location/report/viewer types to allow accuracyMeters: number | null for LINE, then run:

~~~bash
npm test -- tests/features/location.test.ts tests/features/trip-commands.test.ts tests/features/schema.test.ts
git diff --check
~~~

Expected: PASS, with no changes to existing migration files.

- [ ] Step 6: Commit the location-source change.

~~~bash
git add drizzle/0011_line_location_source.sql docs/supabase-line-location-migration.sql src/db/schema.ts src/lib/location.ts src/features/trips/commands.ts tests/features/location.test.ts tests/features/trip-commands.test.ts tests/features/schema.test.ts
git commit -m "feat: store LINE locations without false accuracy"
~~~

### Task 2: Centralize bilingual system copy

Files:
- Create: src/features/i18n/copy.ts
- Modify: app/LiffBootstrap.tsx, app/page.tsx, app/layout.tsx, app/globals.css
- Modify: app/trips/active/page.tsx, app/trips/[tripId]/page.tsx, app/trips/[tripId]/DraftTrip.tsx, app/trips/[tripId]/TripActions.tsx
- Modify: app/trips/[tripId]/guardian-viewer/GuardianViewer.tsx, app/trips/join/[token]/JoinTrip.tsx, app/trips/new/page.tsx, app/trips/new/TripForm.tsx
- Modify: src/features/trips/active-trip.ts, src/features/guardian-viewer/service.ts, src/features/reports/build-report.ts
- Test: tests/features/i18n.test.ts and affected UI/report/viewer tests

Interfaces:
- Consumes: all current user-facing Chinese literals found by rg -l --pcre2 "[\p{Han}]" app src.
- Produces: bilingual(chinese, english): string and typed copy entries reusable by React, reports, and LINE modules.

- [ ] Step 1: Write the formatter test.

~~~ts
import { bilingual } from '@/src/features/i18n/copy';

it('keeps Traditional Chinese first and English second', () => {
  expect(bilingual('平安回報', 'Safe check-in')).toBe('平安回報\nSafe check-in');
});
~~~

- [ ] Step 2: Run the test and verify the module is missing.

~~~bash
npm test -- tests/features/i18n.test.ts
~~~

Expected: FAIL because src/features/i18n/copy.ts does not exist.

- [ ] Step 3: Implement the shared formatter and copy catalog.

Create a dependency-free module with this shape:

~~~ts
export const bilingual = (chinese: string, english: string) =>
  chinese + '\n' + english;

export const copy = {
  homeTitle: bilingual('HikeSafe 登山留守', 'HikeSafe Hiking Check-in'),
  primaryActions: bilingual('主要操作', 'Primary actions'),
  reportProgress: bilingual('回報目前進度', 'Report progress'),
  safeFinish: bilingual('確認全隊安全下山', 'Confirm everyone is safely down'),
  noActiveTrip: bilingual('目前沒有進行中的行程', 'There is no active trip'),
} as const;
~~~

Add dynamic functions for route load errors, authentication errors, check-in success, help confirmation, unavailable location, and viewer/report labels. Keep route names and user-provided values as interpolation arguments, never as translated entries.

- [ ] Step 4: Replace system/UI literals and update tests.

Use copy or bilingual for visible feature strings, status labels, buttons, accessible labels, prompts, and errors in the listed files. Update the CSS selector when an aria-label changes. Leave route catalog fixtures, route names, and user-entered values unchanged. Change exact Chinese-only test expectations to use copy entries or assert both lines.

- [ ] Step 5: Run the copy and UI test set.

~~~bash
npm test -- tests/features/i18n.test.ts tests/features/home.test.tsx tests/features/trip-actions.test.tsx tests/features/draft-trip.test.tsx tests/features/deep-links.test.tsx tests/features/report.test.ts tests/api/guardian-viewer.test.ts
~~~

Expected: PASS.

- [ ] Step 6: Commit the bilingual system-copy change.

~~~bash
git add src/features/i18n/copy.ts app/LiffBootstrap.tsx app/page.tsx app/layout.tsx app/globals.css app/trips/active/page.tsx 'app/trips/[tripId]/page.tsx' 'app/trips/[tripId]/DraftTrip.tsx' 'app/trips/[tripId]/TripActions.tsx' 'app/trips/[tripId]/guardian-viewer/GuardianViewer.tsx' 'app/trips/join/[token]/JoinTrip.tsx' app/trips/new/page.tsx app/trips/new/TripForm.tsx src/features/trips/active-trip.ts src/features/guardian-viewer/service.ts src/features/reports/build-report.ts tests/features/i18n.test.ts tests/features/home.test.tsx tests/features/trip-actions.test.tsx tests/features/draft-trip.test.tsx tests/features/deep-links.test.tsx tests/features/report.test.ts tests/api/guardian-viewer.test.ts
git commit -m "feat: add bilingual system copy"
~~~

### Task 3: Add Quick Reply message primitives and bilingual LINE cards

Files:
- Modify: src/features/line/messages.ts
- Modify: src/features/alerts/process.ts
- Modify: src/integrations/line/client.ts only if shared message typing requires it
- Test: tests/features/line-messages.test.ts
- Test: tests/features/alert-process.test.ts

Interfaces:
- Consumes: copy, LineMessage, AlertMessageTrip, and alert delivery trip queries.
- Produces: typed text messages with optional Quick Reply, buildCheckInPrompt, buildTripChooser, and buildHelpConfirmation.

- [ ] Step 1: Write failing message-shape tests for a bilingual prompt, the absence of location when multiple trips are ambiguous, and unknown LINE accuracy in an alert card.

- [ ] Step 2: Run npm test -- tests/features/line-messages.test.ts tests/features/alert-process.test.ts and verify the new cases fail.

- [ ] Step 3: Extend LineMessage with optional quickReply items. Define postback and location actions, using concise labels within LINE's 20-character limit. Implement:
  - buildCheckInPrompt({ tripId, includeLocation })
  - buildTripChooser(trips)
  - buildHelpConfirmation(tripId)
  Use postback data shaped as hikesafe:check-in:<tripId>:safe, hikesafe:check-in:<tripId>:shelter, hikesafe:help:<tripId>:confirm, hikesafe:help:<tripId>:cancel, and hikesafe:trip:<tripId>:select. Include the location action only when includeLocation is true.

- [ ] Step 4: Add lastLocationAccuracyMeters: number | null to AlertMessageTrip. Update src/features/alerts/process.ts to select the latest check-in accuracy. Render bilingual “位置精度：LINE 未提供 / Location accuracy: Not provided by LINE” when accuracy is null; never substitute zero or a GPS label. Update buildEmergencyReport and the viewer shape to distinguish line source.

- [ ] Step 5: Run focused tests and commit.

~~~bash
npm test -- tests/features/line-messages.test.ts tests/features/alert-process.test.ts tests/features/report.test.ts
git add src/features/line/messages.ts src/features/alerts/process.ts src/integrations/line/client.ts tests/features/line-messages.test.ts tests/features/alert-process.test.ts tests/features/report.test.ts
git commit -m "feat: add bilingual LINE quick replies"
~~~

### Task 4: Build the authorized LINE conversation service

Files:
- Create: src/features/line/conversation.ts
- Modify: src/features/trips/commands.ts only to export or accept CheckInLocation
- Test: tests/features/line-conversation.test.ts

Interfaces:
- Consumes: Quick Reply builders, recordCheckIn, requestHelp, LineLocationFix, and copy.
- Produces:

~~~ts
export interface ActiveLineTrip {
  id: string;
  routeName: string;
  plannedFinishAt: Date;
}

export interface LineConversationRepository {
  findUserByLineUserId(lineUserId: string): Promise<{ id: string } | undefined>;
  listActiveTripsForMember(userId: string): Promise<ActiveLineTrip[]>;
}

export interface LineConversationEvent {
  lineUserId: string;
  eventId: string;
  text?: string;
  postbackData?: string;
  location?: LineLocationFix;
  now: Date;
}

export const handleLineConversation: (
  event: LineConversationEvent,
  dependencies?: { repository?: LineConversationRepository },
) => Promise<LineMessage[]>;
~~~

- [ ] Step 1: Write failing service tests for the single-trip prompt, multiple-trip prompt without location, safe postback, LINE location with null accuracy, help confirmation, no active trip, and an invalid postback trip ID.

- [ ] Step 2: Run npm test -- tests/features/line-conversation.test.ts and verify failure.

- [ ] Step 3: Implement the database repository using users, tripMembers, trips, and routeVersions. Filter trips.status = active and join through users.lineUserId.

- [ ] Step 4: Implement explicit input handling:
  - 回報 returns a prompt for one active trip or a chooser for multiple.
  - 回報 <content> records a text check-in only with exactly one active trip; with multiple trips it asks the user to choose and retry.
  - safe and shelter postbacks call recordCheckIn with the event ID and canonical bilingual system message.
  - help request returns a confirmation; only confirm calls requestHelp; cancel calls no command.
  - A LINE location event is accepted only with exactly one active trip and calls recordCheckIn with source line and capturedAt equal to event.now. With multiple active trips it returns an ambiguity message and writes nothing.
  - Every postback trip ID is revalidated against the sender's active-trip list before a command call.

- [ ] Step 5: Map command errors to bilingual user responses without exposing database errors. Preserve idempotent command results and ensure normal check-in paths do not create lifecycle notifications.

- [ ] Step 6: Run tests and commit.

~~~bash
npm test -- tests/features/line-conversation.test.ts
git add src/features/line/conversation.ts src/features/trips/commands.ts tests/features/line-conversation.test.ts
git commit -m "feat: add authorized LINE conversation handling"
~~~

### Task 5: Integrate text, postback, and location events into the signed webhook

Files:
- Modify: app/api/line/webhook/route.ts
- Modify: tests/integration/line-binding.test.ts
- Create: tests/integration/line-conversation.test.ts

Interfaces:
- Consumes: handleLineConversation, LineMessage[], existing binding repository, LINE channel secrets, and reply tokens.
- Produces: one signed webhook endpoint that preserves binding and safely handles supported conversation events.

- [ ] Step 1: Add signed webhook fixtures with webhookEventId and failing tests for 回報 Quick Reply, postback forwarding, location forwarding without invented accuracy, ignored unsupported events, and bilingual binding success.

- [ ] Step 2: Run:

~~~bash
npm test -- tests/integration/line-binding.test.ts tests/integration/line-conversation.test.ts
~~~

Expected: the new conversation tests fail while the existing binding tests identify reply-adapter changes.

- [ ] Step 3: Parse message text, message location, and postback events with webhookEventId, replyToken, and source user ID. Keep signature validation before JSON parsing and unsupported events as 200 no-ops.

- [ ] Step 4: Change the reply adapter to serialize { replyToken, messages }. Convert binding success to a bilingual text message, call handleLineConversation for supported non-binding events, and send returned messages with the event reply token. Never log access tokens or trust a client-supplied user ID.

- [ ] Step 5: Run integration tests and commit.

~~~bash
npm test -- tests/integration/line-binding.test.ts tests/integration/line-conversation.test.ts
git add app/api/line/webhook/route.ts tests/integration/line-binding.test.ts tests/integration/line-conversation.test.ts
git commit -m "feat: handle LINE check-in webhook events"
~~~

### Task 6: Verify location presentation and full bilingual feature coverage

Files:
- Modify: src/features/guardian-viewer/service.ts
- Modify: app/trips/[tripId]/guardian-viewer/GuardianViewer.tsx
- Modify: src/features/reports/build-report.ts
- Modify: src/features/line/messages.ts
- Modify: src/features/alerts/process.ts
- Test: tests/api/guardian-viewer.test.ts
- Test: tests/features/report.test.ts
- Test: tests/features/line-messages.test.ts

- [ ] Step 1: Add tests asserting that a LINE location returns coordinates with accuracyMeters null and source line, that reports say LINE accuracy was not provided, and that alert cards do not display a fake GPS accuracy.

- [ ] Step 2: Return coordinates from the guardian viewer even when accuracy is null. Add the source to viewer/report shapes and preserve the existing GPS/network accuracy output and unavailable/redacted behavior.

- [ ] Step 3: Run:

~~~bash
npm test -- tests/api/guardian-viewer.test.ts tests/features/report.test.ts tests/features/line-messages.test.ts
~~~

Expected: PASS.

- [ ] Step 4: Scan for remaining user-facing Chinese-only copy.

~~~bash
rg -n --pcre2 "[\p{Han}]" app src
~~~

Review every result. Leave route data and user-entered values unchanged; every remaining system/UI/LINE literal must use copy or an explicit bilingual call.

- [ ] Step 5: Commit presentation and copy coverage.

~~~bash
git add src/features/guardian-viewer/service.ts 'app/trips/[tripId]/guardian-viewer/GuardianViewer.tsx' src/features/reports/build-report.ts src/features/line/messages.ts src/features/alerts/process.ts tests/api/guardian-viewer.test.ts tests/features/report.test.ts tests/features/line-messages.test.ts
git commit -m "feat: distinguish LINE location accuracy in reports"
~~~

### Task 7: Run full verification and prepare the Supabase migration handoff

Files:
- Verify: drizzle/0011_line_location_source.sql
- Verify: docs/supabase-line-location-migration.sql
- Verify: all changed source and test files

- [ ] Step 1: Run all tests.

~~~bash
npm test
~~~

Expected: all tests pass. If the PostgreSQL integration suite is skipped because BESAFE_TEST_DATABASE_URL is not configured, report that explicitly rather than weakening the test.

- [ ] Step 2: Run the production build.

~~~bash
npm run build
~~~

Expected: Next.js production build succeeds.

- [ ] Step 3: Verify migration ordering and manual SQL.

~~~bash
ls -1 drizzle
git diff --check
~~~

Confirm 0011_line_location_source.sql sorts after 0010_route_catalog_source_references.sql, contains no edits to earlier migrations, and that the manual SQL has no migration breakpoints. Do not run npm run db:migrate unless the target database is explicitly selected for this rollout.

- [ ] Step 4: Perform the manual acceptance test after deployment.

1. With exactly one active trip, send 回報 in LINE and verify the bilingual Quick Reply includes the location button.
2. Tap 平安 and verify one check_ins row, no help/lifecycle event, and no guardian push.
3. Tap 傳送位置 and verify location_status = available, location_source = line, coordinates present, and accuracy_meters IS NULL.
4. Open the guardian viewer and verify the coordinate is visible with precision-unavailable wording.
5. Tap 需要協助, cancel once, then confirm once; verify only confirmation creates a help event and Supabase Cron delivers the guardian notification.
6. Create a second active trip for the same user and verify the Quick Reply omits the location button and never assigns a location event to either trip.

## Plan Self-Review

- Spec coverage: LINE text, postback, location, Quick Reply, one-trip location guard, bilingual system copy, nullable LINE accuracy, migration, authorization, idempotency, silent normal check-ins, confirmed help, viewer/report output, and verification are each covered.
- Placeholder scan: no TBD, TODO, or deferred implementation step is used; every task names files, tests, commands, and expected outcomes.
- Type consistency: LineLocationFix is distinct from LocationFix; CheckInLocation is used only by check-in paths; StartTripCommand remains GPS-only; Quick Reply builders and conversation service signatures are defined before webhook integration.

