const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function spotcheckLiveHostingV3() {
  const liveUrl = 'https://opencodefirebase.web.app/kpi-dashboard.html';
  console.log(`\n================================================================================`);
  console.log(`🌐 [Live Hosting Spotcheck V3] 線上 Hosting 實機全動態技能樹點擊與 DOM 標籤校驗`);
  console.log(`目標 URL: ${liveUrl}`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`);
  });

  await page.goto(liveUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const report = await page.evaluate(async () => {
    const targets = [
      { name: '噴火龍', type: '火', role: 'ATK' },
      { name: '風速狗', type: '火', role: 'SPA' },
      { name: '妙蛙花', type: '草', role: 'ATK' },
      { name: '妙蛙花', type: '草', role: 'SPA' },
      { name: '皮卡丘', type: '電', role: 'ATK' },
      { name: '皮卡丘', type: '電', role: 'SPA' },
      { name: '太陽伊布', type: '超能力', role: 'ATK' },
      { name: '太陽伊布', type: '超能力', role: 'SPA' },
      { name: '巨金怪', type: '鋼', role: 'ATK' },
      { name: '快龍', type: '龍', role: 'ATK' },
      { name: '皮可西', type: '妖精', role: 'SPA' },
      { name: '嗡蝠', type: '飛行/龍', role: 'ATK' },
      { name: '巨沼怪', type: '水/地面', role: 'ATK' }
    ];

    const results = [];

    for (const tgt of targets) {
      const roleUpper = tgt.role.toUpperCase();
      const roleLower = tgt.role.toLowerCase();

      const dummyPkmn = {
        id: `live_check_${tgt.name}_${roleUpper}`,
        baseName: tgt.name,
        rawName: tgt.name,
        types: tgt.type.split('/'),
        currentLevel: 100,
        skillPoints: 999,
        totalSpEarned: 999,
        maxTreeTier: 5,
        learnedMoves: {},
        skillTree: {
          atk: { sp: 30, tier: 5 }, ATK: { sp: 30, tier: 5 },
          spa: { sp: 30, tier: 5 }, SPA: { sp: 30, tier: 5 },
          buf: { sp: 30, tier: 5 }, BUF: { sp: 30, tier: 5 },
          dis: { sp: 30, tier: 5 }, DIS: { sp: 30, tier: 5 },
          ult: { sp: 30, tier: 5 }, ULT: { sp: 30, tier: 5 }
        }
      };

      if (!window.globalData) window.globalData = { roster: [] };
      window.globalData.roster = [dummyPkmn];
      window._skillTreePkmnId = dummyPkmn.id;
      window._skillTreeActiveTab = roleLower;

      const tree = resolveSkillTreeV31(dummyPkmn);
      if (!tree) continue;
      const roleTree = tree[roleUpper] || {};

      const t1List = (roleTree.T1 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t2List = (roleTree.T2 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t3List = (roleTree.T3 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t4List = (roleTree.T4 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t5List = (roleTree.T5 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);

      const t1Opt = t1List[0];
      const t2Opt = t2List[0];
      const t3Opt = t3List[0];
      const t4Opt = t4List[0];
      const t5Opt = t5List[0];

      const t1Name = t1Opt ? (t1Opt.name || t1Opt) : null;
      const t2Name = t2Opt ? (t2Opt.name || t2Opt) : null;
      const t3Name = t3Opt ? (t3Opt.name || t3Opt) : null;
      const t4Name = t4Opt ? (t4Opt.name || t4Opt) : null;
      const t5Name = t5Opt ? (t5Opt.name || t5Opt) : null;

      if (t1Name) learnSkillTreeNodeV31(t1Name, 1, roleUpper, dummyPkmn);
      if (t2Name) learnSkillTreeNodeV31(t2Name, 2, roleUpper, dummyPkmn);
      if (t3Name) learnSkillTreeNodeV31(t3Name, 3, roleUpper, dummyPkmn);
      if (t4Name) learnSkillTreeNodeV31(t4Name, 4, roleUpper, dummyPkmn);

      renderSkillTree();

      const canvasEl = document.getElementById('skillTreeBody');
      const htmlText = canvasEl ? canvasEl.innerHTML : '';

      const badgesFound = [];
      const movesToCheck = [t2Name, t3Name, t4Name, t5Name].filter(Boolean);

      for (const m of movesToCheck) {
        if (htmlText.includes(`data-move="${m}"`)) {
          const snippet = htmlText.split(`data-move="${m}"`)[1].split('</div>')[0];
          const badgeMatch = snippet.match(/🔗\s*([^<"]+)/);
          if (badgeMatch) {
            badgesFound.push({ move: m, badgeText: badgeMatch[0].trim() });
          }
        }
      }

      results.push({
        pkmn: tgt.name,
        role: roleUpper,
        chain: [t1Name, t2Name, t3Name, t4Name, t5Name].filter(Boolean),
        badgesFoundCount: badgesFound.length,
        badgesDetails: badgesFound
      });
    }

    return results;
  });

  console.log(`\n================================================================================`);
  console.log(`📊 線上 Hosting 實機動態選招連攜抽查報告 (共 ${report.length} 組驗證寶可夢):`);
  console.log(`================================================================================`);

  report.forEach((res, idx) => {
    console.log(`\n[${idx + 1}] 寶可夢: ${res.pkmn} (${res.role} 軌)`);
    console.log(`    動態合規選招鏈: ${res.chain.join(' ➡️ ')}`);
    console.log(`    DOM 成功渲染連攜標籤數量: ${res.badgesFoundCount} 個`);
    res.badgesDetails.forEach(b => {
      console.log(`      - 招式【${b.move}】: ${b.badgeText}`);
    });
  });

  console.log(`\n================================================================================\n`);

  await browser.close();
}

spotcheckLiveHostingV3();
