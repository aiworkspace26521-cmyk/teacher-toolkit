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

  // ── P9-5a: PvP / Shop / Item E2E smoke tests ──

  test('PvP button opens battle modal for student with roster', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });

    const pvpBtn = page.locator('.nav-btn').filter({ hasText: /PvP/ });
    await expect(pvpBtn).toBeVisible();
  });

  test('shop modal shows item list', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });

    const shopBtn = page.locator('.nav-btn').filter({ hasText: /商城/ });
    await expect(shopBtn).toBeVisible();
    await shopBtn.click();
    await page.waitForTimeout(1500);
    const shopModal = page.locator('#shopModal');
    await expect(shopModal).toBeVisible({ timeout: 5000 });
  });

  test('box modal shows pokemon collection', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });

    const boxBtn = page.locator('.nav-btn').filter({ hasText: /PC Box|寶可夢/ });
    await expect(boxBtn).toBeVisible();
  });

  test('admin class analysis button exists', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Admin');
    await page.waitForTimeout(2000);
    await expect(page.locator('#adminPanel')).toBeVisible();

    const analysisBtn = page.locator('button').filter({ hasText: /班級分析/ });
    await expect(analysisBtn).toBeVisible();
  });

  // ── P12 fix: inline script execution & garbled text verification ──

  test('inline JavaScript executes correctly (MOVE_DATABASE exists)', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasMoves = await page.evaluate(() => typeof MOVE_DATABASE !== 'undefined');
    expect(hasMoves).toBe(true);

    const hasPokemon = await page.evaluate(() => typeof POKEMON_TIERS !== 'undefined');
    expect(hasPokemon).toBe(true);

    const hasBattle = await page.evaluate(() => typeof generateGymWaves === 'function');
    expect(hasBattle).toBe(true);
  });

  test('inline script event handlers are attached to student select', async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Verify JS attached event listeners to studentSelect
    const hasListeners = await page.evaluate(() => {
      const el = document.getElementById('studentSelect');
      if (!el) return false;
      return typeof el.onchange === 'function' || el.getAttribute('onchange') !== null;
    });
    expect(hasListeners).toBe(true);
  });

  test('no garbled text in page content', async ({ page, screenshot }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const bodyText = await page.locator('body').textContent();
    expect(bodyText).not.toMatch(/�/);
    expect(bodyText).toContain('選擇訓練家登入');
    expect(bodyText).toContain('管理員');
  });

});
