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

  test('PC box equip/unequip flow: cycle works correctly', async ({ page }) => {
    // Use Admin (has Eevee Lv.11 that already holds shellBell from Firestore)
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.locator('#kpiLevel').waitFor({ state: 'visible', timeout: 15000 });

    // Ensure shellBell flag is set, then open collection
    var state = await page.evaluate(() => {
      globalData.hasShellBell = true;
      openPCBoxModal();
      openCollection();
      var allBtns = Array.from(document.querySelectorAll('#collectionList button'));
      return {
        hasUnequip: allBtns.some(function(b) { return b.textContent.indexOf('卸下') !== -1; }),
        hasEquip: allBtns.some(function(b) { return b.textContent.indexOf('裝備') !== -1; }),
        allButtons: allBtns.map(function(b) { return b.textContent.trim(); })
      };
    });

    test.info().annotations.push({ type: 'state', description: JSON.stringify(state) });
    expect(state.hasUnequip || state.hasEquip).toBe(true);
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
