const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

const mockElement = {
  style: {},
  innerHTML: '',
  appendChild: function() {},
  querySelectorAll: function() { return []; }
};

const sandbox = {
  window: { V31_FLAGS: { ENABLED: true }, addEventListener: function() {} },
  document: {
    addEventListener: function() {},
    getElementById: function() { return mockElement; },
    createElement: function() { return mockElement; },
    body: mockElement,
    querySelector: function() { return mockElement; }
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

const upgradeMoveInSkillTreeV31 = sandbox.window.upgradeMoveInSkillTreeV31;

console.log('=== G2 Step 3.2 升級統一 Lv.1~5 斷言 ===');

assert.strictEqual(typeof upgradeMoveInSkillTreeV31, 'function', 'upgradeMoveInSkillTreeV31 應導出為函式');

// 1. 測試 Lv.1 -> Lv.5 逐級升級與 SP/樹存款/tier 跳動
const pkmn = {
  id: 'test-p1',
  name: '小火龍',
  rawName: '小火龍',
  baseName: '小火龍',
  primaryType: '火',
  skillPoints: 10,
  maxTreeTier: 5,
  learnedMoves: {
    '撞擊': { level: 1, learnedAt: Date.now(), tier: 1, role: 'ATK' }
  },
  skillTree: { atk: { sp: 1, tier: 1 }, ATK: { sp: 1, tier: 1 } }
};

// 升至 Lv.2 (SP: 10->9, spDeposit: 1->2, tier: 1)
const up1 = upgradeMoveInSkillTreeV31('撞擊', pkmn);
assert.strictEqual(up1.success, true);
assert.strictEqual(up1.level, 2);
assert.strictEqual(pkmn.skillPoints, 9);
assert.strictEqual(pkmn.skillTree.atk.sp, 2);
assert.strictEqual(pkmn.skillTree.atk.tier, 1);

// 升至 Lv.3 (SP: 9->8, spDeposit: 2->3, tier: 2 [sp=3 跨階至 T2!])
const up2 = upgradeMoveInSkillTreeV31('撞擊', pkmn);
assert.strictEqual(up2.success, true);
assert.strictEqual(up2.level, 3);
assert.strictEqual(pkmn.skillPoints, 8);
assert.strictEqual(pkmn.skillTree.atk.sp, 3);
assert.strictEqual(pkmn.skillTree.atk.tier, 2);
console.log('PASS  升級至 Lv.3 成功 (SP=8, 樹存款=3 跨階至 T2)');

// 升至 Lv.4 (SP: 8->7, spDeposit: 3->4)
const up3 = upgradeMoveInSkillTreeV31('撞擊', pkmn);
assert.strictEqual(up3.success, true);
assert.strictEqual(up3.level, 4);

// 升至 Lv.5 (SP: 7->6, spDeposit: 4->5)
const up4 = upgradeMoveInSkillTreeV31('撞擊', pkmn);
assert.strictEqual(up4.success, true);
assert.strictEqual(up4.level, 5);
assert.strictEqual(pkmn.skillPoints, 6);
assert.strictEqual(pkmn.skillTree.atk.sp, 5);
console.log('PASS  升級至 Lv.5 成功 (SP=6, 樹存款=5)');

// 2. 測試達 Lv.5 封頂阻擋
const upMax = upgradeMoveInSkillTreeV31('撞擊', pkmn);
assert.strictEqual(upMax.success, false);
assert.strictEqual(upMax.reason, 'MAX_LEVEL_REACHED');
console.log('PASS  已達 Lv.5 最高等級阻擋 (MAX_LEVEL_REACHED)');

// 3. 測試 TM 招式不可升級
const tmPkmn = {
  id: 'test-p2',
  name: '小火龍',
  rawName: '小火龍',
  skillPoints: 10,
  tmMoves: ['噴射火焰'],
  learnedMoves: {
    '噴射火焰': { level: 1, learnedAt: Date.now(), tier: 3, role: 'SPA' }
  },
  skillTree: { spa: { sp: 0, tier: 1 } }
};
const upTm = upgradeMoveInSkillTreeV31('噴射火焰', tmPkmn);
assert.strictEqual(upTm.success, false);
assert.strictEqual(upTm.reason, 'TM_MOVE_CANNOT_UPGRADE');
console.log('PASS  TM 招式無法升級阻擋 (TM_MOVE_CANNOT_UPGRADE)');

// 4. 測試 SP 不足阻擋
const poorPkmn = {
  id: 'test-p3',
  name: '小火龍',
  rawName: '小火龍',
  skillPoints: 0,
  learnedMoves: {
    '撞擊': { level: 1, learnedAt: Date.now(), tier: 1, role: 'ATK' }
  },
  skillTree: { atk: { sp: 1, tier: 1 } }
};
const upPoor = upgradeMoveInSkillTreeV31('撞擊', poorPkmn);
assert.strictEqual(upPoor.success, false);
assert.strictEqual(upPoor.reason, 'INSUFFICIENT_SP');
console.log('PASS  SP 不足升級阻擋 (INSUFFICIENT_SP)');

console.log('\nG2 step3.2 gate PASS');
