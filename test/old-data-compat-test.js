#!/usr/bin/env node
// test/old-data-compat-test.js
// v3.2 §4: 舊資料相容性驗證（Phase 5 事件溯源強化後）
// 確保現有 TYPE_SPEC_V2 格式仍能正確載入與處理
'use strict';

var vm = require("vm");
var fs = require("fs");
var path = require("path");

var skillTreePath = path.join(__dirname, "..", "public", "pokemon-skill-tree.js");
if (!fs.existsSync(skillTreePath)) {
  console.error("❌ 找不到 public/pokemon-skill-tree.js");
  process.exit(1);
}

var sandbox = {
  window: {},
  console: console,
  setTimeout: setTimeout,
  MOVE_DATABASE: {},
  POKEMON_TIERS: {},
  POKEMON_SPECIES_TYPES: {}
};
vm.createContext(sandbox);
var srcCode = fs.readFileSync(skillTreePath, "utf8");
vm.runInContext(srcCode, sandbox);

var TYPE_SPEC_V2 = sandbox.window.TYPE_SPEC_V2;
var TYPE_T5_SIGNATURES = sandbox.window.TYPE_T5_SIGNATURES;
var resolveT5Move = sandbox.window.resolveT5Move;
var selectVariant = sandbox.window.selectVariant;

console.log("========== 舊資料相容性驗證 (v3.2 §4) ==========");

var totalTests = 0;
var passedTests = 0;
var errors = [];

function assert(condition, msg) {
  totalTests++;
  if (condition) { passedTests++; }
  else { errors.push(msg); }
}

// Test 1: TYPE_SPEC_V2 載入完整性
assert(typeof TYPE_SPEC_V2 === "object" && TYPE_SPEC_V2 !== null, "TYPE_SPEC_V2 應為物件");
assert(Object.keys(TYPE_SPEC_V2).length >= 18, "TYPE_SPEC_V2 應有 18 屬性, 實際 " + Object.keys(TYPE_SPEC_V2).length);

// Test 2: 每個屬性皆有 VARIANTS
var types = ["一般", "火", "水", "草", "電", "冰", "格鬥", "毒", "地面", "飛行", "超能力", "蟲", "岩石", "幽靈", "龍", "惡", "鋼", "妖精"];
for (var ti = 0; ti < types.length; ti++) {
  var spec = TYPE_SPEC_V2[types[ti]];
  assert(spec && spec.VARIANTS, types[ti] + " 應有 VARIANTS");
  if (spec && spec.VARIANTS) {
    var vNames = Object.keys(spec.VARIANTS);
    var minVariants = types[ti] === "妖精" ? 3 : 4; // 妖精只有 3 變體
    assert(vNames.length >= minVariants, types[ti] + " 應有至少 " + minVariants + " 變體, 實際 " + vNames.length);
  }
}

// Test 3: 每變體有 tiers + preferredStats + ultMapping
var variantCount = 0;
var missingTiers = 0;
var missingStats = 0;
var missingUlt = 0;
for (var tii = 0; tii < types.length; tii++) {
  var sp = TYPE_SPEC_V2[types[tii]];
  if (!sp || !sp.VARIANTS) continue;
  var vns = Object.keys(sp.VARIANTS);
  for (var vii = 0; vii < vns.length; vii++) {
    var v = sp.VARIANTS[vns[vii]];
    variantCount++;
    if (!v.tiers) missingTiers++;
    if (!v.preferredStats) missingStats++;
    if (!v.ultMapping) missingUlt++;
  }
}
assert(missingTiers === 0, "全部 " + variantCount + " 變體應有 tiers (缺失: " + missingTiers + ")");
assert(missingStats === 0, "全部 " + variantCount + " 變體應有 preferredStats (缺失: " + missingStats + ")");
assert(missingUlt === 0, "全部 " + variantCount + " 變體應有 ultMapping (缺失: " + missingUlt + ")");

// Test 4: 每變體跨 T3-T5 至少各有 1 招 ATK 與 1 招 SPA
// (允許特定階層空值 — 物攻型省略 SPA、特攻型省略 ATK 屬正常設計；
//  純 SPA 變體如「特攻轟炸型」無 ATK、純 ATK 變體如「速攻擾亂型」無 SPA 亦屬合理)
var variantsMissingAtk = [];
var variantsMissingSpa = [];
for (var t3i = 0; t3i < types.length; t3i++) {
  var sp2 = TYPE_SPEC_V2[types[t3i]];
  if (!sp2 || !sp2.VARIANTS) continue;
  var vns2 = Object.keys(sp2.VARIANTS);
  for (var v2i = 0; v2i < vns2.length; v2i++) {
    var v2 = sp2.VARIANTS[vns2[v2i]];
    var tiers = ["T3", "T4", "T5"];
    var hasAtk = false;
    var hasSpa = false;
    for (var t4i = 0; t4i < tiers.length && !(hasAtk && hasSpa); t4i++) {
      var tierData = v2.tiers[tiers[t4i]];
      if (tierData) {
        if (tierData.ATK && tierData.ATK.length > 0 && tierData.ATK[0] !== "") hasAtk = true;
        if (tierData.SPA && tierData.SPA.length > 0 && tierData.SPA[0] !== "") hasSpa = true;
      }
    }
    if (!hasAtk) variantsMissingAtk.push(types[t3i] + "/" + vns2[v2i]);
    if (!hasSpa) variantsMissingSpa.push(types[t3i] + "/" + vns2[v2i]);
  }
}
// 純角色變體(如純ATK或純SPA)屬故意設計，僅報告不阻擋
if (variantsMissingAtk.length > 0) {
  console.log("  ℹ️  純 SPA 變體(無 ATK T3-T5): " + variantsMissingAtk.join(", "));
}
if (variantsMissingSpa.length > 0) {
  console.log("  ℹ️  純 ATK 變體(無 SPA T3-T5): " + variantsMissingSpa.join(", "));
}
assert(variantsMissingAtk.length <= 8, "過多變體無ATK招式: " + variantsMissingAtk.length);
assert(variantsMissingSpa.length <= 8, "過多變體無SPA招式: " + variantsMissingSpa.length);

// Test 5: resolveT5Move 在無變體時不 crash
var dummyPkm = { type2: null };
var safeTypes = ["火", "水", "草"];
for (var sfi = 0; sfi < safeTypes.length; sfi++) {
  try {
    var result = resolveT5Move(safeTypes[sfi], "ATK", null, dummyPkm);
    assert(result && result.length > 0, safeTypes[sfi] + " ATK T5 無變體時應回傳招式, 得 " + JSON.stringify(result));
  } catch (e) {
    assert(false, safeTypes[sfi] + " ATK T5 無變體時不應拋錯: " + e.message);
  }
}

// Test 6: resolveT5Move 在無 preferredStats 變體時不 crash
for (var sf2i = 0; sf2i < safeTypes.length; sf2i++) {
  try {
    var stubVariant = {
      tiers: TYPE_SPEC_V2[safeTypes[sf2i]].VARIANTS[Object.keys(TYPE_SPEC_V2[safeTypes[sf2i]].VARIANTS)[0]].tiers,
      ultMapping: "C"
    };
    var result2 = resolveT5Move(safeTypes[sf2i], "ATK", stubVariant, dummyPkm);
    assert(result2 && result2.length > 0, safeTypes[sf2i] + " ATK T5 無 preferredStats 時應回傳招式");
  } catch (e) {
    assert(false, safeTypes[sf2i] + " ATK T5 無 preferredStats 時不應拋錯: " + e.message);
  }
}

// Test 7: TYPE_T5_SIGNATURES 完整性
assert(typeof TYPE_T5_SIGNATURES === "object" && TYPE_T5_SIGNATURES !== null, "TYPE_T5_SIGNATURES 應為物件");
assert(Object.keys(TYPE_T5_SIGNATURES).length >= 18, "TYPE_T5_SIGNATURES 應有 18 屬性");
var allHaveRoles = true;
Object.keys(TYPE_T5_SIGNATURES).forEach(function(t) {
  ["ATK", "SPA", "BUF", "DIS"].forEach(function(r) {
    if (!TYPE_T5_SIGNATURES[t][r] || TYPE_T5_SIGNATURES[t][r].length === 0) {
      allHaveRoles = false;
      errors.push(t + " T5簽名缺少角色 " + r);
    }
  });
});
assert(allHaveRoles, "所有類型應有 4 角色 T5 簽名招 (缺失如上)");

// Test 8: selectVariant 對同一輸入恒穩定 (確定性)
if (typeof selectVariant === "function") {
  var testPkm = { species: "噴火龍", type: "火", level: 50, type2: null };
  var seenResults = {};
  for (var ri = 0; ri < 20; ri++) {
    var vr = selectVariant(testPkm);
    var key = JSON.stringify(vr);
    seenResults[key] = (seenResults[key] || 0) + 1;
  }
  var keys = Object.keys(seenResults);
  assert(keys.length === 1, "selectVariant 噴火龍應恒穩定, 得 " + keys.length + " 種結果");
}

// ===== 結果 =====
var failed = totalTests - passedTests;
console.log("\n測試總數: " + totalTests);
console.log("通過: " + passedTests);
console.log("失敗: " + failed);

if (errors.length > 0) {
  console.log("\n⚠️  相容性問題 (" + errors.length + " 項):");
  errors.forEach(function(e, i) {
    console.log("  " + (i + 1) + ". " + e);
  });
  process.exit(1);
}

console.log("\n✅ v3.2 §4 舊資料相容性驗證通過");
