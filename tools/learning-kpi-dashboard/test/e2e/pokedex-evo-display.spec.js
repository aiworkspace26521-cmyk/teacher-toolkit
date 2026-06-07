const { test, expect } = require('@playwright/test');

test.describe('Pokédex Evolution Chain Display', () => {

  test('evolution chain should show for both base and evolved forms', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });

    var result = await page.evaluate(() => {
      POKEDEX_ALL_SPECIES = null;
      var list = buildPokedexSpecies();
      
      function find(name) { return list.find(function(s) { return s.rawName === name; }); }
      
      return [
        { name: '小火龍', chain: find('小火龍').evolutionChain },
        { name: '火恐龍', chain: find('火恐龍').evolutionChain },
        { name: '噴火龍', chain: find('噴火龍').evolutionChain },
        { name: '尼多后', chain: find('尼多后').evolutionChain },
        { name: '袋獸', chain: find('袋獸').evolutionChain },
      ];
    });

    expect(result[0]).toEqual({ name: '小火龍', chain: ['小火龍','火恐龍','噴火龍'] });
    expect(result[1]).toEqual({ name: '火恐龍', chain: ['小火龍','火恐龍','噴火龍'] });
    expect(result[2]).toEqual({ name: '噴火龍', chain: ['小火龍','火恐龍','噴火龍'] });
    expect(result[3]).toEqual({ name: '尼多后', chain: ['尼多蘭','尼多娜','尼多后'] });
    expect(result[4]).toEqual({ name: '袋獸', chain: ['袋獸'] });
  });

});
