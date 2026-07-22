/**
 * 寶可夢招式規則系統 — 驗證測試腳本
 *
 * 使用方式：
 *   1. 將此腳本載入已包含 kpi-dashboard.html 的頁面中
 *   2. 或使用 Node.js + jsdom 模擬 DOM 環境執行
 *
 * 測試項目：
 *   1. getPokemonMoveset() 回傳陣列長度 = 4
 *   2. 每種寶可夢至少 1 招本系 STAB
 *   3. 沒有空值或 undefined
 *   4. 所有招式都在 MOVE_DATABASE 中有定義
 *   5. validateMoveset() 對所有 SPECIES_LEARNSET 物種 PASS
 */

function runMovesetValidationTests() {
  var results = { total: 0, passed: 0, failed: 0, errors: [] };
  function assert(condition, msg) {
    results.total++;
    if (condition) { results.passed++; }
    else { results.failed++; results.errors.push(msg); }
  }

  // Test 1: getPokemonMoveset() 回傳陣列長度 = 4
  var testSpecies = Object.keys(SPECIES_LEARNSET);
  for (var si = 0; si < testSpecies.length; si++) {
    var name = testSpecies[si];
    // 測試低中高三個等級
    var levels = [5, 25, 50];
    for (var li = 0; li < levels.length; li++) {
      var moves = getPokemonMoveset(name, levels[li]);
      assert(Array.isArray(moves), name + " Lv" + levels[li] + " 回傳應為陣列");
      assert(moves.length === 4, name + " Lv" + levels[li] + " 應有 4 招，實際 " + moves.length);
    }
  }

  // Test 2: 每種至少 1 招本系 STAB
  for (var si2 = 0; si2 < testSpecies.length; si2++) {
    var name2 = testSpecies[si2];
    var types = POKEMON_SPECIES_TYPES[name2] || ["一般"];
    var moves2 = getPokemonMoveset(name2, 50);
    var hasStab = false;
    for (var mi = 0; mi < moves2.length; mi++) {
      var dt = getMoveDetails(moves2[mi]);
      if (dt && types.indexOf(dt.type) !== -1) { hasStab = true; break; }
    }
    assert(hasStab, name2 + " Lv50 應至少 1 招本系招，實際 " + moves2.join(","));
  }

  // Test 3: 沒有空值或 undefined
  for (var si3 = 0; si3 < testSpecies.length; si3++) {
    var name3 = testSpecies[si3];
    var moves3 = getPokemonMoveset(name3, 30);
    for (var mi2 = 0; mi2 < moves3.length; mi2++) {
      assert(moves3[mi2] != null && moves3[mi2] !== "", name3 + " 第 " + (mi2+1) + " 招不應為空值");
    }
  }

  // Test 4: 所有招式都在 MOVE_DATABASE 中有定義
  for (var si4 = 0; si4 < testSpecies.length; si4++) {
    var name4 = testSpecies[si4];
    var moves4 = getPokemonMoveset(name4, 40);
    for (var mi3 = 0; mi3 < moves4.length; mi3++) {
      var mv = moves4[mi3];
      assert(MOVE_DATABASE[mv] !== undefined, name4 + " 的招式「" + mv + "」未在 MOVE_DATABASE 中定義");
    }
  }

  // Test 5: validateMoveset() 驗證 SPECIES_LEARNSET 所有物種
  for (var si5 = 0; si5 < testSpecies.length; si5++) {
    var name5 = testSpecies[si5];
    var moves5 = getPokemonMoveset(name5, 50);
    var vResult = validateMoveset(name5, moves5);
    assert(vResult.passed, name5 + " validateMoveset 應 PASS，違規：" + JSON.stringify(vResult.violations));
  }

  // Test 6: generateLearnset() 產生合理招式（測試非 SPECIES_LEARNSET 物種）
  var testGenerations = [
    { raw: "波波", types: ["一般","飛行"], tier: "一般" },
    { raw: "小拉達", types: ["一般"], tier: "一般" },
    { raw: "凱西", types: ["超能力"], tier: "稀有" },
  ];
  for (var gi = 0; gi < testGenerations.length; gi++) {
    var tg = testGenerations[gi];
    var genPool = generateLearnset(tg.raw, tg.types, tg.tier);
    assert(Array.isArray(genPool), tg.raw + " generateLearnset 回傳應為陣列");
    assert(genPool.length >= 6, tg.raw + " generateLearnset 應至少 6 招，實際 " + genPool.length);
  }

  // Test 7: 驗收標準 — 太陽伊布不應有月亮之力
  var eeveeMoves = getPokemonMoveset("太陽伊布", 19);
  assert(eeveeMoves.indexOf("月亮之力") === -1, "太陽伊布 Lv19 不應有月亮之力，實際 " + eeveeMoves.join(","));

  // Test 8: 驗收標準 — 太陽伊布應有暗影球
  assert(eeveeMoves.indexOf("暗影球") !== -1, "太陽伊布 Lv19 應有暗影球，實際 " + eeveeMoves.join(","));

  // Test 9: 驗收標準 — validateMoveset 應拒絕月亮之力
  var vResult2 = validateMoveset("太陽伊布", ["精神強念","月亮之力"]);
  assert(vResult2.passed === false, "太陽伊布 + 月亮之力 validateMoveset 應 FAIL");

  // Test 10: 驗收標準 — 水伊布 Lv30 4 招都合法
  var vaporeonMoves = getPokemonMoveset("水伊布", 30);
  var vResult3 = validateMoveset("水伊布", vaporeonMoves);
  assert(vResult3.passed, "水伊布 Lv30 " + vaporeonMoves.join(",") + " validateMoveset 應 PASS");

  // 輸出結果
  console.log("========== 招式規則系統測試結果 ==========");
  console.log("總計: " + results.total + " | 通過: " + results.passed + " | 失敗: " + results.failed);
  if (results.errors.length > 0) {
    console.log("--- 失敗項目 ---");
    for (var ei = 0; ei < results.errors.length; ei++) {
      console.log("  " + (ei+1) + ". " + results.errors[ei]);
    }
  }
  console.log("==========================================");
  return results;
}

// 若在瀏覽器環境中執行
if (typeof window !== "undefined") {
  window.runMovesetValidationTests = runMovesetValidationTests;
}
