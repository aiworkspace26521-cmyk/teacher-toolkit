const assert = require('assert');
const path = require('path');
const fs = require('fs');

global.window = global;
global.POKEMON_TIERS = { "一般": [], "稀有": [], "傳說": [] };
global.POKEMON_SPECIES_TYPES = { "皮卡丘": ["電"], "水伊布": ["水"], "小火龍": ["火"] };
global.MOVE_DATABASE = {};
global.SIGNATURE_MOVES = {};
global.TYPE_MOVE_POOL = {};

// Load pokemon-skill-tree.js
const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');
eval(fs.readFileSync(stJsPath, 'utf8'));

console.log(`==================================================`);
console.log(`🧪 開始單元測試 G2: 屬性解析器與水伊布技能樹動態測試`);
console.log(`==================================================`);

// 1. Test getPokemonPrimaryType
const t1 = getPokemonPrimaryType({ baseName: "💧 水伊布 (水系)" });
console.log(`  - getPokemonPrimaryType({ baseName: "💧 水伊布 (水系)" }) => "${t1}"`);
assert.strictEqual(t1, "水", "水伊布必須解析為水系！");

const t2 = getPokemonPrimaryType({ name: "皮卡丘" });
console.log(`  - getPokemonPrimaryType({ name: "皮卡丘" }) => "${t2}"`);
assert.strictEqual(t2, "電", "皮卡丘必須解析為電系！");

const t3 = getPokemonPrimaryType({ baseName: "🔥 小火龍 (火系)" });
console.log(`  - getPokemonPrimaryType({ baseName: "🔥 小火龍 (火系)" }) => "${t3}"`);
assert.strictEqual(t3, "火", "小火龍必須解析為火系！");

// 2. Test resolveSkillTreeV31 for 水伊布
const vaporeonTree = resolveSkillTreeV31({ baseName: "💧 水伊布 (水系)" });
console.log(`\n🌊 檢驗水伊布技能樹 (ATK 軌):`);

const atkT1 = vaporeonTree.ATK.T1.map(m => m.name);
const atkT2 = vaporeonTree.ATK.T2.map(m => m.name);
const atkT3 = vaporeonTree.ATK.T3.map(m => m.name);
const atkT4 = vaporeonTree.ATK.T4.map(m => m.name);
const atkT5 = vaporeonTree.ATK.T5.map(m => m.name);

console.log(`  - T1:`, atkT1);
console.log(`  - T2:`, atkT2);
console.log(`  - T3:`, atkT3);
console.log(`  - T4:`, atkT4);
console.log(`  - T5:`, atkT5);

// Assert NO Fire/Dragon exclusive moves in Water Tree
assert.ok(!atkT5.includes('V熱焰'), "水伊布技能樹絕不可出現 V熱焰！");
assert.ok(!atkT5.includes('熔岩衝擊'), "水伊布技能樹絕不可出現 熔岩衝擊！");
assert.ok(atkT1.includes('水槍') || atkT2.includes('貝殼刃') || atkT3.includes('攀瀑') || atkT4.includes('水炮'), "水伊布技能樹必須包含水系主打招式！");

console.log(`\n🎉 SUCCESS: 屬性解析與水伊布技能樹測試 100% 通過！`);
