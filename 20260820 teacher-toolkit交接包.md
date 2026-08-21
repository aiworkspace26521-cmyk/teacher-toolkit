以下是交接包。

## 問題一：要提供給另一個 AI agent 的資訊（共 5 層）

| 層級 | 要傳達的內容 | 來源檔案 |
|---|---|---|
| **1. 專案主軸** | teacher-toolkit 是「我的班級工具總專案」，三處同步：GDrive 工作桌 / GitHub repo / Obsidian 駕駛艙；Firebase 專案 `opencodefirebase`。含 `coordinate-hunter` 與 `learning-kpi-dashboard` 兩工具 | `CLAUDE.md`、`README.md` |
| **2. 目前進度** | 上次做到哪、下一步、待辦、踩坑紀錄 | `工作筆記.md`（最重要） |
| **3. 子專案細節** | KPI 工具的遊戲手冊、更新計畫（P3~P12+Phase4）、測試報告、分析報告 | `tools/learning-kpi-dashboard/` 下的各 md |
| **4. 程式碼現況** | git log（最近 commit 做了什麼）、工作區是否乾淨、AGENTS.md 開發規範 | repo 根目錄 + `tools/learning-kpi-dashboard/AGENTS.md` |
| **5. 工作模式約定** | 開工/收工流程、學生存取去識別化（只用座號）、commit 訊息格式 | 內建於 CLAUDE.md |

## 問題二：讓 AI agent 直接讀取的路徑

```
G:\我的云端硬盘\teacher-toolkit\CLAUDE.md                    ← 專案總覽（必讀）
G:\我的云端硬盘\teacher-toolkit\README.md                    ← 專案說明
G:\我的云端硬盘\secondbrain\teacher-toolkit\工作筆記.md      ← 進度與踩坑（必讀，484 行）
G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\AGENTS.md               ← 開發規範（必讀）
G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\GAME-MANUAL VER6.2.md   ← 最新遊戲規則
G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\backend-code-archive VER6.2.md
G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\frontend-code-archive VER6.2.md
G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\OPTIMIZATION-ROADMAP.md
G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\analysis\寶可夢招式學習機制報告.md
G:\我的云端硬盘\teacher-toolkit\tools\coordinate-hunter\（座標獵人，若有 README 一併給）
```

需注意：GitHub 端路徑用 `aiworkspace26521-cmyk/teacher-toolkit`（https://github.com/aiworkspace26521-cmyk/teacher-toolkit 可 clone），但**工作筆記不在 repo 內**（僅靠 GDrive 同步），所以從 GitHub clone 的 agent 讀不到進度，必須額外給它工作筆記路徑或內容。

---

**可直接貼給另一個 AI agent 的提示詞**：
> 請先讀這四個必讀檔：`G:\我的云端硬盘\teacher-toolkit\CLAUDE.md`、`G:\我的云端硬盘\secondbrain\teacher-toolkit\工作筆記.md`、`G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\AGENTS.md`、`G:\我的云端硬盘\teacher-toolkit\tools\learning-kpi-dashboard\GAME-MANUAL VER6.2.md`。這是一個班級工具總專案，目前重心在 KPI 工具的寶可夢招式培養系統，請從工作筆記的「上次做到哪」開始接續。

---

📂 專案：teacher-toolkit ｜ 📘 上次做到哪：08-19 兩場 Session（按鈕語意統一已部署 + 實機確認 Lv 顯示無 bug）｜ 🔧 本地 git：乾淨 ｜ 🌐 遠端：未檢查（fetch 提示） ｜ ➡️ 遺留小事：`#stPreview` innerHTML 清空（潔癖級）。要從哪個方向開始？