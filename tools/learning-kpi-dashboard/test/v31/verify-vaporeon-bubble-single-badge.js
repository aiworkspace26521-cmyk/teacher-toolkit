const { chromium } = require('playwright');
const path = require('path');

async function verifyVaporeonBubbleSingleBadge() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 [Task 3] 實機 DOM 驗證：水伊布 T1 泡泡 (3 SP) ➡️ T2 泡沫光線 獨占 1 對 1 連攜測試`);
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

    // Set 3 SP invested so T2 is unlocked, but ONLY T1 Bubble (泡泡) is learned
    pkmn.skillTree = {
      atk: { sp: 3, tier: 2 },
      ATK: { sp: 3, tier: 2 },
      spa: { sp: 0, tier: 1 },
      buf: { sp: 0, tier: 1 },
      dis: { sp: 0, tier: 1 },
      ult: { sp: 0, tier: 1 }
    };

    pkmn.learnedMoves = {
      "ATK:泡泡": { name: "泡泡", level: 3, tier: 1, role: "ATK" }
    };

    renderSkillTree();

    const nodeShellBlade = document.querySelector('.st-node[data-move="貝殼刃"]');
    const nodeWaterTail = document.querySelector('.st-node[data-move="水之尾"]');
    const nodeAquaJet = document.querySelector('.st-node[data-move="水流噴射"]');
    const nodeBubbleBeam = document.querySelector('.st-node[data-move="泡沫光線"]');
    const nodeRing = document.querySelector('.st-node[data-move="水流環"]');
    const nodeProtect = document.querySelector('.st-node[data-move="守住"]');

    return {
      textShellBlade: nodeShellBlade ? nodeShellBlade.textContent : '',
      textWaterTail: nodeWaterTail ? nodeWaterTail.textContent : '',
      textAquaJet: nodeAquaJet ? nodeAquaJet.textContent : '',
      textBubbleBeam: nodeBubbleBeam ? nodeBubbleBeam.textContent : '',
      textRing: nodeRing ? nodeRing.textContent : '',
      textProtect: nodeProtect ? nodeProtect.textContent : ''
    };
  });

  console.log(`  - 貝殼刃 DOM:`, res.textShellBlade);
  console.log(`  - 水之尾 DOM:`, res.textWaterTail);
  console.log(`  - 水流噴射 DOM:`, res.textAquaJet);
  console.log(`  - 泡沫光線 DOM:`, res.textBubbleBeam);
  console.log(`  - 水流環 DOM:`, res.textRing);
  console.log(`  - 守住 DOM:`, res.textProtect);

  const hasBubbleBeamSynergy = res.textBubbleBeam.includes('🔗 水槍·衝擊連攜');
  const otherMovesClean = !res.textShellBlade.includes('🔗') && !res.textWaterTail.includes('🔗') && !res.textAquaJet.includes('🔗') && !res.textRing.includes('🔗') && !res.textProtect.includes('🔗');

  const isPass = hasBubbleBeamSynergy && otherMovesClean;
  console.log(`  - 水伊布 泡泡 ➡️ T2 獨占 1 對 1 連攜 DOM 驗證: ${isPass ? '✅ 100% PASS' : '❌ FAIL'}`);

  await browser.close();

  if (!isPass) throw new Error('水伊布泡泡 T2 依然存在多招式重複連攜標籤！');
}

verifyVaporeonBubbleSingleBadge();
