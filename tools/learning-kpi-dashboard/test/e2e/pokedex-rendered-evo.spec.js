const { test, expect } = require('@playwright/test');

test.describe('Pokédex Rendered Evolution Chain', () => {

  async function openPokedex(page) {
    var pokedexBtn = page.locator('.nav-btn').filter({ hasText: '全國圖鑑' });
    await expect(pokedexBtn).toBeVisible();
    await pokedexBtn.click();
    await page.waitForTimeout(3000);
    await expect(page.locator('#pokedexModal')).toBeVisible({ timeout: 5000 });
    return await page.evaluate(() => {
      var grid = document.getElementById('pokedexGrid');
      if (!grid) return [];
      return Array.from(grid.children).map(function(c) { return c.textContent; });
    });
  }

  test('Neil pokédex shows evolution chain for 尼多后', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });

    var cardTexts = await openPokedex(page);

    // Check 尼多后 card has evolution chain
    var 尼多后Card = cardTexts.find(function(t) { return t.indexOf('尼多后') !== -1; });
    expect(尼多后Card).toBeTruthy();
    expect(尼多后Card).toContain('尼多蘭');
    expect(尼多后Card).toContain('尼多娜');

    // Check Eevee card has special evolution text
    var eeveeCard = cardTexts.find(function(t) { return t.indexOf('伊布') !== -1; });
    expect(eeveeCard).toBeTruthy();
    expect(eeveeCard).toContain('8種進化型態');
  });

  test('Admin pokédex shows Eevee evolution text', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });

    var cardTexts = await openPokedex(page);

    // Admin typically has Eevee as default starter
    var eeveeCard = cardTexts.find(function(t) { return t.indexOf('伊布') !== -1; });
    expect(eeveeCard).toBeTruthy();
    expect(eeveeCard).toContain('8種進化型態');
  });

  test('Admin pokédex evolutionChain data is populated', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });

    var result = await page.evaluate(() => {
      POKEDEX_ALL_SPECIES = null;
      var list = buildPokedexSpecies();
      function find(name) { return list.find(function(s) { return s.rawName === name; }); }
      return [
        { name: '小火龍', chain: find('小火龍').evolutionChain },
        { name: '火恐龍', chain: find('火恐龍').evolutionChain },
      ];
    });

    expect(result[0]).toEqual({ name: '小火龍', chain: ['小火龍','火恐龍','噴火龍'] });
    expect(result[1]).toEqual({ name: '火恐龍', chain: ['小火龍','火恐龍','噴火龍'] });
  });

});
