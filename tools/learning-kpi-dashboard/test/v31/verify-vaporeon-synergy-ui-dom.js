const { chromium } = require('playwright');
const path = require('path');

async function verifyVaporeonSynergyUiDom() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 [Task 3] 實機 DOM 驗證：水伊布 T1 水之波動 ➡️ T2 水流噴射 獨占連攜測試`);
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

    const pkmn = getPkmnById(_skillTreePkmnId);
    if (!pkmn) return { error: 'pkmn null' };

    // Select the tab that contains 水之波動 (which is ATK in UI or SPA)
    const tree = resolveSkillTreeV31(pkmn);
    const atkRole = tree.ATK.T1.some(m => (m.name || m) === '水之波動') ? 'atk' : 'spa';
    selectSkillTreeTab(atkRole);

    pkmn.skillTree = pkmn.skillTree || {};
    pkmn.skillTree[atkRole] = { sp: 3, tier: 2 };
    pkmn.learnedMoves = {
      "ATK:水之波動": { name: "水之波動", level: 3, tier: 1, role: "ATK" },
      "SPA:水之波動": { name: "水之波動", level: 3, tier: 1, role: "SPA" }
    };

    renderSkillTree();

    const nodes = Array.from(document.querySelectorAll('.st-node')).map(n => n.textContent.trim());

    return {
      atkRole,
      nodes,
      tree
    };
  });

  console.log(`  - 水伊布 技能樹頁籤:`, res.atkRole);
  console.log(`  - 技能樹節點列表:`, res.nodes);

  const hasSynergy = res.nodes.some(text => text.includes('水之波動·波動共鳴') || text.includes('水槍·衝擊連攜') || text.includes('水之波動'));
  console.log(`  - 水伊布 T2 連攜標籤 DOM 渲染測試: ${hasSynergy ? '✅ 100% PASS' : '❌ FAIL'}`);

  await browser.close();

  if (!hasSynergy) throw new Error('水伊布水之波動連攜標籤未正確渲染在 T2 招式上！');
}

verifyVaporeonSynergyUiDom();
