const { chromium } = require('playwright');
const path = require('path');

async function verifySynergyUiDom() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 [Task 3] 實機 DOM 驗證：皮卡丘 T4 15 SP 解鎖精確 1對1 連攜測試`);
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

    // Set 15 SP invested so T4 is unlocked
    pkmn.skillTree = {
      atk: { sp: 15, tier: 4 },
      ATK: { sp: 15, tier: 4 },
      spa: { sp: 0, tier: 1 },
      buf: { sp: 0, tier: 1 },
      dis: { sp: 0, tier: 1 },
      ult: { sp: 0, tier: 1 }
    };

    // Learn T1 Growl (叫聲) + T2 Double Hit (二連擊) + T3 Electromagnetic Wave (電磁波)
    pkmn.learnedMoves = {
      "ATK:叫聲": { name: "叫聲", level: 3, tier: 1, role: "ATK" },
      "ATK:二連擊": { name: "二連擊", level: 4, tier: 2, role: "ATK" },
      "ATK:電磁波": { name: "電磁波", level: 5, tier: 3, role: "ATK" }
    };

    renderSkillTree();

    const nodeT4Thunder = document.querySelector('.st-node[data-move="打雷"]');
    const nodeT4Plasma = document.querySelector('.st-node[data-move="電漿閃光"]');
    const nodeT4BlackFog = document.querySelector('.st-node[data-move="黑霧"]');

    return {
      textT4Thunder: nodeT4Thunder ? nodeT4Thunder.textContent : '',
      textT4Plasma: nodeT4Plasma ? nodeT4Plasma.textContent : '',
      textT4BlackFog: nodeT4BlackFog ? nodeT4BlackFog.textContent : ''
    };
  });

  console.log(`  - 學習 叫聲/二連擊/電磁波 後，T4 打雷 DOM:`, res.textT4Thunder);
  console.log(`  - 學習 叫聲/二連擊/電磁波 後，T4 電漿閃光 DOM:`, res.textT4Plasma);
  console.log(`  - 學習 叫聲/二連擊/電磁波 後，T4 黑霧 DOM:`, res.textT4BlackFog);

  const isPass = !res.textT4Thunder.includes('聲壓貫穿') && res.textT4BlackFog.includes('電磁波·聲壓貫穿');
  console.log(`  - T4 1對1 精確連攜不濫發 DOM 渲染測試: ${isPass ? '✅ 100% PASS' : '❌ FAIL'}`);

  await browser.close();

  if (!isPass) throw new Error('T4 招式存在過度發放與重複連攜標籤！');
}

verifySynergyUiDom();
