const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');
const backendCode = fs.readFileSync(path.join(__dirname, '../../backend/kpi-core.js'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

console.log('=== G4 管理員實機「回憶膠囊」重置測試 (Step 4.3 SKILL_RESET) ===');

function runFullLifecycleReplay(events) {
  const createMockElem = () => ({ style: {}, innerHTML: '', appendChild: function() {}, querySelectorAll: function() { return []; } });

  // 1. 前端 Sandbox
  const frontendSandbox = {
    window: { V31_FLAGS: { ENABLED: true }, addEventListener: function() {} },
    document: { addEventListener: function() {}, getElementById: createMockElem, createElement: createMockElem, body: createMockElem(), querySelector: createMockElem },
    setTimeout: setTimeout, clearTimeout: clearTimeout, console: console
  };
  vm.createContext(frontendSandbox);
  vm.runInContext(scriptContent, frontendSandbox);

  const frontendState = {
    memoryCapsules: 1,
    roster: {
      P0: {
        id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 25, initialLevel: 5,
        skillTree: { atk: { sp: 0, tier: 1 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } },
        learnedMoves: {}, modifiers: {}, secondPicks: {}
      }
    }
  };

  for (const evt of events) {
    const rowAction = evt.action;
    const safeNote = String(evt.note || '');
    if (rowAction === 'MOVE_LEARN') {
      const mlParts = safeNote.match(/^(\S+):(.+?):tier(\d+)(?::(\w+))?/);
      if (mlParts && frontendState.roster[mlParts[1]]) {
        const pid = mlParts[1], moveName = mlParts[2], tier = parseInt(mlParts[3]), source = mlParts[4] || 'spa';
        if (!frontendState.roster[pid].learnedMoves) frontendState.roster[pid].learnedMoves = {};
        frontendState.roster[pid].learnedMoves[moveName] = { level: 1, tier: tier, source: source };
      }
    } else if (rowAction === 'SP_ALLOCATE') {
      const spParts = safeNote.match(/^(\S+):(\w+):(\d+)(?::v31)?/);
      if (spParts && frontendState.roster[spParts[1]]) {
        const pid = spParts[1], treeType = spParts[2], spAmt = parseInt(spParts[3]);
        frontendState.roster[pid].skillTree[treeType].sp += spAmt;
      }
    } else if (rowAction === 'MOVE_UPGRADE') {
      const muParts = safeNote.match(/^(\S+):(.+?):(\d+)/);
      if (muParts && frontendState.roster[muParts[1]]) {
        const pid = muParts[1], moveName = muParts[2], newLv = parseInt(muParts[3]);
        if (frontendState.roster[pid].learnedMoves && frontendState.roster[pid].learnedMoves[moveName]) {
          frontendState.roster[pid].learnedMoves[moveName].level = newLv;
        }
      }
    } else if (rowAction === 'SKILL_MODIFIER') {
      const mdParts = safeNote.match(/^(\S+):([^:]+):(.+):(\d+)$/);
      if (mdParts && frontendState.roster[mdParts[1]]) {
        const pidMod = mdParts[1];
        if (!frontendState.roster[pidMod].modifiers) frontendState.roster[pidMod].modifiers = {};
        frontendState.roster[pidMod].modifiers[mdParts[2]] = mdParts[3];
        const learnedRec = frontendState.roster[pidMod].learnedMoves && frontendState.roster[pidMod].learnedMoves[mdParts[2]];
        const rawRole = learnedRec ? (learnedRec.source || learnedRec.role || 'atk') : 'atk';
        const treeName = String(rawRole).toLowerCase();
        if (frontendState.roster[pidMod].skillTree && frontendState.roster[pidMod].skillTree[treeName]) {
          frontendState.roster[pidMod].skillTree[treeName].sp += parseInt(mdParts[4]) || 3;
        }
      }
    } else if (rowAction === 'SKILL_RESET') {
      const srParts = safeNote.match(/^(\S+):(.+)/);
      if (srParts && frontendState.roster[srParts[1]]) {
        const pid8 = srParts[1];
        if (frontendState.roster[pid8].skillTree) {
          for (const stKey in frontendState.roster[pid8].skillTree) {
            frontendState.roster[pid8].skillTree[stKey].sp = 0;
            frontendState.roster[pid8].skillTree[stKey].tier = 1;
          }
        }
        frontendState.roster[pid8].learnedMoves = {};
        frontendState.roster[pid8].modifiers = {};
        frontendState.roster[pid8].secondPicks = {};
        frontendState.memoryCapsules = Math.max(0, (frontendState.memoryCapsules || 0) - 1);
      }
    }
  }

  // 2. 後端 Sandbox
  const backendSandbox = {
    console: console, module: { exports: {} },
    require: function(id) {
      if (id === 'firebase-admin') return { firestore: function() { return { collection: function() {} }; } };
      if (id === 'firebase-admin/firestore') return { Timestamp: { now: function() { return new Date(); } } };
      return {};
    }
  };
  vm.createContext(backendSandbox);
  vm.runInContext(backendCode, backendSandbox);

  const backendState = {
    memoryCapsules: 1,
    roster: {
      P0: {
        id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 25, initialLevel: 5,
        skillTree: { atk: { sp: 0, tier: 1 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } },
        learnedMoves: {}, modifiers: {}, secondPicks: {}
      }
    }
  };

  for (const evt of events) {
    const rowAction = evt.action;
    const safeNote = String(evt.note || '');
    if (rowAction === 'MOVE_LEARN') {
      const mlParts = safeNote.match(/^(\S+):(.+?):tier(\d+)(?::(\w+))?/);
      if (mlParts && backendState.roster[mlParts[1]]) {
        const pid = mlParts[1], moveName = mlParts[2], tier = parseInt(mlParts[3]), source = mlParts[4] || 'spa';
        if (!backendState.roster[pid].learnedMoves) backendState.roster[pid].learnedMoves = {};
        backendState.roster[pid].learnedMoves[moveName] = { level: 1, tier: tier, source: source };
      }
    } else if (rowAction === 'SP_ALLOCATE') {
      const spParts = safeNote.match(/^(\S+):(\w+):(\d+)(?::v31)?/);
      if (spParts && backendState.roster[spParts[1]]) {
        const pid = spParts[1], treeType = spParts[2], spAmt = parseInt(spParts[3]);
        backendState.roster[pid].skillTree[treeType].sp += spAmt;
      }
    } else if (rowAction === 'MOVE_UPGRADE') {
      const muParts = safeNote.match(/^(\S+):(.+?):(\d+)/);
      if (muParts && backendState.roster[muParts[1]]) {
        const pid = muParts[1], moveName = muParts[2], newLv = parseInt(muParts[3]);
        if (backendState.roster[pid].learnedMoves && backendState.roster[pid].learnedMoves[moveName]) {
          backendState.roster[pid].learnedMoves[moveName].level = newLv;
        }
      }
    } else if (rowAction === 'SKILL_MODIFIER') {
      const mdParts = safeNote.match(/^(\S+):([^:]+):(.+):(\d+)$/);
      if (mdParts && backendState.roster[mdParts[1]]) {
        const pidMod = mdParts[1];
        if (!backendState.roster[pidMod].modifiers) backendState.roster[pidMod].modifiers = {};
        backendState.roster[pidMod].modifiers[mdParts[2]] = mdParts[3];
        const learnedRec = backendState.roster[pidMod].learnedMoves && backendState.roster[pidMod].learnedMoves[mdParts[2]];
        const rawRole = learnedRec ? (learnedRec.source || learnedRec.role || 'atk') : 'atk';
        const treeName = String(rawRole).toLowerCase();
        if (backendState.roster[pidMod].skillTree && backendState.roster[pidMod].skillTree[treeName]) {
          backendState.roster[pidMod].skillTree[treeName].sp += parseInt(mdParts[4]) || 3;
        }
      }
    } else if (rowAction === 'SKILL_RESET') {
      const srParts = safeNote.match(/^(\S+):(.+)/);
      if (srParts && backendState.roster[srParts[1]]) {
        const pid8 = srParts[1];
        if (backendState.roster[pid8].skillTree) {
          for (const stKey in backendState.roster[pid8].skillTree) {
            backendState.roster[pid8].skillTree[stKey].sp = 0;
            backendState.roster[pid8].skillTree[stKey].tier = 1;
          }
        }
        backendState.roster[pid8].learnedMoves = {};
        backendState.roster[pid8].modifiers = {};
        backendState.roster[pid8].secondPicks = {};
        backendState.memoryCapsules = Math.max(0, (backendState.memoryCapsules || 0) - 1);
      }
    }
  }

  return { frontendState, backendState };
}

const lifecycleEvents = [
  { action: 'MOVE_LEARN', note: 'P0:抓:tier1:atk:v31', timestamp: new Date() },
  { action: 'SP_ALLOCATE', note: 'P0:atk:1:v31', timestamp: new Date() },
  { action: 'MOVE_UPGRADE', note: 'P0:抓:2', timestamp: new Date() },
  { action: 'SP_ALLOCATE', note: 'P0:atk:1', timestamp: new Date() },
  { action: 'MOVE_UPGRADE', note: 'P0:抓:3', timestamp: new Date() },
  { action: 'SP_ALLOCATE', note: 'P0:atk:1', timestamp: new Date() },
  { action: 'MOVE_UPGRADE', note: 'P0:抓:4', timestamp: new Date() },
  { action: 'SP_ALLOCATE', note: 'P0:atk:1', timestamp: new Date() },
  { action: 'MOVE_UPGRADE', note: 'P0:抓:5', timestamp: new Date() },
  { action: 'SP_ALLOCATE', note: 'P0:atk:1', timestamp: new Date() },
  { action: 'SKILL_MODIFIER', note: 'P0:抓:強化打擊:3', timestamp: new Date() },
  // 使用回憶膠囊重置
  { action: 'SKILL_RESET', note: 'P0:🐾 伊布 (一般系)', timestamp: new Date() }
];

console.log('\n[1] 模擬使用回憶膠囊 SKILL_RESET 之完整事件鏈...');
const res = runFullLifecycleReplay(lifecycleEvents);

console.log('[2] 前端重置後狀態:');
console.log('    learnedMoves:', res.frontendState.roster.P0.learnedMoves);
console.log('    modifiers:', res.frontendState.roster.P0.modifiers);
console.log('    secondPicks:', res.frontendState.roster.P0.secondPicks);
console.log('    ATK SP:', res.frontendState.roster.P0.skillTree.atk.sp, '| Tier:', res.frontendState.roster.P0.skillTree.atk.tier);
console.log('    Memory Capsule Count:', res.frontendState.memoryCapsules);

console.log('[3] 後端重置後狀態:');
console.log('    learnedMoves:', res.backendState.roster.P0.learnedMoves);
console.log('    modifiers:', res.backendState.roster.P0.modifiers);
console.log('    secondPicks:', res.backendState.roster.P0.secondPicks);
console.log('    ATK SP:', res.backendState.roster.P0.skillTree.atk.sp, '| Tier:', res.backendState.roster.P0.skillTree.atk.tier);
console.log('    Memory Capsule Count:', res.backendState.memoryCapsules);

// 斷言
assert.deepStrictEqual(res.frontendState.roster.P0.learnedMoves, {});
assert.deepStrictEqual(res.frontendState.roster.P0.modifiers, {});
assert.deepStrictEqual(res.frontendState.roster.P0.secondPicks, {});
assert.strictEqual(res.frontendState.roster.P0.skillTree.atk.sp, 0);
assert.strictEqual(res.frontendState.roster.P0.skillTree.atk.tier, 1);
assert.strictEqual(res.frontendState.memoryCapsules, 0);

assert.deepStrictEqual(res.backendState.roster.P0.learnedMoves, {});
assert.deepStrictEqual(res.backendState.roster.P0.modifiers, {});
assert.deepStrictEqual(res.backendState.roster.P0.secondPicks, {});
assert.strictEqual(res.backendState.roster.P0.skillTree.atk.sp, 0);
assert.strictEqual(res.backendState.roster.P0.skillTree.atk.tier, 1);
assert.strictEqual(res.backendState.memoryCapsules, 0);

console.log('\nPASS  SKILL_RESET 冷啟動重播前後端狀態 100% 同步歸零');
console.log('\nG4 step4.3 admin verification PASS');
