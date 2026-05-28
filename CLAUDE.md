# teacher-toolkit — 我的班級工具總專案

## 對話開始時請先讀
進度與最近更動都在 Obsidian：`secondbrain/teacher-toolkit/工作筆記.md`

## 工作模式
- **加新工具**：對 Claude 說「我想做一個 XXX 工具」→ Claude 會建 `tools/<工具名>/` 子資料夾、引導我跟著 EP10 影片做
- **結束工作**：對 Claude 說「**收工**」→ 自動 commit + push + 更新 Obsidian 工作筆記
- **接續工作**：對 Claude 說「讀工作筆記、告訴我上次做到哪」

## 工作桌 + 三個家
- 📋 GDrive 工作桌：`G:\我的云端硬盘\teacher-toolkit\`（自動跨電腦同步）
- 🐙 GitHub repo：`aiworkspace26521-cmyk/teacher-toolkit`（公開，網頁的家）
- 📘 Obsidian 駕駛艙：`secondbrain/teacher-toolkit/工作筆記.md`（想法的家）
- 🔥 Firebase 專案：`opencodefirebase`（Firestore + Hosting，從 `D:\20260521opencode` 沿用）

## 工具清單
- **座標獵人** (`tools/coordinate-hunter/`) — 11×11 直角座標練習遊戲，隨機 10 個隱藏座標、60 秒限時。已上線 Pages
- **學習 KPI 管理工具** (`tools/learning-kpi-dashboard/`) — Pokémon 風格遊戲化學習 KPI 系統，事件溯源 + Firestore。已從 `D:\20260521opencode` 導入，部署於 Firebase Hosting `/kpi`

## 工作注意事項
- 學生資料一律去識別化（只用座號 + 班級代號）
- commit 訊息要寫清楚做了什麼 + 為什麼
- 收工前說「收工」讓 Claude 同步三方
