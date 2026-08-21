const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');

const sandbox = {
  window: { V31_FLAGS: { ENABLED: true, SIX_MOVES_PER_TIER: true } },
  console: console
};
vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);

const resolveSkillTreeV31 = sandbox.window.resolveSkillTreeV31;

console.log('=== G4 管理員實機載入與 6 選項 UI DOM 模擬渲染 ===');

// 模擬畫面以火恐龍與小火馬選招 render
const pkmnCharmeleon = { name: '火恐龍', rawName: '火恐龍', primaryType: '火' };
const treeData = resolveSkillTreeV31(pkmnCharmeleon);

// 模擬 renderSkillTree 6 選項 HTML 生成
function renderMockNodes(role, tierKey) {
  const nodes = treeData[role.toUpperCase()][tierKey];
  return nodes.map(opt => {
    const locked = !opt.eligible;
    const isPicked = !!opt.pick;
    return `<div class="st-node move-opt ${locked ? 'locked' : isPicked ? 'learned' : 'available'}" data-move="${opt.name}">${locked ? '🔒 生理不符：' : ''}${opt.name}${isPicked ? ' <b>✓已選</b>' : ''}</div>`;
  }).join('');
}

const htmlOut = renderMockNodes('atk', 'T2');
console.log('火恐龍 ATK:T2 節點模擬 DOM 生成:\n', htmlOut);

assert.ok(htmlOut.includes('火焰拳'));
assert.ok(htmlOut.includes('🔒 生理不符：火焰輪'));

console.log('\nG4 step2.3 admin simulation PASS');
