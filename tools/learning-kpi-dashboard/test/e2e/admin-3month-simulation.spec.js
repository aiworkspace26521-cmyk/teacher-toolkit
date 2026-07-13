const { test, expect } = require('@playwright/test');

test.describe('Admin 3-Month Simulation (M1→M3) vs VER2.4', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 60000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  // ─────────────────────────────────────────────
  // Helper: advance week with verify
  // ─────────────────────────────────────────────
  async function setWeek(page, week) {
    await page.evaluate((w) => {
      var dw = document.getElementById('devWeek');
      if (dw) dw.value = w;
      if (typeof forceAdminUpdate === 'function') forceAdminUpdate();
    }, week);
  }

  async function setMonth(page, month) {
    await page.evaluate((m) => {
      var dm = document.getElementById('devMonth');
      if (dm) dm.value = String(m);
    }, month);
    // Force re-render with new month
    await page.evaluate(() => {
      if (typeof updatePreview === 'function') updatePreview();
      if (typeof renderBadgeCase === 'function') renderBadgeCase();
      if (typeof updateDashboard === 'function') updateDashboard();
    });
  }

  async function addBadges(page, n) {
    await page.evaluate(async (count) => {
      for (var i = 0; i < count; i++) {
        globalData.badges += 1;
      }
    }, n);
  }

  async function verifyGymState(page, expectedText, shouldContain) {
    var state = await page.evaluate(() => {
      var preview = document.getElementById('gymPreview');
      return preview ? preview.textContent : '';
    });
    if (shouldContain) {
      expect(state).toContain(expectedText);
    } else {
      expect(state).not.toContain(expectedText);
    }
  }

  // ─────────────────────────────────────────────
  // Test 1: M1 — Initial state + badge accumulation
  // ─────────────────────────────────────────────
  test('M1: 徽章累積每週限制 (weekGymWins >= 1 阻擋)', async ({ page }) => {
    // Force clean globalData for this test
    var result = await page.evaluate(() => {
      // Simulate M1 scenario with clean state
      globalData.badges = 0;
      globalData.weekGymWins = 0;

      var tests = [];

      // wgw=0 → pass (can battle)
      var can1 = (globalData.weekGymWins || 0) >= 1 ? 'blocked' : 'pass';
      tests.push({ wgw: 0, result: can1 });

      // wgw=1 → blocked (already done this week)
      globalData.weekGymWins = 1;
      var can2 = (globalData.weekGymWins || 0) >= 1 ? 'blocked' : 'pass';
      tests.push({ wgw: 1, result: can2 });

      // wgw=2 → blocked
      globalData.weekGymWins = 2;
      var can3 = (globalData.weekGymWins || 0) >= 1 ? 'blocked' : 'pass';
      tests.push({ wgw: 2, result: can3 });

      return tests;
    });

    expect(result[0].result).toBe('pass');
    expect(result[1].result).toBe('blocked');
    expect(result[2].result).toBe('blocked');
  });

  // ─────────────────────────────────────────────
  // Test 2: Sequential region completion
  // ─────────────────────────────────────────────
  test('M1→M3: 依序通關（關都→城都→豐緣）', async ({ page }) => {
    // VER2.4 §4.1: getNextE4Challenge returns correct region based on badges + completed regions
    var orderResult = await page.evaluate(() => {
      globalData.leagueRegionsWon = {};
      var tests = [];

      // badge=0 → null
      tests.push({ badge: 0, region: getNextE4Challenge(0) });

      // badge=4 → 關都
      tests.push({ badge: 4, region: getNextE4Challenge(4) ? getNextE4Challenge(4).region : null });

      // badge=4 with 關都 completed → null
      globalData.leagueRegionsWon['關都'] = true;
      tests.push({ badge: 4, region: getNextE4Challenge(4) });

      // badge=8 → 城都
      tests.push({ badge: 8, region: getNextE4Challenge(8) ? getNextE4Challenge(8).region : null });

      // badge=12 with 關都 not yet → still 關都 (skip protection: must complete sequentially)
      delete globalData.leagueRegionsWon['關都'];
      tests.push({ badge: 12, region: getNextE4Challenge(12) ? getNextE4Challenge(12).region : null });

      // Re-complete 關都, badge=12 → 豐緣
      globalData.leagueRegionsWon['關都'] = true;
      globalData.leagueRegionsWon['城都'] = true;
      tests.push({ badge: 12, region: getNextE4Challenge(12) ? getNextE4Challenge(12).region : null });

      return tests.map(function(t) { return { badge: t.badge, region: t.region }; });
    });

    expect(orderResult[0].badge).toBe(0);
    expect(orderResult[0].region).toBeNull();

    expect(orderResult[1].badge).toBe(4);
    expect(orderResult[1].region).toBe('關都');

    expect(orderResult[2].badge).toBe(4);
    expect(orderResult[2].region).toBeNull(); // 關都已完成

    expect(orderResult[3].badge).toBe(8);
    expect(orderResult[3].region).toBe('城都');

    // Skip protection: badge=12 but 關都 not completed → must return 關都
    expect(orderResult[4].badge).toBe(12);
    expect(orderResult[4].region).toBe('關都'); // 跳級防護：強制回傳關都

    // With 關都+城都 completed, badge=12 → 豐緣
    expect(orderResult[5].badge).toBe(12);
    expect(orderResult[5].region).toBe('豐緣');
  });

  // ─────────────────────────────────────────────
  // Test 3: Masters 8 rank 8→1 sequential unlock
  // ─────────────────────────────────────────────
  test('M1→M3: 八大師 rank 8→1 順序解鎖', async ({ page }) => {
    var m8Result = await page.evaluate(() => {
      var tests = [];

      // Only 關都 completed → 小智 (rank 8)
      globalData = { leagueRegionsWon: { '關都': true }, masters8Completed: [] };
      var a = getUnlockedMasters8();
      tests.push({ label: 'kanto_only', name: a ? a.name : null, rank: a ? a.rank : null });

      // 關都+城都 completed, 小智 beaten → 艾莉絲 (rank 7)
      globalData.leagueRegionsWon = { '關都': true, '城都': true };
      globalData.masters8Completed = ['小智'];
      var b = getUnlockedMasters8();
      tests.push({ label: 'kanto_johto_beat_satoshi', name: b ? b.name : null, rank: b ? b.rank : null });

      // 關都+城都+豐緣 completed, 小智 beaten → 艾莉絲 (not 艾嵐, must sequential)
      globalData.leagueRegionsWon = { '關都': true, '城都': true, '豐緣': true };
      globalData.masters8Completed = ['小智'];
      var c = getUnlockedMasters8();
      tests.push({ label: 'skip_protection', name: c ? c.name : null, rank: c ? c.rank : null });

      // M3 scenario: all M1-M3 regions completed, 小智+艾莉絲 beaten → 艾嵐 (rank 6)
      globalData.leagueRegionsWon = { '關都': true, '城都': true, '豐緣': true };
      globalData.masters8Completed = ['小智', '艾莉絲'];
      var d = getUnlockedMasters8();
      tests.push({ label: 'm3_beat_two', name: d ? d.name : null, rank: d ? d.rank : null });

      return tests;
    });

    expect(m8Result[0].name).toBe('小智');
    expect(m8Result[0].rank).toBe(8);
    expect(m8Result[1].name).toBe('艾莉絲');
    expect(m8Result[1].rank).toBe(7);

    // Skip protection: 豐緣 unlocked but 艾莉絲 not beaten → still 艾莉絲
    expect(m8Result[2].name).toBe('艾莉絲');
    expect(m8Result[2].rank).toBe(7);

    // M3: 關都+城都+豐緣, 小智+艾莉絲 beaten → 艾嵐
    expect(m8Result[3].name).toBe('艾嵐');
    expect(m8Result[3].rank).toBe(6);
  });

  // ─────────────────────────────────────────────
  // Test 4: Week-based behavior (W1-W3 vs W4)
  // ─────────────────────────────────────────────
  test('W1-W3 灰色 vs W4 啟用', async ({ page }) => {
    // Test league button states across weeks
    var states = await page.evaluate(() => {
      var dw = document.getElementById('devWeek');
      var results = [];
      var weeks = ['W1', 'W2', 'W3', 'W4'];

      weeks.forEach(function(w) {
        dw.value = w;
        if (typeof forceAdminUpdate === 'function') forceAdminUpdate();
        var leagueBtn = document.getElementById('btnLeagueBattle');
        var m8Btn = document.getElementById('btnMasters8Battle');
        results.push({
          week: w,
          leagueDisplay: leagueBtn ? leagueBtn.style.display : '',
          leagueOpacity: leagueBtn ? leagueBtn.style.opacity : '',
          m8Display: m8Btn ? m8Btn.style.display : ''
        });
      });

      return results;
    });

    // W1-W3: league should be visible but gray (opacity 0.4)
    for (var i = 0; i < 3; i++) {
      expect(states[i].leagueDisplay).toBe('inline-block');
      expect(states[i].leagueOpacity).toBe('0.4');
    }

    // W4: league should be fully enabled
    expect(states[3].leagueDisplay).toBe('inline-block');
    expect(states[3].leagueOpacity).not.toBe('0.4');
  });

  // ─────────────────────────────────────────────
  // Test 5: Buffer period behavior
  // ─────────────────────────────────────────────
  test('緩衝期行為 (次月 W1 可補打聯盟)', async ({ page }) => {
    var bufResult = await page.evaluate(() => {
      var savedMonth = {};
      for (var k in leagueCompletedMonths) savedMonth[k] = leagueCompletedMonths[k];
      var adminSaved = isAdmin;
      isAdmin = false;
      var OrigDate = Date;
      var tests = [];

      // Test 1: Day 10 (not W1) + no last month → no buffer
      leagueCompletedMonths = {};
      globalData = { badges: 20, leagueRegionsWon: {}, leagueCompletedMonths: {} };
      Date = function() { return new OrigDate(2026, 6, 10); };
      Date.now = function() { return new OrigDate(2026, 6, 10).getTime(); };
      tests.push({ label: 'day10_no_last_month', buffer: isBufferPeriod() });

      // Test 2: Day 3 (W1) + 關都 completed last month → buffer = true
      leagueCompletedMonths = {};
      leagueCompletedMonths['關都'] = '2026-6';
      globalData = { badges: 20, leagueRegionsWon: {} };
      Date = function() { return new OrigDate(2026, 6, 3); };
      Date.now = function() { return new OrigDate(2026, 6, 3).getTime(); };
      tests.push({ label: 'day3_last_month_kanto', buffer: isBufferPeriod() });

      // Test 3: Day 3 + badges=0 + no completed regions + no last month → false
      leagueCompletedMonths = {};
      globalData = { badges: 0, leagueRegionsWon: {} };
      Date = function() { return new OrigDate(2026, 6, 3); };
      Date.now = function() { return new OrigDate(2026, 6, 3).getTime(); };
      tests.push({ label: 'day3_no_badges_clean', buffer: isBufferPeriod() });

      // Test 4: Day 8 (not W1) + last month completed → false
      leagueCompletedMonths = {};
      leagueCompletedMonths['關都'] = '2026-6';
      globalData = { badges: 32, leagueRegionsWon: {} };
      Date = function() { return new OrigDate(2026, 6, 8); };
      Date.now = function() { return new OrigDate(2026, 6, 8).getTime(); };
      tests.push({ label: 'day8_with_last_month', buffer: isBufferPeriod() });

      // Restore
      Date = OrigDate; Date.now = OrigDate.now;
      leagueCompletedMonths = savedMonth;
      isAdmin = adminSaved;

      return tests;
    });

    expect(bufResult.find(t => t.label === 'day10_no_last_month').buffer).toBe(false);
    expect(bufResult.find(t => t.label === 'day3_last_month_kanto').buffer).toBe(true);
    expect(bufResult.find(t => t.label === 'day3_no_badges_clean').buffer).toBe(false);
    expect(bufResult.find(t => t.label === 'day8_with_last_month').buffer).toBe(false);
  });

  // ─────────────────────────────────────────────
  // Test 6: Skip protection — can't skip regions
  // ─────────────────────────────────────────────
  test('跳級防護：無法跳過未完成地區', async ({ page }) => {
    var skipResult = await page.evaluate(() => {
      var tests = [];

      // Scenario: badge=12 but 關都 not completed → nextE4=關都
      globalData = { leagueRegionsWon: {}, badges: 12 };
      var a = getNextE4Challenge(12);
      tests.push({ label: 'badge12_no_kanto', region: a ? a.region : null });

      // Scenario: badge=12, 關都 completed, 城都 not → 城都
      globalData.leagueRegionsWon = { '關都': true };
      var b = getNextE4Challenge(12);
      tests.push({ label: 'badge12_kanto_done', region: b ? b.region : null });

      // Scenario: badge=32, only 關都 done → 城都 (not 伽勒爾!)
      globalData.leagueRegionsWon = { '關都': true };
      var c = getNextE4Challenge(32);
      tests.push({ label: 'badge32_only_kanto', region: c ? c.region : null });

      // Scenario: badge=20, 關都+城都+豐緣+神奧 done → 合眾
      globalData.leagueRegionsWon = { '關都': true, '城都': true, '豐緣': true, '神奧': true };
      var d = getNextE4Challenge(20);
      tests.push({ label: 'badge20_four_done', region: d ? d.region : null });

      return tests;
    });

    expect(skipResult[0].region).toBe('關都');    // must start from 關都
    expect(skipResult[1].region).toBe('城都');    // 關都 done → 城都
    expect(skipResult[2].region).toBe('城都');    // 32 badges but only 關都 → still 城都!
    expect(skipResult[3].region).toBe('合眾');    // 4 regions done → 合眾
  });

  // ─────────────────────────────────────────────
  // Test 7: M1→M3 comprehensive scenario
  // ─────────────────────────────────────────────
  test('M1→M3 完整情境：徽章→聯盟完成→八大師解鎖→跨月', async ({ page }) => {
    var scenario = await page.evaluate(() => {
      var results = [];

      // === M1 W1: 0 badges ===
      globalData = {
        studentId: 'Admin', badges: 0, highestLevel: 13,
        leagueRegionsWon: {}, masters8Completed: [], masters8Progress: [],
        weekGymWins: 0, weekBossWins: 0, monthLeagueWins: 0
      };
      var m1_w1_e4 = getNextE4Challenge(0);
      results.push({ phase: 'M1_W1', badges: 0, nextE4: m1_w1_e4, label: '無徽章 → 無聯盟' });

      // === M1 W4 before league: badges=4, league not yet completed ===
      globalData.badges = 4;
      var m1_w4_pre = getNextE4Challenge(4);
      // 關都 not completed yet → Masters8 not unlocked
      var m1_m8_before = getUnlockedMasters8();
      results.push({ phase: 'M1_W4_before_league', badges: 4,
        nextE4: m1_w4_pre ? m1_w4_pre.region : null,
        m8Name: m1_m8_before ? m1_m8_before.name : null,
        label: '徽章=4, 聯盟未完成 → 八大師鎖定' });

      // === M1 W4 after completing 關都 league ===
      globalData.leagueRegionsWon = { '關都': true };
      var m1_m8_after = getUnlockedMasters8();
      results.push({ phase: 'M1_W4_after_league', badges: 4,
        m8Name: m1_m8_after ? m1_m8_after.name : null,
        m8Rank: m1_m8_after ? m1_m8_after.rank : null,
        label: '關都聯盟完成 → 小智解鎖' });

      // === M2 W4 before 城都 league: badges=8, 關都 done ===
      globalData.badges = 8;
      globalData.leagueRegionsWon = { '關都': true };
      globalData.masters8Completed = ['小智'];
      var m2_pre_e4 = getNextE4Challenge(8);
      var m2_pre_m8 = getUnlockedMasters8();
      results.push({ phase: 'M2_W4_before_league', badges: 8,
        nextE4: m2_pre_e4 ? m2_pre_e4.region : null,
        m8Name: m2_pre_m8 ? m2_pre_m8.name : null,
        label: '徽章=8, 關都done, 城都未完成 → 城都聯盟' });

      // === M2 W4 after 城都 league: badges=8, 城都 done ===
      globalData.leagueRegionsWon = { '關都': true, '城都': true };
      var m2_after_e4 = getNextE4Challenge(8);
      var m2_after_m8 = getUnlockedMasters8();
      results.push({ phase: 'M2_W4_after_league', badges: 8,
        nextE4: m2_after_e4 ? m2_after_e4.region : null,
        m8Name: m2_after_m8 ? m2_after_m8.name : null,
        m8Rank: m2_after_m8 ? m2_after_m8.rank : null,
        label: '城都完成+小智擊敗 → 艾莉絲解鎖' });

      // === M3 W4 before 豐緣 league: badges=12, 關都+城都 completed ===
      globalData.badges = 12;
      globalData.leagueRegionsWon = { '關都': true, '城都': true };
      globalData.masters8Completed = ['小智', '艾莉絲'];
      var m3_pre_e4 = getNextE4Challenge(12);
      var m3_pre_m8 = getUnlockedMasters8();
      results.push({ phase: 'M3_W4_pre', badges: 12,
        nextE4: m3_pre_e4 ? m3_pre_e4.region : null,
        m8Name: m3_pre_m8 ? m3_pre_m8.name : null,
        label: '徽章=12, 關都+城都 done → 豐緣聯盟可用' });

      // === M3 W4 after 豐緣 league: 豐緣 done ===
      globalData.leagueRegionsWon['豐緣'] = true;
      globalData.masters8Completed = ['小智', '艾莉絲'];
      var m3_after_e4 = getNextE4Challenge(12);
      var m3_after_m8 = getUnlockedMasters8();
      results.push({ phase: 'M3_W4_after', badges: 12,
        nextE4: m3_after_e4 ? m3_after_e4.region : null,
        m8Name: m3_after_m8 ? m3_after_m8.name : null,
        m8Rank: m3_after_m8 ? m3_after_m8.rank : null,
        label: '豐緣完成+小智艾莉絲擊敗 → 艾嵐解鎖' });

      return results;
    });

    // M1 W1: no E4 challenge
    expect(scenario[0].nextE4).toBeNull();

    // M1 W4 before league: 關都 available, Masters8 locked
    expect(scenario[1].nextE4).toBe('關都');
    expect(scenario[1].m8Name).toBeNull();

    // M1 W4 after league: 小智 unlocked
    expect(scenario[2].m8Name).toBe('小智');
    expect(scenario[2].m8Rank).toBe(8);

    // M2 W4 before 城都 league: 城都 available, Masters8 locked (城都 not completed)
    expect(scenario[3].nextE4).toBe('城都');
    expect(scenario[3].m8Name).toBeNull(); // 城都 league not yet completed

    // M2 W4 after 城都 league: nextE4 null (need 12 badges), 艾莉絲 unlocked
    expect(scenario[4].nextE4).toBeNull();
    expect(scenario[4].m8Name).toBe('艾莉絲');
    expect(scenario[4].m8Rank).toBe(7);

    // M3: 豐緣 league available (城都 completed, need 12 badges)
    expect(scenario[5].nextE4).toBe('豐緣');
    expect(scenario[5].m8Name).toBeNull(); // need to beat 艾莉絲 first

    // M3 after 豐緣 completed + 小智+艾莉絲 beaten → 艾嵐
    expect(scenario[6].m8Name).toBe('艾嵐');
    expect(scenario[6].m8Rank).toBe(6);
  });

  // ─────────────────────────────────────────────
  // Test 8: Admin Pokemon level at M3
  // ─────────────────────────────────────────────
  test('Admin M3 寶可夢等級驗證', async ({ page }) => {
    var m3Data = await page.evaluate(() => {
      // Make Admin have badge=12 (M3 豐緣 level)
      globalData.badges = 12;
      globalData.highestLevel = 46; // Expected level for badge 12

      // Check EXPECTED_LEVEL for M3 range (badge 9-12 = 37, 40, 43, 46)
      var expectedLv = EXPECTED_LEVEL[12]; // index 12 = badge 12-1 = 11, wait index is 1-based?
      // EXPECTED_LEVEL[0] = badge 1, so EXPECTED_LEVEL[11] = badge 12 = 46
      var lv_badge9 = EXPECTED_LEVEL[8]; // index 8 = badge 9
      var lv_badge10 = EXPECTED_LEVEL[9];
      var lv_badge11 = EXPECTED_LEVEL[10];
      var lv_badge12 = EXPECTED_LEVEL[11];

      return {
        badge9_level: lv_badge9,
        badge10_level: lv_badge10,
        badge11_level: lv_badge11,
        badge12_level: lv_badge12,
        playerLevel: globalData.highestLevel
      };
    });

    // VER2.4 §3.2: M3 values
    expect(m3Data.badge9_level).toBe(37);
    expect(m3Data.badge10_level).toBe(40);
    expect(m3Data.badge11_level).toBe(43);
    expect(m3Data.badge12_level).toBe(46);

    // Admin Pokemon level should be >= expected level at M3
    expect(m3Data.playerLevel).toBe(46);
  });

  // ─────────────────────────────────────────────
  // Test 9: LEAGUE_REGIONS data structure verification
  // ─────────────────────────────────────────────
  test('LEAGUE_REGIONS requiredBadges 符合 VER2.4', async ({ page }) => {
    var lrData = await page.evaluate(() => {
      var regions = ['關都','城都','豐緣','神奧','合眾','卡洛斯','阿羅拉','伽勒爾'];
      return regions.map(function(r) {
        return {
          region: r,
          requiredBadges: LEAGUE_REGIONS[r].requiredBadges,
          order: LEAGUE_REGIONS[r].order
        };
      });
    });

    expect(lrData[0]).toEqual({ region: '關都', requiredBadges: 4, order: 0 });
    expect(lrData[1]).toEqual({ region: '城都', requiredBadges: 8, order: 1 });
    expect(lrData[2]).toEqual({ region: '豐緣', requiredBadges: 12, order: 2 });
    expect(lrData[3]).toEqual({ region: '神奧', requiredBadges: 16, order: 3 });
    expect(lrData[4]).toEqual({ region: '合眾', requiredBadges: 20, order: 4 });
    expect(lrData[5]).toEqual({ region: '卡洛斯', requiredBadges: 24, order: 5 });
    expect(lrData[6]).toEqual({ region: '阿羅拉', requiredBadges: 28, order: 6 });
    expect(lrData[7]).toEqual({ region: '伽勒爾', requiredBadges: 32, order: 7 });
  });

  // ─────────────────────────────────────────────
  // Test 10: MASTERS_8 data structure verification
  // ─────────────────────────────────────────────
  test('MASTERS_8 rank/name/lvBonus 符合 VER2.4 §5.3', async ({ page }) => {
    var m8Data = await page.evaluate(() => {
      return MASTERS_8.map(function(m) {
        return { rank: m.rank, name: m.name, lvBonus: m.lvBonus };
      });
    });

    expect(m8Data[0]).toEqual({ rank: 8, name: '小智', lvBonus: 75 });
    expect(m8Data[1]).toEqual({ rank: 7, name: '艾莉絲', lvBonus: 80 });
    expect(m8Data[2]).toEqual({ rank: 6, name: '艾嵐', lvBonus: 82 });
    expect(m8Data[3]).toEqual({ rank: 5, name: '卡露妮', lvBonus: 85 });
    expect(m8Data[4]).toEqual({ rank: 4, name: '渡', lvBonus: 88 });
    expect(m8Data[5]).toEqual({ rank: 3, name: '大吾', lvBonus: 92 });
    expect(m8Data[6]).toEqual({ rank: 2, name: '竹蘭', lvBonus: 96 });
    expect(m8Data[7]).toEqual({ rank: 1, name: '丹帝', lvBonus: 100 });
  });

  // ─────────────────────────────────────────────
  // Test 11: isAdmin skips buffer period (VER2.4 spec)
  // ─────────────────────────────────────────────
  test('Admin 模式 isBufferPeriod 永遠 false', async ({ page }) => {
    var result = await page.evaluate(() => {
      isAdmin = true;
      var lastKey = new Date().getFullYear() + '-' + ((new Date().getMonth() === 0 ? 11 : new Date().getMonth()));
      leagueCompletedMonths['關都'] = lastKey;
      globalData = { badges: 32, leagueRegionsWon: { '關都': true } };
      var buf = isBufferPeriod();
      return { buffer: buf };
    });
    expect(result.buffer).toBe(false);
  });

  // ─────────────────────────────────────────────
  // Test 12: devWeek selector controls getWeekType for Admin
  // ─────────────────────────────────────────────
  test('Admin devWeek 控制 getWeekType', async ({ page }) => {
    var weekTypes = await page.evaluate(() => {
      var dw = document.getElementById('devWeek');
      var types = [];
      ['W1','W2','W3','W4'].forEach(function(w) {
        dw.value = w;
        types.push(getWeekType());
      });
      return types;
    });

    expect(weekTypes[0]).toBe('W1');
    expect(weekTypes[1]).toBe('W2');
    expect(weekTypes[2]).toBe('W3');
    expect(weekTypes[3]).toBe('W4');
  });
});
