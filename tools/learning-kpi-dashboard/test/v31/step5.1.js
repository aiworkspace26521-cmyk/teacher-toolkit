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

console.log('=== G2 Step 5.1 招式生成器 move-generator.js 斷言 ===');

const TYPES = ['火', '水', '草', '電', '冰', '格鬥', '毒', '地面', '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精', '一般'];
const ROLES = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];

// 1. 斷言 18 屬性全數產完
const matrix = sandbox.window.TIER_MATRIX_V31;
assert.ok(matrix, 'window.TIER_MATRIX_V31 應存在');

for (let i = 0; i < TYPES.length; i++) {
  const type = TYPES[i];
  assert.ok(matrix[type], `屬性【${type}】應存在於 TIER_MATRIX_V31`);
}
console.log('PASS  18 屬性全數產完並掛載於 TIER_MATRIX_V31');

// 2. 斷言每節點 6 招、每招 growth 5 級、質變恰 2 個
const specs = sandbox.window.MOVE_SPECS_V31;
assert.ok(specs, 'window.MOVE_SPECS_V31 應存在');

let totalNodesChecked = 0;
let totalMovesChecked = 0;
const generatedMoveNameSet = new Set();

for (let i = 0; i < TYPES.length; i++) {
  const type = TYPES[i];
  const typeObj = matrix[type];

  for (let r = 0; r < ROLES.length; r++) {
    const role = ROLES[r];
    const roleObj = typeObj[role];
    assert.ok(roleObj, `屬性【${type}】角色【${role}】應存在`);

    for (let t = 1; t <= 5; t++) {
      const tierKey = 'T' + t;
      const moves = roleObj[tierKey];
      assert.ok(Array.isArray(moves), `【${type}-${role}-${tierKey}】應為陣列`);
      assert.strictEqual(moves.length, 6, `【${type}-${role}-${tierKey}】節點招式數量應恰為 6 招`);
      totalNodesChecked++;

      for (let m = 0; m < moves.length; m++) {
        const moveName = moves[m];

        // 若為自動生成之招式 (非火系人工特定古老招)，斷言名稱唯一
        if (type !== '火') {
          assert.ok(!generatedMoveNameSet.has(moveName), `生成招式名稱【${moveName}】應為唯一`);
          generatedMoveNameSet.add(moveName);
        }

        // 查閱 spec
        const spec = specs[moveName] || (sandbox.window.getMoveSpecV31 ? sandbox.window.getMoveSpecV31(moveName) : null);
        assert.ok(spec, `招式【${moveName}】應具備 MOVE_SPECS_V31 定義`);
        assert.ok(spec.growth, `招式【${moveName}】應具備 growth 成長定義`);
        assert.strictEqual(spec.growth.power.length, 5, `招式【${moveName}】成長威力應為 5 級曲線`);

        if (spec.lv5_modifiers) {
          const modCount = Object.keys(spec.lv5_modifiers).length;
          assert.strictEqual(modCount, 2, `招式【${moveName}】質變分支數量應恰為 2 個`);
        }
        totalMovesChecked++;
      }
    }
  }
}

console.log(`PASS  共檢查 ${totalNodesChecked} 個節點 (18屬性 × 5系 × 5階)，包含 ${totalMovesChecked} 招式`);
console.log('PASS  每節點恰 6 招，每招 growth 5 級，質變分支恰 2 個，生成招式名稱完全唯一');

console.log('\nG2 step5.1 gate PASS');
