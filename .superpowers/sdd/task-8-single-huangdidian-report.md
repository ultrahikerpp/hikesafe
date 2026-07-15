# Task 8 single-route review: 皇帝殿東西峰

## Decision

Rejected. No catalog record was added.

The exact canonical target is `皇帝殿東西峰`, but the official government material does not provide one coherent, fully quantified route boundary that satisfies the catalog contract:

- The Shiding District Office page describes the east/west peak route in prose, including the east/west junction, west peak, the ridge, a rest pavilion, a fork, and the return to the junction. It gives the west peak elevation as 579 m and the ridge length as 500 m, but not the total distance of the complete route.
- The same page says the complete route takes “at least three hours”. That is a lower bound, not an exact duration suitable for `durationMinutes`; recording 180 minutes would be an inference.
- The official Shiding tourism brochure identifies the east peak as 593 m and the west peak as 579 m, but does not supply the complete route distance, exact duration, or an official difficulty level.
- Neither source supplies the required official difficulty value for this route. Start coordinates, cumulative gain, and evacuation points are also unpublished by these sources, but their absence is not the decisive blocker; the required `distanceKm`, `durationMinutes`, and `difficulty` cannot all be assigned explicitly without inference.

## Official sources reviewed

- 新北市石碇區公所，潭邊里介紹：<https://www.shiding.ntpc.gov.tw/home.jsp?id=f06672ba2aadbd3c>
- 新北市石碇區公所，石碇觀光摺頁：<https://www.shiding.ntpc.gov.tw/userfiles/3200800/files/%E7%9F%B3%E7%A2%87%E8%A7%80%E5%85%89%E6%91%BA%E9%A0%81-%E5%8F%8D%E9%9D%A2.pdf>

## Verification

- No `catalog.json` record was added or changed.
- Sources were registered only for the two official URLs reviewed above.
- Node 24 catalog verification passed schema/source/duplicate-slug checks; only the pre-existing overall suburban and small-hundred coverage errors remain.
- `git diff --check` passed.
