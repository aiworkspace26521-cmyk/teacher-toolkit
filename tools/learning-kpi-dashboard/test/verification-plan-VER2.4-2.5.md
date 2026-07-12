# VER2.4 → VER2.5 交叉驗證計畫

> 目的：補足現有 47 項 Playwright 測試未覆蓋的缺口，從不同角度確保系統與規格一致。
> 建立在：ver2.5-unit.spec.js (14) + masters8.spec.js (15) + gym-league.spec.js (11) + pvp-trade.spec.js (7) = 47 ✅

---

## 第一輪：程式碼審查發現的關鍵缺口

### ✅ 已確認：事件回放 `leagueRegionsWon` 格式正確（非 Bug）

原始分析一度認為有 Bug，但深入追蹤 code flow 後確認**實際路徑是正確的**。

| 路徑 | 函式 | 行號 | Note 格式 | Regex `\[(.+?)\s*League\]` | 正確？ |
|:-----|:-----|:----:|:----------|:--------------------------:|:------:|
| 聯盟勝利 | `finishLeagueVictory()` | 4606 | `⚔️ 聯盟冠軍 [關都 League] \| ...` | 匹配，擷取「關都」 | ✅ |
| 非波次戰鬥勝利 | `endBattle()` → `playerWon` | 3880 | `[League]`（不含地區） | 不匹配 | 🟡 死路徑 |
| 聯盟敗北 | `endBattle()` → `!playerWon` | 3882 | 不存 Firestore | — | ✅ 同規格 |

**說明**：
- `finishLeagueVictory()` (`:4606`) 的 note 格式為 `[關都 League]`，與事件回放 regex (`:1063`) 完全相容
- `finishMasters8Victory()` (`:4533`) 的 note 格式為 `[小智 (#8)]`，與 regex (`:1064`) 完全相容
- Line 3880 的 `[League]`（無地區）位於 `endBattle()` 的非波次戰鬥勝利分支，因 league/masters8/gym 已在 line 3792-3796 被提前攔截並 return，此路徑對 league 來說是**不可到達的死程式碼**

**驗證測試**（確認事件回放整合正確）：
```
T-EV1: 手動建構一筆 note = "⚔️ 聯盟冠軍 [關都 League] | E4 [科拿 & 希巴] | 參與者: P1"
       → safeNote.match(/\[(.+?)\s*League\]/) → lr[1] === "關都"

T-EV2: 手動建構一筆 note = "👑 八大師擊敗 [小智 (#8)] | 參與者: P1"
       → safeNote.match(/\[(.+?)\s*\(#\d+\)\]/) → m8match[1] === "小智"

T-EV3: 完整事件回放模擬：
       1. 呼叫 finishLeagueVictory（模擬關都通關）
       2. 驗證 executeSave 的 note 包含 "[關都 League]"
       3. 驗證 fetchStudentData 回放後 leagueRegionsWon["關都"] === true

T-EV4: 完整八大師回放模擬（同上，針對 masters8）
```

---

### 🟡 未測試：Firestore 持久化驗證

現有測試全部在記憶體中操作 `globalData`，從未驗證 Firestore 讀寫循環。

| 測試編號 | 測試項目 | 方法 |
|:--------:|:---------|:-----|
| T-FS1 | `finishLeagueVictory()` 後 Firestore 正確儲存 `leagueRegionsWon` | 在 `scheduleStudentFieldUpdate` 的 debounced `set()` 呼叫處 mock 驗證 payload |
| T-FS2 | `finishMasters8Victory()` 後 Firestore 正確儲存 `masters8Completed` | 同上 |
| T-FS3 | 頁面重整後（模擬）`leagueRegionsWon` 與 `masters8Completed` 恢復正確 | 手動設 sessionStorage cache → reload → verify |
| T-FS4 | `startMasters8Battle()` 的 `masters8Progress` 寫入 Firestore（C5 追蹤） | 驗證 `scheduleStudentFieldUpdate` 被呼叫 |

---

### 🟡 未測試：按鈕防護的雙層檢查

`updateBattleButtons()` 會隱藏 W1~W3 的八大師按鈕，但 `startMasters8Battle()` 本身**不檢查週別**。如果按鈕因某 Bug 顯示在非 W4 時段，點擊後不會被阻擋。

| 測試編號 | 測試項目 | 方法 |
|:--------:|:---------|:-----|
| T-BTN1 | `startMasters8Battle()` 在 W1 被直接呼叫（跳過按鈕）→ 不應啟動戰鬥 | `page.evaluate` 設 `devWeek=W1` → 直接呼叫 → 檢查 `battleState` |
| T-BTN2 | `promptE4Challenge()` 在 W1 被直接呼叫 → 應彈 toast 拒絕 | 同上，驗證 toast 訊息 |

---

## 第二輪：邊界條件驗證（6 大場景）

### 場景 A：W4 邊界月（C8 實測）

`getWeekType()` 對 28/30/31 天月份的行為：

| 測試編號 | 月份 | 日期 | 預期 `getWeekType()` | 預期 `isBufferPeriod()` |
|:--------:|:----:|:----:|:-------------------:|:-----------------------:|
| T-BD1 | 2 月（28天） | 22 | W4 | false（day > 7） |
| T-BD2 | 2 月（28天） | 28 | W4 | false |
| T-BD3 | 2 月（28天） | 1（3月） | W1 | true（若上月有聯盟記錄） |
| T-BD4 | 3 月（31天） | 31 | W4 | false |
| T-BD5 | 任何月 | 7→8 過渡 | W1(7)→W2(8) | true(7)→false(8) |

**方法**：mock `Date` 建構式，測試 `getWeekType()` + `isBufferPeriod()` 在每月每天的輸出。

---

### 場景 B：跨界聯盟進度

學生在各類邊界條件下的聯盟按鈕狀態：

| 測試編號 | 條件 | badge | 已通關地區 | 月份狀態 | 預期按鈕 |
|:--------:|:-----|:----:|:----------:|:---------:|:---------:|
| T-CR1 | W4，首次 | 4 | 無 | 本月無記錄 | 關都，可點 |
| T-CR2 | W4，跨月追打 | 4 | 無 | 本月已通關關都 | 隱藏（本月已打） |
| T-CR3 | 次月 W1 緩衝 | 4 | 無 | 上月未通關 | 關都，緩衝提示 |
| T-CR4 | 次月 W1 緩衝 | 4 | 無 | 上月已通關關都 | 關都（但 badge 仍為 4，已通關→null） |
| T-CR5 | W4，一週雙聯盟 | 12 | 關都、城都 | 本月無記錄 | 豐緣（驗證跳過前兩區） |
| T-CR6 | W4，全 8 區通關 | 32 | 全部 8 區 | 全部本月記錄 | 隱藏（無聯盟可打） |

---

### 場景 C：八大師依序挑戰的跨層互動（C9 深化）

| 測試編號 | 已通關聯盟 | masters8Completed | 預期 `getUnlockedMasters8()` |
|:--------:|:-----------|:-----------------:|:---------------------------:|
| T-M1 | 關都 | [] | 小智 |
| T-M2 | 關都、城都 | [] | 小智（非艾莉絲） |
| T-M3 | 關都、城都 | [小智] | 艾莉絲 |
| T-M4 | 關都、城都、豐緣 | [小智] | 艾莉絲（豐緣→艾嵐，但城都沒解鎖） |
| T-M5 | 關都 | [小智、艾莉絲] | null（城都未通關，無下一位） |
| T-M6 | 全部 8 區 | [] | 小智 |
| T-M7 | 全部 8 區 | [小智..丹帝] | null |

**邊界**：`masters8Completed` 含有無效名稱時的行為。

---

### 場景 D：道館冷卻 7 天的全路徑覆蓋

現有測試 T6 僅驗證 `shouldGainBadge()` 的條件判斷。但實際 badge 增加有兩處（3742、3844）：

| 測試編號 | 測試項目 |
|:--------:|:---------|
| T-CD1 | 第一條 badge 增益路徑（line 3742）：設 `daysSinceLastBadge=7` → 驗證 `badgeGain=1` |
| T-CD2 | 第二條 badge 增益路徑（line 3844）：同上，驗證正確分支 |
| T-CD3 | 確認兩條路徑分別對應不同的戰鬥流程（確認哪種戰鬥走哪條） |
| T-CD4 | 打贏道館後立即檢查 UI 冷卻顯示（gymPreview）→ 顯示「冷卻中（剩 7 天）」 |
| T-CD5 | 7 天後再打 → badge 增加，冷卻重置 |

---

### 場景 E：管理員 DevTool 驗證

| 測試編號 | 測試項目 |
|:--------:|:---------|
| T-DV1 | `devWeek` 切換 W1/W2/W3/W4 → 按鈕狀態正確跟隨 |
| T-DV2 | `devWeek` 設為 "auto" → 回到真實日期判定 |
| T-DV3 | `devMonth` 切換 → 影響 `getCurrentMonth()` → 影響月份相關邏輯 |
| T-DV4 | 管理員身分 + 任意 devWeek → `isBufferPeriod()` 回傳 false（管理員不受緩衝限制） |

---

### 場景 F：資料結構一致性驗證

| 測試編號 | 測試項目 | 預期 |
|:--------:|:---------|:-----|
| T-DS1 | `GYM_LEADERS` 長度 = 32，對應 VER2.4 §2.2 | 8 地區 × 4 位 |
| T-DS2 | `LEAGUE_REGIONS` 的 `order` 欄位與 `getNextE4Challenge()` 內的 `order` 陣列完全一致 | 0~7，依序 |
| T-DS3 | `LEAGUE_REGIONS` 的 `requiredBadges` = [4,8,12,16,20,24,28,32] | 與 thresholds 一致 |
| T-DS4 | `MASTERS_8` 的 `rank` 欄位與 `regionToRank` 對照表一致 | 關都→8…伽勒爾→1 |
| T-DS5 | 8 位八大師 `lvBonus` 與 VER2.4 §5.4 等級計算一致 | 75/80/82/85/88/92/96/100 |
| T-DS6 | 32 位館主 `lvBonus` 與 VER2.4 §2.2 一致 | 0,2,4,6,8,…62 |

---

## 第三輪：人工作業（無法自動化）

以下驗證需人工操作瀏覽器，模擬真實使用者行為：

### 3.1 完整學生旅程（需約 15 分鐘）

```
操作流程：
1. 以 Admin 身分登入
2. 選擇一位學生（或新學生）
3. 使用 devWeek/devMonth 加速時間

步驟：
a. 設 devMonth=1, devWeek=W1 → 確認路人戰、道館戰可用
b. 打路人戰（5 次）→ 確認上限
c. 打道館戰（badge 1）→ 確認冷卻開始
d. 手動設 daysSinceLastBadge=7 → 再打道館（badge 2）
e. 重複至 badge=4
f. 設 devWeek=W4 → 確認關都聯盟按鈕出現
g. 打關都聯盟 → 確認 leagueRegionsWon 更新
h. 確認八大師小智解鎖
i. 打小智 → 確認 masters8Completed 更新
j. 逐區推進至 badge=8 → 城都聯盟 → 艾莉絲 → ...
```

### 3.2 事件回放正確性（需約 10 分鐘）

```
1. 登入 Admin，選擇有歷史記錄的學生
2. 打開 DevTools Console
3. 執行: console.log(globalData.leagueRegionsWon)
4. 預期：已通關的地區應為 true
5. 若為空 {} → 確認是本文發現的 Bug
6. 執行: console.log(globalData.masters8Completed)
7. 預期：已擊敗的八大師名稱陣列
```

### 3.3 緩衝期 UI 驗證（需約 5 分鐘）

```
1. Admin 登入
2. 選擇學生，設 devWeek=W4
3. 設 leagueCompletedMonths[關都] = 上個月 key
4. 設 devWeek=W1（此時應為緩衝期）
5. 點關都聯盟按鈕 → 確認顯示「⚠️ 緩衝期最後機會！錯過需等下個 W4」
```

---

## 第四輪：現有 Bug 優先修復清單

依嚴重度排列：

| 優先 | 項目 | 位置 | 現有測試是否能抓到 | 處理方式 |
|:----:|:-----|:----|:-----------------:|:--------|
| 🟡 P1 | `startMasters8Battle()` 無週別檢查 | line 4434 | ❌ 無 | 加入 `isBossWeek()`/`isBufferPeriod()` 防護 |
| 🟡 P2 | `finishMasters8Victory()` **無 Firestore 直接寫入**（C5） | line 4488+ | ❌ 無 | 在 victory 後補 `scheduleStudentFieldUpdate({masters8Completed: ...})` |
| 🟢 P3 | `isBufferPeriod()` 對管理員無限制（若屬設計意圖則 skip） | line 805 | ❌ 無 | 確認是否加 `!isAdmin` |
| 🟢 P4 | Line 3880 的 `[League]` 死路徑 — 永遠不會被 league 勝利到達 | line 3880 | ❌ 無 | 可清除該 ternary 分支或加註釋 |
| 🟢 P5 | MASTERS_8 艾嵐屬性（C7）噴火龍 X 火/龍 vs 火/飛行 | VER2.2 §3.3 | ❌ 無 | 規格備註即可 |

---

## 第五輪：測試執行腳本

```bash
# 既有測試（確保回歸）
npx playwright test ver2.5-unit.spec.js masters8.spec.js gym-league.spec.js

# 新增測試（本計畫）
npx playwright test ver2.5-cross-verification.spec.js

# 全量
npx playwright test
```

---

## 總結：現有測試覆蓋率 vs 缺口

| 面向 | 現有測試 | 缺口 |
|:-----|:--------|:-----|
| 輔助函式（純邏輯） | ✅ T1-T9（9 項） | 邊界值，28/30/31 天月 |
| 核心邏輯（依序通關） | ✅ T4-T6、6.4 | 跨月緩衝細微情境 |
| 八大師解鎖 | ✅ T7、T7b、11.6 | 跨層互動（C9）、無週別檢查 |
| 按鈕顯示/隱藏 | ✅ 6.2、11.4 | 直接呼叫 bypass、雙層防護 |
| 道館冷卻 | ✅ IT6 | 兩條 badge 路徑辨識、UI 顯示 |
| 資料結構 | ✅ 6.1、11.3、6.4 | 完整跨表比對 |
| Firestore 持久化 | ❌ 無 | **完全缺漏** |
| 事件回放正確性 | ❌ 無 | **完全缺漏（含 P0 Bug）** |
| 管理員 DevTool | 🟡 部分 | devMonth 影響範圍 |
| 人工 E2E 流程 | ❌ 無 | 真實使用者模擬 |

---

## 預計新增測試數

| 輪次 | 測試數 | 類型 |
|:----:|:------:|:-----|
| 第一輪（Bug 驗證） | 7 | 自動化 Playwright |
| 第二輪（邊界條件） | 20 | 自動化 Playwright |
| 第三輪（人工作業） | 3 大場景 | 人工腳本 |
| **合計** | **27 + 3 人工** | |

