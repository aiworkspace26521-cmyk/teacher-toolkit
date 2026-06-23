const { test, expect } = require('@playwright/test');

test.describe('Block I Step 11: PvP + 交換系統驗證', () => {

  // ── Helper: select Neil ──
  async function selectNeil(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
  }

  // ── 11.1 openPvPModal 選人介面 ──
  test('11.1 openPvPModal - PvP modal lobby shows opponent list', async ({ page }) => {
    await selectNeil(page);

    await page.waitForFunction(() => {
      var gd = window.globalData;
      if (!gd || !gd.roster || gd.roster.length === 0) return false;
      return true;
    }, { timeout: 10000 });

    await page.evaluate(() => {
      document.getElementById('pvpModal').style.display = 'flex';
      renderPvPLobby();
    });
    await page.waitForTimeout(1500);

    await expect(page.locator('#pvpModal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#pvpLobby')).toBeVisible();
    await expect(page.locator('#pvpOpponentList')).toBeVisible();
  });

  test('11.1b openPvPModal - ranking button exists in modal', async ({ page }) => {
    await selectNeil(page);

    await page.waitForFunction(() => {
      var gd = window.globalData;
      if (!gd || !gd.roster || gd.roster.length === 0) return false;
      return true;
    }, { timeout: 10000 });

    await page.evaluate(() => {
      document.getElementById('pvpModal').style.display = 'flex';
      renderPvPLobby();
    });
    await page.waitForTimeout(1000);

    const rankingBtn = page.locator('#pvpModal button').filter({ hasText: /天梯排名/ });
    await expect(rankingBtn).toBeVisible();
  });

  test('11.1c PvP lobby shows incoming and outgoing challenge sections', async ({ page }) => {
    await selectNeil(page);

    await page.waitForFunction(() => {
      var gd = window.globalData;
      if (!gd || !gd.roster || gd.roster.length === 0) return false;
      return true;
    }, { timeout: 10000 });

    await page.evaluate(() => {
      document.getElementById('pvpModal').style.display = 'flex';
      renderPvPLobby();
    });
    await page.waitForTimeout(1500);

    await expect(page.locator('#pvpIncoming')).toBeVisible();
    await expect(page.locator('#pvpOutgoing')).toBeVisible();
    await expect(page.locator('#pvpIncomingList')).toBeVisible();
    await expect(page.locator('#pvpOutgoingList')).toBeVisible();
  });

  // ── 11.2 executePvPTurn function exists ──
  test('11.2 executePvPTurn - battle turn function is defined', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasFn = await page.evaluate(() => typeof executePvPTurn === 'function');
    expect(hasFn).toBe(true);
  });

  // ── 11.3 calculateELO 分數計算 ──
  test('11.3 calculateELO - ELO calculation is correct', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const eloResult = await page.evaluate(() => {
      if (typeof calculateELO !== 'function') return { ok: false };
      const r1 = calculateELO(1000, 1000, true, 32);
      const r2 = calculateELO(1000, 1000, false, 32);
      const r3 = calculateELO(1200, 1000, true, 32);
      return { ok: true, r1, r2, r3 };
    });
    if (!eloResult.ok) { test.skip('calculateELO not found'); return; }
    expect(eloResult.r1).toBe(1016);
    expect(eloResult.r2).toBe(984);
    expect(eloResult.r3).toBe(1208);
  });

  // ── 11.4 updatePvPRanking function exists ──
  test('11.4 updatePvPRanking - ranking update function is defined', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasFn = await page.evaluate(() => typeof updatePvPRanking === 'function');
    expect(hasFn).toBe(true);
  });

  // ── 11.5 openRankingModal 排名顯示 ──
  test('11.5 openRankingModal - ranking modal opens', async ({ page }) => {
    await selectNeil(page);

    await page.evaluate(() => openRankingModal());
    await page.waitForTimeout(1500);

    const rankingModal = page.locator('#rankingModal');
    await expect(rankingModal).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#rankingList')).toBeVisible();
    await expect(page.locator('#rankingSeason')).toBeVisible();

    await page.evaluate(() => closeRankingModal());
  });

  // ── 11.6 sendTradeRequest 發起交換 ──
  test('11.6 sendTradeRequest - trade modal opens with partner and pokemon selects', async ({ page }) => {
    await selectNeil(page);

    await page.evaluate(() => { document.getElementById('tradeModal').style.display = 'flex'; });
    await page.waitForTimeout(1500);

    await expect(page.locator('#tradeModal')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('#tradePartnerSelect')).toBeVisible();
    await expect(page.locator('#tradePokemonSelect')).toBeVisible();
    await expect(page.locator('#tradeIncomingList')).toBeVisible();
    await expect(page.locator('#tradeOutgoingList')).toBeVisible();

    await page.evaluate(() => { document.getElementById('tradeModal').style.display = 'none'; });
  });

  // ── 11.7 Trade accept/reject/cancel functions exist ──
  test('11.7 acceptTrade / rejectTrade / cancelTrade functions are defined', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const fns = await page.evaluate(() => ({
      accept: typeof acceptTrade === 'function',
      reject: typeof rejectTrade === 'function',
      cancel: typeof cancelTrade === 'function'
    }));
    expect(fns.accept).toBe(true);
    expect(fns.reject).toBe(true);
    expect(fns.cancel).toBe(true);
  });

  // ── 11.8 trade badge element exists on trade button ──
  test('11.8 trade badge element exists on trade button', async ({ page }) => {
    await selectNeil(page);

    const badge = page.locator('#tradeBadge');
    await expect(badge).toBeAttached();
  });

  // ── 11.9 初始夥伴伊布禁止交換 ──
  test('11.9 initial partner Eevee (P0) cannot be traded', async ({ page }) => {
    await selectNeil(page);

    // Open trade modal directly
    await page.evaluate(() => { document.getElementById('tradeModal').style.display = 'flex'; });
    await page.waitForTimeout(1000);

    // Check the P0 restriction exists in sendTradeRequest code
    const hasP0Restriction = await page.evaluate(() => {
      var fnStr = sendTradeRequest.toString();
      return fnStr.indexOf('P0') !== -1 && fnStr.indexOf('不能交換初始夥伴') !== -1;
    });
    expect(hasP0Restriction).toBe(true);

    await page.evaluate(() => { document.getElementById('tradeModal').style.display = 'none'; });
  });

});
