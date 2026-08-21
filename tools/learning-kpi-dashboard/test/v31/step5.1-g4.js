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
  setTimeout: setTimeout, clearTimeout: clearTimeout, console: console
};

vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);
vm.runInContext(generatorCode, sandbox);
vm.runInContext(scriptContent, sandbox);

console.log('=== G4 管理員實機 18 屬性技能樹解析與招式載入測試 (Step 5.1) ===');

const samplePokemonList = [
  { name: '小火龍', type: '火' },
  { name: '傑尼龜', type: '水' },
  { name: '妙蛙種子', type: '草' },
  { name: '皮卡丘', type: '電' },
  { name: '拉普拉斯', type: '冰' },
  { name: '腕力', type: '格鬥' },
  { name: '雙彈瓦斯', type: '毒' },
  { name: '地鼠', type: '地面' },
  { name: '波波', type: '飛行' },
  { name: '胡地', type: '超能力' },
  { name: '綠毛蟲', type: '蟲' },
  { name: '小拳石', type: '岩石' },
  { name: '鬼斯', type: '幽靈' },
  { name: '迷你龍', type: '龍' },
  { name: '戴魯比', type: '惡' },
  { name: '小磁怪', type: '鋼' },
  { name: '皮皮', type: '妖精' },
  { name: '卡比獸', type: '一般' }
];

console.log('[1] 測試 18 屬性代表寶可夢動態技能樹解析...');

for (let i = 0; i < samplePokemonList.length; i++) {
  const p = samplePokemonList[i];
  const pkmnObj = {
    id: 'test-' + i,
    name: p.name,
    rawName: p.name,
    primaryType: p.type,
    learnedMoves: {}
  };

  const resolvedTree = sandbox.window.resolveSkillTreeV31(pkmnObj);
  assert.ok(resolvedTree, `寶可夢【${p.name} (${p.type})】技能樹應順利解析`);
  assert.ok(resolvedTree.ATK.T1, `寶可夢【${p.name}】ATK T1 應存在`);
  assert.strictEqual(resolvedTree.ATK.T1.length, 6, `寶可夢【${p.name}】ATK T1 應包含 6 招可選`);
}

console.log('PASS  18 屬性代表寶可夢動態技能樹 100% 解析成功，皆無載入錯誤');
console.log('\nG4 step5.1 admin verification PASS');
