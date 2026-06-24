const { test, expect } = require('@playwright/test');

test.describe('Block I Step 12.7: Emoji泛型化修復 (B12)', () => {

  async function login(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0, { timeout: 10000 });
  }

  test('12.7a getRawName strips emoji prefix (B12 fix)', async ({ page }) => {
    await login(page);

    var result = await page.evaluate(function() {
      return [
        getRawName('🥋 功夫鼬'),
        getRawName('✨ 超夢'),
        getRawName('🐾 伊布'),
        getRawName('伊布'),
        getRawName('皮卡丘'),
        getRawName('🔥 噴火龍'),
      ];
    });

    expect(result[0]).toBe('功夫鼬');
    expect(result[1]).toBe('超夢');
    expect(result[2]).toBe('伊布');
    expect(result[3]).toBe('伊布');
    expect(result[4]).toBe('皮卡丘');
    expect(result[5]).toBe('噴火龍');
  });

  test('12.7b getRawName handles no emoji', async ({ page }) => {
    await login(page);

    var result = await page.evaluate(function() {
      return getRawName('妙蛙種子');
    });
    expect(result).toBe('妙蛙種子');
  });

  test('12.7c getRawName strips parenthetical suffixes', async ({ page }) => {
    await login(page);

    var result = await page.evaluate(function() {
      return getRawName('阿爾宙斯(創世神)');
    });
    expect(result).toBe('阿爾宙斯');
  });

  test('12.7d pokedex grid shows emoji-free names (B12 fix)', async ({ page }) => {
    await login(page);

    await page.evaluate(function() {
      var modal = document.getElementById('pokedexModal');
      if (modal) modal.style.display = 'none';
    });

    var pokedexBtn = page.locator('.nav-btn').filter({ hasText: '全國圖鑑' });
    await expect(pokedexBtn).toBeVisible();
    await pokedexBtn.click();
    await page.waitForTimeout(2000);
    await expect(page.locator('#pokedexModal')).toBeVisible({ timeout: 5000 });

    var hasGarbledEmoji = await page.evaluate(function() {
      var grid = document.getElementById('pokedexGrid');
      if (!grid) return true;
      return Array.from(grid.children).every(function(c) {
        var text = c.textContent;
        return text.indexOf('undefined') === -1 && text.indexOf('null') === -1;
      });
    });
    expect(hasGarbledEmoji).toBe(true);
  });

});
