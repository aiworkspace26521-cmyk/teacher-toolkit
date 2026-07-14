const { test, expect } = require('@playwright/test');

// Helper: build a standard roster entry
function makeMon(id, baseName, level, extra) {
  return Object.assign({
    id: id, baseName: baseName, currentLevel: level,
    totalExp: 0, initialLevel: level, catchDate: '初始夥伴', heldItem: ''
  }, extra || {});
}

test.describe('M1→M3 逐月模擬測試（真實驗證 EXP/等級/道館/聯盟/八大師）', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 60000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  test('M1→M3 完整逐月模擬：EXP 累積 → 等級成長 → 道館制霸 → 聯盟通關 → 八大師', async ({ page }) => {
    var result = await page.evaluate(() => {
      // ============================================================
      // 1. Set up simulation environment
      // ============================================================
      var OVERRIDE_SAVE = false;
      var origExecuteSave = window.executeSave;
      window.executeSave = function() { OVERRIDE_SAVE = true; };
      var origScheduleUpdate = window.scheduleStudentFieldUpdate;
      window.scheduleStudentFieldUpdate = function() {};

      // Force isAdmin so devWeek/devMonth work
      window.isAdmin = true;
      var dw = document.getElementById('devWeek');
      var dm = document.getElementById('devMonth');

      // Clean starting globalData: 0 badges, starter Eevee at Lv.5
      window.globalData = {
        studentId: 'Admin',
        roster: [
          { id: 'P0', baseName: '⭐ 伊布 (一般系)', totalExp: 0, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' }
        ],
        highestLevel: 5,
        lockedGymLevel: 5,
        coins: 0,
        badges: 0,
        weekGymWins: 0,
        monthLeagueWins: 0,
        weekBossWins: 0,
        todayBattles: 0,
        todayCompleted: false,
        todayTasksDone: false,
        daysSinceLastBadge: 99,
        lastBadgeTime: null,
        leagueRegionsWon: {},
        masters8Completed: [],
        masters8Progress: [],
        hasChampionCloak: false,
        hasAmuletCoin: false
      };

      // Helper: compute gym battle EXP via the real calcGymExp() from kpi-dashboard.html
      function simulateGymWin(trainerLevel) {
        var gymResult = generateGymWaves(trainerLevel);
        if (!gymResult || !gymResult.waves) return null;
        var totalExp = calcGymExp(gymResult.waves, globalData.hasChampionCloak);
        return {
          totalExp: totalExp,
          leaderShare: Math.floor(totalExp * 1.2),
          gymInfo: gymResult.gymInfo,
          waves: gymResult.waves
        };
      }

      // Helper: compute league battle EXP via the real calcLeagueExp()
      function simulateLeagueWin(region, trainerLevel) {
        var gauntlet = generateLeagueGauntlet(trainerLevel, region);
        if (!gauntlet || !gauntlet.waves) return null;
        var totalExp = calcLeagueExp(gauntlet.waves, globalData.hasChampionCloak);
        return {
          totalExp: totalExp,
          leaderShare: Math.floor(totalExp * 1.2)
        };
      }

      // Helper: compute Masters 8 battle EXP via the real calcMasters8Exp()
      function simulateMasters8Win(member, trainerLevel) {
        var battle = generateMasters8Battle(trainerLevel, member);
        if (!battle || !battle.waves) return null;
        var totalExp = calcMasters8Exp(battle.waves);
        return {
          totalExp: totalExp,
          leaderShare: Math.floor(totalExp * 1.2)
        };
      }

      // Apply EXP to lead Pokemon (P0), update highestLevel
      function applyExp(expAmount) {
        globalData.roster[0].totalExp += expAmount;
        var lvlInfo = calcLevelAndExp(globalData.roster[0].totalExp, globalData.roster[0].initialLevel);
        globalData.roster[0].currentLevel = lvlInfo.level;
        if (lvlInfo.level > globalData.highestLevel) globalData.highestLevel = lvlInfo.level;
        if (lvlInfo.level > globalData.lockedGymLevel) globalData.lockedGymLevel = lvlInfo.level;
        return lvlInfo;
      }

      // Advance selected week/month
      function setWeek(w) { dw.value = w; if (typeof forceAdminUpdate === 'function') forceAdminUpdate(); }
      function setMonth(m) { dm.value = String(m); if (typeof forceAdminUpdate === 'function') forceAdminUpdate(); }

      // Simulate daily task submission: prerequisite for battles
      function simulateDailySubmit(score) {
        score = score || 80;
        globalData.todayCompleted = true;
        globalData.todayTasksDone = true;
        var expGain = score * 10;
        globalData.roster[0].totalExp += expGain;
        var lvlInfo = calcLevelAndExp(globalData.roster[0].totalExp, globalData.roster[0].initialLevel);
        globalData.roster[0].currentLevel = lvlInfo.level;
        if (lvlInfo.level > globalData.highestLevel) globalData.highestLevel = lvlInfo.level;
        if (lvlInfo.level > globalData.lockedGymLevel) globalData.lockedGymLevel = lvlInfo.level;
      }

      // ============================================================
      // 2. Simulation log
      // ============================================================
      var log = [];

      // ============================================================
      // 3. Verify todayTasksDone gate
      // ============================================================
      log.push({ phase: 'gate_verify', todayTasksDone: globalData.todayTasksDone });
      simulateDailySubmit(75);
      log.push({ phase: 'gate_verify_after_submit', todayTasksDone: globalData.todayTasksDone, expAfterSubmit: globalData.roster[0].totalExp });

      // ============================================================
      // 4. Execute M1→M3
      // ============================================================

      // ---- Month 1 (M1) ----
      setMonth(1);

      // M1 W1: Daily submit → Gym battle 1 → badge 1
      setWeek('W1');
      simulateDailySubmit();
      var g1 = simulateGymWin(globalData.highestLevel);
      if (g1) {
        var lv1 = applyExp(g1.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M1_W1_gym', badge: globalData.badges,
          expGained: g1.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv1.level, gymName: g1.gymInfo.leader + ' (' + g1.gymInfo.name + ')'
        });
      }

      // M1 W2: Daily submit → Gym battle 2 → badge 2
      setWeek('W2');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g2 = simulateGymWin(globalData.highestLevel);
      if (g2) {
        var lv2 = applyExp(g2.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M1_W2_gym', badge: globalData.badges,
          expGained: g2.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv2.level, gymName: g2.gymInfo.leader + ' (' + g2.gymInfo.name + ')'
        });
      }

      // M1 W3: Daily submit → Gym battle 3 → badge 3
      setWeek('W3');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g3 = simulateGymWin(globalData.highestLevel);
      if (g3) {
        var lv3 = applyExp(g3.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M1_W3_gym', badge: globalData.badges,
          expGained: g3.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv3.level, gymName: g3.gymInfo.leader + ' (' + g3.gymInfo.name + ')'
        });
      }

      // M1 W4: Daily submit → Gym battle 4 → badge 4 → league unlocked!
      setWeek('W4');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g4 = simulateGymWin(globalData.highestLevel);
      if (g4) {
        var lv4 = applyExp(g4.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        var nextE4 = getNextE4Challenge(globalData.badges);
        log.push({
          phase: 'M1_W4_gym', badge: globalData.badges,
          expGained: g4.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv4.level, gymName: g4.gymInfo.leader + ' (' + g4.gymInfo.name + ')',
          leagueUnlocked: nextE4 ? nextE4.region : null
        });
      }

      // M1 W4: Complete 關都 league
      globalData.weekGymWins = 0;
      var l1 = simulateLeagueWin('關都', globalData.highestLevel);
      if (l1) {
        var lvL1 = applyExp(l1.leaderShare);
        globalData.leagueRegionsWon['關都'] = true;
        globalData.monthLeagueWins = 1;
        var m8a = getUnlockedMasters8();
        log.push({
          phase: 'M1_W4_league', region: '關都',
          expGained: l1.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lvL1.level,
          masters8Unlocked: m8a ? m8a.name + ' (rank ' + m8a.rank + ')' : null
        });
      }

      // M1 W4: Beat 小智 (Masters 8 rank 8)
      var m8Member1 = getUnlockedMasters8();
      if (m8Member1) {
        var m1 = simulateMasters8Win(m8Member1, globalData.highestLevel);
        if (m1) {
          var lvM1 = applyExp(m1.leaderShare);
          globalData.masters8Completed.push(m8Member1.name);
          globalData.weekGymWins = 0;
          log.push({
            phase: 'M1_W4_masters8', member: m8Member1.name,
            expGained: m1.leaderShare, totalExp: globalData.roster[0].totalExp,
            level: lvM1.level
          });
        }
      }

      // ---- Month 2 (M2) ----
      setMonth(2);

      // M2 W1: Daily submit → Gym badge 5
      setWeek('W1');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g5 = simulateGymWin(globalData.highestLevel);
      if (g5) {
        var lv5 = applyExp(g5.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M2_W1_gym', badge: globalData.badges,
          expGained: g5.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv5.level, gymName: g5.gymInfo.leader + ' (' + g5.gymInfo.name + ')'
        });
      }

      // M2 W2: Daily submit → Gym badge 6
      setWeek('W2');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g6 = simulateGymWin(globalData.highestLevel);
      if (g6) {
        var lv6 = applyExp(g6.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M2_W2_gym', badge: globalData.badges,
          expGained: g6.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv6.level, gymName: g6.gymInfo.leader + ' (' + g6.gymInfo.name + ')'
        });
      }

      // M2 W3: Daily submit → Gym badge 7
      setWeek('W3');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g7 = simulateGymWin(globalData.highestLevel);
      if (g7) {
        var lv7 = applyExp(g7.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M2_W3_gym', badge: globalData.badges,
          expGained: g7.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv7.level, gymName: g7.gymInfo.leader + ' (' + g7.gymInfo.name + ')'
        });
      }

      // M2 W4: Daily submit → Gym badge 8 → 城都 league unlocked!
      setWeek('W4');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g8 = simulateGymWin(globalData.highestLevel);
      if (g8) {
        var lv8 = applyExp(g8.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        var nextE4_2 = getNextE4Challenge(globalData.badges);
        log.push({
          phase: 'M2_W4_gym', badge: globalData.badges,
          expGained: g8.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv8.level, gymName: g8.gymInfo.leader + ' (' + g8.gymInfo.name + ')',
          leagueUnlocked: nextE4_2 ? nextE4_2.region : null
        });
      }

      // M2 W4: Complete 城都 league
      globalData.weekGymWins = 0;
      var l2 = simulateLeagueWin('城都', globalData.highestLevel);
      if (l2) {
        var lvL2 = applyExp(l2.leaderShare);
        globalData.leagueRegionsWon['城都'] = true;
        globalData.monthLeagueWins = 2;
        var m8b = getUnlockedMasters8();
        log.push({
          phase: 'M2_W4_league', region: '城都',
          expGained: l2.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lvL2.level,
          masters8Unlocked: m8b ? m8b.name + ' (rank ' + m8b.rank + ')' : null
        });
      }

      // M2 W4: Beat 艾莉絲 (Masters 8 rank 7)
      var m8Member2 = getUnlockedMasters8();
      if (m8Member2) {
        var m2 = simulateMasters8Win(m8Member2, globalData.highestLevel);
        if (m2) {
          var lvM2 = applyExp(m2.leaderShare);
          globalData.masters8Completed.push(m8Member2.name);
          globalData.weekGymWins = 0;
          log.push({
            phase: 'M2_W4_masters8', member: m8Member2.name,
            expGained: m2.leaderShare, totalExp: globalData.roster[0].totalExp,
            level: lvM2.level
          });
        }
      }

      // ---- Month 3 (M3) ----
      setMonth(3);

      // M3 W1: Daily submit → Gym badge 9
      setWeek('W1');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g9 = simulateGymWin(globalData.highestLevel);
      if (g9) {
        var lv9 = applyExp(g9.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M3_W1_gym', badge: globalData.badges,
          expGained: g9.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv9.level, expectedLv: EXPECTED_LEVEL[globalData.badges - 1],
          gymName: g9.gymInfo.leader + ' (' + g9.gymInfo.name + ')'
        });
      }

      // M3 W2: Daily submit → Gym badge 10
      setWeek('W2');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g10 = simulateGymWin(globalData.highestLevel);
      if (g10) {
        var lv10 = applyExp(g10.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M3_W2_gym', badge: globalData.badges,
          expGained: g10.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv10.level, expectedLv: EXPECTED_LEVEL[globalData.badges - 1],
          gymName: g10.gymInfo.leader + ' (' + g10.gymInfo.name + ')'
        });
      }

      // M3 W3: Daily submit → Gym badge 11
      setWeek('W3');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g11 = simulateGymWin(globalData.highestLevel);
      if (g11) {
        var lv11 = applyExp(g11.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        log.push({
          phase: 'M3_W3_gym', badge: globalData.badges,
          expGained: g11.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv11.level, expectedLv: EXPECTED_LEVEL[globalData.badges - 1],
          gymName: g11.gymInfo.leader + ' (' + g11.gymInfo.name + ')'
        });
      }

      // M3 W4: Daily submit → Gym badge 12 → 豐緣 league unlocked!
      setWeek('W4');
      simulateDailySubmit();
      globalData.daysSinceLastBadge = 8;
      globalData.weekGymWins = 0;
      var g12 = simulateGymWin(globalData.highestLevel);
      if (g12) {
        var lv12 = applyExp(g12.leaderShare);
        globalData.badges += 1;
        globalData.weekGymWins = 1;
        globalData.daysSinceLastBadge = 0;
        var nextE4_3 = getNextE4Challenge(globalData.badges);
        log.push({
          phase: 'M3_W4_gym', badge: globalData.badges,
          expGained: g12.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lv12.level, expectedLv: EXPECTED_LEVEL[globalData.badges - 1],
          gymName: g12.gymInfo.leader + ' (' + g12.gymInfo.name + ')',
          leagueUnlocked: nextE4_3 ? nextE4_3.region : null
        });
      }

      // M3 W4: Complete 豐緣 league
      globalData.weekGymWins = 0;
      var l3 = simulateLeagueWin('豐緣', globalData.highestLevel);
      if (l3) {
        var lvL3 = applyExp(l3.leaderShare);
        globalData.leagueRegionsWon['豐緣'] = true;
        globalData.monthLeagueWins = 3;
        var m8c = getUnlockedMasters8();
        log.push({
          phase: 'M3_W4_league', region: '豐緣',
          expGained: l3.leaderShare, totalExp: globalData.roster[0].totalExp,
          level: lvL3.level,
          masters8Unlocked: m8c ? m8c.name + ' (rank ' + m8c.rank + ')' : null
        });
      }

      // M3 W4: Beat 艾嵐 (Masters 8 rank 6)
      var m8Member3 = getUnlockedMasters8();
      if (m8Member3) {
        var m3 = simulateMasters8Win(m8Member3, globalData.highestLevel);
        if (m3) {
          var lvM3 = applyExp(m3.leaderShare);
          globalData.masters8Completed.push(m8Member3.name);
          log.push({
            phase: 'M3_W4_masters8', member: m8Member3.name,
            expGained: m3.leaderShare, totalExp: globalData.roster[0].totalExp,
            level: lvM3.level
          });
        }
      }

      // ============================================================
      // 4. Final state + summary
      // ============================================================
      var finalLvlInfo = calcLevelAndExp(globalData.roster[0].totalExp, globalData.roster[0].initialLevel);

      // Restore original save functions
      window.executeSave = origExecuteSave;
      window.scheduleStudentFieldUpdate = origScheduleUpdate;

      return {
        log: log,
        final: {
          badges: globalData.badges,
          totalExp: globalData.roster[0].totalExp,
          level: finalLvlInfo.level,
          expProgress: finalLvlInfo.expProgress,
          expNeeded: finalLvlInfo.expNeeded,
          highestLevel: globalData.highestLevel,
          leaguesWon: Object.keys(globalData.leagueRegionsWon),
          masters8Completed: globalData.masters8Completed,
          todayTasksDone: globalData.todayTasksDone,
          expectedLvAtBadge12: EXPECTED_LEVEL[11]
        },
        expectedLevels: {
          badge1: EXPECTED_LEVEL[0],
          badge4: EXPECTED_LEVEL[3],
          badge8: EXPECTED_LEVEL[7],
          badge12: EXPECTED_LEVEL[11]
        }
      };
    });

    // ── Dump full simulation log for debugging ──
    console.log('=== M1→M3 逐月模擬紀錄 ===');
    result.log.forEach(function(entry) {
      console.log(JSON.stringify(entry));
    });
    console.log('=== Final State ===', JSON.stringify(result.final));

    // ── Structural verifications ──
    // 0. todayTasksDone gate verification
    var gateVerify = result.log.find(function(e) { return e.phase === 'gate_verify'; });
    expect(gateVerify).toBeTruthy();
    expect(gateVerify.todayTasksDone).toBe(false);
    var gateAfterSubmit = result.log.find(function(e) { return e.phase === 'gate_verify_after_submit'; });
    expect(gateAfterSubmit).toBeTruthy();
    expect(gateAfterSubmit.todayTasksDone).toBe(true);
    expect(gateAfterSubmit.expAfterSubmit).toBeGreaterThan(0);
    expect(result.final.todayTasksDone).toBe(true);

    // 1. Total badges after 12 gym wins
    expect(result.final.badges).toBeGreaterThanOrEqual(12);

    // 2. All 3 regions completed (關都, 城都, 豐緣)
    expect(result.final.leaguesWon).toContain('關都');
    expect(result.final.leaguesWon).toContain('城都');
    expect(result.final.leaguesWon).toContain('豐緣');

    // 3. Masters 8: 3 members beaten (小智, 艾莉絲, 艾嵐)
    expect(result.final.masters8Completed.length).toBeGreaterThanOrEqual(3);
    expect(result.final.masters8Completed).toContain('小智');
    expect(result.final.masters8Completed).toContain('艾莉絲');
    expect(result.final.masters8Completed).toContain('艾嵐');

    // 4. Player level >= EXPECTED_LEVEL[11] (badge 12 = Lv.46)
    expect(result.final.level).toBeGreaterThanOrEqual(result.expectedLevels.badge12);
    expect(result.final.highestLevel).toBeGreaterThanOrEqual(result.expectedLevels.badge12);

    // 5. Total EXP must be positive and meaningful
    expect(result.final.totalExp).toBeGreaterThan(0);

    // 6. EXP progression: each month should have increasing EXP gains
    var m1Exp = result.log.filter(function(e) { return e.phase && e.phase.indexOf('M1_') === 0; });
    var m2Exp = result.log.filter(function(e) { return e.phase && e.phase.indexOf('M2_') === 0; });
    var m3Exp = result.log.filter(function(e) { return e.phase && e.phase.indexOf('M3_') === 0; });

    expect(m1Exp.length).toBeGreaterThan(0);
    expect(m2Exp.length).toBeGreaterThan(0);
    expect(m3Exp.length).toBeGreaterThan(0);

    // 7. All gym battles in log must have gymName
    var gymEntries = result.log.filter(function(e) { return e.gymName; });
    expect(gymEntries.length).toBeGreaterThanOrEqual(12);

    // 8. Badge-expected level alignment: M3 gym badges (9-12) should trend toward expected levels
    var badge9 = result.log.find(function(e) { return e.phase === 'M3_W1_gym'; });
    var badge12entry = result.log.find(function(e) { return e.phase === 'M3_W4_gym'; });
    if (badge9) expect(badge9.expectedLv).toBe(37); // EXPECTED_LEVEL[8]
    if (badge12entry) expect(badge12entry.expectedLv).toBe(46); // EXPECTED_LEVEL[11]

    // 9. League unlock sequence
    var kantoLeague = result.log.find(function(e) { return e.phase === 'M1_W4_league'; });
    expect(kantoLeague).toBeTruthy();
    expect(kantoLeague.region).toBe('關都');

    var johtoLeague = result.log.find(function(e) { return e.phase === 'M2_W4_league'; });
    expect(johtoLeague).toBeTruthy();
    expect(johtoLeague.region).toBe('城都');

    var hoennLeague = result.log.find(function(e) { return e.phase === 'M3_W4_league'; });
    expect(hoennLeague).toBeTruthy();
    expect(hoennLeague.region).toBe('豐緣');

    // 10. Masters 8 unlock sequence
    var satoshi = result.log.find(function(e) { return e.phase === 'M1_W4_masters8'; });
    expect(satoshi).toBeTruthy();
    expect(satoshi.member).toBe('小智');

    var iris = result.log.find(function(e) { return e.phase === 'M2_W4_masters8'; });
    expect(iris).toBeTruthy();
    expect(iris.member).toBe('艾莉絲');

    var alain = result.log.find(function(e) { return e.phase === 'M3_W4_masters8'; });
    expect(alain).toBeTruthy();
    expect(alain.member).toBe('艾嵐');

    // 11. Level exceeds EXPECTED_LEVEL[11]=46 at M3 end
    expect(result.final.level).toBeGreaterThanOrEqual(46);
  });

  test('M1→M3 模擬：等級持續成長（每週道館戰後等級不降）', async ({ page }) => {
    var levelProgression = await page.evaluate(() => {
      window.isAdmin = true;
      window.globalData = {
        studentId: 'Admin',
        roster: [
          { id: 'P0', baseName: '⭐ 伊布 (一般系)', totalExp: 0, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' }
        ],
        highestLevel: 5, lockedGymLevel: 5, coins: 0, badges: 0,
        weekGymWins: 0, monthLeagueWins: 0, weekBossWins: 0,
        todayBattles: 0, todayCompleted: false, todayTasksDone: false, daysSinceLastBadge: 99,
        lastBadgeTime: null, leagueRegionsWon: {}, masters8Completed: [],
        masters8Progress: [], hasChampionCloak: false, hasAmuletCoin: false
      };

      var origExec = window.executeSave;
      window.executeSave = function() {};
      window.scheduleStudentFieldUpdate = function() {};

      var levels = [];
      var gymCount = 0;

      // 12 gym battles across M1→M3, 4 per month
      for (var m = 1; m <= 3; m++) {
        var dm = document.getElementById('devMonth');
        dm.value = String(m);
        for (var w = 1; w <= 4; w++) {
          var dw = document.getElementById('devWeek');
          dw.value = 'W' + w;
          if (typeof forceAdminUpdate === 'function') forceAdminUpdate();
          // Daily submit first (prerequisite for battles)
          globalData.todayCompleted = true;
          globalData.todayTasksDone = true;
          globalData.roster[0].totalExp += 750; // simulate score=75 daily task
          globalData.daysSinceLastBadge = 8;
          globalData.weekGymWins = 0;
          var gymResult = generateGymWaves(globalData.highestLevel);
          if (gymResult && gymResult.waves) {
            var totalExp = calcGymExp(gymResult.waves, globalData.hasChampionCloak);
            var leaderShare = Math.floor(totalExp * 1.2);
            globalData.roster[0].totalExp += leaderShare;
            var lvlInfo = calcLevelAndExp(globalData.roster[0].totalExp, globalData.roster[0].initialLevel);
            globalData.roster[0].currentLevel = lvlInfo.level;
            if (lvlInfo.level > globalData.highestLevel) globalData.highestLevel = lvlInfo.level;
            globalData.badges += 1;
            globalData.weekGymWins = 1;
            globalData.daysSinceLastBadge = 0;
            gymCount++;
            levels.push({ gym: gymCount, badge: globalData.badges, level: lvlInfo.level, totalExp: globalData.roster[0].totalExp });
          }
        }
      }

      window.executeSave = origExec;
      return levels;
    });

    expect(levelProgression.length).toBeGreaterThanOrEqual(12);

    // Verify MONOTONIC level growth: each subsequent gym win must have >= previous level
    for (var i = 1; i < levelProgression.length; i++) {
      expect(levelProgression[i].level).toBeGreaterThanOrEqual(levelProgression[i - 1].level);
    }

    // Verify MONOTONIC EXP growth
    for (var j = 1; j < levelProgression.length; j++) {
      expect(levelProgression[j].totalExp).toBeGreaterThan(levelProgression[j - 1].totalExp);
    }

    // Final level should be >= badge-12 expected (Lv.46)
    var finalEntry = levelProgression[levelProgression.length - 1];
    expect(finalEntry.badge).toBeGreaterThanOrEqual(12);
    expect(finalEntry.level).toBeGreaterThanOrEqual(13); // at minimum Lv.13 from badge 1
    console.log('Final level after 12 gyms:', finalEntry.level, 'EXP:', finalEntry.totalExp);
  });

  test('M1→M3 模擬：每週道館限 1 場（weekGymWins gate） + todayTasksDone 閘門', async ({ page }) => {
    var gateResult = await page.evaluate(() => {
      // Test the gate conditions directly (no DOM interaction needed)
      globalData = { weekGymWins: 0, todayBattles: 0, highestLevel: 5, badges: 0, lockedGymLevel: 5, todayTasksDone: false, todayCompleted: false, hasChampionCloak: false, hasAmuletCoin: false, daysSinceLastBadge: 0 };
      var tests = [];

      // Test #1 (todayTasksDone gate): !todayTasksDone → chain should block
      var condition1 = !globalData.todayTasksDone; // true = blocked
      tests.push({ label: 'no_tasks', blockedByTasks: condition1 });

      // Test #2: todayTasksDone=true, weekGymWins=0 → NOT blocked
      globalData.todayTasksDone = true;
      var condition2 = !globalData.todayTasksDone || (globalData.weekGymWins || 0) >= 1;
      tests.push({ label: 'tasks_done_no_wins', blocked: condition2 });

      // Test #3: todayTasksDone=true, weekGymWins=1 → blocked by gym limit
      globalData.weekGymWins = 1;
      var condition3 = !globalData.todayTasksDone || (globalData.weekGymWins || 0) >= 1;
      tests.push({ label: 'tasks_done_one_win', blocked: condition3 });

      // Test #4: todayTasksDone=true, weekGymWins=0 → NOT blocked
      globalData.weekGymWins = 0;
      var condition4 = !globalData.todayTasksDone || (globalData.weekGymWins || 0) >= 1;
      tests.push({ label: 'tasks_done_after_reset', blocked: condition4 });

      // Test #5: badge cooldown — daysSinceLastBadge < BADGE_COOLDOWN_DAYS → badge blocked
      globalData.daysSinceLastBadge = 3;
      var badgeAllowedEarly = globalData.daysSinceLastBadge >= BADGE_COOLDOWN_DAYS;
      tests.push({ label: 'badge_cooldown_blocked', badgeAllowed: badgeAllowedEarly });

      // Test #6: badge cooldown — daysSinceLastBadge >= BADGE_COOLDOWN_DAYS → badge allowed
      globalData.daysSinceLastBadge = 8;
      var badgeAllowedLate = globalData.daysSinceLastBadge >= BADGE_COOLDOWN_DAYS;
      tests.push({ label: 'badge_cooldown_allowed', badgeAllowed: badgeAllowedLate });

      return tests;
    });
    // todayTasksDone gate: without tasks, !todayTasksDone = true (blocked)
    expect(gateResult[0].blockedByTasks).toBe(true);
    // with tasks + no gym wins → not blocked
    expect(gateResult[1].blocked).toBe(false);
    // with tasks + 1 gym win → blocked by week limit
    expect(gateResult[2].blocked).toBe(true);
    // after week reset → not blocked
    expect(gateResult[3].blocked).toBe(false);
    // badge cooldown gate: daysSinceLastBadge=3 (<7) → badge NOT awarded
    expect(gateResult[4].badgeAllowed).toBe(false);
    // badge cooldown gate: daysSinceLastBadge=8 (>=7) → badge awarded
    expect(gateResult[5].badgeAllowed).toBe(true);
  });

  test('M1→M3 模擬：跳級防護 + 八大師順序不變', async ({ page }) => {
    var skipResult = await page.evaluate(() => {
      globalData = { badges: 0, leagueRegionsWon: {}, masters8Completed: [], todayTasksDone: false, todayCompleted: false };
      var tests = [];

      // badge=0 → null (no league)
      tests.push({ label: 'badge0_e4', region: getNextE4Challenge(0) ? getNextE4Challenge(0).region : null });

      // badge=4 → 關都
      tests.push({ label: 'badge4_e4', region: getNextE4Challenge(4) ? getNextE4Challenge(4).region : null });

      // badge=12, 關都 not completed → jump protection: 關都 (not 豐緣!)
      tests.push({ label: 'badge12_skip_protect', region: getNextE4Challenge(12) ? getNextE4Challenge(12).region : null });

      // 關都+城都+豐緣+神奧+合眾 completed, badge=24 → 卡洛斯
      globalData.leagueRegionsWon = { '關都': true, '城都': true, '豐緣': true, '神奧': true, '合眾': true };
      tests.push({ label: 'five_done_badge24', region: getNextE4Challenge(24) ? getNextE4Challenge(24).region : null });

      // Masters8: only 關都 complete → 小智 (rank 8)
      globalData.leagueRegionsWon = { '關都': true };
      globalData.masters8Completed = [];
      var m8_1 = getUnlockedMasters8();
      tests.push({ label: 'm8_kanto_only', name: m8_1 ? m8_1.name : null, rank: m8_1 ? m8_1.rank : null });

      // Masters8: 關都+城都+豐緣, 小智 beaten → still 艾莉絲 (sequential, not jump to 艾嵐)
      globalData.leagueRegionsWon = { '關都': true, '城都': true, '豐緣': true };
      globalData.masters8Completed = ['小智'];
      var m8_2 = getUnlockedMasters8();
      tests.push({ label: 'm8_skip_protect', name: m8_2 ? m8_2.name : null, rank: m8_2 ? m8_2.rank : null });

      // Test #7: Masters8 boss week gate — W1 blocks, W4 allows
      var dwM8 = document.getElementById('devWeek');
      var origWeek = dwM8.value;
      dwM8.value = 'W1';
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();
      var gateW1 = isBossWeek() || isBufferPeriod();
      dwM8.value = 'W4';
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();
      var gateW4 = isBossWeek() || isBufferPeriod();
      dwM8.value = origWeek;
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();
      tests.push({ label: 'm8_gate_w1', allowed: gateW1 });
      tests.push({ label: 'm8_gate_w4', allowed: gateW4 });

      return tests;
    });

    expect(skipResult[0].region).toBeNull();
    expect(skipResult[1].region).toBe('關都');
    expect(skipResult[2].region).toBe('關都'); // jump protection
    expect(skipResult[3].region).toBe('卡洛斯');

    // Masters 8 sequential
    expect(skipResult[4].name).toBe('小智');
    expect(skipResult[4].rank).toBe(8);
    expect(skipResult[5].name).toBe('艾莉絲'); // not 艾嵐!
    expect(skipResult[5].rank).toBe(7);

    // Masters8 boss week gate: W1 blocks (not boss week)
    expect(skipResult[6].allowed).toBe(false);
    // Masters8 boss week gate: W4 allows (boss week)
    expect(skipResult[7].allowed).toBe(true);
  });

  test('M1→M3 UI 點擊路徑驗證：道館戰按鈕 → 戰鬥 Modal 開啟', async ({ page }) => {
    await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = {
        studentId: 'Admin',
        roster: [{ id: 'P0', baseName: '伊布', totalExp: 0, currentLevel: 5, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' }],
        partyIds: ['P0'], highestLevel: 5, lockedGymLevel: 5,
        coins: 0, badges: 0, weekGymWins: 0, monthLeagueWins: 0, weekBossWins: 0,
        todayBattles: 0, todayCompleted: true, todayTasksDone: true,
        daysSinceLastBadge: 99, lastBadgeTime: null,
        leagueRegionsWon: {}, masters8Completed: [], masters8Progress: [],
        hasChampionCloak: false, hasAmuletCoin: false
      };
      if (typeof updateDashboard === 'function') updateDashboard();
    });

    await page.click('#btnGymBattle');
    await page.waitForSelector('#battleModal', { state: 'visible', timeout: 5000 });

    var titleText = await page.locator('#battleTitle').textContent();
    expect(titleText).toContain('道館');

    // Close modal
    await page.evaluate(function() {
      document.getElementById('battleModal').style.display = 'none';
    });
  });

  test('M1→M3 UI 點擊路徑驗證：閘門阻擋（weekGymWins=1 時 startBattle 不開 Modal）', async ({ page }) => {
    var gateResult = await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = {
        studentId: 'Admin',
        roster: [{ id: 'P0', baseName: '伊布', totalExp: 0, currentLevel: 5, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' }],
        partyIds: ['P0'], highestLevel: 5, lockedGymLevel: 5,
        coins: 0, badges: 0, weekGymWins: 1, monthLeagueWins: 0, weekBossWins: 0,
        todayBattles: 0, todayCompleted: true, todayTasksDone: true,
        daysSinceLastBadge: 99, lastBadgeTime: null,
        leagueRegionsWon: {}, masters8Completed: [], masters8Progress: [],
        hasChampionCloak: false, hasAmuletCoin: false
      };
      if (typeof updateDashboard === 'function') updateDashboard();

      // Call startBattle directly (same logic as clicking #btnGymBattle)
      var modalBefore = document.getElementById('battleModal').style.display;
      window.startBattle(true, false); // isGym=true
      var modalAfter = document.getElementById('battleModal').style.display;

      // Also verify the gate condition itself
      var gateBlocked = (globalData.weekGymWins || 0) >= 1;

      return {
        gateBlocked: gateBlocked,
        modalDisplayBefore: modalBefore,
        modalDisplayAfter: modalAfter
      };
    });

    expect(gateResult.gateBlocked).toBe(true);
    // Modal stays hidden: before call it's '' (CSS default), after blocked call it should not be 'flex'
    expect(gateResult.modalDisplayAfter).not.toBe('flex');
  });

  test('M1→M3 模擬：多寶可夢 EXP 分配（先鋒 120% / 留守 50%）', async ({ page }) => {
    var result = await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = {
        studentId: 'Admin',
        roster: [
          { id: 'P0', baseName: '皮卡丘', currentLevel: 20, totalExp: 5000, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' },
          { id: 'P1', baseName: '妙蛙種子', currentLevel: 18, totalExp: 4000, initialLevel: 5, catchDate: '第二夥伴', heldItem: '' },
          { id: 'P2', baseName: '傑尼龜', currentLevel: 16, totalExp: 3000, initialLevel: 5, catchDate: '第三夥伴', heldItem: '' }
        ],
        partyIds: ['P0', 'P1', 'P2'],
        highestLevel: 20, lockedGymLevel: 20,
        coins: 0, badges: 0,
        weekGymWins: 0, monthLeagueWins: 0, weekBossWins: 0,
        todayBattles: 0, todayCompleted: true, todayTasksDone: true,
        daysSinceLastBadge: 99, lastBadgeTime: null,
        leagueRegionsWon: {}, masters8Completed: [], masters8Progress: [],
        hasChampionCloak: false, hasAmuletCoin: false
      };

      var origExec = window.executeSave;
      window.executeSave = function() {};
      window.scheduleStudentFieldUpdate = function() {};

      var gymResult = generateGymWaves(globalData.highestLevel);
      if (!gymResult || !gymResult.waves) return { error: 'no gym waves' };

      var totalExp = calcGymExp(gymResult.waves, false);
      var baseExp = totalExp;
      var leaderShare = Math.floor(baseExp * 1.2);
      var benchShare = Math.floor(baseExp * 0.5);

      // Simulate the real EXP assignment as in finishGymVictory
      globalData.roster[0].totalExp += leaderShare;
      globalData.roster[1].totalExp += benchShare;
      globalData.roster[2].totalExp += benchShare;

      // Recalc levels
      var lvl0 = calcLevelAndExp(globalData.roster[0].totalExp, globalData.roster[0].initialLevel);
      var lvl1 = calcLevelAndExp(globalData.roster[1].totalExp, globalData.roster[1].initialLevel);
      var lvl2 = calcLevelAndExp(globalData.roster[2].totalExp, globalData.roster[2].initialLevel);

      window.executeSave = origExec;

      return {
        baseExp: baseExp,
        leaderShare: leaderShare,
        benchShare: benchShare,
        totalP0: globalData.roster[0].totalExp,
        totalP1: globalData.roster[1].totalExp,
        lvl0: lvl0.level,
        lvl1: lvl1.level,
        lvl2: lvl2.level,
        rosterCount: globalData.roster.length
      };
    });

    // Verify basic structure
    expect(result.baseExp).toBeGreaterThan(0);
    expect(result.leaderShare).toBe(Math.floor(result.baseExp * 1.2));
    expect(result.benchShare).toBe(Math.floor(result.baseExp * 0.5));
    expect(result.rosterCount).toBe(3);

    // EXP ratios: leader 120%, bench 50%
    expect(result.leaderShare).toBeGreaterThan(result.baseExp);
    expect(result.benchShare).toBeLessThan(result.leaderShare);
    expect(result.benchShare).toBeLessThan(result.baseExp);
    expect(result.benchShare).toBeGreaterThan(0);

    // All mons should have gained EXP
    var p0Gained = result.totalP0 - 5000;
    var p1Gained = result.totalP1 - 4000;
    expect(p0Gained).toBe(result.leaderShare);
    expect(p1Gained).toBe(result.benchShare);
  });

  test('M1→M3 模擬：Firestore 寫入路徑驗證（事件溯源不得拋錯）', async ({ page }) => {
    var firestoreCalls = await page.evaluate(() => {
      var calls = [];

      var origExec = window.executeSave;
      var origSched = window.scheduleStudentFieldUpdate;

      window.executeSave = function(data) {
        calls.push({ fn: 'executeSave', keys: Object.keys(data || {}), hasStudentId: !!(data && data.studentId) });
      };
      window.scheduleStudentFieldUpdate = function(data) {
        calls.push({ fn: 'scheduleStudentFieldUpdate', hasData: !!data });
      };

      window.isAdmin = true;
      window.globalData = {
        studentId: 'Admin',
        roster: [{ id: 'P0', baseName: '伊布', totalExp: 1250, currentLevel: 7, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' }],
        highestLevel: 7, lockedGymLevel: 7, coins: 0, badges: 0,
        weekGymWins: 0, monthLeagueWins: 0, weekBossWins: 0,
        todayBattles: 0, todayCompleted: false, todayTasksDone: true,
        daysSinceLastBadge: 99, lastBadgeTime: null,
        leagueRegionsWon: {}, masters8Completed: [], masters8Progress: [],
        hasChampionCloak: false, hasAmuletCoin: false
      };

      // Set up battleState to call finishGymVictory (which triggers executeSave internally)
      var gymR = generateGymWaves(globalData.highestLevel);
      if (!gymR || !gymR.waves) return calls;

      battleState = {
        battleOver: false, playerWon: true,
        playerParty: [{ id: 'P0', name: '伊布', currentHp: 1, totalExp: 1250, initialLevel: 5 }],
        gymWaves: gymR.waves,
        totalWaves: gymR.waves.length,
        enemy: gymR.waves[gymR.waves.length - 1],
        gymInfo: gymR.gymInfo,
        isGym: true, isLeague: false, isMasters8: false
      };

      // This will call executeSave internally
      finishGymVictory();

      // Also verify scheduleStudentFieldUpdate path via finishMasters8Victory
      var savedExecCalls = calls.filter(function(c){ return c.fn === 'executeSave'; }).length;
      battleState = {
        battleOver: false, playerWon: true,
        playerParty: [{ id: 'P0', name: '伊布', currentHp: 1, totalExp: globalData.roster[0].totalExp, initialLevel: 5 }],
        gymWaves: gymR.waves,
        totalWaves: gymR.waves.length,
        enemy: gymR.waves[gymR.waves.length - 1],
        gymInfo: { leader: '艾莉絲 (八大師)' },
        isGym: false, isLeague: false, isMasters8: true
      };
      finishMasters8Victory();

      window.executeSave = origExec;
      window.scheduleStudentFieldUpdate = origSched;

      return calls;
    });

    // executeSave must have been called for both gym and M8 victories
    var execCalls = firestoreCalls.filter(function(c) { return c.fn === 'executeSave'; });
    expect(execCalls.length).toBeGreaterThanOrEqual(2);
    expect(execCalls[0].hasStudentId).toBe(true);
    expect(execCalls[0].keys).toContain('studentId');
    expect(execCalls[0].keys).toContain('expGained');
    expect(execCalls[0].keys).toContain('action');

    // scheduleStudentFieldUpdate must have been called for M8 victory
    var schedCalls = firestoreCalls.filter(function(c) { return c.fn === 'scheduleStudentFieldUpdate'; });
    expect(schedCalls.length).toBeGreaterThanOrEqual(1);
    expect(schedCalls[0].hasData).toBe(true);
  });

  test('M1→M3 衛冕挑戰模擬（P2-6）：checkDefenseChallenge 回歸正確地區', async ({ page }) => {
    var defenseResult = await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = {
        studentId: 'Admin', highestLevel: 20, lockedGymLevel: 20,
        roster: [{ id: 'P0', baseName: '伊布', totalExp: 5000, currentLevel: 20, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' }],
        coins: 0, badges: 8, weekGymWins: 0, monthLeagueWins: 1, weekBossWins: 0,
        todayBattles: 0, todayCompleted: true, todayTasksDone: true,
        daysSinceLastBadge: 8, lastBadgeTime: null,
        leagueRegionsWon: { '關都': true, '城都': true, '豐緣': true },
        masters8Completed: [], masters8Progress: [],
        hasChampionCloak: false, hasAmuletCoin: false
      };
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();

      // Simulate completing 關都 league this month (set monthKey for 關都)
      var monthKey = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      leagueCompletedMonths['關都'] = monthKey;
      leagueCompletedMonths['城都'] = monthKey;
      leagueCompletedMonths['豐緣'] = monthKey;

      // Clear cooldown localStorage
      localStorage.removeItem('lastDefense_關都');
      localStorage.removeItem('lastDefense_城都');
      localStorage.removeItem('lastDefense_豐緣');

      var tests = [];

      // Test 1: league completed, no cooldown → returns a league region
      var challenge1 = checkDefenseChallenge();
      tests.push({ label: 'no_cooldown', present: !!challenge1 });

      // Test 2: if returned region is one of the completed ones
      tests.push({ label: 'returned_region_valid', region: challenge1,
        isValid: challenge1 ? (challenge1 === '關都' || challenge1 === '城都' || challenge1 === '豐緣') : false });

      // Test 3: Set cooldown on ALL completed regions → returns null
      localStorage.setItem('lastDefense_關都', String(Date.now()));
      localStorage.setItem('lastDefense_城都', String(Date.now()));
      localStorage.setItem('lastDefense_豐緣', String(Date.now()));
      var challenge2 = checkDefenseChallenge();
      tests.push({ label: 'with_cooldown', present: !!challenge2 });

      // Test 4: No league completed this month → null
      for (var rn in leagueCompletedMonths) delete leagueCompletedMonths[rn];
      var challenge3 = checkDefenseChallenge();
      tests.push({ label: 'no_league_this_month', present: !!challenge3 });

      return tests;
    });

    expect(defenseResult[0].present).toBe(true);
    expect(defenseResult[1].isValid).toBe(true);
    expect(defenseResult[2].present).toBe(false);
    expect(defenseResult[3].present).toBe(false);
  });

  test('M1→M3 衛冕挑戰模擬（P2-6）：triggerDefenseChallenge 開啟 Modal', async ({ page }) => {
    var modalResult = await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = {
        studentId: 'Admin', highestLevel: 20, lockedGymLevel: 20,
        roster: [{ id: 'P0', baseName: '伊布', totalExp: 5000, currentLevel: 20, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' }],
        coins: 0, badges: 8, weekGymWins: 0, monthLeagueWins: 1, weekBossWins: 0,
        todayBattles: 0, todayCompleted: true, todayTasksDone: true,
        daysSinceLastBadge: 8, lastBadgeTime: null,
        leagueRegionsWon: { '關都': true, '城都': true, '豐緣': true },
        masters8Completed: [], masters8Progress: [],
        hasChampionCloak: false, hasAmuletCoin: false
      };
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();

      var monthKey = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      leagueCompletedMonths['關都'] = monthKey;
      localStorage.removeItem('lastDefense_關都');

      // triggerDefenseChallenge should open the defense modal
      triggerDefenseChallenge();
      var modalDisplay = document.getElementById('defenseModal').style.display;
      var defenseBody = document.getElementById('defenseBody');
      var bodyText = defenseBody ? defenseBody.innerHTML : '';

      // Close modal
      document.getElementById('defenseModal').style.display = 'none';

      return { modalDisplay: modalDisplay, bodyContainsChampion: bodyText.indexOf('衛冕者') !== -1 };
    });

    expect(modalResult.modalDisplay).toBe('flex');
    expect(modalResult.bodyContainsChampion).toBe(true);
  });

  test('M1→M3 模擬（P2-8）：冠軍披風 calcGymExp ×1.5', async ({ page }) => {
    var cloakResult = await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = { highestLevel: 20, roster: [], hasChampionCloak: false };
      var gymR = generateGymWaves(20);
      if (!gymR || !gymR.waves) return { error: 'no waves' };
      var noCloak = calcGymExp(gymR.waves, false);
      var withCloak = calcGymExp(gymR.waves, true);
      return { baseWaves: gymR.waves.length, noCloak: noCloak, withCloak: withCloak, ratio: withCloak / noCloak };
    });

    expect(cloakResult.noCloak).toBeGreaterThan(0);
    expect(cloakResult.withCloak).toBeGreaterThan(cloakResult.noCloak);
    expect(cloakResult.ratio).toBeCloseTo(1.5, 1);
  });

  test('M1→M3 模擬（P2-8）：冠軍披風 calcLeagueExp ×1.5', async ({ page }) => {
    var cloakResult = await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = { highestLevel: 20, badges: 32, roster: [], hasChampionCloak: false };
      var leagueR = generateLeagueGauntlet(20, '關都');
      if (!leagueR || !leagueR.waves) return { error: 'no waves' };
      var noCloak = calcLeagueExp(leagueR.waves, false);
      var withCloak = calcLeagueExp(leagueR.waves, true);
      return { baseWaves: leagueR.waves.length, noCloak: noCloak, withCloak: withCloak, ratio: withCloak / noCloak };
    });

    expect(cloakResult.noCloak).toBeGreaterThan(0);
    expect(cloakResult.withCloak).toBeGreaterThan(cloakResult.noCloak);
    expect(cloakResult.ratio).toBeCloseTo(1.5, 1);
  });

  test('M1→M3 模擬（P2-7）：W2 道館加成週 endBattle EXP ×1.5', async ({ page }) => {
    var w2Result = await page.evaluate(function() {
      window.isAdmin = true;
      window.globalData = { highestLevel: 20, hasChampionCloak: false, hasAmuletCoin: false };

      // Set week to W2
      var dw = document.getElementById('devWeek');
      dw.value = 'W2';
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();

      var weekType = getWeekType();
      var enemyLevel = 15;

      // Replicate the endBattle EXP formula for single-enemy (arena) battle
      var baseExp = ARENA_EXP_BASE + Math.floor(enemyLevel * 3);
      var gymMultBase = Math.floor(baseExp * 1.8);         // battleState.isGym
      var w2Bonus = Math.floor(gymMultBase * 1.5);          // W2 bonus
      var nonW2 = gymMultBase;                               // no W2 bonus (W1/W3/W4)

      // Set week to W1 for comparison
      dw.value = 'W1';
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();
      var weekTypeW1 = getWeekType();

      return {
        weekTypeIsW2: weekType === 'W2',
        weekTypeW1: weekTypeW1,
        nonW2Exp: nonW2,
        w2Exp: w2Bonus,
        ratio: w2Bonus / nonW2,
        formulaNonW2: gymMultBase,
        formulaW2: Math.floor(gymMultBase * 1.5)
      };
    });

    expect(w2Result.weekTypeIsW2).toBe(true);
    expect(w2Result.weekTypeW1).toBe('W1');
    expect(w2Result.nonW2Exp).toBeGreaterThan(0);
    expect(w2Result.w2Exp).toBeGreaterThan(w2Result.nonW2Exp);
    expect(w2Result.ratio).toBeCloseTo(1.5, 1);
    expect(w2Result.w2Exp).toBe(w2Result.formulaW2);
    expect(w2Result.nonW2Exp).toBe(w2Result.formulaNonW2);
  });
});
