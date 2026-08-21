const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 模擬瀏覽器環境載入 pokemon-skill-tree.js
const codePath = path.join(__dirname, '../../frontend/pokemon-skill-tree.js');
const code = fs.readFileSync(codePath, 'utf8');

const sandbox = {
  window: {},
  console: console
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const MOVE_SPECS_V31 = sandbox.window.MOVE_SPECS_V31;

assert.ok(MOVE_SPECS_V31, 'MOVE_SPECS_V31 應存在');
assert.ok(Object.keys(MOVE_SPECS_V31).length >= 8, 'MOVE_SPECS_V31 應包含至少 8 個初始定義招式');

// 測試重點招式 1：火焰拳
const firePunch = MOVE_SPECS_V31['火焰拳'];
assert.ok(firePunch, '火焰拳應存在');
assert.strictEqual(firePunch.category, 'ATK');
assert.strictEqual(firePunch.type, '火');
assert.deepStrictEqual(Array.from(firePunch.required_tags), ['BIPEDAL_CLAW', 'QUADRUPED_CLAW']);
assert.deepStrictEqual(Array.from(firePunch.excluded_tags), ['QUADRUPED_HOOF', 'SERPENTINE']);
assert.strictEqual(firePunch.growth.power.length, 5, 'growth.power 陣列長度應為 5 (Lv.1~5)');
assert.deepStrictEqual(Array.from(firePunch.growth.power), [70, 78, 88, 98, 105]);
assert.ok(firePunch.lv5_modifiers, '火焰拳應包含 lv5_modifiers');
assert.strictEqual(Object.keys(firePunch.lv5_modifiers).length, 2, 'lv5_modifiers 應恰有 2 個分支');
assert.ok(firePunch.lv5_modifiers['熔核之拳']);
assert.ok(firePunch.lv5_modifiers['雙連炎拳']);

// 測試重點招式 2：蓄能焰襲
const flameCharge = MOVE_SPECS_V31['蓄能焰襲'];
assert.ok(flameCharge, '蓄能焰襲應存在');
assert.strictEqual(flameCharge.category, 'ATK');
assert.deepStrictEqual(Array.from(flameCharge.required_tags), ['QUADRUPED_HOOF', 'WINGED']);
assert.strictEqual(flameCharge.growth.power.length, 5);
assert.strictEqual(Object.keys(flameCharge.lv5_modifiers).length, 2);

// 測試重點招式 3：噴射火焰
const flamethrower = MOVE_SPECS_V31['噴射火焰'];
assert.ok(flamethrower, '噴射火焰應存在');
assert.strictEqual(flamethrower.category, 'SPA');
assert.deepStrictEqual(Array.from(flamethrower.required_tags), []);
assert.strictEqual(flamethrower.growth.power.length, 5);
assert.strictEqual(Object.keys(flamethrower.lv5_modifiers).length, 2);

// 驗證所有招式的結構完整性
Object.keys(MOVE_SPECS_V31).forEach(moveName => {
  const spec = MOVE_SPECS_V31[moveName];
  assert.ok(spec.category, `${moveName} 缺少 category`);
  assert.ok(spec.type, `${moveName} 缺少 type`);
  assert.ok(Array.isArray(spec.required_tags), `${moveName} required_tags 應為陣列`);
  assert.ok(spec.growth && Array.isArray(spec.growth.power), `${moveName} growth.power 應為陣列`);
  assert.strictEqual(spec.growth.power.length, 5, `${moveName} growth.power 應包含 5 個等級之數值`);
  assert.ok(spec.lv5_modifiers, `${moveName} 缺少 lv5_modifiers`);
  assert.strictEqual(Object.keys(spec.lv5_modifiers).length, 2, `${moveName} lv5_modifiers 應恰為 2 選 1`);
  console.log(`PASS  ${moveName} 規格完整性驗證 (Lv.1~5 成長與 2 選 1 質變)`);
});

console.log('\nG2 step1.3 gate PASS');
