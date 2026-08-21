const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

const eventsLog = [];

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
  confirm: function() { return true; },
  console: console,
  toast: function(msg) { console.log('[Toast]', msg); },
  sfx: { levelup: function() {} }
};

vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);
vm.runInContext(scriptContent, sandbox);

// Intercept saveEventToFirestore after HTML script runs
sandbox.saveEventToFirestore = function(evt) {
  eventsLog.push(evt);
};

console.log('=== G4 管理員實機加點測試與稽核模擬 (Step 3.1) ===');

// 準備測試管理員帳號與測試寶可夢 (去識別化: admin-v31-test, 火恐龍)
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
  }
};

sandbox.globalData = {
  studentId: testStudentId,
  roster: [testPkmn],
  memoryCapsules: 1
};
sandbox._skillTreePkmnId = testPkmn.id;

console.log('\n[1] 初始快照紀錄:');
console.log('    SP:', testPkmn.skillPoints, '| learnedMoves:', testPkmn.learnedMoves);

// [2] 實際進行 T1~T3 招式學習操作
// T1 首招: 抓 (cost=1)
const step1 = sandbox.window.learnSkillTreeNodeV31('抓', 1, 'ATK');
assert.strictEqual(step1.success, true);
assert.strictEqual(step1.cost, 1);

// T1 第 2 招: 二連踢 (cost=ceil(1*1.5)=2)
const step2 = sandbox.window.learnSkillTreeNodeV31('二連踢', 1, 'ATK');
assert.strictEqual(step2.success, true);
assert.strictEqual(step2.cost, 2);

// T2 首招: 火焰拳 (cost=2)
const step3 = sandbox.window.learnSkillTreeNodeV31('火焰拳', 2, 'ATK');
assert.strictEqual(step3.success, true);
assert.strictEqual(step3.cost, 2);

// T2 第 2 招: 烈焰爪 (cost=ceil(2*1.5)=3)
const step4 = sandbox.window.learnSkillTreeNodeV31('烈焰爪', 2, 'ATK');
assert.strictEqual(step4.success, true);
assert.strictEqual(step4.cost, 3);

// T3 首招: 炎牙 (cost=3)
const step5 = sandbox.window.learnSkillTreeNodeV31('炎牙', 3, 'ATK');
assert.strictEqual(step5.success, true);
assert.strictEqual(step5.cost, 3);

console.log('\n[3] 加點後狀態檢查:');
console.log('    剩餘 SP:', testPkmn.skillPoints, '(原 90 -> 扣 1+2+2+3+3 = 11 -> 79)');
assert.strictEqual(testPkmn.skillPoints, 79);
assert.strictEqual(testPkmn.skillTree.atk.sp, 11);
assert.strictEqual(testPkmn.skillTree.atk.tier, 3); // sp=11 >= 8 -> T3
console.log('    ATK 樹存款:', testPkmn.skillTree.atk.sp, '| 當前階層: T' + testPkmn.skillTree.atk.tier);

console.log('\n[4] 後臺 kpi_events 事件記錄稽核:');
console.log('    共紀錄', eventsLog.length, '筆事件');
eventsLog.forEach((evt, idx) => {
  console.log(`    #${idx+1} Action: ${evt.action} | Note: ${evt.note}`);
  assert.ok(evt.note.includes(':v31'), 'v3.1 事件 Note 應包含 :v31 標籤');
});

// [5] 測試「回憶膠囊」 (SKILL_RESET) 狀態重置回復
console.log('\n[5] 執行回憶膠囊 SKILL_RESET 回復狀態:');
sandbox._skillTreeSkipConfirm = true;
sandbox.resetActiveSkillTree();

console.log('    重置後 SP:', testPkmn.skillPoints, '(恢復為 90)');
assert.strictEqual(testPkmn.skillPoints, 90);
assert.strictEqual(testPkmn.skillTree.atk.sp, 0);
assert.strictEqual(testPkmn.skillTree.atk.tier, 1);
assert.deepStrictEqual(JSON.parse(JSON.stringify(testPkmn.learnedMoves)), {});

const resetEvt = eventsLog[eventsLog.length - 1];
assert.strictEqual(resetEvt.action, 'SKILL_RESET');
console.log('    重置事件 Action:', resetEvt.action, '| Note:', resetEvt.note);

console.log('\nG4 step3.1 admin verification PASS');
