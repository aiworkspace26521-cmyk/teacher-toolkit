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

console.log('=== G2 Step 5.2 火系完整資料樣本斷言 ===');

const matrix = sandbox.window.TIER_MATRIX_V31;
assert.ok(matrix && matrix['火'], 'TIER_MATRIX_V31 應包含【火】系完整資料');

const fireMatrix = matrix['火'];
const ROLES = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
let nodeCount = 0;
let totalMoves = 0;

for (let r = 0; r < ROLES.length; r++) {
  const role = ROLES[r];
  assert.ok(fireMatrix[role], `火系應包含【${role}】系統`);
  
  for (let t = 1; t <= 5; t++) {
    const tierKey = 'T' + t;
    const moves = fireMatrix[role][tierKey];
    assert.ok(Array.isArray(moves), `火系【${role}-${tierKey}】應為招式陣列`);
    assert.strictEqual(moves.length, 6, `火系【${role}-${tierKey}】應恰有 6 招可選`);
    nodeCount++;
    totalMoves += moves.length;

    for (let m = 0; m < moves.length; m++) {
      const moveName = moves[m];
      const spec = sandbox.window.getMoveSpecV31(moveName);
      assert.ok(spec, `火系招式【${moveName}】應能取得完整 Spec 規格`);
      assert.strictEqual(spec.growth.power.length, 5, `火系招式【${moveName}】應具備 5 級成長曲線`);
      assert.strictEqual(Object.keys(spec.lv5_modifiers).length, 2, `火系招式【${moveName}】應具備恰 2 個質變分支`);
    }
  }
}

assert.strictEqual(nodeCount, 25, '火系應包含 25 個節點 (5系統 × 5階層)');
assert.strictEqual(totalMoves, 150, '火系應包含 150 個招式 (25節點 × 6招)');
console.log('PASS  火系 25 節點 × 6 招 (共 150 招) 全滿，且全部具備 5 級曲線與 2 個質變分支');

// 2. 經典招式 (火焰拳 / 噴射火焰 / 蓄能焰襲) 數值檢驗
const flamePunchSpec = sandbox.window.getMoveSpecV31('火焰拳');
assert.strictEqual(flamePunchSpec.category, 'ATK');
assert.strictEqual(flamePunchSpec.type, '火');
assert.strictEqual(flamePunchSpec.growth.power.length, 5);
assert.ok(flamePunchSpec.lv5_modifiers['熔核之拳']);
console.log('PASS  經典招式【火焰拳】數值與質變分支檢查符合規格');

const flamethrowerSpec = sandbox.window.getMoveSpecV31('噴射火焰');
assert.strictEqual(flamethrowerSpec.category, 'SPA');
assert.strictEqual(flamethrowerSpec.type, '火');
assert.strictEqual(flamethrowerSpec.growth.power.length, 5);
assert.ok(flamethrowerSpec.lv5_modifiers['地獄業火']);
console.log('PASS  經典招式【噴射火焰】數值與質變分支檢查符合規格');

const flameChargeSpec = sandbox.window.getMoveSpecV31('蓄能焰襲');
assert.strictEqual(flameChargeSpec.category, 'ATK');
assert.strictEqual(flameChargeSpec.type, '火');
assert.strictEqual(flameChargeSpec.growth.power.length, 5);
assert.ok(flameChargeSpec.lv5_modifiers['焰蹄疾馳']);
console.log('PASS  經典招式【蓄能焰襲】數值與質變分支檢查符合規格');

console.log('\nG2 step5.2 gate PASS');
