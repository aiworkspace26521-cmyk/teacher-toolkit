# Boss 週：週期性活動結構設計

## 概述

將每月劃分為 4 個週次（W1~W4），每週有不同主題與獎勵加成，增加遊戲變化性與策略選擇。

## 週次定義

| 週次 | 名稱 | 天數 | 主題 | 加成 |
|------|------|------|------|------|
| W1 | 一般週 | 第 1~7 天 | 常規路人戰 | 無特殊加成 |
| W2 | 道館週 | 第 8~14 天 | 道館挑戰優先 | 道館 EXP +50%、金幣 +10 |
| W3 | 訓練週 | 第 15~21 天 | 強化訓練 | 路人戰 EXP +30% |
| W4 | Boss 週 | 第 22~月底 | 魔王戰 + 四天王 | Boss 專屬獎勵、E4 入口開啟 |

## 週次判定邏輯

```
getWeekType():
  day = getDate()
  if day ≤ 7  → W1 (一般)
  if day ≤ 14 → W2 (道館)
  if day ≤ 21 → W3 (訓練)
  else → W4 (Boss)
```

管理員可透過 `devWeek` 下拉選單強制指定週次，用於測試與展示。

## Boss 週（W4）詳細設計

### B.1 魔王戰
- **按鈕**：Boss 週期間顯示「👑 魔王戰」按鈕
- **次數限制**：每週 1 次
- **獎勵**：
  - EXP 2.5×
  - 金幣 +20
  - 可捕捉
- **等級公式**：`effectiveLv + 8`

### B.2 四天王 + 冠軍
- **按鈕**：Boss 週期間顯示「🏆 聯盟賽」按鈕（與原本月底邏輯並存）
- **次數限制**：每月 1 次（沿用原本 `monthLeagueWins` 邏輯）
- **結構**：4 天王 + 1 冠軍，共 5 波連戰
- **等級公式**：
  - E4：`expectedLevel + round(lvBonus × 0.04)`
  - 冠軍：`expectedLevel + round(lvBonus × 0.06)`

### B.3 道館戰
- 每月的 W4 仍可進行道館挑戰（原本 3 道館/週上限不變）
- 道館徽章已達 8 枚的玩家以聯盟賽為主

### B.4 防衛挑戰
- **觸發條件**：當月已通關該地區聯盟的學生可挑戰衛冕者
- **冷卻時間**：`DEFENSE_COOLDOWN_DAYS`（預設 7 天）
- **獎勵**：+15 金幣、+5 聯盟積分
- **等級公式**：`expectedLevel + round(champ.lvBonus × 0.06) + random(0~5)`（冠軍公式 + 隨機震盪）

## 各週 UI 提示

### Event Banner 顯示
- **W1 一般週**：不顯示（或顯示「📌 一般訓練週」）
- **W2 道館週**：「⚡ 道館週 — 道館 EXP +50%、金幣 +10」
- **W3 訓練週**：「📚 訓練週 — 路人戰 EXP +30%」
- **W4 Boss 週**：「👑 Boss 週 — 魔王降臨！四天王等待挑戰！」

### 按鈕可見性
- **W4 Boss 週**：顯示「👑 魔王戰」按鈕
- 其他週次：隱藏 Boss 按鈕
- 聯盟賽按鈕：Boss 週期間顯示

## 資料結構

無需新增 Firestore 欄位。週次由 `new Date().getDate()` 即時計算：
- `getWeekType()` → `"normal" | "gym" | "train" | "boss"`
- `isBossWeek()` → `boolean`

管理員強制設定儲存於 `devWeek` select 元素（僅前端、不持久化）。

## 實作檔案

- `frontend/kpi-dashboard.html`：核心邏輯（getWeekType、按鈕控制、banner）
- `public/kpi-dashboard.html`：部署版本同步
- 本文件（`analysis/restructured-weekly-schedule.md`）為設計參考

## 與原系統相容性

- 原 `checkIsLeague()` 函數保留，但不再使用
- 聯盟賽按鈕改為 `W4` 顯示（`d > 21` 已經涵蓋月底所有天數）
- 原月底大會邏輯（`monthLeagueWins`、`leagueCompletedMonths`）不變
- 週次系統僅影響 UI 提示與按鈕可見性，不改變事件溯源邏輯
