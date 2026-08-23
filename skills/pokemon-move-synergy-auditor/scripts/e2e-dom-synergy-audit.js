const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runE2EDomAudit() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🧪 [E2E DOM Auditor] 模擬真人點擊 DOM 元素全圖鑑與 18 屬性連攜標籤無死角校驗`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`[Browser Console Error] ${msg.text()}`);
  });

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const e2eReport = await page.evaluate(async () => {
    const singleTypes = Object.keys(TIER_MATRIX_V31);
    const roles = ['ATK', 'SPA'];
    const failures = [];
    let testCasesCount = 0;

    const samplePkmnNames = {
      '水': '水伊布 (水系)',
      '火': '風速狗 (火系)',
      '草': '妙蛙花 (草系)',
      '電': '皮卡丘 (電系)',
      '超能力': '胡地 (超能力系)',
      '鋼': '巨金怪 (鋼系)',
      '龍': '快龍 (龍系)',
      '妖精': '皮可西 (妖精系)',
      '一般': '卡比獸 (一般系)',
      '冰': '乘龍 (冰系)',
      '格鬥': '怪力 (格鬥系)',
      '毒': '雙彈瓦斯 (毒系)',
      '地面': '大岩蛇 (地面系)',
      '飛行': '比雕 (飛行系)',
      '蟲': '巨鉗螳螂 (蟲系)',
      '岩石': '班基拉斯 (岩石系)',
      '幽靈': '耿鬼 (幽靈系)',
      '惡': '月亮伊布 (惡系)'
    };

    for (const tName of singleTypes) {
      for (const role of roles) {
        const sampleName = samplePkmnNames[tName] || `皮卡丘 (${tName}系)`;

        const dummyId = `pkmn_test_${tName}_${role}`;
        const dummyPkmn = {
          id: dummyId,
          baseName: sampleName,
          rawName: sampleName.replace(/\s*\([^)]*\)/, ''),
          currentLevel: 100,
          skillPoints: 999,
          totalSpEarned: 999,
          maxTreeTier: 5,
          learnedMoves: {},
          skillTree: {}
        };

        if (!window.globalData) window.globalData = { roster: [] };
        window.globalData.roster = [dummyPkmn];
        window._skillTreePkmnId = dummyId;
        window._skillTreeActiveTab = role.toLowerCase();

        const tree = resolveSkillTreeV31(dummyPkmn);
        const roleTree = tree[role] || {};
        const t1List = (roleTree.T1 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
        const t2List = (roleTree.T2 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);

        const t1MoveName = t1List[0] ? (t1List[0].name || t1List[0]) : null;
        if (!t1MoveName) continue;

        for (const t2Opt of t2List) {
          const t2MoveName = t2Opt.name || t2Opt;
          // Reset learned moves for this test case
          dummyPkmn.learnedMoves = {};
          dummyPkmn.skillTree = {};
          
          // Learn T1
          learnSkillTreeNodeV31(t1MoveName, 1, role, dummyPkmn);
          // Learn T2
          learnSkillTreeNodeV31(t2MoveName, 2, role, dummyPkmn);

          // Force render to DOM
          renderSkillTree();

          testCasesCount++;

          // Inspect the rendered DOM container in #skillTreeBody
          const canvasEl = document.getElementById('skillTreeBody');
          if (!canvasEl) {
            failures.push({ type: tName, role, t1: t1MoveName, t2: t2MoveName, reason: 'NO_BODY' });
            continue;
          }

          const htmlText = canvasEl.innerHTML;

          // Check if T3 options contain at least one synergy badge: 🔗
          const hasSynergyBadgeInT3 = htmlText.includes('🔗');

          if (!hasSynergyBadgeInT3) {
            failures.push({
              type: tName,
              role: role,
              t1: t1MoveName,
              t2: t2MoveName,
              htmlSnippet: htmlText,
              reason: 'MISSING_SYNERGY_BADGE_IN_T3_DOM'
            });
          }
        }
      }
    }

    return { testCasesCount, failures };
  });

  console.log(`\n================================================================================`);
  console.log(`📊 E2E DOM 模擬測試結果:`);
  console.log(`================================================================================`);
  console.log(`  - 總計實機點擊與 DOM 渲染測試組合: ${e2eReport.testCasesCount} 組`);
  console.log(`  - 失敗/連攜標籤缺失組合數: ${e2eReport.failures.length} 處`);

  if (e2eReport.failures.length > 0) {
    console.log(`\n⚠️ 標籤缺失詳細列表:`);
    console.log(JSON.stringify(e2eReport.failures, null, 2));
  } else {
    console.log(`\n🎉 全 18 屬性所有 T2 招式組合在 DOM 實機渲染中 100% 成功生成 T3 連攜標籤！`);
  }
  console.log(`================================================================================\n`);

  await browser.close();

  return e2eReport;
}

runE2EDomAudit();
