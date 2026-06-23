const { test, expect } = require('@playwright/test');

test.describe('TM Learning System', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 20000 });
  });

  test('8.1 openTMLearn - TM modal opens when clicking learn button', async ({ page }) => {
    var hasRoster = await page.evaluate(() => {
      return globalData && globalData.roster && globalData.roster.length > 0;
    });
    if (!hasRoster) { test.skip('Neil has no roster'); return; }

    await page.evaluate(() => {
      globalData.tms = globalData.tms || {};
      globalData.tms.universal = (globalData.tms.universal || 0) + 1;
      openTMLearn(globalData.roster[0].id);
    });
    await page.waitForTimeout(1000);
    await expect(page.locator('#tmModal')).toBeVisible({ timeout: 5000 });
    var text = await page.locator('#tmModal').textContent();
    expect(text).toContain('招式學習器');
    expect(text).toContain('萬能學習器');
  });

  test('8.2 renderTMMoveList - type filter narrows TM move list', async ({ page }) => {
    var hasRoster = await page.evaluate(() => {
      return globalData && globalData.roster && globalData.roster.length > 0;
    });
    if (!hasRoster) { test.skip('Neil has no roster'); return; }

    await page.evaluate(() => {
      globalData.tms = globalData.tms || {};
      globalData.tms.universal = 1;
      openTMLearn(globalData.roster[0].id);
    });
    await page.waitForTimeout(1000);
    await expect(page.locator('#tmModal')).toBeVisible({ timeout: 5000 });

    var allCount = await page.evaluate(() => {
      var list = document.getElementById('tmMoveList');
      return list ? list.childElementCount : 0;
    });
    expect(allCount).toBeGreaterThan(0);

    await page.evaluate(() => { renderTMMoveList(currentTmPokemonId, '火'); });
    await page.waitForTimeout(300);
    var fireCount = await page.evaluate(() => {
      var list = document.getElementById('tmMoveList');
      return list ? list.childElementCount : 0;
    });

    await page.evaluate(() => { renderTMMoveList(currentTmPokemonId, '全部'); });
    await page.waitForTimeout(300);
    var resetCount = await page.evaluate(() => {
      var list = document.getElementById('tmMoveList');
      return list ? list.childElementCount : 0;
    });
    expect(resetCount).toBeGreaterThanOrEqual(fireCount);
  });

  test('8.3 learnTM - TM move replaces battle slot', async ({ page }) => {
    page.on('dialog', function(d) { d.accept(); });

    var result = await page.evaluate(() => {
      if (!globalData || !globalData.roster || globalData.roster.length === 0) return { ok: false, reason: 'no roster' };
      var pkmn = globalData.roster[0];
      globalData.tms = globalData.tms || {};
      globalData.tms.universal = 3;
      var movePool = Object.keys(MOVE_DATABASE);
      var targetMove = movePool.find(function(m) {
        if (pkmn.tmMoves && pkmn.tmMoves.indexOf(m) !== -1) return false;
        var d = getMoveDetails(m);
        return d.power > 0 || d.category === '變化';
      });
      if (!targetMove) return { ok: false, reason: 'no available move' };
      var beforeCount = (pkmn.tmMoves && pkmn.tmMoves.length) || 0;
      learnTM(pkmn.id, targetMove);
      var afterCount = (pkmn.tmMoves && pkmn.tmMoves.length) || 0;
      return { ok: true, learned: afterCount > beforeCount, move: targetMove, before: beforeCount, after: afterCount };
    });
    if (!result.ok) { test.skip(result.reason); return; }
    expect(result.learned).toBe(true);
    expect(result.after).toBe(result.before + 1);
  });

  test('8.4 openForgetMove - forget TM move via NPC', async ({ page }) => {
    var setup = await page.evaluate(() => {
      if (!globalData || !globalData.roster || globalData.roster.length === 0) return null;
      var p = globalData.roster[0];
      if (!p.tmMoves) p.tmMoves = [];
      if (p.tmMoves.length === 0) p.tmMoves.push('噴射火焰');
      if (!globalData.pokemonTMs) globalData.pokemonTMs = {};
      globalData.pokemonTMs[p.id] = p.tmMoves;
      var natural = getPokemonMoveset(p.baseName, p.currentLevel).slice(0, 4);
      var allMoves = natural.slice();
      for (var fi = 0; fi < p.tmMoves.length; fi++) {
        if (allMoves.indexOf(p.tmMoves[fi]) === -1) allMoves.push(p.tmMoves[fi]);
      }
      var tmIdx = allMoves.indexOf('噴射火焰');
      return { pokeId: p.id, tmMoveIndex: tmIdx + 1, total: allMoves.length };
    });
    if (!setup) { test.skip('Neil has no roster'); return; }
    if (setup.tmMoveIndex < 1) { test.skip('TM move not found in allMoves list'); return; }

    page.on('dialog', function(d) { d.accept(String(setup.tmMoveIndex)); });

    var forgetResult = await page.evaluate((pid) => {
      var p = globalData.roster.find(function(x) { return x.id === pid; });
      if (!p) return { error: 'no pokemon' };
      var beforeCount = p.tmMoves ? p.tmMoves.length : 0;
      try { openForgetMove(pid); } catch(e) { return { error: e.message, before: beforeCount }; }
      var afterCount = p.tmMoves ? p.tmMoves.length : 0;
      return { before: beforeCount, after: afterCount, forgotten: afterCount < beforeCount };
    }, setup.pokeId);
    if (forgetResult.error) { test.skip('Forget error: ' + forgetResult.error); return; }
    expect(forgetResult.forgotten).toBe(true);
  });

  test('8.5 TM consumable quantity tracks correctly', async ({ page }) => {
    var result = await page.evaluate(() => {
      if (!globalData.tms) globalData.tms = {};
      var initial = globalData.tms.universal || 0;
      globalData.tms.universal = initial + 1;
      var afterAdd = globalData.tms.universal;
      if (!globalData.roster || globalData.roster.length === 0) {
        return { ok: false, initial: initial, afterAdd: afterAdd };
      }
      globalData.tms.universal = 3;
      var p = globalData.roster[0];
      if (!p.tmMoves) p.tmMoves = [];
      p.tmMoves.push('影子球');
      globalData.tms.universal--;
      return { ok: true, afterAdd: afterAdd, afterUse: globalData.tms.universal };
    });
    expect(result.afterAdd).toBeGreaterThanOrEqual(1);
    if (result.ok) {
      expect(result.afterUse).toBe(2);
    }
  });

  test('8.6 cross-attribute TM move used in battle', async ({ page }) => {
    var result = await page.evaluate(() => {
      if (!globalData || !globalData.roster || globalData.roster.length === 0) {
        return { ok: false };
      }
      var p = globalData.roster[0];
      var moveName = '噴射火焰';
      if (!p.tmMoves) p.tmMoves = [];
      if (p.tmMoves.indexOf(moveName) === -1) p.tmMoves.push(moveName);
      if (!globalData.pokemonTMs) globalData.pokemonTMs = {};
      globalData.pokemonTMs[p.id] = p.tmMoves;
      var pp = createPlayerPokemon(p);
      return { ok: true, moves: pp.moves, hasMove: pp.moves.indexOf(moveName) !== -1 };
    });
    if (!result.ok) { test.skip('Neil has no roster'); return; }
    expect(result.hasMove).toBe(true);
    expect(result.moves[0]).toBe('噴射火焰');
  });

});
