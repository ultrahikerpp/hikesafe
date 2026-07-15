# Single-route suburban check: 劍潭山

Review date: 2026-07-16
Source authority: 臺北市政府工務局大地工程處

## Decision

Rejected. No catalog record was added.

## Official source

https://www-ws.gov.taipei/Download.ashx?icon=.pdf&n=NDEyMzkxNTU3MS5wZGY%3D&u=LzAwMS9VcGxvYWQvMzQ0L3JlbGZpbGUvMTcxMDMvMzEzMjkzOS80MTIzOTE1NTcxLnBkZg%3D%3D

The official Taipei City hiking-trail table identifies `劍潭山親山步道` in
中山區 and publishes a 2,740 m trail length, 劍潭風景區牌樓 as the starting
point, a highest elevation of 198 m, and an estimated full-route walking time
of 2 hours 20 minutes.

## Rejection reason

This single official source does not publish a numeric difficulty level, a
complete ordered route boundary/checkpoint sequence, WGS84 start coordinates,
cumulative ascent, evacuation points, permit notes, or an official
designation. `difficulty` is required by `RouteInput`, and the catalog must
not infer the missing difficulty or construct the missing route boundary from
other sources. Therefore all 16 fields cannot be explicitly assigned once to
one coherent official source without unsupported values, so no record was
added.

No catalog or source-registry changes were made.

## Verification

- Node 24 catalog verifier: source, schema, and duplicate-slug checks pass;
  only the expected overall 100/100/100 coverage errors remain.
- `git diff --check`: passed.
