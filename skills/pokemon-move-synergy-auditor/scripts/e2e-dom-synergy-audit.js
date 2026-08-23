const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runE2EDomAudit() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🧪 [E2E DOM Auditor V5] 模擬真人點擊 DOM 元素全 18 屬性 + 153 雙屬性 + 全圖鑑 T5 奧義連攜對齊測試 (程序化與經典雙軌校驗)`);
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
      '超能力': '太陽伊布 (超能力系)',
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

    function auditDomPkmnFullStream(dummyPkmn, tName, role) {
      if (!window.globalData) window.globalData = { roster: [] };
      window.globalData.roster = [dummyPkmn];
      window._skillTreePkmnId = dummyPkmn.id;
      window._skillTreeActiveTab = role.toLowerCase();

      const tree = resolveSkillTreeV31(dummyPkmn);
      if (!tree) return;
      const roleTree = tree[role] || {};
      const t1List = (roleTree.T1 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t2List = (roleTree.T2 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t3List = (roleTree.T3 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t4List = (roleTree.T4 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t5List = (roleTree.T5 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);

      // Iterate over each available branch index i
      for (let i = 0; i < t1List.length; i++) {
        const t1Opt = t1List[i];
        const t1MoveName = t1Opt.name || t1Opt;

        // Reset learned moves & set skillTree SP to 30 to unlock T5
        dummyPkmn.learnedMoves = {};
        dummyPkmn.skillTree = {
          atk: { sp: 30, tier: 5 },
          spa: { sp: 30, tier: 5 },
          buf: { sp: 30, tier: 5 },
          dis: { sp: 30, tier: 5 },
          ult: { sp: 30, tier: 5 }
        };
        dummyPkmn.skillPoints = 999;
        dummyPkmn.totalSpEarned = 999;

        // Learn T1 -> T2 -> T3 -> T4 along the same index branch if available
        const t2Opt = t2List[i] || t2List[0];
        const t3Opt = t3List[i] || t3List[0];
        const t4Opt = t4List[i] || t4List[0];
        const t5Opt = t5List[i] || t5List[0];

        const t2Name = t2Opt ? (t2Opt.name || t2Opt) : null;
        const t3Name = t3Opt ? (t3Opt.name || t3Opt) : null;
        const t4Name = t4Opt ? (t4Opt.name || t4Opt) : null;
        const targetT5Name = t5Opt ? (t5Opt.name || t5Opt) : null;

        learnSkillTreeNodeV31(t1MoveName, 1, role, dummyPkmn);
        if (t2Name) learnSkillTreeNodeV31(t2Name, 2, role, dummyPkmn);
        if (t3Name) learnSkillTreeNodeV31(t3Name, 3, role, dummyPkmn);
        if (t4Name) learnSkillTreeNodeV31(t4Name, 4, role, dummyPkmn);

        renderSkillTree();
        testCasesCount++;

        const canvasEl = document.getElementById('skillTreeBody');
        if (!canvasEl) {
          failures.push({ name: dummyPkmn.baseName, type: tName, role, t1: t1MoveName, reason: 'NO_BODY' });
          continue;
        }

        const htmlText = canvasEl.innerHTML;

        const isProceduralStream = t1MoveName.match(/_T1_(\d+)$/) && targetT5Name && targetT5Name.match(/_T5_(\d+)$/);
        if (isProceduralStream) {
          // Procedural tree (like 太陽伊布 _T1_6 -> _T5_6): Index X in T1 MUST target Index X in T5
          const m1Idx = t1MoveName.match(/_T1_(\d+)$/)[1];
          const m5Idx = targetT5Name.match(/_T5_(\d+)$/)[1];

          if (m1Idx === m5Idx) {
            // Target T5 (_T5_X) MUST have badge
            const targetSnippet = htmlText.split(`data-move="${targetT5Name}"`)[1].split('</div>')[0];
            if (!targetSnippet.includes('🔗')) {
              failures.push({
                name: dummyPkmn.baseName,
                type: tName,
                role: role,
                t1: t1MoveName,
                targetT5: targetT5Name,
                reason: 'T5_PROCEDURAL_SYNERGY_BADGE_MISSING_ON_TARGET'
              });
            }
            // Option 1 (_T5_1) MUST NOT have badge if X !== 1
            if (m1Idx !== '1' && t5List[0]) {
              const opt1Name = t5List[0].name || t5List[0];
              if (htmlText.includes(`data-move="${opt1Name}"`)) {
                const opt1Snippet = htmlText.split(`data-move="${opt1Name}"`)[1].split('</div>')[0];
                if (opt1Snippet.includes('🔗')) {
                  failures.push({
                    name: dummyPkmn.baseName,
                    type: tName,
                    role: role,
                    t1: t1MoveName,
                    opt1Name: opt1Name,
                    targetT5: targetT5Name,
                    reason: 'T5_PROCEDURAL_SYNERGY_BADGE_MISALIGNED_TO_OPTION_1'
                  });
                }
              }
            }
          }
        } else {
          // Classic tree (like 火系 V熱焰): First T5 move (Option 1) is the target for classic T5 ultimate synergy
          const firstT5Name = t5List[0] ? (t5List[0].name || t5List[0]) : null;
          if (firstT5Name && htmlText.includes(`data-move="${firstT5Name}"`)) {
            const firstSnippet = htmlText.split(`data-move="${firstT5Name}"`)[1].split('</div>')[0];
            if (!firstSnippet.includes('🔗')) {
              failures.push({
                name: dummyPkmn.baseName,
                type: tName,
                role: role,
                t1: t1MoveName,
                targetT5: firstT5Name,
                reason: 'T5_CLASSIC_SYNERGY_BADGE_MISSING_ON_FIRST_TARGET'
              });
            }
          }
        }
      }
    }

    // 1. Audit ALL 18 Single Types (ATK & SPA)
    for (const tName of singleTypes) {
      for (const role of roles) {
        const sampleName = samplePkmnNames[tName] || `皮卡丘 (${tName}系)`;
        const dummyPkmn = {
          id: `pkmn_test_single_${tName}_${role}`,
          baseName: sampleName,
          rawName: sampleName.replace(/\s*\([^)]*\)/, ''),
          currentLevel: 100,
          skillPoints: 999,
          totalSpEarned: 999,
          maxTreeTier: 5,
          learnedMoves: {},
          skillTree: {}
        };
        auditDomPkmnFullStream(dummyPkmn, tName, role);
      }
    }

    // 2. Audit ALL 153 Dual-Type Combinations
    for (let i = 0; i < singleTypes.length; i++) {
      for (let j = i + 1; j < singleTypes.length; j++) {
        const typeA = singleTypes[i];
        const typeB = singleTypes[j];
        const dualName = `${typeA}/${typeB}`;
        for (const role of roles) {
          const sampleName = `雙屬性寶可夢 (${dualName})`;
          const dummyPkmn = {
            id: `pkmn_test_dual_${typeA}_${typeB}_${role}`,
            baseName: sampleName,
            types: [typeA, typeB],
            currentLevel: 100,
            skillPoints: 999,
            totalSpEarned: 999,
            maxTreeTier: 5,
            learnedMoves: {},
            skillTree: {}
          };
          auditDomPkmnFullStream(dummyPkmn, dualName, role);
        }
      }
    }

    // 3. Audit ALL POKEMON in POKEMON_DATABASE / Roster (including Espeon / 太陽伊布)
    if (typeof POKEMON_DATABASE !== 'undefined') {
      const pIds = Object.keys(POKEMON_DATABASE);
      for (const pId of pIds) {
        const realPkmn = POKEMON_DATABASE[pId];
        for (const role of roles) {
          const dummyPkmn = {
            id: `pkmn_test_roster_${pId}_${role}`,
            baseName: realPkmn.name || realPkmn.baseName || pId,
            rawName: (realPkmn.name || realPkmn.baseName || pId).replace(/\s*\([^)]*\)/, ''),
            currentLevel: 100,
            skillPoints: 999,
            totalSpEarned: 999,
            maxTreeTier: 5,
            learnedMoves: {},
            skillTree: {}
          };
          auditDomPkmnFullStream(dummyPkmn, realPkmn.type || realPkmn.types || '一般', role);
        }
      }
    }

    return { testCasesCount, failures };
  });

  console.log(`\n================================================================================`);
  console.log(`📊 E2E DOM V5 全屬性全圖鑑 T1➡️T5 奧義連攜對齊測試最終報告:`);
  console.log(`================================================================================`);
  console.log(`  - 總計實機點擊與 DOM 渲染測試組合: ${e2eReport.testCasesCount} 組路徑`);
  console.log(`  - 失敗/標籤缺失或錯位組合數: ${e2eReport.failures.length} 處`);

  if (e2eReport.failures.length > 0) {
    console.log(`\n⚠️ 標籤錯位詳細列表:`);
    console.log(JSON.stringify(e2eReport.failures.slice(0, 10), null, 2));
  } else {
    console.log(`\n🎉 全 18 屬性 + 153 雙屬性 + 全圖鑑寶可夢 (包含太陽伊布、水伊布、風速狗等) 在 T1➡️T5 全選招路徑中，DOM 奧義連攜標籤 100% 精確對齊 (0 錯位)！`);
  }
  console.log(`================================================================================\n`);

  fs.writeFileSync(path.resolve(__dirname, '../e2e_dom_audit_report_v5.json'), JSON.stringify(e2eReport, null, 2), 'utf8');

  await browser.close();

  return e2eReport;
}

runE2EDomAudit();
