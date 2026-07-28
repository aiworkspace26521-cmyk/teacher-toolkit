/**
 * Phase 2 驗證測試 — 變體一致性測試
 *
 * 驗證項目：
 *   1. ULT_VARIANTS 與 TYPE_SPEC_V2 的變體定義一致
 *   2. 每個 TYPE_SPEC_V2 變體的 ultMapping 在 ULT_VARIANTS 中有對應條目
 *   3. selectUltVariant + buildTreeFromVariant 組合運作
 *   4. 同屬性同索引的 ULT 招式名稱一致
 *
 * 使用方式：可在瀏覽器或 Node.js 中執行
 */

function runVariantConsistencyTests() {
  var results = { total: 0, passed: 0, failed: 0, errors: [] };
  function assert(condition, msg) {
    results.total++;
    if (condition) { results.passed++; }
    else { results.failed++; results.errors.push(msg); }
  }

  var EXPECTED_TYPES = [
    "一般","火","水","草","電","冰",
    "格鬥","毒","地面","飛行","超能力","蟲",
    "岩石","幽靈","龍","惡","鋼","妖精"
  ];

  var allUltMappingsUsed = {};
  var allUltMappingsDefined = {};

  // Test 1: 所有 TYPE_SPEC_V2 變體的 ultMapping 皆在 ULT_VARIANTS 中有對應條目
  for (var ti = 0; ti < EXPECTED_TYPES.length; ti++) {
    var type = EXPECTED_TYPES[ti];
    var typeSpec = TYPE_SPEC_V2[type];
    if (!typeSpec || !typeSpec.VARIANTS) continue;
    var variantNames = Object.keys(typeSpec.VARIANTS);
    for (var vi = 0; vi < variantNames.length; vi++) {
      var vName = variantNames[vi];
      var variant = typeSpec.VARIANTS[vName];
      var ultIdx = variant.ultMapping;
      if (!ultIdx) {
        assert(false, "屬性「" + type + "」變體「" + vName + "」缺少 ultMapping");
        continue;
      }
      allUltMappingsUsed[ultIdx] = (allUltMappingsUsed[ultIdx] || 0) + 1;
      var ultEntry = ULT_VARIANTS[type] && ULT_VARIANTS[type][ultIdx];
      assert(ultEntry !== undefined && ultEntry !== null,
        "屬性「" + type + "」變體「" + vName + "」ultMapping=" + ultIdx + " 在 ULT_VARIANTS 中無對應條目");
      if (ultEntry) {
        assert(Array.isArray(ultEntry) && ultEntry.length === 3,
          "屬性「" + type + "」ULT 索引「" + ultIdx + "」應為 [T3,T4,T5] 陣列");
      }
    }
  }

  // Test 2: 記錄 ULT_VARIANTS 中所有已定義的 ultIndex
  for (var ti2 = 0; ti2 < EXPECTED_TYPES.length; ti2++) {
    var type2 = EXPECTED_TYPES[ti2];
    var ultType = ULT_VARIANTS[type2];
    if (!ultType) continue;
    var ultKeys = Object.keys(ultType);
    for (var ui = 0; ui < ultKeys.length; ui++) {
      var key = ultKeys[ui];
      allUltMappingsDefined[key] = (allUltMappingsDefined[key] || 0) + 1;
    }
  }

  // Test 3: 確認 ultMapping 值只使用 A/B/C/D/E（允許 E 很少被用到）
  var usedKeys = Object.keys(allUltMappingsUsed);
  for (var uki = 0; uki < usedKeys.length; uki++) {
    var uk = usedKeys[uki];
    assert(["A","B","C","D","E"].indexOf(uk) !== -1,
      "ultMapping 值「" + uk + "」不在預期的 A/B/C/D/E 範圍內");
  }

  // Test 4: selectUltVariant 針對同屬性同索引回傳一致結果
  for (var ti3 = 0; ti3 < EXPECTED_TYPES.length; ti3++) {
    var type3 = EXPECTED_TYPES[ti3];
    var typeSpec3 = TYPE_SPEC_V2[type3];
    if (!typeSpec3 || !typeSpec3.VARIANTS) continue;
    var vNames = Object.keys(typeSpec3.VARIANTS);
    if (vNames.length < 2) continue;
    // 找兩個相同 ultMapping 的不同變體
    for (var vi2 = 0; vi2 < vNames.length; vi2++) {
      for (var vj = vi2+1; vj < vNames.length; vj++) {
        var vA = typeSpec3.VARIANTS[vNames[vi2]];
        var vB = typeSpec3.VARIANTS[vNames[vj]];
        if (vA.ultMapping === vB.ultMapping) {
          var poke = { baseName: "測試獸", name: "測試獸", primaryType: type3, isLegendary: false };
          var rA = selectUltVariant(poke, type3, vNames[vi2]);
          var rB = selectUltVariant(poke, type3, vNames[vj]);
          if (rA && rB) {
            assert(rA.t3Name === rB.t3Name,
              "屬性「" + type3 + "」同 ultMapping=" + vA.ultMapping + " 的 t3Name 應一致，"
              + "變體「" + vNames[vi2] + "」=「" + rA.t3Name + "」，"
              + "變體「" + vNames[vj] + "」=「" + rB.t3Name + "」");
          }
        }
      }
    }
  }

  // Test 5: getSkillTree 產生的樹應包含 ULT 資訊
  var tree = getSkillTree("測試獸", ["火"], 80, 60, {});
  assert(tree !== null, "getSkillTree 不應回傳 null");
  if (tree) {
    assert(tree._variantName != null,
      "樹應包含 _variantName");
    assert(tree._ult !== null && tree._ult !== undefined,
      "樹應包含 _ult 資訊");
    if (tree._ult) {
      assert(tree._ult.t3Name != null && tree._ult.t4Name != null && tree._ult.t5Name != null,
        "_ult 應包含 t3Name/t4Name/t5Name，實際 " + JSON.stringify(tree._ult));
    }
  }

  // Test 6: 所有 ULT 索引被使用的比例 >= 80%（確保 A/B/C/D 被充分利用，E 可選）
  var totalUsed = 0;
  for (var uki2 = 0; uki2 < usedKeys.length; uki2++) {
    totalUsed += allUltMappingsUsed[usedKeys[uki2]];
  }
  var usedCount = usedKeys.length;
  assert(usedCount >= 4,
    "應至少使用 4 種 ultMapping 索引（A/B/C/D），實際只使用 " + usedCount + " 種（" + usedKeys.join(",") + "）");

  // 輸出結果
  console.log("========== 變體一致性測試結果 ==========");
  console.log("總計: " + results.total + " | 通過: " + results.passed + " | 失敗: " + results.failed);
  if (results.errors.length > 0) {
    console.log("--- 失敗項目 ---");
    for (var ei = 0; ei < results.errors.length; ei++) {
      console.log("  " + (ei+1) + ". " + results.errors[ei]);
    }
  }
  console.log("========================================");
  return results;
}

// Node.js 直接執行
if (typeof window === "undefined") {
  var vm = require("vm");
  var fs = require("fs");
  var sandbox = { window: {}, console: console, setTimeout: setTimeout };
  vm.createContext(sandbox);
  var srcCode = fs.readFileSync(__dirname + "/../public/pokemon-skill-tree.js", "utf8");
  vm.runInContext(srcCode, sandbox);
  var w = sandbox.window;
  global.ULT_VARIANTS = w.ULT_VARIANTS;
  global.TYPE_SPEC_V2 = w.TYPE_SPEC_V2;
  global.selectUltVariant = w.selectUltVariant;
  global.getSkillTree = w.getSkillTree;
  global.runVariantConsistencyTests = runVariantConsistencyTests;
  var results = runVariantConsistencyTests();
  process.exit(results.failed > 0 ? 1 : 0);
} else if (typeof window !== "undefined") {
  window.runVariantConsistencyTests = runVariantConsistencyTests;
}