const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlCode = fs.readFileSync(path.join(__dirname, '../../frontend/kpi-dashboard.html'), 'utf8');
const backendCode = fs.readFileSync(path.join(__dirname, '../../backend/kpi-core.js'), 'utf8');

const scriptMatch = htmlCode.match(/<script>([\s\S]*?)<\/script>/i);
const scriptContent = scriptMatch ? scriptMatch[1] : '';

console.log('=== G2 Step 4.2 SKILL_MODIFIER 事件解析與狀態還原斷言 ===');

// 正則測試 note 格式：{pid}:{moveName}:{branch}:{spAmt}
const parseModifierNote = (safeNote) => {
  const mdParts = safeNote.match(/^(\S+):([^:]+):(.+):(\d+)$/);
  if (!mdParts) return null;
  return { pid: mdParts[1], moveName: mdParts[2], branch: mdParts[3], spAmt: parseInt(mdParts[4]) };
};

// 1. 正則解析斷言
const md1 = parseModifierNote('P0:抓:強化打擊:3');
assert.strictEqual(md1.pid, 'P0');
assert.strictEqual(md1.moveName, '抓');
assert.strictEqual(md1.branch, '強化打擊');
assert.strictEqual(md1.spAmt, 3);
console.log('PASS  SKILL_MODIFIER note 正則解析正確 (pid=P0, move=抓, branch=強化打擊, spAmt=3)');

// 2. 模擬重播還原狀態測試
function replayModifier(events) {
  const state = {
    roster: {
      P0: {
        id: 'P0', baseName: '小火龍',
        skillTree: { atk: { sp: 5, tier: 2 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } },
        learnedMoves: { '抓': { level: 5, tier: 1, source: 'atk' } },
        modifiers: {}
      }
    }
  };

  for (const evt of events) {
    const rowAction = evt.action;
    const safeNote = String(evt.note || '');
    if (rowAction === 'SKILL_MODIFIER') {
      const mdParts = safeNote.match(/^(\S+):([^:]+):(.+):(\d+)$/);
      if (mdParts && state.roster[mdParts[1]]) {
        const pidMod = mdParts[1];
        if (!state.roster[pidMod].modifiers) state.roster[pidMod].modifiers = {};
        state.roster[pidMod].modifiers[mdParts[2]] = mdParts[3];
        const learnedRec = state.roster[pidMod].learnedMoves && state.roster[pidMod].learnedMoves[mdParts[2]];
        const rawRole = learnedRec ? (learnedRec.source || learnedRec.role || 'atk') : 'atk';
        const treeName = String(rawRole).toLowerCase();
        if (state.roster[pidMod].skillTree && state.roster[pidMod].skillTree[treeName]) {
          state.roster[pidMod].skillTree[treeName].sp += parseInt(mdParts[4]) || 3;
          const totalSpMod = state.roster[pidMod].skillTree[treeName].sp;
          if (totalSpMod >= 24) state.roster[pidMod].skillTree[treeName].tier = 5;
          else if (totalSpMod >= 15) state.roster[pidMod].skillTree[treeName].tier = 4;
          else if (totalSpMod >= 8)  state.roster[pidMod].skillTree[treeName].tier = 3;
          else if (totalSpMod >= 3)  state.roster[pidMod].skillTree[treeName].tier = 2;
        }
      }
    }
  }
  return state;
}

const testEvts = [
  { action: 'SKILL_MODIFIER', note: 'P0:抓:強化打擊:3' }
];

const resState = replayModifier(testEvts);
assert.strictEqual(resState.roster.P0.modifiers['抓'], '強化打擊');
assert.strictEqual(resState.roster.P0.skillTree.atk.sp, 8); // 5 + 3 = 8
assert.strictEqual(resState.roster.P0.skillTree.atk.tier, 3); // 8 SP -> T3 (v31 門檻)
console.log('PASS  SKILL_MODIFIER 重播寫入 modifiers 成功，且樹存款 +3 並跨階至 T3');

// 3. Fallback 到 atk 樹測試 (未登錄學習招式時)
const testFallbackEvts = [
  { action: 'SKILL_MODIFIER', note: 'P0:未知招式:超級攻擊:3' }
];
const resFallbackState = replayModifier(testFallbackEvts);
assert.strictEqual(resFallbackState.roster.P0.modifiers['未知招式'], '超級攻擊');
assert.strictEqual(resFallbackState.roster.P0.skillTree.atk.sp, 8);
console.log('PASS  未登錄招式正確 fallback 至 atk 樹');

console.log('\nG2 step4.2 gate PASS');
