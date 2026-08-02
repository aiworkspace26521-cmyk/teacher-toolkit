#!/usr/bin/env node
// test/t5-fallback-test.js
// Phase 7: T5 備援依賴驗證 — 通用備援率 < 20%
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

var FALLBACK_ATK = ["終極衝擊"];
var FALLBACK_SPA = ["破壞光線"];

console.log("========== T5 備援依賴驗證 ==========");
console.log("角色範圍: ATK/SPA (BUF/DIS 使用最佳萬用招為正常設計)");
console.log("測試方式: 使用 resolveT5Move() 三層優先級(本系簽名→副屬性→萬用)");

if (!TYPE_SPEC_V2) {
  console.log("⚠️  TYPE_SPEC_V2 尚未定義（Phase 0 未完成），跳過 T5 備援驗證");
  process.exit(0);
}

if (typeof resolveT5Move !== "function") {
  console.log("⚠️  resolveT5Move 尚未定義（Phase 1 未完成），跳過 T5 備援驗證");
  process.exit(0);
}

var fallbackCount = 0;
var totalT5 = 0;
var typeResults = [];

for (var type in TYPE_SPEC_V2) {
  var spec = TYPE_SPEC_V2[type];
  if (!spec.VARIANTS) continue;

  var typeFallback = 0;
  var typeTotal = 0;

  for (var vName in spec.VARIANTS) {
    var variant = spec.VARIANTS[vName];
    var roles = ["ATK", "SPA"];

    for (var ri = 0; ri < roles.length; ri++) {
      var role = roles[ri];
      var t5Moves = variant.tiers && variant.tiers.T5 ? variant.tiers.T5[role] : null;

      // 使用 resolveT5Move 解析實際選招結果
      var dummyPkm = { type2: null };
      var resolvedMove = resolveT5Move(type, role, variant, dummyPkm);

      if (resolvedMove) {
        var fallbackList = role === "ATK" ? FALLBACK_ATK : FALLBACK_SPA;
        var isFallback = fallbackList.indexOf(resolvedMove) !== -1;
        if (isFallback) {
          fallbackCount++;
          typeFallback++;
        }
        totalT5++;
        typeTotal++;
      }
    }
  }

  typeResults.push({
    type: type,
    total: typeTotal,
    fallback: typeFallback,
    rate: typeTotal > 0 ? typeFallback / typeTotal : 0
  });
}

var rate = totalT5 > 0 ? fallbackCount / totalT5 : 0;

// 印出各屬性明細
console.log("\n各屬性 T5 備援率:");
var failedTypes = [];
for (var ri2 = 0; ri2 < typeResults.length; ri2++) {
  var tr = typeResults[ri2];
  var icon = tr.rate < 0.2 ? "✅" : (tr.rate < 0.4 ? "⚠️" : "❌");
  if (tr.rate >= 0.4) failedTypes.push(tr.type + " " + (tr.rate * 100).toFixed(1) + "%");
  console.log(
    "  " + icon + " " + tr.type +
    ": " + (tr.rate * 100).toFixed(1) + "%" +
    " (" + tr.fallback + "/" + tr.total + ")"
  );
}

console.log("\n總計 T5 備援率: " + (rate * 100).toFixed(1) + "% (" + fallbackCount + "/" + totalT5 + ")");

if (rate >= 0.2) {
  console.error("\n❌ T5 備援率 " + (rate * 100).toFixed(1) + "% 超過 20% 上限");
  process.exit(1);
}

if (failedTypes.length > 0) {
  console.error("\n❌ 單屬性 T5 備援率超過 40%: " + failedTypes.join("、"));
  process.exit(1);
}

console.log("\n✅ T5 備援率通過 (< 20% 總計，單屬性 < 40%)");