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

  // 11.4: 按鈕狀態 — btnMasters8Battle 顯示/隱藏邏輯 (W4 + 聯盟已通關 + 八大師未全破)
  test('11.4 btnMasters8Battle visibility obeys W4 + leagueCleared + not all masters completed', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Admin');
    await expect(page.locator('#adminPanel')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);

    const hiddenByDefault = await page.evaluate(() => {
      $("devWeek").value = "W1";
      renderBadgeCase();
      updateBattleButtons();
      var btn = $("btnMasters8Battle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(hiddenByDefault).toBe('none');

    const showsOnW4 = await page.evaluate(() => {
      $("devWeek").value = "W4";
      globalData = { badges: 32, todayCompleted: false, todayBattles: 0, highestLevel: 50, masters8Completed: [], masters8Progress: [] };
      var mKey = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
      leagueCompletedMonths["伽勒爾"] = mKey;
      renderBadgeCase();
      updateBattleButtons();
      var btn = $("btnMasters8Battle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(showsOnW4).toBe('inline-block');

    const hiddenWhenDone = await page.evaluate(() => {
      globalData.masters8Completed = MASTERS_8.map(function(m) { return m.name; });
      globalData.masters8Progress = [];
      renderBadgeCase();
      updateBattleButtons();
      var btn = $("btnMasters8Battle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(hiddenWhenDone).toBe('none');

    const hiddenWhenLeagueNotCleared = await page.evaluate(() => {
      globalData.masters8Completed = [];
      globalData.masters8Progress = [];
      delete leagueCompletedMonths["伽勒爾"];
      renderBadgeCase();
      updateBattleButtons();
      var btn = $("btnMasters8Battle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(hiddenWhenLeagueNotCleared).toBe('none');
  });

  // 11.5: 緩衝期 — isBufferPeriod() 在不同條件下的行為
  test('11.5 isBufferPeriod respects date window, league completion, and masters8 progress', async ({ page }) => {
    var falseWhenDayGt7 = await page.evaluate(() => {
      var saved = globalData;
      globalData = { masters8Completed: [] };
      var result = isBufferPeriod();
      globalData = saved;
      return result;
    });
    expect(falseWhenDayGt7).toBe(false);

    var falseWhenNoLeagueLastMonth = await page.evaluate(() => {
      var saved = globalData;
      globalData = { masters8Completed: [] };
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 5, 5); };
      Date.now = function() { return new OrigDate(2026, 5, 5).getTime(); };
      var cached = leagueCompletedMonths;
      leagueCompletedMonths = {};
      try {
        return isBufferPeriod();
      } finally {
        Date = OrigDate;
        Date.now = OrigDate.now;
        leagueCompletedMonths = cached;
        globalData = saved;
      }
    });
    expect(falseWhenNoLeagueLastMonth).toBe(false);

    var trueWhenDateLtEq7WithLeague = await page.evaluate(() => {
      var saved = globalData;
      globalData = { masters8Completed: [] };
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 5, 5); };
      Date.now = function() { return new OrigDate(2026, 5, 5).getTime(); };
      var cached = leagueCompletedMonths;
      leagueCompletedMonths = {};
      var regionOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var ri = 0; ri < regionOrder.length; ri++) {
        leagueCompletedMonths[regionOrder[ri]] = "2026-6";
      }
      try {
        return isBufferPeriod();
      } finally {
        Date = OrigDate;
        Date.now = OrigDate.now;
        leagueCompletedMonths = cached;
        globalData = saved;
      }
    });
    expect(trueWhenDateLtEq7WithLeague).toBe(true);

    var falseWhenAllMastersDone = await page.evaluate(() => {
      var saved = globalData;
      globalData = { masters8Completed: MASTERS_8.map(function(m) { return m.name; }) };
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 5, 5); };
      Date.now = function() { return new OrigDate(2026, 5, 5).getTime(); };
      var cached = leagueCompletedMonths;
      leagueCompletedMonths = {};
      var regionOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var ri = 0; ri < regionOrder.length; ri++) {
        leagueCompletedMonths[regionOrder[ri]] = "2026-6";
      }
      try {
        return isBufferPeriod();
      } finally {
        Date = OrigDate;
        Date.now = OrigDate.now;
        leagueCompletedMonths = cached;
        globalData = saved;
      }
    });
    expect(falseWhenAllMastersDone).toBe(false);
  });

  // 11.6: 跳 rank 阻擋 — startMasters8Battle 必須依序挑戰
  test('11.6 startMasters8Battle enforces sequential rank order (rank 8→1)', async ({ page }) => {
    const blocksWhenNoneCompleted = await page.evaluate(() => {
      globalData = { highestLevel: 50, todayCompleted: false, todayBattles: 0, masters8Completed: [], masters8Progress: [], roster: [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 10000, initialLevel: 5 }], partyIds: ["P1"] };
      var lastToast = null;
      var origToast = toast;
      toast = function(msg) { lastToast = msg; };
      startMasters8Battle();
      toast = origToast;
      return lastToast;
    });
    expect(blocksWhenNoneCompleted).not.toBeNull();
    expect(blocksWhenNoneCompleted).toContain("必須先擊敗");

    const proceedsWithAllLowerRanks = await page.evaluate(() => {
      globalData = {
        highestLevel: 50, todayCompleted: false, todayBattles: 0,
        masters8Completed: MASTERS_8.filter(function(m) { return m.rank > 2 && m.month < 7; }).map(function(m) { return m.name; }),
        masters8Progress: [],
        roster: [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 10000, initialLevel: 5, name: "皮卡丘", happiness: 100, stats: { hp: 100, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 } }],
        partyIds: ["P1"]
      };
      $("battleModal").style.display = "none";
      battleState = null;
      startMasters8Battle();
      return { battleOpened: battleState !== null && battleState.isMasters8 === true, memberInProgress: (globalData.masters8Progress || []).length > 0 };
    });
    expect(proceedsWithAllLowerRanks.battleOpened).toBe(true);
    expect(proceedsWithAllLowerRanks.memberInProgress).toBe(true);

    const blocksAlreadyCompleted = await page.evaluate(() => {
      globalData = {
        highestLevel: 50, todayCompleted: false, todayBattles: 0,
        masters8Completed: MASTERS_8.filter(function(m) { return m.rank > 2 && m.month < 7; }).map(function(m) { return m.name; }),
        masters8Progress: [],
        roster: [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 10000, initialLevel: 5 }],
        partyIds: ["P1"]
      };
      var m8Completed = globalData.masters8Completed;
      var member = getMasters8ForMonth(getCurrentMonth());
      if (member) m8Completed.push(member.name);
      globalData.masters8Completed = m8Completed;
      var lastToast = null;
      var origToast = toast;
      toast = function(msg) { lastToast = msg; };
      startMasters8Battle();
      toast = origToast;
      return lastToast;
    });
    expect(blocksAlreadyCompleted).not.toBeNull();
    expect(blocksAlreadyCompleted).toContain("本月八大師已擊敗");
  });

  // 6.1: EXPECTED_LEVEL 曲線驗證（32 值，遞增，符合升學曲線）
  test('6.1 EXPECTED_LEVEL has exactly 32 values with correct progression curve', async ({ page }) => {
    const result = await page.evaluate(() => {
      var el = EXPECTED_LEVEL;
      var diffs = [];
      for (var i = 1; i < el.length; i++) diffs.push(el[i] - el[i - 1]);
      var allPositive = diffs.every(function(d) { return d > 0; });
      var validRange = el.every(function(v, i) { return v >= 10 && v <= 120; });
      var sortedOk = el.slice().sort(function(a, b) { return a - b; }).every(function(v, i) { return v === el[i]; });
      return {
        length: el.length, values: el, diffs: diffs, allPositive: allPositive,
        validRange: validRange, sortedOk: sortedOk
      };
    });
    expect(result.length).toBe(32);
    expect(result.allPositive).toBe(true);
    expect(result.validRange).toBe(true);
    expect(result.sortedOk).toBe(true);
    // Verify progression: badge 1~8 climb fast, then accelerate badge 9~16, then badge 17~24, then badge 25~32 plateau
    var v = result.values;
    expect(v).toEqual([13,16,19,22,25,28,31,34,37,40,43,46,49,52,55,58,61,64,67,70,73,76,79,82,85,88,91,94,96,97,98,99]);
  });

  // 6.2: btnLeagueBattle 按鈕顯示/隱藏狀態（W4、徽章門檻、月份限制）
  test('6.2 btnLeagueBattle visibility respects W4, badge threshold, month completion, and todayCompleted', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Admin');
    await expect(page.locator('#adminPanel')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);

    // Setup baseline: clear any league records so we start clean
    await page.evaluate(function() {
      var regOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var i = 0; i < regOrder.length; i++) delete leagueCompletedMonths[regOrder[i]];
    });

    // W1 → hidden (league button only shows on W4/buffer)
    var w1hidden = await page.evaluate(function() {
      $("devWeek").value = "W1";
      globalData = { badges: 32, todayCompleted: false, todayBattles: 0, highestLevel: 50, roster: [], partyIds: [], masters8Completed: [] };
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(w1hidden).toBe('none');

    // W2 → hidden
    var w2hidden = await page.evaluate(function() {
      $("devWeek").value = "W2";
      globalData.todayCompleted = false;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(w2hidden).toBe('none');

    // W3 → hidden
    var w3hidden = await page.evaluate(function() {
      $("devWeek").value = "W3";
      globalData.todayCompleted = false;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(w3hidden).toBe('none');

    // W4 + 0 badges → hidden (no region unlocked)
    var w4zeroBadges = await page.evaluate(function() {
      $("devWeek").value = "W4";
      globalData = { badges: 0, todayCompleted: false, todayBattles: 0, highestLevel: 10, roster: [], partyIds: [], masters8Completed: [] };
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(w4zeroBadges).toBe('none');

    // W4 + 32 badges + not completed → visible (highest region = 伽勒爾)
    var w4visible = await page.evaluate(function() {
      $("devWeek").value = "W4";
      globalData = { badges: 32, todayCompleted: false, todayBattles: 0, highestLevel: 50, roster: [], partyIds: [], masters8Completed: [] };
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return { display: btn.style.display, region: btn._e4Region || 'none' };
    });
    expect(w4visible.display).toBe('inline-block');
    expect(w4visible.region).toBe('伽勒爾');

    // W4 + 32 badges + todayCompleted → hidden
    var todayDoneHidden = await page.evaluate(function() {
      globalData.todayCompleted = true;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(todayDoneHidden).toBe('none');

    // W4 + 32 badges + all regions completed this month → hidden
    var allCompletedHidden = await page.evaluate(function() {
      globalData.todayCompleted = false;
      var mKey = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
      var regOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var i = 0; i < regOrder.length; i++) leagueCompletedMonths[regOrder[i]] = mKey;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(allCompletedHidden).toBe('none');
  });

  // 6.3: 跨月整合場景 — 按鈕 + 挑戰 + 完成記錄的完整流程
  test('6.3 cross-month integration — button + challenge + completion across simulated months', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Admin');
    await expect(page.locator('#adminPanel')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);

    // Month 1, W4, 4 badges → 關都 league visible
    const month1 = await page.evaluate(function() {
      $("devMonth").value = "1";
      $("devWeek").value = "W4";
      globalData = { badges: 4, todayCompleted: false, todayBattles: 0, highestLevel: 20, roster: [], partyIds: [], masters8Completed: [] };
      var regOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var i = 0; i < regOrder.length; i++) delete leagueCompletedMonths[regOrder[i]];
      updateDashboard();
      var btn = $("btnLeagueBattle");
      var challenge = getE4ChallengeForBadges(4);
      return {
        btnDisplay: btn.style.display,
        btnRegion: btn._e4Region || 'none',
        challenge: challenge ? challenge.region : null
      };
    });
    expect(month1.btnDisplay).toBe('inline-block');
    expect(month1.btnRegion).toBe('關都');
    expect(month1.challenge).toBe('關都');

    // Simulate completing 關都 league this month → button hidden (already completed this month)
    const afterCompletion = await page.evaluate(function() {
      var mKey = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
      leagueCompletedMonths["關都"] = mKey;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return { btnDisplay: btn.style.display };
    });
    expect(afterCompletion.btnDisplay).toBe('none');

    // Simulate 8 badges (cross a badge threshold), W4, same month → 城都 available now
    const moreBadges = await page.evaluate(function() {
      globalData.badges = 8;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      var challenge = getE4ChallengeForBadges(8);
      return { btnDisplay: btn.style.display, btnRegion: btn._e4Region || 'none', challenge: challenge ? challenge.region : null };
    });
    expect(moreBadges.btnDisplay).toBe('inline-block');
    expect(moreBadges.btnRegion).toBe('城都');
    expect(moreBadges.challenge).toBe('城都');
  });

  // 6.4: 地區順序依序通關 — 關都→城都→⋯→伽勒爾，無法跳區
  test('6.4 getE4ChallengeForBadges enforces sequential region order (關都→城都→豐緣→神奧→合眾→卡洛斯→阿羅拉→伽勒爾)', async ({ page }) => {
    const regionsAtBadgeLevels = await page.evaluate(function() {
      var thresholds = [0, 3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31, 32, 40];
      var results = {};
      for (var i = 0; i < thresholds.length; i++) {
        var c = getE4ChallengeForBadges(thresholds[i]);
        results["badge_" + thresholds[i]] = c ? { region: c.region, requiredBadges: c.requiredBadges, order: c.order } : null;
      }
      return results;
    });

    // 0~3 badges → null
    expect(regionsAtBadgeLevels.badge_0).toBeNull();
    expect(regionsAtBadgeLevels.badge_3).toBeNull();

    // 4~7 → 關都 (order 0)
    expect(regionsAtBadgeLevels.badge_4.region).toBe('關都');
    expect(regionsAtBadgeLevels.badge_4.order).toBe(0);

    // 8~11 → 城都 (order 1)
    expect(regionsAtBadgeLevels.badge_8.region).toBe('城都');
    expect(regionsAtBadgeLevels.badge_8.order).toBe(1);

    // 12~15 → 豐緣 (order 2)
    expect(regionsAtBadgeLevels.badge_12.region).toBe('豐緣');

    // 16~19 → 神奧 (order 3)
    expect(regionsAtBadgeLevels.badge_16.region).toBe('神奧');

    // 20~23 → 合眾 (order 4)
    expect(regionsAtBadgeLevels.badge_20.region).toBe('合眾');

    // 24~27 → 卡洛斯 (order 5)
    expect(regionsAtBadgeLevels.badge_24.region).toBe('卡洛斯');

    // 28~31 → 阿羅拉 (order 6)
    expect(regionsAtBadgeLevels.badge_28.region).toBe('阿羅拉');

    // 32+ → 伽勒爾 (order 7)
    expect(regionsAtBadgeLevels.badge_32.region).toBe('伽勒爾');
    expect(regionsAtBadgeLevels.badge_32.order).toBe(7);
    expect(regionsAtBadgeLevels.badge_40.region).toBe('伽勒爾');

    // Verify LEAGUE_REGIONS order field matches region order
    const regionOrderData = await page.evaluate(function() {
      var expectedOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      var actual = {};
      for (var rn in LEAGUE_REGIONS) {
        actual[rn] = { order: LEAGUE_REGIONS[rn].order, requiredBadges: LEAGUE_REGIONS[rn].requiredBadges };
      }
      return { expected: expectedOrder, actual: actual };
    });
    expect(regionOrderData.actual["關都"].order).toBe(0);
    expect(regionOrderData.actual["關都"].requiredBadges).toBe(4);
    expect(regionOrderData.actual["城都"].order).toBe(1);
    expect(regionOrderData.actual["城都"].requiredBadges).toBe(8);
    expect(regionOrderData.actual["豐緣"].order).toBe(2);
    expect(regionOrderData.actual["豐緣"].requiredBadges).toBe(12);
    expect(regionOrderData.actual["神奧"].order).toBe(3);
    expect(regionOrderData.actual["神奧"].requiredBadges).toBe(16);
    expect(regionOrderData.actual["合眾"].order).toBe(4);
    expect(regionOrderData.actual["合眾"].requiredBadges).toBe(20);
    expect(regionOrderData.actual["卡洛斯"].order).toBe(5);
    expect(regionOrderData.actual["卡洛斯"].requiredBadges).toBe(24);
    expect(regionOrderData.actual["阿羅拉"].order).toBe(6);
    expect(regionOrderData.actual["阿羅拉"].requiredBadges).toBe(28);
    expect(regionOrderData.actual["伽勒爾"].order).toBe(7);
    expect(regionOrderData.actual["伽勒爾"].requiredBadges).toBe(32);
  });

  // 11.3: MASTERS_8 data structure validity (8 entries, descending rank, unique months)
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
