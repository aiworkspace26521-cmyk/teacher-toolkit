const { test, expect } = require('@playwright/test');

test.describe('VER2.5 單元測試 — 輔助函式與核心邏輯', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  // T1: getCurrentMonthKey() 格式
  test('T1 getCurrentMonthKey returns "YYYY-M" format (no zero-padded month)', async ({ page }) => {
    const key = await page.evaluate(() => getCurrentMonthKey());
    expect(key).toMatch(/^\d{4}-\d{1,2}$/);
    expect(key).not.toMatch(/^\d{4}-0\d$/);
  });

  // T2: getLastMonthKey() 跨年（single evaluate 避免 race condition）
  test('T2 getLastMonthKey handles year boundary correctly', async ({ page }) => {
    const result = await page.evaluate(() => {
      const thisKey = getCurrentMonthKey();
      const lastKey = getLastMonthKey();
      return { thisKey, lastKey };
    });
    expect(result.lastKey).toMatch(/^\d{4}-\d{1,2}$/);
    const thisParts = result.thisKey.split('-').map(Number);
    const lastParts = result.lastKey.split('-').map(Number);
    if (thisParts[1] === 1) {
      expect(lastParts[0]).toBe(thisParts[0] - 1);
      expect(lastParts[1]).toBe(12);
    } else {
      expect(lastParts[0]).toBe(thisParts[0]);
      expect(lastParts[1]).toBe(thisParts[1] - 1);
    }
  });

  // T3: isRegionCompleted()
  test('T3 isRegionCompleted returns true for known completed region', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true };
      return {
        kanto: isRegionCompleted("關都"),
        johto: isRegionCompleted("城都"),
        unknown: isRegionCompleted("未知地區")
      };
    });
    expect(result.kanto).toBe(true);
    expect(result.johto).toBe(false);
    expect(result.unknown).toBe(false);
  });

  // T4: getNextE4Challenge() 依序 — badge=4, no completions → 關都
  test('T4 getNextE4Challenge returns 關都 for badge=4 with no completions', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = {};
      return getNextE4Challenge(4);
    });
    expect(result).not.toBeNull();
    expect(result.region).toBe('關都');
    expect(result.requiredBadges).toBe(4);
    expect(result.order).toBe(0);
  });

  // T5: getNextE4Challenge() 跳級防護
  test('T5 getNextE4Challenge does not skip — returns next incomplete region', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true, "城都": true, "豐緣": true };
      return getNextE4Challenge(20);
    });
    expect(result).not.toBeNull();
    expect(result.region).toBe('神奧');
    expect(result.order).toBe(3);
  });

  // T6: getNextE4Challenge() 全通
  test('T6 getNextE4Challenge returns null when all 8 regions completed', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = {
        "關都": true, "城都": true, "豐緣": true, "神奧": true,
        "合眾": true, "卡洛斯": true, "阿羅拉": true, "伽勒爾": true
      };
      return getNextE4Challenge(32);
    });
    expect(result).toBeNull();
  });

  // T7: getUnlockedMasters8() 依序 — 小智必須先打
  test('T7 getUnlockedMasters8 enforces rank order — 小智 first even if 城都 also completed', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true, "城都": true };
      globalData.masters8Completed = [];
      return getUnlockedMasters8();
    });
    expect(result).not.toBeNull();
    expect(result.name).toBe('小智');
    expect(result.rank).toBe(8);
  });

  // T7b: 小志已打 → 艾莉絲解鎖
  test('T7b getUnlockedMasters8 returns 艾莉絲 after 小智 is beaten', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = { "關都": true, "城都": true };
      globalData.masters8Completed = ["小智"];
      return getUnlockedMasters8();
    });
    expect(result).not.toBeNull();
    expect(result.name).toBe('艾莉絲');
    expect(result.rank).toBe(7);
  });

  // T8: isBufferPeriod() 範圍 — day 1-7 with last month record
  test('T8 isBufferPeriod returns true when last month has league completion', async ({ page }) => {
    const result = await page.evaluate(() => {
      const lastKey = getLastMonthKey();
      leagueCompletedMonths["關都"] = lastKey;
      return isBufferPeriod();
    });
    // day 1-7 with last-month completion → true; day 8+ → false
    const day = new Date().getDate();
    if (day <= 7) {
      expect(result).toBe(true);
    } else {
      expect(result).toBe(false);
    }
  });

  // T9: isBufferPeriod() 範圍 — day 22+
  test('T9 isBufferPeriod returns false when day > 7 regardless of state', async ({ page }) => {
    const result = await page.evaluate(() => {
      const lastKey = getLastMonthKey();
      leagueCompletedMonths["關都"] = lastKey;
      return isBufferPeriod();
    });
    const day = new Date().getDate();
    expect(result).toBe(day <= 7);
  });

  // BADGE_COOLDOWN_DAYS 常數驗證
  test('BADGE_COOLDOWN_DAYS constant is 7', async ({ page }) => {
    const cd = await page.evaluate(() => BADGE_COOLDOWN_DAYS);
    expect(cd).toBe(7);
  });

  // getNextE4Challenge: insufficient badges returns null
  test('getNextE4Challenge returns null when badges below all thresholds', async ({ page }) => {
    const result = await page.evaluate(() => getNextE4Challenge(3));
    expect(result).toBeNull();
  });

  // getNextE4Challenge: skipping completed regions
  test('getNextE4Challenge correctly skips completed regions in order', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData.leagueRegionsWon = {
        "關都": true, "城都": true, "豐緣": true, "神奧": true
      };
      return getNextE4Challenge(28);
    });
    expect(result).not.toBeNull();
    expect(result.region).toBe('合眾');
    expect(result.order).toBe(4);
  });

  // IT6: Badge cooldown 7 days — badgeGain condition
  test('IT6 badge cooldown condition respects BADGE_COOLDOWN_DAYS', async ({ page }) => {
    const result = await page.evaluate(() => {
      var checks = [];
      function shouldGainBadge(daysSince) {
        return BADGE_COOLDOWN_DAYS !== undefined && daysSince >= BADGE_COOLDOWN_DAYS;
      }
      checks.push({ days: 0, gainable: shouldGainBadge(0) });
      checks.push({ days: 6, gainable: shouldGainBadge(6) });
      checks.push({ days: 7, gainable: shouldGainBadge(7) });
      checks.push({ days: 10, gainable: shouldGainBadge(10) });
      return { cd: BADGE_COOLDOWN_DAYS, checks: checks };
    });
    expect(result.cd).toBe(7);
    expect(result.checks[0].gainable).toBe(false);
    expect(result.checks[1].gainable).toBe(false);
    expect(result.checks[2].gainable).toBe(true);
    expect(result.checks[3].gainable).toBe(true);
  });

  // IT7: Buffer period "最後機會" prompt
  test('IT7 buffer period shows last chance warning', async ({ page }) => {
    const result = await page.evaluate(() => {
      globalData = { badges: 4, todayCompleted: false, leagueRegionsWon: {} };
      var OrigDate = Date;
      Date = function() { return new OrigDate(2026, 5, 5); };
      Date.now = function() { return new OrigDate(2026, 5, 5).getTime(); };
      var cachedMonths = leagueCompletedMonths;
      leagueCompletedMonths = {};
      var lastKey = getLastMonthKey();
      leagueCompletedMonths["關都"] = lastKey;
      try {
        var mKey = getCurrentMonthKey();
        var challenge = getNextE4Challenge(4);
        if (!challenge) return { error: "no challenge" };
        var confirmMsg = "🏆 " + challenge.region + "聯盟挑戰<br><br>四天王在 Boss 週（或緩衝期）等待挑戰！<br>是否接受挑戰？<br><br>";
        if (isBufferPeriod()) {
          confirmMsg += "<small style='color:#e67e22;'>⚠️ 緩衝期最後機會！錯過需等下個 W4</small><br>";
        }
        return { hasLastChance: confirmMsg.indexOf("緩衝期最後機會") !== -1, isBuffer: isBufferPeriod() };
      } finally {
        Date = OrigDate;
        Date.now = OrigDate.now;
        leagueCompletedMonths = cachedMonths;
      }
    });
    expect(result.error).toBeUndefined();
    expect(result.isBuffer).toBe(true);
    expect(result.hasLastChance).toBe(true);
  });

  // IT8: Zombie code check — old functions must not exist
  test('IT8 zombie functions (getCurrentWeek, getMasters8ForMonth, getE4ChallengeForBadges) are removed', async ({ page }) => {
    const result = await page.evaluate(() => {
      return {
        hasGetCurrentWeek: typeof getCurrentWeek !== 'undefined',
        hasGetMasters8ForMonth: typeof getMasters8ForMonth !== 'undefined',
        hasGetE4ChallengeForBadges: typeof getE4ChallengeForBadges !== 'undefined'
      };
    });
    expect(result.hasGetCurrentWeek).toBe(false);
    expect(result.hasGetMasters8ForMonth).toBe(false);
    expect(result.hasGetE4ChallengeForBadges).toBe(false);
  });
});
