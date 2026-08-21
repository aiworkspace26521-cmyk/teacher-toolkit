const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

const createMockElem = () => ({
  style: {},
  innerHTML: '',
  appendChild: function() {},
  querySelectorAll: function() { return []; }
});

const sandbox = {
  window: { V31_FLAGS: { ENABLED: true }, addEventListener: function() {} },
  document: {
    addEventListener: function() {},
    getElementById: function() { return createMockElem(); },
    createElement: function() { return createMockElem(); },
    body: createMockElem(),
    querySelector: function() { return createMockElem(); }
  },
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  console: console,
  toast: function(msg) {},
  sfx: { levelup: function() {} }
};

vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);
vm.runInContext(scriptContent, sandbox);
sandbox.globalData = { studentId: 'admin-test', roster: [] };

const getEffectiveMoveV31 = sandbox.window.getEffectiveMoveV31;

console.log('=== G2 Step 3.5 戰鬥結算 Hook (getEffectiveMoveV31) 斷言 ===');

assert.strictEqual(typeof getEffectiveMoveV31, 'function', 'getEffectiveMoveV31 應導出為函式');

// 1. 測試 Lv.1 / Lv.3 / Lv.5 威力成長 (抓: 60 -> 76 -> 95)
const pkmnLv1 = {
  id: 'test-p1',
  name: '小火龍',
  baseName: '小火龍',
  learnedMoves: { '抓': { level: 1 } }
};
const eff1 = getEffectiveMoveV31(pkmnLv1, '抓');
assert.strictEqual(eff1.name, '抓');
assert.strictEqual(eff1.category, 'ATK');
assert.strictEqual(eff1.power, 60);
console.log('PASS  Lv.1 招式威力對應 growth.power[0] (60)');

const pkmnLv3 = {
  id: 'test-p1',
  name: '小火龍',
  baseName: '小火龍',
  learnedMoves: { '抓': { level: 3 } }
};
const eff3 = getEffectiveMoveV31(pkmnLv3, '抓');
assert.strictEqual(eff3.power, 76);
console.log('PASS  Lv.3 招式威力對應 growth.power[2] (76)');

const pkmnLv5 = {
  id: 'test-p1',
  name: '小火龍',
  baseName: '小火龍',
  learnedMoves: { '抓': { level: 5 } }
};
const eff5 = getEffectiveMoveV31(pkmnLv5, '抓');
assert.strictEqual(eff5.power, 95);
console.log('PASS  Lv.5 招式威力對應 growth.power[4] (95)');

// 2. 測試 Lv.5 質變分支效果 (強化打擊: damageMult=1.15 -> round(95 * 1.15) = 109)
const pkmnMod1 = {
  id: 'test-p1',
  name: '小火龍',
  baseName: '小火龍',
  learnedMoves: { '抓': { level: 5 } },
  modifiers: { '抓': '強化打擊' }
};
const effMod1 = getEffectiveMoveV31(pkmnMod1, '抓');
assert.strictEqual(effMod1.power, Math.round(95 * 1.15)); // 109
console.log('PASS  質變分支【強化打擊】傷害增幅套用成功 (95 * 1.15 = 109)');

// 3. 測試 Lv.5 質變分支效果 (疾速連發: multiHit={count:2, perPower:0.6})
const pkmnMod2 = {
  id: 'test-p1',
  name: '小火龍',
  baseName: '小火龍',
  learnedMoves: { '抓': { level: 5 } },
  modifiers: { '抓': '疾速連發' }
};
const effMod2 = getEffectiveMoveV31(pkmnMod2, '抓');
assert.deepStrictEqual(JSON.parse(JSON.stringify(effMod2.multiHit)), { count: 2, perPower: 0.6 });
console.log('PASS  質變分支【疾速連發】多段攻擊參數套用成功 (multiHit: {count:2, perPower:0.6})');

// 4. 測試未定義舊招 (非 MOVE_SPECS_V31 招式) 回退 null (走舊邏輯)
const effNull = getEffectiveMoveV31(pkmnLv1, '未定義古老招式');
assert.strictEqual(effNull, null);
console.log('PASS  未定義舊招正確回退 null (走舊邏輯)');

console.log('\nG2 step3.5 gate PASS');
