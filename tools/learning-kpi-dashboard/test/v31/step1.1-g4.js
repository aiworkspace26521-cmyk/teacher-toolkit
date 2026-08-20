// v3.1 Step 1.1 G4: admin manual test against LOCAL new build.
// Verifies the current page behaves as v2 (flags off, no v3.1 UI) and the new
// SP-economy constants are loaded on window for later Steps.
// Run: BASE_URL=http://localhost:5020 node test/v31/step1.1-g4.js
const { chromium } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:5020';
const URL = BASE + '/kpi';

const EXPECTED = {
  TIER_SP_COST_V31: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  TIER_SP_THRESHOLD_V31: { 1: 0, 2: 3, 3: 8, 4: 15, 5: 24 },
  MAX_MOVE_LEVEL_V31: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
  MODIFIER_SP_COST: 3,
  SECOND_PICK_MULT: 1.5,
  MAX_TOTAL_SP_V31: 90,
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  const check = (name, ok, extra) => { results.push({ name, ok, extra }); console.log((ok ? 'PASS ' : 'FAIL ') + name + (extra ? '  | ' + extra : '')); };
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  try {
    // 1. Load the local new build.
    await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(4000);
    check('G4 page loads', (await page.title()).includes('KPI'), await page.title());

    // 2. V31_FLAGS all false (v2 behavior unchanged) — Step 0.1 baseline.
    const flags = await page.evaluate(() => (window.V31_FLAGS ? { ...window.V31_FLAGS } : null)).catch(() => null);
    check('G4 V31_FLAGS exists', !!flags, flags ? JSON.stringify(flags) : 'missing');
    if (flags) {
      const allFalse = ['ENABLED', 'MORPHOLOGY_FILTER', 'SIX_MOVES_PER_TIER', 'SP_ECONOMY_90', 'LV5_MODIFIER'].every(k => flags[k] === false);
      check('G4 all V31_FLAGS false', allFalse);
    }

    // 3. New Step 1.1 constants loaded on window (data layer only, no UI impact).
    const loaded = await page.evaluate(() => {
      const g = (k) => window[k];
      return {
        TIER_SP_COST_V31: g('TIER_SP_COST_V31'),
        TIER_SP_THRESHOLD_V31: g('TIER_SP_THRESHOLD_V31'),
        MAX_MOVE_LEVEL_V31: g('MAX_MOVE_LEVEL_V31'),
        MODIFIER_SP_COST: g('MODIFIER_SP_COST'),
        SECOND_PICK_MULT: g('SECOND_PICK_MULT'),
        MAX_TOTAL_SP_V31: g('MAX_TOTAL_SP_V31'),
        OLD_TIER_SP_COST: g('TIER_SP_COST'),          // legacy retained
        OLD_TIER_SP_THRESHOLD: g('TIER_SP_THRESHOLD'),// legacy retained
      };
    }).catch(() => null);
    if (loaded) {
      let allOk = true;
      for (const [k, v] of Object.entries(EXPECTED)) {
        const ok = eq(loaded[k], v);
        if (!ok) allOk = false;
        check('G4 window.' + k, ok, JSON.stringify(loaded[k]));
      }
      check('G4 legacy TIER_SP_COST retained', eq(loaded.OLD_TIER_SP_COST, { 1: 0, 2: 5, 3: 12, 4: 20, 5: 30 }));
      check('G4 legacy TIER_SP_THRESHOLD retained', eq(loaded.OLD_TIER_SP_THRESHOLD, { 1: 0, 2: 5, 3: 12, 4: 20, 5: 30 }));
      check('G4 all new constants correct', allOk);
    } else {
      check('G4 constants readback', false, 'evaluate returned null');
    }

    // 4. Admin login via selector.
    await page.selectOption('#studentSelect', 'Admin').catch(() => {});
    await page.waitForTimeout(3000);
    const adminPanelVisible = await page.locator('#adminPanel').isVisible().catch(() => false);
    check('G4 admin panel visible after admin login', adminPanelVisible);

    // 5. No v3.1-only UI markers (flags off).
    const v31Text = await page.evaluate(() => {
      const body = document.body && document.body.textContent ? document.body.textContent : '';
      return {
        hasSixMoveUI: body.includes('生理不符') || body.includes('6 選 1'),
        hasModifierUI: body.includes('質變分支'),
      };
    }).catch(() => ({}));
    check('G4 no v3.1 UI visible (flags off)', !v31Text.hasSixMoveUI && !v31Text.hasModifierUI, JSON.stringify(v31Text));

    // 6. Navigation & skill-tree entry point exists.
    const navBtns = await page.locator('.button-row .nav-btn').count().catch(() => 0);
    check('G4 nav buttons present', navBtns >= 6, 'count=' + navBtns);
  } catch (e) {
    check('G4 exception', false, String(e && e.message));
  }

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log('\n=== G4 step1.1 result: ' + (failed.length === 0 ? 'PASS' : 'FAIL ' + failed.length + '/' + results.length) + ' (' + results.length + ' checks) ===');
  process.exit(failed.length === 0 ? 0 : 1);
})();