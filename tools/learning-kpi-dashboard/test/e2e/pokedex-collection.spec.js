const { test, expect } = require('@playwright/test');

test.describe('Block I Step 12.5: openCollection', () => {

  async function loginAndOpenCollection(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });
    await page.evaluate(() => openCollection());
    await page.waitForTimeout(500);
    await expect(page.locator('#collectionModal')).toBeVisible({ timeout: 3000 });
  }

  test('12.5a openCollection shows collection modal with roster sorted by level desc', async ({ page }) => {
    await loginAndOpenCollection(page);

    var cards = await page.locator('#collectionList > div').count();
    expect(cards).toBeGreaterThanOrEqual(1);

    var levels = await page.evaluate(() => {
      var list = document.getElementById('collectionList');
      if (!list) return [];
      return Array.from(list.children).map(function(c) {
        var m = c.textContent.match(/Lv\.(\d+)/);
        return m ? parseInt(m[1], 10) : 0;
      });
    });
    for (var i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeLessThanOrEqual(levels[i - 1]);
    }
  });

  test('12.5b collection cards show name, level, type badges, EXP bar', async ({ page }) => {
    await loginAndOpenCollection(page);

    var cardText = await page.locator('#collectionList > div').first().textContent();
    expect(cardText).toMatch(/Lv\.\d+/);
    expect(cardText).toMatch(/EXP:/);
    expect(cardText).toMatch(/捕獲:/);
  });

  test('12.5c collection cards render without errors for all roster', async ({ page }) => {
    await loginAndOpenCollection(page);

    var cards = await page.locator('#collectionList > div').count();
    expect(cards).toBeGreaterThanOrEqual(1);

    var noErrors = await page.evaluate(() => {
      var list = document.getElementById('collectionList');
      if (!list) return true;
      return Array.from(list.children).every(function(c) {
        var t = c.textContent;
        return t.indexOf('undefined') === -1 && t.indexOf('null') === -1 && t.indexOf('NaN') === -1;
      });
    });
    expect(noErrors).toBe(true);
  });

  test('12.5d collection modal can be closed', async ({ page }) => {
    await loginAndOpenCollection(page);

    await page.locator('#collectionModal .close-btn').click();
    await page.waitForTimeout(300);
    await expect(page.locator('#collectionModal')).not.toBeVisible();
  });

});
