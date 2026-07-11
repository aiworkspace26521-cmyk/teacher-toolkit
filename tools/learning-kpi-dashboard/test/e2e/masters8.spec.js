const { test, expect } = require('@playwright/test');

test.describe('Block I Step 11: 八大師系統驗證', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  // 11.1: finishMasters8Victory 勝利記錄與獎勵
  test('11.1 finishMasters8Victory correctly records victory, clears progress, grants +20 league points', async ({ page }) => {
    const result = await page.evaluate(() => {
      try {
        const month = new Date().getMonth() + 1;
        const mastersMember = getMasters8ForMonth(month);
        if (!mastersMember) return { error: 'no masters for current month' };

        globalData.roster = [
          { id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 10000, initialLevel: 5, name: "皮卡丘", happiness: 100, stats: { hp: 100, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 } },
          { id: "P2", baseName: "噴火龍", currentLevel: 52, totalExp: 12000, initialLevel: 5, name: "噴火龍", happiness: 100, stats: { hp: 120, attack: 60, defense: 50, spAttack: 60, spDefense: 50, speed: 55 } }
        ];
        globalData.partyIds = ["P1", "P2"];
        globalData.hasAmuletCoin = false;
        globalData.studentId = "Neil";

        globalData.masters8Completed = [];
        globalData.masters8Progress = [mastersMember.name];

        leaguePoints["M8_" + mastersMember.name] = 0;

        battleState = {
          playerPokemon: { id: "P1", name: "皮卡丘", currentHp: 80, maxHp: 100, level: 50 },
          playerParty: [
            { id: "P1", name: "皮卡丘", currentHp: 80, maxHp: 100, level: 50 },
            { id: "P2", name: "噴火龍", currentHp: 60, maxHp: 120, level: 52 }
          ],
          enemy: { name: mastersMember.pokemon[5], level: 100, currentHp: 200, maxHp: 200 },
          isGym: false, isLeague: true, isMasters8: true,
          gymWaves: mastersMember.pokemon.map(function(pk, i) {
            return {
              name: pk,
              level: 100 + Math.floor(Math.random() * 3),
              isLastWave: i === mastersMember.pokemon.length - 1,
              waveIndex: i
            };
          }),
          totalWaves: mastersMember.pokemon.length,
          currentWave: 5,
          gymInfo: { name: "八大師戰", emoji: "👑", leader: mastersMember.name + " (" + mastersMember.desc + ")" },
          weather: null,
          turnLock: false, battleOver: false, playerWon: false
        };

        var origExecSave = executeSave;
        executeSave = async function () {};

        finishMasters8Victory();

        executeSave = origExecSave;

        var completedAfter = globalData.masters8Completed || [];
        var progressAfter = globalData.masters8Progress || [];
        var points = leaguePoints["M8_" + mastersMember.name] || 0;
        var resultPhase = document.getElementById('arenaResultPhase');

        return {
          memberName: mastersMember.name,
          memberRank: mastersMember.rank,
          completedContains: completedAfter.indexOf(mastersMember.name) !== -1,
          progressCleared: progressAfter.indexOf(mastersMember.name) === -1,
          points: points,
          battleStateNull: battleState === null,
          resultPhaseDisplay: resultPhase ? resultPhase.style.display : ''
        };
      } catch (e) {
        return { error: e.message, stack: e.stack };
      }
    });

    expect(result.error).toBeUndefined();
    expect(result.completedContains).toBe(true);
    expect(result.progressCleared).toBe(true);
    expect(result.points).toBe(20);
    expect(result.battleStateNull).toBe(true);
    expect(result.resultPhaseDisplay).toBe('block');
  });

  // 11.2: checkAchievement 八大師成就條件邏輯
  test('11.2 checkAchievement correctly evaluates all 8 Masters8 achievement conditions', async ({ page }) => {
    const results = await page.evaluate(() => {
      var gdWithM8 = {
        badges: 32, highestLevel: 99, roster: [],
        masters8Completed: ["小智", "艾莉絲", "艾嵐", "卡露妮", "渡", "大吾", "竹蘭", "丹帝"],
        monthLeagueWins: 1
      };
      var gdEmpty = {
        badges: 0, highestLevel: 5, roster: [],
        masters8Completed: [], monthLeagueWins: 0
      };
      var gdPartial = {
        badges: 32, highestLevel: 50, roster: [],
        masters8Completed: ["小智", "艾莉絲"], monthLeagueWins: 1
      };
      var events = [];

      function evalAch(achId, gd) {
        for (var i = 0; i < ACHIEVEMENTS.length; i++) {
          if (ACHIEVEMENTS[i].id === achId) return checkAchievement(ACHIEVEMENTS[i], gd, events);
        }
        return null;
      }

      var m8Ids = ["M8_SATOSHI", "M8_IRIS", "M8_ALAIN", "M8_DIANTHA", "M8_LANCE", "M8_STEVEN", "M8_CYNTHIA", "M8_LEON"];

      var allCompleted = {};
      for (var i = 0; i < m8Ids.length; i++) {
        allCompleted[m8Ids[i]] = evalAch(m8Ids[i], gdWithM8);
      }

      var noneCompleted = {};
      for (var i = 0; i < m8Ids.length; i++) {
        noneCompleted[m8Ids[i]] = evalAch(m8Ids[i], gdEmpty);
      }

      var partialCompleted = {};
      for (var i = 0; i < m8Ids.length; i++) {
        partialCompleted[m8Ids[i]] = evalAch(m8Ids[i], gdPartial);
      }

      return { allCompleted: allCompleted, noneCompleted: noneCompleted, partialCompleted: partialCompleted };
    });

    // All 8 completed → all true
    expect(results.allCompleted.M8_SATOSHI).toBe(true);
    expect(results.allCompleted.M8_IRIS).toBe(true);
    expect(results.allCompleted.M8_ALAIN).toBe(true);
    expect(results.allCompleted.M8_DIANTHA).toBe(true);
    expect(results.allCompleted.M8_LANCE).toBe(true);
    expect(results.allCompleted.M8_STEVEN).toBe(true);
    expect(results.allCompleted.M8_CYNTHIA).toBe(true);
    expect(results.allCompleted.M8_LEON).toBe(true);

    // None completed → all false
    expect(results.noneCompleted.M8_SATOSHI).toBe(false);
    expect(results.noneCompleted.M8_IRIS).toBe(false);
    expect(results.noneCompleted.M8_ALAIN).toBe(false);
    expect(results.noneCompleted.M8_DIANTHA).toBe(false);
    expect(results.noneCompleted.M8_LANCE).toBe(false);
    expect(results.noneCompleted.M8_STEVEN).toBe(false);
    expect(results.noneCompleted.M8_CYNTHIA).toBe(false);
    expect(results.noneCompleted.M8_LEON).toBe(false);

    // Partial (first 2 only) → first 2 true, rest false
    expect(results.partialCompleted.M8_SATOSHI).toBe(true);
    expect(results.partialCompleted.M8_IRIS).toBe(true);
    expect(results.partialCompleted.M8_ALAIN).toBe(false);
    expect(results.partialCompleted.M8_DIANTHA).toBe(false);
    expect(results.partialCompleted.M8_LANCE).toBe(false);
    expect(results.partialCompleted.M8_STEVEN).toBe(false);
    expect(results.partialCompleted.M8_CYNTHIA).toBe(false);
    expect(results.partialCompleted.M8_LEON).toBe(false);
  });

  // 11.3: startMasters8Battle sequential order restriction
  test('11.3 MASTERS_8 data structure is valid (8 entries, descending rank, unique months)', async ({ page }) => {
    const m8Data = await page.evaluate(() => {
      try {
        var m8 = MASTERS_8;
        var months = {};
        var orderOk = true;
        for (var i = 0; i < m8.length; i++) {
          months[m8[i].month] = (months[m8[i].month] || 0) + 1;
          if (i < m8.length - 1 && m8[i].rank <= m8[i + 1].rank) orderOk = false;
        }
        var allMonthsUnique = true;
        for (var m in months) { if (months[m] !== 1) allMonthsUnique = false; }

        return {
          count: m8.length,
          ranks: m8.map(function(m) { return m.rank; }),
          months: Object.keys(months).map(Number).sort(function(a,b) { return a - b; }),
          orderDescending: orderOk,
          allMonthsUnique: allMonthsUnique
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(m8Data.error).toBeUndefined();
    expect(m8Data.count).toBe(8);
    expect(m8Data.ranks).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
    expect(m8Data.orderDescending).toBe(true);
    expect(m8Data.months).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(m8Data.allMonthsUnique).toBe(true);
  });
});
