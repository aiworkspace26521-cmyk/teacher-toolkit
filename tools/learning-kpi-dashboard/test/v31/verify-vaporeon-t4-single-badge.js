const { chromium } = require('playwright');
const path = require('path');

async function verifyVaporeonT4SingleBadge() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 [Task 3] 實機 DOM 驗證：水伊布 T1 泡泡 ➡️ T2 泡沫光線 ➡️ T3 水之誓約 (15 SP) ➡️ T4 水炮 獨占連攜測試`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  const res = await page.evaluate(() => {
    let p = (globalData.roster || []).find(p => p.baseName && p.baseName.includes('水伊布'));
    if (!p) {
      p = { id: 'TEST_VAPOREON', name: '水伊布', baseName: '水伊布', type: '水', level: 23, fp: 169 };
      globalData.roster.push(p);
    }
    openSkillTree(p.id);
    selectSkillTreeTab('atk');

    const pkmn = getPkmnById(_skillTreePkmnId);
    if (!pkmn) return { error: 'pkmn null' };

    // Set 15 SP invested so T4 is unlocked
    pkmn.skillTree = {
      atk: { sp: 15, tier: 4 },
      ATK: { sp: 15, tier: 4 },
      spa: { sp: 0, tier: 1 },
      buf: { sp: 0, tier: 1 },
      dis: { sp: 0, tier: 1 },
      ult: { sp: 0, tier: 1 }
    };

    pkmn.learnedMoves = {
      "ATK:泡泡": { name: "泡泡", level: 3, tier: 1, role: "ATK" },
      "ATK:泡沫光線": { name: "泡沫光線", level: 4, tier: 2, role: "ATK" },
      "ATK:水之誓約": { name: "水之誓約", level: 5, tier: 3, role: "ATK" }
    };

    renderSkillTree();

    const nodeHydroPump = document.querySelector('.st-node[data-move="水炮"]');
    const nodeAquaTail = document.querySelector('.st-node[data-move="水流尾"]');
    const nodeLiquidation = document.querySelector('.st-node[data-move="水流裂破"]');
    const nodeAquaRing = document.querySelector('.st-node[data-move="水之軀"]');
    const nodeAcidArmor = document.querySelector('.st-node[data-move="溶化"]');
    const nodeSubstitute = document.querySelector('.st-node[data-move="替身"]');

    return {
      textHydroPump: nodeHydroPump ? nodeHydroPump.textContent : '',
      textAquaTail: nodeAquaTail ? nodeAquaTail.textContent : '',
      textLiquidation: nodeLiquidation ? nodeLiquidation.textContent : '',
      textAquaRing: nodeAquaRing ? nodeAquaRing.textContent : '',
      textAcidArmor: nodeAcidArmor ? nodeAcidArmor.textContent : '',
      textSubstitute: nodeSubstitute ? nodeSubstitute.textContent : ''
    };
  });

  console.log(`  - T4 水炮 DOM:`, res.textHydroPump);
  console.log(`  - T4 水流尾 DOM:`, res.textAquaTail);
  console.log(`  - T4 水流裂破 DOM:`, res.textLiquidation);
  console.log(`  - T4 水之軀 DOM:`, res.textAquaRing);
  console.log(`  - T4 溶化 DOM:`, res.textAcidArmor);
  console.log(`  - T4 替身 DOM:`, res.textSubstitute);

  const hasHydroPumpSynergy = res.textHydroPump.includes('🔗 水之誓約·水龍怒濤');
  const otherMovesClean = !res.textAquaTail.includes('🔗') && !res.textLiquidation.includes('🔗') && !res.textAquaRing.includes('🔗') && !res.textAcidArmor.includes('🔗') && !res.textSubstitute.includes('🔗');

  const isPass = hasHydroPumpSynergy && otherMovesClean;
  console.log(`  - 水伊布 T4 獨占 1 對 1 連攜 DOM 驗證: ${isPass ? '✅ 100% PASS' : '❌ FAIL'}`);

  await browser.close();

  if (!isPass) throw new Error('水伊布 T4 依然未顯示連攜標籤或存在多招式重複！');
}

verifyVaporeonT4SingleBadge();
