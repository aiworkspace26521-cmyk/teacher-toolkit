const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);

const resolveSkillTreeV31 = sandbox.window.resolveSkillTreeV31;

console.log('=== G4 管理員實機載入與 resolveSkillTreeV31 解析器測試 ===');

const charizard = { name: '噴火龍', rawName: '噴火龍', primaryType: '火' };
const treeCharizard = resolveSkillTreeV31(charizard);

console.log('噴火龍 5 軌節點動態生成統計:');
Object.keys(treeCharizard).forEach(role => {
  const t1Len = treeCharizard[role].T1.length;
  const t5Len = treeCharizard[role].T5.length;
  console.log(`  軌位 [${role}]: T1長度=${t1Len}, T5長度=${t5Len}`);
  assert.strictEqual(t1Len, 6);
  assert.strictEqual(t5Len, 6);
});

console.log('\nG4 step2.2 admin simulation PASS');
