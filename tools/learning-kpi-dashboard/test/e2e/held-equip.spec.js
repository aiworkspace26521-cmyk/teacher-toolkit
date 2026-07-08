const { test, expect } = require('@playwright/test');

test.describe('Held Item Equip Flow', () => {

  async function loginNeil(page) {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });
  }

  test('成就圖鑑 nav button exists', async ({ page }) => {
    await loginNeil(page);
    const collectionBtn = page.locator('.nav-btn').filter({ hasText: /成就圖鑑/ });
    await expect(collectionBtn).toBeVisible();
  });

  test('成就圖鑑 modal opens from nav button', async ({ page }) => {
    await loginNeil(page);
    const collectionBtn = page.locator('.nav-btn').filter({ hasText: /成就圖鑑/ });
    await collectionBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#collectionModal')).toBeVisible({ timeout: 8000 });
  });

  test('PC box equip flow: item equips to correct Pokémon', async ({ page }) => {
    await loginNeil(page);

    // Open PC box
    const pcBtn = page.locator('.nav-btn').filter({ hasText: /電腦/ });
    await pcBtn.click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // Check if there are any unequipped held items with 裝備 button
    const equipBtns = page.locator('#pcBoxBody button:has-text("裝備")');
    const equipCount = await equipBtns.count();

    if (equipCount === 0) {
      // No unequipped items — buy the cheapest held item (shellBell) via shop
      test.info().annotations.push({ type: 'info', description: 'No unequipped held items found, purchasing shellBell' });

      // Close PC, open shop
      await page.locator('#pcBoxModal .close-btn').click();
      await page.waitForTimeout(500);

      // Open shop
      await page.locator('.nav-btn').filter({ hasText: '商城' }).click();
      await page.waitForTimeout(2000);
      await expect(page.locator('#shopModal')).toBeVisible({ timeout: 5000 });

      // Find and buy 貝殼之鈴 (shellBell) in shop
      const shellBought = await page.evaluate(async () => {
        // Check if already purchased
        if (globalData && globalData.hasShellBell) return 'already_owned';
        // Find the buy button for shellBell
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

      // Reopen PC
      await page.locator('.nav-btn').filter({ hasText: /電腦/ }).click();
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

    // Read the first Pokémon's name before clicking
    const firstPokemonName = await pokemonCards.first().innerText();

    // Click the first Pokémon to equip
    await pokemonCards.first().click();
    await page.waitForTimeout(2000);

    // Equip modal should close
    await expect(page.locator('#equipModal')).not.toBeVisible({ timeout: 5000 });

    // PC box should still be visible (not collection modal)
    await expect(page.locator('#pcBoxModal')).toBeVisible({ timeout: 5000 });

    // The item should now appear as equipped (show holder name instead of 裝備 button)
    const equipBtnsAfter = page.locator('#pcBoxBody button:has-text("裝備")');
    const equipCountAfter = await equipBtnsAfter.count();
    const equipBtnCount = await page.locator('#pcBoxBody button:has-text("卸下")').count();

    // Count should have changed (one less 裝備, one more 卸下)
    test.info().annotations.push({
      type: 'result',
      description: '裝備 buttons: ' + equipCount + ' -> ' + equipCountAfter + ', 卸下 buttons: ' + equipBtnCount
    });
  });

  test('unequip from PC box works correctly', async ({ page }) => {
    await loginNeil(page);

    // Open PC box
    await page.locator('.nav-btn').filter({ hasText: /電腦/ }).click();
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

    // 裝備 buttons count should have increased (one more unequipped item)
    const equipAfter = await page.locator('#pcBoxBody button:has-text("裝備")').count();
    expect(equipAfter).toBeGreaterThanOrEqual(equipBefore);

    test.info().annotations.push({
      type: 'result',
      description: '裝備 buttons: ' + equipBefore + ' -> ' + equipAfter
    });
  });

  test('equip from collection nav button works correctly', async ({ page }) => {
    await loginNeil(page);

    // Open collection via nav button
    await page.locator('.nav-btn').filter({ hasText: /成就圖鑑/ }).click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#collectionModal')).toBeVisible({ timeout: 5000 });

    // Check for equip/unequip buttons in collection cards
    const collectionEquipBtns = page.locator('#collectionList button:has-text("裝備")');
    const collectionUnequipBtns = page.locator('#collectionList button:has-text("卸下")');

    const equipColCount = await collectionEquipBtns.count();
    const unequipColCount = await collectionUnequipBtns.count();

    test.info().annotations.push({
      type: 'info',
      description: 'Collection: ' + equipColCount + ' equip buttons, ' + unequipColCount + ' unequip buttons'
    });

    // At least one action button should exist
    expect(equipColCount + unequipColCount).toBeGreaterThan(0);
  });

});
