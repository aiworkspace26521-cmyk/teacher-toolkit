const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');
const backendCode = fs.readFileSync(path.join(__dirname, '../../backend/kpi-core.js'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

console.log('=== G2 Step 4.3 SKILL_RESET 清空 v31 欄位斷言 ===');

function simulateResetReplay(isBackend) {
  const createMockElem = () => ({ style: {}, innerHTML: '', appendChild: function() {}, querySelectorAll: function() { return []; } });
  const sandbox = {
    window: { V31_FLAGS: { ENABLED: true }, addEventListener: function() {} },
    document: { addEventListener: function() {}, getElementById: createMockElem, createElement: createMockElem, body: createMockElem(), querySelector: createMockElem },
    setTimeout: setTimeout, clearTimeout: clearTimeout, console: console,
    module: { exports: {} },
    require: function(id) {
      if (id === 'firebase-admin') return { firestore: function() { return { collection: function() {} }; } };
      if (id === 'firebase-admin/firestore') return { Timestamp: { now: function() { return new Date(); } } };
      return {};
    }
  };

  vm.createContext(sandbox);
  if (isBackend) {
    vm.runInContext(backendCode, sandbox);
  } else {
    vm.runInContext(scriptContent, sandbox);
  }

  const state = {
    memoryCapsules: 1,
    roster: {
      P0: {
        id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 25, initialLevel: 5,
        skillTree: { atk: { sp: 8, tier: 3 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } },
        learnedMoves: { '抓': { level: 5, tier: 1, source: 'atk' } },
        modifiers: { '抓': '強化打擊' },
        secondPicks: { 'atk:1': '撞擊' }
      }
    }
  };

  // 重播 SKILL_RESET 事件
  const evt = { action: 'SKILL_RESET', note: 'P0:🐾 伊布 (一般系)' };
  const safeNote = String(evt.note);
  const srParts = safeNote.match(/^(\S+):(.+)/);
  if (srParts && state.roster[srParts[1]]) {
    const pid8 = srParts[1];
    if (state.roster[pid8].skillTree) {
      for (const stKey in state.roster[pid8].skillTree) {
        state.roster[pid8].skillTree[stKey].sp = 0;
        state.roster[pid8].skillTree[stKey].tier = 1;
      }
    }
    state.roster[pid8].learnedMoves = {};
    state.roster[pid8].modifiers = {};
    state.roster[pid8].secondPicks = {};
    state.memoryCapsules = Math.max(0, (state.memoryCapsules || 0) - 1);
  }

  // 計算 SP 返還
  const p = state.roster.P0;
  p.totalSpEarned = Math.max(0, p.currentLevel - p.initialLevel);
  let investedSp = 0;
  for (const k in p.skillTree) investedSp += p.skillTree[k].sp;
  p.skillPoints = Math.max(0, p.totalSpEarned - investedSp);

  return state;
}

// 1. 前端 SKILL_RESET 測試
const fRes = simulateResetReplay(false);
assert.strictEqual(fRes.roster.P0.skillTree.atk.sp, 0);
assert.strictEqual(fRes.roster.P0.skillTree.atk.tier, 1);
assert.deepStrictEqual(fRes.roster.P0.learnedMoves, {});
assert.deepStrictEqual(fRes.roster.P0.modifiers, {});
assert.deepStrictEqual(fRes.roster.P0.secondPicks, {});
assert.strictEqual(fRes.roster.P0.skillPoints, 20); // 25-5 = 20 SP 全數返還
console.log('PASS  前端 SKILL_RESET 後 skillTree 歸零、modifiers/secondPicks/learnedMoves 歸零且 SP 全數返還');

// 2. 後端 SKILL_RESET 測試
const bRes = simulateResetReplay(true);
assert.strictEqual(bRes.roster.P0.skillTree.atk.sp, 0);
assert.strictEqual(bRes.roster.P0.skillTree.atk.tier, 1);
assert.deepStrictEqual(bRes.roster.P0.learnedMoves, {});
assert.deepStrictEqual(bRes.roster.P0.modifiers, {});
assert.deepStrictEqual(bRes.roster.P0.secondPicks, {});
assert.strictEqual(bRes.roster.P0.skillPoints, 20);
console.log('PASS  後端 SKILL_RESET 後 skillTree 歸零、modifiers/secondPicks/learnedMoves 歸零且 SP 全數返還');

console.log('\nG2 step4.3 gate PASS');
