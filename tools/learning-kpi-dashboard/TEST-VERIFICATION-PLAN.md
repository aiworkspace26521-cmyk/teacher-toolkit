# 學習 KPI 系統 — 完整測試驗證計畫指南

> 版本：1.0 | 建立日期：2026-06-23
> 基底版本：GAME-MANUAL V5.9
> 遊戲網址：https://opencodefirebase.web.app/kpi
> 來源文件：SYSTEM-OPTIMIZATION-PLAN.md / OPTIMIZATION-ROADMAP.md / Phase4-更新計劃.md

---

## 目錄

- [測試前置作業](#測試前置作業)
- [Block I：13 步驟系統基礎優化](#block-i13-步驟系統基礎優化)
  - [Step 1：資料層完整性](#step-1資料層完整性)
  - [Step 2：事件溯源系統](#step-2事件溯源系統)
  - [Step 3：屬性相剋系統](#step-3屬性相剋系統)
  - [Step 4：進化系統](#step-4進化系統)
  - [Step 5：戰鬥系統](#step-5戰鬥系統)
  - [Step 6：捕捉系統與訓練/EXP](#step-6捕捉系統與訓練exp)
  - [Step 7：商城 + 道具 + 裝備系統](#step-7商城--道具--裝備系統)
  - [Step 8：TM 學習器系統](#step-8tm-學習器系統)
  - [Step 9：道館/聯盟系統](#step-9道館聯盟系統)
  - [Step 10：任務 + 成就系統](#step-10任務--成就系統)
  - [Step 11：PvP + 交換系統](#step-11pvp--交換系統)
  - [Step 12：圖鑑系統](#step-12圖鑑系統)
  - [Step 13：Admin 管理系統 + UI/動畫](#step-13admin-管理系統--ui動畫)
- [Block II：優化路線圖 (U1~U7)](#block-ii優化路線圖-u1u7)
  - [U1：親密度 UI 顯示](#u1親密度-ui-顯示)
  - [U2：戰鬥 EXP 前後端漂移修復](#u2戰鬥-exp-前後端漂移修復)
  - [U3：戰鬥 EXP 倍率調整](#u3戰鬥-exp-倍率調整)
  - [U4：學習裝置數值統一文檔](#u4學習裝置數值統一文檔)
  - [U5：PvP 重製 — 即時邀請 + 3vs3](#u5pvp-重製--即時邀請--3vs3)
  - [U6：PvP 管理員模式 (已跳過)](#u6pvp-管理員模式-已跳過)
  - [U7：親密度獲取效率提升](#u7親密度獲取效率提升)
- [Block III：Phase 4 更新 (A~D)](#block-iiiphase-4-更新-ad)
  - [Step A：好感度不一致修復](#step-a好感度不一致修復)
  - [Step B：傳說捕獲機率優化](#step-b傳說捕獲機率優化)
  - [Step C：好感度聯動 — 捕捉率](#step-c好感度聯動--捕捉率)
  - [Step D：好感度聯動 — 會心率](#step-d好感度聯動--會心率)
- [Block IV：已知 Bug 驗證總表](#block-iv已知-bug-驗證總表)
- [Block V：全域回歸測試](#block-v全域回歸測試)
- [Block VI：部署與回滾計畫](#block-vi部署與回滾計畫)

---

## 測試前置作業

```bash
# 安裝相依
cd tools/learning-kpi-dashboard
npm install

# 啟動 Firebase 模擬器（如需）
firebase emulators:start

# 可用測試指令
npm run test:sim           # 模擬測試 (simulation-test.js)
npm run test:e2e           # Playwright E2E 測試
node test/game-manual-consistency.js  # 文件一致性檢查
```

---

## Block I：13 步驟系統基礎優化

> 範圍：Step 1 ~ Step 13（SYSTEM-OPTIMIZATION-PLAN.md）
> 策略：由底往上，由核心往外，每 Step 獨立驗證，每 3 Step 深度回歸

---

### Step 1：資料層完整性

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 1.1 | 掃描 `pokemon-gen2-9.js` 所有 CJK 字元 | 靜態分析 + 瀏覽器實測 | 無編碼損毀，中文顯示正常 |
| 1.2 | 檢查 `evolutions` 陣列有無自指 Loop | 靜態掃描 | 無自指進化（如奇諾栗鼠 B02） |
| 1.3 | POKEMON_TIERS 物種名一致性 | 比對兩檔案 | 名稱完全匹配 |
| 1.4 | MOVE_DATABASE 招式欄位完整度 | 靜態檢查 | name/type/power/category/effect 全有 |
| 1.5 | TYPE_MOVE_POOL 各屬性招式不缺漏 | 靜態檢查 | 各屬性 ≥ 5 階 |
| 1.6 | HELD_ITEMS / EVO_ITEMS 資料完整性 | 靜態檢查 | 無缺欄位 |
| 1.7 | QUESTS / ACHIEVEMENTS 定義無矛盾 | 靜態檢查 | 條件與獎勵一致 |
| 1.8 | GYM_LEADERS / LEAGUE_REGIONS 跨區一致性 | 靜態檢查 | 資料無矛盾 |

**已知 Bug 驗證**：B01（編碼亂碼）、B02（奇諾栗鼠自指進化）

---

### Step 2：事件溯源系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 2.1 | recalculateStudentState 前後端一致 | 比對 kpi-core.js vs dashboard | 重算邏輯相同 |
| 2.2 | 每日提交防重複機制 | Firestore 雙重檢查 + 時間上界 | 同一天不可重複提交 |
| 2.3 | sessionStorage 快取層 | 第二次載入 | 瞬發 UI，背景非同步刷新 |
| 2.4 | 背景刷新容錯 | 模擬刷新失敗 | 繼續使用快取不報錯 |
| 2.5 | scheduleStudentFieldUpdate debounce | 多次觸發 | 500ms debounce 正常 |
| 2.6 | 所有事件類型解析 | 逐一測試 | 6 種事件類型正確解析 |
| 2.7 | Firestore rules 權限 | rules 審查 | trade_offers 自屬、events 唯追加 |
| 2.8 | Composite index 正常運作 | 查詢測試 | studentId ASC, timestamp ASC 可用 |

**已知 Bug 驗證**：B08（每日提交防重複）、B15（測試資料殘留）

---

### Step 3：屬性相剋系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 3.1 | TYPE_CHART 18×18 完整 | 迴圈檢查 | 324 交點無遺漏 |
| 3.2 | getPokemonType() 雙屬性支援 | console 測試 | `草/毒` 回傳 `["草","毒"]` |
| 3.3 | getEffectiveness() 雙屬性相乘 | console 測試 | 妙蛙花 vs 水系 = 0.5×0.5=0.25 |
| 3.4 | POKEMON_SPECIES_TYPES 屬性對照正確 | 比對官版 | 所有物種屬性正確 |
| 3.5 | TYPE_RATIO 18×6 權重分配平衡 | 統計檢查 | 無極端值 |
| 3.6 | getPokemonStats() 公式正確 | 代入測試 | 種族值計算正確 |
| 3.7 | 雙屬性在戰鬥中實際效果 | 實戰測試 | 屬性相剋倍率正確 |

**已知 Bug 驗證**：B06（雙屬性系統）

**測試案例**：
```javascript
// console 測試
console.log(getPokemonType("妙蛙花")); // ["草","毒"]
console.log(getEffectiveness("水", "妙蛙花")); // 0.25 (水→草=0.5, 水→毒=0.5)
console.log(getEffectiveness("超能力", "妙蛙花")); // 1 (超→草=1, 超→毒=1)
console.log(getEffectiveness("飛行", "妙蛙花")); // 2 (飛行→草=2, 飛行→毒=1)
```

---

### Step 4：進化系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 4.1 | getEvolvedName() index 偏移修復 | Playwright | stage=0 回傳基礎型態 |
| 4.2 | 等級進化門檻 | Playwright | LV15/30/45/60/75 正確 |
| 4.3 | checkEvoReady() 四種分支 | Playwright | 等級/親密度/道具/交換皆可進化 |
| 4.4 | 伊布進化邏輯 | Playwright | 等級 16+ → 隨機伊布進化型 |
| 4.5 | doEvolve() 後招式池更新 | Playwright | 進化後招式正確 |
| 4.6 | getEvolutionName() 進化鏈正確 | Playwright | 名稱正確 |
| 4.7 | EVO_STAGE_MAP 陣列長度對齊 | 靜態檢查 | 與 evolutions 長度一致 |
| 4.8 | 進化動畫 showEvoCutscene() | 人工驗證 | 動畫正常顯示 |

**已知 Bug 驗證**：B03（index 偏移）、B04（遺失進化分支）

---

### Step 5：戰鬥系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 5.1 | 戰鬥初始化（openArena / openArenaWithWaves） | Playwright | 所有參數正確 |
| 5.2 | performAttack → executeTurn 完整流程 | Playwright | 攻擊流程完整 |
| 5.3 | turnLock 速度判定 | Playwright | 先制之爪優先、速度值快先攻 |
| 5.4.1 | 物理/特殊分類 | Playwright | 依 category 正確 |
| 5.4.2 | 屬性相剋倍率 | Playwright | getEffectiveness 結果正確 |
| 5.4.3 | 天氣加權 | Playwright | 晴天火系 1.5x、雨天水系 1.5x、沙暴岩石特防 1.5x |
| 5.4.4 | 攜帶道具加成 | Playwright | 達人帶/生命寶珠/AV背心/焦點鏡/貝殼之鈴正確 |
| 5.4.5 | 特性加成 | Playwright | 猛火/適應力正確 |
| 5.4.6 | 會心率計算（含焦點鏡 2 倍） | Playwright | 基礎 6.25%，焦點鏡 12.5% |
| 5.4.7 | 抗性果護盾 | Playwright | 降低被剋傷害 50% |
| 5.5 | applyStatusEffect 所有狀態 | Playwright | 燒傷/麻痹/凍結/中毒/睡眠/混亂正常 |
| 5.6 | processBurnAndLeech | Playwright | 燃燒/寄生種子持續傷害正確 |
| 5.7 | processWeatherDecay | Playwright | 天氣持續回合倒數正確 |
| 5.8 | 戰中切換寶可夢 | Playwright | 換怪邏輯正常 |
| 5.9 | useItemInArena 戰鬥道具 | Playwright | 藥水/活力塊/奇異果/抗性果正常 |
| 5.10 | applyEntryAbility 進場特性 | Playwright | 威嚇/天氣等觸發正確 |
| 5.11 | 瀕死處理 | Playwright | 氣勢披帶/結實/頑強/一般瀕死正確 |
| 5.12 | endBattle 勝利/失敗/逃跑 | Playwright | 三種結果流程完整 |
| 5.13 | 多波戰鬥 | Playwright | 道館 3~5 波、聯盟車輪戰正常 |

**已知 Bug 驗證**：B07（道具消耗未寫入）、B09（turnLock 順序）、B17（天氣效果）

---

### Step 6：捕捉系統與訓練/EXP

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 6.1 | generateCapturePokemon 生成邏輯 | 模擬測試 | 階級/屬性/等級正確 |
| 6.2 | 捕捉遭遇率（一般/稀有/傳說） | 模擬測試 | 各階級占比符合設定 |
| 6.3 | 傳說捕捉條件（score≥95 + badges≥8） | 模擬測試 | 機率 6~8% |
| 6.4 | getExpNeeded EXP 曲線 | 模擬測試 | 各區間經驗需求合理 |
| 6.5 | calcLevelAndExp 升級計算 | 模擬測試 | 升級正確 |
| 6.6 | EXP 雪球效應修正 | 模擬測試 | M6 後 Lv.99，非 M6 就到 |
| 6.7 | EXP Share 機制 | 模擬測試 | 留守 50%，攜帶道具 100% |
| 6.8 | 滿級轉化（Lv.99 溢出 → 金幣） | 模擬測試 | 轉化正確 |

**已知 Bug 驗證**：B05（EXP 雪球效應）

---

### Step 7：商城 + 道具 + 裝備系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 7.1 | openShop 商品分類 | Playwright | 🔋消耗/📀學習器/⬆️進化/🛡️裝備分類正確 |
| 7.2 | buyItem 金幣扣除+道具入帳+Firestore | Playwright | 三項皆正確 |
| 7.3 | openQuickEquip 購買後快速裝備 | Playwright | 流程正常 |
| 7.4 | equipHeldItem / unequipHeldItem | Playwright | 裝備/卸除正常 |
| 7.5 | unequipFromPCBox | Playwright | PC Box 卸下按鈕正常 |
| 7.6 | PC Box 裝備顯示+能力值面板 | Playwright | 顯示正確 |
| 7.7 | 裝備在戰鬥中效果（10 種道具） | Playwright | 全部正確 |
| 7.8 | 消耗品道具使用 | Playwright | 藥水/活力塊/糖果/全滿藥/元氣藥塊正常 |

**已知 Bug 驗證**：B16（PC Box UI）、B18（冠軍披風效果）、B19（amuletCoin 誤綁）、B20（chilanBerry 庫存）

---

### Step 8：TM 學習器系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 8.1 | openTMLearn 開啟面板 | Playwright | 面板正常開啟 |
| 8.2 | renderTMMoveList 招式列表 | Playwright | 含屬性過濾正確 |
| 8.3 | learnTM 學習 TM 招式 | Playwright | 取代前 N 個戰鬥槽位 |
| 8.4 | openForgetMove 忘記招式 | Playwright | NPC 功能正常 |
| 8.5 | TM 消耗品數量計算 | Playwright | 數量正確 |
| 8.6 | 跨屬性招式戰鬥中可用 | Playwright | 實際可用 |

---

### Step 9：道館/聯盟系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 9.1 | getGymLeaderInfo / getRegionInfo | Playwright | 資料正確 |
| 9.2 | generateGymWaves 3~5 波 | Playwright | 敵人生成正確 |
| 9.3 | generateLeagueGauntlet 5+1 車輪戰 | Playwright | 流程正常 |
| 9.4 | openGymEditor 管理員編輯 | Playwright | 功能正常 |
| 9.5 | 徽章顯示（renderBadgeCase null guard） | Playwright | null 不報錯 |
| 9.6 | gymPreview 戰鬥前預覽 | Playwright | 預覽顯示正常 |
| 9.7 | 健身柔道場顯示 | Playwright | B13 修復正確 |
| 9.8 | checkDefenseChallenge 衛冕戰冷卻 | Playwright | 3 天冷卻正常 |
| 9.9 | startDefenseChallenge 衛冕戰鬥 | Playwright | 戰鬥正常 |
| 9.10 | openLeagueRanking 聯盟排名 | Playwright | 排名顯示正常 |

**已知 Bug 驗證**：B10（gymPreview 缺失）、B11（徽章盒 null）、B13（柔道場顯示）

---

### Step 10：任務 + 成就系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 10.1 | renderQuests 任務顯示 | Playwright | 每日/每週正確 |
| 10.2 | computeQuestProgress 進度計算 | Playwright | 進度正確 |
| 10.3 | claimQuestReward 領取獎勵 | Playwright | EXP+金幣正確 |
| 10.4 | 每日/每週重置信號 | Playwright | 重置正確 |
| 10.5 | checkAchievement 15 項成就 | Playwright | 條件檢查正確 |
| 10.6 | checkAndUnlockAchievements 自動解鎖+持久化 | Playwright | Firestore 寫入正確 |
| 10.7 | showAchievementUnlock 解鎖通知 | 人工驗證 | 音效+Toast+Modal |
| 10.8 | openTrophyCabinet 獎盃櫃 | Playwright | 顯示正確 |

**已知 Bug 驗證**：B14（任務領取流程）

---

### Step 11：PvP + 交換系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 11.1 | openPvPModal 選人介面 | Playwright | 介面正常 |
| 11.2 | executePvPRound 回合戰鬥 | Playwright | 戰鬥正常 |
| 11.3 | calculateELO 分數計算 | Playwright | ELO 正確 |
| 11.4 | updatePvPRanking 排名更新 | Playwright | 更新正確 |
| 11.5 | openRankingModal 排名顯示 | Playwright | 顯示正常 |
| 11.6 | sendTradeRequest 發起交換 | Playwright | 請求正確 |
| 11.7 | acceptTrade / rejectTrade / cancelTrade | Playwright | 三種操作正常 |
| 11.8 | 交換通知氣球數字 | Playwright | 氣球顯示正確 |
| 11.9 | 初始夥伴伊布禁止交換 | Playwright | 禁止規則正常 |

---

### Step 12：圖鑑系統

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 12.1 | buildPokedexSpecies 物種建置 | Playwright | 所有可捕捉物種正確 |
| 12.2 | getEvolutionChain 進化鏈查詢 | Playwright | 查詢正確 |
| 12.3 | renderPokedex 已/未捕獲顯示 | Playwright | 標示正確 |
| 12.4 | 屬性/階級過濾功能 | Playwright | 過濾正確 |
| 12.5 | openCollection 收藏顯示 | Playwright | 顯示正確 |
| 12.6 | openWeaknessDex 弱勢圖鑑 | Playwright | 低 BST 列表正確 |
| 12.7 | emoji 泛型化修復（B12） | Playwright | 🥋 顯示正常 |
| 12.8 | Admin 圖鑑進化鏈完整 | Playwright | 進化鏈完整顯示 |

**已知 Bug 驗證**：B12（emoji 白名單）

---

### Step 13：Admin 管理系統 + UI/動畫

| 項目 | 驗證內容 | 方法 | 預期結果 |
|:----:|---------|------|---------|
| 13.1 | Admin 面板（金幣/徽章/EXP/重置/匯出） | Playwright | 全部正常 |
| 13.2 | adminBatchInject 批量注入 | Playwright | 注入正確 |
| 13.3 | openClassAnalysis 班級分析 | Playwright | 分析正確 |
| 13.4 | 骨架載入（showSkeletonDashboard） | Playwright | 載入動畫正常 |
| 13.5 | Toast 通知系統 | Playwright | 所有情境正常 |
| 13.6 | Modal 系統（開/關/動畫） | Playwright | 動畫正常 |
| 13.7 | 音效系統（sfx 物件） | console | 無錯誤 |
| 13.8 | 粒子特效系統 | 人工驗證 | 顯示正常 |
| 13.9 | RWD 響應式（手機/平板/桌面） | 手動多裝置 | 三斷點正常 |
| 13.10 | 簡單模式（🌱 checkbox） | Playwright | 切換正常 |

---

## Block II：優化路線圖 (U1~U7)

> 範圍：OPTIMIZATION-ROADMAP.md Phase 1~3
> 策略：依 Phase 順序測試，每個 U 獨立驗證

---

### U1：親密度 UI 顯示

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| U1-1 | PC Box 卡牌顯示「❤️ X/120」數值條 | Playwright | 格式正確 |
| U1-2 | happiness=0 →「❤️ 0/120」 | Playwright | 邊界正常 |
| U1-3 | happiness=150 →「❤️ 120/120 ✅」 | Playwright | 上限正常 |
| U1-4 | RWD 不跑版 | 手動 | 各種寬度正常 |
| U1-5 | 舊資料無 happiness → 預設 0 | Playwright | 不報錯 |

---

### U2：戰鬥 EXP 前後端漂移修復

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| U2-1 | 非參戰隊員 EXP 正確計入 totalExpGain | 單元測試 | 留守 50% 正確 |
| U2-2 | simulation-test 曲線合理 | 模擬測試 | MAX/MIN 曲線合理 |
| U2-3 | Playwright 全量通過 | Playwright | 所有測試通過 |
| U2-4 | 重算與實際 totalExp 差異 < 1% | 漂移檢查 | 差異 < 1% |

---

### U3：戰鬥 EXP 倍率調整

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| U3-1 | 先發 ×1.2 維持不變 | 模擬測試 | 倍率正確 |
| U3-2 | 參與 ×0.5（原 ×0.3） | 模擬測試 | 倍率正確 |
| U3-3 | 留守 50% 正確 | 模擬測試 | 倍率正確 |
| U3-4 | 學習裝置 80%（原 100%） | 模擬測試 | 倍率正確 |
| U3-5 | MAX Lv.99 在 M6 或之後 | 模擬測試 | 不提早 |
| U3-6 | 單人戰 vs 6 人全上 | 邊界測試 | 兩者皆正常 |

---

### U4：學習裝置數值統一文檔

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| U4-1 | GAME-MANUAL §7.1 / §14.2 一致 | 文件檢查 | 數值一致 |
| U4-2 | 商城描述與實際行為一致 | 文件檢查 | 文字正確 |
| U4-3 | 已知問題 §26 清已修復項目 | 文件檢查 | 已刪除 |

---

### U5：PvP 重製 — 即時邀請 + 3vs3

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| U5-1 | 邀請流程（寫入 pvp_battles → onSnapshot 觸發） | Playwright | 流程完整 |
| U5-2 | 3vs3 隊伍選擇 UI（不可多不可少） | Playwright | 限選 3 隻 |
| U5-3 | 完整對戰至分出勝負 | Playwright | 流程完整 |
| U5-4 | 戰中切換寶可夢 | Playwright | 切換正常 |
| U5-5 | 雙方同時送招 → 速度判定正確 | Playwright | 衝突正確處理 |
| U5-6 | 斷線恢復（重整頁面保留狀態） | Playwright | 戰鬥可恢復 |
| U5-7 | 現有 Playwright 全部通過 | Playwright | 無回歸 |
| U5-8 | 真人實測 Neil vs Emma | 手動 | 雙方體驗正常 |
| U5-9 | Firestore rules pvp_battles 讀寫 | rules 審查 | 權限正確 |

---

### U6：PvP 管理員模式 (已跳過)

❌ 此項目已決定跳過，無需測試。

---

### U7：親密度獲取效率提升

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| U7-1 | 每日提交後全隊親密度 +2 | Playwright | 數值正確 |
| U7-2 | 捕捉後全隊親密度 +1（維持不變） | Playwright | 數值正確 |
| U7-3 | 同一天多次提交不重複加 | Playwright | 防重複正確 |

---

## Block III：Phase 4 更新 (A~D)

> 範圍：Phase4-更新計劃.md
> 策略：A→B 可並行，C/D 需 A 完成後進行

---

### Step A：好感度不一致修復

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| A-1 | 前端每日提交 happiness += 1（原 +2） | 靜態檢查 | L836 `+= 1` |
| A-2 | 前端捕捉 happiness += 1（原 +2） | 靜態檢查 | `+= 1` |
| A-3 | 前端戰鬥勝利 happiness += 2（不變） | 靜態檢查 | 維持 +2 |
| A-4 | 模擬 EVO_CONDITIONS 大嘴蝠 happiness=120 | 靜態檢查 | 模擬 L370 正確 |
| A-5 | 模擬 EVO_CONDITIONS 吉利蛋 happiness=120 | 靜態檢查 | 模擬 L371 正確 |
| A-6 | 前端 EVO_CONDITIONS（120）= 模擬（120）| 比對 | 三份一致 |
| A-7 | 前端提交/捕捉 += 1 = 後端 += 1 | 比對 | 前後端一致 |
| A-8 | 後端 kpi-core.js 無須修改 | 確認 | 已正確 |
| A-9 | npm run test:sim 通過 | 模擬測試 | 測試通過 |
| A-10 | npm run test:e2e 27/27 passed | Playwright | 全部通過 |

**邊界測試**：
- 舊資料無 happiness 欄位 → 預設 0，不報錯
- 多次提交同一天 → 不重複加（防重複機制）

---

### Step B：傳說捕獲機率優化

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| B-1 | 前端新增 streakBonus 參數 | 靜態檢查 | streak≥3/5/7 累進 |
| B-2 | 60-74 分區間新增 2% 基礎傳說 | 靜態檢查 | legChance = 0.02 + streakBonus |
| B-3 | 模擬 determineCaptureTier 鏡像前段邏輯 | 靜態檢查 | 兩者一致 |
| B-4 | streak=0（新人）bonus=0 不影響 | Playwright | 不變 |
| B-5 | streak=3 → +1% | 手動/模擬 | 微幅提升 |
| B-6 | streak=7 → +6% | 手動/模擬 | 明顯有感 |
| B-7 | streak≥10 → 強制傳說 | Playwright | 不疊加 bonus |
| B-8 | 傳說率 < 15% 紅旗 | 模擬測試 | 未超過 |
| B-9 | npm run test:sim 通過 | 模擬測試 | 測試通過 |
| B-10 | npm run test:e2e 27/27 passed | Playwright | 全部通過 |
| B-11 | GAME-MANUAL §12 傳說機率表更新 | 文件檢查 | 已更新 |
| B-12 | GAME-MANUAL §25 更新紀錄新增 Phase 4 Step B | 文件檢查 | 已新增 |

**邊界測試**：
- score=59（低於門檻）→ 不觸發傳說
- score=60 + streak=0 → 2% 傳說
- score=60 + streak=10 → 強制傳說
- streak≥5 稀有升級保留

---

### Step C：好感度聯動 — 捕捉率

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| C-1 | 新增 calcAvgHappiness 函數 | 靜態檢查 | 計算全隊平均好感 |
| C-2 | avgHappiness < 60 → ×1.0（無影響） | Playwright | 不變 |
| C-3 | avgHappiness 60~99 → ×1.2 | Playwright | 加成正確 |
| C-4 | avgHappiness ≥ 100 → ×1.5 | Playwright | 加成正確 |
| C-5 | 稀有機率也乘好感倍率 | 靜態檢查 | `0.35 * hapMultiplier` |
| C-6 | 最終機率 = (基礎 × 好感倍率) + streakBonus | Playwright | 疊加正確 |
| C-7 | 模擬 determineCaptureTier 新增參數 | 靜態檢查 | avgHappiness 參數 |
| C-8 | 新學生全隊好感=0 → ×1.0 | Playwright | 無影響 |
| C-9 | 全隊僅 1 隻 = 該隻好感 | Playwright | 鼓勵擴充 |
| C-10 | npm run test:sim 通過 | 模擬測試 | 測試通過 |
| C-11 | npm run test:e2e 27/27 passed | Playwright | 全部通過 |
| C-12 | GAME-MANUAL §7.4 好感度效果更新 | 文件檢查 | 已更新 |
| C-13 | GAME-MANUAL §12 傳說機率表更新 | 文件檢查 | 已更新 |

**邊界測試**：
- roster 為空或 undefined → 回傳 0 不報錯
- roster 中部分寶可夢無 happiness → 預設 0 不中斷
- 好感 59 → ×1.0；好感 60 → ×1.2（門檻精確）

---

### Step D：好感度聯動 — 會心率

| # | 驗證項目 | 方法 | 預期 |
|:-:|---------|------|------|
| D-1 | 好感 0 → 會心率 6.25%（不變） | Playwright | 基礎值正確 |
| D-2 | 好感 20 → 會心率 7.00%（+0.75%） | Playwright | 加成正確 |
| D-3 | 好感 60 → 會心率 8.50%（+2.25%） | Playwright | 加成正確 |
| D-4 | 好感 120 → 會心率 10.75%（+4.5%） | Playwright | 加成正確 |
| D-5 | 好感 120 + 焦點鏡 → 16.75%（+10.5%） | Playwright | 疊加正確 |
| D-6 | 敵方寶可夢 happiness=undefined → 0 | Playwright | 不影響敵方 |
| D-7 | 公式 `Math.floor(happiness/20) * 0.0075` | 靜態檢查 | 正確 |
| D-8 | attacker 需有 happiness 屬性 | 靜態檢查 | battleState 來源正確 |
| D-9 | 模擬不需修改 | 確認 | crit 不影響 EXP |
| D-10 | npm run test:e2e 27/27 passed | Playwright | 全部通過 |
| D-11 | GAME-MANUAL §9.6 會心率說明更新 | 文件檢查 | 已更新 |

**邊界測試**：
- 好感 = 19 → floor(19/20)=0 → 加成 0%（門檻精確）
- 好感 = 20 → floor(20/20)=1 → 加成 0.75%
- 好感 = 0 時攻擊 → baseCrit 不變
- 敵方 happiness undefined → `|| 0` 回退安全

---

## Block IV：已知 Bug 驗證總表

| ID | Bug 名稱 | 系統歸屬 | 優先級 | 驗證方法 | 狀態 |
|:--:|---------|---------|:------:|---------|:----:|
| B01 | pokemon-gen2-9.js 編碼亂碼 | 資料層 | 🔴 | 瀏覽器實測 | ✅ 確認 |
| B02 | 奇諾栗鼠自指進化 | 資料層/③進化 | 🔴 | 靜態掃描 | ✅ 確認 |
| B03 | getEvolvedName index 偏移 | ③進化 | 🔴 | Playwright | ✅ 確認 |
| B04 | checkEvoReady 遺失分支 | ③進化 | 🔴 | Playwright | ✅ 確認 |
| B05 | EXP 雪球效應 | ⑥訓練/EXP | 🟡 | 模擬測試 | ✅ 確認 |
| B06 | 雙屬性系統 | ②屬性 | 🟡 | Console 測試 | ✅ 確認 |
| B07 | 道具消耗未寫入 Firestore | ④戰鬥/①事件 | 🔴 | Playwright | ✅ 確認 |
| B08 | 每日提交防重複 | ①事件 | 🟢 | Playwright | ✅ 確認 |
| B09 | 戰鬥 turnLock 順序 | ④戰鬥 | 🟢 | Playwright | ✅ 確認 |
| B10 | gymPreview 缺失 | ⑨道館 | 🟡 | Playwright | ✅ 確認 |
| B11 | renderBadgeCase null check | ⑨道館 | 🟢 | Playwright | ✅ 確認 |
| B12 | 圖鑑 emoji 白名單 bug | ⑬圖鑑 | 🟢 | Playwright | ✅ 確認 |
| B13 | 健身柔道場顯示異常 | ⑨道館 | 🟡 | Playwright | ✅ 確認 |
| B14 | 任務領取流程 | ⑪任務 | 🟡 | Playwright | ✅ 確認 |
| B15 | Neil 測試資料殘留 | ①事件 | 🟢 | Firestore 檢查 | ✅ 確認 |
| B16 | PC Box 攜帶道具 UI | ⑧裝備 | 🟢 | Playwright | ✅ 確認 |
| B17 | 天氣效果 | ④戰鬥 | 🟡 | Playwright | ✅ 確認 |
| B18 | championCloak 無效果 | ⑦採購/④戰鬥 | 🟢 | Playwright | ✅ 確認 |
| B19 | amuletCoin 誤綁 EXP | ⑦採購/④戰鬥 | 🟢 | Playwright | ✅ 確認 |
| B20 | chilanBerry 遺漏 PC Box 庫存 | ⑧裝備 | 🟢 | Playwright | ✅ 確認 |

---

## Block V：全域回歸測試

### 5.1 每次變更後的標準流程

```
修改完成
  ↓
┌─ 模擬測試 (npm run test:sim) ──→ FAIL → 回滾數值
│
└─ Playwright E2E (npm run test:e2e) ──→ FAIL → 修復
     │
     └─ 文件一致性檢查 (game-manual-consistency.js) ──→ FAIL → 修復
          │
          └─ ✅ 驗收通過
```

### 5.2 全域回歸檢查清單

每次完成任一 Step/U 後，執行以下檢查：

| # | 檢查項目 | 方法 |
|:-:|---------|------|
| R1 | 所有 Playwright 測試通過 | `npm run test:e2e` |
| R2 | 模擬測試通過 | `npm run test:sim` |
| R3 | 文件一致性檢查通過 | `node test/game-manual-consistency.js` |
| R4 | 學生選單正常 | 手動 |
| R5 | 儀表板顯示正確 | 手動 |
| R6 | 提交功能正常 | 手動 |
| R7 | 戰鬥可開啟 | 手動 |
| R8 | Console 無錯誤 | 瀏覽器 DevTools |
| R9 | 相依性地圖標記系統無異常 | 對照影響矩陣 |

### 5.3 相依性影響檢查

修改 A 系統後，檢查相依性矩陣中受影響的系統：

| 修改系統 | 需檢查的相依系統 |
|---------|----------------|
| ①事件溯源 | ⑥⑦⑪⑫⑬⑮ |
| ②屬性相剋 | ④⑤⑨⑭ |
| ③進化 | ④⑤⑬⑮ |
| ④戰鬥 | ⑧⑨⑩⑭⑯ |
| ⑥訓練/EXP | ①②④ |
| ⑦採購 | ⑧⑩⑪⑫ |
| ⑧裝備 | ④⑨⑭ |
| ⑨道館/聯盟 | ④⑯ |
| ⑪任務 | ① |
| ⑬圖鑑 | ①③ |
| ⑭PvP | ④⑧ |
| ⑮交換 | ①③⑧ |
| ⑰Admin/UI | 全部 |

### 5.4 完整回歸測試批次指令

```bash
# 1. 模擬測試
npm run test:sim

# 2. Playwright E2E
npm run test:e2e

# 3. 文件一致性
node test/game-manual-consistency.js

# 4. 同步至 public
# (手動或 sync-public.ps1)
```

---

## Block VI：部署與回滾計畫

### 6.1 標準部署流程

```
修改檔案
  ↓
同步至 public/（sync-public.ps1）
  ↓
npm run test:sim ✅
  ↓
npm run test:e2e ✅
  ↓
game-manual-consistency.js ✅
  ↓
git commit + git push
  ↓
Firebase 自動部署（GitHub Actions）
```

### 6.2 回滾條件

符合任一即觸發回滾：

1. **模擬測試 FAIL** → 傳說率 > 15% 或 MAX Lv.99 提早超過 1 個月
2. **Playwright FAIL ≥ 3 項**（排除已知 flaky）
3. **好感度顯示 NaN / 負值 / 全白**
4. **捕捉時傳說機率明顯異常**
5. **戰鬥中 crit 計算錯誤導致 NaN 傷害**
6. **PvP 雙方不同步**
7. **Firestore 寫入失敗**

### 6.3 回滾步驟

```bash
# 全部回滾
git revert HEAD --no-edit
git push

# 部分回滾（單一功能）
git log --oneline --all | Select-String "Phase4"
git revert <commit-hash> --no-edit
git push
```

---

> **本文件用途**：作為所有更新內容的測試驗證總檢查清單
> **每次測試時**：依 Block 順序逐一打勾確認，記錄結果至工作筆記
> **文件位置**：`tools/learning-kpi-dashboard/TEST-VERIFICATION-PLAN.md`
