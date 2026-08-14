const { test, expect } = require('@playwright/test');

test('EVO_HAS_FURTHER 載入頁面且最終型判定正確（無需登入）', async ({ page }) => {
  await page.goto(new URL('/kpi-dashboard.html', process.env.BASE_URL || 'http://127.0.0.1:8123').toString());
  await page.waitForFunction(() => {
    try { return typeof EVO_HAS_FURTHER !== 'undefined' && Object.keys(EVO_HAS_FURTHER).length > 100; } catch (e) { return false; }
  }, { timeout: 15000 });

  const logic = await page.evaluate(() => {
    function tierOf(baseName, evoStage) {
      var rawName = baseName.replace(/^[^\w\u4e00-\u9fff]+\s*/u, '').replace(/\s*\([^)]*\).*$/, '');
      var aliasName = (typeof EEVEELUTION_IBU !== 'undefined' && EEVEELUTION_IBU[rawName]) ? EEVEELUTION_IBU[rawName] : rawName;
      var hasFurtherEvo = (typeof EVO_HAS_FURTHER !== 'undefined')
        ? (EVO_HAS_FURTHER[rawName] || EVO_HAS_FURTHER[aliasName] || EVO_HAS_FURTHER[baseName])
        : ((typeof EVO_CHAIN_MAP !== 'undefined') && (EVO_CHAIN_MAP[rawName] || EVO_CHAIN_MAP[aliasName] || EVO_CHAIN_MAP[baseName]));
      var isFinalForm = !hasFurtherEvo;
      return (evoStage >= 2 || (evoStage >= 1 && isFinalForm)) ? 5 : (evoStage >= 1 ? 4 : 3);
    }
    return {
      setCount: Object.keys(EVO_HAS_FURTHER).length,
      vaporeon: tierOf('水伊布', 1),          // 最終型 → 5
      vaporeonIbu: tierOf('水精靈', 1),       // 最終型 → 5
      eevee: tierOf('伊布', 0),                // 未進化 → 3
      ivysaur: tierOf('妙蛙草', 1),            // 中間型（→妙蛙花）→ 4
      wartortle: tierOf('卡咪龜', 1),          // 中間型（→水箭龜）→ 4
      clefairy: tierOf('皮皮', 1),             // 中間型（→皮可西）→ 4
      charizard: tierOf('噴火龍', 2),          // 最終階 → 5
      sylveon: tierOf('仙子伊布', 1),          // 最終型 → 5
      venusaur: tierOf('妙蛙花', 2)            // 最終階 → 5
    };
  });
  console.log('EVO_HAS_FURTHER set =', logic.setCount, '判定 =', JSON.stringify(logic));
  expect(logic.setCount).toBeGreaterThan(100);
  expect(logic.vaporeon).toBe(5);
  expect(logic.vaporeonIbu).toBe(5);
  expect(logic.eevee).toBe(3);
  expect(logic.ivysaur).toBe(4);
  expect(logic.wartortle).toBe(4);
  expect(logic.clefairy).toBe(4);
  expect(logic.charizard).toBe(5);
  expect(logic.sylveon).toBe(5);
  expect(logic.venusaur).toBe(5);
});
