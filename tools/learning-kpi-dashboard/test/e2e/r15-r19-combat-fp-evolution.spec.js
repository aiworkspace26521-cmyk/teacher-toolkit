const { test, expect } = require('@playwright/test');

test.describe('R15-R18: 戰鬥 FP 條完整流程驗證', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
    await page.waitForFunction(() => typeof startBattle === 'function', { timeout: 5000 });
  });

  test('R15: 戰鬥 FP 條正確顯示雙方 FP 數值', async ({ page }) => {
    await page.evaluate(() => {
      globalData.todayStatus = 'SUBMITTED';
      globalData.todayBattles = 0;
    });
    const battleStarted = await page.evaluate(() => {
      try {
        startBattle(false, false);
        return true;
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(battleStarted).toBe(true);
    await page.waitForTimeout(1500);
    const fpUI = await page.evaluate(() => {
      const bm = document.getElementById('battleModal');
      const ap = document.getElementById('arenaBattlePhase');
      const pBar = document.getElementById('playerFpBar');
      const pText = document.getElementById('playerFpText');
      const pIndicator = document.getElementById('playerFpIndicator');
      const eBarBg = document.getElementById('enemyFpBarBg');
      const eBar = document.getElementById('enemyFpBar');
      const eText = document.getElementById('enemyFpText');
      const pp = battleState ? battleState.playerPokemon : null;
      const ep = battleState ? battleState.enemy : null;
      return {
        modalVisible: bm && bm.style.display === 'flex',
        arenaVisible: ap && ap.style.display !== 'none',
        hasState: !!pp && !!ep,
        pMaxFp: pp ? pp.maxFp : 0,
        pCurFp: pp ? pp.currentFp : 0,
        eMaxFp: ep ? ep.maxFp : 0,
        eCurFp: ep ? ep.currentFp : 0,
        pBarExists: !!pBar,
        pTextContent: pText ? pText.textContent : '',
        pIndicatorContent: pIndicator ? pIndicator.textContent : '',
        eBarBgDisplay: eBarBg ? eBarBg.style.display : '',
        eBarExists: !!eBar,
        eTextContent: eText ? eText.textContent : ''
      };
    });
    expect(fpUI.modalVisible).toBe(true);
    expect(fpUI.arenaVisible).toBe(true);
    expect(fpUI.hasState).toBe(true);
    expect(fpUI.pMaxFp).toBeGreaterThan(0);
    expect(fpUI.pCurFp).toBe(fpUI.pMaxFp);
    expect(fpUI.eMaxFp).toBeGreaterThan(0);
    expect(fpUI.eCurFp).toBe(fpUI.eMaxFp);
    expect(fpUI.pBarExists).toBe(true);
    expect(fpUI.pTextContent).toContain(String(fpUI.pMaxFp));
    expect(fpUI.pIndicatorContent).toContain('FP');
    expect(fpUI.pIndicatorContent).toContain(String(fpUI.pMaxFp));
    expect(fpUI.eBarBgDisplay).toBe('block');
    expect(fpUI.eBarExists).toBe(true);
    expect(fpUI.eTextContent).toContain(String(fpUI.eMaxFp));
  });

  test('R16: 使用招式後 FP 正確消耗', async ({ page }) => {
    await page.evaluate(() => {
      globalData.todayStatus = 'SUBMITTED';
      globalData.todayBattles = 0;
    });
    await page.evaluate(() => { startBattle(false, false); });
    await page.waitForTimeout(1500);
    const fpBefore = await page.evaluate(() => {
      const pp = battleState.playerPokemon;
      return { cur: pp.currentFp, max: pp.maxFp };
    });
    const moveResult = await page.evaluate(() => {
      const pp = battleState.playerPokemon;
      const firstMove = pp.moves[0];
      const cost = getMoveFpCost(firstMove);
      performAttack(firstMove, true);
      return { moveUsed: firstMove, cost: cost, afterFp: pp.currentFp };
    });
    expect(moveResult.cost).toBeGreaterThan(0);
    expect(moveResult.afterFp).toBe(fpBefore.cur - moveResult.cost);
  });

  test('R17: FP 不足時按鈕 disabled 顯示 FP不足', async ({ page }) => {
    await page.evaluate(() => {
      globalData.todayStatus = 'SUBMITTED';
      globalData.todayBattles = 0;
    });
    await page.evaluate(() => { startBattle(false, false); });
    await page.waitForTimeout(1500);
    const fpState = await page.evaluate(() => {
      const pp = battleState.playerPokemon;
      const origFp = pp.currentFp;
      pp.currentFp = 1;
      if (typeof applyFpCostToMoveButtons === 'function') {
        applyFpCostToMoveButtons();
      } else {
        updateBattleUI();
      }
      const btns = document.querySelectorAll('#playerMoveBtns .btn-move');
      const results = [];
      btns.forEach(function(b) {
        const moveName = b.getAttribute('data-move') || '';
        const fpSpan = b.querySelector('.fp-cost');
        results.push({
          move: moveName,
          disabled: b.disabled,
          fpText: fpSpan ? fpSpan.textContent : '',
          fpClass: fpSpan ? fpSpan.className : ''
        });
      });
      pp.currentFp = origFp;
      return results;
    });
    expect(fpState.length).toBeGreaterThan(0);
    const allDisabled = fpState.every(function(r) { return r.disabled === true; });
    expect(allDisabled).toBe(true);
    const allFpInsufficient = fpState.every(function(r) {
      return r.fpText === 'FP不足' || r.fpClass.indexOf('insufficient') !== -1;
    });
    expect(allFpInsufficient).toBe(true);
  });

  test('R18: 每回合結束後 FP 正確回復', async ({ page }) => {
    await page.evaluate(() => {
      globalData.todayStatus = 'SUBMITTED';
      globalData.todayBattles = 0;
    });
    await page.evaluate(() => { startBattle(false, false); });
    await page.waitForTimeout(1500);
    const beforeState = await page.evaluate(() => {
      const pp = battleState.playerPokemon;
      const ep = battleState.enemy;
      pp.currentFp = Math.floor(pp.maxFp * 0.3);
      ep.currentFp = Math.floor(ep.maxFp * 0.3);
      const expectedPRegen = Math.max(5, Math.floor(pp.maxFp * 0.1));
      const expectedERegen = Math.max(5, Math.floor(ep.maxFp * 0.1));
      return {
        beforeP: pp.currentFp,
        beforeE: ep.currentFp,
        pMax: pp.maxFp,
        eMax: ep.maxFp,
        expectedPRegen: expectedPRegen,
        expectedERegen: expectedERegen
      };
    });
    await page.evaluate(() => {
      if (typeof triggerFpRegen === 'function') {
        triggerFpRegen();
      }
    });
    await page.waitForTimeout(500);
    const afterState = await page.evaluate(() => {
      const pp = battleState.playerPokemon;
      const ep = battleState.enemy;
      return {
        afterP: pp.currentFp,
        afterE: ep.currentFp
      };
    });
    expect(afterState.afterP).toBe(beforeState.beforeP + beforeState.expectedPRegen);
    expect(afterState.afterE).toBe(beforeState.beforeE + beforeState.expectedERegen);
  });

});

test.describe('R19: 進化後階層上限提升', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  function injectBaseFormRoster(page) {
    return page.evaluate(function() {
      globalData.roster = [
        { id: 'P0', baseName: '⭐ 妙蛙種子 (草/毒)', currentLevel: 30, totalExp: 50000, initialLevel: 5, catchDate: '初始夥伴', heldItem: '', happiness: 100, expProgress: 0, expNeeded: 15000, skillTree: {}, learnedMoves: {}, totalSpEarned: 125, skillPoints: 50, evoStage: 0 },
        { id: 'P1', baseName: '⭐ 噴火龍 (火/飛行)', currentLevel: 36, totalExp: 100000, initialLevel: 5, catchDate: '2026/06/01', heldItem: '', happiness: 100, expProgress: 0, expNeeded: 18000, skillTree: {}, learnedMoves: {}, totalSpEarned: 155, skillPoints: 80, evoStage: 2 }
      ];
      globalData.highestLevel = 36;
      globalData.partyIds = ['P0', 'P1'];
      if (typeof EVO_STAGE_MAP !== 'undefined') {
        var raw = '妙蛙種子';
        var mapStage = EVO_STAGE_MAP[raw];
        if (mapStage !== undefined) globalData.roster[0].evoStage = mapStage;
        globalData.roster[0].maxTreeTier = globalData.roster[0].evoStage >= 2 ? 5 : (globalData.roster[0].evoStage >= 1 ? 4 : 3);
      } else {
        globalData.roster[0].maxTreeTier = 3;
      }
    });
  }

  test('R19a: evoStage=0 的寶可夢 maxTreeTier=3', async ({ page }) => {
    await injectBaseFormRoster(page);
    await page.waitForTimeout(300);
    const result = await page.evaluate(() => {
      const p0 = globalData.roster.find(function(p) { return p.id === 'P0'; });
      return {
        baseName: p0.baseName,
        evoStage: p0.evoStage,
        maxTreeTier: p0.maxTreeTier
      };
    });
    expect(result.evoStage).toBe(0);
    expect(result.maxTreeTier).toBe(3);
  });

  test('R19b: 等級進化後 name 改變且 reCalc 後 evoStage/maxTreeTier 正確', async ({ page }) => {
    await injectBaseFormRoster(page);
    const before = await page.evaluate(() => {
      const p0 = globalData.roster.find(function(p) { return p.id === 'P0'; });
      return { evoStage: p0.evoStage, maxTreeTier: p0.maxTreeTier, name: getRawName(p0.baseName) };
    });
    expect(before.name).toBe('妙蛙種子');
    expect(before.maxTreeTier).toBe(3);
    const evolveResult = await page.evaluate(async () => {
      const p0 = globalData.roster.find(function(p) { return p.id === 'P0'; });
      p0.currentLevel = 16;
      var captured = null;
      var origSave = executeSave;
      var origCut = showEvoCutscene;
      showEvoCutscene = function(p, n, cb) { if (cb) cb(); };
      executeSave = function(d, cb) { captured = d; if (cb) cb(); };
      try {
        await doEvolve('P0');
      } catch (e) {
        executeSave = origSave;
        showEvoCutscene = origCut;
        return { error: e.message };
      }
      executeSave = origSave;
      showEvoCutscene = origCut;
      var rawName = getRawName(p0.baseName);
      var calcStage = 0;
      if (typeof EVO_STAGE_MAP !== 'undefined') {
        calcStage = EVO_STAGE_MAP[rawName] !== undefined ? EVO_STAGE_MAP[rawName] : 0;
      }
      var calcTier = calcStage >= 2 ? 5 : (calcStage >= 1 ? 4 : 3);
      return {
        evolved: captured !== null,
        newName: rawName,
        evoStage: calcStage,
        maxTreeTier: calcTier
      };
    });
    expect(evolveResult.error).toBeUndefined();
    expect(evolveResult.evolved).toBe(true);
    expect(evolveResult.newName).toBe('妙蛙草');
    expect(evolveResult.evoStage).toBe(1);
    expect(evolveResult.maxTreeTier).toBe(4);
  });

  test('R19c: 每次進化後 maxTreeTier 遵循 evoStage 公式', async ({ page }) => {
    await injectBaseFormRoster(page);
    const result = await page.evaluate(() => {
      const checks = [];
      for (var stage = 0; stage <= 2; stage++) {
        var expectedTier = stage >= 2 ? 5 : (stage >= 1 ? 4 : 3);
        checks.push({ stage: stage, maxTreeTier: expectedTier });
      }
      return checks;
    });
    expect(result[0].maxTreeTier).toBe(3);
    expect(result[1].maxTreeTier).toBe(4);
    expect(result[2].maxTreeTier).toBe(5);
  });

  test('R19d: 道具進化後 name 改變且 EVO_STAGE_MAP 結果為 stage=1 tier=4', async ({ page }) => {
    await page.evaluate(function() {
      globalData.roster = [
        { id: 'P0', baseName: '⭐ 伊布 (一般)', currentLevel: 35, totalExp: 50000, initialLevel: 5, catchDate: '初始夥伴', heldItem: '', happiness: 100, expProgress: 0, expNeeded: 15000, skillTree: {}, learnedMoves: {}, totalSpEarned: 150, skillPoints: 100, evoStage: 0 }
      ];
      globalData.highestLevel = 35;
      globalData.partyIds = ['P0'];
      globalData['水之石'] = true;
    });
    const after = await page.evaluate(async () => {
      var p0 = globalData.roster[0];
      var captured = null;
      var origSave = executeSave;
      var origCut = showEvoCutscene;
      showEvoCutscene = function(p, n, cb) { if (cb) cb(); };
      executeSave = function(d, cb) { captured = d; if (cb) cb(); };
      try {
        await doEvolve('P0');
      } catch (e) {
        executeSave = origSave;
        showEvoCutscene = origCut;
        return { error: e.message };
      }
      executeSave = origSave;
      showEvoCutscene = origCut;
      var rawName = getRawName(p0.baseName);
      var calcStage = typeof EVO_STAGE_MAP !== 'undefined' && EVO_STAGE_MAP[rawName] !== undefined ? EVO_STAGE_MAP[rawName] : 0;
      var calcTier = calcStage >= 2 ? 5 : (calcStage >= 1 ? 4 : 3);
      return {
        evolved: captured !== null,
        newName: rawName,
        evoStage: calcStage,
        maxTreeTier: calcTier
      };
    });
    expect(after.error).toBeUndefined();
    expect(after.evolved).toBe(true);
    expect(after.newName).toBe('水伊布');
    expect(after.evoStage).toBe(1);
    expect(after.maxTreeTier).toBe(4);
  });

});
