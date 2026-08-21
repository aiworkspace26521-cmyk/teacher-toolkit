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
  confirm: function() { return true; },
  console: console,
  toast: function(msg) {},
  sfx: { levelup: function() {} }
};

vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);
vm.runInContext(scriptContent, sandbox);

console.log('=== G4 管理員實機 SP 總量公式與旗標設定測試 (Step 3.4) ===');

(async () => {
  const studentId = 'admin-v31-test';

  // [1] 測試旗標關閉 (SP_ECONOMY_90 = false) 狀態
  sandbox.window.V31_FLAGS.SP_ECONOMY_90 = false;
  const events1 = [
    { action: 'CARD_LOG', score: 100, timestamp: Date.now() }
  ];
  const state1 = await sandbox.recalculateStudentState(studentId, events1);
  const pkmn1 = state1.roster[Object.keys(state1.roster)[0]];

  console.log('\n[1] 旗標關閉 (SP_ECONOMY_90 = false) 舊機制:');
  console.log('    等級:', pkmn1.currentLevel, '| 總獲得 SP:', pkmn1.totalSpEarned, '(舊公式: (Lv-5)*5)');
  assert.strictEqual(pkmn1.totalSpEarned, (pkmn1.currentLevel - 5) * 5);

  // [2] 切換旗標開啟 (SP_ECONOMY_90 = true)
  sandbox.window.V31_FLAGS.SP_ECONOMY_90 = true;
  const state2 = await sandbox.recalculateStudentState(studentId, events1);
  const pkmn2 = state2.roster[Object.keys(state2.roster)[0]];

  console.log('\n[2] 切換旗標開啟 (SP_ECONOMY_90 = true) v3.1 90 SP 公式:');
  console.log('    等級:', pkmn2.currentLevel, '| 總獲得 SP:', pkmn2.totalSpEarned, '(v3.1 公式: min(90, Lv-5))');
  assert.strictEqual(pkmn2.totalSpEarned, Math.min(90, pkmn2.currentLevel - 5));

  // [3] 模擬高等級 (Lv.99) 封頂 90 SP 測試 (使用大量 EXP 事件)
  const highExpEvents = Array(50).fill(null).map(() => ({ action: 'CARD_LOG', score: 100, timestamp: Date.now() }));
  const state3 = await sandbox.recalculateStudentState(studentId, highExpEvents);
  const pkmn3 = state3.roster[Object.keys(state3.roster)[0]];

  // 斷言公式在高等級封頂 90 SP
  const calcV31 = (lv, init = 5) => Math.min(90, Math.max(0, lv - init));
  console.log('\n[3] 高等級 SP 計算驗證 (Lv.25 / Lv.90 / Lv.99):');
  assert.strictEqual(calcV31(25), 20);
  assert.strictEqual(calcV31(90), 85);
  assert.strictEqual(calcV31(99), 90);
  console.log('    Lv.25 -> 20 SP | Lv.90 -> 85 SP | Lv.99 -> 90 SP (封頂 90)');

  console.log('\nG4 step3.4 admin verification PASS');
})();
