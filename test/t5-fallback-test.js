/**
 * Phase 2 驗證測試 — T5 回退邏輯測試
 *
 * 驗證項目：
 *   1. selectUltVariant() 對所有屬性 × 所有變體皆回傳非 null 結果
 *   2. selectUltVariant() 回傳包含 t3Name / t4Name / t5Name
 *   3. 傳神獸時會覆蓋 t5Name 為簽證招式
 *   4. 傳入無效變體名稱時回傳 null
 *   5. 回退機制正常（ULT_VARIANTS 缺失時自動產生 fallback 名稱）
 *
 * 使用方式：可在瀏覽器或 Node.js 中執行
 */

function runT5FallbackTests() {
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

  // Test 1: 每種屬性取第一個變體測試 selectUltVariant 回傳非 null
  for (var ti = 0; ti < EXPECTED_TYPES.length; ti++) {
    var type = EXPECTED_TYPES[ti];
    var typeSpec = TYPE_SPEC_V2[type];
    if (!typeSpec || !typeSpec.VARIANTS) {
      assert(false, "TYPE_SPEC_V2 缺少屬性「" + type + "」的 VARIANTS");
      continue;
    }
    var variantNames = Object.keys(typeSpec.VARIANTS);
    if (variantNames.length === 0) {
      assert(false, "屬性「" + type + "」沒有定義任何變體");
      continue;
    }
    var firstVariant = variantNames[0];
    var poke = { baseName: type + "測試獸", name: type + "測試獸", primaryType: type, isLegendary: false };
    var ultResult = selectUltVariant(poke, type, firstVariant);
    assert(ultResult !== null,
      "屬性「" + type + "」變體「" + firstVariant + "」selectUltVariant 不應為 null");
    if (ultResult) {
      assert(ultResult.t3Name != null && ultResult.t3Name !== "",
        "屬性「" + type + "」應有 t3Name，實際 " + JSON.stringify(ultResult.t3Name));
      assert(ultResult.t4Name != null && ultResult.t4Name !== "",
        "屬性「" + type + "」應有 t4Name，實際 " + JSON.stringify(ultResult.t4Name));
      assert(ultResult.t5Name != null && ultResult.t5Name !== "",
        "屬性「" + type + "」應有 t5Name，實際 " + JSON.stringify(ultResult.t5Name));
    }
  }

  // Test 2: 神獸簽證招式覆蓋測試
  var LEGENDARY_TESTS = [
    { name: "噴火龍", type: "火", variant: "物理猛攻型", expectT5: "火系·噴火龍制裁" },
    { name: "烈空坐", type: "龍", variant: "逆鱗強攻型", expectT5: "龍系·烈空坐裁決" },
  ];
  for (var li = 0; li < LEGENDARY_TESTS.length; li++) {
    var lt = LEGENDARY_TESTS[li];
    var legPoke = { baseName: lt.name, name: lt.name, primaryType: lt.type, isLegendary: true };
    var legResult = selectUltVariant(legPoke, lt.type, lt.variant);
    assert(legResult !== null,
      "神獸「" + lt.name + "」selectUltVariant 不應為 null");
    if (legResult) {
      assert(legResult.t5Name === lt.expectT5,
        "神獸「" + lt.name + "」t5Name 應為「" + lt.expectT5 + "」，實際「" + legResult.t5Name + "」");
    }
  }

  // Test 3: 非神獸不被覆蓋 t5Name
  var normalPoke = { baseName: "普通獸", name: "普通獸", primaryType: "一般", isLegendary: false };
  var normalResult = selectUltVariant(normalPoke, "一般", "物理強攻型");
  assert(normalResult !== null, "一般物理強攻型 selectUltVariant 不應為 null");
  if (normalResult) {
    assert(normalResult.t5Name.indexOf("制裁終章") !== -1 || normalResult.t5Name.indexOf("制裁") !== -1,
      "非神獸 t5Name 應保持 ULT_VARIANTS 預設值，實際「" + normalResult.t5Name + "」");
  }

  // Test 4: 傳入無效變體名稱應回傳 null
  var invalidResult = selectUltVariant(normalPoke, "一般", "不存在的變體");
  assert(invalidResult === null, "無效變體名稱應回傳 null，實際 " + JSON.stringify(invalidResult));

  // Test 5: 無效屬性應回傳 null
  var invalidTypeResult = selectUltVariant(normalPoke, "不存在屬性", "物理強攻型");
  assert(invalidTypeResult === null, "無效屬性應回傳 null");

  // Test 6: 驗證回退機制 — 若 ULT_VARIANTS 中某條目被刪除，selectUltVariant 仍會產生 fallback
  if (typeof ULT_VARIANTS !== "undefined") {
    var savedGeneralA = ULT_VARIANTS["一般"] && ULT_VARIANTS["一般"].A;
    if (savedGeneralA) {
      var originalGeneralA = savedGeneralA.slice();
      ULT_VARIANTS["一般"].A = null;
      var fallbackResult = selectUltVariant(normalPoke, "一般", "物理強攻型");
      assert(fallbackResult !== null, "ULT_VARIANTS 缺失時應自動 fallback 而非回傳 null");
      if (fallbackResult) {
        assert(fallbackResult.t3Name.indexOf("制裁衝擊") !== -1 || fallbackResult.t3Name.indexOf("制裁") !== -1,
          "fallback t3Name 應包含「制裁」，實際「" + fallbackResult.t3Name + "」");
      }
      ULT_VARIANTS["一般"].A = originalGeneralA;
    }
  }

  // 輸出結果
  console.log("========== T5 回退邏輯測試結果 ==========");
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
  global.runT5FallbackTests = runT5FallbackTests;
  var results = runT5FallbackTests();
  process.exit(results.failed > 0 ? 1 : 0);
} else if (typeof window !== "undefined") {
  window.runT5FallbackTests = runT5FallbackTests;
}