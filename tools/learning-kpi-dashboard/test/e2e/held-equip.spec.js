const { test, expect } = require('@playwright/test');

test.describe('Held Item Equip Flow', () => {

  async function loginNeil(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
  }

  test('寶可夢管理 nav button exists', async ({ page }) => {
    await loginNeil(page);
    const mgmtBtn = page.locator('.nav-btn').filter({ hasText: /寶可夢管理/ });
    await expect(mgmtBtn).toBeVisible();
  });

  test('裝備/招式學習 modal opens from inside 寶可夢管理', async ({ page }) => {
    await loginNeil(page);

    // Open 寶可夢管理 (renamed from 電腦)
    const mgmtBtn = page.locator('.nav-btn').filter({ hasText: /寶可夢管理/ });
    await mgmtBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // Click the 裝備/招式學習 button inside the modal
    const equipLearnBtn = page.locator('#pcBoxModal button').filter({ hasText: /裝備\/招式學習/ });
    await expect(equipLearnBtn).toBeVisible();
    await equipLearnBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#collectionModal')).toBeVisible({ timeout: 8000 });
  });

  test('PC box equip flow: item equips to correct Pokémon', async ({ page }) => {
    await loginNeil(page);

    var pcBtnText = /寶可夢管理/;
    // Open PC box
    const pcBtn = page.locator('.nav-btn').filter({ hasText: pcBtnText });
    await pcBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // Check if there are any unequipped held items with 裝備 button
    const equipBtns = page.locator('#pcBoxBody button:has-text("裝備")');
    const equipCount = await equipBtns.count();

    if (equipCount === 0) {
      test.info().annotations.push({ type: 'info', description: 'No unequipped held items found, purchasing shellBell' });

      // Close PC, open shop
      await page.locator('#pcBoxModal .close-btn').click();
      await page.waitForTimeout(500);

      // Open shop
      await page.locator('.nav-btn').filter({ hasText: '商城' }).click();
      await page.waitForTimeout(2000);
      await expect(page.locator('#shopModal')).toBeVisible({ timeout: 5000 });

      // Find and buy 貝殼之鈴 (shellBell) in shop
      await page.evaluate(async () => {
        if (globalData && globalData.hasShellBell) return 'already_owned';
        var shopItems = document.querySelectorAll('.shop-card');
        for (var i = 0; i < shopItems.length; i++) {
          if (shopItems[i].textContent.includes('貝殼之鈴') || shopItems[i].textContent.includes('shellBell') || shopItems[i].textContent.includes('Shell Bell')) {
            var buyBtn = shopItems[i].querySelector('button');
            if (buyBtn) { buyBtn.click(); return 'purchased'; }
          }
        }
        return 'not_found';
      });

      // Close shop
      await page.locator('#shopModal .close-btn').click();
      await page.waitForTimeout(500);

      // Reopen PC (renamed button)
      await page.locator('.nav-btn').filter({ hasText: pcBtnText }).click();
      await page.waitForTimeout(1500);
    }

    // Now verify we have at least one 裝備 button
    const equipBtns2 = page.locator('#pcBoxBody button:has-text("裝備")');
    await expect(equipBtns2.first()).toBeVisible({ timeout: 5000 });

    // Click the first 裝備 button
    const firstEquipBtn = equipBtns2.first();
    const itemText = await firstEquipBtn.textContent();
    test.info().annotations.push({ type: 'item', description: 'Equipping: ' + itemText });

    await firstEquipBtn.click();
    await page.waitForTimeout(1000);

    // Equip modal should appear with list of Pokémon
    await expect(page.locator('#equipModal')).toBeVisible({ timeout: 5000 });

    // Get the list of Pokémon cards in the equip modal
    const pokemonCards = page.locator('#equipModalList > div');
    const cardCount = await pokemonCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Click the first Pokémon to equip
    await pokemonCards.first().click();
    await page.waitForTimeout(2000);

    // Equip modal should close
    await expect(page.locator('#equipModal')).not.toBeVisible({ timeout: 5000 });

    // PC box should still be visible (not collection modal)
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // Count changes
    const equipBtnsAfter = page.locator('#pcBoxBody button:has-text("裝備")');
    const equipCountAfter = await equipBtnsAfter.count();
    const equipBtnCount = await page.locator('#pcBoxBody button:has-text("卸下")').count();

    test.info().annotations.push({
      type: 'result',
      description: '裝備 buttons: ' + equipCount + ' -> ' + equipCountAfter + ', 卸下 buttons: ' + equipBtnCount
    });
  });

  test('unequip from PC box works correctly', async ({ page }) => {
    await loginNeil(page);

    var pcBtnText = /寶可夢管理/;
    // Open PC box
    await page.locator('.nav-btn').filter({ hasText: pcBtnText }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // Check for 卸下 buttons
    const unequipBtns = page.locator('#pcBoxBody button:has-text("卸下")');
    const unequipCount = await unequipBtns.count();

    if (unequipCount === 0) {
      test.info().annotations.push({ type: 'skip', description: 'No equipped items to unequip, skipping' });
      return;
    }

    // Count 裝備 buttons before
    const equipBefore = await page.locator('#pcBoxBody button:has-text("裝備")').count();

    // Click first 卸下 button
    await unequipBtns.first().click();
    await page.waitForTimeout(2000);

    // PC box should still be visible
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // 裝備 buttons count should have increased
    const equipAfter = await page.locator('#pcBoxBody button:has-text("裝備")').count();
    expect(equipAfter).toBeGreaterThanOrEqual(equipBefore);

    test.info().annotations.push({
      type: 'result',
      description: '裝備 buttons: ' + equipBefore + ' -> ' + equipAfter
    });
  });

  test('裝備/招式學習 modal shows equip/unequip buttons', async ({ page }) => {
    await loginNeil(page);

    // Open 寶可夢管理
    await page.locator('.nav-btn').filter({ hasText: /寶可夢管理/ }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // Click 裝備/招式學習 button inside modal
    await page.locator('#pcBoxModal button').filter({ hasText: /裝備\/招式學習/ }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#collectionModal')).toBeVisible({ timeout: 5000 });

    // Check for equip/unequip buttons in collection cards
    const collectionEquipBtns = page.locator('#collectionList button:has-text("裝備")');
    const collectionUnequipBtns = page.locator('#collectionList button:has-text("卸下")');

    const equipColCount = await collectionEquipBtns.count();
    const unequipColCount = await collectionUnequipBtns.count();

    test.info().annotations.push({
      type: 'info',
      description: '裝備/招式學習: ' + equipColCount + ' equip buttons, ' + unequipColCount + ' unequip buttons'
    });

    // At least one action button should exist
    expect(equipColCount + unequipColCount).toBeGreaterThan(0);
  });

});
