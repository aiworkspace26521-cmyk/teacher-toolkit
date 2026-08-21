const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 載入 pokemon-skill-tree.js
const codePath = path.join(__dirname, '../../frontend/pokemon-skill-tree.js');
const code = fs.readFileSync(codePath, 'utf8');

const sandbox = {
  window: {},
  console: console
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const TIER_MATRIX_V31 = sandbox.window.TIER_MATRIX_V31;
const MOVE_SPECS_V31 = sandbox.window.MOVE_SPECS_V31;

assert.ok(TIER_MATRIX_V31, 'TIER_MATRIX_V31 應存在');
assert.ok(TIER_MATRIX_V31['火'], 'TIER_MATRIX_V31 應包含火系定義');

const fireTree = TIER_MATRIX_V31['火'];
const roles = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
const tiers = ['T1', 'T2', 'T3', 'T4', 'T5'];

roles.forEach(role => {
  assert.ok(fireTree[role], `火系應包含 ${role} 軌位`);
  tiers.forEach(tier => {
    const node = fireTree[role][tier];
    assert.ok(Array.isArray(node), `火系 ${role}:${tier} 應為陣列`);
    assert.strictEqual(node.length, 6, `火系 ${role}:${tier} 節點恰有 6 個招式選項`);
    
    // 檢查每一個招式是否都在 MOVE_SPECS_V31 中有定義
    node.forEach(moveName => {
      assert.ok(MOVE_SPECS_V31[moveName], `招式 [${moveName}] (在 ${role}:${tier}) 應定義於 MOVE_SPECS_V31 中`);
    });
  });
});

console.log('PASS  火系 25 個節點 (5 軌 × T1~T5) 全部符合長度 6 招');
console.log('PASS  火系所有登場招式均正確補齊於 MOVE_SPECS_V31');
console.log('\nG2 step1.4 gate PASS');
