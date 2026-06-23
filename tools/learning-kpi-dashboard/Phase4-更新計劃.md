# 學習 KPI 系統 — Phase 4 更新計劃

> 版本 1.0 | 建立日期：2026-06-23
> 基底版本：GAME-MANUAL V5.9
> 前置條件：OPTIMIZATION-ROADMAP 全項目完成（U1~U5+U7，U6 跳過，U8 通過）
> 預計總工時：~5h

---

## 目錄

1. [相依性地圖](#1-相依性地圖)
2. [Step A：好感度不一致修復](#2-step-a好感度不一致修復)
3. [Step B：傳說捕獲機率優化（連續天數累進方案）](#3-step-b傳說捕獲機率優化連續天數累進方案)
4. [Step C：好感度聯動 — 捕捉率](#4-step-c好感度聯動--捕捉率)
5. [Step D：好感度聯動 — 會心率（折衷方案）](#5-step-d好感度聯動--會心率折衷方案)
6. [測試策略](#6-測試策略)
7. [部署回滾計畫](#7-部署回滾計畫)
8. [驗收標準](#8-驗收標準)

---

## 1. 相依性地圖

```
Step A (好感度修復) ── 無相依 ──→ ✅ 可優先執行
   │
Step B (傳說機率優化) ── 無相依 ──→ ✅ 可獨立執行
   │
Step C (好感度→捕捉率) ←── 需 Step A 先完成（好感度數值需先正確）
   │
Step D (好感度→會心率) ←── 需 Step A 先完成（好感度數值需先正確）
```

### 建議執行順序

| 執行序 | Step | 原因 |
|:----:|:----:|------|
| 1 | **A** | P0 bug 修復，無相依 |
| 1 | **B** | P1 優化，可與 A 並行 |
| 2 | **C** | 需 A 先完成（好感度數值正確後才聯動） |
| 3 | **D** | 需 A 先完成，且戰鬥平衡需最後驗證 |

---

## 2. Step A：好感度不一致修復

| 項目 | 內容 |
|------|------|
| **優先級** | P0 — Bug 修復 |
| **預計工時** | 1h |
| **風險** | 🟢 低 |
| **影響系統** | 親密度系統、進化系統、事件溯源 |

### 2.1 現狀問題

三份檔案有兩處不一致：

| 位置 | 每日提交/捕捉 +? | EVO 門檻 |
|------|:---------------:|:--------:|
| 前端 `kpi-dashboard.html` | **+2** ← 需改 +1 | **120** ✅ 正確 |
| 後端 `kpi-core.js` | +1 ✅ 正確 | 無定義（pass through） |
| 模擬 `simulation-test.js` | +1 ✅ 正確 | **180** ← 需改 120 |

### 2.2 根因分析

這是典型的「三副本漂移陷阱」（與 U3 同類型問題）：
- 前端第 833-837 行對每日提交和捕捉寫了 `+= 2`，但後端和模擬都是 `+= 1`
- 模擬的 EVO_CONDITIONS 門檻 180 是舊值，UI 分母 `/120` 和前端 EVO 門檻 120 一致，代表模擬未隨前端更新
- 橙橙果好感度 +10 僅存在前端戰鬥道具邏輯，不經事件回放

### 2.3 修改明細

#### 檔案 A1：`frontend/kpi-dashboard.html`

**位置**：`recalculateStudentState` 內的好感度累積區段

```diff
- L836: happinessToday[hid] += 2;
+ L836: happinessToday[hid] += 1;
```

影響：
- 每日提交 → 全隊好感 +1（原 +2）
- 捕捉 → 全隊好感 +1（原 +2）
- 戰鬥勝利 → 維持 +2（已正確，無須改）

#### 檔案 A2：`test/simulation-test.js`

**位置**：`EVO_CONDITIONS` 定義區

```diff
- L370: "大嘴蝠": { type: "happiness", to: "叉字蝠", minLevel: 20, happiness: 180 },
+ L370: "大嘴蝠": { type: "happiness", to: "叉字蝠", minLevel: 20, happiness: 120 },

- L371: "吉利蛋": { type: "happiness", to: "幸福蛋", minLevel: 20, happiness: 180 },
+ L371: "吉利蛋": { type: "happiness", to: "幸福蛋", minLevel: 20, happiness: 120 },
```

#### 不需修改的檔案

- `backend/kpi-core.js`：後端為 `+= 1` ✅ 已正確，無 EVO_CONDITIONS（forward 前端定義）

### 2.4 修復後好感度獲取對照表

| 行為 | 調整前 | 調整後 | 範圍 |
|------|:-----:|:-----:|------|
| 每日提交 | +2 | **+1** | 全隊 |
| 捕捉 | +2 | **+1** | 全隊 |
| 戰鬥勝利 | +2 | **+2** | 參戰者 |
| 橙橙果 | +10 | +10 | 指定單隻 |

### 2.5 達標天數試算（門檻 120）

| 玩家類型 | 每日獲得 | 調整前 | 調整後 |
|---------|:-------:|:------:|:------:|
| 純提交型 | 全隊 +1 | 120/2=**60 天** | 120/1=**120 天** |
| 提交 + 5 路人戰 | +1+(5×2)=11 | 60 天 | 120/11≈**11 天** |
| 提交 + 5 路人 + 橙橙果×3 | 1+10+30=41 | ~3 天 | 120/41≈**3 天** |

> 純提交型延長至 120 天為預期中的調整，鼓勵學生參與戰鬥。戰鬥活躍型學生不受影響。

### 2.6 驗收標準

- [ ] `npm run test:sim` 模擬測試通過
- [ ] `npm run test:e2e` 27/27 passed
- [ ] 前端 EVO_CONDITIONS（120）= 模擬 EVO_CONDITIONS（120）
- [ ] 前端每日提交/捕捉 `+= 1` = 後端 `+= 1`

---

## 3. Step B：傳說捕獲機率優化（連續天數累進方案）

| 項目 | 內容 |
|------|------|
| **優先級** | P1 |
| **預計工時** | 1.5h |
| **風險** | 🟢 低 |
| **影響系統** | 捕捉系統、傳說機制、模擬預測 |

### 3.1 現狀問題

| 面向 | 現狀 | 問題 |
|------|------|------|
| 60-74 分區間 | **0% 傳說** | 低分學生完全無緣 |
| 連續提交加成 | 僅在第 10 天一次性保底，中間無階段獎勵 | 缺乏持續激勵 |
| MAX 模擬 9 月 | 僅 **3 隻傳說**（3.3%） | 滿分學生也偏低 |
| MIN 模擬 9 月 | **0 隻傳說** | 絕望感 |

### 3.2 設計方案：連續天數累進階梯

保留現有 streak≥10 一次性保底，**新增 streak≥3/5/7 的累進機率加成**：

```javascript
// 連續天數累進加成（在骰 tier 前計算）
var streakBonus = 0;
if (streak >= 7) { streakBonus = 0.06; }       // +6%
else if (streak >= 5) { streakBonus = 0.03; }   // +3%
else if (streak >= 3) { streakBonus = 0.01; }   // +1%
// streak ≥ 10 時維持強制傳說，不疊加 streakBonus
```

#### 新的各區間傳說機率（含累進加成）

| 分數 | 徽章 | 基礎 | +3d | +5d | +7d | +10d |
|:----:|:----:|:----:|:---:|:---:|:---:|:----:|
| ≥95 | ≥16 | 6% | 7% | 9% | **12%** | 100% |
| ≥95 | 8-15 | 6% | 7% | 9% | **12%** | 100% |
| 75-94 | ≥8 | 5% | 6% | 8% | **11%** | 100% |
| 60-74 | 任意 | **0%→2%** | **3%** | **5%** | **8%** | 100% |

### 3.3 修改明細

#### 檔案 B1：`frontend/kpi-dashboard.html`

**位置**：capture handler（~L6019-6041）

```diff
// 現有邏輯（L6039-6041）：
var streak = (globalData && globalData.submitStreak) || 0;
if (streak >= 10 && score >= 60) { tier = "傳說"; captureLevel = ...; }
else if (streak >= 5 && score >= 60 && tier === "一般") { tier = "稀有"; }

// 改為：
var streak = (globalData && globalData.submitStreak) || 0;
// 連續天數累進加成（stepBonus 方案）
var streakBonus = 0;
if (streak >= 7) { streakBonus = 0.06; }
else if (streak >= 5) { streakBonus = 0.03; }
else if (streak >= 3) { streakBonus = 0.01; }

// 60-74 區間：新增 2% 基礎傳說 + streakBonus
if (score >= 60 && score < 75) {
  var legChance = 0.02 + streakBonus;
  tier = Math.random() < legChance ? "傳說" : (Math.random() < 0.15 ? "稀有" : "一般");
  captureLevel = Math.max(5, Math.floor(score / 8));
}

// 75-94 區間：加入 streakBonus
else if (score >= 75 && score < 95) {
  if (canLegendary) {
    var legChance = 0.05 + streakBonus;
    tier = Math.random() < legChance ? "傳說" : (Math.random() < 0.35 ? "稀有" : "一般");
  } else {
    tier = Math.random() < 0.35 ? "稀有" : "一般";
  }
  captureLevel = Math.max(5, Math.floor(score / 6));
}

// ≥95 區間：加入 streakBonus
else if (score >= 95) {
  if (fullUnlock || canLegendary) {
    var legChance = 0.06 + streakBonus;
    tier = Math.random() < legChance ? "傳說" : (Math.random() < 0.6 ? "稀有" : "一般");
  } else {
    tier = Math.random() < 0.6 ? "稀有" : "一般";
  }
  captureLevel = Math.max(5, Math.floor(score / 4));
}

// streak ≥ 10 維持強制傳說（覆寫所有結果）
if (streak >= 10 && score >= 60) { tier = "傳說"; captureLevel = Math.max(captureLevel, Math.floor(score / 4)); }
// streak ≥ 5 升級稀有（保留）
else if (streak >= 5 && score >= 60 && tier === "一般") { tier = "稀有"; }
```

#### 檔案 B2：`test/simulation-test.js`

**位置**：`determineCaptureTier()`（~L699-724）

完全鏡像上述邏輯，新增 `streakBonus` 參數：
```javascript
function determineCaptureTier(score, badges, streak) {
  const canLegendary = badges >= 8;
  const fullUnlock = badges >= 16;
  let tier = "一般";

  // 連續天數累進加成
  let streakBonus = 0;
  if (streak >= 7) streakBonus = 0.06;
  else if (streak >= 5) streakBonus = 0.03;
  else if (streak >= 3) streakBonus = 0.01;

  if (score >= 95) {
    if (fullUnlock || canLegendary) {
      tier = Math.random() < (0.06 + streakBonus) ? "傳說" : (Math.random() < 0.6 ? "稀有" : "一般");
    } else {
      tier = Math.random() < 0.6 ? "稀有" : "一般";
    }
  } else if (score >= 75) {
    if (canLegendary) {
      tier = Math.random() < (0.05 + streakBonus) ? "傳說" : (Math.random() < 0.35 ? "稀有" : "一般");
    } else {
      tier = Math.random() < 0.35 ? "稀有" : "一般";
    }
  } else if (score >= 60) {
    tier = Math.random() < (0.02 + streakBonus) ? "傳說" : (Math.random() < 0.15 ? "稀有" : "一般");
  }

  if (streak >= 10 && score >= 60) { tier = "傳說"; }
  else if (streak >= 5 && score >= 60 && tier === "一般") { tier = "稀有"; }
  return tier;
}
```

#### 不需修改的檔案

- `backend/kpi-core.js`：capture 階層骰是前端 UI 操作，不經後端事件溯源

### 3.4 模擬預估

| 學生 | 現狀 9 月 | 優化後 9 月 |
|:----:|:---------:|:-----------:|
| MAX（100%） | 3 傳說（3.3%） | **~6 傳說（~6.6%）** |
| MIN（60%） | 0 傳說（0%） | **1~2 傳說（~1~2%）** |

### 3.5 邊界狀況

| 狀況 | 行為 |
|------|------|
| streak=0（新人） | bonus=0，不變 |
| streak=3（剛起步） | +1%，微幅提升 |
| streak=7（持續一週） | +6%，明顯有感 |
| streak≥10 | 強制傳說，不疊加 |
| 60-74 分 + streak=0 | 2% 傳說（新），不再完全絕望 |

### 3.6 驗收標準

- [ ] `npm run test:sim` 模擬測試通過（傳說率 < 15% 紅旗）
- [ ] `npm run test:e2e` 27/27 passed
- [ ] 手動驗證：連續 3/5/7 天後捕捉機率確實提升
- [ ] streak≥10 仍維持強制傳說
- [ ] GAME-MANUAL §12 傳說機率表更新
- [ ] GAME-MANUAL §25 更新紀錄新增 Phase 4 Step B

---

## 4. Step C：好感度聯動 — 捕捉率

| 項目 | 內容 |
|------|------|
| **優先級** | P2 |
| **依賴** | 需 Step A 先完成（好感度數值正確） |
| **預計工時** | 1h |
| **風險** | 🟢 低 |
| **影響系統** | 捕捉系統、親密度系統 |

### 4.1 設計目標

全隊平均好感度 → 捕捉時傳說/稀有機率加成，鼓勵全面培育。

### 4.2 公式定義

```javascript
/**
 * 計算全隊平均好感度
 * @param {Array} roster - 全部持有的寶可夢陣列
 * @returns {number} 平均好感度（0~120）
 */
function calcAvgHappiness(roster) {
  if (!roster || roster.length === 0) return 0;
  var sum = 0, count = 0;
  for (var i = 0; i < roster.length; i++) {
    if (roster[i]) { sum += roster[i].happiness || 0; count++; }
  }
  return count > 0 ? Math.round(sum / count) : 0;
}
```

### 4.3 門檻與倍率

| 平均好感度 | 傳說機率倍率 | 說明 |
|:---------:|:-----------:|------|
| < 60 | ×1.0 | 無加成（新手階段） |
| 60~99 | **×1.2** | 基本培育有成 |
| ≥ 100 | **×1.5** | 全面培育有成 |

#### 最終機率公式

```
最終傳說機率 = 基礎機率(依分數/徽章) × 好感倍率 + streakBonus(Step B)
```

#### 實際試算（≥95 分 + ≥8 徽 + streak=0）

| 平均好感 | 基礎 | 好感加成 | 最終 |
|:-------:|:----:|:--------:|:----:|
| 0 | 6% | ×1.0 | 6% |
| 60 | 6% | ×1.2 | **7.2%** |
| 100 | 6% | ×1.5 | **9%** |
| 120 | 6% | ×1.5 | **9%** |

#### 疊加 streakBonus（Step B）範例

| 平均好感 | streak | 計算式 | 最終傳說機率 |
|:-------:|:-----:|:------:|:-----------:|
| 60 | 0 | 6% ×1.2 + 0 | 7.2% |
| 60 | 3 | 6% ×1.2 + 1% | **8.2%** |
| 100 | 7 | 6% ×1.5 + 6% | **15%** |

### 4.4 修改明細

#### 檔案 C1：`frontend/kpi-dashboard.html`

**位置**：capture handler（~L6012）

**新增函數**（放在 `submitData` 上方或附近）：
```javascript
function calcAvgHappiness(roster) {
  if (!roster || roster.length === 0) return 0;
  var sum = 0, count = 0;
  for (var i = 0; i < roster.length; i++) {
    if (roster[i]) { sum += roster[i].happiness || 0; count++; }
  }
  return count > 0 ? Math.round(sum / count) : 0;
}
```

**修改 capture 區段**（在骰 tier 前加入）：
```javascript
// 好感度加成（在 streakBonus 之前計算）
var avgHap = calcAvgHappiness(globalData.roster);
var hapMultiplier = avgHap >= 100 ? 1.5 : (avgHap >= 60 ? 1.2 : 1.0);
```

然後將 Step B 程式碼中的 `legChance` 公式改為**乘好感再加 streak**：

```diff
// 60-74 區間
-   var legChance = 0.02 + streakBonus;
+   var legChance = 0.02 * hapMultiplier + streakBonus;

// 75-94 區間
-   var legChance = 0.05 + streakBonus;
+   var legChance = 0.05 * hapMultiplier + streakBonus;

// ≥95 區間
-   var legChance = 0.06 + streakBonus;
+   var legChance = 0.06 * hapMultiplier + streakBonus;
```

稀有機率也要乘好感倍率：
```diff
// 非傳說分支（canLegendary=false）
-   tier = Math.random() < 0.35 ? "稀有" : "一般";
+   tier = Math.random() < 0.35 * hapMultiplier ? "稀有" : "一般";

// 60-74 區間
-   tier = Math.random() < 0.15 ? "稀有" : "一般";
+   tier = Math.random() < 0.15 * hapMultiplier ? "稀有" : "一般";

// 以下依此類推...
```

> 最終機率公式：`最終機率 = (基礎機率 × 好感倍率) + streakBonus`

#### 檔案 C2：`test/simulation-test.js`

**位置**：`determineCaptureTier()` 函數

新增 `avgHappiness` 參數：
```javascript
function determineCaptureTier(score, badges, streak, avgHappiness) {
  // ...既有邏輯...
  var hapMultiplier = avgHappiness >= 100 ? 1.5 : (avgHappiness >= 60 ? 1.2 : 1.0);

  // 公式：最終機率 = (基礎機率 × 好感倍率) + streakBonus
  if (score >= 95) {
    if (fullUnlock || canLegendary) {
      var legChance = 0.06 * hapMultiplier + streakBonus;
      tier = Math.random() < legChance ? "傳說" : (Math.random() < 0.6 * hapMultiplier ? "稀有" : "一般");
    } else {
      tier = Math.random() < 0.6 * hapMultiplier ? "稀有" : "一般";
    }
  } else if (score >= 75) {
    if (canLegendary) {
      var legChance = 0.05 * hapMultiplier + streakBonus;
      tier = Math.random() < legChance ? "傳說" : (Math.random() < 0.35 * hapMultiplier ? "稀有" : "一般");
    } else {
      tier = Math.random() < 0.35 * hapMultiplier ? "稀有" : "一般";
    }
  } else if (score >= 60) {
    var legChance = 0.02 * hapMultiplier + streakBonus;
    tier = Math.random() < legChance ? "傳說" : (Math.random() < 0.15 * hapMultiplier ? "稀有" : "一般");
  }
  }
  // ...其餘區間依此類推...
}
```

#### 不需修改的檔案

- `backend/kpi-core.js`：capture 階層骰不經後端

### 4.5 邊界狀況

| 狀況 | avgHappiness | hapMultiplier | 行為 |
|------|:-----------:|:------------:|------|
| 新學生（全隊好感=0） | 0 | ×1.0 | 無影響 |
| 剛開始培育 | 30 | ×1.0 | 無影響 |
| 基本培育完成 | 60 | **×1.2** | 開始有加成 |
| 全面培育完成 | 100+ | **×1.5** | 最大加成 |
| 全隊 91 隻（MAX M9） | ~100+ | ×1.5 | 最大加成 |
| 全隊僅 1 隻 | = 該隻好感 | 依數值 | 鼓勵擴充 roster |

### 4.6 驗收標準

- [ ] 好感 60+ 時捕捉傳說機率正確 ×1.2
- [ ] 好感 100+ 時捕捉傳說機率正確 ×1.5
- [ ] 好感 0~59 時完全無影響（×1.0）
- [ ] 與 Step B streakBonus 疊加計算正確
- [ ] `npm run test:sim` 模擬測試通過
- [ ] `npm run test:e2e` 27/27 passed
- [ ] GAME-MANUAL §7.4 好感度效果更新
- [ ] GAME-MANUAL §12 傳說機率表更新

---

## 5. Step D：好感度聯動 — 會心率（折衷方案）

| 項目 | 內容 |
|------|------|
| **優先級** | P3 |
| **依賴** | 需 Step A 先完成（好感度數值正確） |
| **預計工時** | 1.5h |
| **風險** | 🟡 中（戰鬥平衡） |
| **影響系統** | 戰鬥系統、道具系統（焦點鏡）、親密度系統 |

### 5.1 設計目標

攻擊方寶可夢的個別好感度 → 會心率額外加成。採用折衷方案：**每 20 點好感 +0.75%**。

### 5.2 公式定義

```javascript
// 基礎會心率：1/16 = 6.25%
var baseCrit = 0.0625;

// 好感度加成（折衷方案：每 20 點 +0.75%）
var happinessBonus = Math.floor((attacker.happiness || 0) / 20) * 0.0075;

// 總會心率
var critChance = baseCrit + happinessBonus;

// 焦點鏡疊加（基礎變為 2 倍，好感加成仍疊加）
if (attacker.heldItem === "focusLens") {
  critChance = 0.125 + happinessBonus;
}
```

#### 最終會心率全表

| 好感度 | 好感加成 | 基礎 crit | 總 crit | + 焦點鏡 |
|:-----:|:-------:|:--------:|:------:|:--------:|
| 0 | 0% | 6.25% | 6.25% | 12.50% |
| 20 | 0.75% | 6.25% | **7.00%** | 13.25% |
| 40 | 1.50% | 6.25% | **7.75%** | 14.00% |
| 60 | 2.25% | 6.25% | **8.50%** | 14.75% |
| 80 | 3.00% | 6.25% | **9.25%** | 15.50% |
| 100 | 3.75% | 6.25% | **10.00%** | 16.25% |
| 120 | **4.50%** | 6.25% | **10.75%** | 16.75% |

#### 傷害期望提升（crit 傷害 ×1.5）

| 好感度 | 額外傷害期望 |
|:-----:|:-----------:|
| 0 | +0%（基準） |
| 60 | +1.1% |
| 120 | **+2.25%**（從 3.125% → 5.375%） |
| 120 + 焦點鏡 | **+2.25%**（從 6.25% → 8.375%） |

### 5.3 修改明細

#### 檔案 D1：`frontend/kpi-dashboard.html`

**位置**：`calculateMovePower()`（~L2424-2427）

```diff
  // 攜帶道具效果：焦點鏡（2倍會心率）
- var critChance = 0.0625;
- if (attacker.heldItem === "focusLens") critChance = 0.125;
+ var baseCrit = 0.0625;
+ var happinessBonus = Math.floor((attacker.happiness || 0) / 20) * 0.0075;
+ var critChance = baseCrit + happinessBonus;
+ if (attacker.heldItem === "focusLens") critChance = 0.125 + happinessBonus;
  var crit = Math.random() < critChance;
```

**注意事項**：
- `attacker` 物件必須有 `happiness` 屬性
- 我方寶可夢從 `battleState.playerParty` 取得，需確認有 happiness
- 敵方寶可夢無 happiness 或 = 0，不影響
- 由於 `calculateMovePower` 被玩家和敵方共用，敵方的 `attacker.happiness` 為 `undefined` 時 `|| 0` 會回退為 0，安全

#### 檔案 D2：`test/simulation-test.js`

模擬不涉及 crit 計算細節（只有簡化 EXP），**此檔不需修改**。最終透過回歸測試驗證。

#### 不需修改的檔案

- `backend/kpi-core.js`：戰鬥引擎僅在前端，後端不涉 crit 計算

### 5.4 戰鬥平衡影響評估

| 面向 | 評估 |
|------|------|
| **MAX 學生**（好感常滿） | +4.5% crit = ~+2.25% 總傷害，影響輕微 |
| **MIN 學生**（好感偏低） | +0~2.25% crit = ~+0~1.1% 總傷害，可忽略 |
| **道館難度** | 🟢 無影響（敵方無好感） |
| **路人戰** | 🟢 無影響（敵方無好感） |
| **聯盟戰** | 🟢 無影響（敵方無好感） |
| **PvP** | 🟢 公平（雙方都有好感加成） |
| **焦點鏡價值** | 🟢 好感 120 時仍為 crit 的 ~1.56x，仍有感 |
| **模擬曲線** | 🟢 不影響 EXP/等級，純戰鬥傷害微調 |

### 5.5 驗收標準

- [ ] 好感 0 → 會心率 6.25%（不變）
- [ ] 好感 60 → 會心率 8.50%（+2.25%）
- [ ] 好感 120 → 會心率 10.75%（+4.5%）
- [ ] 好感 120 + 焦點鏡 → 會心率 16.75%（+10.5%）
- [ ] 敵方寶可夢不受好感影響（happiness=undefined → 0）
- [ ] `npm run test:e2e` 27/27 passed
- [ ] GAME-MANUAL §9.6 會心率說明更新

---

## 6. 測試策略

### 6.1 每步驟測試閘門

```
Step 完成
  ↓
┌─ 模擬測試 (npm run test:sim) ──→ FAIL → 回滾數值調整
│
└─ Playwright E2E (npm run test:e2e) ──→ FAIL → 修復
     │
     └─ GAME-MANUAL 一致性檢查 (node tools/.../game-manual-consistency.js) ──→ FAIL → 修復
          │
          └─ ✅ Step 驗收通過
```

### 6.2 各步驟測試需求

| Step | 模擬測試 | Playwright | 一致性檢查 | 手動驗證 |
|:----:|:--------:|:----------:|:----------:|:--------:|
| A | ✅ 必須 | ✅ 必須 | ✅ 必須 | — |
| B | ✅ 必須 | ✅ 必須 | — | 機率人工驗證 |
| C | ✅ 必須 | ✅ 必須 | — | 好感度門檻驗證 |
| D | — | ✅ 必須 | — | 會心率驗證 |

### 6.3 風險測試案例

| 案例 | 觸發 | 預期 |
|------|------|------|
| 好感度前後端一致性 | 事件重放 | 前端 replay = 後端 replay |
| 好感度為 undefined 的舊資料 | 載入舊學生 | 預設 0，不報錯 |
| streak=3 時捕捉（Step B） | 捕捉操作 | 傳說機率 +1% |
| streak=10 時捕捉（Step B） | 捕捉操作 | 強制傳說 |
| avgHappiness=60 時捕捉（Step C） | 捕捉操作 | 傳說機率 ×1.2 |
| 好感=120 時戰鬥（Step D） | 攻擊動作 | 會心率 10.75% |
| 好感=120 + 焦點鏡（Step D） | 攻擊動作 | 會心率 16.75% |

---

## 7. 部署回滾計畫

### 7.1 標準部署流程

```
修改檔案
  ↓
同步至 public/（手動或 sync-public.ps1）
  ↓
執行 npm run test:sim ✅
  ↓
執行 npm run test:e2e ✅
  ↓
執行 node tools/.../game-manual-consistency.js ✅
  ↓
git commit + git push
  ↓
Firebase 自動部署（GitHub Actions）
```

### 7.2 回滾條件

符合以下任一條件即觸發回滾：

1. **模擬測試 FAIL** → 傳說率 > 15% 或 MAX Lv.99 提早超過 1 個月
2. **Playwright FAIL ≥ 3 項**（排除已知 flaky）
3. **好感度顯示 NaN / 負值 / 全白**
4. **捕捉時傳說機率明顯異常**
5. **戰鬥中 crit 計算錯誤導致 NaN 傷害**

### 7.3 回滾步驟

```bash
# 步驟 1：還原程式碼
git revert HEAD --no-edit
git push

# 步驟 2：重新部署（CI 自動）
# 或手動：firebase deploy --only hosting

# 步驟 3：驗證回滾成功
# 確認 https://opencodefirebase.web.app/kpi 恢復正常

# 步驟 4：記錄問題至 Phase4-更新計劃.md 踩坑筆記
```

### 7.4 部分回滾（單一步驟）

```bash
# 找出該 Step 相關 commit
git log --oneline --all | Select-String "Phase4"

# 還原特定 commit
git revert <commit-hash> --no-edit
git push
```

---

## 8. 驗收標準

### 8.1 每步驟驗收條件

| Step | 驗收條件 |
|:----:|---------|
| **A** | 前端每日提交/捕捉好感 = +1；EVO 門檻三份一致 120；模擬測試通過 |
| **B** | 60-74 分區間新增 2% 傳說；streak3/5/7 累進加成正確；模擬通過 |
| **C** | avgHappiness≥60 捕捉 ×1.2，≥100 ×1.5；與 streakBonus 疊加正確 |
| **D** | 好感 120 會心率 10.75%；+焦點鏡 16.75%；敵方不受影響 |

### 8.2 全 Phase 驗收條件

- [ ] `npm run test:sim` 模擬測試通過
- [ ] `npm run test:e2e` 27/27 passed
- [ ] `node tools/.../game-manual-consistency.js` 一致性檢查通過
- [ ] GAME-MANUAL 版本號更新（V5.9→V6.0）
- [ ] GAME-MANUAL §7.4 好感度獲取表更新
- [ ] GAME-MANUAL §9.6 會心率說明更新
- [ ] GAME-MANUAL §12 傳說機率表更新
- [ ] GAME-MANUAL §25 更新紀錄新增 Phase 4

---

> 文件結束 — Phase 4 更新計劃 V1.0（2026-06-23）
