# Task 3 report: bilingual LINE Quick Replies

## Status

Completed. This change is limited to Task 3 message primitives and alert-card
presentation. It does not add webhook conversation handling.

## Implemented

- Added typed LINE text-message Quick Reply primitives:
  - postback actions with `label` and `data`
  - location actions with `label`
  - optional `quickReply.items` on text messages
- Added bilingual builders:
  - `buildCheckInPrompt({ tripId, includeLocation })`
  - `buildTripChooser(trips)`
  - `buildHelpConfirmation(tripId)`
- Used the approved postback data shapes:
  - `hikesafe:check-in:<tripId>:safe`
  - `hikesafe:check-in:<tripId>:shelter`
  - `hikesafe:help:<tripId>:confirm`
  - `hikesafe:help:<tripId>:cancel`
  - `hikesafe:trip:<tripId>:select`
- Included the LINE location action only when `includeLocation` is true. The
  multi-trip chooser has postback choices only, so an ambiguous LINE location
  cannot be assigned to a trip.
- Kept all generated Quick Reply labels at LINE's 20-character maximum; route
  labels are Unicode-safe truncated when needed.
- Extended `AlertMessageTrip` with the latest location source and nullable
  accuracy. Alert delivery now passes those latest check-in fields through to the
  card builder.
- LINE-backed locations with null accuracy now render exactly as bilingual
  disclosure: `位置精度：LINE 未提供` and `Location accuracy: Not provided by LINE`.
  No zero value or GPS label is substituted.
- Preserved the Task 1/2 report and viewer behavior: LINE locations retain their
  `line` source and nullable accuracy rather than being represented as GPS.

## TDD evidence

The first focused run after adding tests failed as intended:

- the three Quick Reply builders were absent
- the unknown-LINE-accuracy card disclosure was absent

The implementation was then added minimally and the focused tests passed.

## Verification

- `npm test -- tests/features/line-messages.test.ts tests/features/alert-process.test.ts tests/features/report.test.ts` — 3 files, 35 tests passed.
- `npm test` — passed (exit 0).
- `npm run build` — passed: compiled, TypeScript-checked, and generated all pages.

## Notes

- `src/integrations/line/client.ts` did not require a change: it already sends
  the shared `LineMessage` type unchanged.
- The build emitted Next.js's existing multi-lockfile workspace-root warning;
  it did not affect compilation or type checking.
