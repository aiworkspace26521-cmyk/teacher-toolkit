#!/usr/bin/env node
// test/variant-consistency-test.js
// Phase 7: 變體選擇一致性測試 — 同一寶可夢永遠得到相同變體選擇結果
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

var selectVariant = sandbox.window.selectVariant;
var TYPE_SPEC_V2 = sandbox.window.TYPE_SPEC_V2;

console.log("========== 變體選擇一致性測試 ==========");

if (typeof selectVariant !== "function") {
  console.log("⚠️  selectVariant() 尚未實作（Phase 1 未完成），跳過一致性測試");
  process.exit(0);
}

var testPokemon = [
  {
    name: "噴火龍",
    primaryType: "火",
    type2: "飛行",
    stats: { atk: 84, spa: 109, spd: 100, def: 78, spDef: 85, hp: 78 },
    personality: 42
  },
  {
    name: "烈咬陸鯊",
    primaryType: "龍",
    type2: "地面",
    stats: { atk: 130, spa: 80, spd: 102, def: 95, spDef: 85, hp: 108 },
    personality: 201
  },
  {
    name: "甲賀忍蛙",
    primaryType: "水",
    type2: "惡",
    stats: { atk: 95, spa: 103, spd: 122, def: 67, spDef: 71, hp: 72 },
    personality: 55
  }
];

var allPassed = true;

for (var pi = 0; pi < testPokemon.length; pi++) {
  var p = testPokemon[pi];
  var results = {};

  for (var i = 0; i < 100; i++) {
    var result = selectVariant(p);
    results[result] = (results[result] || 0) + 1;
  }

  var uniqueResults = Object.keys(results).length;

  if (uniqueResults !== 1) {
    console.error(
      "❌ " + p.name + ": 100 次產生了 " + uniqueResults + " 種不同結果"
    );
    for (var r in results) {
      console.error("     " + r + ": " + results[r] + " 次");
    }
    allPassed = false;
  } else {
    var variant = Object.keys(results)[0];
    console.log("✅ " + p.name + ": 100 次一致 = " + variant);
  }
}

if (!allPassed) {
  console.error("\n❌ 部分寶可夢變體選擇不一致");
  process.exit(1);
}

console.log("\n✅ 所有寶可夢變體選擇一致性通過");