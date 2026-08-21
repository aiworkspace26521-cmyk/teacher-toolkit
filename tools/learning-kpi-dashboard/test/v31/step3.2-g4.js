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

console.log('=== G4 管理員實機招式升級 (Lv.1~5) 測試與稽核模擬 (Step 3.2) ===');

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

// [2] 學習 T1 招式 '抓' (cost=1)
const learnRes = sandbox.window.learnSkillTreeNodeV31('抓', 1, 'ATK');
assert.strictEqual(learnRes.success, true);
console.log('    學會 T1 招式 抓 (Lv.1, SP 90 -> 89)');

// [3] 升級 '抓' 從 Lv.1 -> Lv.5
for (let targetLv = 2; targetLv <= 5; targetLv++) {
  const upRes = sandbox.window.upgradeMoveInSkillTreeV31('抓');
  assert.strictEqual(upRes.success, true);
  assert.strictEqual(upRes.level, targetLv);
  assert.strictEqual(testPkmn.learnedMoves['抓'].level, targetLv);
  console.log(`    升級 抓 至 Lv.${targetLv} 成功 (當前 SP: ${testPkmn.skillPoints}, ATK 樹存款: ${testPkmn.skillTree.atk.sp})`);
}

console.log('\n[4] 升級後狀態檢查:');
assert.strictEqual(testPkmn.learnedMoves['抓'].level, 5);
assert.strictEqual(testPkmn.skillPoints, 85); // 90 - 1 (學招) - 4 (升級4次) = 85
assert.strictEqual(testPkmn.skillTree.atk.sp, 5); // 1 + 4 = 5
assert.strictEqual(testPkmn.skillTree.atk.tier, 2); // sp=5 >= 3 -> T2
console.log('    最終 抓 等級: Lv.5 | 剩餘 SP:', testPkmn.skillPoints, '| ATK 樹存款:', testPkmn.skillTree.atk.sp, '| 階層: T' + testPkmn.skillTree.atk.tier);

// 再升級應被封頂阻擋
const upCap = sandbox.window.upgradeMoveInSkillTreeV31('抓');
assert.strictEqual(upCap.success, false);
assert.strictEqual(upCap.reason, 'MAX_LEVEL_REACHED');
console.log('    嘗試升至 Lv.6 正確被封頂阻擋 (MAX_LEVEL_REACHED)');

console.log('\n[5] 後臺 kpi_events 事件記錄稽核:');
console.log('    共紀錄', eventsLog.length, '筆事件');
eventsLog.forEach((evt, idx) => {
  console.log(`    #${idx+1} Action: ${evt.action} | Note: ${evt.note}`);
});

// 驗證 MOVE_UPGRADE 與 SP_ALLOCATE 事件
const upgradeEvents = eventsLog.filter(e => e.action === 'MOVE_UPGRADE');
assert.strictEqual(upgradeEvents.length, 4);
assert.strictEqual(upgradeEvents[0].note, 'test-charmeleon-p0:抓:2');
assert.strictEqual(upgradeEvents[3].note, 'test-charmeleon-p0:抓:5');

// [6] 測試「回憶膠囊」 (SKILL_RESET) 狀態重置回復
console.log('\n[6] 執行回憶膠囊 SKILL_RESET 回復狀態:');
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

console.log('\nG4 step3.2 admin verification PASS');
