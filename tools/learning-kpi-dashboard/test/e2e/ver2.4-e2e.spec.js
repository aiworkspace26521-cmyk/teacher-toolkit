const { test, expect } = require('@playwright/test');

test.describe('VER2.4 E2E — 道館限額／聯盟開關／依序通關／八大師順序／緩衝期', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 60000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  // ─────────────────────────────────────────────
  // 1. 道館戰 1 次/週上限 (VER2.5: >=3→>=1)
  // ─────────────────────────────────────────────
  test('E2E-G1: startBattle 的 weekGymWins guard 邏輯正確', async ({ page }) => {
    const result = await page.evaluate(() => {
      isAdmin = true;
      var dw = document.getElementById('devWeek');
      if (dw) dw.value = 'W1';

      var check = function(wgw) {
        globalData = {
          studentId: 'Neil', highestLevel: 20, badges: 0,
          todayStatus: "PENDING", todayBattles: 0, weekGymWins: wgw,
          roster: [], partyIds: []
        };
        if (!globalData || typeof globalData.highestLevel === 'undefined') return 'early';
        if ((globalData.todayBattles || 0) >= 5) return 'dailyLimit';
        if ((globalData.weekGymWins || 0) >= 1) return 'blocked';
        return 'pass';
      };

      return {
        wgw0: check(0),
        wgw1: check(1),
        wgw2: check(2),
        wgw3: check(3)
      };
    });
    expect(result.wgw0).toBe('pass');
    expect(result.wgw1).toBe('blocked');
    expect(result.wgw2).toBe('blocked');
    expect(result.wgw3).toBe('blocked');
  });

  test('E2E-G2: gymPreview 顯示本週道館狀態 (0/1 與 1/1)', async ({ page }) => {
    await page.evaluate(() => {
      isAdmin = true;
      globalData = {
        studentId: 'Neil', highestLevel: 20, badges: 0,
        todayStatus: "PENDING", todayBattles: 0, weekGymWins: 0,
        daysSinceLastBadge: 10, roster: [], partyIds: []
      };
    });

    const g2a = await page.evaluate(() => {
      renderBadgeCase();
      var preview = document.getElementById('gymPreview');
      return preview ? preview.innerHTML : '';
    });
    expect(g2a).toContain('0/1');

    const g2b = await page.evaluate(() => {
      globalData.weekGymWins = 1;
      renderBadgeCase();
      var preview = document.getElementById('gymPreview');
      return preview ? preview.innerHTML : '';
    });
    expect(g2b).toContain('1/1');
    expect(g2b).toContain('已通關');
  });

  // ─────────────────────────────────────────────
  // 2. W4 聯盟開啟/關閉
  // ─────────────────────────────────────────────
  test('E2E-L1: promptE4Challenge 在非 W4／非緩衝期被阻擋', async ({ page }) => {
    await page.evaluate(() => {
      isAdmin = true;
      var dw = document.getElementById('devWeek');
      if (dw) dw.value = 'W1';
      globalData = {
        studentId: 'Neil', highestLevel: 50, badges: 32,
        todayStatus: "SUBMITTED", todayBattles: 0, weekGymWins: 0,
        leagueRegionsWon: {}, roster: [], partyIds: []
      };
      var regOrder = ['關都','城都','豐緣','神奧','合眾','卡洛斯','阿羅拉','伽勒爾'];
      for (var i = 0; i < regOrder.length; i++) delete leagueCompletedMonths[regOrder[i]];
      // Lock buffer: mark this month's league as completed so W1 block works
      var mKey = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      leagueCompletedMonths['關都'] = mKey;
    });

    const l1a = await page.evaluate(() => {
      var lastToast = null;
      var orig = toast; toast = function(m) { lastToast = m; };
      promptE4Challenge();
      toast = orig;
      return lastToast;
    });
    expect(l1a).toContain('僅在 Boss 週或緩衝期開放');

    const l1b = await page.evaluate(() => {
      var dw = document.getElementById('devWeek');
      if (dw) dw.value = 'W4';
      delete leagueCompletedMonths['關都'];
      var confirmModal = document.getElementById('confirmModal');
      if (confirmModal) confirmModal.style.display = 'none';
      var lastToast = null;
      var orig = toast; toast = function(m) { lastToast = m; };
      promptE4Challenge();
      toast = orig;
      return { confirmDisplay: confirmModal ? confirmModal.style.display : '', toast: lastToast };
    });
    expect(l1b.toast).toBeNull();
    expect(l1b.confirmDisplay).toBe('flex');
  });

  // ─────────────────────────────────────────────
  // 3. 依序通關 8 地區
  // ─────────────────────────────────────────────
  test('E2E-R1: getNextE4Challenge 依 badge 數與已完成地區回傳正確順序', async ({ page }) => {
    const results = await page.evaluate(() => {
      globalData.leagueRegionsWon = {};

      var r0 = getNextE4Challenge(4);
      var r1 = getNextE4Challenge(3);
      globalData.leagueRegionsWon['關都'] = true;
      var r2 = getNextE4Challenge(8);
      globalData.leagueRegionsWon['城都'] = true;
      var r3 = getNextE4Challenge(12);
      globalData.leagueRegionsWon['豐緣'] = true;
      var r4 = getNextE4Challenge(16);
      globalData.leagueRegionsWon['神奧'] = true;
      var r5 = getNextE4Challenge(20);
      globalData.leagueRegionsWon['合眾'] = true;
      var r6 = getNextE4Challenge(24);
      globalData.leagueRegionsWon['卡洛斯'] = true;
      var r7 = getNextE4Challenge(28);
      globalData.leagueRegionsWon['阿羅拉'] = true;
      var r8 = getNextE4Challenge(32);
      globalData.leagueRegionsWon['伽勒爾'] = true;
      var r9 = getNextE4Challenge(32);

      return {
        badge4_none: r0 ? r0.region : null,
        badge3_none: r1,
        badge8_kantoDone: r2 ? r2.region : null,
        badge12_johtoDone: r3 ? r3.region : null,
        badge16_hoennDone: r4 ? r4.region : null,
        badge20_sinnohDone: r5 ? r5.region : null,
        badge24_unovaDone: r6 ? r6.region : null,
        badge28_kalosDone: r7 ? r7.region : null,
        badge32_alolaDone: r8 ? r8.region : null,
        badge32_all: r9
      };
    });

    expect(results.badge4_none).toBe('關都');
    expect(results.badge3_none).toBeNull();
    expect(results.badge8_kantoDone).toBe('城都');
    expect(results.badge12_johtoDone).toBe('豐緣');
    expect(results.badge16_hoennDone).toBe('神奧');
    expect(results.badge20_sinnohDone).toBe('合眾');
    expect(results.badge24_unovaDone).toBe('卡洛斯');
    expect(results.badge28_kalosDone).toBe('阿羅拉');
    expect(results.badge32_alolaDone).toBe('伽勒爾');
    expect(results.badge32_all).toBeNull();
  });

  test('E2E-R2: LEAGUE_REGIONS requiredBadges 順序正確', async ({ page }) => {
    const data = await page.evaluate(() => {
      var regions = ['關都','城都','豐緣','神奧','合眾','卡洛斯','阿羅拉','伽勒爾'];
      return regions.map(function(r) {
        return { region: r, requiredBadges: LEAGUE_REGIONS[r].requiredBadges, order: LEAGUE_REGIONS[r].order };
      });
    });
    expect(data[0]).toEqual({ region: '關都', requiredBadges: 4, order: 0 });
    expect(data[1]).toEqual({ region: '城都', requiredBadges: 8, order: 1 });
    expect(data[2]).toEqual({ region: '豐緣', requiredBadges: 12, order: 2 });
    expect(data[3]).toEqual({ region: '神奧', requiredBadges: 16, order: 3 });
    expect(data[4]).toEqual({ region: '合眾', requiredBadges: 20, order: 4 });
    expect(data[5]).toEqual({ region: '卡洛斯', requiredBadges: 24, order: 5 });
    expect(data[6]).toEqual({ region: '阿羅拉', requiredBadges: 28, order: 6 });
    expect(data[7]).toEqual({ region: '伽勒爾', requiredBadges: 32, order: 7 });
  });

  // ─────────────────────────────────────────────
  // 4. 八大師 rank 8→1 順序
  // ─────────────────────────────────────────────
  test('E2E-M1: getUnlockedMasters8 依 completed regions + masters8Completed 回正確順序', async ({ page }) => {
    const results = await page.evaluate(() => {
      var tests = [];

      globalData = { leagueRegionsWon: { '關都': true }, masters8Completed: [] };
      var a = getUnlockedMasters8();
      tests.push({ label: 'only_kanto', name: a ? a.name : null, rank: a ? a.rank : null });

      globalData.leagueRegionsWon = { '關都': true, '城都': true };
      globalData.masters8Completed = ['小智'];
      var b = getUnlockedMasters8();
      tests.push({ label: 'kanto_johto_beat_satoshi', name: b ? b.name : null, rank: b ? b.rank : null });

      globalData.leagueRegionsWon = { '關都': true };
      globalData.masters8Completed = ['小智'];
      var c = getUnlockedMasters8();
      tests.push({ label: 'kanto_only_beat_satoshi', name: c ? c.name : null });

      globalData.leagueRegionsWon = { '關都': true, '城都': true, '豐緣': true, '神奧': true, '合眾': true, '卡洛斯': true, '阿羅拉': true };
      globalData.masters8Completed = ['小智', '艾莉絲', '艾嵐', '卡露妮', '渡', '大吾', '竹蘭'];
      var d = getUnlockedMasters8();
      tests.push({ label: 'seven_done_no_galar', name: d ? d.name : null });

      globalData.leagueRegionsWon['伽勒爾'] = true;
      var e = getUnlockedMasters8();
      tests.push({ label: 'all_regions_seven_m8', name: e ? e.name : null, rank: e ? e.rank : null });

      globalData.masters8Completed = ['小智', '艾莉絲', '艾嵐', '卡露妮', '渡', '大吾', '竹蘭', '丹帝'];
      var f = getUnlockedMasters8();
      tests.push({ label: 'all_done', name: f ? f.name : null });

      return tests;
    });

    expect(results[0].name).toBe('小智');
    expect(results[0].rank).toBe(8);
    expect(results[1].name).toBe('艾莉絲');
    expect(results[1].rank).toBe(7);
    expect(results[2].name).toBeNull();
    expect(results[3].name).toBeNull();
    expect(results[4].name).toBe('丹帝');
    expect(results[4].rank).toBe(1);
    expect(results[5].name).toBeNull();
  });

  test('E2E-M2: startMasters8Battle 在非 W4/非緩衝期被阻擋', async ({ page }) => {
    await page.evaluate(() => {
      isAdmin = true;
      var dw = document.getElementById('devWeek');
      if (dw) dw.value = 'W2'; // W2 not W1 to avoid buffer ambiguity
      globalData = {
        studentId: 'Neil', highestLevel: 50, badges: 32, todayStatus: "SUBMITTED", todayBattles: 0,
        leagueRegionsWon: { '關都': true, '城都': true },
        masters8Completed: [], masters8Progress: [],
        roster: [{ id: 'P1', baseName: '皮卡丘', currentLevel: 50, totalExp: 10000, initialLevel: 5, name: '皮卡丘', happiness: 100, stats: { hp: 100, attack: 50, defense: 50, spAttack: 50, spDefense: 50, speed: 50 } }],
        partyIds: ['P1']
      };
    });

    const m2a = await page.evaluate(() => {
      var lastToast = null;
      var orig = toast; toast = function(m) { lastToast = m; };
      startMasters8Battle();
      toast = orig;
      return lastToast;
    });
    expect(m2a).toContain('僅在 Boss 週或緩衝期開放');

    const m2b = await page.evaluate(() => {
      var dw = document.getElementById('devWeek');
      if (dw) dw.value = 'W4';
      document.getElementById('battleModal').style.display = 'none';
      var lastToast = null;
      var orig = toast; toast = function(m) { lastToast = m; };
      startMasters8Battle();
      toast = orig;
      var modalDisplay = document.getElementById('battleModal').style.display;
      return { modalDisplay: modalDisplay, toast: lastToast };
    });
    expect(m2b.toast).toBeNull();
    expect(m2b.modalDisplay).toBe('flex');
  });

  // ─────────────────────────────────────────────
  // 5. 緩衝期行為
  // ─────────────────────────────────────────────
  test('E2E-B1: isBufferPeriod 在不同日期／完成狀態下的正確行為', async ({ page }) => {
    const results = await page.evaluate(() => {
      isAdmin = false;
      var OrigDate = Date;
      var savedLeagueMonths = {};
      for (var k in leagueCompletedMonths) savedLeagueMonths[k] = leagueCompletedMonths[k];
      leagueCompletedMonths = {};
      var tests = [];

      Date = function() { return new OrigDate(2026, 6, 10); };
      Date.now = function() { return new OrigDate(2026, 6, 10).getTime(); };
      globalData = { badges: 20, leagueRegionsWon: {} };
      tests.push({ label: 'day10_no_last_month', buffer: isBufferPeriod() });

      // badges < 4 → 無可挑戰聯盟，緩衝期為 false
      globalData = { badges: 0, leagueRegionsWon: {} };
      Date = function() { return new OrigDate(2026, 6, 3); };
      Date.now = function() { return new OrigDate(2026, 6, 3).getTime(); };
      tests.push({ label: 'day3_no_last_month', buffer: isBufferPeriod() });

      leagueCompletedMonths['關都'] = '2026-6';
      tests.push({ label: 'day3_last_month_kanto', buffer: isBufferPeriod() });

      Date = function() { return new OrigDate(2026, 6, 8); };
      Date.now = function() { return new OrigDate(2026, 6, 8).getTime() - 1; };
      leagueCompletedMonths = {};
      leagueCompletedMonths['關都'] = '2026-6';
      tests.push({ label: 'day8_with_last_month', buffer: isBufferPeriod() });

      Date = OrigDate; Date.now = OrigDate.now;
      leagueCompletedMonths = savedLeagueMonths;
      isAdmin = true;
      return tests;
    });

    expect(results.find(function(t){ return t.label === 'day10_no_last_month'; }).buffer).toBe(false);
    expect(results.find(function(t){ return t.label === 'day3_no_last_month'; }).buffer).toBe(false);
    expect(results.find(function(t){ return t.label === 'day3_last_month_kanto'; }).buffer).toBe(true);
    expect(results.find(function(t){ return t.label === 'day8_with_last_month'; }).buffer).toBe(false);
  });

  test('E2E-B2: 緩衝期內 promptE4Challenge 應可開啟確認視窗', async ({ page }) => {
    const result = await page.evaluate(() => {
      isAdmin = false;
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 6, 3); };
      Date.now = function() { return new OrigDate(2026, 6, 3).getTime(); };
      globalData = {
        studentId: 'Neil', highestLevel: 50, badges: 32, todayStatus: "SUBMITTED",
        leagueRegionsWon: {}, roster: [], partyIds: []
      };
      leagueCompletedMonths = {};
      leagueCompletedMonths['關都'] = '2026-5';

      var confirmModal = document.getElementById('confirmModal');
      if (confirmModal) confirmModal.style.display = 'none';
      var lastToast = null;
      var orig = toast; toast = function(m) { lastToast = m; };
      promptE4Challenge();
      toast = orig;

      var confirmDisplay = confirmModal ? confirmModal.style.display : '';
      var result = { confirmDisplay: confirmDisplay, toast: lastToast };

      Date = OrigDate; Date.now = OrigDate.now;
      isAdmin = true;
      return result;
    });
    expect(result.toast).toBeNull();
    expect(result.confirmDisplay).toBe('flex');
  });

  // ─────────────────────────────────────────────
  // 6. 完整 E2E 流程模擬 — 道館→聯盟→八大師
  // ─────────────────────────────────────────────
  test('E2E-FLOW: 模擬學生從道館→聯盟→八大師的完整路徑', async ({ page }) => {
    await page.evaluate(() => {
      isAdmin = true;
      var dw = document.getElementById('devWeek');
      if (dw) dw.value = 'W1';
      globalData = {
        studentId: 'Neil', highestLevel: 20, badges: 0,
        todayStatus: "SUBMITTED", todayBattles: 0, weekGymWins: 0, weekBossWins: 0, monthLeagueWins: 0,
        daysSinceLastBadge: 7, coins: 500,
        roster: [{ id: 'P1', baseName: '皮卡丘', currentLevel: 20, totalExp: 5000, initialLevel: 5, name: '皮卡丘', happiness: 100, stats: { hp: 80, attack: 40, defense: 35, spAttack: 40, spDefense: 35, speed: 50 } }],
        partyIds: ['P1'],
        leagueRegionsWon: {}, masters8Completed: [], masters8Progress: []
      };
      var regOrder = ['關都','城都','豐緣','神奧','合眾','卡洛斯','阿羅拉','伽勒爾'];
      for (var i = 0; i < regOrder.length; i++) delete leagueCompletedMonths[regOrder[i]];
    });

    var step1 = await page.evaluate(function() {
      var dw = document.getElementById('devWeek');
      dw.value = 'W1';
      updateDashboard();
      var gymPreview = document.getElementById('gymPreview');
      var leagueBtn = document.getElementById('btnLeagueBattle');
      return {
        gymText: gymPreview ? gymPreview.textContent : '',
        leagueDisplay: leagueBtn ? leagueBtn.style.display : ''
      };
    });
    expect(step1.gymText).toContain('道館');
    expect(step1.leagueDisplay).toBe('none');

    var step2 = await page.evaluate(function() {
      globalData.badges = 32;
      globalData.highestLevel = 60;
      var dw = document.getElementById('devWeek');
      dw.value = 'W4';
      renderBadgeCase();
      updateDashboard();
      var gymPreview = document.getElementById('gymPreview');
      var leagueBtn = document.getElementById('btnLeagueBattle');
      return {
        gymText: gymPreview ? gymPreview.textContent : '',
        leagueDisplay: leagueBtn ? leagueBtn.style.display : '',
        leagueOpacity: leagueBtn ? leagueBtn.style.opacity : ''
      };
    });
    expect(step2.gymText).toContain('聯盟戰');
    expect(step2.leagueDisplay).toBe('inline-block');
    expect(step2.leagueOpacity).not.toBe('0.4');

    var step3 = await page.evaluate(function() {
      globalData.highestLevel = 50;
      globalData.leagueRegionsWon = {
        '關都': true, '城都': true, '豐緣': true, '神奧': true,
        '合眾': true, '卡洛斯': true, '阿羅拉': true, '伽勒爾': true
      };
      var mKey = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      var regOrder = ['關都','城都','豐緣','神奧','合眾','卡洛斯','阿羅拉','伽勒爾'];
      for (var i = 0; i < regOrder.length; i++) leagueCompletedMonths[regOrder[i]] = mKey;
      globalData.masters8Completed = [];
      globalData.masters8Progress = [];
      renderBadgeCase();
      updateDashboard();
      var m8Btn = document.getElementById('btnMasters8Battle');
      var unlocked = getUnlockedMasters8();
      return {
        m8Display: m8Btn ? m8Btn.style.display : '',
        unlockedName: unlocked ? unlocked.name : null,
        unlockedRank: unlocked ? unlocked.rank : null
      };
    });
    expect(step3.m8Display).toBe('inline-block');
    expect(step3.unlockedName).toBe('小智');
    expect(step3.unlockedRank).toBe(8);

    var step4 = await page.evaluate(function() {
      globalData.masters8Completed = ['小智'];
      var m8Btn = document.getElementById('btnMasters8Battle');
      var unlocked = getUnlockedMasters8();
      renderBadgeCase();
      updateDashboard();
      return {
        m8Display: m8Btn ? m8Btn.style.display : '',
        unlockedName: unlocked ? unlocked.name : null,
        unlockedRank: unlocked ? unlocked.rank : null
      };
    });
    expect(step4.unlockedName).toBe('艾莉絲');
    expect(step4.unlockedRank).toBe(7);
  });

  // ─────────────────────────────────────────────
  // 7. isBufferPeriod admin 永遠 false (P4 驗證)
  // ─────────────────────────────────────────────
  test('E2E-B3: 緩衝期在已有未完成聯盟但本月非 W1 時回傳 false', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData = { badges: 32, leagueRegionsWon: {} };
      // W2 (day 10) → 非 W1 → isBufferPeriod 直接 false
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 6, 10); };
      Date.now = function() { return new OrigDate(2026, 6, 10).getTime(); };
      var buf = isBufferPeriod();
      Date = OrigDate; Date.now = OrigDate.now;
      return { buffer: buf };
    });
    expect(result.buffer).toBe(false);
  });
});
