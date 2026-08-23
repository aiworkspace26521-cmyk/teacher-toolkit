---
name: pokemon-move-synergy-auditor
description: 寶可夢招式技能樹全 18 屬性與雙屬性連攜圖譜稽核、一對一獨占對應校驗與孤兒招式消除專家技能。當需要審查招式連攜鏈設計、檢測 M-to-1 重覆映射、排查孤兒招式或進行拓撲對映演算法重構時觸發使用。
---

# 寶可夢招式連攜與技能樹全屬性審查專家 (Pokemon Move Synergy Auditor)

本 Skill 專用於寶可夢學習 dashboard 系統中，對 **全 18 單屬性與複合雙屬性寶可夢** 的技能樹 T1~T5 招式連攜對應（Synergy Chain）進行自動化稽核、獨占性判定與修復驗證。

---

## 🎯 觸發情境 (Trigger Scenarios)

當使用者發出以下需求時，應優先載入並執行本 Skill：
- 「審查 18 屬性招式連攜設計是否有重複或缺漏」
- 「檢查招式連攜是否符合流派專屬對應原則」
- 「排查技能樹是否有孤兒招式 (Orphan Moves)」
- 「執行全屬性連攜鏈自動化測試與驗證」

---

## 規 核心四大稽核規範 (Core Audit Rules)

### 1. 一對一流派專屬對應原則 (1-to-1 Exclusive Synergy Mapping)
- **原則**：每個 T1 基礎招式必須且僅能觸發 1 個特定的 T2/T3 核心連攜招式。
- **違規態樣**：例如 T1 `叫聲` 與 T1 `甩尾` 同時觸發 T2 `二連擊` 的 `🔗 破防連攜`（多對一 M-to-1 重疊）。
- **判定標準**：任意 2 個同軌道或跨軌道的 T1 招式，不可指向同一個 T2 招式連攜 Badge。

### 2. 零孤兒招式政策 (Zero Orphan Move Policy)
- **原則**：T2~T4 中所有的攻擊性、特攻性與戰術干擾性招式，均需有至少 1 個明確的前置 T1/T2 招式連攜鏈可對應解鎖。
- **違規態樣**：招式樹中的攻擊招式在學習前置招式後，連攜狀態恆為 `null`。
- **判定標準**：全屬性矩陣中 Orphan T2/T3 Moves 數量必須達到 **0 個**。

### 3. Gen 2~9 程序化招式動態延伸 (Gen 2~9 Procedural Synergy Inferrer)
- **原則**：不得僅依賴硬編碼 (Hardcoded Regex) 比對初代招式名。
- **機制**：針對世代 2~9 程序化生成的動態招式（例如 `鋼鐵突襲_T2_2`、`龍咆衝擊_T2_2`），須依據其前置 T1 招式的軌道 (`ATK`/`SPA`/`BUF`/`DIS`/`ULT`)、屬性與效果標籤，動態生成專屬連攜 Badge。

### 4. 雙屬性動態交叉連攜 (Dual-Type Cross-Synergy Support)
- **原則**：雙屬性寶可夢（如 嗡蝠-飛行/龍、噴火龍-火/飛行）在學習次要屬性軌道招式時，系統應能動態識察並觸發次要屬性的專屬連攜。

---

## 🛠️ 自動化工具與腳本 (Automation Scripts)

本 Skill 內建 Playwright 自動化圖譜稽核腳本，位於：
`skills/pokemon-move-synergy-auditor/scripts/audit-synergy-graph.js`

### 執行稽核指令：
```bash
node skills/pokemon-move-synergy-auditor/scripts/audit-synergy-graph.js
```

### 預期產出：
1. 終端機顯示全 18 屬性連攜統計報告。
2. 產出 `audit_report_18_types.json` 數據檔。
3. 判定 `M-to-1 Overlaps = 0` 且 `Orphan T2 Moves = 0` 始可通過。

---

## 🔄 演算法重構與修復 Workflow

1. **掃描現狀**：執行 `audit-synergy-graph.js` 獲取當前多對一與孤兒招式清單。
2. **拓撲引擎重構**：於 `kpi-dashboard.html` / `pokemon-skill-tree.js` 中更新 `calculateMoveSynergyV33`。
3. **實機 E2E 校驗**：透過 Playwright 登入 Admin 帳號，於技能樹 Modal 點擊測試解鎖狀態。
4. **發布與部署**：執行 `sync-public.ps1` 並部署至 Firebase Hosting。
