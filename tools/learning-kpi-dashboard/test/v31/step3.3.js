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

const applySkillModifierV31 = sandbox.window.applySkillModifierV31;

console.log('=== G2 Step 3.3 Lv.5 質變分支斷言 ===');

assert.strictEqual(typeof applySkillModifierV31, 'function', 'applySkillModifierV31 應導出為函式');

// 1. 測試 Lv.5 招式選擇質變分支 (扣 3 SP、樹存款 +3、tier 門檻跨階、modifiers 寫入)
// 招式 '抓' 之有效質變分支為 '強化打擊' 與 '疾速連發'
const pkmn = {
  id: 'test-p1',
  name: '小火龍',
  rawName: '小火龍',
  baseName: '小火龍',
  primaryType: '火',
  skillPoints: 10,
  maxTreeTier: 5,
  learnedMoves: {
    '抓': { level: 5, learnedAt: Date.now(), tier: 1, role: 'ATK' }
  },
  skillTree: { atk: { sp: 5, tier: 1 }, ATK: { sp: 5, tier: 1 } },
  modifiers: {}
};

const modRes = applySkillModifierV31('抓', '強化打擊', pkmn);
assert.strictEqual(modRes.success, true);
assert.strictEqual(modRes.branch, '強化打擊');
assert.strictEqual(modRes.cost, 3);
assert.strictEqual(pkmn.modifiers['抓'], '強化打擊');
assert.strictEqual(pkmn.skillPoints, 7); // 10 - 3
assert.strictEqual(pkmn.skillTree.atk.sp, 8); // 5 + 3 = 8 (rev.2 修正：質變 SP 計入樹存款!)
assert.strictEqual(pkmn.skillTree.atk.tier, 3); // sp=8 >= 8 -> 跨階至 T3!
console.log('PASS  Lv.5 招式質變解鎖成功 (SP=7, 樹存款 5->8 跨階至 T3, modifiers 寫入)');

// 2. 測試重複質變阻擋
const repeatRes = applySkillModifierV31('抓', '疾速連發', pkmn);
assert.strictEqual(repeatRes.success, false);
assert.strictEqual(repeatRes.reason, 'ALREADY_MODIFIED');
console.log('PASS  重複質變阻擋 (ALREADY_MODIFIED)');

// 3. 測試未達 Lv.5 阻擋
const lowLvPkmn = {
  id: 'test-p2',
  name: '小火龍',
  rawName: '小火龍',
  skillPoints: 10,
  learnedMoves: {
    '抓': { level: 4, learnedAt: Date.now(), tier: 1, role: 'ATK' }
  },
  skillTree: { atk: { sp: 4, tier: 1 } }
};
const lowRes = applySkillModifierV31('抓', '強化打擊', lowLvPkmn);
assert.strictEqual(lowRes.success, false);
assert.strictEqual(lowRes.reason, 'NEED_LV5');
console.log('PASS  未達 Lv.5 質變阻擋 (NEED_LV5)');

// 4. 測試無效質變分支名稱阻擋 (傳入不存在的 '會心爪')
const invalidPkmn = {
  id: 'test-p3',
  name: '小火龍',
  rawName: '小火龍',
  skillPoints: 10,
  learnedMoves: {
    '抓': { level: 5, learnedAt: Date.now(), tier: 1, role: 'ATK' }
  },
  skillTree: { atk: { sp: 5, tier: 1 } }
};
const invRes = applySkillModifierV31('抓', '會心爪', invalidPkmn);
assert.strictEqual(invRes.success, false);
assert.strictEqual(invRes.reason, 'INVALID_BRANCH');
console.log('PASS  無效質變分支名稱阻擋 (INVALID_BRANCH)');

// 5. 測試 SP 不足質變阻擋 (SP < 3)
const poorPkmn = {
  id: 'test-p4',
  name: '小火龍',
  rawName: '小火龍',
  skillPoints: 2,
  learnedMoves: {
    '抓': { level: 5, learnedAt: Date.now(), tier: 1, role: 'ATK' }
  },
  skillTree: { atk: { sp: 5, tier: 1 } }
};
const poorRes = applySkillModifierV31('抓', '強化打擊', poorPkmn);
assert.strictEqual(poorRes.success, false);
assert.strictEqual(poorRes.reason, 'INSUFFICIENT_SP');
console.log('PASS  SP 不足質變阻擋 (INSUFFICIENT_SP)');

console.log('\nG2 step3.3 gate PASS');
