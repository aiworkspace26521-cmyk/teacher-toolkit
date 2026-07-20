const { test, expect } = require('@playwright/test');

test.describe('伊布道具制進化 8 路徑 E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 15000 });
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
  });

  test('Bug #2: 舊版免費 eeveeModal 不再自動彈出', async ({ page }) => {
    await page.evaluate(() => {
      globalData.roster[0] = {
        id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 16,
        totalExp: 5000, initialLevel: 5, catchDate: '初始夥伴',
        heldItem: '', happiness: 0, expProgress: 0, expNeeded: 1080
      };
      globalData.highestLevel = 16;
      globalData.todayStatus = 'PENDING';
    });
    await page.waitForTimeout(1500);
    var modalVisible = await page.evaluate(function() {
      var m = document.getElementById('eeveeModal');
      if (!m) return 'not-found';
      return window.getComputedStyle(m).display !== 'none';
    });
    expect(modalVisible).toBe(false);
  });

  test('Bug #1: recalculateStudentState 初始狀態含 stone fields', async ({ page }) => {
    var sourceHasStones = await page.evaluate(function() {
      var src = recalculateStudentState.toString();
      var stoneList = ['雷之石','水之石','火之石','葉之石','冰之石','日之石','月之石','妖精之石'];
      var missing = [];
      for (var i = 0; i < stoneList.length; i++) {
        if (src.indexOf(stoneList[i]) === -1) missing.push(stoneList[i]);
      }
      return { ok: missing.length === 0, missing: missing };
    });
    expect(sourceHasStones.ok, 'missing stones: ' + JSON.stringify(sourceHasStones.missing)).toBe(true);
  });

  test('8 種進化石 checkEvoReady 回傳正確', async ({ page }) => {
    var stoneMap = {
      '水之石': '水伊布', '雷之石': '雷伊布', '火之石': '火伊布',
      '日之石': '太陽伊布', '月之石': '月亮伊布',
      '葉之石': '葉伊布', '冰之石': '冰伊布', '妖精之石': '仙子伊布'
    };
    var results = await page.evaluate(function(sm) {
      var out = {};
      for (var stone in sm) {
        var stones = ['雷之石','水之石','火之石','葉之石','冰之石','日之石','月之石','妖精之石'];
        for (var i = 0; i < stones.length; i++) globalData[stones[i]] = false;
        globalData[stone] = true;
        globalData.roster[0] = {
          id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 16,
          totalExp: 5000, initialLevel: 5, catchDate: '初始夥伴',
          heldItem: '', happiness: 0, expProgress: 0, expNeeded: 1080
        };
        var info = checkEvoReady(globalData.roster[0], globalData);
        out[stone] = info ? { ready: info.ready, nextName: info.nextName, type: info.type, item: info.item } : null;
      }
      return out;
    }, stoneMap);
    for (var stone in stoneMap) {
      expect(results[stone], '[' + stone + '] checkEvoReady returned null').not.toBeNull();
      expect(results[stone].ready).toBe(true);
      expect(results[stone].nextName).toBe(stoneMap[stone]);
      expect(results[stone].type).toBe('eevee');
      expect(results[stone].item).toBe(stone);
    }
  });

  test('8 種進化 doEvolve 消耗對應石頭', async ({ page }) => {
    var stoneMap = {
      '水之石': '水伊布', '火之石': '火伊布', '葉之石': '葉伊布',
      '雷之石': '雷伊布', '日之石': '太陽伊布', '月之石': '月亮伊布',
      '冰之石': '冰伊布', '妖精之石': '仙子伊布'
    };
    var allPass = await page.evaluate(async function(sm) {
      var pass = {};
      for (var stone in sm) {
        var stones = ['雷之石','水之石','火之石','葉之石','冰之石','日之石','月之石','妖精之石'];
        for (var i = 0; i < stones.length; i++) globalData[stones[i]] = false;
        globalData[stone] = true;
        globalData.roster = [{
          id: 'P0', baseName: '🐾 伊布 (一般系)', currentLevel: 16,
          totalExp: 5000, initialLevel: 5, catchDate: '初始夥伴',
          heldItem: '', happiness: 0, expProgress: 0, expNeeded: 1080
        }];
        var captured = null;
        var origSave = executeSave;
        var origCutscene = showEvoCutscene;
        showEvoCutscene = function() {};
        executeSave = function(data, cb) { captured = data; if (cb) cb(); };
        try {
          await doEvolve('P0');
        } catch (e) {
          pass[stone] = { error: e.message };
          executeSave = origSave;
          showEvoCutscene = origCutscene;
          continue;
        }
        executeSave = origSave;
        showEvoCutscene = origCutscene;
        pass[stone] = {
          captured: captured !== null,
          consumed: globalData[stone] === false,
          newName: captured ? captured.note : null
        };
      }
      return pass;
    }, stoneMap);
    for (var stone in stoneMap) {
      var p = allPass[stone];
      expect(p.error, '[' + stone + '] ' + (p.error || '')).toBeUndefined();
      expect(p.captured, '[' + stone + '] executeSave not called').toBe(true);
      expect(p.consumed, '[' + stone + '] stone not consumed').toBe(true);
      expect(p.newName, '[' + stone + '] note missing evolution').toContain(stoneMap[stone]);
    }
  });

  test('Bug #4: scheduleStudentFieldUpdate 寫入傳入值而非 globalData', async ({ page }) => {
    var result = await page.evaluate(async function() {
      globalData.quests = undefined;
      var captured = {};
      var origCollection = db.collection;
      db.collection = function(name) {
        return {
          doc: function(id) {
            return {
              set: function(data, opts) {
                for (var k in data) captured[k] = data[k];
                return Promise.resolve();
              }
            };
          }
        };
      };
      saveQuestsToFirestore('Admin', { daily: {}, weekly: {} });
      await new Promise(function(r) { setTimeout(r, 200); });
      db.collection = origCollection;
      return {
        questsInWrite: 'quests' in captured,
        questsValue: captured.quests
      };
    });
    expect(result.questsInWrite).toBe(true);
    expect(result.questsValue).toBeDefined();
    expect(result.questsValue).toEqual({ daily: {}, weekly: {} });
  });
});
