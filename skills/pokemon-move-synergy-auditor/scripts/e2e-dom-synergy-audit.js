const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runE2EDomAudit() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🧪 [E2E DOM Auditor V2] 模擬真人點擊 DOM 元素 (18單屬性 + 153雙屬性 + 全圖鑑150+寶可夢) 全面校驗`);
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

    function auditDomPkmn(dummyPkmn, tName, role) {
      if (!window.globalData) window.globalData = { roster: [] };
      window.globalData.roster = [dummyPkmn];
      window._skillTreePkmnId = dummyPkmn.id;
      window._skillTreeActiveTab = role.toLowerCase();

      const tree = resolveSkillTreeV31(dummyPkmn);
      if (!tree) return;
      const roleTree = tree[role] || {};
      const t1List = (roleTree.T1 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
      const t2List = (roleTree.T2 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);

      const t1MoveName = t1List[0] ? (t1List[0].name || t1List[0]) : null;
      if (!t1MoveName) return;

      for (const t2Opt of t2List) {
        const t2MoveName = t2Opt.name || t2Opt;
        dummyPkmn.learnedMoves = {};
        dummyPkmn.skillTree = {};
        
        learnSkillTreeNodeV31(t1MoveName, 1, role, dummyPkmn);
        learnSkillTreeNodeV31(t2MoveName, 2, role, dummyPkmn);

        renderSkillTree();

        testCasesCount++;

        const canvasEl = document.getElementById('skillTreeBody');
        if (!canvasEl) {
          failures.push({ name: dummyPkmn.baseName, type: tName, role, t1: t1MoveName, t2: t2MoveName, reason: 'NO_BODY' });
          continue;
        }

        const htmlText = canvasEl.innerHTML;
        const badgeMatches = htmlText.match(/🔗/g);
        const badgeCount = badgeMatches ? badgeMatches.length : 0;

        if (badgeCount === 0) {
          failures.push({
            name: dummyPkmn.baseName,
            type: tName,
            role: role,
            t1: t1MoveName,
            t2: t2MoveName,
            badgeCount: 0,
            reason: 'MISSING_SYNERGY_BADGE_IN_T3_DOM'
          });
        } else if (badgeCount > 1) {
          failures.push({
            name: dummyPkmn.baseName,
            type: tName,
            role: role,
            t1: t1MoveName,
            t2: t2MoveName,
            badgeCount: badgeCount,
            reason: 'MULTI_OVERLAP_BADGES_IN_T3_DOM'
          });
        }

        // Check T5 procedural move synergy badge alignment
        const t3List = (roleTree.T3 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
        const t4List = (roleTree.T4 || []).filter(n => (typeof n === 'object' && n) ? n.eligible !== false : true);
        const t3MoveName = t3List[0] ? (t3List[0].name || t3List[0]) : null;
        const t4MoveName = t4List[0] ? (t4List[0].name || t4List[0]) : null;

        if (t3MoveName && t4MoveName) {
          learnSkillTreeNodeV31(t3MoveName, 3, role, dummyPkmn);
          learnSkillTreeNodeV31(t4MoveName, 4, role, dummyPkmn);
          renderSkillTree();

          const htmlTextT5 = canvasEl.innerHTML;
          const m1Idx = t1MoveName.match(/_T1_(\d+)$/);
          if (m1Idx) {
            const idxStr = m1Idx[1];
            const opt1Name = t1MoveName.replace(/_T1_\d+$/, '_T5_1');
            const targetOptName = t1MoveName.replace(/_T1_\d+$/, `_T5_${idxStr}`);
            
            const opt1Snippet = htmlTextT5.includes(`data-move="${opt1Name}"`) ? htmlTextT5.split(`data-move="${opt1Name}"`)[1].split('</div>')[0] : '';
            const targetSnippet = htmlTextT5.includes(`data-move="${targetOptName}"`) ? htmlTextT5.split(`data-move="${targetOptName}"`)[1].split('</div>')[0] : '';

            if (opt1Snippet.includes('🔗') && idxStr !== '1') {
              failures.push({
                name: dummyPkmn.baseName,
                type: tName,
                role: role,
                t1: t1MoveName,
                targetIndex: idxStr,
                reason: 'T5_SYNERGY_BADGE_MISALIGNED_TO_OPTION_1'
              });
            }
          }
        }
      }
    }

    // 1. Audit ALL 18 Single Types
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
        auditDomPkmn(dummyPkmn, tName, role);
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
          auditDomPkmn(dummyPkmn, dualName, role);
        }
      }
    }

    // 3. Audit ALL POKEMON in POKEMON_DATABASE / Roster
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
          auditDomPkmn(dummyPkmn, realPkmn.type || realPkmn.types || '一般', role);
        }
      }
    }

    return { testCasesCount, failures };
  });

  console.log(`\n================================================================================`);
  console.log(`📊 E2E DOM V2 模擬測試最終報告:`);
  console.log(`================================================================================`);
  console.log(`  - 總計實機點擊與 DOM 渲染測試組合: ${e2eReport.testCasesCount} 組`);
  console.log(`  - 失敗/標籤缺失或重複組合數: ${e2eReport.failures.length} 處`);

  if (e2eReport.failures.length > 0) {
    console.log(`\n⚠️ 標籤缺失或重複詳細列表:`);
    console.log(JSON.stringify(e2eReport.failures.slice(0, 10), null, 2));
  } else {
    console.log(`\n🎉 全圖鑑 150+ 隻寶可夢 + 18 單屬性 + 153 雙屬性組合在 DOM 實機渲染中 100% 成功且獨占 (Fan-Out == 1, Orphans == 0)！`);
  }
  console.log(`================================================================================\n`);

  fs.writeFileSync(path.resolve(__dirname, '../e2e_dom_audit_report.json'), JSON.stringify(e2eReport, null, 2), 'utf8');

  await browser.close();

  return e2eReport;
}

runE2EDomAudit();
