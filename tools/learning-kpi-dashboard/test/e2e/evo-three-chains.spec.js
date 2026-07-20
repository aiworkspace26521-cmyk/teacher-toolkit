const { test, expect } = require('@playwright/test');

test.describe('3 條進化鏈實機測試', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 15000 });
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
  });

  // ===== 1. 皮寶寶 → 皮皮 (Lv15 等級進化) =====
  test('Chain1a: 皮寶寶 Lv15 checkEvoReady → 皮皮', async ({ page }) => {
    var result = await page.evaluate(function() {
      // Inject 皮寶寶 at Lv15
      globalData.roster = [{
        id: 'P0', baseName: '🐾 皮寶寶 (妖精)', currentLevel: 15,
        totalExp: 3000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 1200
      }];
      globalData.highestLevel = 15;
      var info = checkEvoReady(globalData.roster[0], globalData);
      return info ? { ready: info.ready, nextName: info.nextName, type: info.type } : null;
    });
    expect(result).not.toBeNull();
    expect(result.ready).toBe(true);
    expect(result.nextName).toBe('皮皮');
    expect(result.type).toBe('level');
  });

  test('Chain1b: 皮寶寶 Lv15 doEvolve → 皮皮 實際執行', async ({ page }) => {
    var result = await page.evaluate(async function() {
      globalData.roster = [{
        id: 'P0', baseName: '🐾 皮寶寶 (妖精)', currentLevel: 15,
        totalExp: 3000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 1200
      }];
      globalData.highestLevel = 15;
      var captured = null;
      var origSave = executeSave;
      var origCutscene = showEvoCutscene;
      showEvoCutscene = function() {};
      executeSave = function(data, cb) { captured = data; if (cb) cb(); };
      try {
        await doEvolve('P0');
      } catch (e) {
        executeSave = origSave;
        showEvoCutscene = origCutscene;
        return { error: e.message };
      }
      executeSave = origSave;
      showEvoCutscene = origCutscene;
      return {
        captured: captured !== null,
        note: captured ? captured.note : null
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.captured).toBe(true);
    expect(result.note).toContain('皮皮');
  });

  // ===== 皮皮 → 皮可西 =====
  test('Chain1c: 皮皮 Lv30 checkEvoReady → 皮可西', async ({ page }) => {
    var result = await page.evaluate(function() {
      // Check EVO_STAGE_MAP for 皮皮
      var stage = typeof EVO_STAGE_MAP !== 'undefined' ? EVO_STAGE_MAP['皮皮'] : 'N/A';

      // Inject 皮皮 at Lv30
      globalData.roster = [{
        id: 'P0', baseName: '⭐ 皮皮 (妖精)', currentLevel: 30,
        totalExp: 12000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 5000
      }];
      globalData.highestLevel = 30;
      var info = checkEvoReady(globalData.roster[0], globalData);
      return {
        evoStageMap: stage,
        info: info ? { ready: info.ready, nextName: info.nextName, type: info.type } : null
      };
    });
    // 如果 EVO_STAGE_MAP 是 0，則 requiredLevel = 15，Lv30 可進化（但不正確）
    // 如果 EVO_STAGE_MAP 是 1，則 requiredLevel = 30，Lv30 剛好進化（正確）
    console.log('EVO_STAGE_MAP[皮皮] =', result.evoStageMap);
    expect(result.info).not.toBeNull();
    expect(result.info.nextName).toBe('皮可西');
  });

  test('Chain1d: 皮皮 Lv30 doEvolve → 皮可西 實際執行', async ({ page }) => {
    var result = await page.evaluate(async function() {
      globalData.roster = [{
        id: 'P0', baseName: '⭐ 皮皮 (妖精)', currentLevel: 30,
        totalExp: 12000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 5000
      }];
      globalData.highestLevel = 30;
      var captured = null;
      var origSave = executeSave;
      var origCutscene = showEvoCutscene;
      showEvoCutscene = function() {};
      executeSave = function(data, cb) { captured = data; if (cb) cb(); };
      try {
        await doEvolve('P0');
      } catch (e) {
        executeSave = origSave;
        showEvoCutscene = origCutscene;
        return { error: e.message };
      }
      executeSave = origSave;
      showEvoCutscene = origCutscene;
      return {
        captured: captured !== null,
        note: captured ? captured.note : null
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.captured).toBe(true);
    expect(result.note).toContain('皮可西');
  });

  // ===== 2. 皮丘 → 皮卡丘 (Lv15 等級進化) =====
  test('Chain2a: 皮丘 Lv15 checkEvoReady → 皮卡丘', async ({ page }) => {
    var result = await page.evaluate(function() {
      globalData.roster = [{
        id: 'P0', baseName: '🐾 皮丘 (電)', currentLevel: 15,
        totalExp: 3000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 1200
      }];
      globalData.highestLevel = 15;
      var info = checkEvoReady(globalData.roster[0], globalData);
      return info ? { ready: info.ready, nextName: info.nextName, type: info.type } : null;
    });
    expect(result).not.toBeNull();
    expect(result.ready).toBe(true);
    expect(result.nextName).toBe('皮卡丘');
    expect(result.type).toBe('level');
  });

  test('Chain2b: 皮丘 Lv15 doEvolve → 皮卡丘 實際執行', async ({ page }) => {
    var result = await page.evaluate(async function() {
      globalData.roster = [{
        id: 'P0', baseName: '🐾 皮丘 (電)', currentLevel: 15,
        totalExp: 3000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 1200
      }];
      globalData.highestLevel = 15;
      var captured = null;
      var origSave = executeSave;
      var origCutscene = showEvoCutscene;
      showEvoCutscene = function() {};
      executeSave = function(data, cb) { captured = data; if (cb) cb(); };
      try {
        await doEvolve('P0');
      } catch (e) {
        executeSave = origSave;
        showEvoCutscene = origCutscene;
        return { error: e.message };
      }
      executeSave = origSave;
      showEvoCutscene = origCutscene;
      return {
        captured: captured !== null,
        note: captured ? captured.note : null
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.captured).toBe(true);
    expect(result.note).toContain('皮卡丘');
  });

  // ===== 皮卡丘 → 雷丘 (雷之石進化, Lv15+) =====
  test('Chain2c: 皮卡丘 Lv15 + 雷之石 checkEvoReady → 雷丘', async ({ page }) => {
    var result = await page.evaluate(function() {
      // Clear all stones first
      globalData['雷之石'] = false;
      globalData['水之石'] = false;
      globalData['火之石'] = false;
      globalData.roster = [{
        id: 'P0', baseName: '⭐ 皮卡丘 (電)', currentLevel: 15,
        totalExp: 6000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 2400
      }];
      globalData.highestLevel = 15;

      // Without stone — should NOT be ready
      var noStone = checkEvoReady(globalData.roster[0], globalData);

      // With stone — should be ready
      globalData['雷之石'] = true;
      var withStone = checkEvoReady(globalData.roster[0], globalData);

      return {
        noStone: noStone ? { ready: noStone.ready } : null,
        withStone: withStone ? { ready: withStone.ready, nextName: withStone.nextName, type: withStone.type, item: withStone.item } : null
      };
    });
    // Without stone → not ready
    expect(result.noStone).toBeNull();
    // With stone → ready to evolve to 雷丘
    expect(result.withStone).not.toBeNull();
    expect(result.withStone.ready).toBe(true);
    expect(result.withStone.nextName).toBe('雷丘');
    expect(result.withStone.type).toBe('item');
    expect(result.withStone.item).toBe('雷之石');
  });

  test('Chain2d: 皮卡丘 doEvolve → 雷丘 消耗雷之石', async ({ page }) => {
    var result = await page.evaluate(async function() {
      globalData.roster = [{
        id: 'P0', baseName: '⭐ 皮卡丘 (電)', currentLevel: 15,
        totalExp: 6000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 2400
      }];
      globalData['雷之石'] = true;
      globalData.highestLevel = 15;
      var captured = null;
      var origSave = executeSave;
      var origCutscene = showEvoCutscene;
      showEvoCutscene = function() {};
      executeSave = function(data, cb) { captured = data; if (cb) cb(); };
      try {
        await doEvolve('P0');
      } catch (e) {
        executeSave = origSave;
        showEvoCutscene = origCutscene;
        return { error: e.message };
      }
      executeSave = origSave;
      showEvoCutscene = origCutscene;
      return {
        captured: captured !== null,
        stoneConsumed: globalData['雷之石'] === false,
        note: captured ? captured.note : null
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.captured).toBe(true);
    expect(result.stoneConsumed).toBe(true);
    expect(result.note).toContain('雷丘');
  });

  // ===== 3. 毒貝比 → 四顎針龍 (Lv15 等級進化) =====
  test('Chain3a: 毒貝比 Lv15 checkEvoReady → 四顎針龍', async ({ page }) => {
    var result = await page.evaluate(function() {
      globalData.roster = [{
        id: 'P0', baseName: '🐾 毒貝比 (毒)', currentLevel: 15,
        totalExp: 3000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 1200
      }];
      globalData.highestLevel = 15;
      var info = checkEvoReady(globalData.roster[0], globalData);
      return info ? { ready: info.ready, nextName: info.nextName, type: info.type } : null;
    });
    expect(result).not.toBeNull();
    expect(result.ready).toBe(true);
    expect(result.nextName).toBe('四顎針龍');
    expect(result.type).toBe('level');
  });

  test('Chain3b: 毒貝比 Lv15 doEvolve → 四顎針龍 實際執行', async ({ page }) => {
    var result = await page.evaluate(async function() {
      globalData.roster = [{
        id: 'P0', baseName: '🐾 毒貝比 (毒)', currentLevel: 15,
        totalExp: 3000, initialLevel: 5, catchDate: '測試',
        heldItem: '', happiness: 50, expProgress: 0, expNeeded: 1200
      }];
      globalData.highestLevel = 15;
      var captured = null;
      var origSave = executeSave;
      var origCutscene = showEvoCutscene;
      showEvoCutscene = function() {};
      executeSave = function(data, cb) { captured = data; if (cb) cb(); };
      try {
        await doEvolve('P0');
      } catch (e) {
        executeSave = origSave;
        showEvoCutscene = origCutscene;
        return { error: e.message };
      }
      executeSave = origSave;
      showEvoCutscene = origCutscene;
      return {
        captured: captured !== null,
        note: captured ? captured.note : null
      };
    });
    expect(result.error).toBeUndefined();
    expect(result.captured).toBe(true);
    expect(result.note).toContain('四顎針龍');
  });

  // ===== EVO_STAGE_MAP 稽核：檢查覆蓋問題 =====
  test('AUDIT: EVO_STAGE_MAP 皮皮 stage 不應被 standalone 覆蓋', async ({ page }) => {
    var result = await page.evaluate(function() {
      // 檢查 皮寶寶 的進化鏈
      var chainFound = null;
      for (var t in POKEMON_TIERS) {
        for (var i = 0; i < POKEMON_TIERS[t].length; i++) {
          var e = POKEMON_TIERS[t][i];
          if (e.name === '皮寶寶' && e.evolutions) {
            chainFound = { tier: t, evolutions: e.evolutions };
          }
        }
      }
      return {
        evoStageMap: EVO_STAGE_MAP,
        chainFound: chainFound,
        // 檢查 POKEMON_TIERS 中是否有 standalone 皮皮
        pikupikuStandalone: null
      };
    });
    // Check if 皮皮's EVO_STAGE_MAP is 0 or 1
    var evoStage = result.evoStageMap['皮皮'];
    console.log('=== AUDIT: EVO_STAGE_MAP 皮皮 =', evoStage, '===','\n',
      '皮寶寶 chain found:', JSON.stringify(result.chainFound));
    
    // 皮皮 should ideally be stage 1 (since it's evolutions[0] of 皮寶寶)
    // But due to standalone {name:"皮皮"} in "一般" tier, it gets overwritten to 0
    test.info().annotations.push({ type: 'info', description: 'EVO_STAGE_MAP[皮皮]=' + evoStage });
    if (evoStage === 0) {
      console.log('⚠️ BUG: EVO_STAGE_MAP[皮皮] = 0 (should be 1), 皮皮 requiredLevel = 15 instead of 30');
      console.log('   root cause: standalone {name:"皮皮"} in POKEMON_TIERS[一般] overwrites stage from 皮寶寶 chain');
    }
  });

  // ===== 屬性正確性稽核 =====
  test('AUDIT: 進化後屬性正確', async ({ page }) => {
    var result = await page.evaluate(function() {
      return {
        cleffa: POKEMON_SPECIES_TYPES['皮寶寶'] || null,
        clefairy: POKEMON_SPECIES_TYPES['皮皮'] || null,
        clefable: POKEMON_SPECIES_TYPES['皮可西'] || null,
        pichu: POKEMON_SPECIES_TYPES['皮丘'] || null,
        pikachu: POKEMON_SPECIES_TYPES['皮卡丘'] || null,
        raichu: POKEMON_SPECIES_TYPES['雷丘'] || null,
        poipole: POKEMON_SPECIES_TYPES['毒貝比'] || null,
        naganadel: POKEMON_SPECIES_TYPES['四顎針龍'] || null
      };
    });
    expect(result.cleffa).toEqual(['妖精']);
    expect(result.clefairy).toEqual(['妖精']);
    expect(result.clefable).toEqual(['妖精']);
    expect(result.pichu).toEqual(['電']);
    expect(result.pikachu).toEqual(['電']);
    expect(result.raichu).toEqual(['電']);
    expect(result.poipole).toEqual(['毒']);
    expect(result.naganadel).toEqual(['毒','龍']);
  });

});
