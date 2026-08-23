# 📘 全 18 屬性寶可夢招式連攜拓撲重構與 Agent Skill 專案交接文件

> **文件版本**：v3.3  
> **交接日期**：2026-08-23  
> **專案名稱**：Teacher-Toolkit (Learning KPI Dashboard - Pokemon Move Synergy Topology)  
> **線上發布 URL**：https://opencodefirebase.web.app  
> **存放路徑**：`g:\我的云端硬盘\teacher-toolkit\docs\handover_move_synergy_18_types.md`

---

## 📌 一、 專案背景與整體架構 (Context & Architecture)

本專案旨在解決 **Learning KPI Dashboard (v3.1~v3.3 招式學習與技能樹系統)** 中，寶可夢技能樹選招時所面臨的連攜發放品質問題。

### 核心原則 (Core Architectural Rules)
1. **1 對 1 獨占連攜 (Fan-Out == 1)**：
   - 玩家學習任何前置招式時，在下一階層 **有且僅有 1 個** 獨占連攜招式點亮。
   - 徹底杜絕多招式重複顯示相同連攜標籤（如 T2 4 個招式同時顯示 `🔗 水之波動·流派共鳴` 的多發放問題）。
2. **孤兒招式零容忍 (Orphans == 0)**：
   - 全圖鑑任何寶可夢（18 種單屬性、153 種雙屬性組合、150+ 隻圖鑑寶可夢），從 T1 ➡️ T2 ➡️ T3 ➡️ T4 ➡️ T5 漸進選招時，攻擊/特攻/狀態軌道 **絕無無連攜孤兒步驟**。
3. **防禦輔助招式靜音 (Defensive Silence)**：
   - 防禦與生存招式（`守住`、`替身`、`充電`、`變硬`、`影子分身`、`哈欠`、`光牆`、`水流環`、`絕對防禦`、`溶化`、`睡覺`）保證不彈出攻擊性連攜，維護介面乾淨。

---

## 🏆 二、 已完成核心工程成果 (Accomplished Milestones)

### 1. 演算法重構 (`calculateMoveSynergyV33`)
- **硬編碼主題鏈條補全**：
  - **皮卡丘 (電系)**：`叫聲` (T1) ➡️ `二連擊` (T2) ➡️ `電磁波` (T3) ➡️ `黑霧`/`電氣場地` (T4)。
  - **水伊布 (水系鏈條 A)**：`水之波動` (T1) ➡️ `水流噴射` (T2) ➡️ `攀瀑`/`濁流` (T3) ➡️ `水炮` (T4) ➡️ `起源波動` (T5)。
  - **水伊布 (水系鏈條 B)**：`泡泡`/`水槍` (T1) ➡️ `泡沫光線` (T2) ➡️ `水之誓約` (T3) ➡️ `水炮` (T4) ➡️ `蒸氣爆炸` (T5)。
- **萬能拓撲保底引擎 (Universal 1-to-1 Stream Matcher Engine)**：
  - 若招式不在硬編碼主題鏈中，自動解析當前寶可夢屬性（支援單屬性與雙屬性 `primaryType`）在 `TIER_MATRIX_V31` 中該軌道的有效首招 (`firstTarget`)，實施嚴格 1 對 1 獨占匹配。

### 2. Agent Skill 建置 (`pokemon-move-synergy-auditor`)
- 存放位置：`skills/pokemon-move-synergy-auditor/`
- 自動化檢測指令：`node skills/pokemon-move-synergy-auditor/scripts/audit-synergy-graph.js`
- **校驗範圍**：
  - 18 種單屬性技能樹
  - 153 種雙屬性組合技能樹
  - 全圖鑑 150+ 隻真實寶可夢
  - 總計 **171 棵技能樹** 從 T1 ➡️ T5 漸進式選招全路徑防護校驗。

### 3. Playwright DOM 實機自動化測試腳本
- `test/v31/verify-vaporeon-synergy-ui-dom.js`：水伊布 T3 `攀瀑`/`濁流` DOM 檢測 (PASS)。
- `test/v31/verify-vaporeon-t2-single-badge.js`：水伊布 T1 `水之波動` ➡️ T2 `水流噴射` 獨占 DOM 檢測 (PASS)。
- `test/v31/verify-vaporeon-bubble-single-badge.js`：水伊布 T1 `泡泡` ➡️ T2 `泡沫光線` 獨占 DOM 檢測 (PASS)。
- `test/v31/verify-vaporeon-t4-single-badge.js`：水伊布 T3 `水之誓約` ➡️ T4 `水炮` 獨占 DOM 檢測 (PASS)。

---

## 📋 三、 核心檔案與對應路徑清單 (File Index)

| 類別 | 檔案路徑 | 說明 |
| :--- | :--- | :--- |
| **主程式 (Frontend)** | `g:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\frontend\kpi-dashboard.html` | 包含 `calculateMoveSynergyV33` 核心拓撲演算法 |
| **發布檔 (Public)** | `g:\我的云端硬盘\teacher-toolkit\public\kpi-dashboard.html` | `sync-public.ps1` 同步目標 |
| **Agent Skill** | `g:\我的云端硬盘\teacher-toolkit\skills\pokemon-move-synergy-auditor\SKILL.md` | Synergy Auditor Skill 定義檔 |
| **稽核腳本** | `g:\我的云端硬盘\teacher-toolkit\skills\pokemon-move-synergy-auditor\scripts\audit-synergy-graph.js` | 171 棵技能樹 Playwright 稽核腳本 |
| **DOM 測試腳本** | `g:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\test\v31\verify-vaporeon-*.js` | 水伊布 T2/T3/T4 實機 DOM 校驗腳本 |
| **規劃文件** | `g:\我的云端硬盘\teacher-toolkit\docs\18_attribute_and_dual_type_move_synergy_review_plan.md` | 18 屬性連攜 review 計劃書 |
| **執行計畫** | `g:\我的云端硬盘\teacher-toolkit\docs\implementation_plan_move_synergy.md` | 連攜拓撲重構執行計畫 |
| **同步腳本** | `g:\我的云端硬盘\teacher-toolkit\sync-public.ps1` | PowerShell 靜態檔同步指令 |

---

## 🚀 四、 次階段 (新對話) 任務規劃 (Next Steps for Next Agent)

在新的對話中，接手的 AI 需針對 **其餘 17 種屬性 (火、草、電、超能、惡、鋼、龍、妖精、飛行、地面、岩石、冰、蟲、幽靈、毒、格鬥、一般)** 的經典名招式鏈條進行豐富化與橫向擴展：

1. **Task 1: 橫向擴充其餘 17 屬性經典招式專屬連攜鏈**：
   - **火系**：`火花`/`蓄能焰襲` ➡️ `噴射火焰`/`火焰拳` ➡️ `閃焰衝鋒`/`大字爆` ➡️ `V熱焰`/`爆炸烈焰`。
   - **草系**：`藤鞭`/`飛葉快刀` ➡️ `終極吸取`/`木槌` ➡️ `日光束`/`瘋狂植物` ➡️ `萬物復甦`/`森林神毀滅`。
   - **電系**：`電擊`/`伏特攻擊` ➡️ `十萬伏特`/`瘋狂伏特` ➡️ `打雷`/`千雷轟頂` ➡️ `交錯雷霆毀滅`。
   - **超能/惡/鋼/龍/妖精** 等系依此類推。
2. **Task 2: 雙屬性寶可夢跨屬性流派融合驗證**：
   - 驗證雙屬性寶可夢（如噴火龍-火/飛行、巨沼怪-水/地面、自爆磁怪-電/鋼）切換主/副屬性招式時，1 對 1 連攜無縫切換。
3. **Task 3: 執行 171 棵技能樹全自動校驗**：
   - 運行 `node skills/pokemon-move-synergy-auditor/scripts/audit-synergy-graph.js`。
   - 確認全場 **Orphans == 0** 且 **Over-coverage == 0**。
4. **Task 4: Git Push 與 Firebase Hosting 發布**：
   - 執行 `sync-public.ps1` -> `git push` -> `npx firebase-tools deploy --only hosting`。

---

## 💬 五、 給接手 AI 的直接提示詞 (Copy-Paste Prompt for Next AI)

新開對話視窗時，請直接複製下方的文字貼給新 AI：

```text
請協助續接《全 18 屬性寶可夢招式連攜拓撲重構與 Agent Skill 專案》：

【背景與已完成進度】
1. 已完成皮卡丘與水伊布 (水系) 的 T1~T5 1 對 1 獨占連攜鏈重構與 100% Playwright DOM 驗證。
2. 已建立 Agent Skill `pokemon-move-synergy-auditor` (skills/pokemon-move-synergy-auditor/SKILL.md) 支援 171 棵技能樹稽核。
3. 已導入「萬能 1 對 1 拓撲保底引擎 (Universal 1-to-1 Stream Matcher Engine)」。

【請讀取以下必讀交接檔】
- g:\我的云端硬盘\teacher-toolkit\docs\handover_move_synergy_18_types.md
- g:\我的云端硬盘\teacher-toolkit\docs\18_attribute_and_dual_type_move_synergy_review_plan.md
- g:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\frontend\kpi-dashboard.html

【本次對話執行任務】
請開始執行「18 屬性經典招式鏈條橫向擴展 (火系、草系、電系、超能系、鋼系、龍系、妖精系等)」：
1. 請檢查 calculateMoveSynergyV33 中的 Section 2 主題鏈條，為火系 (火花/噴射火焰/閃焰衝鋒)、草系 (藤鞭/終極吸取/日光束)、超能系 (念力/精神強念) 等補齊 T1➡️T5 的專屬一對一連攜標籤。
2. 每次修改後請執行 node skills/pokemon-move-synergy-auditor/scripts/audit-synergy-graph.js 進行 171 棵技能樹無孤兒、無重複發放檢測。
3. 完成後同步 sync-public.ps1、commit push 並部署至 Firebase Hosting (npx firebase-tools deploy --only hosting)。

請先確認明白交接內容，並列出第一步準備執行的屬性鏈條！
```
