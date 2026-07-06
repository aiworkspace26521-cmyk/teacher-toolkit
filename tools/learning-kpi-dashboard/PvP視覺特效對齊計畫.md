# PvP 宿敵戰視覺特效對齊計畫

> 目標：讓宿敵戰（PvP 3v3）的招式視覺特效完全對齊路人戰（Normal Arena）
> 狀態：🎯 已確認待修復項目，待執行
> 檔案：`frontend/kpi-dashboard.html` + `public/kpi-dashboard.html`

---

## 現況摘要

上次修復已完成：
- ✅ `animateHpBarJS()` — RAF-driven HP 動畫，取代 CSS transition（方案 B）
- ✅ `_pvpSlotCache` — slot 更新 diff 比對，減少 forced layout（方案 C）
- ✅ 補上效果絕佳/效果不好/沒有效果文字（P1）
- ✅ 會心一擊統一為 `💢 會心一擊！` + 金色（P2）

**但仍有多項視覺特效未對齊，以下逐一列出。**

---

## 問題清單（依修復優先順序）

### P0 — 核心戰鬥視覺缺失（高衝擊）

#### P0-1: `spawnImpactFlash()` 不一致

| | 路人戰 | 宿敵戰 |
|---|---|---|
| 方式 | 直接呼叫 `spawnImpactFlash(defSide, tColor)` | 內嵌等義邏輯（`document.querySelector("#pvpBattle3v3 .pvp-side-panel.p2")`） |
| 位置 | 在非變化招式的攻擊分支內 | 在 `if (result.dmg > 0)` 內 |
| 效果相同 | ✅ 都是 `radial-gradient` + 定時移除 | — |

**結論：功能等價，無需修改。**

#### P0-2: 🌟 變化招式（Status Moves）特效錯誤

**問題**：
- 路人戰：變化招式只噴 `spawnCategoryParticles(..., "変化")` sparkle — 無 `sfx.hit()`、無 shake、無 flash、無 ring
- 宿敵戰：`sfx.hit()` + `shakeElement` + `flashElement` 無條件執行（lines 5196-5198），然後 `result.dmg > 0` 為 false 導致完全無粒子效果

**結果**：宿敵戰的變化招式有打擊音效+震動但沒有 sparkle 粒子。

**修復**：在 `executePvPTurn` 中，將 lines 5196-5198 的視覺特效移至「非變化招式」條件內，並為變化招式加上 `spawnCategoryParticles(..., "変化")`。

---

### P1 — 道具/特性視覺缺失（中衝擊）

#### P1-1: 🌟 Contact Damage 能力視覺（Rough Skin / Iron Barbs）

**問題**：
- `executeTurn()` 內有 damage 邏輯，但 `if (battleState)` guard 擋掉了 `spawnAbilityFlare()` 和 `showLargeText()`
- 宿敵戰沒有 `battleState`，所以 contact damage 有作用但看不到特效文字和 flare

**修復**：在 `executePvPTurn` 中，檢查 `result` 是否包含 contactDamage 資訊，若有則呼叫 `spawnAbilityFlare()` 和 `showLargeText()`。

#### P1-2: 🌟 道具特效（Shell Bell / Life Orb / Quick Claw 等）

**問題**：
- 路人戰在 `doTurn` 內大量道具視覺（`spawnItemGlow`、`animateHpBar` for heal/recoil）
- 宿敵戰的 `executePvPTurn` 完全沒有道具系統

**分析**：PvP 目前不支援道具系統。`heldItem` 在 `JSON.parse(JSON.stringify(...))` clone 後不會保留（因為 PvP 隊伍選擇時沒填 `heldItem`）。

**修復選項**：
- **選項 A**：在 PvP 隊伍選擇 UI 中增加道具選擇
- **選項 B**：保留現狀（PvP 無道具是設計決定）

**建議**：先保留現狀，待 PvP 道具系統決定後再補。

#### P1-3: 🌟 接觸攻擊道具視覺（Rocky Helmet / Weakness Policy / Eject Button）

同上，現行 PvP 沒有道具系統。

---

### P2 — 天氣/狀態視覺缺失（低衝擊 — 需設計決定）

#### P2-1: 🌤️ 天氣特效（`spawnWeatherParticles` / `sfx.weather`）

**問題**：宿敵戰完全沒有天氣系統。`calculateMovePower` 用 `battleState.weather` 但 `battleState` 在 PvP 是 `undefined`。

**影響**：晴天水系減傷、雨天火系減傷等 modifier 在 PvP 中不會觸發。

**修復選項**：
- **選項 A**：共享天氣 — PvP 雙方使用同樣的隨機天氣
- **選項 B**：PvP 不使用天氣（保留現狀）

#### P2-2: 🔥 燒傷/寄生種子傷害（`processBurnAndLeech`）

**問題**：宿敵戰沒有處理每回合的燒傷/種子傷害和對應的 HP 動畫。

**影響**：若 PvP 有狀態系統但無視覺，狀態傷害會直接扣血但無動畫。

**修復**：若 PvP 保留狀態系統，需在 `executePvPTurn` 開頭或每次 snapshot 時處理狀態傷害 + `animateHpBarJS`。

#### P2-3: 💨 天氣傷害（Sandstorm / Hail）

同 P2-1，依賴天氣系統。

---

### P3 — 小視覺不一致（低衝擊）

#### P3-1: 🎵 Status Moves 錯誤使用 `sfx.hit()`

**問題**：變化招式在宿敵戰會播打擊音效，但在路人戰不會。

**修復**：與 P0-2 一併處理。

#### P3-2: 🔄 換人進場動畫

**問題**：
- 路人戰換人時有 `entry-animation` CSS class
- 宿敵戰 `doPvPSwitch()` 只 call `sfx.entry()` 但沒加 CSS class

**修復**：`doPvPSwitch()` 內加入 `entry-animation` class。

#### P3-3: ☀️ 晴天火系 AbilityFlare ×3

**問題**：路人戰在晴天 + 火系招式時，會噴 3 個紅色 flare（`spawnAbilityFlare`）。宿敵戰無天氣系統故不會觸發。

**影響**：非常邊緣，依賴天氣系統。

#### P3-4: 🛡️ 道具防禦特效（Sturdy / Focus Sash / Tenacity）

**問題**：`executeTurn` 內的 `if (battleState)` guard 擋掉了 `spawnShieldFlash()`。

**修復**：在 `executePvPTurn` 中檢查 `result` 是否有 survive 事件。

---

## 修復方案詳細設計

### P0-2: 變化招式特效修正

**檔案**：`frontend/kpi-dashboard.html`，`executePvPTurn` 函式

**當前結構**（lines 5196-5248）：
```
sfx.hit();
shakeElement("pvpEnemySlot" + pvp3.enemyActive);
flashElement("pvpEnemySlot" + pvp3.enemyActive);
// crit + effectiveness text...

if (result.dmg > 0) {
    // 攻擊型視覺特效全部在這裡
    // impact flash, animateHpBarJS, particles, ring, category particles
}
```

**目標結構**：
```
// 先決定 move category
var mDet2 = getMoveDetails(moveName);
var isStatusMove = mDet2 && mDet2.category === "変化";

if (isStatusMove) {
    // 變化招式：只有 sparkle 粒子，無打擊感
    var ec = getElementCenter("pvpEnemySlot" + pvp3.enemyActive);
    if (ec) spawnCategoryParticles(ec.x, ec.y, tCol, "変化");
} else {
    // 攻擊招式：完整打擊特效
    sfx.hit();
    shakeElement("pvpEnemySlot" + pvp3.enemyActive);
    flashElement("pvpEnemySlot" + pvp3.enemyActive);
    // impact flash + particles + ring + category particles
}
// crit + effectiveness text...
if (result.dmg > 0) {
    animateHpBarJS("pvpEnemyBar", ...);
}
```

### P1-1: Contact Damage 視覺

**分析**：
`executeTurn()` 的 return value `result` 包含 `contactDmg`（Rough Skin/Iron Barbs 的反傷量）。目前 PvP 的 `executePvPTurn` 沒有讀取這個值。

**修復**：
在 `executePvPTurn` 的 `if (result.dmg > 0)` 區塊後，加入：
```
if (result.contactDmg && result.contactDmg > 0) {
    spawnAbilityFlare("pvpMySlot" + pvp3.myActive, "#e74c3c");
    showLargeText(" Rough Skin! ");
    animateHpBarJS("pvpMyBar", myActive.currentHp, myActive.maxHp);
}
```

⚠️ 注意：`spawnAbilityFlare` 目前寫死查 `#battleModal .modal-content`，需要改為可接受 container 參數或另外為 PvP 做一版。

### P3-2: 換人進場動畫

**檔案**：`frontend/kpi-dashboard.html`，`doPvPSwitch` 函式

**修復**：
在 `doPvPSwitch()` 的 `sfx.entry()` 之後加上：
```
var newSlot = $("pvpMySlot" + pvp3.myActive);
if (newSlot) {
    newSlot.classList.remove("entry-animation");
    void newSlot.offsetWidth;
    newSlot.classList.add("entry-animation");
}
```

### P3-4: Sturdy/Focus Sash 視覺

在 `executePvPTurn` 中，檢查 `result.survive` 或 `result.hpBoosted`：
```
if (result.hpBoosted) {
    spawnShieldFlash("pvpEnemySlot" + pvp3.enemyActive, "#2ecc71");
    showLargeText(" 挺住了！");
}
```

⚠️ 注意：`spawnShieldFlash` 也寫死查 `#battleModal .modal-content`，需改為可接受 container。

---

## 當前進度

| 項目 | 狀態 | 優先級 |
|------|------|--------|
| P0-2: 變化招式特效 | ✅ 已完成 (2026-07-06) | P0 |
| P1-1: Contact Damage 能力視覺 | ✅ 已完成 (2026-07-06) | P1 |
| P1-2: 道具特效 | ⏸️ 待 PvP 道具設計決定 | P1 |
| P1-3: 防禦道具視覺 | ⏸️ 同 P1-2 | P1 |
| P2-1: 天氣特效 | ⏸️ 待 PvP 天氣設計決定 | P2 |
| P2-2: 燒傷/種子每回合傷害 | ⏸️ 待 PvP 狀態系統確認 | P2 |
| P2-3: 天氣傷害 | ⏸️ 同 P2-1 | P2 |
| P3-1: Status sfx.hit() 誤用 | ✅ 與 P0-2 一併修復 (2026-07-06) | P3 |
| P3-2: 換人進場動畫 | ✅ 已完成 (2026-07-06) | P3 |
| P3-3: 晴天火系 Flare | ⏸️ 同 P2-1 | P3 |
| P3-4: Sturdy/Focus Sash 視覺 | ✅ 已完成 (2026-07-06) | P3 |

---

## 工具函式修改前置需求

以下兩個函式寫死 container 為 `#battleModal .modal-content`，需改為可接受參數化 container，才能在 PvP 的 `#pvpModal` 中使用：

1. **`spawnAbilityFlare(elementId, color)`** — line 2988
   → 新增 optional `containerEl` 參數

2. **`spawnShieldFlash(elementId, color)`** — line 3020
   → 新增 optional `containerEl` 參數

---

## 實際測試驗證方式

1. 以兩名學生帳號開 PvP 對戰
2. 輪流使用「物理/特殊/變化」三類招式
3. 對比路人戰的對應招式特效
4. 確認：
   - [ ] 變化招式有 sparkle 粒子
   - [ ] 物理招式有 slash + shake + hit sound
   - [ ] 特殊招式有 swirl + flash + hit sound
   - [ ] Contact Damage 有 flare + 文字
   - [ ] 換人有 entry-animation
   - [ ] Sturdy/Sash 有 shield flash

---

## 預計工時

| 階段 | 項目 | 估計 |
|------|------|------|
| Phase 1 | P0-2: 變化招式 (含 P3-1) | ~30 min |
| Phase 2 | 工具函式參數化 + P1-1 + P3-4 | ~20 min |
| Phase 3 | P3-2: 換人動畫 | ~10 min |
| | **總計** | **~60 min** |
