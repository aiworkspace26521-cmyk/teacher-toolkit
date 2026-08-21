const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');

// Extract script from htmlCode
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

const getTreeTierV31 = sandbox.window.getTreeTierV31;
const learnSkillTreeNodeV31 = sandbox.window.learnSkillTreeNodeV31;
const countPicks = sandbox.window.countPicks;
const findChoice = sandbox.window.findChoice;

console.log('=== G2 Step 3.1 配點與 6 選 1 學習斷言 ===');

// 1. 常數與門檻斷言
assert.strictEqual(typeof getTreeTierV31, 'function', 'getTreeTierV31 應導出為函式');
assert.strictEqual(typeof learnSkillTreeNodeV31, 'function', 'learnSkillTreeNodeV31 應導出為函式');

assert.strictEqual(getTreeTierV31(0), 1);
assert.strictEqual(getTreeTierV31(2), 1);
assert.strictEqual(getTreeTierV31(3), 2);
assert.strictEqual(getTreeTierV31(7), 2);
assert.strictEqual(getTreeTierV31(8), 3);
assert.strictEqual(getTreeTierV31(14), 3);
assert.strictEqual(getTreeTierV31(15), 4);
assert.strictEqual(getTreeTierV31(23), 4);
assert.strictEqual(getTreeTierV31(24), 5);
assert.strictEqual(getTreeTierV31(90), 5);
console.log('PASS  getTreeTierV31 門檻轉換 (0->1, 3->2, 8->3, 15->4, 24->5) 斷言通過');

// 2. 測試小火龍 (BIPEDAL_CLAW, TAIL) T1 首招與第 2 招學習
const charmander = {
  id: 'test-p1',
  name: '小火龍',
  rawName: '小火龍',
  baseName: '小火龍',
  primaryType: '火',
  skillPoints: 50,
  maxTreeTier: 5,
  learnedMoves: {},
  skillTree: { atk: { sp: 0, tier: 1 }, ATK: { sp: 0, tier: 1 } }
};

// T1 首招 ('撞擊') 成本應為 1
const res1 = learnSkillTreeNodeV31('撞擊', 1, 'ATK', charmander);
assert.strictEqual(res1.success, true);
assert.strictEqual(res1.cost, 1);
assert.strictEqual(res1.picks, 1);
assert.ok(charmander.learnedMoves['撞擊']);
assert.strictEqual(charmander.learnedMoves['撞擊'].level, 1);
assert.strictEqual(charmander.learnedMoves['撞擊'].tier, 1);
assert.strictEqual(charmander.skillPoints, 49);
assert.strictEqual(charmander.skillTree.atk.sp, 1);
assert.strictEqual(charmander.skillTree.atk.tier, 1);
console.log('PASS  T1 首招學招成功 (成本=1, SP=49, 樹存款=1, tier=1)');

// T1 第 2 招 ('二連踢') 成本應為 ceil(1 * 1.5) = 2
const res2 = learnSkillTreeNodeV31('二連踢', 1, 'ATK', charmander);
assert.strictEqual(res2.success, true);
assert.strictEqual(res2.cost, 2);
assert.strictEqual(res2.picks, 2);
assert.ok(charmander.learnedMoves['二連踢']);
assert.strictEqual(charmander.skillPoints, 47); // 49 - 2
assert.strictEqual(charmander.skillTree.atk.sp, 3); // 1 + 2 = 3
assert.strictEqual(charmander.skillTree.atk.tier, 2); // sp=3 跨階至 T2!
assert.strictEqual(charmander.secondPicks['ATK:T1'], 1);
console.log('PASS  T1 第 2 招學招成功 (成本=ceil(1*1.5)=2, SP=47, 樹存款=3 跨階至 T2, secondPicks 寫入)');

// 3. 測試 T2 首招與第 2 招成本 (T2 base=2, 2nd pick = ceil(2*1.5) = 3)
const res3 = learnSkillTreeNodeV31('火焰拳', 2, 'ATK', charmander);
assert.strictEqual(res3.success, true);
assert.strictEqual(res3.cost, 2);
assert.strictEqual(charmander.skillPoints, 45); // 47 - 2
assert.strictEqual(charmander.skillTree.atk.sp, 5); // 3 + 2 = 5

const res4 = learnSkillTreeNodeV31('烈焰爪', 2, 'ATK', charmander);
assert.strictEqual(res4.success, true);
assert.strictEqual(res4.cost, 3); // ceil(2 * 1.5) = 3
assert.strictEqual(charmander.skillPoints, 42); // 45 - 3
assert.strictEqual(charmander.skillTree.atk.sp, 8); // 5 + 3 = 8
assert.strictEqual(charmander.skillTree.atk.tier, 3); // sp=8 跨階至 T3!
console.log('PASS  T2 首招(2)與第 2 招(ceil(2*1.5)=3)學習成功 (SP=42, 樹存款=8 跨階至 T3)');

// 4. 生理不符測試 (小火馬試圖學火焰拳)
const ponyta = {
  id: 'test-p2',
  name: '小火馬',
  rawName: '小火馬',
  baseName: '小火馬',
  primaryType: '火',
  skillPoints: 50,
  maxTreeTier: 5,
  learnedMoves: {},
  skillTree: { atk: { sp: 0, tier: 1 } }
};
const resMismatched = learnSkillTreeNodeV31('火焰拳', 2, 'ATK', ponyta);
assert.strictEqual(resMismatched.success, false);
assert.strictEqual(resMismatched.reason, 'MORPHOLOGY_MISMATCH');
console.log('PASS  生理不符 (小火馬學火焰拳) 被拒絕 (MORPHOLOGY_MISMATCH)');

// 5. SP 不足測試
const poorPkmn = {
  id: 'test-p3',
  name: '小火龍',
  rawName: '小火龍',
  primaryType: '火',
  skillPoints: 0,
  maxTreeTier: 5,
  learnedMoves: {},
  skillTree: { atk: { sp: 0, tier: 1 } }
};
const resPoor = learnSkillTreeNodeV31('撞擊', 1, 'ATK', poorPkmn);
assert.strictEqual(resPoor.success, false);
assert.strictEqual(resPoor.reason, 'INSUFFICIENT_SP');
console.log('PASS  SP 不足被拒絕 (INSUFFICIENT_SP)');

// 6. 進化階層未解鎖測試 (maxTreeTier=1 嘗試學 T2)
const lockedPkmn = {
  id: 'test-p4',
  name: '小火龍',
  rawName: '小火龍',
  primaryType: '火',
  skillPoints: 10,
  maxTreeTier: 1,
  learnedMoves: {},
  skillTree: { atk: { sp: 0, tier: 1 } }
};
const resLocked = learnSkillTreeNodeV31('火焰拳', 2, 'ATK', lockedPkmn);
assert.strictEqual(resLocked.success, false);
assert.strictEqual(resLocked.reason, 'EVO_STAGE_LOCKED');
console.log('PASS  進化階層不足 (maxTreeTier=1 嘗試學 T2) 被拒絕 (EVO_STAGE_LOCKED)');

console.log('\nG2 step3.1 gate PASS');
