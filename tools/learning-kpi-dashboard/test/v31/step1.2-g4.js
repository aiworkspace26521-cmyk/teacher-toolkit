// v3.1 Step 1.2 G4: admin manual test against LOCAL new build.
// Verifies SPECIES_TAGS + getSpeciesTags loaded correctly on window for the
// test Pokémon (小火馬 / 火恐龍 / 噴火龍), and the current page still behaves
// as v2 (flags off → no v3.1 UI, admin panel accessible).
// Run: BASE_URL=http://localhost:5020 node test/v31/step1.2-g4.js
const { chromium } = require('@playwright/test');

const BASE = process.env.BASE_URL || 'http://localhost:5020';
const URL = BASE + '/kpi';

const EXPECTED_TAGS = {
  '小火龍': ['BIPEDAL_CLAW', 'TAIL'],
  '火恐龍': ['BIPEDAL_CLAW', 'TAIL'],
  '噴火龍': ['BIPEDAL_CLAW', 'TAIL', 'WINGED'],
  '小火馬': ['QUADRUPED_HOOF'],
  '烈焰馬': ['QUADRUPED_HOOF'],
  '席多藍恩': ['QUADRUPED_CLAW', 'ARMORED'],
  '鳳王': ['WINGED', 'LEGEND'],
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

    // 2. SPECIES_TAGS loaded on window with test Pokémon tags written correctly.
    const tags = await page.evaluate((names) => {
      const out = {};
      for (const n of names) out[n] = window.getSpeciesTags ? window.getSpeciesTags(n) : null;
      out.__hasTable = !!window.SPECIES_TAGS;
      out.__unknown = window.getSpeciesTags ? window.getSpeciesTags('未知') : null;
      out.__paren = window.getSpeciesTags ? window.getSpeciesTags('噴火龍（火焰系）') : null;
      return out;
    }, Object.keys(EXPECTED_TAGS)).catch(() => null);
    if (tags) {
      check('G4 SPECIES_TAGS table exists', tags.__hasTable === true);
      let allOk = true;
      for (const [n, exp] of Object.entries(EXPECTED_TAGS)) {
        const ok = eq(tags[n], exp);
        if (!ok) allOk = false;
        check('G4 getSpeciesTags(' + n + ')', ok, JSON.stringify(tags[n]));
      }
      check('G4 小火馬/火恐龍 tags 正確寫入 SPECIES_TAGS', allOk);
      check('G4 未知 → []', eq(tags.__unknown, []));
      check('G4 括號正規化 噴火龍（火焰系）', eq(tags.__paren, EXPECTED_TAGS['噴火龍']), JSON.stringify(tags.__paren));
    } else {
      check('G4 SPECIES_TAGS readback', false, 'evaluate returned null');
    }

    // 3. V31_FLAGS all false → page renders v2, no v3.1 UI markers.
    const flags = await page.evaluate(() => (window.V31_FLAGS ? { ...window.V31_FLAGS } : null)).catch(() => null);
    check('G4 V31_FLAGS exists', !!flags);
    if (flags) {
      const allFalse = ['ENABLED', 'MORPHOLOGY_FILTER', 'SIX_MOVES_PER_TIER', 'SP_ECONOMY_90', 'LV5_MODIFIER'].every(k => flags[k] === false);
      check('G4 all V31_FLAGS false', allFalse);
    }

    // 4. Admin login → admin panel accessible (page has no anomaly).
    await page.selectOption('#studentSelect', 'Admin').catch(() => {});
    await page.waitForTimeout(3000);
    const adminPanelVisible = await page.locator('#adminPanel').isVisible().catch(() => false);
    check('G4 admin panel visible after admin login', adminPanelVisible);

    const v31Text = await page.evaluate(() => {
      const body = document.body && document.body.textContent ? document.body.textContent : '';
      return {
        hasSixMoveUI: body.includes('生理不符') || body.includes('6 選 1'),
        hasModifierUI: body.includes('質變分支'),
      };
    }).catch(() => ({}));
    check('G4 no v3.1 UI visible (flags off)', !v31Text.hasSixMoveUI && !v31Text.hasModifierUI, JSON.stringify(v31Text));

    const navBtns = await page.locator('.button-row .nav-btn').count().catch(() => 0);
    check('G4 nav buttons present', navBtns >= 6, 'count=' + navBtns);
  } catch (e) {
    check('G4 exception', false, String(e && e.message));
  }

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log('\n=== G4 step1.2 result: ' + (failed.length === 0 ? 'PASS' : 'FAIL ' + failed.length + '/' + results.length) + ' (' + results.length + ' checks) ===');
  process.exit(failed.length === 0 ? 0 : 1);
})();
