const { test, expect } = require('@playwright/test');

test.describe('Shop Item Order', () => {

  test('consumables should appear first in shop', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });

    await page.locator('.nav-btn').filter({ hasText: '商城' }).click();
    await page.waitForTimeout(2000);
    await expect(page.locator('#shopModal')).toBeVisible({ timeout: 5000 });

    var shopChildren = await page.evaluate(() => {
      var list = document.getElementById('shopList');
      if (!list) return [];
      var result = [];
      for (var i = 0; i < list.children.length; i++) {
        result.push({
          className: list.children[i].className,
          text: list.children[i].textContent.trim().substring(0, 60)
        });
      }
      return result;
    });

    expect(shopChildren.length).toBeGreaterThan(0);

    var firstItem = shopChildren[0];
    expect(firstItem.text).toContain('消耗品');

    var firstCard = shopChildren.find(function(c) { return c.className === 'shop-card'; });
    expect(firstCard).toBeTruthy();
    expect(firstCard.text).toContain('好傷藥');
  });

});
