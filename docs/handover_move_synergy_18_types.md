# 📘 全 18 屬性寶可夢招式連攜拓撲重構與 Agent Skill 專案交接文件

> **文件版本**：v3.4 (包含全圖鑑 2,034 組 DOM 實機自動化點擊驗證與 T5 奧義對齊修復)  
> **交接日期**：2026-08-23  
> **專案名稱**：Teacher-Toolkit (Learning KPI Dashboard - Pokemon Move Synergy Topology)  
> **線上發布 URL**：https://opencodefirebase.web.app  
> **存放路徑**：`g:\我的云端硬盘\teacher-toolkit\docs\handover_move_synergy_18_types.md`

---

## 📌 一、 專案背景與整體架構 (Context & Architecture)

本專案旨在解決 **Learning KPI Dashboard (v3.1~v3.4 招式學習與技能樹系統)** 中，寶可夢技能樹選招時所面臨的連攜發放品質與 DOM 渲染對齊問題。

### 核心原則 (Core Architectural Rules)
1. **1 對 1 獨占連攜 (Fan-Out == 1)**：
   - 玩家學習任何前置招式時，在下一階層 **有且僅有 1 個** 獨占連攜招式點亮。
   - 徹底杜絕多招式重複顯示相同連攜標籤的多發放問題。
2. **孤兒招式零容忍 (Orphans == 0)**：
   - 全圖鑑任何寶可夢（18 種單屬性、153 種雙屬性組合、150+ 隻圖鑑寶可夢），從 T1 ➡️ T2 ➡️ T3 ➡️ T4 ➡️ T5 漸進選招時，絕無無連攜孤兒步驟。
3. **生理特徵動態過濾 (Morphology Filter)**：
   - 萬能保底引擎 (Step 5) 自動過濾該寶可夢無特徵（無牙/無爪/無翅/無尾）的招式，動態掛載至畫面上第一個合法的解鎖招式。
4. **防禦輔助招式靜音 (Defensive Silence)**：
   - 防禦與生存招式（`守住`、`替身`、`充電`、`變硬`、`影子分身`、`哈欠`、`光牆`、`水流環`、`絕對防禦`、`溶化`、`睡覺`）保證不彈出攻擊性連攜，維護介面乾淨。

---

## 🏆 二、 已完成核心工程成果 (Accomplished Milestones)

### 1. 演算法修復與重構 (`calculateMoveSynergyV33`)
- **T5 程序化奧義索引對齊修復（太陽伊布 Bug）**：
  - 修復 T5 奧義連攜，改為掃描玩家已學招式鏈中的程序化號碼 (`_T\d+_(\d+)`)。
  - 當太陽伊布選取 `超能力波崩滅_T1_6` 時，T5 的 `🔗 超能力波崩滅·奧義共鳴 傷害+35%` 標籤 **100% 精確渲染在 `超能力波崩滅_T5_6`**，徹底解決跳躍至 Option 1 (`超能力念重擊_T5_1`) 的 Bug。
- **萬能拓撲保底引擎 (Universal 1-to-1 Stream Matcher Engine)**：
  - 導入 `isEligible` 生理動態檢查，確保全圖鑑寶可夢在選招時 100% 都有連攜可循。

### 2. Playwright E2E DOM 模擬真人點擊測試引擎 V5 (`e2e-dom-synergy-audit.js`)
- 存放位置：`skills/pokemon-move-synergy-auditor/scripts/e2e-dom-synergy-audit.js`
- 自動化檢測指令：`node skills/pokemon-move-synergy-auditor/scripts/e2e-dom-synergy-audit.js`
- **實機 DOM 校驗成績**：
  - **18 單屬性寶可夢**：216 組點擊路徑（100% PASS）
  - **153 雙屬性組合**：612 組點擊路徑（100% PASS）
  - **全圖鑑 150+ 實體寶可夢 (太陽伊布、水伊布、風速狗等)**：1,206 組點擊路徑（100% PASS）
  - **總計 2,034 組路徑 DOM 點擊測試**：**0 標籤缺失 / 0 標籤錯位**。

---

## 📋 三、 核心檔案與對應路徑清單 (File Index)

| 類別 | 檔案路徑 | 說明 |
| :--- | :--- | :--- |
| **主程式 (Frontend)** | `g:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\frontend\kpi-dashboard.html` | 包含 `calculateMoveSynergyV33` 核心拓撲演算法 |
| **發布檔 (Public)** | `g:\我的云端硬盘\teacher-toolkit\public\kpi-dashboard.html` | `sync-public.ps1` 同步目標 |
| **Agent Skill** | `g:\我的云端硬盘\teacher-toolkit\skills\pokemon-move-synergy-auditor\SKILL.md` | Synergy Auditor Skill 定義檔 |
| **E2E DOM 測試腳本** | `g:\我的云端硬盘\teacher-toolkit\skills\pokemon-move-synergy-auditor\scripts\e2e-dom-synergy-audit.js` | 2,034 組 Playwright DOM 實機點擊驗證腳本 |
| **圖驗與規劃文件** | `g:\我的云端硬盘\teacher-toolkit\docs\18_attribute_and_dual_type_move_synergy_review_plan.md` | 18 屬性連攜 review 計劃書 |
| **執行計畫** | `g:\我的云端硬盘\teacher-toolkit\docs\implementation_plan_move_synergy.md` | 連攜拓撲重構執行計畫 |
| **同步腳本** | `g:\我的云端硬盘\teacher-toolkit\sync-public.ps1` | PowerShell 靜態檔同步指令 |

---

## 🚀 四、 次階段 (新對話) 任務規劃 (Next Steps for Next Agent)

在新的對話中，接手的 AI 需針對 **18 種屬性經典招式鏈條的豐富化與橫向擴展** 繼續執行：

1. **Task 1: 橫向擴充 18 屬性經典招式專屬連攜鏈**：
   - **火系**：`火花`/`蓄能焰襲` ➡️ `噴射火焰`/`火焰拳` ➡️ `閃焰衝鋒`/`大字爆` ➡️ `V熱焰`/`爆炸烈焰`。
   - **草系**：`藤鞭`/`飛葉快刀` ➡️ `終極吸取`/`木槌` ➡️ `日光束`/`瘋狂植物` ➡️ `萬物復甦`/`森林神毀滅`。
   - **電系**：`電擊`/`伏特攻擊` ➡️ `十萬伏特`/`瘋狂伏特` ➡️ `打雷`/`千雷轟頂` ➡️ `交錯雷霆毀滅`。
   - **超能/惡/鋼/龍/妖精/水/冰/毒/地/飛/蟲/岩/幽/格/一般** 依此類推。
2. **Task 2: 雙屬性寶可夢切換 Tab 時的跨屬性連攜無縫銜接**：
   - 驗證雙屬性寶可夢（如噴火龍-火/飛行、巨沼怪-水/地面、自爆磁怪-電/鋼）切換主/副屬性招式時，1 對 1 連攜無縫切換。
3. **Task 3: 執行 Playwright E2E DOM 2,034 組全自動校驗**：
   - 運行 `node skills/pokemon-move-synergy-auditor/scripts/e2e-dom-synergy-audit.js`。
   - 確認全場 **0 標籤錯位 (0 Failures)**。
4. **Task 4: Git Push 與 Firebase Hosting 發布**：
   - 執行 `sync-public.ps1` -> `git push` -> `npx firebase-tools deploy --only hosting`。

---

## 💬 五、 給接手 AI 的直接提示詞 (Copy-Paste Prompt for Next AI)

新開對話視窗時，請直接複製下方的文字貼給新 AI：

```text
請協助續接《全 18 屬性寶可夢招式連攜拓撲重構與 Agent Skill 專案》：

【背景與已完成進度】
1. 已完成全圖鑑 18 單屬性 + 153 雙屬性 + 全圖鑑寶可夢 (含太陽伊布、水伊布、皮卡丘等) 的 T1~T5 1 對 1 獨占連攜與 2,034 組 Playwright DOM 實機模擬點擊測試 (100% PASS)。
2. 已建置 Agent Skill `pokemon-move-synergy-auditor` (skills/pokemon-move-synergy-auditor/SKILL.md) 與 `e2e-dom-synergy-audit.js` 實機 DOM 自動化腳本。
3. 已修復太陽伊布 T5 程序化招式連攜索引錯位 Bug (超能力波崩滅_T1_6 -> 超能力波崩滅_T5_6 100% 對齊)。

【請讀取以下必讀交接檔】
- G:\我的云端硬盘\teacher-toolkit\CLAUDE.md
- G:\我的云端硬盘\secondbrain\teacher-toolkit\工作筆記.md
- G:\我的云端硬盘\teacher-toolkit\docs\handover_move_synergy_18_types.md
- G:\我的云端硬盘\teacher-toolkit\docs\18_attribute_and_dual_type_move_synergy_review_plan.md
- G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\frontend\kpi-dashboard.html

【本次對話執行任務】
請開始執行「18 屬性經典招式鏈條豐富化與橫向擴展 (火系、草系、電系、超能系、鋼系、龍系、妖精系等)」：
1. 請檢查 calculateMoveSynergyV33 中的 Section 2 主題鏈條，為火系 (火花/噴射火焰/閃焰衝鋒)、草系 (藤鞭/終極吸取/日光束)、超能系 (念力/精神強念) 等補齊 T1➡️T5 的專屬一對一連攜標籤。
2. 每次修改後請執行 node skills/pokemon-move-synergy-auditor/scripts/e2e-dom-synergy-audit.js 進行 2,000+ 組路徑 Playwright DOM 實機模擬點擊測試，確保 0 錯位、0 孤兒。
3. 完成後同步 sync-public.ps1、commit push 並部署至 Firebase Hosting (npx firebase-tools deploy --only hosting)。

請先確認明白交接內容，並列出第一步準備執行的屬性鏈條！
```
