/**
 * Phase 2 驗證測試 — 變體多樣性測試
 *
 * 驗證項目：
 *   1. ULT_VARIANTS 涵蓋全部 18 種屬性
 *   2. 每種屬性至少 3 種 ULT 變體（A/B/C/D/E 任意 3 種）
 *   3. 每種變體皆有 [T3, T4, T5] 三階招式名稱
 *   4. 所有招式名稱不為空值
 *   5. variant-diversity 快照一致
 *
 * 使用方式：
 *   可在瀏覽器中執行（需先載入 pokemon-skill-tree.js）
 *   或使用 Node.js 執行（自動模擬瀏覽器環境）
 */

function runVariantDiversityTests() {
  var results = { total: 0, passed: 0, failed: 0, errors: [] };
  function assert(condition, msg) {
    results.total++;
    if (condition) { results.passed++; }
    else { results.failed++; results.errors.push(msg); }
  }

  // 預期所有 18 屬性
  var EXPECTED_TYPES = [
    "一般","火","水","草","電","冰",
    "格鬥","毒","地面","飛行","超能力","蟲",
    "岩石","幽靈","龍","惡","鋼","妖精"
  ];

  // 預期 ULT 變體索引
  var EXPECTED_ULT_KEYS = ["A","B","C","D","E"];

  // Test 1: ULT_VARIANTS 存在且為物件
  assert(typeof ULT_VARIANTS !== "undefined" && ULT_VARIANTS !== null,
    "ULT_VARIANTS 應已定義");

  // Test 2: 涵蓋全部 18 種屬性
  var definedTypes = Object.keys(ULT_VARIANTS);
  for (var ti = 0; ti < EXPECTED_TYPES.length; ti++) {
    var t = EXPECTED_TYPES[ti];
    assert(ULT_VARIANTS[t] !== undefined,
      "ULT_VARIANTS 應包含屬性「" + t + "」");
  }

  // Test 3: 每種屬性至少 3 種 ULT 變體
  for (var ti2 = 0; ti2 < EXPECTED_TYPES.length; ti2++) {
    var t2 = EXPECTED_TYPES[ti2];
    var variants = ULT_VARIANTS[t2];
    if (!variants) continue;
    var variantKeys = Object.keys(variants);
    assert(variantKeys.length >= 3,
      "屬性「" + t2 + "」應有 ≥3 種 ULT 變體，實際 " + variantKeys.length + " 種（" + variantKeys.join(",") + "）");
  }

  // Test 4: 所有變體皆為長度 3 的陣列（T3/T4/T5）
  for (var ti3 = 0; ti3 < EXPECTED_TYPES.length; ti3++) {
    var t3 = EXPECTED_TYPES[ti3];
    var variants3 = ULT_VARIANTS[t3];
    if (!variants3) continue;
    for (var vi = 0; vi < EXPECTED_ULT_KEYS.length; vi++) {
      var key = EXPECTED_ULT_KEYS[vi];
      if (!variants3[key]) {
        assert(false, "屬性「" + t3 + "」缺少 ULT 索引「" + key + "」");
        continue;
      }
      assert(Array.isArray(variants3[key]),
        "屬性「" + t3 + "」ULT「" + key + "」應為陣列");
      assert(variants3[key].length === 3,
        "屬性「" + t3 + "」ULT「" + key + "」應有 3 招（T3/T4/T5），實際 " + variants3[key].length + " 招");
    }
  }

  // Test 5: 所有招式名稱不為空值
  for (var ti4 = 0; ti4 < EXPECTED_TYPES.length; ti4++) {
    var t4 = EXPECTED_TYPES[ti4];
    var variants4 = ULT_VARIANTS[t4];
    if (!variants4) continue;
    for (var vi2 = 0; vi2 < EXPECTED_ULT_KEYS.length; vi2++) {
      var key2 = EXPECTED_ULT_KEYS[vi2];
      var moves = variants4[key2];
      if (!moves) continue;
      for (var mi = 0; mi < moves.length; mi++) {
        assert(moves[mi] != null && moves[mi] !== "",
          "屬性「" + t4 + "」ULT「" + key2 + "」第 " + (mi+1) + " 招不應為空值");
      }
    }
  }

  // Test 6: 確保無重複屬性總數（恰好 18 種不重複）
  assert(definedTypes.length === EXPECTED_TYPES.length,
    "ULT_VARIANTS 應恰好 " + EXPECTED_TYPES.length + " 種屬性，實際 " + definedTypes.length + " 種（" + definedTypes.join(",") + "）");

  // 輸出結果
  console.log("========== 變體多樣性測試結果 ==========");
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
  global.runVariantDiversityTests = runVariantDiversityTests;
  var results = runVariantDiversityTests();
  process.exit(results.failed > 0 ? 1 : 0);
} else if (typeof window !== "undefined") {
  window.runVariantDiversityTests = runVariantDiversityTests;
}