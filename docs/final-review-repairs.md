# Final review repairs

- Delivery processing has two durable boundaries: `prepareDelivery` stores the recipient-specific message snapshot while the delivery remains cancellable; `beginDeliverySend` locks the trip and records `sending` immediately before an external LINE push. A finish committed before that boundary cancels the delivery. A push that has crossed it is intentionally not cancelled and remains auditable through `first_attempt_at`, retry key, status, and `sent_at`.
- The 90-day rule applies to removal of precise completed-trip GPS. It does **not** extend dynamic viewer-grant authority to 90 days. Delivery grants retain their earlier expiry cap (including the short retry window); completed-trip authorization uses the earlier of that cap and the retention boundary.

## Browser QA, 2026-07-13

- Local home screen captured at 375×812 and 1280×720. Both show the four entry points and the controlled LIFF credential state. Screenshots: `/private/tmp/besafe-375.png`, `/private/tmp/besafe-1280.png`.
- No LINE credentials were available, so authenticated creation, binding, start, check-in, extension, finish, and report authorization could not be run in a browser. Those paths remain covered by API, unit, and PostgreSQL integration tests.
- The headless browser reported one development-only Turbopack HMR WebSocket handshake failure (`ERR_INVALID_HTTP_RESPONSE`). Page and asset HTTP requests returned 200; no application API request failed. This is recorded as a browser-harness/dev-server limitation, not suppressed as a clean console result.
