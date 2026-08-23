const { chromium } = require('playwright');
const path = require('path');

async function verifyVaporeonSynergyUiDom() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 [Task 3] 實機 DOM 驗證：水伊布 T3 8 SP 解鎖 (水之波動 ➡️ 水流噴射 ➡️ 攀瀑/濁流連攜測試)`);
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

    // Set 8 SP invested so T3 is unlocked
    pkmn.skillTree = {
      atk: { sp: 8, tier: 3 },
      ATK: { sp: 8, tier: 3 },
      spa: { sp: 0, tier: 1 },
      buf: { sp: 0, tier: 1 },
      dis: { sp: 0, tier: 1 },
      ult: { sp: 0, tier: 1 }
    };

    // Learn T1 Water Pulse (水之波動) + T2 Aqua Jet (水流噴射)
    pkmn.learnedMoves = {
      "ATK:水之波動": { name: "水之波動", level: 3, tier: 1, role: "ATK" },
      "ATK:水流噴射": { name: "水流噴射", level: 4, tier: 2, role: "ATK" }
    };

    renderSkillTree();

    const nodeT2AquaJet = document.querySelector('.st-node[data-move="水流噴射"]');
    const nodeT3Waterfall = document.querySelector('.st-node[data-move="攀瀑"]');
    const nodeT3MuddyWater = document.querySelector('.st-node[data-move="濁流"]');

    return {
      textT2AquaJet: nodeT2AquaJet ? nodeT2AquaJet.textContent : '',
      textT3Waterfall: nodeT3Waterfall ? nodeT3Waterfall.textContent : '',
      textT3MuddyWater: nodeT3MuddyWater ? nodeT3MuddyWater.textContent : ''
    };
  });

  console.log(`  - 學習 水之波動(T1) + 水流噴射(T2) 後，T2 水流噴射 DOM:`, res.textT2AquaJet);
  console.log(`  - 8 SP 解鎖 T3 後，T3 攀瀑 DOM:`, res.textT3Waterfall);
  console.log(`  - 8 SP 解鎖 T3 後，T3 濁流 DOM:`, res.textT3MuddyWater);

  const isPass = res.textT3Waterfall.includes('水流噴射·極速衝擊') || res.textT3MuddyWater.includes('水流噴射·極速衝擊');
  console.log(`  - 水伊布 T3 漸進連攜標籤 DOM 渲染測試: ${isPass ? '✅ 100% PASS' : '❌ FAIL'}`);

  await browser.close();

  if (!isPass) throw new Error('水伊布 T3 攀瀑/濁流連攜標籤未正確渲染！');
}

verifyVaporeonSynergyUiDom();
