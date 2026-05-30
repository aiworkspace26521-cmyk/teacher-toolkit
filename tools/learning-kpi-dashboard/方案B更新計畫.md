# 方案 B 更新計畫 — 學習 KPI 管理系統

> 目標：在 V3.0（現行 Firebase 版）基底上，分批移植 V10.35 完整內容，
> 最終達成 Gen1~5 完整遊戲體驗。

## 已完成（P1：核心機制）

| 階段 | 內容 | 狀態 |
|------|------|------|
| 步驟1 | Gen1 151 移植（POKEMON_TIERS + SPECIES_TYPES 補齊） | ✅ |
| 6a | 種族值系統（base stats 計算 + 進化階段權重） | ✅ |
| 6b | 技能池擴充 187 招 + type-based 招式池 + splice bug 修復 | ✅ |
| 2a-c | 道館資料入 Firestore + 管理員編輯器 + JS fallback | ✅ |
| 5a | EXP Share（學習裝置） | ✅ |
| 5b | 被動道具系統（冠軍披風/達人帶/進化奇石/護符金幣） | ✅ |
| 5c | 傳說捕捉條件（0-7/8-15/16 徽章門檻） | ✅ |
| 5d | **天氣系統**（祈雨/大晴天/冰雹/沙暴 + UI 指示器） | ✅ |

## P2：下一階段（優先順序）

### Task 5e：戰鬥動畫（高優先）
- HP 條動畫減血（setTimeout 逐步減，非瞬間跳）
- 攻擊特效閃爍（屬性顏色背景閃爍 + shake 效果）
- 效果絕佳 / 效果不好 大字提示
- 進場動畫 / 瀕死動畫
- 狀態異常視覺標示（燃燒圖示、中毒圖示等）
- TM: `updateArenaUI()` + CSS transition + `showLargeText()` 輔助函式

### Task 5f：Gen2+ 資料庫擴充（中優先）
- POKEMON_TIERS 擴充至 Gen2 城都（100 隻）
- POKEMON_SPECIES_TYPES 補齊 Gen2 雙屬性
- Gen2 傳說 / 幻獸加入（雷公/炎帝/水君/洛奇亞/鳳王/雪拉比）
- TYPE_MOVE_POOL 擴充 Gen2 新招式
- Gen3~5 依此類推（豐緣/神奧/合眾）

### 天氣強化（中優先）
- 新增天氣：揚沙（除了沙暴效果 + 岩石系特防 1.5x）
- 日照炎熱額外效果（陽光烈焰免充、光合作用回更多）
- 天氣持續回合 UI 改進（動態倒數條）

## P3：深度機制（中長期）

| 機制 | 說明 | 預估工時 |
|------|------|---------|
| 雙屬性系統 | `getPokemonType()` 回傳陣列，相剋相乘 | 2 session |
| 特性（Ability） | 簡化版（猛火HP<30% 火系1.5x、濕潤身體下雨回血等） | 3 session |
| 伊布進化後招式池刷新 | 進化後 getPokemonMoveset 正確反應新型態 | 1 session |
| 戰鬥道具寫回 Firestore | 藥水/糖果消耗後寫入 DB，非僅前端記憶體 | 1 session |
| 攜帶道具擴充 | 先制之爪、焦點鏡、貝殼之鈴等 | 1 session |
| PvP 配對強化 | 等級匹配、隨機對手池 | 1 session |

## 測試策略

### 立即測試（單次 Playwright）
1. 載入頁面 → 確認 0 JS errors
2. 選擇 Neil → 確認資料載入 + 按鈕啟用
3. 走路人戰 → 確認戰鬥 modal 開啟
4. 用天氣招 → 確認 UI 指示器顯示 + 傷害加成
5. 天氣持續 5 回合 → 確認倒數歸零消失

### 長期驗證
- 每月 deploy 前跑一次完整 Playwright 劇本
- 手動驗證道館挑戰 + 捕捉流程
- 留意 Firestore read quota（查詢次數）

## 已知 Bug
- [已修] `calculateMovePower()` 與 `updatePreview()` 各多一個 `}` → SyntaxError
- [已修] `getRegionInfo()` 後懸浮 `symbols: badgeSymbols` 死碼 → SyntaxError
- [未修] `getPokemonType()` 只取第一組括號，無法處理雙屬性（如妙蛙花「草/毒」）
- [未修] 戰中道具消耗未寫入 Firestore

## 部署 SOP
1. 改 `tools/learning-kpi-dashboard/frontend/kpi-dashboard.html`
2. `Copy-Item` 到 `public/kpi-dashboard.html`
3. 砍 `.firebase` cache 資料夾
4. `touch` 檔案（更新 mtime）
5. `firebase deploy --only hosting`
6. 瀏覽器硬刷新驗證
