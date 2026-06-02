const { test, expect } = require('@playwright/test');

test.describe('KPI Dashboard Smoke Tests', () => {

  test('page loads and shows student selector', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#studentSelect')).toBeVisible();
    const options = await page.locator('#studentSelect option').allTextContents();
    expect(options).toContain('👦 Neil');
    expect(options).toContain('👧 Emma');
    expect(options).toContain('👑 管理員');
  });

  test('selecting a student loads dashboard data', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');

    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
    const levelText = await page.locator('#kpiLevel').textContent();
    expect(levelText).toMatch(/Lv\.\d+/);
  });

  test('admin panel appears for Admin user', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.waitForTimeout(2000);
    await expect(page.locator('#adminPanel')).toBeVisible();
  });

  test('navigation buttons exist in button row', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });

    const navButtons = page.locator('.button-row .nav-btn');
    const count = await navButtons.count();
    expect(count).toBeGreaterThanOrEqual(6);

    const texts = await navButtons.allTextContents();
    const allText = texts.join(' ');
    expect(allText).toContain('商城');
    expect(allText).toContain('路人戰');
    expect(allText).toContain('道館戰');
  });

});
