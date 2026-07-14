const { test, expect } = require('@playwright/test');

test.describe('VER2.5 交叉驗證 — 事件回放 + 邊界條件 + DevTool', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  // ===== 第一輪：事件回放驗證 =====

  test('T-EV1 league note regex extracts region name', async ({ page }) => {
    const result = await page.evaluate(() => {
      var safeNote = "⚔️ 聯盟冠軍 [關都 League] | E4 [科拿 & 希巴] | 參與者: P1";
      var lr = safeNote.match(/\[(.+?)\s*League\]/);
      return { match: lr ? lr[1] : null };
    });
    expect(result.match).toBe('關都');
  });

  test('T-EV2 masters8 note regex extracts trainer name', async ({ page }) => {
    const result = await page.evaluate(() => {
      var safeNote = "👑 八大師擊敗 [小智 (#8)] | 參與者: P1";
      var m8match = safeNote.match(/\[(.+?)\s*\(#\d+\)\]/);
      return { match: m8match ? m8match[1] : null };
    });
    expect(result.match).toBe('小智');
  });

  test('T-EV3 finishLeagueVictory note contains correct region format', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (!globalData) return { error: "no globalData" };
      globalData.roster = [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 0, initialLevel: 5, happiness: 100, stats: { hp: 100, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 } }];
      globalData.partyIds = ["P1"];
      globalData.studentId = "test";
      battleState = {
        playerPokemon: globalData.roster[0], playerParty: [globalData.roster[0]],
        enemy: { name: "赤紅", level: 55 },
        isGym: false, isLeague: true, turnLock: false, battleOver: false, playerWon: false,
        gymWaves: [{ name: "赤紅", level: 55, isLastWave: true }],
        currentWave: 0, totalWaves: 1,
        gymInfo: { name: "關都聯盟", leader: "赤紅" },
        leagueRegion: "關都", weather: null
      };
      var capturedNote = null;
      var origSave = executeSave;
      executeSave = function(data) { capturedNote = data.note; };
      finishLeagueVictory();
      executeSave = origSave;
      return { note: capturedNote };
    });
    expect(result.note).not.toBeNull();
    expect(result.note).toContain("關都 League");
  });

  test('T-EV4 finishMasters8Victory note + masters8Completed', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (!globalData) return { error: "no globalData" };
      globalData.roster = [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 0, initialLevel: 5, happiness: 100, stats: { hp: 100, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 } }];
      globalData.partyIds = ["P1"];
      globalData.studentId = "test";
      globalData.masters8Completed = [];
      var m8Member = MASTERS_8.find(function(m) { return m.name === "小智"; });
      if (!m8Member) return { error: "no masters8 member" };
      battleState = {
        playerPokemon: globalData.roster[0], playerParty: [globalData.roster[0]],
        enemy: { name: "小智", level: 75 },
        isGym: false, isLeague: true, isMasters8: true, turnLock: false,
        battleOver: false, playerWon: false,
        gymWaves: [{ name: "小智", level: 75, isLastWave: true }],
        currentWave: 0, totalWaves: 1,
        gymInfo: { name: "八大師戰", leader: "小智 (焦點畫面)" },
        weather: null
      };
      var capturedNote = null;
      var origSave = executeSave;
      executeSave = function(data) { capturedNote = data.note; };
      finishMasters8Victory();
      executeSave = origSave;
      var savedM8 = globalData.masters8Completed || [];
      return { note: capturedNote, masters8Completed: savedM8 };
    });
    expect(result.note).not.toBeNull();
    expect(result.note).toContain("小智");
    expect(result.note).toContain("(#8)");
    expect(result.masters8Completed).toContain("小智");
  });

  test('T-FS2 finishMasters8Victory calls scheduleStudentFieldUpdate', async ({ page }) => {
    const result = await page.evaluate(() => {
      if (!globalData) return { error: "no globalData" };
      globalData.roster = [{ id: "P1", baseName: "皮卡丘", currentLevel: 50, totalExp: 0, initialLevel: 5, happiness: 100, stats: { hp: 100, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 } }];
      globalData.partyIds = ["P1"];
      globalData.studentId = "test";
      globalData.masters8Completed = [];
      globalData.masters8Progress = ["小智"];
      var m8Member = MASTERS_8.find(function(m) { return m.name === "小智"; });
      if (!m8Member) return { error: "no masters8 member" };
      battleState = {
        playerPokemon: globalData.roster[0], playerParty: [globalData.roster[0]],
        enemy: { name: "小智", level: 75 },
        isGym: false, isLeague: true, isMasters8: true, turnLock: false,
        battleOver: false, playerWon: false,
        gymWaves: [{ name: "小智", level: 75, isLastWave: true }],
        currentWave: 0, totalWaves: 1,
        gymInfo: { name: "八大師戰", leader: "小智 (焦點畫面)" },
        weather: null
      };
      var capturedFields = null;
      var origUpdate = scheduleStudentFieldUpdate;
      scheduleStudentFieldUpdate = function(fields) { capturedFields = fields; };
      finishMasters8Victory();
      scheduleStudentFieldUpdate = origUpdate;
      return {
        hasMasters8Completed: capturedFields && capturedFields.masters8Completed !== undefined,
        hasMasters8Progress: capturedFields && capturedFields.masters8Progress !== undefined,
        completedIncludesSatoshi: capturedFields && capturedFields.masters8Completed.indexOf("小智") !== -1
      };
    });
    expect(result.hasMasters8Completed).toBe(true);
    expect(result.hasMasters8Progress).toBe(true);
    expect(result.completedIncludesSatoshi).toBe(true);
  });

  // ===== 第二輪：邊界條件 =====

  test('T-BD1 getWeekType for 28-day Feb produces correct W1-W4 boundaries', async ({ page }) => {
    const result = await page.evaluate(() => {
      var OrigDate = Date;
      var tests = [];
      try {
        var dates = [1, 7, 8, 14, 15, 21, 22, 28];
        for (var i = 0; i < dates.length; i++) {
          Date = function() { return new OrigDate(2026, 1, dates[i]); };
          Date.now = function() { return new OrigDate(2026, 1, dates[i]).getTime(); };
          tests.push({ day: dates[i], week: getWeekType() });
        }
      } finally { Date = OrigDate; Date.now = OrigDate.now; }
      return tests;
    });
    expect(result.find(function(t){ return t.day === 1; }).week).toBe("W1");
    expect(result.find(function(t){ return t.day === 7; }).week).toBe("W1");
    expect(result.find(function(t){ return t.day === 8; }).week).toBe("W2");
    expect(result.find(function(t){ return t.day === 14; }).week).toBe("W2");
    expect(result.find(function(t){ return t.day === 15; }).week).toBe("W3");
    expect(result.find(function(t){ return t.day === 21; }).week).toBe("W3");
    expect(result.find(function(t){ return t.day === 22; }).week).toBe("W4");
    expect(result.find(function(t){ return t.day === 28; }).week).toBe("W4");
  });

  test('T-BD2+3 isBufferPeriod across Feb/March boundary', async ({ page }) => {
    const result = await page.evaluate(() => {
      var OrigDate = Date;
      var tests = [];
      try {
        var cachedMonths = leagueCompletedMonths;
        leagueCompletedMonths = {};
        Date = function() { return new OrigDate(2026, 1, 28); };
        Date.now = function() { return new OrigDate(2026, 1, 28).getTime(); };
        var lastKey = getLastMonthKey();
        leagueCompletedMonths["關都"] = lastKey;
        tests.push({ label: "Feb 28", buffer: isBufferPeriod() });
        Date = function() { return new OrigDate(2026, 2, 1); };
        Date.now = function() { return new OrigDate(2026, 2, 1).getTime(); };
        leagueCompletedMonths["關都"] = "2026-2";
        var bufMarch = isBufferPeriod();
        var wkMarch = getWeekType();
        tests.push({ label: "Mar 1", buffer: bufMarch, week: wkMarch });
      } finally {
        Date = OrigDate; Date.now = OrigDate.now;
        leagueCompletedMonths = cachedMonths;
      }
      return tests;
    });
    expect(result.find(function(t){ return t.label === "Feb 28"; }).buffer).toBe(false);
    expect(result.find(function(t){ return t.label === "Mar 1"; }).buffer).toBe(true);
    expect(result.find(function(t){ return t.label === "Mar 1"; }).week).toBe("W1");
  });

  test('T-BD5 getWeekType day 7→8 transition', async ({ page }) => {
    const result = await page.evaluate(() => {
      var OrigDate = Date;
      var tests = [];
      try {
        Date = function() { return new OrigDate(2026, 6, 7); };
        Date.now = function() { return new OrigDate(2026, 6, 7).getTime(); };
        tests.push({ day: 7, week: getWeekType() });
        Date = function() { return new OrigDate(2026, 6, 8); };
        Date.now = function() { return new OrigDate(2026, 6, 8).getTime(); };
        tests.push({ day: 8, week: getWeekType() });
      } finally { Date = OrigDate; Date.now = OrigDate.now; }
      return tests;
    });
    expect(result.find(function(t){ return t.day === 7; }).week).toBe("W1");
    expect(result.find(function(t){ return t.day === 8; }).week).toBe("W2");
  });

  test('T-CR1 getNextE4Challenge returns 關都 for badge=4 with no completions', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = {};
      return getNextE4Challenge(4);
    });
    expect(result).not.toBeNull();
    expect(result.region).toBe("關都");
  });

  test('T-CR5 getNextE4Challenge skips to 豐緣 when 關都+城都 completed', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true, "城都": true };
      return getNextE4Challenge(12);
    });
    expect(result).not.toBeNull();
    expect(result.region).toBe("豐緣");
  });

  test('T-CR6 getNextE4Challenge returns null when all 8 regions completed', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = {
        "關都": true, "城都": true, "豐緣": true, "神奧": true,
        "合眾": true, "卡洛斯": true, "阿羅拉": true, "伽勒爾": true
      };
      return getNextE4Challenge(32);
    });
    expect(result).toBeNull();
  });

  test('T-M1 getUnlockedMasters8 returns 小智 when only 關都 completed', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true };
      globalData.masters8Completed = [];
      return getUnlockedMasters8();
    });
    expect(result).not.toBeNull();
    expect(result.name).toBe("小智");
  });

  test('T-M3 getUnlockedMasters8 returns 艾莉絲 after 小智 beaten with 關都+城都', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true, "城都": true };
      globalData.masters8Completed = ["小智"];
      return getUnlockedMasters8();
    });
    expect(result).not.toBeNull();
    expect(result.name).toBe("艾莉絲");
  });

  test('T-M5 getUnlockedMasters8 returns null when 城都 not completed but next needs it', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true };
      globalData.masters8Completed = ["小智"];
      return getUnlockedMasters8();
    });
    expect(result).toBeNull();
  });

  test('T-M7 getUnlockedMasters8 returns null when all 8 masters beaten', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = {
        "關都": true, "城都": true, "豐緣": true, "神奧": true,
        "合眾": true, "卡洛斯": true, "阿羅拉": true, "伽勒爾": true
      };
      globalData.masters8Completed = ["小智", "艾莉絲", "艾嵐", "卡露妮", "渡", "大吾", "竹蘭", "丹帝"];
      return getUnlockedMasters8();
    });
    expect(result).toBeNull();
  });

  // ===== 資料結構一致性 =====

  test('T-DS1 GYM_LEADERS has exactly 32 entries', async ({ page }) => {
    const len = await page.evaluate(() => GYM_LEADERS.length);
    expect(len).toBe(32);
  });

  test('T-DS3 LEAGUE_REGIONS requiredBadges matches [4,8,12,16,20,24,28,32]', async ({ page }) => {
    const badges = await page.evaluate(() => {
      var regions = Object.keys(LEAGUE_REGIONS);
      regions.sort(function(a, b) { return LEAGUE_REGIONS[a].order - LEAGUE_REGIONS[b].order; });
      return regions.map(function(r) { return LEAGUE_REGIONS[r].requiredBadges; });
    });
    expect(badges).toEqual([4, 8, 12, 16, 20, 24, 28, 32]);
  });

  test('T-DS4 MASTERS_8 has 8 entries with descending rank 8→1', async ({ page }) => {
    const ranks = await page.evaluate(() => MASTERS_8.map(function(m){ return m.rank; }));
    expect(ranks).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
  });

  test('T-DS5 MASTERS_8 lvBonus matches specification [75,80,82,85,88,92,96,100]', async ({ page }) => {
    const bonuses = await page.evaluate(() => MASTERS_8.map(function(m){ return m.lvBonus; }));
    expect(bonuses).toEqual([75, 80, 82, 85, 88, 92, 96, 100]);
  });

  // ===== DevTool 驗證 =====

  test('T-DV1 devWeek switching W1/W2/W3/W4 updates getWeekType', async ({ page }) => {
    const result = await page.evaluate(() => {
      isAdmin = true;
      var dw = $("devWeek");
      if (!dw) return { error: "no devWeek element" };
      var results = {};
      ["W1", "W2", "W3", "W4"].forEach(function(w) {
        dw.value = w;
        results[w] = getWeekType();
      });
      return results;
    });
    expect(result.W1).toBe("W1");
    expect(result.W2).toBe("W2");
    expect(result.W3).toBe("W3");
    expect(result.W4).toBe("W4");
  });

  test('T-DV2 getWeekType falls back to real date when isAdmin=false', async ({ page }) => {
    const result = await page.evaluate(() => {
      var savedAdmin = isAdmin;
      isAdmin = false;
      var realWeek = getWeekType();
      isAdmin = savedAdmin;
      var realDay = new Date().getDate();
      var expectedWeek = realDay <= 7 ? "W1" : realDay <= 14 ? "W2" : realDay <= 21 ? "W3" : "W4";
      return { realWeek: realWeek, expectedWeek: expectedWeek };
    });
    expect(result.realWeek).toBe(result.expectedWeek);
  });

  test('T-DV3 isBossWeek follows devWeek', async ({ page }) => {
    const result = await page.evaluate(() => {
      isAdmin = true;
      var dw = $("devWeek");
      if (!dw) return { error: "no devWeek element" };
      dw.value = "W1";
      var w1boss = isBossWeek();
      dw.value = "W4";
      var w4boss = isBossWeek();
      return { w1: w1boss, w4: w4boss };
    });
    expect(result.w1).toBe(false);
    expect(result.w4).toBe(true);
  });

  test('T-DV4 isBufferPeriod uses getWeekType, not isAdmin flag (P4)', async ({ page }) => {
    const result = await page.evaluate(() => {
      isAdmin = true;
      var dw = $("devWeek");
      if (!dw) return { error: "no devWeek element" };
      globalData = { badges: 16, todayCompleted: false, todayBattles: 0, highestLevel: 50, roster: [], partyIds: [], masters8Completed: [], leagueRegionsWon: {} };
      for (var rn in LEAGUE_REGIONS) delete leagueCompletedMonths[rn];

      dw.value = "W1";
      var bufW1 = isBufferPeriod();

      dw.value = "W4";
      var bufW4 = isBufferPeriod();

      return { w1: bufW1, w4: bufW4 };
    });
    expect(result.w1).toBe(true);
    expect(result.w4).toBe(false);
  });

});
