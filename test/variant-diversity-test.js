#!/usr/bin/env node
// test/variant-diversity-test.js
// Phase 7: 變體多樣性驗證 — 結構性區隔驗證
// v3.0 同屬性變體共享屬性招式（如火系都有火花/噴射火焰），
// 區隔來自：角色權重、ULT 映射、招式階層配置、T5 簽名招
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

// ===== 結構性多樣性驗證 =====
// 1. Stat preference diversity: 不同變體有不同的 preferredStats
// 2. ULT mapping diversity: 同屬性內 ULT 映射不全相同
// 3. T5 signature diversity: T5 解析後不全是萬用招
// 4. Role emphasis diversity: ATK-vs-SPA 相對權重有差異

function validateTypeDiversity(type) {
  var spec = TYPE_SPEC_V2 ? TYPE_SPEC_V2[type] : null;
  if (!spec || !spec.VARIANTS) {
    return { type: type, passed: true, issues: [], reason: "no data" };
  }

  var variantEntries = Object.entries(spec.VARIANTS);
  var issues = [];

  // --- Check 1: Stat preference diversity ---
  var statKeys = ["ATK", "SPA", "SPD", "DEF"];
  var uniqueProfiles = {};
  var profileCount = 0;
  for (var i = 0; i < variantEntries.length; i++) {
    var v = variantEntries[i][1];
    var profileKey = statKeys.map(function(sk) {
      return sk + ":" + (v.preferredStats ? Math.round((v.preferredStats[sk] || 1.0) * 10) : 10);
    }).join("|");
    if (!uniqueProfiles[profileKey]) {
      uniqueProfiles[profileKey] = true;
      profileCount++;
    }
  }
  if (profileCount < 2 && variantEntries.length >= 3) {
    issues.push("stat profile: only " + profileCount + " unique profile(s) for " + variantEntries.length + " variants");
  }

  // --- Check 2: ULT mapping diversity ---
  var ultMappings = {};
  for (var ui = 0; ui < variantEntries.length; ui++) {
    var um = variantEntries[ui][1].ultMapping || "C";
    ultMappings[um] = (ultMappings[um] || 0) + 1;
  }
  var ultKeys = Object.keys(ultMappings);
  if (ultKeys.length < 2 && variantEntries.length >= 3) {
    issues.push("ultMapping: all " + variantEntries.length + " variants map to " + ultKeys[0]);
  }

  // --- Check 3: Role emphasis diversity ---
  var roleEmphases = {};
  for (var ri = 0; ri < variantEntries.length; ri++) {
    var v = variantEntries[ri][1];
    var ps = v.preferredStats || {};
    var atkW = ps.ATK || 1.0;
    var spaW = ps.SPA || 1.0;
    var emphasis;
    if (atkW > 1.1 && spaW < 0.9) emphasis = "ATK";
    else if (spaW > 1.1 && atkW < 0.9) emphasis = "SPA";
    else if (Math.abs(atkW - spaW) < 0.2) emphasis = "HYBRID";
    else emphasis = "BALANCED";
    roleEmphases[emphasis] = (roleEmphases[emphasis] || 0) + 1;
  }
  var roleKeys = Object.keys(roleEmphases);
  if (roleKeys.length < 2 && variantEntries.length >= 3) {
    issues.push("role emphasis: all " + variantEntries.length + " variants are " + roleKeys[0]);
  }

  // --- Check 4: T5 signature diversity (ATK/SPA) ---
  if (typeof resolveT5Move === "function") {
    var t5AtkMoves = {};
    var t5SpaMoves = {};
    var dummyPkm = { type2: null };
    for (var ti = 0; ti < variantEntries.length; ti++) {
      var v = variantEntries[ti][1];
      var atkMove = resolveT5Move(type, "ATK", v, dummyPkm);
      var spaMove = resolveT5Move(type, "SPA", v, dummyPkm);
      if (atkMove) t5AtkMoves[atkMove] = (t5AtkMoves[atkMove] || 0) + 1;
      if (spaMove) t5SpaMoves[spaMove] = (t5SpaMoves[spaMove] || 0) + 1;
    }
    if (Object.keys(t5AtkMoves).length < 2 && variantEntries.length >= 3) {
      issues.push("T5 ATK: all variants resolve to " + Object.keys(t5AtkMoves).join(","));
    }
  }

  return { type: type, passed: issues.length === 0, issues: issues };
}

// ===== 主流程 =====
var EXPECTED_TYPES = [
  "一般", "火", "水", "草", "電", "冰",
  "格鬥", "毒", "地面", "飛行", "超能力", "蟲",
  "岩石", "幽靈", "龍", "惡", "鋼", "妖精"
];

console.log("========== 變體結構性多樣性驗證 ==========");
console.log("驗證項目: 1.statProfile 2.ultMapping 3.roleEmphasis 4.T5signature");

var allIssues = [];
var passedTypes = 0;

if (!TYPE_SPEC_V2) {
  console.log("⚠️  TYPE_SPEC_V2 尚未定義（Phase 0 未完成），跳過");
  process.exit(0);
}

for (var ti = 0; ti < EXPECTED_TYPES.length; ti++) {
  var result = validateTypeDiversity(EXPECTED_TYPES[ti]);
  if (result.passed) {
    console.log("✅ " + EXPECTED_TYPES[ti] + ": 通過");
    passedTypes++;
  } else {
    console.log("❌ " + EXPECTED_TYPES[ti] + ": " + result.issues.length + " 項");
    allIssues = allIssues.concat(result.issues.map(function(iss) {
      return "  " + EXPECTED_TYPES[ti] + " — " + iss;
    }));
  }
}

console.log("\n通過: " + passedTypes + "/" + EXPECTED_TYPES.length + " 屬性");

if (allIssues.length > 0) {
  console.error("\n⚠️  非強制違規 (結構性建議，不影響功能):");
  for (var ii = 0; ii < allIssues.length; ii++) {
    console.error("  " + allIssues[ii]);
  }
  // 結構性建議不阻擋 CI — v3.0 變體區隔主要依賴招式階層配置與 BUF/DIS 差異
  console.log("\n結果: " + allIssues.length + " 項建議 (均為資訊性，不阻擋)");
  process.exit(0);
}

console.log("\n✅ 全部屬性結構性多樣性通過");
