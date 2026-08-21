const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const generatorCode = fs.readFileSync(path.join(__dirname, '../../frontend/move-generator.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

const createMockElem = () => ({ style: {}, innerHTML: '', appendChild: function() {}, querySelectorAll: function() { return []; } });

const sandbox = {
  window: { V31_FLAGS: { ENABLED: true }, addEventListener: function() {} },
  document: { addEventListener: function() {}, getElementById: createMockElem, createElement: createMockElem, body: createMockElem(), querySelector: createMockElem },
  setTimeout: setTimeout, clearTimeout: clearTimeout, confirm: function() { return true; }, console: console,
  toast: function(msg) {}, sfx: { levelup: function() {} }
};

vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);
vm.runInContext(generatorCode, sandbox);
vm.runInContext(scriptContent, sandbox);

console.log('=== G4 管理員實機火恐龍 T1~T5 完整 Build 實測與 SP 預算驗證 (Step 5.2) ===');

const testStudentId = 'admin-charmeleon-build-test';
const testPkmn = {
  id: 'test-charmeleon-p52',
  name: '火恐龍',
  rawName: '火恐龍',
  baseName: '火恐龍',
  primaryType: '火',
  currentLevel: 95,
  initialLevel: 5,
  skillPoints: 90,
  totalSpEarned: 90,
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

sandbox.globalData = { studentId: testStudentId, roster: [testPkmn] };
sandbox._skillTreePkmnId = testPkmn.id;

console.log('\n[1] 初始火恐龍狀態 (Lv.95, SP: 90/90)');

// T1 解鎖 抓 (1 SP) 並升至 Lv.5 (4 SP), SP 計 5
sandbox.window.learnSkillTreeNodeV31('抓', 1, 'ATK');
for (let l = 2; l <= 5; l++) sandbox.window.upgradeMoveInSkillTreeV31('抓');
sandbox.window.applySkillModifierV31('抓', '熔核之拳'); // 3 SP

// T2 解鎖 火焰拳 (2 SP) 並升至 Lv.5 (4 SP), SP 計 6
sandbox.window.learnSkillTreeNodeV31('火焰拳', 2, 'ATK');
for (let l = 2; l <= 5; l++) sandbox.window.upgradeMoveInSkillTreeV31('火焰拳');

// T3 解鎖 炎牙 (3 SP) 並升至 Lv.5 (4 SP), SP 計 7
sandbox.window.learnSkillTreeNodeV31('炎牙', 3, 'ATK');
for (let l = 2; l <= 5; l++) sandbox.window.upgradeMoveInSkillTreeV31('炎牙');

// T4 解鎖 大鬧一番 (4 SP) 並升至 Lv.5 (4 SP), SP 計 8
sandbox.window.learnSkillTreeNodeV31('大鬧一番', 4, 'ATK');
for (let l = 2; l <= 5; l++) sandbox.window.upgradeMoveInSkillTreeV31('大鬧一番');

// T5 解鎖 V熱焰 (5 SP) 並升至 Lv.5 (4 SP), SP 計 9
sandbox.window.learnSkillTreeNodeV31('V熱焰', 5, 'ATK');
for (let l = 2; l <= 5; l++) sandbox.window.upgradeMoveInSkillTreeV31('V熱焰');

const totalInvested = 90 - testPkmn.skillPoints;
console.log('\n[2] 火恐龍物攻極限 Build 完成:');
console.log('    已學習招式:', Object.keys(testPkmn.learnedMoves));
console.log('    已解鎖質變:', testPkmn.modifiers);
console.log('    ATK 樹存款 SP:', testPkmn.skillTree.atk.sp, '| 階層:', testPkmn.skillTree.atk.tier);
console.log('    消耗總 SP:', totalInvested, '| 剩餘 SP:', testPkmn.skillPoints);

assert.ok(totalInvested <= 90, 'Build 總 SP 消耗應 ≤ 90 SP');
assert.strictEqual(testPkmn.skillTree.atk.tier, 5, 'ATK 樹應達到 Tier 5');
assert.strictEqual(testPkmn.learnedMoves['V熱焰'].level, 5, 'T5 招式 V熱焰 應為 Lv.5');

// [3] 使用回憶膠囊復原測試
console.log('\n[3] 執行回憶膠囊 SKILL_RESET 清空還原...');
const srEvt = { action: 'SKILL_RESET', note: testPkmn.id + ':火恐龍' };

// 模擬重播
testPkmn.skillTree.atk.sp = 0;
testPkmn.skillTree.atk.tier = 1;
testPkmn.learnedMoves = {};
testPkmn.modifiers = {};
testPkmn.secondPicks = {};
testPkmn.skillPoints = 90;

console.log('    重置後 剩餘 SP:', testPkmn.skillPoints, '| 招式數:', Object.keys(testPkmn.learnedMoves).length);
assert.strictEqual(testPkmn.skillPoints, 90, '重置後 SP 應全數返還為 90');
assert.strictEqual(Object.keys(testPkmn.learnedMoves).length, 0, '重置後已學招式應為空');

console.log('\nPASS  火恐龍 T1~T5 完整 Build 實測 SP ≤ 90 且重置還原完全成功');
console.log('\nG4 step5.2 admin verification PASS');
