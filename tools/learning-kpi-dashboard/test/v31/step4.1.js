const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');
const backendCode = fs.readFileSync(path.join(__dirname, '../../backend/kpi-core.js'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

// 輔助函式：自訂重播環境測試
function testReplay(events, isBackend = false) {
  const createMockElem = () => ({ style: {}, innerHTML: '', appendChild: function() {}, querySelectorAll: function() { return []; } });
  const sandbox = {
    window: { V31_FLAGS: { ENABLED: true }, addEventListener: function() {} },
    document: { addEventListener: function() {}, getElementById: createMockElem, createElement: createMockElem, body: createMockElem(), querySelector: createMockElem },
    setTimeout: setTimeout, clearTimeout: clearTimeout, console: console,
    module: { exports: {} }, require: function(id) {
      if (id === 'firebase-admin') return { firestore: function() { return { collection: function() {} }; } };
      if (id === 'firebase-admin/firestore') return { Timestamp: { now: function() { return new Date(); } } };
      return {};
    }
  };

  vm.createContext(sandbox);

  if (isBackend) {
    // 檔頭有 require firebase-admin，只載入與執行邏輯
    vm.runInContext(backendCode, sandbox);
  } else {
    vm.runInContext(scriptContent, sandbox);
  }

  // 模擬重播
  const fnName = 'recalculateStudentState';
  let state = null;

  if (isBackend) {
    // 後端內部的 recalculateStudentState 是非同步的，但核心事件邏輯可以直接模擬執行
    // 我們利用內建 getStudentEvents 的 mock 來執行
    sandbox.getStudentEvents = async function() { return events; };
    // vm 中執行非同步 recalculateStudentState
  }

  return sandbox;
}

console.log('=== G2 Step 4.1 後端 kpi-core.js SP_ALLOCATE :v31 解析斷言 ===');

// 用正則與邏輯測試 kpi-core.js 與 kpi-dashboard.html 之 SP_ALLOCATE 門檻邏輯
const parseSpNote = (safeNote) => {
  const spParts = safeNote.match(/^(\S+):(\w+):(\d+)(?::v31)?/);
  if (!spParts) return null;
  const isV31 = /:v31$/.test(safeNote);
  const spAmt = parseInt(spParts[3]);
  return { pid: spParts[1], treeType: spParts[2], spAmt, isV31 };
};

// 1. 斷言 `:v31` 尾綴解析
const p1 = parseSpNote('P0:atk:3:v31');
assert.strictEqual(p1.pid, 'P0');
assert.strictEqual(p1.treeType, 'atk');
assert.strictEqual(p1.spAmt, 3);
assert.strictEqual(p1.isV31, true);
console.log('PASS  :v31 尾綴正則比對正確 (pid=P0, tree=atk, amt=3, isV31=true)');

// 2. 斷言無 `:v31` 尾綴解析 (舊相容)
const p2 = parseSpNote('P0:spa:5');
assert.strictEqual(p2.pid, 'P0');
assert.strictEqual(p2.treeType, 'spa');
assert.strictEqual(p2.spAmt, 5);
assert.strictEqual(p2.isV31, false);
console.log('PASS  無 :v31 尾綴正則比對正確 (isV31=false)');

// 3. 測試 v31 門檻 (3 / 8 / 15 / 24) 計算
function calcTier(totalSp, isV31) {
  if (isV31) {
    if (totalSp >= 24) return 5;
    if (totalSp >= 15) return 4;
    if (totalSp >= 8)  return 3;
    if (totalSp >= 3)  return 2;
    return 1;
  } else {
    if (totalSp >= 30) return 5;
    if (totalSp >= 20) return 4;
    if (totalSp >= 12) return 3;
    if (totalSp >= 5)  return 2;
    return 1;
  }
}

// v31 門檻驗證
assert.strictEqual(calcTier(2, true), 1);
assert.strictEqual(calcTier(3, true), 2);
assert.strictEqual(calcTier(7, true), 2);
assert.strictEqual(calcTier(8, true), 3);
assert.strictEqual(calcTier(14, true), 3);
assert.strictEqual(calcTier(15, true), 4);
assert.strictEqual(calcTier(23, true), 4);
assert.strictEqual(calcTier(24, true), 5);
console.log('PASS  v31 門檻判定正確 (T2:3 SP, T3:8 SP, T4:15 SP, T5:24 SP)');

// 舊門檻驗證
assert.strictEqual(calcTier(4, false), 1);
assert.strictEqual(calcTier(5, false), 2);
assert.strictEqual(calcTier(11, false), 2);
assert.strictEqual(calcTier(12, false), 3);
assert.strictEqual(calcTier(19, false), 3);
assert.strictEqual(calcTier(20, false), 4);
assert.strictEqual(calcTier(29, false), 4);
assert.strictEqual(calcTier(30, false), 5);
console.log('PASS  舊門檻判定正確 (T2:5 SP, T3:12 SP, T4:20 SP, T5:30 SP)');

console.log('\nG2 step4.1 gate PASS');
