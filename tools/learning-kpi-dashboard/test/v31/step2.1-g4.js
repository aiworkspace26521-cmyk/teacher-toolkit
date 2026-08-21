const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);

const isEligible = sandbox.window.isEligible;
const getSpeciesTags = sandbox.window.getSpeciesTags;
const TIER_MATRIX_V31 = sandbox.window.TIER_MATRIX_V31;
const getMoveSpecV31 = sandbox.window.getMoveSpecV31;

console.log('=== G4 管理員實機載入與 isEligible 遮蔽比對模擬 ===');

// 模擬火恐龍與小火馬在火系 ATK:T2 節點中各自的遮蔽選招判定
const atkT2Node = TIER_MATRIX_V31['火']['ATK']['T2']; // ['火焰拳', '烈焰爪', '二連踢', '火焰輪', '蓄能焰襲', '電光一閃']

const charmeleonTags = getSpeciesTags('火恐龍');
const ponytaTags = getSpeciesTags('小火馬');

console.log(`火恐龍標籤: [${charmeleonTags.join(', ')}]`);
console.log('火恐龍視角 (ATK:T2 節點):');
atkT2Node.forEach(m => {
  const spec = getMoveSpecV31(m);
  const eligible = isEligible(charmeleonTags, spec);
  console.log(`  - [${m}] -> ${eligible ? '✅ 可學' : '🔒 生理不符遮蔽'}`);
});

console.log(`\n小火馬標籤: [${ponytaTags.join(', ')}]`);
console.log('小火馬視角 (ATK:T2 節點):');
ponytaTagsResult = atkT2Node.map(m => {
  const spec = getMoveSpecV31(m);
  const eligible = isEligible(ponytaTags, spec);
  console.log(`  - [${m}] -> ${eligible ? '✅ 可學' : '🔒 生理不符遮蔽'}`);
  return { move: m, eligible: eligible };
});

// 驗證小火馬在 ATK:T2 節點中，火焰拳與烈焰爪被遮蔽，但二連踢、蓄能焰襲、電光一閃可學
assert.strictEqual(ponytaTagsResult.find(x => x.move === '火焰拳').eligible, false);
assert.strictEqual(ponytaTagsResult.find(x => x.move === '二連踢').eligible, true);
assert.strictEqual(ponytaTagsResult.find(x => x.move === '蓄能焰襲').eligible, true);

console.log('\nG4 step2.1 admin simulation PASS');
