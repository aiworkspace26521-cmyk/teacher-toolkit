# M1→M3 模擬測試驗證 — Bug 報告與修復計劃

> 測試日期：2026-07-17 | 測試帳號：Neil/Emma/Admin
> 測試結果：175/176 passed (1 skipped: TM 8.4 openForgetMove)
> 執行指令：`npx playwright test tools/learning-kpi-dashboard/test/e2e/`

---

## 一、測試結果摘要

| 測試檔案 | 測試數 | 結果 |
|----------|:------:|:----:|
| monthly-simulation-m1-m3.spec.js | 17 | ✅ 全數通過 |
| real-student-e2e.spec.js | 5 | ✅ 全數通過 |
| admin-3month-simulation.spec.js | 9 | ✅ 全數通過 |
| gym-league.spec.js | 12 | ✅ 全數通過 |
| masters8.spec.js | 7 | ✅ 全數通過 |
| tm-system.spec.js | 5 | ✅ 4 passed, 1 skipped (8.4) |
| 其餘 * | ~121 | ✅ 全數通過 |

**結論**：既有測試全部通過，但原始碼中發現多個未在測試覆蓋範圍內的真實 bug。

---

## 二、Bug 清單（依嚴重性排序）

### 🔴 HIGH — 高風險

#### H1：executeSave mock 未復原 — 測試污染
- **檔案**：`test/e2e/monthly-simulation-m1-m3.spec.js:35-38, 531-533`
- **說明**：Test 1 的 `page.evaluate()` (L29-557) 覆寫了 `window.executeSave`/`window.scheduleStudentFieldUpdate` 為空函數，但整個 callback 無 try-finally。若 520 行的 callback 中任何程式碼拋錯（例如 `generateGymWaves` 回傳 null 時 L72），mock 復原碼 (L531-533) 永不執行。由於 `page.evaluate()` 操作的是瀏覽器全域 scope，損壞的 mock 會殘留到後續所有 test，造成「測試間互相干擾」。
- **現有測試覆蓋**：❌ 無（本身就是測試基礎設施問題）
- **建議修復**：在 callback 外層加 try-finally 保護

#### H2：`finishLegendaryVictory` 中的 dead code
- **檔案**：`frontend/kpi-dashboard.html:4746-4749`
- **說明**：條件 `legData.source === "submit" && todayTasksDone && !todayCompleted` **絕對不會成立**：
  - **八大師路徑**：`pendingLegendary.source = "masters8"` (L4592) → `legData.source === "submit"` 為 false
  - **Submit 路徑**：`globalData.todayCompleted = true` 在 L7571 **早已設定完畢**，`!todayCompleted` 已為 false
- **衝擊**：若未來重構 `todayCompleted` 設定順序，這段 dead code 可能突然被觸發而造成雙重寫入
- **現有測試覆蓋**：❌ Test 16 驗證 submit 來源 failure 路徑，但該路徑不經 L4746
- **建議修復**：移除 L4746-4749，或在 submit 觸發路徑中提前處理

#### H3：樂觀更新與 `fetchStudentData` 的 race condition
- **檔案**：`frontend/kpi-dashboard.html:1289-1294`
- **說明**：`executeSave` 在 L1289 樂觀地設定 `todayCompleted=true`/`todayTasksDone=true`，然後才 `await fetchStudentData()` (L1294)。但 `fetchStudentData` 會**完全重設 globalData** 並從 Firestore 事件 replay。如果 replay 結果（`todayCompleted` 仍為 false）與樂觀值不一致，會產生短暫的 UI 閃爍或狀態不一致。失敗路徑 (L1295) 也有相同問題。
- **衝擊**：學生可能看到「已提交」狀態閃一下又消失，或相反
- **現有測試覆蓋**：❌ 模擬測試全部 mock 了 executeSave
- **建議修復**：讓 `fetchStudentData` 的 replay 結果作為唯一 truth source，移除 L1289 的樂觀賦值

---

### 🟡 MEDIUM — 中等風險

#### M1：共用 Modal 的 `onclick` 被覆寫
- **檔案**：`frontend/kpi-dashboard.html:4853`
- **說明**：`promptE4Challenge`、TM 學習、道具使用等多個功能都寫 `$("confirmBtnYes").onclick = function() {...}`。最後一個賦值者獲勝。若使用者快速點擊導致兩個 modal 流程重疊，會觸發錯誤的 handler。
- **建議修復**：改用 `addEventListener` + `{ once: true }`，或每次調用前保存 handler 引用

#### M2：DOM 相依的儲存失敗檢測
- **檔案**：`frontend/kpi-dashboard.html:7593-7594`
- **說明**：`submitData` 在 `executeSave` 完成後，檢查 `$("submitBtn").disabled` 和 `innerHTML` 來判斷儲存是否失敗。DOM 屬性可能被其他程式碼修改（例如 UI 更新回呼），產生誤判。
- **建議修復**：用 state-based flag（如 `_saveFailed = true`）取代 DOM 讀取

#### M3：Debounced writer 在快速連續呼叫時推送過期資料
- **檔案**：`frontend/kpi-dashboard.html:1301-1312`
- **說明**：`scheduleStudentFieldUpdate` 有 500ms debounce。若兩次連續呼叫（如 `finishLegendaryVictory` 的 L4740 `{roster}` + L4748 `{todayCompleted}`），資料已合併但到 timer 觸發時，`globalData` 可能已被 `executeSave` 的 `fetchStudentData` 修改過，導致推送過期的 roster。
- **建議修復**：縮短 debounce 到 50ms，或在 timer callback 中重新讀取 globalData

#### M4：`fetchStudentData` replay 路徑完全未測試
- **檔案**：`test/e2e/monthly-simulation-m1-m3.spec.js`（全部 mock executeSave）
- **說明**：所有模擬測試都將 `executeSave` mock 為空函數，從未實際測試過 `fetchStudentData` 的 replay 事件溯源邏輯。特別是 `recalculateStudentState` 中 `todayTasksDone` 的設定 (L944-945) 從未在整合測試中驗證。
- **建議修復**：新增一個不 mock executeSave 的測試（使用 Admin 帳號模擬寫入後重新載入驗證）

#### M5：`todayTasksDone` vs `todayCompleted` 語意重疊
- **檔案**：`frontend/kpi-dashboard.html`（42 處引用）
- **說明**：兩個 boolean 追蹤重疊概念：`todayCompleted` =「今天做過任何事」、`todayTasksDone` =「今天提交過每日任務」。42 處 if 條件以 17 種不同組合檢查這兩個旗幟，其中至少 3 種組合邏輯上不可到達（含 H2）。
- **建議修復**：統一為 state enum（`none | submitted | completed`），消除歧義與 dead code

#### M6：`finishLegendaryVictory` 在 `battleState` 清除前呼叫 `executeSave`
- **檔案**：`frontend/kpi-dashboard.html:4745`
- **說明**：`executeSave` 呼叫時 `battleState` 仍有效，若未來 `executeSave` 內部讀取 `battleState` 做詳細 logging，會取得不完整資料。
- **建議修復**：先 `battleState = null` 再 `executeSave`，或明確傳遞必要資料

---

### 🟢 LOW — 低風險

#### L1：月份陣列索引不易理解
- **檔案**：`frontend/kpi-dashboard.html:4743`
- **說明**：`["","一月","二月",...][(d.getMonth() + 2) % 12 + 1]` 的 +2 offset 不直觀
- **建議**：改用 `const MONTH_NAMES = ["一月","二月",...]; MONTH_NAMES[d.getMonth()]`

#### L2：`totalWaves` 屬性的重複定義
- **檔案**：`frontend/kpi-dashboard.html:4674` vs `3696`
- **說明**：部分 `battleState` 建立時設 `totalWaves`，但 `startNextWave` (L3689) 使用 `gymWaves.length`。可能不同步。
- **建議**：統一使用 `gymWaves.length`

#### L3：測試中不抑制 console.log
- **檔案**：`test/e2e/monthly-simulation-m1-m3.spec.js:560-563`
- **說明**：`JSON.stringify` 大物件的 console.log 在 CI 中造成雜訊
- **建議**：用 env var 開關或穩定後移除

#### L4：TM 8.4 openForgetMove 被跳過
- **檔案**：`test/e2e/tm-system.spec.js:91`
- **說明**：測試條件式 `test.skip()` 在 dialog handler 無法觸發時跳過。底層原因可能是 `openForgetMove` 的 NPC prompt 需要 DOM dialog handler 正確設置，或 `page.on('dialog', ...)` 註冊時機問題。
- **建議**：改用 `page.once('dialog', ...)` 確保只處理一次；或確認 `openForgetMove` 是否正確觸發 window.prompt

#### L5：admin-3month M1 測試執行時間 >19s
- **檔案**：`test/e2e/admin-3month-simulation.spec.js:60`
- **說明**：M1 測試耗時 19.8s，遠超平均 2s
- **建議**：檢查是否為 `networkidle` 等待或 Firestore 讀取瓶頸

---

## 三、Bug 影響分析

### 測試覆蓋缺口

```
全部測試 (176) ─┬─ 模擬測試 (mock executeSave) ──→ 覆蓋戰鬥邏輯 ✅
                │                                      └→ 不覆蓋事件回放 ❌ (H3, M4)
                ├─ 真實 Firestore E2E (5) ──────────→ 覆蓋資料載入 ✅
                │                                      └→ 不覆蓋戰鬥邏輯 ❌
                └─ TM 測試 (5) ────────────────────→ 1 skip (L4)
```

### 生產環境風險矩陣

| Bug | 發生頻率 | 偵測難度 | 影響範圍 | 風險指數 |
|-----|:--------:|:--------:|:--------:|:--------:|
| H1 | 低（僅測試） | 高 | 測試可信度 | 🔴 高 |
| H2 | 永不（dead code） | 中 | 重構安全性 | 🟡 中 |
| H3 | 每次提交 | 中 | 學生 UI 體驗 | 🟡 中 |
| M1 | 低（快速點擊） | 高 | 功能錯誤 | 🟡 中 |
| M2 | 低 | 中 | 提交驗證 | 🟢 低 |
| M3 | 中 | 高 | 資料不一致 | 🟡 中 |
| M5 | 持續 | 低 | 程式碼維護 | 🟢 低 |

---

## 四、修復計劃

### Phase 1：高優先（測試基礎設施 + 資料安全）

| 順序 | Bug | 預計工時 | 做法 |
|:----:|-----|:--------:|------|
| 1 | **H1** - try-finally 保護 | 15min | 在 `monthly-simulation-m1-m3.spec.js` 每個 `page.evaluate()` 外包 try-finally，確保 mock 永遠復原 |
| 2 | **H3** - race condition | 30min | `executeSave` 中移除 L1289 樂觀賦值，完全依賴 `fetchStudentData` replay；失敗路徑 L1295 也同 |
| 3 | **H2** - 移除 dead code | 10min | 移除 L4746-4749 整個 if block |

### Phase 2：中優先（功能穩定性）

| 順序 | Bug | 預計工時 | 做法 |
|:----:|-----|:--------:|------|
| 4 | **M1** - onclick 保護 | 20min | `confirmBtnYes` 改用 `addEventListener({ once: true })` |
| 5 | **M3** - debounce 安全 | 15min | Timer callback 中重新從 `globalData` 讀取最新值再寫入 |
| 6 | **M2** - DOM 改 state | 15min | 用 `_submitFailed` flag 取代 DOM 檢查 |
| 7 | **M4** - 新增整合測試 | 45min | 新增 Admin 模擬寫入→reload→驗證 todayTasksDone 一致性的測試 |

### Phase 3：低優先（程式碼品質）

| 順序 | Bug | 預計工時 | 做法 |
|:----:|-----|:--------:|------|
| 8 | **M5** - 統一為 enum | 60min | 引入 StateEnum: `NONE | SUBMITTED | ALL_DONE`，取代 42 處兩個 boolean 的 if 組合 |
| 9 | **L1-L5** - 雜項 | 30min | 月份命名、totalWaves 統一、console.log 管理 |
| 10 | **L4** - TM 測試修復 | 20min | 改用 `page.once('dialog')` 並確認 `openForgetMove` 呼叫鏈 |

### 時程建議

```
總預計工時：~4 小時
Phase 1（H1+H2+H3）：55min ── 本日應完成
Phase 2（M1-M4）：    1h35min ── 本週應完成
Phase 3（M5 + 雜項）： 1h50min ── 可排入下週
```

---

## 五、驗證方式

修復完成後依序執行：

```powershell
# 1. 確認測試不因 H1 損壞
npx playwright test tools/learning-kpi-dashboard/test/e2e/monthly-simulation-m1-m3.spec.js --reporter=list

# 2. 全測試套件回歸
npx playwright test tools/learning-kpi-dashboard/test/e2e/ --reporter=list

# 3. 手動驗證 H3 修復：在瀏覽器開啟 /kpi → Admin → 每日提交 → 確認 todayCompleted 無閃爍
```

---

*本報告由 Claude 於 2026-07-17 自動生成，基於 Playwright 176 測試結果與原始碼靜態分析。*
