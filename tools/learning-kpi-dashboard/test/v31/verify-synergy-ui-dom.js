const { chromium } = require('playwright');
const path = require('path');

async function verifySynergyUiDom() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 [Task 3] 實機 DOM 驗證：皮卡丘 T1 叫聲 + T2 二連擊 ➡️ T3 電磁波連攜遞延測試`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  const res = await page.evaluate(() => {
    const p = (globalData.roster || []).find(p => p.baseName.includes('皮卡丘') || p.id === 'P4' || p.id === 'P3') || (globalData.roster ? globalData.roster[0] : null);
    if (!p) return { error: 'No pokemon found' };
    openSkillTree(p.id);
    selectSkillTreeTab('atk');
    const pkmn = getPkmnById(_skillTreePkmnId);
    if (!pkmn) return { error: 'pkmn null' };

    // Set 8 SP invested so T3 is unlocked
    pkmn.skillTree = {
      atk: { sp: 8, tier: 3 },
      ATK: { sp: 8, tier: 3 },
      spa: { sp: 0, tier: 1 },
      buf: { sp: 0, tier: 1 },
      dis: { sp: 0, tier: 1 },
      ult: { sp: 0, tier: 1 }
    };

    // Learn T1 Growl (叫聲) Lv3 & T2 Double Hit (二連擊) Lv4
    pkmn.learnedMoves = {
      "ATK:叫聲": { name: "叫聲", level: 3, tier: 1, role: "ATK" },
      "ATK:二連擊": { name: "二連擊", level: 4, tier: 2, role: "ATK" }
    };

    renderSkillTree();

    const nodeT2DoubleHit = document.querySelector('.st-node[data-move="二連擊"]');
    const nodeT3Wave = document.querySelector('.st-node[data-move="電磁波"]');

    return {
      textT2DoubleHit: nodeT2DoubleHit ? nodeT2DoubleHit.textContent : '',
      textT3Wave: nodeT3Wave ? nodeT3Wave.textContent : ''
    };
  });

  console.log(`  - 學習 T1「叫聲」+ T2「二連擊」後，T2 二連擊 DOM 標籤:`, res.textT2DoubleHit);
  console.log(`  - 解鎖 8 SP (T3) 後，T3 電磁波 DOM 標籤:`, res.textT3Wave);

  const isT3Pass = res.textT3Wave.includes('二連擊·音波麻痺');
  console.log(`  - 跨階層 T3 流派連攜繼承 DOM 渲染測試: ${isT3Pass ? '✅ 100% PASS' : '❌ FAIL'}`);

  await browser.close();

  if (!isT3Pass) throw new Error('T3 DOM 渲染未正確顯示跨階層連攜！');
}

verifySynergyUiDom();
