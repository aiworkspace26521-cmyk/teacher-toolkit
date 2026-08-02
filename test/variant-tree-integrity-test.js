#!/usr/bin/env node
// test/variant-tree-integrity-test.js
// E1: 變體招式樹完整性 — 同角色各 tier 招式池兩兩不交集
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

console.log("========== 變體招式樹完整性驗證 (E1) ==========");
console.log("判定標準: 同角色(ATK/SPA/BUF/DIS)各 tier 招式池兩兩不交集");

if (!TYPE_SPEC_V2) {
  console.log("⚠️  TYPE_SPEC_V2 尚未定義，跳過驗證");
  process.exit(0);
}

var TIERS = ["T1", "T2", "T3", "T4", "T5"];
var ROLES = ["ATK", "SPA", "BUF", "DIS"];
var issues = [];
var variantCount = 0;

for (var type in TYPE_SPEC_V2) {
  var spec = TYPE_SPEC_V2[type];
  if (!spec.VARIANTS) continue;

  for (var vName in spec.VARIANTS) {
    var variant = spec.VARIANTS[vName];
    if (!variant.tiers) continue;
    variantCount++;

    for (var ri = 0; ri < ROLES.length; ri++) {
      var role = ROLES[ri];
      var pools = [];

      for (var ti = 0; ti < TIERS.length; ti++) {
        pools.push((variant.tiers[TIERS[ti]] && variant.tiers[TIERS[ti]][role])
          ? variant.tiers[TIERS[ti]][role].slice()
          : []);
      }

      for (var i = 0; i < pools.length; i++) {
        for (var j = i + 1; j < pools.length; j++) {
          if (!pools[i].length || !pools[j].length) continue;
          var overlap = pools[i].filter(function (m) {
            return pools[j].indexOf(m) >= 0;
          });
          if (overlap.length) {
            issues.push(
              type + "/" + vName + "/" + role +
              ": T" + (i + 1) + " & T" + (j + 1) +
              " overlap=" + overlap.join("/")
            );
          }
        }
      }
    }
  }
}

if (issues.length > 0) {
  console.error("\n❌ 發現 " + issues.length + " 個招式池重複 (共檢查 " + variantCount + " 個變體):");
  for (var k = 0; k < issues.length; k++) {
    console.error("  " + issues[k]);
  }
  console.error("\n請修正 TYPE_SPEC_V2 資料面，確保同角色各 tier 招式池兩兩不交集");
  process.exit(1);
}

console.log("\n✅ 檢查 " + variantCount + " 個變體 × " + ROLES.length + " 角色: 招式池兩兩不交集，無重複");
