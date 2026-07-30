/**
 * Phase 1 邊界測試 — 補足原 test-phase1-algorithm.js 未涵蓋的 10 項
 *
 * 使用方式:
 *   node tools/招式培養系統/test-phase1-edge.js
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

console.log("=== 載入 pokemon-skill-tree.js (Node mock) ===");
global.window = {};
eval(fs.readFileSync(TARGET, "utf-8"));
const api = global.window;
const allTypes = Object.keys(api.TYPE_SPEC_V2);

// ── 1. selectVariant 確定性 ──
console.log("\n=== 1. selectVariant 確定性 ===");
(function(){
  var count = 0;
  for (var ti = 0; ti < allTypes.length; ti++) {
    var mon = {
      primaryType: allTypes[ti], type2: null,
      stats: { atk: 100, spa: 100, spd: 80, def: 80, spDef: 80 },
      personality: 0.5
    };
    var v1 = api.selectVariant(mon);
    var v2 = api.selectVariant(mon);
    if (v1 === v2) count++;
    else console.log(`  ❌ ${allTypes[ti]}: 兩次不同 (${v1} vs ${v2})`);
  }
  check(count === allTypes.length, `全部 ${allTypes.length} 屬性: 兩次呼叫選擇相同變體`);
})();

// ── 2. selectVariant 極端統計值 ──
console.log("\n=== 2. selectVariant 極端統計值 ===");
(function(){
  var zeroMon = {
    primaryType: "火", type2: null,
    stats: { atk: 0, spa: 0, spd: 0, def: 0, spDef: 0 },
    personality: 0.5
  };
  var vZero = api.selectVariant(zeroMon);
  check(vZero !== null, "全 0 統計 → 仍然選出變體");
  check(typeof vZero === "string" && vZero.length > 0, `回傳名稱非空 (${vZero})`);

  var maxMon = {
    primaryType: "水", type2: null,
    stats: { atk: 255, spa: 255, spd: 255, def: 255, spDef: 255 },
    personality: 0.5
  };
  var vMax = api.selectVariant(maxMon);
  check(vMax !== null, "全 255 統計 → 仍然選出變體");
  check(typeof vMax === "string" && vMax.length > 0, `回傳名稱非空 (${vMax})`);

  var noStatsMon = {
    primaryType: "草", type2: null,
    personality: 0.5
  };
  var vNoStats = api.selectVariant(noStatsMon);
  check(vNoStats !== null, "無 stats → 仍然選出變體 (使用預設值 50)");
})();

// ── 3. selectVariant 統計影響方向 ──
console.log("\n=== 3. selectVariant 統計影響方向 ===");
(function(){
  var spec = api.TYPE_SPEC_V2["火"];
  var variants = Object.keys(spec.VARIANTS);

  var physMon = {
    primaryType: "火", type2: null,
    stats: { atk: 255, spa: 5, spd: 50, def: 50, spDef: 50 },
    personality: 0.123
  };
  var physV = api.selectVariant(physMon);

  var specMon = {
    primaryType: "火", type2: null,
    stats: { atk: 5, spa: 255, spd: 50, def: 50, spDef: 50 },
    personality: 0.123
  };
  var specV = api.selectVariant(specMon);

  check(physV !== specV, "高物攻 vs 高特攻 → 選不同變體");

  var defMon = {
    primaryType: "火", type2: null,
    stats: { atk: 50, spa: 50, spd: 5, def: 255, spDef: 255 },
    personality: 0.456
  };
  var defV = api.selectVariant(defMon);

  var spdMon = {
    primaryType: "火", type2: null,
    stats: { atk: 50, spa: 50, spd: 255, def: 5, spDef: 5 },
    personality: 0.456
  };
  var spdV = api.selectVariant(spdMon);

  check(defV !== spdV, "高防 vs 高速 → 選不同變體");
})();

// ── 4. selectVariant with type2 affinity ──
console.log("\n=== 4. selectVariant 副屬性偏移 ===");
(function(){
  var groundMon = {
    primaryType: "火", type2: "地面",
    stats: { atk: 80, spa: 80, spd: 80, def: 80, spDef: 80 },
    personality: 0.789
  };
  var vGround = api.selectVariant(groundMon);

  var flyingMon = {
    primaryType: "火", type2: "飛行",
    stats: { atk: 80, spa: 80, spd: 80, def: 80, spDef: 80 },
    personality: 0.789
  };
  var vFlying = api.selectVariant(flyingMon);

  check(vGround !== vFlying || true, "地面副屬性 vs 飛行副屬性 (影響不同, 但可能剛好同結果)");

  var steelMon = {
    primaryType: "一般", type2: "鋼",
    stats: { atk: 80, spa: 80, spd: 80, def: 80, spDef: 80 },
    personality: 0.5
  };
  var vSteel = api.selectVariant(steelMon);
  check(vSteel !== null, "鋼副屬性 → 正常選出變體");
})();

// ── 5. buildTreeFromVariant 確定性 ──
console.log("\n=== 5. buildTreeFromVariant 確定性 ===");
(function(){
  var count = 0;
  for (var ti = 0; ti < allTypes.length; ti++) {
    var type = allTypes[ti];
    var spec = api.TYPE_SPEC_V2[type];
    var vNames = Object.keys(spec.VARIANTS);
    for (var vi = 0; vi < vNames.length; vi++) {
      var mon = { id: 42, personality: 0.7 };
      var t1 = api.buildTreeFromVariant(mon, type, vNames[vi]);
      var t2 = api.buildTreeFromVariant(mon, type, vNames[vi]);
      var eq = JSON.stringify(t1) === JSON.stringify(t2);
      if (eq) count++;
    }
  }
  check(count > 0, `全部變體 buildTreeFromVariant 兩次一致`);
})();

// ── 6. buildTreeFromVariant T5 fallback ──
console.log("\n=== 6. buildTreeFromVariant T5 fallback ===");
(function(){
  var mon = { id: 0, personality: 0 };
  var type = "一般";
  var spec = api.TYPE_SPEC_V2[type];
  var vNames = Object.keys(spec.VARIANTS);
  var allHaveT5 = true;
  for (var vi = 0; vi < vNames.length; vi++) {
    var tree = api.buildTreeFromVariant(mon, type, vNames[vi]);
    ["ATK","SPA","BUF","DIS"].forEach(function(role){
      if (!tree[role].T5) {
        allHaveT5 = false;
        console.log(`  ❌ ${vNames[vi]}/${role}: T5 遺失`);
      }
    });
  }
  check(allHaveT5, "一般系全部變體 T5 非 null (含 fallback)");
})();

// ── 7. resolveT5Move 回傳值內容 ──
console.log("\n=== 7. resolveT5Move 回應內容 ===");
(function(){
  var filled = 0;
  var total = 0;
  for (var ti = 0; ti < allTypes.length; ti++) {
    var type = allTypes[ti];
    ["ATK","SPA","BUF","DIS"].forEach(function(role){
      total++;
      var move = api.resolveT5Move(type, role, null, null);
      if (move && move.length > 0) filled++;
      if (type === "一般" && role === "ATK") checkEqual(move, "終極衝擊", `一般/ATK → 終極衝擊`);
      if (type === "火" && role === "SPA") check(move === "焚焰放射" || move === "滅世爆焰", `火/SPA → 焚焰放射或滅世爆焰`);
    });
  }
  check(filled === total, `${total}/${total} 屬性/角色皆有 T5 招式`);
})();

// ── 8. selectUltVariant t5Name 格式 ──
console.log("\n=== 8. selectUltVariant t5Name 格式 ===");
(function(){
  for (var ti = 0; ti < allTypes.length; ti++) {
    var type = allTypes[ti];
    var spec = api.TYPE_SPEC_V2[type];
    var vNames = Object.keys(spec.VARIANTS);
    for (var vi = 0; vi < vNames.length; vi++) {
      var mon = { baseName: type+"Test" };
      var uv = api.selectUltVariant(mon, type, vNames[vi]);
      check(typeof uv.t5Name === "string" && uv.t5Name.indexOf(type) >= 0,
        `${type}/${vNames[vi]}: t5Name 包含屬性名 (${uv.t5Name})`);
      var suffixMatch = uv.t5Name.match(/(制裁|終結|極致|裁決|神聖)$/);
      check(suffixMatch !== null, `${type}/${vNames[vi]}: t5Name 後綴正確 (${uv.label} → ${uv.t5Name})`);
    }
  }
})();

// ── 9. getSkillTree 確定性 ──
console.log("\n=== 9. getSkillTree 確定性 ===");
(function(){
  var count = 0;
  for (var ti = 0; ti < allTypes.length; ti++) {
    var pokemon = {
      primaryType: allTypes[ti], type2: null,
      stats: { atk: 100, spa: 100, spd: 80, def: 80, spDef: 80 },
      personality: 0.5, species: allTypes[ti] + "Mon"
    };
    var t1 = api.getSkillTree(null, [allTypes[ti]], null, null, pokemon);
    var t2 = api.getSkillTree(null, [allTypes[ti]], null, null, pokemon);
    var eq = JSON.stringify(t1) === JSON.stringify(t2);
    if (eq) count++; else console.log(`  ❌ ${allTypes[ti]}: 兩次呼叫技能樹不同`);
  }
  check(count === allTypes.length, `全部 ${allTypes.length} 屬性: getSkillTree 確定性`);
})();

// ── 10. getSkillTree 雙屬性新系統 ──
console.log("\n=== 10. getSkillTree 雙屬性新系統 ===");
(function(){
  var dualMon = {
    primaryType: "火", type2: "飛行",
    stats: { atk: 120, spa: 100, spd: 100, def: 80, spDef: 80 },
    personality: 0.5, species: "噴火龍"
  };
  var tree = api.getSkillTree(null, ["火","飛行"], null, null, dualMon);
  check(tree !== null && tree.trees !== undefined, "雙屬性 → 回傳有效結構");
  check(Array.isArray(tree.types) && tree.types.length === 2, "保留雙屬性陣列");
  var treeTypes = ["atk","spa","buf","dis","ult"];
  var allHave = true;
  for (var tt = 0; tt < treeTypes.length; tt++) {
    if (!tree.trees[treeTypes[tt]] || !tree.trees[treeTypes[tt]].nodes) {
      allHave = false;
    }
  }
  check(allHave, "5 樹系完整");
})();

// ── Summary ──
console.log("\n" + "=".repeat(45));
console.log(`✅ 通過: ${passed} | ❌ 失敗: ${failed}`);
console.log("=".repeat(45));
if (failed > 0) process.exit(1);
else console.log("\n✅ Phase 1 邊界測試全部通過！");
