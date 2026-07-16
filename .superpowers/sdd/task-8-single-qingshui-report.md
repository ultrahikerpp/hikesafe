# Task 8 single-route alternate-source reassessment

## Scope

Assessed only the exact canonical name `清水岩步道群` using additional official
municipal, park, and tourism authorities. No catalog record or Small Hundred
Peak designation was added.

## Decision

Rejected. The additional official sources do not define one coherent route
boundary with exact duration, numeric difficulty, ordered checkpoints, and all
required catalog fields.

## Official-source findings

- [農業部林業及自然保育署](https://www.forest.gov.tw/0000311) describes the
  canonical name as a group containing three trails. It publishes 3.374 km,
  difficulty 1, and route planning of one day, but does not publish one
  ordered route boundary or exact duration for the group.
- [交通部觀光署參山國家風景區管理處](https://www.trimt-nsa.gov.tw/zh-tw/trail/50/)
  publishes a different group-level record: 1.57 km, 63 minutes, and low
  difficulty. Its named scope is the Central Ridge, Erzhangping, and Eighteen
  Bends trail group, so those values cannot be combined with the Forestry
  record's three-trail group boundary.
- [彰化縣政府旅遊資訊網](https://tourism.chcg.gov.tw/AttractionsContent.aspx?chk=acb9a047-c47a-4e93-bc4f-9f9d253608f6&id=128&l=CN)
  describes an O-shaped combination of Eighteen Bends, Central Ridge, and park
  connecting trails, publishing 3.9 km and two hours. This is another route
  description and does not provide the required numeric difficulty or ordered
  checkpoint set for the exact catalog record.

The official sources therefore conflict on route scope and values. Selecting
one boundary, reconciling the differences, or filling missing checkpoints or
fields would require inference, so no route was added.

## Verification

- Node 24 catalog verifier: source registry, schema, and duplicate-slug checks
  pass; only the expected overall suburban and Small Hundred Peak coverage
  failures remain.
- `git diff --check`: passed.
- `data/routes/catalog.json`: unchanged.
