# 學習 KPI 管理工具 — 開發藍圖

## 工具概述
將寶可夢遊戲化架構重新建構為學習 KPI 管理系統，
保留 gamification 核心（等級、經驗值、成就）但以「學習數據驅動」取代「戰鬥模擬」。

## 對比分析：寶可夢 vs 學習 KPI

| 寶可夢元素 | KPI 系統對應 | 優化方案 |
|-----------|-------------|---------|
| 訓練家等級 | 學生學習等級 | Firestore 持久化 + 前端 replay 計算 |
| 寶可夢捕捉 | 任務完成收集 | 分離靜態任務模板與動態日誌 |
| 道館徽章 | 週/月 KPI 達成 | 前端根據事件回放自動計算 |
| 戰鬥經驗 | 學習時數/題數 EXP | Firestore 規則防篡改 + 前端 replay |
| 道具商城 | 獎勵兌換 | Firestore 直接寫入 (無需 Transaction) |
| 屬性相剋 | 科目權重分配 | 動態可配置科目系統 |

## 資料架構

```
events/{eventId}          → 事件溯源（不可變日誌）
students/{studentId}      → 學生當前狀態（由事件計算）
subjects/{subjectId}      → 科目定義（任務模板）
achievements/{achievementId} → 成就/徽章記錄
```

## 開發紀錄

| 日期 | 變更 | 狀態 |
|------|------|------|
| 2026-05-27 | 初始化 KPI 工具 | ✅ |

## 安全規則
- `kpi_events`：僅可新增+讀取，不可修改/刪除
- `kpi_students`：學生可讀寫 own data (studentId == studentId)
- `kpi_subjects`：公開唯讀
