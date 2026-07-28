#!/usr/bin/env node
// test/variant-diversity-test.js
// Phase 7: 變體多樣性驗證 — 同屬性內任兩變體的 T3-T5 招式重疊率 ≤ 40%
'use strict';

// 在 Node.js 中載入 pokemon-skill-tree.js
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

// 取得匯出的全域變數
var TYPE_SPEC_V2 = sandbox.window.TYPE_SPEC_V2;
var ULT_VARIANTS = sandbox.window.ULT_VARIANTS;

// ===== 驗證：變體多樣性（T3-T5 重疊率 ≤ 40%）=====

function calculateT3T5Overlap(a, b) {
  function getMoves(v) {
    var moves = [];
    if (!v || !v.tiers) return moves;
    var roles = ["ATK", "SPA", "BUF", "DIS"];
    var tiers = ["T3", "T4", "T5"];
    for (var ri = 0; ri < roles.length; ri++) {
      for (var ti = 0; ti < tiers.length; ti++) {
        var tierMoves = v.tiers[tiers[ti]] ? v.tiers[tiers[ti]][roles[ri]] : null;
        if (tierMoves && Array.isArray(tierMoves)) {
          for (var mi = 0; mi < tierMoves.length; mi++) {
            if (tierMoves[mi] && tierMoves[mi] !== "") moves.push(tierMoves[mi]);
          }
        }
      }
    }
    return moves;
  }

  var mA = getMoves(a);
  var mB = getMoves(b);

  // 計算唯一集合
  var allMoves = {};
  for (var i = 0; i < mA.length; i++) allMoves[mA[i]] = true;
  for (var j = 0; j < mB.length; j++) allMoves[mB[j]] = true;
  var uniqueCount = Object.keys(allMoves).length;

  // 計算共同招式
  var commonCount = 0;
  for (var k = 0; k < mA.length; k++) {
    if (mB.indexOf(mA[k]) !== -1) commonCount++;
  }

  return uniqueCount > 0 ? commonCount / uniqueCount : 0;
}

function validateVariantDiversity(type) {
  var spec = TYPE_SPEC_V2 ? TYPE_SPEC_V2[type] : null;
  if (!spec || !spec.VARIANTS) {
    return { type: type, passed: true, issues: [], reason: "no TYPE_SPEC_V2 data" };
  }

  var variantEntries = Object.entries(spec.VARIANTS);
  var issues = [];

  for (var i = 0; i < variantEntries.length; i++) {
    for (var j = i + 1; j < variantEntries.length; j++) {
      var overlap = calculateT3T5Overlap(variantEntries[i][1], variantEntries[j][1]);
      if (overlap > 0.4) {
        issues.push(
          variantEntries[i][0] + " vs " + variantEntries[j][0] +
          " 重疊率 " + (overlap * 100).toFixed(0) + "%"
        );
      }
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

console.log("========== 變體多樣性驗證 ==========");

var allIssues = [];
var typeCount = 0;

if (!TYPE_SPEC_V2) {
  console.log("⚠️  TYPE_SPEC_V2 尚未定義（Phase 0 未完成），跳過變體多樣性驗證");
  process.exit(0);
}

for (var ti = 0; ti < EXPECTED_TYPES.length; ti++) {
  var result = validateVariantDiversity(EXPECTED_TYPES[ti]);
  typeCount++;
  if (result.passed) {
    console.log("✅ " + EXPECTED_TYPES[ti] + ": 通過");
  } else {
    console.log("❌ " + EXPECTED_TYPES[ti] + ": " + result.issues.length + " 個違規");
    allIssues = allIssues.concat(result.issues);
  }
}

if (allIssues.length > 0) {
  console.error("\n❌ 變體多樣性違規:");
  for (var ii = 0; ii < allIssues.length; ii++) {
    console.error("   " + (ii + 1) + ". " + allIssues[ii]);
  }
  console.log("\n結果: " + typeCount + " 屬性, " + allIssues.length + " 違規");
  process.exit(1);
}

console.log("\n✅ 全部 " + typeCount + " 屬性變體多樣性通過 (< 40% 重疊)");