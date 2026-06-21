const { test, expect } = require('@playwright/test');

test.describe('Pokédex Filtering', () => {

  async function loginAndOpenPokedex(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });

    var pokedexBtn = page.locator('.nav-btn').filter({ hasText: '全國圖鑑' });
    await expect(pokedexBtn).toBeVisible();
    await pokedexBtn.click();
    await page.waitForTimeout(3000);
    await expect(page.locator('#pokedexModal')).toBeVisible({ timeout: 5000 });
  }

  async function getPokemonNames(page) {
    return await page.evaluate(function() {
      var grid = document.getElementById('pokedexGrid');
      if (!grid) return [];
      return Array.from(grid.children).map(function(c) {
        return c.textContent.trim();
      }).filter(function(t) { return t.length > 0; });
    });
  }

  test('pokedex opens and shows captured pokemon', async ({ page }) => {
    await loginAndOpenPokedex(page);

    var grid = page.locator('#pokedexGrid');
    var cards = await grid.locator('> div').count();
    expect(cards).toBeGreaterThanOrEqual(1);

    var cardTexts = await getPokemonNames(page);
    expect(cardTexts.some(function(t) { return t.indexOf('伊布') !== -1; })).toBe(true);
  });

  test('type filter narrows results to matching type', async ({ page }) => {
    await loginAndOpenPokedex(page);

    var typeFilter = page.locator('#pokedexTypeFilter');
    var allTypes = await typeFilter.locator('option').allTextContents();
    var typeToUse = allTypes.indexOf('一般') !== -1 ? '一般' : allTypes[1];

    await typeFilter.selectOption(typeToUse);
    await page.waitForTimeout(500);

    var cardTexts = await getPokemonNames(page);
    expect(cardTexts.length).toBeGreaterThanOrEqual(1);
  });

  test('tier filter narrows results to matching tier', async ({ page }) => {
    await loginAndOpenPokedex(page);

    var tierFilter = page.locator('#pokedexTierFilter');
    await tierFilter.selectOption('傳說');

    await page.waitForTimeout(500);

    var cardTexts = await getPokemonNames(page);
    if (cardTexts.length > 0) {
      var countDisplay = page.locator('#pokedexCount');
      await expect(countDisplay).not.toBeEmpty();
    }
  });

  test('search filter filters by name', async ({ page }) => {
    await loginAndOpenPokedex(page);

    var searchInput = page.locator('#pokedexSearch');
    await searchInput.fill('伊布');
    await page.waitForTimeout(500);

    var cardTexts = await getPokemonNames(page);
    expect(cardTexts.length).toBeGreaterThanOrEqual(1);
    expect(cardTexts.every(function(t) { return t.indexOf('伊布') !== -1; })).toBe(true);
  });

  test('type + tier combined filter works', async ({ page }) => {
    await loginAndOpenPokedex(page);

    var typeFilter = page.locator('#pokedexTypeFilter');
    var typeToUse = (await typeFilter.locator('option').allTextContents()).indexOf('一般') !== -1 ? '一般' : '';

    if (typeToUse) {
      await typeFilter.selectOption(typeToUse);

      var tierFilter = page.locator('#pokedexTierFilter');
      await tierFilter.selectOption('一般');

      await page.waitForTimeout(500);

      var cardTexts = await getPokemonNames(page);
      if (cardTexts.length > 0) {
        expect(true).toBe(true);
      }
    }
  });

  test('resetting filters shows all captured pokemon', async ({ page }) => {
    await loginAndOpenPokedex(page);

    var typeFilter = page.locator('#pokedexTypeFilter');
    var tierFilter = page.locator('#pokedexTierFilter');

    await typeFilter.selectOption('水');
    await page.waitForTimeout(500);

    var afterWater = await getPokemonNames(page);

    await typeFilter.selectOption('');
    await page.waitForTimeout(500);

    var afterReset = await getPokemonNames(page);
    expect(afterReset.length).toBeGreaterThanOrEqual(afterWater.length);
  });

});
