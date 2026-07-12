# Task 4 Recovery Report

Status: DONE_WITH_CONCERNS

## Delivered

- LINE ID-token verification posts the token to LINE, rejects invalid responses, an unexpected audience, and expired claims, and returns a minimal `LineIdentity`.
- Sessions are HS256 JWTs containing only the internal user ID, LINE user ID, and expiry; the auth route accepts a strict `{ idToken }` body and sets an httpOnly, secure, `sameSite=lax` cookie.
- Binding codes are six uppercase alphanumeric characters, expire after 10 minutes, and are consumed atomically only by the LINE user who owns the code.
- The webhook verifies `x-line-signature` over the raw request body before JSON parsing, accepts `user`, `group`, and `room` sources, stores the webhook source ID, and replies with `已綁定 BeSafe 留守通知`.

## Verification (Node 24.18.0)

| Command | Result |
| --- | --- |
| `npm test -- tests/features/line-auth.test.ts tests/integration/line-binding.test.ts` | PASS — 2 files, 15 tests |
| `npm test` | PASS — 11 files, 58 tests |
| `npm run build` | PASS — Next.js production build |
| `npx tsc --noEmit` | FAIL — 8 pre-existing test typing errors in route-catalog/import/schema tests, outside Task 4; the production build's TypeScript phase passes. |

`git diff --check` is clean. Self-review found no Task 4 defects in the inherited implementation.

## TDD provenance concern

Task 4's source and tests were already present as untracked files when recovery began. The first observed focused test run passed, so it is not possible to prove that the inherited tests were written and observed failing before the inherited implementation. No Task 4 behavior was modified during recovery; therefore there was no new production-code change for which a RED cycle could be run. This is the reason for `DONE_WITH_CONCERNS` rather than an unqualified completion status.
