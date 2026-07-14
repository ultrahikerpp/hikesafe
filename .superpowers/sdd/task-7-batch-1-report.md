# Task 7 Batch 1 — 都蘭山 catalog record

**Status: BLOCKED**

**Reviewed:** 2026-07-14

## Blocker

`RouteInput` supports one `sourceOrganization` / `sourceUrl` pair. No single audited source contains or links all evidence required for the requested record:

- Sports Administration `PKNO=92` establishes Small Hundred Peak #093 and supplies the route description.
- Forestry `RT?tr_id=140` publishes the trail facts, including the observation-platform parking lot round trip, difficulty 2, permit status, and ordered route.
- The Forestry WGS84 communication-point PDF publishes the 都蘭山步道 0K coordinate (`121.17931`, `22.87264`) but no route facts or designation.

The Forestry route page links a separate communication-point dataset, not the audited PDF or the Sports Administration profile. Selecting the Forestry page as the sole record citation would leave the exact #093 designation and audited WGS84 coordinate untraceable from that citation. Registering all three URLs without a field-level source relationship would synthesize the combined citation forbidden by the batch instructions.

## Boundary review

The Forestry detailed route is a round trip from 都蘭山步道觀景平台停車場 to 都蘭山三角點 and back to the same parking lot. Its segment chain totals 7.6 km and 330 minutes. The separately displayed `步道全長 3.79 公里` and `線型單向` describe the one-way trail extent, so combining 3.79 km with the round-trip duration/checkpoints would mix route boundaries.

No catalog or source-registry data was changed. Pre-existing uncommitted `data/routes/sources.json` content was preserved.

## Verification

- Node: `v24.18.0`; npm: `11.16.0`.
- `npm run routes:verify` could not execute because the sandbox denied the `tsx` IPC socket with `EPERM`; an unsandboxed run was not approved.
- Equivalent entrypoint: `node --import tsx scripts/verify-route-catalog.ts`.
- Result: expected incomplete-catalog failure (`0` Hundred Peaks, `0` suburban routes, `0` Small Hundred Peaks); `Missing sources: 0`, `Duplicate slugs: 0`, and no catalog/source schema error.

## Required unblock

Add schema-supported field-level/multiple-source citations, or provide one audited official authority page that contains or directly links the complete #093 designation, route facts, and WGS84 start evidence.
