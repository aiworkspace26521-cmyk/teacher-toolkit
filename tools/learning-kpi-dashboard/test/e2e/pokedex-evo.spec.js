const { test, expect } = require('@playwright/test');

test.describe('Pokédex Evolution Chain', () => {

  test('base-form species in data should have evolutions defined', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });

    var stats = await page.evaluate(() => {
      var entries = POKEMON_TIERS["稀有"];
      var missingEvo = [];
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if ((!e.evolutions || e.evolutions.length === 0) && EVO_CONDITIONS[e.name]) {
          missingEvo.push(e.name);
        }
      }
      var withEvo = entries.filter(function(e) { return e.evolutions && e.evolutions.length > 0; }).length;
      var withoutEvo = entries.filter(function(e) { return !e.evolutions || e.evolutions.length === 0; }).length;
      return { rareCount: entries.length, withEvo: withEvo, withoutEvo: withoutEvo, missingEvo: missingEvo };
    });

    expect(stats.rareCount).toBe(77);
    expect(stats.missingEvo).toEqual([]);
  });

});
