const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 測試模擬管理員帳號載入與招式規格相容性
const treeCode = fs.readFileSync(path.join(__dirname, '../../frontend/pokemon-skill-tree.js'), 'utf8');

const sandbox = {
  window: {},
  console: console
};
vm.createContext(sandbox);
vm.runInContext(treeCode, sandbox);

const MOVE_SPECS_V31 = sandbox.window.MOVE_SPECS_V31;
const SPECIES_TAGS = sandbox.window.SPECIES_TAGS;

console.log('=== G4 管理員實機載入與招式規格驗證 ===');
console.log(`已成功載入 ${Object.keys(MOVE_SPECS_V31).length} 個招式規格`);
console.log(`已成功載入 ${Object.keys(SPECIES_TAGS).length} 個寶可夢生理標籤資料`);

// 測試模擬寶可夢 (如 小火馬 與 火恐龍) 對於各招式的匹配相容性
const testCases = [
  { name: '小火龍', move: '火焰拳', expectedEligible: true },
  { name: '小火馬', move: '火焰拳', expectedEligible: false },
  { name: '小火馬', move: '蓄能焰襲', expectedEligible: true },
  { name: '噴火龍', move: '噴射火焰', expectedEligible: true }
];

testCases.forEach(tc => {
  const tags = sandbox.window.getSpeciesTags(tc.name);
  const spec = MOVE_SPECS_V31[tc.move];
  let eligible = true;
  if (spec.required_tags && spec.required_tags.length > 0) {
    eligible = spec.required_tags.some(t => tags.includes(t));
  }
  if (spec.excluded_tags && spec.excluded_tags.length > 0) {
    if (spec.excluded_tags.some(t => tags.includes(t))) eligible = false;
  }
  console.log(`驗證 [${tc.name}] (${tags.join(',') || '無'}) 使用 [${tc.move}]: 判定=${eligible} (預期=${tc.expectedEligible})`);
  if (eligible !== tc.expectedEligible) {
    throw new Error(`[${tc.name}] 使用 [${tc.move}] 匹配錯誤`);
  }
});

console.log('\nG4 step1.3 admin simulation PASS');
