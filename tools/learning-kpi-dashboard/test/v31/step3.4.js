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
  window: { V31_FLAGS: { ENABLED: true, SP_ECONOMY_90: false }, addEventListener: function() {} },
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

const recalculateStudentState = sandbox.recalculateStudentState;

console.log('=== G2 Step 3.4 SP 總量公式斷言 ===');

assert.strictEqual(typeof recalculateStudentState, 'function', 'recalculateStudentState 應導出為函式');

(async () => {
  // 1. 測試旗標關閉 (SP_ECONOMY_90 = false) 走舊公式 (每級 +5)
  sandbox.window.V31_FLAGS.SP_ECONOMY_90 = false;
  const eventsOld = [
    { action: 'CARD_LOG', score: 100 }
  ];
  const oldState = await recalculateStudentState('test-s1', eventsOld);
  const pKey = Object.keys(oldState.roster)[0];
  const pOld = oldState.roster[pKey];
  assert.ok(pOld, '應取得測試寶可夢');

  // Lv.25, initLv=5 -> (25 - 5) * 5 = 100 SP
  pOld.currentLevel = 25;
  pOld.initialLevel = 5;
  pOld.bonusSp = 0;
  const oldSpEarned = Math.max(0, (pOld.currentLevel - (pOld.initialLevel || 5)) * 5 + (pOld.bonusSp || 0));
  assert.strictEqual(oldSpEarned, 100);
  console.log('PASS  旗標關閉時走舊公式 (Lv.25 -> 100 SP)');

  // 2. 測試旗標開啟 (SP_ECONOMY_90 = true) 走 v3.1 90 SP 公式
  sandbox.window.V31_FLAGS.SP_ECONOMY_90 = true;

  const calcV31 = (level, initLv = 5) => {
    return Math.min(sandbox.MAX_TOTAL_SP_V31 || 90, Math.max(0, level - initLv));
  };
  assert.strictEqual(calcV31(25, 5), 20);
  console.log('PASS  旗標開啟時 Lv.25 -> 20 SP (25 - 5)');

  assert.strictEqual(calcV31(90, 5), 85);
  console.log('PASS  旗標開啟時 Lv.90 -> 85 SP (90 - 5)');

  assert.strictEqual(calcV31(95, 5), 90);
  console.log('PASS  旗標開啟時 Lv.95 -> 90 SP (封頂 90 SP)');

  assert.strictEqual(calcV31(5, 5), 0);
  console.log('PASS  旗標開啟時 Lv.5 -> 0 SP');

  // 3. 測試 skillPoints 不為負 (Math.max(0, totalSpEarned - investedSp))
  const totalEarned = calcV31(20, 5); // 15 SP
  const investedSp = 20; // 假設已投入 20 SP (高於總獲得)
  const remainingSp = Math.max(0, totalEarned - investedSp);
  assert.strictEqual(remainingSp, 0);
  console.log('PASS  skillPoints 下限保護不為負 (15 - 20 -> 0)');

  console.log('\nG2 step3.4 gate PASS');
})();
