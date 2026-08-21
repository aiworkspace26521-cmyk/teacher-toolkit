const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

const eventsLog = [];

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

console.log('=== G4 管理員實機 Lv.5 質變分支解鎖與稽核模擬 (Step 3.3) ===');

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
  },
  modifiers: {},
  secondPicks: {}
};

sandbox.globalData = {
  studentId: testStudentId,
  roster: [testPkmn],
  memoryCapsules: 1
};
sandbox._skillTreePkmnId = testPkmn.id;

console.log('\n[1] 初始快照紀錄:');
console.log('    SP:', testPkmn.skillPoints, '| learnedMoves:', testPkmn.learnedMoves);

// [2] 學習 T1 招式 '抓' (cost=1) 並升至 Lv.5 (cost=4)
sandbox.window.learnSkillTreeNodeV31('抓', 1, 'ATK');
for (let lv = 2; lv <= 5; lv++) {
  sandbox.window.upgradeMoveInSkillTreeV31('抓');
}
console.log('    抓 升至 Lv.5 (SP: 90 -> 85, ATK 樹存款: 5, 階層: T' + testPkmn.skillTree.atk.tier + ')');

// [3] 解鎖 Lv.5 質變分支 '強化打擊' (cost=3)
const modRes = sandbox.window.applySkillModifierV31('抓', '強化打擊');
assert.strictEqual(modRes.success, true);
assert.strictEqual(modRes.branch, '強化打擊');
assert.strictEqual(modRes.cost, 3);

console.log('\n[4] 質變解鎖後狀態檢查:');
assert.strictEqual(testPkmn.modifiers['抓'], '強化打擊');
assert.strictEqual(testPkmn.skillPoints, 82); // 85 - 3 = 82
assert.strictEqual(testPkmn.skillTree.atk.sp, 8); // 5 + 3 = 8 (rev.2 修正: 質變 SP 計入樹存款!)
assert.strictEqual(testPkmn.skillTree.atk.tier, 3); // sp=8 >= 8 -> T3!
console.log('    抓 質變分支:', testPkmn.modifiers['抓'], '| 剩餘 SP:', testPkmn.skillPoints, '| ATK 樹存款:', testPkmn.skillTree.atk.sp, '| 階層: T' + testPkmn.skillTree.atk.tier);

console.log('\n[5] 後臺 kpi_events 事件記錄稽核:');
console.log('    共紀錄', eventsLog.length, '筆事件');
eventsLog.forEach((evt, idx) => {
  console.log(`    #${idx+1} Action: ${evt.action} | Note: ${evt.note}`);
});

const modEvt = eventsLog[eventsLog.length - 1];
assert.strictEqual(modEvt.action, 'SKILL_MODIFIER');
assert.strictEqual(modEvt.note, 'test-charmeleon-p0:抓:強化打擊:3');
console.log('    質變事件 Action:', modEvt.action, '| Note:', modEvt.note);

// [6] 測試「回憶膠囊」 (SKILL_RESET) 狀態重置回復
console.log('\n[6] 執行回憶膠囊 SKILL_RESET 回復狀態:');
sandbox._skillTreeSkipConfirm = true;
sandbox.resetActiveSkillTree();

console.log('    重置後 SP:', testPkmn.skillPoints, '(恢復為 90)');
assert.strictEqual(testPkmn.skillPoints, 90);
assert.strictEqual(testPkmn.skillTree.atk.sp, 0);
assert.strictEqual(testPkmn.skillTree.atk.tier, 1);
assert.deepStrictEqual(JSON.parse(JSON.stringify(testPkmn.learnedMoves)), {});
assert.deepStrictEqual(JSON.parse(JSON.stringify(testPkmn.modifiers)), {});

const resetEvt = eventsLog[eventsLog.length - 1];
assert.strictEqual(resetEvt.action, 'SKILL_RESET');
console.log('    重置事件 Action:', resetEvt.action, '| Note:', resetEvt.note);

console.log('\nG4 step3.3 admin verification PASS');
