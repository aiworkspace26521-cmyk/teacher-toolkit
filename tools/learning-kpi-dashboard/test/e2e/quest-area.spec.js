const { test, expect } = require('@playwright/test');

test.describe('Quest Area - Daily/Weekly Tasks', () => {

  async function loginAsNeil(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });
  }

  test('quest area renders with daily and weekly sections', async ({ page }) => {
    await loginAsNeil(page);

    var questArea = page.locator('#questArea');
    await expect(questArea).toBeVisible({ timeout: 5000 });

    var dailyGrid = page.locator('#dailyQuestGrid');
    var weeklyGrid = page.locator('#weeklyQuestGrid');
    await expect(dailyGrid).toBeVisible();
    await expect(weeklyGrid).toBeVisible();

    var questItems = page.locator('.quest-item');
    var count = await questItems.count();
    expect(count).toBeGreaterThanOrEqual(4);

    var timers = page.locator('#dailyTimer, #weeklyTimer');
    await expect(timers.first()).not.toBeEmpty();
  });

  test('quest items show progress and reward info', async ({ page }) => {
    await loginAsNeil(page);

    await expect(page.locator('#questArea')).toBeVisible({ timeout: 5000 });

    var firstQuest = page.locator('.quest-item').first();
    await expect(firstQuest).toBeVisible();

    var qName = firstQuest.locator('.q-name');
    await expect(qName).not.toBeEmpty();

    var qDesc = firstQuest.locator('.q-desc');
    await expect(qDesc).not.toBeEmpty();
    var descText = await qDesc.textContent();
    expect(descText).toMatch(/EXP/);

    var qProgress = firstQuest.locator('.q-text');
    await expect(qProgress).not.toBeEmpty();

    var qBar = firstQuest.locator('.q-fill');
    await expect(qBar).toBeVisible();
  });

  test('claim button exists on quest items and can be clicked when completed', async ({ page }) => {
    await loginAsNeil(page);

    await expect(page.locator('#questArea')).toBeVisible({ timeout: 5000 });

    var claimBtns = page.locator('.q-claim');
    var btnCount = await claimBtns.count();
    expect(btnCount).toBeGreaterThanOrEqual(4);

    for (var i = 0; i < btnCount; i++) {
      var btn = claimBtns.nth(i);
      var text = await btn.textContent();
      expect(['領取', '✅', '進行中']).toContain(text);
      var isDisabled = await btn.isDisabled();
      if (text === '領取') {
        expect(isDisabled).toBe(false);
      }
    }
  });

  test('daily and weekly timer shows reset time', async ({ page }) => {
    await loginAsNeil(page);

    await expect(page.locator('#questArea')).toBeVisible({ timeout: 5000 });

    var dailyTimer = page.locator('#dailyTimer');
    var weeklyTimer = page.locator('#weeklyTimer');

    var dailyText = await dailyTimer.textContent();
    expect(dailyText).toMatch(/重置/);

    var weeklyText = await weeklyTimer.textContent();
    expect(weeklyText).toMatch(/重置/);
  });

});
