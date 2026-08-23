const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function auditSynergyGraph() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🔍 [pokemon-move-synergy-auditor] 全 18 屬性 T1~T5 完整階層連攜圖譜自動化稽核`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const auditReport = await page.evaluate(() => {
    const allTypes = Object.keys(TIER_MATRIX_V31);
    const results = {};

    allTypes.forEach(typeName => {
      const typeTree = TIER_MATRIX_V31[typeName] || {};
      const roles = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];

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

      // Audit each tier from T2 to T5
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

        // 1. Orphan Moves (excluding defensive moves)
        const defRegex = /^守住$|^替身$|^充電$|^變硬$|^影子分身$|^哈欠$|^光牆$/;
        Object.keys(moveTriggeredCount).forEach(targetName => {
          if (moveTriggeredCount[targetName] === 0 && !defRegex.test(targetName)) {
            report.orphanMovesByTier[t].push(targetName);
          }
        });

        // 2. M-to-1 Overlaps (multiple T1 moves producing exact same badge for same target move)
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

        // 3. Over-Coverage (> 2 target moves triggered by single T1 move)
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

    return results;
  });

  // Print Summary Analysis for T2 ~ T5
  console.log(`\n================================================================================`);
  console.log(`📊 全 18 屬性 T2~T5 連攜審查數據全階層統計結果:`);
  console.log(`================================================================================`);

  let totalMTo1 = 0;
  let totalOverCoverage = 0;
  let totalOrphans = 0;

  Object.keys(auditReport).forEach(typeName => {
    const rep = auditReport[typeName];
    console.log(`\n【屬性: ${typeName}】`);
    for (let t = 2; t <= 5; t++) {
      const mTo1Count = rep.mTo1OverlapsByTier[t].length;
      const overCount = rep.overCoverageByTier[t].length;
      const orphanCount = rep.orphanMovesByTier[t].length;

      totalMTo1 += mTo1Count;
      totalOverCoverage += overCount;
      totalOrphans += orphanCount;

      console.log(`  - T${t} 階層: 重複映射 (M-to-1): ${mTo1Count} 處 | 過度發放 (Over-Coverage): ${overCount} 處 | 孤兒招式: ${orphanCount} 個`);
      if (overCount > 0) {
        console.log(`    ⚠️ T${t} 過度發放詳情:`, JSON.stringify(rep.overCoverageByTier[t]));
      }
      if (mTo1Count > 0) {
        console.log(`    ⚠️ T${t} 重複映射詳情:`, JSON.stringify(rep.mTo1OverlapsByTier[t]));
      }
    }
  });

  console.log(`\n================================================================================`);
  console.log(`📈 全階層總結統計: T2~T5 全矩陣掃描完畢`);
  console.log(`   - 總計多對一重複映射 (M-to-1 Overlaps): ${totalMTo1} 處`);
  console.log(`   - 總計單一T1過度發放 (Over-Coverage > 2): ${totalOverCoverage} 處`);
  console.log(`   - 總計無連攜孤兒招式 (Orphan Moves): ${totalOrphans} 個`);
  console.log(`================================================================================\n`);

  fs.writeFileSync(path.resolve(__dirname, '../audit_report_18_types.json'), JSON.stringify(auditReport, null, 2), 'utf8');

  await browser.close();

  return { totalMTo1, totalOverCoverage, totalOrphans };
}

auditSynergyGraph();
