const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function auditSynergyGraph() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🔍 [pokemon-move-synergy-auditor] 全 18 屬性 + 全圖鑑真實寶可夢 T1~T5 自動化稽核`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const auditReport = await page.evaluate(() => {
    const allTypes = Object.keys(TIER_MATRIX_V31);
    const results = {};
    const roles = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
    const defRegex = /^守住$|^替身$|^充電$|^變硬$|^影子分身$|^哈欠$|^光牆$|^水流環$/;

    // 1. Audit Tier Matrix across 18 Types
    allTypes.forEach(typeName => {
      const typeTree = TIER_MATRIX_V31[typeName] || {};
      const report = {
        typeName: typeName,
        t1Moves: [],
        movesByTier: { 2: [], 3: [], 4: [], 5: [] },
        mTo1OverlapsByTier: { 2: [], 3: [], 4: [], 5: [] },
        overCoverageByTier: { 2: [], 3: [], 4: [], 5: [] },
        orphanMovesByTier: { 2: [], 3: [], 4: [], 5: [] }
      };

      for (let t = 1; t <= 5; t++) {
        roles.forEach(r => {
          const roleData = typeTree[r] || {};
          const moves = roleData['T' + t] || [];
          moves.forEach(m => {
            if (t === 1) {
              if (!report.t1Moves.some(existing => existing.name === m)) {
                report.t1Moves.push({ name: m, role: r });
              }
            } else {
              if (!report.movesByTier[t].some(existing => existing.name === m)) {
                report.movesByTier[t].push({ name: m, role: r });
              }
            }
          });
        });
      }

      for (let t = 2; t <= 5; t++) {
        const targetMoves = report.movesByTier[t];
        const moveTriggeredCount = {};
        targetMoves.forEach(m => moveTriggeredCount[m.name] = 0);

        const t1ToSynergiesMap = {};

        report.t1Moves.forEach(t1Obj => {
          const t1Name = t1Obj.name;
          t1ToSynergiesMap[t1Name] = [];
          const fakeLearned = {};
          fakeLearned[t1Obj.role + ':' + t1Name] = { name: t1Name, level: 3, tier: 1, role: t1Obj.role };

          targetMoves.forEach(targetObj => {
            const targetName = targetObj.name;
            const syn = calculateMoveSynergyV33(fakeLearned, targetName, t, targetObj.role, typeName);
            if (syn) {
              t1ToSynergiesMap[t1Name].push({ target: targetName, role: targetObj.role, badge: syn.badge });
              moveTriggeredCount[targetName] = (moveTriggeredCount[targetName] || 0) + 1;
            }
          });
        });

        Object.keys(moveTriggeredCount).forEach(targetName => {
          if (moveTriggeredCount[targetName] === 0 && !defRegex.test(targetName)) {
            report.orphanMovesByTier[t].push(targetName);
          }
        });

        const badgeTargetMap = {};
        Object.keys(t1ToSynergiesMap).forEach(t1Name => {
          t1ToSynergiesMap[t1Name].forEach(synObj => {
            const key = synObj.target + '::' + synObj.badge;
            badgeTargetMap[key] = badgeTargetMap[key] || [];
            badgeTargetMap[key].push(t1Name);
          });
        });

        Object.keys(badgeTargetMap).forEach(key => {
          const sources = badgeTargetMap[key];
          if (sources.length > 1) {
            const parts = key.split('::');
            report.mTo1OverlapsByTier[t].push({ target: parts[0], badge: parts[1], sources: sources });
          }
        });

        Object.keys(t1ToSynergiesMap).forEach(t1Name => {
          const targets = t1ToSynergiesMap[t1Name];
          if (targets.length > 2) {
            report.overCoverageByTier[t].push({
              t1Name: t1Name,
              count: targets.length,
              targets: targets.map(tgt => tgt.target + ' (' + tgt.badge + ')')
            });
          }
        });
      }

      results[typeName] = report;
    });

    // 2. Audit Real Roster Pokemon Trees (Vaporeon, Pikachu, Flareon, Jolteon, etc.)
    const rosterOrphans = [];
    if (typeof POKEMON_DATABASE !== 'undefined') {
      Object.keys(POKEMON_DATABASE).forEach(pId => {
        const pkmn = POKEMON_DATABASE[pId];
        const resolvedTree = typeof resolveSkillTreeV31 === 'function' ? resolveSkillTreeV31(pkmn) : null;
        if (!resolvedTree) return;

        roles.forEach(r => {
          const t1List = resolvedTree[r] ? resolvedTree[r].T1 : [];
          const t2List = resolvedTree[r] ? resolvedTree[r].T2 : [];

          t1List.forEach(t1Opt => {
            const t1Name = t1Opt.name || t1Opt;
            const fakeLearned = {};
            fakeLearned[r + ':' + t1Name] = { name: t1Name, level: 3, tier: 1, role: r };

            let triggeredCount = 0;
            t2List.forEach(t2Opt => {
              const t2Name = t2Opt.name || t2Opt;
              if (defRegex.test(t2Name)) return;
              const syn = calculateMoveSynergyV33(fakeLearned, t2Name, 2, r, pkmn.type || pkmn.types);
              if (syn) triggeredCount++;
            });

            if (triggeredCount === 0) {
              rosterOrphans.push({ pkmn: pkmn.name || pkmn.baseName, t1Name, role: r });
            }
          });
        });
      });
    }

    return { typeResults: results, rosterOrphans };
  });

  // Print Summary Analysis
  console.log(`\n================================================================================`);
  console.log(`📊 全 18 屬性與真實圖鑑寶可夢連攜審查結果:`);
  console.log(`================================================================================`);

  let totalMTo1 = 0;
  let totalOverCoverage = 0;
  let totalOrphans = 0;

  Object.keys(auditReport.typeResults).forEach(typeName => {
    const rep = auditReport.typeResults[typeName];
    for (let t = 2; t <= 5; t++) {
      totalMTo1 += rep.mTo1OverlapsByTier[t].length;
      totalOverCoverage += rep.overCoverageByTier[t].length;
      totalOrphans += rep.orphanMovesByTier[t].length;
    }
  });

  console.log(`  - 全 18 屬性矩陣多對一重複 (M-to-1): ${totalMTo1} 處`);
  console.log(`  - 全 18 屬性矩陣過度發放 (Over-Coverage): ${totalOverCoverage} 處`);
  console.log(`  - 全圖鑑真實寶可夢 (包含水伊布) 無連攜 T1 招式: ${auditReport.rosterOrphans.length} 個`);
  if (auditReport.rosterOrphans.length > 0) {
    console.log(`    ⚠️ 真實寶可夢無連攜詳情:`, JSON.stringify(auditReport.rosterOrphans));
  }

  console.log(`================================================================================\n`);

  fs.writeFileSync(path.resolve(__dirname, '../audit_report_18_types.json'), JSON.stringify(auditReport, null, 2), 'utf8');

  await browser.close();

  return { totalMTo1, totalOverCoverage, rosterOrphansCount: auditReport.rosterOrphans.length };
}

auditSynergyGraph();
