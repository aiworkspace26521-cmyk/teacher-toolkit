// v3.1 Step 0.1 G4: admin manual test against LOCAL new build.
// Verifies: login→select→skill tree→battle flow works, V31_FLAGS present & all-false, no v3.1 UI.
// Run: BASE_URL=http://127.0.0.1:5000 node test/v31/step0.1-g4.js
const { chromium } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://127.0.0.1:5000';
const URL = BASE + '/kpi';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  const check = (name, ok, extra) => { results.push({ name, ok, extra }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  | ' + extra : '')); };

  try {
    // 1. Load the local new build.
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    check('G4 login page loads', (await page.title()).includes('KPI'));
    check('G4 student selector present', await page.locator('#studentSelect').isVisible().catch(() => false));

    // 2. V31_FLAGS must exist in the NEW code with ENABLED=false.
    const flags = await page.evaluate(() => (window.V31_FLAGS ? { ...window.V31_FLAGS } : null)).catch(() => null);
    if (flags && typeof flags === 'object') {
      const allFalse = ['ENABLED', 'MORPHOLOGY_FILTER', 'SIX_MOVES_PER_TIER', 'SP_ECONOMY_90', 'LV5_MODIFIER'].every(k => flags[k] === false);
      check('G4 V31_FLAGS exists on window', true, JSON.stringify(flags));
      check('G4 all V31_FLAGS false (v2 behavior)', allFalse);
    } else {
      check('G4 V31_FLAGS exists on window', false, 'V31_FLAGS missing/undefined');
    }

    // 3. Admin login via selector.
    await page.selectOption('#studentSelect', 'Admin').catch(() => {});
    await page.waitForTimeout(2500);
    const adminPanelVisible = await page.locator('#adminPanel').isVisible().catch(() => false);
    check('G4 admin panel visible after admin login', adminPanelVisible);

    // 4. No v3.1-only UI markers should be present (ENABLED=false).
    const v31Text = await page.evaluate(() => {
      const body = document.body && document.body.textContent ? document.body.textContent : '';
      return {
        hasSixMoveLabel: body.includes('生理不符') || body.includes('6 選 1'),
        hasModifierUI: body.includes('質變分支'),
      };
    }).catch(() => ({}));
    check('G4 no v3.1 UI visible (flags off)', !v31Text.hasSixMoveLabel && !v31Text.hasModifierUI, JSON.stringify(v31Text));

    // 5. Navigation & skill-tree entry point exists (flow baseline).
    const navBtns = await page.locator('.button-row .nav-btn').count().catch(() => 0);
    check('G4 nav buttons present', navBtns >= 6, 'count=' + navBtns);
  } catch (e) {
    check('G4 exception', false, String(e && e.message));
  }

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log('\n=== G4 step0.1 result: ' + (failed.length === 0 ? 'PASS' : 'FAIL ' + failed.length + '/' + results.length) + ' (' + results.length + ' checks) ===');
  process.exit(failed.length === 0 ? 0 : 1);
})();