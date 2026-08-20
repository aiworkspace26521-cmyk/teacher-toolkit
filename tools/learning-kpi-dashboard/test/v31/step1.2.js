// v3.1 Step 1.2 G2: assert SPECIES_TAGS exists with spec tags and
// getSpeciesTags() resolves Chinese-name keys + parenthesis-family normalization.
// NOTE: whitepaper example uses English codes (charmander/hooh), but the codebase
// indexes species by Chinese display names (SPECIES_LEARNSET keys). Tags per spec.
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const src = path.join(__dirname, '..', '..', 'frontend', 'pokemon-skill-tree.js');
const code = fs.readFileSync(src, 'utf8');

const sandbox = { console, Math, JSON, Date, parseInt, parseFloat, isNaN, isFinite, Array, Object, String, Number, RegExp };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: 'pokemon-skill-tree.js' });

// 序列化至主 realm 後以 deepStrictEqual 比對（vm realm prototype 差異不影響值）
const plain = (v) => JSON.parse(JSON.stringify(v));

// — SPECIES_TAGS 存在且含白皮書列舉的 7 隻範例
assert.ok(sandbox.SPECIES_TAGS, 'SPECIES_TAGS 應存在');
assert.ok(sandbox.getSpeciesTags, 'getSpeciesTags 應存在');

// — 白皮書 G2 斷言（中文名對應表）
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('小火龍')), ['BIPEDAL_CLAW', 'TAIL'], '小火龍 tags 不符');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('火恐龍')), ['BIPEDAL_CLAW', 'TAIL'], '火恐龍 tags 不符');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('噴火龍')), ['BIPEDAL_CLAW', 'TAIL', 'WINGED'], '噴火龍 tags 不符');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('小火馬')), ['QUADRUPED_HOOF'], '小火馬 tags 不符');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('烈焰馬')), ['QUADRUPED_HOOF'], '烈焰馬 tags 不符');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('席多藍恩')), ['QUADRUPED_CLAW', 'ARMORED'], '席多藍恩 tags 不符');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('鳳王')), ['WINGED', 'LEGEND'], '鳳王 tags 不符');

// — 未上榜 → []（安全預設：只能學通用招）
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('未知')), [], '未上榜寶可夢應回 []');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags(null)), [], 'null 應回 []');
assert.deepStrictEqual(plain(sandbox.getSpeciesTags('')), [], '空字串應回 []');

// — 括號系名正規化：'噴火龍（火焰系）' → 噴火龍標籤
assert.deepStrictEqual(
  plain(sandbox.getSpeciesTags('噴火龍（火焰系）')),
  ['BIPEDAL_CLAW', 'TAIL', 'WINGED'],
  '括號系名正規化應命中噴火龍標籤'
);
assert.deepStrictEqual(
  plain(sandbox.getSpeciesTags('鳳王(傳說)')),
  ['WINGED', 'LEGEND'],
  '半形括號系名正規化應命中鳳王標籤'
);

// — SPECIES_TAGS 已匯出至 window（供後端/管理員稽核）
assert.strictEqual(sandbox.window.SPECIES_TAGS, sandbox.SPECIES_TAGS, 'SPECIES_TAGS 應匯出至 window');
assert.strictEqual(typeof sandbox.window.getSpeciesTags, 'function', 'getSpeciesTags 應匯出至 window');

console.log('PASS  小火龍/火恐龍 ->', JSON.stringify(sandbox.getSpeciesTags('小火龍')));
console.log('PASS  噴火龍       ->', JSON.stringify(sandbox.getSpeciesTags('噴火龍')));
console.log('PASS  小火馬/烈焰馬 ->', JSON.stringify(sandbox.getSpeciesTags('小火馬')));
console.log('PASS  席多藍恩     ->', JSON.stringify(sandbox.getSpeciesTags('席多藍恩')));
console.log('PASS  鳳王         ->', JSON.stringify(sandbox.getSpeciesTags('鳳王')));
console.log('PASS  未知(null/空) -> []');
console.log('PASS  括號正規化 噴火龍（火焰系） ->', JSON.stringify(sandbox.getSpeciesTags('噴火龍（火焰系）')));

console.log('\nG2 step1.2 gate PASS');
process.exit(0);
