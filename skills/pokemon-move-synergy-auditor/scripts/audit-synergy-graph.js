const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function auditSynergyGraph() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🔍 [pokemon-move-synergy-auditor] 18單屬性 + 153雙屬性組合 + 全圖鑑寶可夢 (無孤兒與無多發放) 100% 驗證`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const auditReport = await page.evaluate(() => {
    const roles = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
    const defRegex = /^守住$|^替身$|^充電$|^變硬$|^影子分身$|^哈欠$|^光牆$|^水流環$|^絕對防禦$/;
    const rosterOrphans = [];
    const rosterMultiOverlaps = [];

    function auditSkillTree(tree, pkmnName, pkmnTypeStr) {
      roles.forEach(r => {
        const roleTree = tree[r] || {};
        const t1List = roleTree.T1 || [];

        t1List.forEach(t1Opt => {
          const t1Name = t1Opt.name || t1Opt;
          let currentLearned = {};
          currentLearned[r + ':' + t1Name] = { name: t1Name, level: 3, tier: 1, role: r };

          for (let tier = 2; tier <= 5; tier++) {
            const tierList = roleTree['T' + tier] || [];
            const validTargets = tierList.filter(m => !defRegex.test(m.name || m));
            if (validTargets.length === 0) continue;

            let matchedMoves = [];
            validTargets.forEach(tOpt => {
              const targetName = tOpt.name || tOpt;
              const syn = calculateMoveSynergyV33(currentLearned, targetName, tier, r, pkmnTypeStr);
              if (syn) {
                matchedMoves.push({ targetName, badge: syn.badge });
              }
            });

            // 檢驗 1: 漸進解鎖不能無連攜 (Orphan == 0)
            if (matchedMoves.length === 0) {
              rosterOrphans.push({
                pkmn: pkmnName,
                type: pkmnTypeStr,
                role: r,
                tier: tier,
                learned: Object.keys(currentLearned)
              });
            }

            // 檢驗 2: 漸進解鎖連攜發放數必須 <= 1 (Over-coverage == 0，嚴格 1 對 1 獨占！)
            if (matchedMoves.length > 1) {
              rosterMultiOverlaps.push({
                pkmn: pkmnName,
                type: pkmnTypeStr,
                role: r,
                tier: tier,
                count: matchedMoves.length,
                matches: matchedMoves
              });
            }

            if (matchedMoves.length > 0) {
              const nextHead = matchedMoves[0].targetName;
              currentLearned[r + ':' + nextHead] = { name: nextHead, level: 3, tier: tier, role: r };
            }
          }
        });
      });
    }

    let auditedTreesCount = 0;

    // 1. Audit ALL POKEMON in POKEMON_DATABASE / Roster
    if (typeof POKEMON_DATABASE !== 'undefined') {
      Object.keys(POKEMON_DATABASE).forEach(pId => {
        const pkmn = POKEMON_DATABASE[pId];
        const tree = typeof resolveSkillTreeV31 === 'function' ? resolveSkillTreeV31(pkmn) : null;
        if (!tree) return;
        auditedTreesCount++;
        const pType = typeof getPokemonPrimaryType === 'function' ? getPokemonPrimaryType(pkmn) : (pkmn.type || pkmn.types || '一般');
        auditSkillTree(tree, pkmn.name || pkmn.baseName || pId, pType);
      });
    }

    // 2. Audit ALL 18 Single Types
    const singleTypes = Object.keys(TIER_MATRIX_V31);
    singleTypes.forEach(tName => {
      const dummyPkmn = { name: `單屬性_${tName}`, type: tName };
      const tree = typeof resolveSkillTreeV31 === 'function' ? resolveSkillTreeV31(dummyPkmn) : null;
      if (tree) {
        auditedTreesCount++;
        auditSkillTree(tree, dummyPkmn.name, tName);
      }
    });

    // 3. Audit ALL 153 Dual-Type Combinations
    for (let i = 0; i < singleTypes.length; i++) {
      for (let j = i + 1; j < singleTypes.length; j++) {
        const dualName = `${singleTypes[i]}/${singleTypes[j]}`;
        const dummyPkmn = { name: `雙屬性_${dualName}`, types: [singleTypes[i], singleTypes[j]] };
        const tree = typeof resolveSkillTreeV31 === 'function' ? resolveSkillTreeV31(dummyPkmn) : null;
        if (tree) {
          auditedTreesCount++;
          auditSkillTree(tree, dummyPkmn.name, dualName);
        }
      }
    }

    return { auditedTreesCount, rosterOrphans, rosterMultiOverlaps };
  });

  console.log(`\n================================================================================`);
  console.log(`📊 全圖鑑 + 18單屬性 + 153雙屬性組合 漸進式連攜 (1對1獨占) 稽核統計:`);
  console.log(`================================================================================`);
  console.log(`  - 總計校驗寶可夢與屬性樹數目: ${auditReport.auditedTreesCount} 棵技能樹`);
  console.log(`  - 漸進解鎖無連攜步驟 (Orphan Stream Steps): ${auditReport.rosterOrphans.length} 處`);
  console.log(`  - 漸進解鎖多發放步驟 (Over-coverage Steps > 1): ${auditReport.rosterMultiOverlaps.length} 處`);

  if (auditReport.rosterOrphans.length > 0) {
    console.log(`    ⚠️ 無連攜步驟詳情:`, JSON.stringify(auditReport.rosterOrphans.slice(0, 5), null, 2));
  }
  if (auditReport.rosterMultiOverlaps.length > 0) {
    console.log(`    ⚠️ 多發放步驟詳情:`, JSON.stringify(auditReport.rosterMultiOverlaps.slice(0, 5), null, 2));
  }

  console.log(`================================================================================\n`);

  fs.writeFileSync(path.resolve(__dirname, '../audit_report_18_types.json'), JSON.stringify(auditReport, null, 2), 'utf8');

  await browser.close();

  return { auditedTreesCount: auditReport.auditedTreesCount, orphanCount: auditReport.rosterOrphans.length, overCount: auditReport.rosterMultiOverlaps.length };
}

auditSynergyGraph();
