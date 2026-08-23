const { chromium } = require('playwright');
const path = require('path');

async function verifySynergyUiDom() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 [Task 3] 實機 DOM 驗證：皮卡丘叫聲 vs 甩尾 獨占連攜標籤渲染測試`);
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

    // Set T1 SP to 3 (both lowercase and uppercase) so T2 is unlocked
    pkmn.skillTree = {
      atk: { sp: 3, tier: 2 },
      ATK: { sp: 3, tier: 2 },
      spa: { sp: 0, tier: 1 },
      buf: { sp: 0, tier: 1 },
      dis: { sp: 0, tier: 1 },
      ult: { sp: 0, tier: 1 }
    };

    // Test A: Learn Growl (叫聲) Lv3
    pkmn.learnedMoves = { "ATK:叫聲": { name: "叫聲", level: 3, tier: 1, role: "ATK" } };
    renderSkillTree();
    const doubleHitNodeGrowl = document.querySelector('.st-node[data-move="二連擊"]');
    const textGrowl = doubleHitNodeGrowl ? doubleHitNodeGrowl.textContent : '';

    // Test B: Learn Tail Whip (甩尾) Lv3
    pkmn.learnedMoves = { "ATK:甩尾": { name: "甩尾", level: 3, tier: 1, role: "ATK" } };
    renderSkillTree();
    const doubleHitNodeTail = document.querySelector('.st-node[data-move="二連擊"]');
    const textTail = doubleHitNodeTail ? doubleHitNodeTail.textContent : '';

    return {
      textGrowl,
      textTail
    };
  });

  console.log(`  - 學習「叫聲」後，DOM 二連擊標籤渲染:`, res.textGrowl);
  console.log(`  - 學習「甩尾」後，DOM 二連擊標籤渲染:`, res.textTail);

  const isDistinct = res.textGrowl.includes('叫聲·音波降防') && res.textTail.includes('甩尾·破防連攜');
  console.log(`  - 一對一流派獨占對應 DOM 渲染測試: ${isDistinct ? '✅ 100% PASS' : '❌ FAIL'}`);

  await browser.close();

  if (!isDistinct) throw new Error('DOM 渲染不符合獨占對應原則！');
}

verifySynergyUiDom();
