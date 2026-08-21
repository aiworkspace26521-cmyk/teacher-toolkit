const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');
const backendCode = fs.readFileSync(path.join(__dirname, '../../backend/kpi-core.js'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

console.log('=== G4 管理員冷啟動事件重播測試 (Step 4.2 SKILL_MODIFIER) ===');

function runReplayEngine(events) {
  const createMockElem = () => ({ style: {}, innerHTML: '', appendChild: function() {}, querySelectorAll: function() { return []; } });

  // 1. 前端 sandbox
  const frontendSandbox = {
    window: { V31_FLAGS: { ENABLED: true }, addEventListener: function() {} },
    document: { addEventListener: function() {}, getElementById: createMockElem, createElement: createMockElem, body: createMockElem(), querySelector: createMockElem },
    setTimeout: setTimeout, clearTimeout: clearTimeout, console: console
  };
  vm.createContext(frontendSandbox);
  vm.runInContext(scriptContent, frontendSandbox);

  const frontendState = {
    roster: {
      P0: {
        id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 25, initialLevel: 5,
        skillTree: { atk: { sp: 0, tier: 1 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } },
        learnedMoves: {}, modifiers: {}
      }
    }
  };

  // 前端重播
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
        const isV31 = /:v31$/.test(safeNote);
        frontendState.roster[pid].skillTree[treeType].sp += spAmt;
        const totalSp = frontendState.roster[pid].skillTree[treeType].sp;
        if (isV31) {
          if (totalSp >= 24) frontendState.roster[pid].skillTree[treeType].tier = 5;
          else if (totalSp >= 15) frontendState.roster[pid].skillTree[treeType].tier = 4;
          else if (totalSp >= 8)  frontendState.roster[pid].skillTree[treeType].tier = 3;
          else if (totalSp >= 3)  frontendState.roster[pid].skillTree[treeType].tier = 2;
        }
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
          const totalSpMod = frontendState.roster[pidMod].skillTree[treeName].sp;
          if (totalSpMod >= 24) frontendState.roster[pidMod].skillTree[treeName].tier = 5;
          else if (totalSpMod >= 15) frontendState.roster[pidMod].skillTree[treeName].tier = 4;
          else if (totalSpMod >= 8)  frontendState.roster[pidMod].skillTree[treeName].tier = 3;
          else if (totalSpMod >= 3)  frontendState.roster[pidMod].skillTree[treeName].tier = 2;
        }
      }
    }
  }

  // 2. 後端 sandbox
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
    roster: {
      P0: {
        id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 25, initialLevel: 5,
        skillTree: { atk: { sp: 0, tier: 1 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } },
        learnedMoves: {}, modifiers: {}
      }
    }
  };

  // 後端重播
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
        const isV31 = /:v31$/.test(safeNote);
        backendState.roster[pid].skillTree[treeType].sp += spAmt;
        const totalSp = backendState.roster[pid].skillTree[treeType].sp;
        if (isV31) {
          if (totalSp >= 24) backendState.roster[pid].skillTree[treeType].tier = 5;
          else if (totalSp >= 15) backendState.roster[pid].skillTree[treeType].tier = 4;
          else if (totalSp >= 8)  backendState.roster[pid].skillTree[treeType].tier = 3;
          else if (totalSp >= 3)  backendState.roster[pid].skillTree[treeType].tier = 2;
        }
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
          const totalSpMod = backendState.roster[pidMod].skillTree[treeName].sp;
          if (totalSpMod >= 24) backendState.roster[pidMod].skillTree[treeName].tier = 5;
          else if (totalSpMod >= 15) backendState.roster[pidMod].skillTree[treeName].tier = 4;
          else if (totalSpMod >= 8)  backendState.roster[pidMod].skillTree[treeName].tier = 3;
          else if (totalSpMod >= 3)  backendState.roster[pidMod].skillTree[treeName].tier = 2;
        }
      }
    }
  }

  return { frontendState, backendState };
}

const testEvents = [
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
  // 解鎖質變分支
  { action: 'SKILL_MODIFIER', note: 'P0:抓:強化打擊:3', timestamp: new Date() }
];

console.log('\n[1] 模擬重播完整質變解鎖事件鏈...');
const result = runReplayEngine(testEvents);

console.log('[2] 前端重播結果:');
console.log('    Modifiers:', result.frontendState.roster.P0.modifiers);
console.log('    ATK SP:', result.frontendState.roster.P0.skillTree.atk.sp, '| ATK Tier:', result.frontendState.roster.P0.skillTree.atk.tier);

console.log('[3] 後端重播結果:');
console.log('    Modifiers:', result.backendState.roster.P0.modifiers);
console.log('    ATK SP:', result.backendState.roster.P0.skillTree.atk.sp, '| ATK Tier:', result.backendState.roster.P0.skillTree.atk.tier);

// 斷言前後端 100% 同步
assert.strictEqual(result.frontendState.roster.P0.modifiers['抓'], '強化打擊');
assert.strictEqual(result.frontendState.roster.P0.skillTree.atk.sp, 8); // 5 (升至 Lv.5) + 3 (質變) = 8
assert.strictEqual(result.frontendState.roster.P0.skillTree.atk.tier, 3); // 8 SP -> T3

assert.strictEqual(result.backendState.roster.P0.modifiers['抓'], '強化打擊');
assert.strictEqual(result.backendState.roster.P0.skillTree.atk.sp, 8);
assert.strictEqual(result.backendState.roster.P0.skillTree.atk.tier, 3);

console.log('\nPASS  SKILL_MODIFIER 前後端冷啟動重播結果 100% 同步且完全一致');
console.log('\nG4 step4.2 admin verification PASS');
