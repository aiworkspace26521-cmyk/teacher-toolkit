/**
 * Phase 1 演算法驗證腳本
 * 測試 6 個核心選擇演算法函數：
 *   seededRandom / selectVariant / buildTreeFromVariant /
 *   resolveT5Move / selectUltVariant / getSkillTree
 *
 * 使用方式:
 *   node tools/招式培養系統/test-phase1-algorithm.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const TARGET = path.join(ROOT, "public/pokemon-skill-tree.js");

let passed = 0;
let failed = 0;

function check(condition, label, detail) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

function checkEqual(actual, expected, label) {
  return check(actual === expected, label, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

// ── Load the file with mock window ──
console.log("=== 載入 pokemon-skill-tree.js (Node mock) ===");
global.window = {};
const content = fs.readFileSync(TARGET, "utf-8");
eval(content);
const api = global.window;
const allTypes = [
  "一般","火","水","草","電","冰","格鬥","毒","地面",
  "飛行","超能力","蟲","岩石","幽靈","龍","惡","鋼","妖精"
];

check(typeof api.seededRandom === "function", "seededRandom 匯出");
check(typeof api.selectVariant === "function", "selectVariant 匯出");
check(typeof api.buildTreeFromVariant === "function", "buildTreeFromVariant 匯出");
check(typeof api.resolveT5Move === "function", "resolveT5Move 匯出");
check(typeof api.selectUltVariant === "function", "selectUltVariant 匯出");
check(typeof api.getSkillTree === "function", "getSkillTree 匯出");

// ── 1. seededRandom ──
console.log("\n=== 1. seededRandom ===");
(function(){
  var rng = api.seededRandom(42);
  var vals = [];
  for (var i = 0; i < 10; i++) vals.push(rng());
  check(vals.length === 10, "可連續產生 10 個值");
  check(vals.every(function(v){ return v >= 0 && v < 1; }), "所有值在 [0,1) 範圍內");

  // Determinism
  var rng2 = api.seededRandom(42);
  var same = true;
  for (var i = 0; i < 5; i++) { if (rng2() !== vals[i]) same = false; }
  check(same, "同 seed 產生相同序列 (確定性)");

  // Different seeds produce different sequences
  var rng3 = api.seededRandom(99);
  var different = rng3() !== vals[0];
  check(different, "不同 seed 產生不同值");
})();

// ── 2. selectVariant ──
console.log("\n=== 2. selectVariant ===");
(function(){
  // Test with a pokemon with high ATK -> should pick a physical variant
  var physicalMon = {
    primaryType: "火",
    type2: null,
    stats: { atk: 200, spa: 50, spd: 80, def: 80, spDef: 80 },
    personality: 0.5
  };
  var variant = api.selectVariant(physicalMon);
  check(variant !== null, "火系高物攻寶可夢: 選擇到變體");
  check(typeof variant === "string", "回傳字串名稱");

  // All 18 types return a variant
  var allOk = true;
  for (var ti = 0; ti < allTypes.length; ti++) {
    var mon = {
      primaryType: allTypes[ti],
      type2: null,
      stats: { atk: 80, spa: 80, spd: 80, def: 80, spDef: 80 },
      personality: 0.5
    };
    var v = api.selectVariant(mon);
    if (!v) { console.log(`  ❌ ${allTypes[ti]}: 回傳 null`); allOk = false; }
  }
  check(allOk, "全部 18 屬性皆可選出變體");

  // Unknown type returns null
  var badMon = { primaryType: "未知", stats: {}, personality: 0.5 };
  check(api.selectVariant(badMon) === null, "未知屬性回傳 null");
})();

// ── 3. buildTreeFromVariant ──
console.log("\n=== 3. buildTreeFromVariant ===");
(function(){
  var ok = true;
  for (var ti = 0; ti < allTypes.length; ti++) {
    var type = allTypes[ti];
    var spec = api.TYPE_SPEC_V2[type];
    var variants = Object.keys(spec.VARIANTS);
    if (variants.length === 0) { ok = false; console.log(`  ❌ ${type}: 無變體`); continue; }
    var testMon = { id: 1, personality: 0.5 };
    for (var vi = 0; vi < variants.length; vi++) {
      var vName = variants[vi];
      var tree = api.buildTreeFromVariant(testMon, type, vName);
      check(tree !== null && typeof tree === "object", `${type} / ${vName}: 回傳樹狀結構`);
      ["ATK","SPA","BUF","DIS"].forEach(function(role){
        var t = tree[role];
        check(t !== undefined, `${type} / ${vName} / ${role}: 存在`);
        if (t) {
          check(typeof t.T1 !== "undefined", `${type} / ${vName} / ${role}: T1 存在`);
          check(typeof t.T5 !== "undefined", `${type} / ${vName} / ${role}: T5 存在`);
        }
      });
    }
  }
})();

// ── 4. resolveT5Move ──
console.log("\n=== 4. resolveT5Move ===");
(function(){
  var allRoles = ["ATK", "SPA", "BUF", "DIS"];
  for (var ti = 0; ti < allTypes.length; ti++) {
    var type = allTypes[ti];
    for (var ri = 0; ri < allRoles.length; ri++) {
      var role = allRoles[ri];
      var move = api.resolveT5Move(type, role, null, null);
      check(move !== null && typeof move === "string" && move.length > 0,
        `${type} / ${role}: 產生 T5 招式 (${move || "null"})`);
    }
  }
})();

// ── 5. selectUltVariant ──
console.log("\n=== 5. selectUltVariant ===");
(function(){
  for (var ti = 0; ti < allTypes.length; ti++) {
    var type = allTypes[ti];
    var spec = api.TYPE_SPEC_V2[type];
    var variants = Object.keys(spec.VARIANTS);
    for (var vi = 0; vi < variants.length; vi++) {
      var vName = variants[vi];
      var mon = { baseName: type+"Test" };
      var uv = api.selectUltVariant(mon, type, vName);
      check(uv !== null && uv.t5Name && uv.label, `${type} / ${vName}: 回傳 ult variant`);
      check(typeof uv.t5Name === "string" && uv.t5Name.length > 0,
        `${type} / ${vName}: t5Name 非空 (${uv.t5Name})`);
    }
  }
})();

// ── 6. getSkillTree (end-to-end) ──
console.log("\n=== 6. getSkillTree (end-to-end) ===");
(function(){
  var allOk = true;
  for (var ti = 0; ti < allTypes.length; ti++) {
    var type = allTypes[ti];
    var pokemon = {
      primaryType: type,
      type2: null,
      stats: { atk: 100, spa: 100, spd: 80, def: 80, spDef: 80 },
      personality: 0.5,
      species: type + "Mon"
    };
    var tree = api.getSkillTree(null, [type], null, null, pokemon);
    if (!tree || !tree.trees) {
      console.log(`  ❌ ${type}: getSkillTree 回傳無效結構`);
      allOk = false;
      continue;
    }
    var treeTypes = ["atk","spa","buf","dis","ult"];
    var typeOk = true;
    for (var tt = 0; tt < treeTypes.length; tt++) {
      if (!tree.trees[treeTypes[tt]] || !tree.trees[treeTypes[tt]].nodes) {
        console.log(`  ❌ ${type}: 缺少 ${treeTypes[tt]} 樹系`);
        typeOk = false;
      }
    }
    if (typeOk) console.log(`  ✅ ${type}: 5 樹系完整`);
  }
  check(allOk, "全部 18 屬性 end-to-end 測試通過");

  // Old system fallback
  var oldTree = api.getSkillTree("皮卡丘", ["電"], 80, 80);
  check(oldTree !== null && oldTree.trees !== undefined, "舊系統回傳有效結構");

  // Species-specific tree
  var specTree = api.getSkillTree("噴火龍", ["火","飛行"], 100, 100);
  check(specTree !== null && specTree.trees !== undefined, "物種專用樹回傳有效結構");
})();

// ── Summary ──
console.log("\n" + "=".repeat(45));
console.log(`✅ 通過: ${passed} | ❌ 失敗: ${failed}`);
console.log("=".repeat(45));

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n✅ Phase 1 演算法驗證全部通過！");
}
