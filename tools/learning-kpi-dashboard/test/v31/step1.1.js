// v3.1 Step 1.1 G2: assert SP economy constants exist with spec values,
// and legacy constants (TIER_SP_COST / TIER_SP_THRESHOLD / MAX_MOVE_LEVEL) are retained.
// Loads pokemon-skill-tree.js via vm with a shared window sandbox (faithful module load).
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const src = path.join(__dirname, '..', '..', 'frontend', 'pokemon-skill-tree.js');
const code = fs.readFileSync(src, 'utf8');

const sandbox = { console, Math, JSON, Date, parseInt, parseFloat, isNaN, isFinite, Array, Object, String, Number, RegExp };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'pokemon-skill-tree.js' });

// 序列化至主 realm 後以 deepStrictEqual 比對（vm realm prototype 差異不影響值）
const plain = (v) => JSON.parse(JSON.stringify(v));

// — 新增（v3.1）常數 — 值 === 白皮書規格
assert.deepStrictEqual(plain(sandbox.TIER_SP_COST_V31), { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }, 'TIER_SP_COST_V31 值不符規格');
assert.deepStrictEqual(plain(sandbox.TIER_SP_THRESHOLD_V31), { 1: 0, 2: 3, 3: 8, 4: 15, 5: 24 }, 'TIER_SP_THRESHOLD_V31 值不符規格');
assert.deepStrictEqual(plain(sandbox.MAX_MOVE_LEVEL_V31), { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 }, 'MAX_MOVE_LEVEL_V31 未全為 5');
assert.strictEqual(sandbox.MODIFIER_SP_COST, 3, 'MODIFIER_SP_COST 應為 3');
assert.strictEqual(sandbox.SECOND_PICK_MULT, 1.5, 'SECOND_PICK_MULT 應為 1.5');
assert.strictEqual(sandbox.MAX_TOTAL_SP_V31, 90, 'MAX_TOTAL_SP_V31 應為 90');

console.log('PASS  TIER_SP_COST_V31     =', JSON.stringify(sandbox.TIER_SP_COST_V31));
console.log('PASS  TIER_SP_THRESHOLD_V31 =', JSON.stringify(sandbox.TIER_SP_THRESHOLD_V31));
console.log('PASS  MAX_MOVE_LEVEL_V31   =', JSON.stringify(sandbox.MAX_MOVE_LEVEL_V31));
console.log('PASS  MODIFIER_SP_COST     =', sandbox.MODIFIER_SP_COST);
console.log('PASS  SECOND_PICK_MULT     =', sandbox.SECOND_PICK_MULT);
console.log('PASS  MAX_TOTAL_SP_V31     =', sandbox.MAX_TOTAL_SP_V31);

// — 舊常數未刪 — 可例行讀取供回滾
// TIER_SP_COST / TIER_SP_THRESHOLD 已匯出至 window；MAX_MOVE_LEVEL 僅經由 getMaxMoveLevel() 讀取（未匯出）
assert.ok(sandbox.TIER_SP_COST && sandbox.TIER_SP_COST[5] === 30, '舊 TIER_SP_COST 應仍存在');
assert.ok(sandbox.TIER_SP_THRESHOLD && sandbox.TIER_SP_THRESHOLD[5] === 30, '舊 TIER_SP_THRESHOLD 應仍存在');
assert.ok(/var MAX_MOVE_LEVEL\s*=/.test(code), '舊 MAX_MOVE_LEVEL 宣告應仍存在於原始碼');
assert.strictEqual(sandbox.getMaxMoveLevel(1), 10, 'getMaxMoveLevel(1) 應回 10（舊 MAX_MOVE_LEVEL 未刪）');
console.log('PASS  舊 TIER_SP_COST / TIER_SP_THRESHOLD / MAX_MOVE_LEVEL 仍存在（供回滾）');

console.log('\nG2 step1.1 gate PASS');
process.exit(0);