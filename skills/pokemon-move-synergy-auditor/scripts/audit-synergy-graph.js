const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function auditSynergyGraph() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🔍 [pokemon-move-synergy-auditor] 全圖鑑漸進式流派升級 (T1➡️T2➡️T3➡️T4➡️T5) 自動化稽核`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const auditReport = await page.evaluate(() => {
    const roles = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
    const defRegex = /^守住$|^替身$|^充電$|^變硬$|^影子分身$|^哈欠$|^光牆$|^水流環$/;
    const rosterOrphans = [];
    const rosterMultiOverlaps = [];

    if (typeof POKEMON_DATABASE !== 'undefined') {
      Object.keys(POKEMON_DATABASE).forEach(pId => {
        const pkmn = POKEMON_DATABASE[pId];
        const tree = typeof resolveSkillTreeV31 === 'function' ? resolveSkillTreeV31(pkmn) : null;
        if (!tree) return;

        roles.forEach(r => {
          const roleTree = tree[r] || {};
          const t1List = roleTree.T1 || [];

          t1List.forEach(t1Opt => {
            const t1Name = t1Opt.name || t1Opt;
            let currentLearned = {};
            currentLearned[r + ':' + t1Name] = { name: t1Name, level: 3, tier: 1, role: r };

            // Simulate progression through T2, T3, T4, T5
            for (let tier = 2; tier <= 5; tier++) {
              const tierList = roleTree['T' + tier] || [];
              const validTargets = tierList.filter(m => !defRegex.test(m.name || m));
              if (validTargets.length === 0) continue;

              let matchedMoves = [];
              validTargets.forEach(tOpt => {
                const targetName = tOpt.name || tOpt;
                const syn = calculateMoveSynergyV33(currentLearned, targetName, tier, r, pkmn.type || pkmn.types);
                if (syn) {
                  matchedMoves.push({ targetName, badge: syn.badge });
                }
              });

              // Check 1: Must have AT LEAST 1 synergy move in target tier (No Orphans)
              if (matchedMoves.length === 0) {
                rosterOrphans.push({
                  pkmn: pkmn.name || pkmn.baseName,
                  role: r,
                  tier: tier,
                  learned: Object.keys(currentLearned)
                });
              }

              // Check 2: Must NOT have > 2 synergy moves in target tier (No Over-coverage)
              if (matchedMoves.length > 2) {
                rosterMultiOverlaps.push({
                  pkmn: pkmn.name || pkmn.baseName,
                  role: r,
                  tier: tier,
                  count: matchedMoves.length,
                  matches: matchedMoves
                });
              }

              // Advance to next stream head (learn the first matched move for next tier test)
              if (matchedMoves.length > 0) {
                const nextHead = matchedMoves[0].targetName;
                currentLearned[r + ':' + nextHead] = { name: nextHead, level: 3, tier: tier, role: r };
              }
            }
          });
        });
      });
    }

    return { rosterOrphans, rosterMultiOverlaps };
  });

  console.log(`\n================================================================================`);
  console.log(`📊 全圖鑑真實寶可夢 (含水伊布、皮卡丘) 漸進式流派升級測試結果:`);
  console.log(`================================================================================`);
  console.log(`  - 漸進解鎖無連攜 (Orphan Stream Steps): ${auditReport.rosterOrphans.length} 處`);
  console.log(`  - 漸進解鎖過度發放 (Over-coverage Steps): ${auditReport.rosterMultiOverlaps.length} 處`);

  if (auditReport.rosterOrphans.length > 0) {
    console.log(`    ⚠️ 無連攜步驟詳情:`, JSON.stringify(auditReport.rosterOrphans, null, 2));
  }
  if (auditReport.rosterMultiOverlaps.length > 0) {
    console.log(`    ⚠️ 過度發放步驟詳情:`, JSON.stringify(auditReport.rosterMultiOverlaps, null, 2));
  }

  console.log(`================================================================================\n`);

  fs.writeFileSync(path.resolve(__dirname, '../audit_report_18_types.json'), JSON.stringify(auditReport, null, 2), 'utf8');

  await browser.close();

  return { orphanCount: auditReport.rosterOrphans.length, overCount: auditReport.rosterMultiOverlaps.length };
}

auditSynergyGraph();
