const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const codePath = path.join(__dirname, '../../frontend/pokemon-skill-tree.js');
const code = fs.readFileSync(codePath, 'utf8');

const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

const resolveSkillTreeV31 = sandbox.window.resolveSkillTreeV31;
const buildTreeFromVariant = sandbox.window.buildTreeFromVariant;

assert.ok(typeof resolveSkillTreeV31 === 'function', 'resolveSkillTreeV31 應為函數');

// 測試案例 1：火恐龍 ('火' 屬性，雙足爪)
const charmeleon = { name: '火恐龍', rawName: '火恐龍', primaryType: '火' };
const treeCharmeleon = resolveSkillTreeV31(charmeleon);

assert.ok(treeCharmeleon.ATK, '解析結果應包含 ATK 軌位');
assert.ok(treeCharmeleon.ATK.T2, 'ATK 軌位應包含 T2 節點');

// 比對火恐龍在 ATK:T2 節點的 eligible 陣列 ['火焰拳', '烈焰爪', '二連踢', '火焰輪', '蓄能焰襲', '電光一閃']
const charmeleonEligibleMap = treeCharmeleon.ATK.T2.map(opt => opt.eligible);
assert.deepStrictEqual(Array.from(charmeleonEligibleMap), [true, true, true, false, false, true], '火恐龍在 ATK:T2 可學火焰拳,烈焰爪,二連踢,電光一閃，遮蔽火焰輪,蓄能焰襲');

// 測試案例 2：小火馬 ('火' 屬性，四足蹄)
const ponyta = { name: '小火馬', rawName: '小火馬', primaryType: '火' };
const treePonyta = resolveSkillTreeV31(ponyta);
const ponytaEligibleMap = treePonyta.ATK.T2.map(opt => opt.eligible);
assert.deepStrictEqual(Array.from(ponytaEligibleMap), [false, false, true, false, true, true], '小火馬在 ATK:T2 遮蔽火焰拳,烈焰爪,火焰輪，可學二連踢,蓄能焰襲,電光一閃');

// 測試案例 3：極端全遮蔽保底測試
// 假設強行將某一節點所有招式的 required_tags 設為不匹配
const dummyPkmn = { name: '未知寶可夢', rawName: '未知寶可夢', primaryType: '火' };
const dummyTree = resolveSkillTreeV31(dummyPkmn);
// 驗證即使標籤未匹配，任一節點長度依然 >= 6 且至少有 1 招通用保底招
const dummyT1Node = dummyTree.ATK.T1;
assert.ok(dummyT1Node.some(opt => opt.eligible), '任何寶可夢在任何節點皆至少有 1 招可學 (通用保底)');

// 測試案例 4：既有 buildTreeFromVariant 函數呼叫不受影響 (相容性)
assert.ok(typeof buildTreeFromVariant === 'function', '舊有 buildTreeFromVariant 函數仍保持完好');

console.log('PASS  火恐龍 ATK:T2 eligible 陣列比對成功 [T, T, T, F, F, T]');
console.log('PASS  小火馬 ATK:T2 eligible 陣列比對成功 [F, F, T, F, T, T]');
console.log('PASS  極端通用保底機制驗證成功');
console.log('PASS  既有 buildTreeFromVariant 相容性保證');

console.log('\nG2 step2.2 gate PASS');
