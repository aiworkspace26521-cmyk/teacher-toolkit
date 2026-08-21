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
  confirm: function() { return true; },
  console: console,
  toast: function(msg) {},
  sfx: { levelup: function() {} }
};

vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);
vm.runInContext(scriptContent, sandbox);

console.log('=== G4 管理員實機戰鬥結算 Hook (getEffectiveMoveV31) 測試 (Step 3.5) ===');

// 準備測試管理員帳號與測試寶可夢
const testStudentId = 'admin-v31-test';
const testPkmn = {
  id: 'test-charmeleon-p0',
  name: '火恐龍',
  rawName: '火恐龍',
  baseName: '火恐龍',
  primaryType: '火',
  skillPoints: 90,
  maxTreeTier: 5,
  learnedMoves: {},
  skillTree: {
    atk: { sp: 0, tier: 1 },
    spa: { sp: 0, tier: 1 },
    buf: { sp: 0, tier: 1 },
    dis: { sp: 0, tier: 1 },
    ult: { sp: 0, tier: 1 }
  },
  modifiers: {}
};

sandbox.globalData = {
  studentId: testStudentId,
  roster: [testPkmn]
};
sandbox._skillTreePkmnId = testPkmn.id;

// [1] 學招 '抓' (Lv.1)
sandbox.window.learnSkillTreeNodeV31('抓', 1, 'ATK');
const moveLv1 = sandbox.window.getEffectiveMoveV31(testPkmn, '抓');
console.log('\n[1] Lv.1 抓 戰鬥出招物件:');
console.log('    Name:', moveLv1.name, '| Category:', moveLv1.category, '| Power:', moveLv1.power);
assert.strictEqual(moveLv1.power, 60);

// [2] 升級至 Lv.5
for (let lv = 2; lv <= 5; lv++) {
  sandbox.window.upgradeMoveInSkillTreeV31('抓');
}
const moveLv5 = sandbox.window.getEffectiveMoveV31(testPkmn, '抓');
console.log('\n[2] Lv.5 抓 (未質變) 戰鬥出招物件:');
console.log('    Name:', moveLv5.name, '| Power:', moveLv5.power);
assert.strictEqual(moveLv5.power, 95);

// [3] 解鎖質變分支 '強化打擊'
sandbox.window.applySkillModifierV31('抓', '強化打擊');
const moveMod = sandbox.window.getEffectiveMoveV31(testPkmn, '抓');
console.log('\n[3] Lv.5 抓 (質變【強化打擊】) 戰鬥出招物件:');
console.log('    Name:', moveMod.name, '| Power:', moveMod.power, '(95 * 1.15 = 109)');
assert.strictEqual(moveMod.power, 109);

// [4] 非 v3.1 招式 (如舊版未登錄招式) 回退驗證
const legacyMove = sandbox.window.getEffectiveMoveV31(testPkmn, '舊版未定義招式');
console.log('\n[4] 未定義招式回退測試:');
console.log('    Result:', legacyMove, '(應為 null 以走舊對戰引擎)');
assert.strictEqual(legacyMove, null);

console.log('\nG4 step3.5 admin verification PASS');
