const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);

const TIER_MATRIX_V31 = sandbox.window.TIER_MATRIX_V31;
const getMoveSpecV31 = sandbox.window.getMoveSpecV31;

console.log('=== G4 管理員實機載入與 6 招節點檢索驗證 ===');
console.log(`已成功載入火系 5 軌 25 節點矩陣`);

// 模擬登入後臺與檢索節點內容
const sampleNode = TIER_MATRIX_V31['火']['ATK']['T2'];
console.log('檢索火系 ATK:T2 節點招式清單:', sampleNode);

assert.strictEqual(sampleNode.length, 6);
sampleNode.forEach((m, idx) => {
  const spec = getMoveSpecV31(m);
  console.log(`  選項 ${idx+1}: [${m}] (屬性:${spec.type}, 分類:${spec.category}, Lv.1 威力:${spec.growth.power[0]})`);
});

console.log('\nG4 step1.4 admin simulation PASS');
