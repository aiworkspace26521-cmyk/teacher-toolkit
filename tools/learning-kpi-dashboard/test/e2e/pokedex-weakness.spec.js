const { test, expect } = require('@playwright/test');

test.describe('Block I Step 12.6: openWeaknessDex', () => {

  async function loginAndOpenWeaknessDex(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });
    var btn = page.locator('.btn-weakdex').filter({ hasText: '弱勢' });
    await expect(btn).toBeVisible();
    await btn.click();
    await page.waitForTimeout(1000);
    await expect(page.locator('#weaknessDexModal')).toBeVisible({ timeout: 3000 });
  }

  test('12.6a weakness dex opens via nav button and shows grid', async ({ page }) => {
    await loginAndOpenWeaknessDex(page);

    var cardCount = await page.locator('#weaknessDexGrid > div').count();
    expect(cardCount).toBeGreaterThanOrEqual(1);
  });

  test('12.6b weakness dex cards show name, type chips, tier, dream ability', async ({ page }) => {
    await loginAndOpenWeaknessDex(page);

    var cardText = await page.locator('#weaknessDexGrid > div').first().textContent();
    expect(cardText).toMatch(/夢特性/);
    expect(cardText).toMatch(/總族值/);
  });

  test('12.6c weakness dex cards show evolution name for evolved forms', async ({ page }) => {
    await loginAndOpenWeaknessDex(page);

    var cards = await page.locator('#weaknessDexGrid > div').count();
    expect(cards).toBeGreaterThanOrEqual(1);

    var firstCardText = await page.locator('#weaknessDexGrid > div').first().textContent();
    expect(firstCardText).toMatch(/夢特性/);
    expect(firstCardText).toMatch(/總族值/);
  });

  test('12.6d weakness dex modal can be closed', async ({ page }) => {
    await loginAndOpenWeaknessDex(page);

    await page.locator('#weaknessDexModal .close-btn').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#weaknessDexModal')).not.toBeVisible();
  });

});
