const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codePath = path.join(__dirname, '../../frontend/pokemon-skill-tree.js');
const code = fs.readFileSync(codePath, 'utf8');

const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const isEligible = sandbox.window.isEligible;
const getSpeciesTags = sandbox.window.getSpeciesTags;
const MOVE_SPECS_V31 = sandbox.window.MOVE_SPECS_V31;

assert.ok(typeof isEligible === 'function', 'isEligible 應為函數');

// 測試案例 1：火恐龍 ('BIPEDAL_CLAW', 'TAIL') vs 火焰拳
const charmeleonTags = getSpeciesTags('火恐龍');
const firePunchSpec = MOVE_SPECS_V31['火焰拳'];
assert.strictEqual(isEligible(charmeleonTags, firePunchSpec), true, '火恐龍具備雙足爪標籤，應可學習火焰拳');

// 測試案例 2：小火馬 ('QUADRUPED_HOOF') vs 火焰拳
const ponytaTags = getSpeciesTags('小火馬');
assert.strictEqual(isEligible(ponytaTags, firePunchSpec), false, '小火馬為四足蹄，不合火焰拳 required_tags / 屬 excluded_tags，應被遮蔽 (false)');

// 測試案例 3：小火馬 vs 蓄能焰襲 (required_tags: ['QUADRUPED_HOOF', 'WINGED'])
const flameChargeSpec = MOVE_SPECS_V31['蓄能焰襲'];
assert.strictEqual(isEligible(ponytaTags, flameChargeSpec), true, '小火馬屬 QUADRUPED_HOOF，應可學習蓄能焰襲');

// 測試案例 4：噴射火焰 (required_tags: []) 通用招
const flamethrowerSpec = MOVE_SPECS_V31['噴射火焰'];
assert.strictEqual(isEligible(ponytaTags, flamethrowerSpec), true, '通用招式 (required_tags: []) 任何寶可夢皆可學習');
assert.strictEqual(isEligible(charmeleonTags, flamethrowerSpec), true);

// 測試案例 5：極端情況（無標籤寶可夢）
assert.strictEqual(isEligible([], firePunchSpec), false, '無標籤寶可夢不能學有形態限制的火焰拳');
assert.strictEqual(isEligible([], flamethrowerSpec), true, '無標籤寶可夢仍可學通用招噴射火焰');

console.log('PASS  火恐龍 vs 火焰拳 -> true');
console.log('PASS  小火馬 vs 火焰拳 -> false (🔒 生理不符遮蔽)');
console.log('PASS  小火馬 vs 蓄能焰襲 -> true');
console.log('PASS  通用招噴射火焰 -> true');
console.log('PASS  無標籤寶可夢極端測試');

console.log('\nG2 step2.1 gate PASS');
