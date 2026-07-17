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
        globalData.leagueRegionsWon = globalData.leagueRegionsWon || {};
        globalData.leagueRegionsWon["關都"] = true;
        const mastersMember = getUnlockedMasters8();
        if (!mastersMember) return { error: 'no unlocked masters8' };

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
      globalData = { badges: 32, todayStatus: "PENDING", todayBattles: 0, highestLevel: 50, masters8Completed: [], masters8Progress: [],
        leagueRegionsWon: { "關都": true } };
      var mKey = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
      leagueCompletedMonths["關都"] = mKey;
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
      globalData.leagueRegionsWon = {};
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
      globalData = { badges: 0 };
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 5, 5); };
      Date.now = function() { return new OrigDate(2026, 5, 5).getTime(); };
      var cached = leagueCompletedMonths;
      leagueCompletedMonths = {};
      // For June 5, getLastMonthKey() = "2026-5" (May)
      leagueCompletedMonths["關都"] = "2026-5";
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

    var trueWhenE4Pending = await page.evaluate(() => {
      var saved = globalData;
      globalData = { badges: 4, leagueRegionsWon: {} };
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 5, 5); };
      Date.now = function() { return new OrigDate(2026, 5, 5).getTime(); };
      var cached = leagueCompletedMonths;
      leagueCompletedMonths = {};
      // No last-month completions, but badges=4 and 關都 not completed → getNextE4Challenge(4) returns 關都
      // leagueCompletedMonths has no entry for 關都 this month → buffer period for E4
      try {
        return isBufferPeriod();
      } finally {
        Date = OrigDate;
        Date.now = OrigDate.now;
        leagueCompletedMonths = cached;
        globalData = saved;
      }
    });
    expect(trueWhenE4Pending).toBe(true);
  });

  // 11.6: 跳 rank 阻擋 — startMasters8Battle 必須依序挑戰
  test('11.6 startMasters8Battle enforces sequential rank order (rank 8→1)', async ({ page }) => {
    const setBossWeek = function() {
      isAdmin = true;
      var dw = $("devWeek");
      if (dw) dw.value = "W4";
    };

    const blocksWhenNoneCompleted = await page.evaluate(() => {
      globalData = { highestLevel: 50, todayStatus: "SUBMITTED", todayBattles: 0, masters8Completed: [], masters8Progress: [], roster: [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 10000, initialLevel: 5 }], partyIds: ["P1"] };
      isAdmin = true; var dw = $("devWeek"); if (dw) dw.value = "W4";
      var lastToast = null;
      var origToast = toast;
      toast = function(msg) { lastToast = msg; };
      startMasters8Battle();
      toast = origToast;
      return lastToast;
    });
    expect(blocksWhenNoneCompleted).not.toBeNull();
    expect(blocksWhenNoneCompleted).toContain("尚無可挑戰的八大師");

    const proceedsWithAllLowerRanks = await page.evaluate(() => {
      globalData = globalData || {};
      globalData.leagueRegionsWon = globalData.leagueRegionsWon || {};
      globalData.leagueRegionsWon["關都"] = true;
      Object.assign(globalData, {
        highestLevel: 50, todayStatus: "SUBMITTED", todayBattles: 0,
        masters8Completed: [],
        masters8Progress: [],
        roster: [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 10000, initialLevel: 5, name: "皮卡丘", happiness: 100, stats: { hp: 100, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 } }],
        partyIds: ["P1"]
      });
      isAdmin = true; var dw = $("devWeek"); if (dw) dw.value = "W4";
      $("battleModal").style.display = "none";
      battleState = null;
      startMasters8Battle();
      return { battleOpened: battleState !== null && battleState.isMasters8 === true, memberInProgress: (globalData.masters8Progress || []).length > 0 };
    });
    expect(proceedsWithAllLowerRanks.battleOpened).toBe(true);
    expect(proceedsWithAllLowerRanks.memberInProgress).toBe(true);

    const blocksAlreadyCompleted = await page.evaluate(() => {
      globalData.leagueRegionsWon = globalData.leagueRegionsWon || {};
      globalData.leagueRegionsWon["關都"] = true;
      globalData = Object.assign(globalData, {
        highestLevel: 50, todayStatus: "SUBMITTED", todayBattles: 0,
        masters8Completed: ["小智"],
        masters8Progress: [],
        roster: [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 10000, initialLevel: 5 }],
        partyIds: ["P1"]
      });
      isAdmin = true; var dw = $("devWeek"); if (dw) dw.value = "W4";
      var lastToast = null;
      var origToast = toast;
      toast = function(msg) { lastToast = msg; };
      startMasters8Battle();
      toast = origToast;
      return lastToast;
    });
    expect(blocksAlreadyCompleted).not.toBeNull();
    expect(blocksAlreadyCompleted).toContain("尚無可挑戰的八大師");
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
  test('6.2 btnLeagueBattle visibility respects W4, badge threshold, month completion, and todayStatus', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Admin');
    await expect(page.locator('#adminPanel')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(500);

    // Setup baseline: clear any league records so we start clean
    await page.evaluate(function() {
      var regOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var i = 0; i < regOrder.length; i++) delete leagueCompletedMonths[regOrder[i]];
    });

    // W1 → gray (opacity 0.4 when league already completed this month or today done)
    var w1gray = await page.evaluate(function() {
      $("devWeek").value = "W1";
      globalData = { badges: 32, todayStatus: "PENDING", todayBattles: 0, highestLevel: 50, roster: [], partyIds: [], masters8Completed: [], leagueRegionsWon: {} };
      leagueCompletedMonths["關都"] = getCurrentMonthKey();
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? { display: btn.style.display, opacity: btn.style.opacity } : 'no-btn';
    });
    expect(w1gray.display).toBe('inline-block');
    expect(w1gray.opacity).toBe('0.4');

    // W2 → gray
    var w2gray = await page.evaluate(function() {
      $("devWeek").value = "W2";
      leagueCompletedMonths["關都"] = getCurrentMonthKey();
      globalData.todayStatus = "PENDING";
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? { display: btn.style.display, opacity: btn.style.opacity } : 'no-btn';
    });
    expect(w2gray.display).toBe('inline-block');
    expect(w2gray.opacity).toBe('0.4');

    // W3 → gray
    var w3gray = await page.evaluate(function() {
      $("devWeek").value = "W3";
      leagueCompletedMonths["關都"] = getCurrentMonthKey();
      globalData.todayStatus = "PENDING";
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? { display: btn.style.display, opacity: btn.style.opacity } : 'no-btn';
    });
    expect(w3gray.display).toBe('inline-block');
    expect(w3gray.opacity).toBe('0.4');

    // W4 + 0 badges → hidden (no region unlocked)
    var w4zeroBadges = await page.evaluate(function() {
      $("devWeek").value = "W4";
      globalData = { badges: 0, todayStatus: "PENDING", todayBattles: 0, highestLevel: 10, roster: [], partyIds: [], masters8Completed: [] };
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? btn.style.display : 'no-btn';
    });
    expect(w4zeroBadges).toBe('none');

    // W4 + 32 badges + not completed → visible (first eligible region = 關都, VER2.5)
    var w4visible = await page.evaluate(function() {
      $("devWeek").value = "W4";
      globalData = { badges: 32, todayStatus: "PENDING", todayBattles: 0, highestLevel: 50, roster: [], partyIds: [], masters8Completed: [],
        leagueRegionsWon: {} };
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return { display: btn.style.display, region: btn._e4Region || 'none' };
    });
    expect(w4visible.display).toBe('inline-block');
    expect(w4visible.region).toBe('關都');

    // W4 + 32 badges + todayStatus=SUBMITTED → gray (opacity 0.4, btn visible)
    var todayDoneGray = await page.evaluate(function() {
      globalData.todayStatus = "SUBMITTED";
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return btn ? { display: btn.style.display, opacity: btn.style.opacity } : 'no-btn';
    });
    expect(todayDoneGray.display).toBe('inline-block');
    expect(todayDoneGray.opacity).toBe('0.4');

    // W4 + 32 badges + all regions completed this month → hidden
    var allCompletedHidden = await page.evaluate(function() {
      globalData.todayStatus = "PENDING";
      globalData.leagueRegionsWon = globalData.leagueRegionsWon || {};
      var regOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var i = 0; i < regOrder.length; i++) globalData.leagueRegionsWon[regOrder[i]] = true;
      var mKey = getCurrentMonthKey();
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
      globalData = { badges: 4, todayStatus: "PENDING", todayBattles: 0, highestLevel: 20, roster: [], partyIds: [], masters8Completed: [] };
      var regOrder = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      for (var i = 0; i < regOrder.length; i++) delete leagueCompletedMonths[regOrder[i]];
      updateDashboard();
      var btn = $("btnLeagueBattle");
      globalData.leagueRegionsWon = {};
      var challenge = getNextE4Challenge(4);
      return {
        btnDisplay: btn.style.display,
        btnRegion: btn._e4Region || 'none',
        challenge: challenge ? challenge.region : null
      };
    });
    expect(month1.btnDisplay).toBe('inline-block');
    expect(month1.btnRegion).toBe('關都');
    expect(month1.challenge).toBe('關都');

    // Simulate completing 關都 league → button hidden (already completed)
    const afterCompletion = await page.evaluate(function() {
      var mKey = new Date().getFullYear() + "-" + (new Date().getMonth() + 1);
      leagueCompletedMonths["關都"] = mKey;
      globalData.leagueRegionsWon["關都"] = true;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      return { btnDisplay: btn.style.display };
    });
    expect(afterCompletion.btnDisplay).toBe('none');

    // Simulate 8 badges, only 關都 completed → 城都 available now
    const moreBadges = await page.evaluate(function() {
      globalData.badges = 8;
      updateDashboard();
      var btn = $("btnLeagueBattle");
      var challenge = getNextE4Challenge(8);
      return { btnDisplay: btn.style.display, btnRegion: btn._e4Region || 'none', challenge: challenge ? challenge.region : null };
    });
    expect(moreBadges.btnDisplay).toBe('inline-block');
    expect(moreBadges.btnRegion).toBe('城都');
    expect(moreBadges.challenge).toBe('城都');
  });

  // 6.4: 地區順序依序通關 — VER2.5: getNextE4Challenge 依序 + isRegionCompleted 判斷
  test('6.4 getNextE4Challenge enforces sequential order via isRegionCompleted', async ({ page }) => {
    const result = await page.evaluate(function() {
      globalData = globalData || {};
      globalData.leagueRegionsWon = {};
      var regions = ["關都","城都","豐緣","神奧","合眾","卡洛斯","阿羅拉","伽勒爾"];
      var thresholds = [4, 8, 12, 16, 20, 24, 28, 32];
      var results = {};

      // Test 1: 0 badges → null
      results.badge_0 = getNextE4Challenge(0);

      // Test 2: 3 badges → null (below 關都 threshold)
      results.badge_3 = getNextE4Challenge(3);

      // Test 3: 4 badges, no completions → 關都
      var c4 = getNextE4Challenge(4);
      results.badge_4 = c4 ? { region: c4.region, order: c4.order } : null;

      // Test 4: 8 badges, no completions → 關都 (still first incomplete)
      var c8 = getNextE4Challenge(8);
      results.badge_8_none = c8 ? { region: c8.region } : null;

      // Test 5: 關都 completed, badges=8 → 城都
      globalData.leagueRegionsWon["關都"] = true;
      var c8b = getNextE4Challenge(8);
      results.badge_8_kantoDone = c8b ? { region: c8b.region, order: c8b.order } : null;

      // Test 6: 關都+城都 completed, badges=12 → 豐緣
      globalData.leagueRegionsWon["城都"] = true;
      var c12 = getNextE4Challenge(12);
      results.badge_12 = c12 ? { region: c12.region } : null;

      // Test 7: all completed, badges=32 → null
      for (var r = 0; r < regions.length; r++) globalData.leagueRegionsWon[regions[r]] = true;
      results.all_done = getNextE4Challenge(32);

      // Test 8: badges too low for next incomplete
      globalData.leagueRegionsWon = {};
      // complete 關都 only, badges=4 → 關都 (not completed yet)
      var c4b = getNextE4Challenge(4);
      results.badge_4_only = c4b ? { region: c4b.region } : null;

      return results;
    });

    // 0~3 badges → null
    expect(result.badge_0).toBeNull();
    expect(result.badge_3).toBeNull();

    // 4 badges, no completions → 關都
    expect(result.badge_4.region).toBe('關都');
    expect(result.badge_4.order).toBe(0);

    // 8 badges, no completions → 關都 (still first incomplete)
    expect(result.badge_8_none.region).toBe('關都');

    // 關都 completed, 8 badges → 城都
    expect(result.badge_8_kantoDone.region).toBe('城都');
    expect(result.badge_8_kantoDone.order).toBe(1);

    // 關都+城都 completed, 12 badges → 豐緣
    expect(result.badge_12.region).toBe('豐緣');

    // All completed → null
    expect(result.all_done).toBeNull();

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

  // 11.3: MASTERS_8 data structure validity (8 entries, descending rank, no month field)
  test('11.3 MASTERS_8 data structure is valid (8 entries, descending rank, no month field)', async ({ page }) => {
    const m8Data = await page.evaluate(() => {
      try {
        var m8 = MASTERS_8;
        var orderOk = true;
        var hasMonthField = false;
        for (var i = 0; i < m8.length; i++) {
          if (m8[i].month !== undefined) hasMonthField = true;
          if (i < m8.length - 1 && m8[i].rank <= m8[i + 1].rank) orderOk = false;
        }

        return {
          count: m8.length,
          ranks: m8.map(function(m) { return m.rank; }),
          orderDescending: orderOk,
          noMonthField: !hasMonthField
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(m8Data.error).toBeUndefined();
    expect(m8Data.count).toBe(8);
    expect(m8Data.ranks).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
    expect(m8Data.orderDescending).toBe(true);
    expect(m8Data.noMonthField).toBe(true);
  });
});
