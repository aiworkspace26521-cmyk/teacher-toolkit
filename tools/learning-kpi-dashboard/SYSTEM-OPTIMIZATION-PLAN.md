# 學習 KPI 系統優化計畫

> 版本：1.0 | 建立日期：2026-06-20
> 遊戲路徑：`tools/learning-kpi-dashboard/`
> 遊戲網址：https://opencodefirebase.web.app/kpi

---

## 目錄

1. [系統概覽與架構圖](#1-系統概覽與架構圖)
2. [系統相依性地圖](#2-系統相依性地圖)
3. [已知踩坑/Bug 重點查核清單](#3-已知踩坑bug-重點查核清單)
4. [優化計畫：13 步驟](#4-優化計畫13-步驟)
5. [各步驟驗證方法與驗收標準](#5-各步驟驗證方法與驗收標準)
6. [跨階段銜接機制](#6-跨階段銜接機制)
7. [工作階段通訊協定](#7-工作階段通訊協定)

---

## 1. 系統概覽與架構圖

### 1.1 檔案結構

| 檔案 | 大小 | 角色 |
|------|------|------|
| `frontend/kpi-dashboard.html` | 419KB / 6648行 | **單體遊戲引擎** — HTML+CSS+JavaScript 全部在此 |
| `frontend/pokemon-gen2-9.js` | 68KB | Gen2~9 寶可夢資料庫（501 隻） |
| `backend/kpi-core.js` | 19KB / 461行 | 伺服端事件溯源狀態重算 |
| `backend/index.js` | 5KB / 135行 | Firebase Cloud Functions API |
| `test/simulation-test.js` | 92KB | 模擬測試（平衡校準用） |
| `test/e2e/` | — | Playwright E2E 測試 |

### 1.2 17 大系統劃分（依依賴關係排序）

```
Layer 0 ─ 資料層 (Data Layer)
   ├── A. Pokémon 資料庫 (POKEMON_TIERS, pokemon-gen2-9.js)
   ├── B. 招式資料庫 (MOVE_DATABASE, TYPE_MOVE_POOL, SIGNATURE_MOVES)
   ├── C. 能力/道具資料 (ABILITY_EFFECTS, HELD_ITEMS, EVO_ITEMS)
   └── D. 道館/聯盟/任務/成就資料 (GYM_LEADERS, LEAGUE_REGIONS, QUESTS, ACHIEVEMENTS)

Layer 1 ─ 基礎設施
   ├── ① 事件溯源系統 (Event Sourcing) ← 所有資料的根源
   ├── ② 屬性相剋系統 (Type System) ← 戰鬥/捕捉的核心計算
   └── ③ 進化系統 (Evolution System) ← 影響圖鑑/捕捉/戰鬥

Layer 2 ─ 核心遊戲循環
   ├── ④ 戰鬥系統 (Battle System) ← 最複雜、最核心
   ├── ⑤ 捕捉系統 (Capture System) ← 依賴①③
   ├── ⑥ 訓練/經驗系統 (Training/EXP) ← 依賴①
   └── ⑦ 採購/道具系統 (Shop/Item) ← 依賴①

Layer 3 ─ 延伸內容
   ├── ⑧ 裝備系統 (Equipment/PC Box) ← 依賴④⑦
   ├── ⑨ 道館/聯盟系統 (Gym/League) ← 依賴④
   ├── ⑩ TM學習器系統 (TM System) ← 依賴④⑦
   ├── ⑪ 任務系統 (Quest System) ← 依賴①
   ├── ⑫ 成就系統 (Achievement System) ← 依賴①
   └── ⑬ 圖鑑系統 (Pokédex/Collection) ← 依賴①③

Layer 4 ─ 多人/社交
   ├── ⑭ PvP系統 (PvP/ELO) ← 依賴④
   ├── ⑮ 交換系統 (Trade System) ← 依賴①
   └── ⑯ 衛冕戰系統 (Defense) ← 依賴④⑨

Cross-Cutting ─ 貫穿全域
   └── ⑰ 管理系統 (Admin) + UI/動畫系統
```

### 1.3 關鍵函數對照表（按系統）

```
① 事件溯源: recalculateStudentState (kpi-core.js:102 / dashboard:768)
             fetchStudentData (980), saveEventToFirestore (1083)
             scheduleStudentFieldUpdate (1108)

② 屬性相剋: TYPE_RATIO (1667), TYPE_CHART (2014)
             getEffectiveness (2324), getPokemonType (2224)
             getPokemonStats (2202), getMatchupInfo (2231)

③ 進化系統: getEvolvedName (1619), checkEvoReady (1632)
             doEvolve (5628), getEvolutionName (2046)
             EVO_CONDITIONS (1548), EVO_STAGE_MAP (1687)
             EVO_ITEMS (1567), confirmEeveeEvolution (762)

④ 戰鬥系統: performAttack (2872), executeTurn (2439)
             calculateMovePower (2334), applyStatusEffect (2406)
             openArena (3543), openArenaWithWaves (3508)
             startBattle (3808), endBattle (3376)
             generateEnemy (2247), createEnemyPokemon (2276)
             generateGymWaves (3763), generateLeagueGauntlet (3848)
             processBurnAndLeech (3125), processWeatherDecay (3163)
             useItemInArena (3179), applyEntryAbility (3459)

⑤ 捕捉系統: generateCapturePokemon (5465)

⑥ 訓練/EXP: getExpNeeded (726), calcLevelAndExp (736)

⑦ 採購: openShop (5291), buyItem (5370)

⑧ 裝備: openPCBoxModal (4012), renderPCBoxContent (4034)
         equipHeldItem (5432), unequipHeldItem (5448)
         unequipFromPCBox (5459)

⑨ 道館/聯盟: openGymEditor (5781), getGymLeaderInfo (1870)
             getRegionInfo (1876), openLeagueRanking (6625)
             checkDefenseChallenge (6585)

⑩ TM: openTMLearn (5176), renderTMMoveList (5201), learnTM (5243)

⑪ 任務: renderQuests (6319), claimQuestReward (6375)

⑫ 成就: checkAchievement (5881), checkAndUnlockAchievements (5933)
         openTrophyCabinet (5968)

⑬ 圖鑑: openPokedex (6106), renderPokedex (6132), buildPokedexSpecies (6054)
         openCollection (5125), openWeaknessDex (5993)

⑭ PvP: openPvPModal (4263), executePvPRound (4376), calculateELO (4424)

⑮ 交換: openTradeModal (6415), sendTradeRequest (6478), acceptTrade (6503)

⑯ 衛冕: checkDefenseChallenge (6585), startDefenseChallenge (6599)
```

---

## 2. 系統相依性地圖

### 2.1 依賴方向圖

```
資料層 ─┬─→ ①事件溯源 ─┬─→ ⑥訓練/EXP
        │              ├─→ ⑦採購/道具
        │              ├─→ ⑪任務
        │              ├─→ ⑫成就
        │              ├─→ ⑬圖鑑
        │              └─→ ⑮交換
        │
        ├─→ ②屬性相剋 ─┬─→ ④戰鬥
        │              └─→ ⑤捕捉
        │
        ├─→ ③進化 ─┬─→ ④戰鬥 (招式更新)
        │           ├─→ ⑤捕捉 (型態判定)
        │           ├─→ ⑬圖鑑 (進化鏈)
        │           └─→ ⑮交換 (進化判定)
        │
        └─→ ④戰鬥 ←── ⑧裝備 (攜帶道具加成)
                      ←── ⑩TM (招式學習)
                      ←── ⑨道館/聯盟 (戰鬥內容)
                      ←── ⑭PvP (玩家對戰)
                      ←── ⑯衛冕 (戰鬥內容)
```

### 2.2 向後相容檢查點

每一階段修復完成後，必須驗證以下「銜接點」無回歸：

| 修復階段 | 須確認不影響 | 檢查點 |
|---------|-------------|--------|
| ①事件溯源 | ⑥⑦⑪⑫⑬⑮ | submitData / 狀態顯示正確 |
| ②屬性相剋 | ④⑤⑨⑭ | 戰鬥傷害/捕捉率正常 |
| ③進化 | ④⑤⑬⑮ | 進化後招式正確/圖鑑更新 |
| ④戰鬥 | ⑧⑨⑩⑭⑯ | 戰鬥流程不中斷 |
| ⑤捕捉 | ⑥⑨⑬ | 可正常遭遇/捕獲 |
| ⑥訓練/EXP | ①②④ | EXP 計算正確/升級正常 |
| ⑦採購 | ⑧⑩⑪⑫ | 道具取得正確 |
| ⑧裝備 | ④⑨⑭ | 攜帶道具效果正確 |
| ⑨道館/聯盟 | ④⑯ | 道館戰/聯盟戰正常 |
| ⑩TM | ④⑧ | 招式學習/忘記正常 |
| ⑪任務 | ① | 任務進度領取正常 |
| ⑫成就 | ①⑥⑨⑭ | 成就解鎖條件正確 |
| ⑬圖鑑 | ①③ | 顯示/過濾正確 |
| ⑭PvP | ④⑧ | PvP 戰鬥正常 |
| ⑮交換 | ①③⑧ | 交換流程正常 |
| ⑯衛冕 | ④⑨ | 衛冕挑戰正常 |
| ⑰Admin/UI | 全部 | 管理功能/UI顯示正常 |

---

## 3. 已知踩坑/Bug 重點查核清單

> 以下為前期開發中發現的所有問題，分類歸屬各系統，**每個 Step 開始前先確認所屬問題**。

| # | 問題 | 系統歸屬 | 優先級 | 查核 Step |
|---|------|---------|:------:|:---------:|
| B01 | ⚠️ **pokemon-gen2-9.js 編碼亂碼** — 特定物種名稱 UTF-8 損毀（如萌虻、甜甜螢），使用者回報瀏覽器顯示異常 | 資料層 | 🔴 | Step 1 |
| B02 | **奇諾栗鼠自指進化** — `{name:"奇諾栗鼠", evolutions:["奇諾栗鼠"]}` 造成無限 loop | 資料層/③進化 | 🔴 | Step 1 |
| B03 | **getEvolvedName index 偏移** — `evolutions[Math.floor(level/15)]` index 0 回傳進化型態而非基礎型態 | ③進化 | 🔴 | Step 4 |
| B04 | **checkEvoReady 遺失標準等級進化分支** — 親密度/道具條件外的進化沒被覆蓋 | ③進化 | 🔴 | Step 4 |
| B05 | **EXP 雪球效應** — `floor(score×10×max(1,lockedLevel/5))` 讓 M6 就到 Lv.99 | ⑥訓練/EXP | 🟡 | Step 6 |
| B06 | **雙屬性系統** — `getPokemonType()` 僅取第一組括號內屬性，未支援 `草/毒` | ②屬性 | 🟡 | Step 3 |
| B07 | **道具消耗未寫入 Firestore** — `useItemInArena` 只改 `globalData` 未存回資料庫 | ④戰鬥/①事件 | 🔴 | Step 5 |
| B08 | **每日提交防重複** — 已修但 Firestore composite index 需確認正常運作 | ①事件 | 🟢 | Step 2 |
| B09 | **戰鬥 turnLock 順序** — 速度判定後輪流攻擊，已修但需驗證邊界 | ④戰鬥 | 🟢 | Step 5 |
| B10 | **gymPreview 缺失** — 戰鬥前預覽可能在某些邊界條件不顯示 | ⑨道館 | 🟡 | Step 9 |
| B11 | **renderBadgeCase null check** — 徽章盒 null guard | ⑨道館 | 🟢 | Step 9 |
| B12 | **圖鑑 emoji 白名單 bug 🥋** — 已泛型化為 `[^\\w\\u4e00-\\u9fff]` | ⑬圖鑑 | 🟢 | Step 12 |
| B13 | **健身柔道場顯示異常** — 道館名稱/狀態顯示問題 | ⑨道館 | 🟡 | Step 9 |
| B14 | **每日/週任務區** — HTML 結構已補但未完整測試領取流程 | ⑪任務 | 🟡 | Step 10 |
| B15 | **Neil Firestore 測試資料** — 已清除，但需確認無殘留資料干擾 | ①事件 | 🟢 | Step 2 |
| B16 | **PC Box 攜帶道具 UI** — 已修但需確認卸除/顯示在所有邊界正常 | ⑧裝備 | 🟢 | Step 7 |
| B17 | **天氣效果** — 晴天火系 1.5x、雨天水系 1.5x、沙暴岩石特防 1.5x 需確認 | ④戰鬥 | 🟡 | Step 5 |
| B18 | **championCloak 無效果** — 「冠軍披風」EXP x1.5 使命未實作。已修復（Step 7） | ⑦採購/④戰鬥 | 🟢 | Step 7 |
| B19 | **amuletCoin 誤綁 EXP** — 原綁 EXP x1.5 但說明為金幣加成。已修復改為 coins x1.5（Step 7） | ⑦採購/④戰鬥 | 🟢 | Step 7 |
| B20 | **chilanBerry 遺漏 PC Box 庫存** — 抗性果未顯示於消耗品 badges。已修復（Step 7） | ⑧裝備 | 🟢 | Step 7 |

---

## 4. 優化計畫：13 步驟

### 策略說明

- **由底往上**：先修資料層、再修基礎設施、再修核心、最後修延伸
- **由核心往外**：戰鬥系統最核心，儘早穩定
- **每個 Step 獨立驗證**：完成後立即確認無回歸，再進下一步
- **全域回歸測試**：每 3 個 Step 做一次完整 Playwright E2E

---

### ▸ Step 1：資料層完整性檢視 (Data Integrity)

**目標**：確保所有靜態資料無編碼損毀、無缺欄位、無邏輯矛盾

**範圍**：
- `frontend/pokemon-gen2-9.js` — 501 隻寶可夢資料完整掃描
- `kpi-dashboard.html` 中所有資料陣列/物件檢查

**細項**：
- [ ] 1.1 掃描 pokemon-gen2-9.js 所有 CJK 字元確認無編碼損毀
- [ ] 1.2 檢查所有 `evolutions` 陣列有無自指 Loop（如 B02 奇諾栗鼠）
- [ ] 1.3 檢查 `POKEMON_TIERS` 物種名與 `pokemon-gen2-9.js` 資料一致性
- [ ] 1.4 檢查 `MOVE_DATABASE` 所有招式欄位完整（name/type/power/category/effect）
- [ ] 1.5 檢查 `TYPE_MOVE_POOL` 各屬性至少 5 階招式不缺漏
- [ ] 1.6 檢查 `HELD_ITEMS` / `EVO_ITEMS` 資料完整性
- [ ] 1.7 檢查 `QUESTS` / `ACHIEVEMENTS` 定義無矛盾
- [ ] 1.8 檢查 `GYM_LEADERS` / `LEAGUE_REGIONS` 跨區資料一致性

**已知 Bug 驗證**：B01、B02

**驗證方法**：靜態分析 + 瀏覽器實測顯示中文正常

---

### ▸ Step 2：事件溯源系統檢視 (Event Sourcing)

**目標**：確保 Firestore 讀寫、狀態重算、快取機制穩定

**範圍**：`kpi-core.js` + `kpi-dashboard.html` 中事件相關程式

**細項**：
- [ ] 2.1 確認 `recalculateStudentState` 前後端實現一致（kpi-core.js vs dashboard）
- [ ] 2.2 驗證每日提交防重複機制（Firestore 雙重檢查 + 時間上界）
- [ ] 2.3 驗證 sessionStorage 快取層：第二次載入瞬發 UI，背景非同步刷新
- [ ] 2.4 驗證背景刷新容錯：刷新失敗繼續使用快取
- [ ] 2.5 驗證 `scheduleStudentFieldUpdate` 500ms debounce 正常
- [ ] 2.6 確認所有事件類型正確解析（每日提交/捕捉/戰鬥/商城/道具/進化/滿級轉化）
- [ ] 2.7 確認 Firestore rules 權限正確（trade_offers 自屬、events 唯追加）
- [ ] 2.8 驗證 Firestore composite index 正常運作（studentId ASC, timestamp ASC）

**已知 Bug 驗證**：B08、B15

**驗證方法**：Firebase 模擬器 + Playwright 測試 submitData

---

### ▸ Step 3：屬性相剋系統檢視 (Type System)

**目標**：確保 18 屬性相剋表完整、雙屬性計算正確、種族值平衡

**範圍**：TYPE_RATIO / TYPE_CHART / getPokemonType / getEffectiveness / getPokemonStats

**細項**：
- [ ] 3.1 檢查 `TYPE_CHART` 18×18 完整（324 個交點無遺漏）
- [ ] 3.2 修復 `getPokemonType()` 支援雙屬性（如 `草/毒`、`飛行/一般`）
- [ ] 3.3 驗證 `getEffectiveness()` 雙屬性相乘計算正確
- [ ] 3.4 檢查 `POKEMON_SPECIES_TYPES` 物種屬性對照正確
- [ ] 3.5 檢查 `TYPE_RATIO` 18 屬性 × 6 維權重分配平衡
- [ ] 3.6 驗證 `getPokemonStats()` 種族值計算公式正確
- [ ] 3.7 測試屬性相剋在戰鬥中的實際效果（雙屬性防禦方）

**已知 Bug 驗證**：B06

**驗證方法**：console 測試已知雙屬性寶可夢（妙蛙花=草/毒、大比鳥=一般/飛行）

---

### ▸ Step 4：進化系統檢視 (Evolution System)

**目標**：確保所有進化路徑正確、index 不偏移、邊界條件完備

**範圍**：getEvolvedName / checkEvoReady / doEvolve / EVO_STAGE_MAP / EVO_CONDITIONS

**細項**：
- [ ] 4.1 驗證 `getEvolvedName()` index 偏移修復：stage===0 回傳基礎型態
- [ ] 4.2 驗證所有等級進化門檻正確（LV15/30/45/60/75 五階）
- [ ] 4.3 驗證 `checkEvoReady()` 四種進化分支：等級/親密度/道具/交換
- [ ] 4.4 驗證伊布進化邏輯（等級 16+ → 隨機伊布進化型）
- [ ] 4.5 驗證 `doEvolve()` 執行後招式池正確更新
- [ ] 4.6 驗證 `getEvolutionName()` 進化鏈名稱取得正確
- [ ] 4.7 驗證 `EVO_STAGE_MAP` 與 evolutions 陣列長度對齊
- [ ] 4.8 驗證進化動畫 `showEvoCutscene()` 正常顯示

**已知 Bug 驗證**：B03、B04

**驗證方法**：Playwright 測試多種進化路徑（伊布→水伊布、小火龍→火恐龍→噴火龍）

---

### ▸ Step 5：戰鬥系統檢視 (Battle System)

**目標**：確保核心戰鬥循環完整、所有狀態/天氣/道具/能力正確

**這是整個系統最關鍵也最複雜的一步**

**範圍**：performAttack / executeTurn / calculateMovePower / openArena / startBattle / endBattle

**細項**：
- [ ] 5.1 驗證戰鬥初始化：`openArena` / `openArenaWithWaves` 所有參數正確
- [ ] 5.2 驗證 `performAttack` → `executeTurn` 完整流程
- [ ] 5.3 驗證 `turnLock` 速度判定順序（先制之爪優先、速度值較快先攻）
- [ ] 5.4 驗證 `calculateMovePower` 傷害計算公式：
  - [ ] 5.4.1 物理/特殊分類正確
  - [ ] 5.4.2 屬性相剋倍率 (`getEffectiveness`)
  - [ ] 5.4.3 天氣加權（晴雨沙雹）
  - [ ] 5.4.4 攜帶道具加成（達人帶/生命寶珠/AV背心/焦點鏡/貝殼之鈴）
  - [ ] 5.4.5 特性加成（猛火/適應力）
  - [ ] 5.4.6 會心率計算（含焦點鏡 2 倍）
  - [ ] 5.4.7 抗性果護盾（降低被剋傷害 50%）
- [ ] 5.5 驗證 `applyStatusEffect` 所有狀態：
  - [ ] 燒傷/麻痹/凍結/中毒/睡眠/混亂
  - [ ] 能力升降（debuff_atk/def/spatk/spdef/speed）
  - [ ] 天氣變更/自我犧牲/回復/守住
- [ ] 5.6 驗證 `processBurnAndLeech` 燃燒/寄生種子持續傷害
- [ ] 5.7 驗證 `processWeatherDecay` 天氣持續回合倒數
- [ ] 5.8 驗證戰鬥中切換寶可夢（換怪邏輯）
- [ ] 5.9 驗證 `useItemInArena` 戰鬥道具使用（藥水/活力塊/奇異果/抗性果）
- [ ] 5.10 驗證 `applyEntryAbility` 進場特性觸發（威嚇、天氣等）
- [ ] 5.11 驗證瀕死處理：氣勢披帶/結實/頑強/一般瀕死
- [ ] 5.12 驗證 `endBattle` 勝利/失敗/逃跑流程
- [ ] 5.13 驗證多波戰鬥（道館 3~5 波、聯盟車輪戰）

**已知 Bug 驗證**：B07、B09、B17

**驗證方法**：Playwright 多種戰鬥情境自動化測試（路人/道館/聯盟/Boss）

---

### ▸ Step 6：捕捉系統與訓練/EXP 系統檢視

**目標**：確保捕捉機制正常、EXP 曲線平衡

**細項**：
- [ ] 6.1 驗證 `generateCapturePokemon` 生成邏輯（階級/屬性/等級）
- [ ] 6.2 驗證捕捉遭遇率（一般/稀有/傳說各階級占比）
- [ ] 6.3 驗證傳說捕捉條件（score≥95 + badges≥8，機率 8%→6%）
- [ ] 6.4 驗證 `getExpNeeded` EXP 曲線（各區間經驗需求）
- [ ] 6.5 驗證 `calcLevelAndExp` 升級計算正確
- [ ] 6.6 **EXP 雪球效應修正**：重新平衡訓練 EXP 公式
- [ ] 6.7 驗證 EXP Share 機制（50% + 攜帶道具 100%）
- [ ] 6.8 驗證滿級轉化（Lv.99 溢出 EXP → 金幣）

**已知 Bug 驗證**：B05

**驗證方法**：simulation-test.js 模擬執行 + 手動測試捕捉/訓練

---

### ▸ Step 7：商城 + 道具 + 裝備系統檢視

**目標**：確保購買、裝備、卸除、顯示完整正確

**細項**：
- [ ] 7.1 驗證 `openShop` 商品分類正確（🔋消耗/📀學習器/⬆️進化/🛡️裝備）
- [ ] 7.2 驗證 `buyItem` 金幣扣除 + 道具入帳 + Firestore 寫入
- [ ] 7.3 驗證 `openQuickEquip` 購買後快速裝備流程
- [ ] 7.4 驗證 `equipHeldItem` / `unequipHeldItem` 正常
- [ ] 7.5 驗證 `unequipFromPCBox` PC Box 卸下按鈕
- [ ] 7.6 驗證 PC Box 攜帶道具顯示 + 📊 能力值面板
- [ ] 7.7 驗證裝備道具在戰鬥中的實際效果（所有 10 種攜帶道具）
- [ ] 7.8 驗證消耗品道具使用（藥水/活力塊/糖果/全滿藥/元氣藥塊）

**已知 Bug 驗證**：B16、B18、B19、B20

**驗證方法**：Playwright 模擬購買/裝備/戰鬥驗證攜帶道具效果

---

### ▸ Step 8：TM 學習器系統檢視

**目標**：確保 TM 學習/忘記功能正常

**細項**：
- [ ] 8.1 驗證 `openTMLearn` 開啟招式學習器面板
- [ ] 8.2 驗證 `renderTMMoveList` 招式列表顯示正確（含屬性過濾）
- [ ] 8.3 驗證 `learnTM` 學習 TM 招式（取代前 N 個戰鬥槽位）
- [ ] 8.4 驗證 `openForgetMove` 忘記招式 NPC 功能
- [ ] 8.5 驗證 TM 學習器消耗品數量計算正確
- [ ] 8.6 驗證跨屬性招式學習在戰鬥中實際可用

**驗證方法**：Playwright 購買 TM → 學習 → 忘記 → 戰鬥中使用

---

### ▸ Step 9：道館/聯盟檢視

**目標**：確保道館戰、聯盟賽、衛冕戰完整正確

**細項**：
- [ ] 9.1 驗證 `getGymLeaderInfo` / `getRegionInfo` 資料正確
- [ ] 9.2 驗證 `generateGymWaves` 3~5 波敵人生成
- [ ] 9.3 驗證 `generateLeagueGauntlet` 5 天王+冠軍車輪戰
- [ ] 9.4 驗證 `openGymEditor` 管理員編輯道館
- [ ] 9.5 驗證道館徽章顯示（`renderBadgeCase` null guard）
- [ ] 9.6 驗證 `gymPreview` 戰鬥前預覽顯示
- [ ] 9.7 驗證健身柔道場顯示正常（B13）
- [ ] 9.8 驗證 `checkDefenseChallenge` 衛冕戰（3 天冷卻）
- [ ] 9.9 驗證 `startDefenseChallenge` 衛冕戰鬥
- [ ] 9.10 驗證 `openLeagueRanking` 聯盟排名顯示

**已知 Bug 驗證**：B10、B11、B13

**驗證方法**：Playwright 通過道館戰→聯盟賽→衛冕戰完整流程

---

### ▸ Step 10：任務 + 成就系統檢視

**目標**：確保任務進度計算、領取獎勵、成就解鎖完整

**細項**：
- [ ] 10.1 驗證 `renderQuests` 每日/每週任務顯示
- [ ] 10.2 驗證 `computeQuestProgress` 任務進度計算正確
- [ ] 10.3 驗證 `claimQuestReward` 任務獎勵領取（EXP+金幣）
- [ ] 10.4 驗證每日/每週重置信號正確
- [ ] 10.5 驗證 `checkAchievement` 15 項成就條件檢查
- [ ] 10.6 驗證 `checkAndUnlockAchievements` 自動解鎖 + Firestore 持久化
- [ ] 10.7 驗證 `showAchievementUnlock` 解鎖通知（音效+Toast+Modal）
- [ ] 10.8 驗證 `openTrophyCabinet` 獎盃櫃顯示

**已知 Bug 驗證**：B14

**驗證方法**：Playwright 模擬事件 → 觸發任務進度 → 領取獎勵 → 確認成就

---

### ▸ Step 11：PvP + 交換系統檢視

**目標**：確保 PvP 戰鬥、ELO 排名、交換流程完整

**細項**：
- [ ] 11.1 驗證 `openPvPModal` PvP 選人介面
- [ ] 11.2 驗證 `executePvPRound` PvP 回合戰鬥
- [ ] 11.3 驗證 `calculateELO` ELO 分數計算
- [ ] 11.4 驗證 `updatePvPRanking` 排名更新
- [ ] 11.5 驗證 `openRankingModal` 排名顯示
- [ ] 11.6 驗證 `sendTradeRequest` 發起交換請求
- [ ] 11.7 驗證 `acceptTrade` / `rejectTrade` / `cancelTrade`
- [ ] 11.8 驗證交換通知氣球數字
- [ ] 11.9 驗證初始夥伴伊布禁止交換規則

**驗證方法**：兩個瀏覽器分頁模擬交換 + PvP 測試

---

### ▸ Step 12：圖鑑系統檢視

**目標**：確保全國圖鑑、收藏、弱勢圖鑑顯示正確

**細項**：
- [ ] 12.1 驗證 `buildPokedexSpecies` 所有可捕捉物種建置
- [ ] 12.2 驗證 `getEvolutionChain` 進化鏈查詢正確
- [ ] 12.3 驗證 `renderPokedex` 已捕獲/未捕獲顯示
- [ ] 12.4 驗證圖鑑屬性/階級過濾功能
- [ ] 12.5 驗證 `openCollection` 收藏顯示
- [ ] 12.6 驗證 `openWeaknessDex` 弱勢圖鑑（低 BST 非傳說列表）
- [ ] 12.7 驗證 emoji 泛型化修復後顯示正常（B12）
- [ ] 12.8 驗證 Admin 圖鑑顯示進化鏈完整

**已知 Bug 驗證**：B12

**驗證方法**：Playwright 確認各圖鑑模式顯示正常

---

### ▸ Step 13：Admin 管理系統 + UI/動畫檢視

**目標**：確保管理功能正常、UI 動畫流暢、RWD 正確

**細項**：
- [ ] 13.1 驗證 Admin 面板所有功能（發放金幣/徽章/EXP/重置/匯出）
- [ ] 13.2 驗證 `adminBatchInject` 批量注入
- [ ] 13.3 驗證 `openClassAnalysis` 班級分析
- [ ] 13.4 驗證骨架載入（`showSkeletonDashboard` / `hideSkeleton`）
- [ ] 13.5 驗證 Toast 通知系統所有情境
- [ ] 13.6 驗證 Modal 系統（開啟/關閉/動畫）
- [ ] 13.7 驗證音效系統（`sfx` 物件）無錯誤
- [ ] 13.8 驗證粒子特效系統正常顯示
- [ ] 13.9 驗證 RWD 響應式（手機/平板/桌面各斷點）
- [ ] 13.10 驗證簡單模式（🌱 checkbox）

**驗證方法**：Playwright E2E + 手動多裝置測試

---

## 5. 各步驟驗證方法與驗收標準

### 5.1 每個 Step 的標準流程

```
┌─────────────────────────────────────────┐
│ ① 閱讀該 Step 所有細項 + 相關已知 Bug  │
├─────────────────────────────────────────┤
│ ② 程式碼審查：檢查相關函數邏輯         │
├─────────────────────────────────────────┤
│ ③ 修復/優化：修改程式碼                │
├─────────────────────────────────────────┤
│ ④ 單元驗證：針對該 Step 測試           │
│    - 瀏覽器 console 驗證               │
│    - Playwright 測試（若已有）         │
│    - 手動操作驗證流程                  │
├─────────────────────────────────────────┤
│ ⑤ 回歸檢查：確認「相依性地圖」中      │
│    該 Step 影響的系統無異常            │
├─────────────────────────────────────────┤
│ ⑥ 更新工作筆記：記錄修復內容          │
├─────────────────────────────────────────┤
│ ⑦ 確認可進下一 Step                    │
└─────────────────────────────────────────┘
```

### 5.2 驗收標準

| 等級 | 定義 | 處理方式 |
|:----:|------|---------|
| ✅ 通過 | 該 Step 所有細項檢查通過，相關 Bug 已修復且確認無回歸 | 可進入下一 Step |
| ⚠️ 部分通過 | 非關鍵項目有 1-2 項待確認但不影響下游 | 記錄待辦，可繼續但需後補 |
| ❌ 未通過 | 關鍵 Bug 未修復或導致回歸問題 | 暫停，優先修復再繼續 |

### 5.3 Playwright 測試要求

每個 Step 完成後必須跑：
```bash
cd tools/learning-kpi-dashboard
npx playwright test
```

確認所有現有測試通過（目前有 4 個煙霧測試 + 3 個專項測試）。

---

## 6. 跨階段銜接機制

### 6.1 為什麼需要銜接機制

由於遊戲是**單體 419KB HTML 檔案**，任何修改都可能影響其他系統：
- 改進化系統可能影響戰鬥（招式更新失敗）
- 改屬性系統可能影響捕捉（類型判定錯誤）
- 改事件溯源可能影響所有依賴它的系統

### 6.2 銜接檢查點

每完成一個 Step，執行以下「全域回歸檢查」：

```
Step N 完成後 ──→ 全域回歸檢查 ──→ 可進 Step N+1
                      │
                      ├─ ① 跑所有 Playwright 測試
                      ├─ ② 登入遊戲檢查基本功能：
                      │    - 學生選單正常
                      │    - 儀表板顯示正確
                      │    - 提交功能正常
                      │    - 戰鬥可開啟
                      ├─ ③ 檢查相依性地圖中標記的系統
                      └─ ④ Console 無錯誤
```

### 6.3 回退協議

如果某 Step 修復導致其他系統異常：

1. **立即記錄**異常現象到工作筆記
2. **評估影響範圍**（對照相依性地圖）
3. **選擇方案**：
   - 輕微：記錄已知問題，繼續下一 Step
   - 中等：優先修復回歸再繼續
   - 嚴重：`git revert` 回退，重新評估修復方案

### 6.4 每 3 個 Step 的深度回歸

| 檢查點 | 範圍 | 額外測試 |
|:------:|------|---------|
| Step 3 → 4 | ①+②+③ | 模擬測試 (simulation-test.js) |
| Step 6 → 7 | ④+⑤+⑥ | 完整戰鬥 Playwright |
| Step 9 → 10 | ⑦+⑧+⑨ | 道館→聯盟完整流程 |
| Step 13 | 全部 | 完整 E2E + 模擬測試 |

---

## 7. 工作階段通訊協定

### 7.1 每次新工作階段的開始指令

在新對話中輸入：

```
讀工作筆記，告訴我上次做到哪
```

或直接說：

```
開工
```

### 7.2 完成一個 Step 後的溝通格式

完成一個 Step 後，請使用以下格式告知：

```
✅ 完成 Step N：[Step 名稱]

已完成項目：
- [細項 X.X] 摘要
- [細項 X.X] 摘要

已知 Bug 修復：
- BXX：[Bug 名稱] → 已修復/驗證通過

發現新問題：
- [描述]（歸屬系統：XX，優先級：🟡/🔴）

Playwright 測試：✅ 通過（X passed）
全域回歸檢查：✅ 通過
相依影響檢查：[系統名稱] → 無異常

➡️ 下一步：準備進入 Step N+1
```

### 7.3 範例

```
✅ 完成 Step 4：進化系統檢視

已完成項目：
- 4.1 getEvolvedName() index 偏移驗證通過（LV0-14 正確回傳基礎型態）
- 4.2 所有等級進化門檻確認正確
- 4.7 EVO_STAGE_MAP 與 evolutions 陣列長度對齊

已知 Bug 修復：
- B03：getEvolvedName index 偏移 → 已修復，Playwright 驗證通過
- B04：checkEvoReady 遺失分支 → 已補上

發現新問題：
- XXX 物種進化鏈未定義 evolutions 陣列（歸屬：資料層，🟡）

Playwright 測試：✅ 4 passed
全域回歸檢查：✅ 通過
相依影響檢查：戰鬥系統 → 進化後招式池更新正常

➡️ 下一步：準備進入 Step 5：戰鬥系統檢視
```

### 7.4 當遇到阻礙或需要決策時的格式

```
⚠️ 在 Step N 遇到問題：

問題描述：[簡短描述]
位置：[檔案:行號]
影響範圍：[相依性地圖中的哪些系統]
建議方案：
  A：[方案 A 描述]
  B：[方案 B 描述]

需要您決定採用哪個方案。
```

### 7.5 工作筆記更新責任

每次完成 Step 後，更新 Obsidian 工作筆記：
- 記錄完成的 Step 與細項
- 記錄修復的 Bug
- 記錄發現的新問題
- 記錄當前進度（下一步是 Step N+1）

### 7.6 完整工作階段範例

```
您（新對話開始）：
> 開工

Claude：
> 📂 專案：teacher-toolkit
> 📘 上次做到哪：完成 Step 4 進化系統檢視，所有進化路徑驗證通過
> ➡️ 下一步：Step 5 — 戰鬥系統檢視

您（開始新 Step 前）：
> 開始 Step 5：戰鬥系統檢視

Claude：
> 好的，開始檢視戰鬥系統...
> [開始掃描 performAttack / executeTurn 等函數]
```

---

> **本計畫文件位於：`tools/learning-kpi-dashboard/SYSTEM-OPTIMIZATION-PLAN.md`**
>
> 每次工作階段開始時，Claude 會自動讀取此文件 + Obsidian 工作筆記，
> 快速定位當前進度，然後從對應的 Step 繼續。
