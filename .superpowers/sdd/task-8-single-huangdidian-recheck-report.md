# Task 8 single-route recheck: 皇帝殿東西峰

Review date: 2026-07-16
Canonical name: `皇帝殿東西峰`

## Decision

Rejected. No catalog record was added or changed.

## Newly checked official URLs

- https://newtaipei.travel/zh-tw/attractions/detail/109946
- https://www.shiding.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=f6f6ab05d7d18de8c24571307198c702&id=dc091b96445f789a
- https://www.shiding.ntpc.gov.tw/home.jsp?id=f06672ba2aadbd3c

## Direct official values

### 1) 新北市政府觀光旅遊局：皇帝殿登山步道

Source: https://newtaipei.travel/zh-tw/attractions/detail/109946

Direct values published on the page:

- `routeName`: `皇帝殿登山步道`
- `region`: `新北市石碇區`
- `distanceKm`: `6.4` (`路線全長約 6.4 公里`)
- `durationMinutes`: `240` (`路線預估花費時間：4小時`)
- `difficulty`: not directly convertible to catalog integer; page publishes only category text:
  - `挑戰型`
  - `荒野探險型`
- ridge / scope text:
  - `最聞名的是其東峰與西峰之間的岩稜步道`
  - `一般所說的皇帝殿山，指的是自東峰起到西峰止的整條狹瘦的岩稜`
- peak elevations:
  - `東峰標高593公尺`
  - `西峰560公尺`
  - `天王峰（中峰）562公尺`
- `permitNotes`: not published
- `checkpoints`: not published as an ordered official list

### 2) 新北市石碇區公所：石碇區導覽地圖／皇帝殿

Source: https://www.shiding.ntpc.gov.tw/home.jsp?act=be4f48068b2b0031&dataserno=f6f6ab05d7d18de8c24571307198c702&id=dc091b96445f789a

Direct values published on the page:

- peak elevations:
  - `東峰標高５９３公尺`
  - `西峰５６０公尺`
  - `天王峰（中峰）５６２公尺`
- access / route-boundary text:
  - `皇帝殿的大眾化攀登途徑主要有兩條：一由石碇九寮埔橋上登，另一則由大溪漧永定國小上登`
  - `由登山口起步不久（５０公尺）即到最後農家（小粗坑１０號）`
  - `往右則先上東峰稜脊叉路；往左則先經天王廟再上西峰稜脊叉路`
  - `其後取右走精彩的皇帝殿岩稜，經過涼亭到另一邊的稜脊叉路下行回到最後農家`
  - `若剛開始的叉路是取右行則反方向繞一圈，同樣回到最後農家`
  - `再由大羅上仙府旁的小徑上登１０分鐘即抵皇帝殿東峰，然後可以由此開始走精彩的皇帝殿岩稜`
- partial segment / access times:
  - `循小粗坑產業道路走１５分鐘至停車場再走１公里即到皇帝殿風景區停車場`
  - `取左行者上行約25分鐘有叉路`
  - `由劉伯溫廟旁的小徑上行１５分鐘`
  - `循此上行２５分鍾抵大羅上仙府`
  - `再由大羅上仙府旁的小徑上登１０分鐘即抵皇帝殿東峰`
- `distanceKm`: no exact full-route value published
- `durationMinutes`: no exact full-route value published
- `difficulty`: no official numeric or direct categorical value published
- `permitNotes`: not published

### 3) 新北市石碇區公所：潭邊里介紹

Source: https://www.shiding.ntpc.gov.tw/home.jsp?id=f06672ba2aadbd3c

Direct values published on the page:

- area context:
  - `本里有遠近馳名的皇帝殿`
- `distanceKm`: not published
- `durationMinutes`: not published
- `difficulty`: not published
- `checkpoints`: not published
- `permitNotes`: not published

## Rejection reasons

This alternate-source recheck still does not support a safe catalog addition for the exact canonical single route.

1. No allowed official page directly supports the full required set of `distanceKm`, `durationMinutes`, `difficulty`, `region`, `checkpoints`, and `permitNotes`.
   - New Taipei Tourism page directly supports `region`, exact `distanceKm`, and exact `durationMinutes`.
   - The same page does not publish ordered `checkpoints` or any `permitNotes`.
   - Shiding District Office page adds route prose, but not one complete field set.

2. `difficulty` is still not directly usable as the catalog field.
   - New Taipei Tourism page publishes only textual categories: `挑戰型` and `荒野探險型`.
   - Under the task rules, that is not the catalog's exact numeric `difficulty` field.
   - Shiding District Office pages do not publish a numeric or normalized official difficulty value either.

3. `checkpoints` cannot be assigned to the same exact route boundary that carries the official `6.4 公里 / 4 小時` pair.
   - New Taipei Tourism page describes the scenic core as the ridge `自東峰起到西峰止`, but does not publish an ordered start-to-finish checkpoint list.
   - Shiding District Office page separately publishes at least two popular ascent approaches: `石碇九寮埔橋上登` and `大溪漧永定國小上登`.
   - Within the `石碇九寮埔橋` approach, the page also allows two loop directions from the same fork: `往右則先上東峰稜脊叉路；往左則先經天王廟再上西峰稜脊叉路`.
   - Because the official sources do not state that the Tourism Bureau's `6.4 公里 / 4 小時` values correspond exactly to one of those published loop/access definitions, assigning one canonical checkpoint list would require inference.

4. `permitNotes` is still unsupported by the allowed official source set.
   - None of the checked official pages publish a permit field, permit requirement, or direct no-permit statement for this exact route.
   - Under the task rules, `permitNotes` cannot be invented from silence.

5. The official source set describes multiple legitimate route boundaries around the same east-west ridge.
   - Tourism Bureau page frames `皇帝殿` as the east-west ridge itself.
   - Shiding District Office page frames the popular public route as at least two ascent approaches plus selectable loop direction around the ridge.
   - Those are compatible as destination descriptions, but they do not collapse into one exact catalog route boundary with directly attributable field support.

## Result

- No change to `data/routes/catalog.json`
- No change to `data/routes/sources.json`
- Added this recheck report only
