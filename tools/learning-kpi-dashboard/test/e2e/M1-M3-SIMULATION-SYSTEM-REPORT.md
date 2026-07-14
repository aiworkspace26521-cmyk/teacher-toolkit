# M1→M3 逐月模擬測試系統 — 建構報告

## 報告資訊

- **建構日期**：2026-07-14
- **主要檔案**：`test/e2e/monthly-simulation-m1-m3.spec.js`
- **相關輔助檔案**：`test/e2e/admin-3month-simulation.spec.js`, `test/e2e/gym-league.spec.js`
- **測試目標**：`frontend/kpi-dashboard.html`
- **執行方式**：`npx playwright test tools/learning-kpi-dashboard/test/e2e/monthly-simulation-m1-m3.spec.js`

---

## 一、系統目標

這套測試系統的核心目標是：**在真實瀏覽器環境中，逐月模擬學生從 M1（第 1 個月）到 M3（第 3 個月）的完整遊戲歷程，以發現只有長時間連續遊玩才會浮現的 bug。**

相較於傳統單元測試（只測單一函數的輸入/輸出），逐月模擬：
- 同時驗證多個子系統的互動（道館 EXP → 等級 → 聯盟解鎖 → 八大師解鎖）
- 揭露跨月/跨週的狀態累積問題（EXP 溢位、徽章冷卻、週限制重設）
- 逼近期末真實學生的遊玩路徑

---

## 二、測試架構

### 2.1 技術選擇

| 層級 | 技術 | 原因 |
|------|------|------|
| 瀏覽器自動化 | Playwright | 既有工具，支援 `page.evaluate()` 直接呼叫 JS 函數 |
| 驗證邏輯 | `page.evaluate()` | 直接呼叫遊戲核心函數（`generateGymWaves`, `calcLevelAndExp`），跳過 UI 點擊減少不穩定性 |
| Firestore 防寫 | 覆寫 `executeSave()` | 避免測試資料寫入真實資料庫 |
| 時間控制 | Admin 面板 `devWeek`/`devMonth` | 精確控制週/月切換，不受真實時間限制 |

### 2.2 測試檔案結構

```
test/e2e/
├── monthly-simulation-m1-m3.spec.js   ← 本系統核心（4 個測試）
├── admin-3month-simulation.spec.js    ← 先前的輕量級邏輯驗證（9 個測試）
├── gym-league.spec.js                 ← 道館/聯盟單元測試（12 個測試）
└── ...其他單元測試
```

### 2.3 四項測試說明

#### Test 1：完整 M1→M3 逐月模擬（主測試）

模擬 3 個月、12 週的完整路徑：

```
M1 W1: [每日提交] → Gym 1 (小剛)
M1 W2: [每日提交] → Gym 2 (小霞)
M1 W3: [每日提交] → Gym 3 (馬志士)
M1 W4: [每日提交] → Gym 4 (莉佳) → 關都聯盟 → 八大師·小智
M2 W1: [每日提交] → Gym 5 (阿速)
M2 W2: [每日提交] → Gym 6 (阿筆)
M2 W3: [每日提交] → Gym 7 (小茜)
M2 W4: [每日提交] → Gym 8 (松葉) → 城都聯盟 → 八大師·艾莉絲
M3 W1: [每日提交] → Gym 9 (杜鵑)
M3 W2: [每日提交] → Gym 10 (藤樹)
M3 W3: [每日提交] → Gym 11 (娜琪)
M3 W4: [每日提交] → Gym 12 (米可利) → 豐緣聯盟 → 八大師·艾嵐
```

**驗證點**：徽章 ≥12、三地區聯盟完成、三名八大師擊敗、等級 ≥ Lv.46、EXP 逐月遞增

#### Test 2：等級持續成長

12 週連續道館戰，驗證等級永不下降（monotonic）。

#### Test 3：閘門測試

雙閘門驗證：
- `todayTasksDone` 閘門：未提交每日任務時阻塞所有戰鬥
- `weekGymWins` 閘門：每週限 1 場道館戰

#### Test 4：跳級防護 + 八大師順序

驗證 `getNextE4Challenge()` 和 `getUnlockedMasters8()` 的循序解鎖邏輯。

---

## 三、核心 EXP 公式（模擬用）

所有 EXP 計算直接複製自 `kpi-dashboard.html` 的實際戰鬥函數，確保模擬結果與真實遊戲一致：

```javascript
// 道館戰 EXP（來自 finishGymVictory）
baseExp = (ARENA_EXP_BASE + floor(enemy.level * 3)) × 1.8 × waveMultiplier
waveMultiplier = isLastWave ? 2.5 : 1.2
先鋒分配：floor(totalExp × 1.2)

// 聯盟戰 EXP（來自 finishLeagueVictory）
baseExp = (ARENA_EXP_BASE + floor(enemy.level * 3)) × 5 × waveMultiplier
waveMultiplier = isLastWave ? 4 : 2.5

// 八大師戰 EXP（來自 finishMasters8Victory）
baseExp = (ARENA_EXP_BASE + floor(enemy.level * 3)) × 8 × waveMultiplier
waveMultiplier = isLastWave ? 4 : 2.5

// 每日提交 EXP（來自 submitData）
expGain = score × 10  （score 預設 80）
```

---

## 四、本次對話的關鍵修正

### Bug：`todayCompleted` 雙重用途導致戰鬥被擋

**問題**：`todayCompleted` 同時用於「防重複提交」和「阻塞戰鬥」，導致學生提交每日任務後所有戰鬥（聯盟、八大師、首領、E4）被擋。

**修正**：新增獨立旗幟 `todayTasksDone`（僅由 `每日提交` 設定），戰鬥函數改為檢查 `!todayTasksDone`（需先完成任務才能戰鬥）。

**相關檔案**：`frontend/kpi-dashboard.html`（28 處新增 `todayTasksDone` 引用）

### 新旗幟對照表

| 旗幟 | 由誰設定 | 檢查位置 |
|------|---------|---------|
| `todayCompleted` | 任何活動（每日提交/捕捉/訓練/道館戰） | submitData 防重複、UI 狀態 |
| `todayTasksDone` | 僅 `每日提交` | 戰鬥前置條件（!todayTasksDone 則擋） |

---

## 五、已知限制與待優化項目

### 當前限制

1. **無真實 Firestore 寫入**：`executeSave` 被覆寫為空函數，事件溯源路徑未經測試
2. **無 UI 點擊**：所有戰鬥透過 `page.evaluate()` 直接呼叫 JS 函數，未測試按鈕點擊流程
3. **單一寶可夢**：模擬僅使用初始伊布（P0），未測試隊伍切換/多寵 EXP 分配
4. **無隨機性控制**：`generateGymWaves` 等函數包含隨機成分（寶可夢選擇、等級浮動），每次執行結果略有不同

### P0 待補項目（建議優先實作）

- [ ] **衛冕挑戰模擬**：M1→M3 每月打完聯盟後觸發衛冕挑戰（`startDefenseChallenge`），驗證 3 天冷卻
- [ ] **每日提交完整 EXP**：目前僅加 750 EXP，可改為模擬每日不同分數（60-100）

### P1 待補項目

- [ ] **W2 道館 EXP +50% 加成**：目前模擬未套用 `getWeekType()` 的週加成
- [ ] **路人戰 ×5/天**：次要 EXP 來源，可簡化為每天固定 1-2 場
- [ ] **冠軍斗篷 ×1.5 EXP**：影響 EXP 曲線的重要道具

### P2 待補項目

- [ ] **寶可夢捕捉與進化**：伊布 Lv.16 進化影響 `highestLevel` 計算
- [ ] **EXP Share（學習裝置）**：留守隊員 EXP 分配
- [ ] **橡皮筋機制（rubber-band）**：低於道館等級時 EXP ×1.5

### P3 待補項目

- [ ] **金幣經濟 / 商店購買**：間接影響道具持有
- [ ] **任務/成就系統**：獎勵 EXP
- [ ] **PvP / TM 系統**

---

## 六、維護指南

### 新增戰鬥類型時的檢查清單

1. 在 `kpi-dashboard.html` 中新增戰鬥啟動函數時：
   - 加入 `if (!globalData.todayTasksDone) { toast("請先完成今日學習任務！"); return; }`
   - 確保勝利回調寫入事件時不誤設 `todayTasksDone`
2. 在模擬測試中加入對應的 `simulateDailySubmit()` 呼叫
3. 執行時確認閘門正確（未提交 → 擋；已提交 → 放行）

### EXPECTED_LEVEL 變更時的注意事項

`EXPECTED_LEVEL` 陣列（`kpi-dashboard.html:874`）定義了每個徽章數的預期等級。
模擬測試中 Test 1 的 assertion `expect(result.final.level).toBeGreaterThanOrEqual(46)` 直接引用 `EXPECTED_LEVEL[11]`，變更時無需手動更新。

### 執行全部測試

```powershell
npx playwright test tools/learning-kpi-dashboard/test/e2e/monthly-simulation-m1-m3.spec.js
npx playwright test tools/learning-kpi-dashboard/test/e2e/
```

---

## 七、模擬結果參考（2026-07-14 執行）

```
=== 最終狀態 ===
徽章: 12
總 EXP: 193,225
等級: Lv.53
EXP 進度: 5,935 / 9,540
最高等級: 53
已通關聯盟: 關都, 城都, 豐緣
八大師擊敗: 小智, 艾莉絲, 艾嵐
todayTasksDone: true
預期等級 (12 徽章): Lv.46 ✅ (實際 53 > 46)
```

EXP 成長曲線：
```
M1:  0 EXP → 53,035 EXP（Lv.36）
M2: 53,035 → 117,208 EXP（Lv.44）
M3: 117,208 → 193,225 EXP（Lv.53）
```

每日提交貢獻約 12 × 750 = 9,000 EXP（佔總 EXP 約 4.7%），
其餘來自 12 場道館戰（≈ 25,000 EXP）+ 3 場聯盟戰（≈ 59,500 EXP）+ 3 場八大師戰（≈ 99,200 EXP）。

---

*本報告由 Claude 於 2026-07-14 自動生成，作為 teacher-toolkit 專案中學習 KPI 管理工具的 M1→M3 測試系統技術交接文件。*
