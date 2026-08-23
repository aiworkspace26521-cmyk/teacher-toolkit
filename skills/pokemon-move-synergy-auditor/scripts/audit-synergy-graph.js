const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function auditSynergyGraph() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🔍 [pokemon-move-synergy-auditor] 全 18 屬性連攜圖譜、單一T1解鎖上限與孤兒招式自動化稽核`);
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
        t2Moves: [],
        t1ToSynergiesMap: {},
        orphanT2Moves: [],
        mTo1Overlaps: [],
        overCoverageT1: []
      };

      roles.forEach(r => {
        const roleData = typeTree[r] || {};
        const t1 = roleData.T1 || [];
        const t2 = roleData.T2 || [];

        t1.forEach(m => {
          if (!report.t1Moves.some(existing => existing.name === m)) {
            report.t1Moves.push({ name: m, role: r });
          }
        });

        t2.forEach(m => {
          if (!report.t2Moves.some(existing => existing.name === m)) {
            report.t2Moves.push({ name: m, role: r });
          }
        });
      });

      const moveTriggeredCount = {};
      report.t2Moves.forEach(m => moveTriggeredCount[m.name] = 0);

      report.t1Moves.forEach(t1Obj => {
        const t1Name = t1Obj.name;
        report.t1ToSynergiesMap[t1Name] = [];
        const fakeLearned = {};
        fakeLearned[t1Obj.role + ':' + t1Name] = { name: t1Name, level: 3, tier: 1, role: t1Obj.role };

        report.t2Moves.forEach(t2Obj => {
          const t2Name = t2Obj.name;
          const syn = calculateMoveSynergyV33(fakeLearned, t2Name, 2, t2Obj.role, typeName);
          if (syn) {
            report.t1ToSynergiesMap[t1Name].push({ target: t2Name, role: t2Obj.role, badge: syn.badge });
            moveTriggeredCount[t2Name] = (moveTriggeredCount[t2Name] || 0) + 1;
          }
        });
      });

      // 1. Find Orphan T2 moves (moves with 0 triggers from any T1 move)
      Object.keys(moveTriggeredCount).forEach(t2Name => {
        if (moveTriggeredCount[t2Name] === 0) {
          report.orphanT2Moves.push(t2Name);
        }
      });

      // 2. Find M-to-1 Overlaps (multiple distinct T1 moves producing the EXACT SAME badge for the SAME T2 target move)
      const badgeTargetMap = {};
      Object.keys(report.t1ToSynergiesMap).forEach(t1Name => {
        report.t1ToSynergiesMap[t1Name].forEach(synObj => {
          const key = synObj.target + '::' + synObj.badge;
          badgeTargetMap[key] = badgeTargetMap[key] || [];
          badgeTargetMap[key].push(t1Name);
        });
      });

      Object.keys(badgeTargetMap).forEach(key => {
        const sources = badgeTargetMap[key];
        if (sources.length > 1) {
          const parts = key.split('::');
          report.mTo1Overlaps.push({ target: parts[0], badge: parts[1], sources: sources });
        }
      });

      // 3. Find 1-to-N Over-coverage Violation (Single T1 move triggering > 2 T2 moves)
      Object.keys(report.t1ToSynergiesMap).forEach(t1Name => {
        const targets = report.t1ToSynergiesMap[t1Name];
        if (targets.length > 2) {
          report.overCoverageT1.push({
            t1Name: t1Name,
            count: targets.length,
            targets: targets.map(t => t.target + ' (' + t.badge + ')')
          });
        }
      });

      results[typeName] = report;
    });

    return results;
  });

  // Print Summary Analysis
  console.log(`\n================================================================================`);
  console.log(`📊 全 18 屬性連攜審查數據統計結果:`);
  console.log(`================================================================================`);

  let totalMTo1Overlaps = 0;
  let totalOrphans = 0;
  let totalOverCoverage = 0;

  Object.keys(auditReport).forEach(typeName => {
    const rep = auditReport[typeName];
    console.log(`\n【屬性: ${typeName}】`);
    console.log(`  - T1 招式 (${rep.t1Moves.length} 個):`, rep.t1Moves.map(m => m.name).join(', '));
    console.log(`  - T2 招式 (${rep.t2Moves.length} 個):`, rep.t2Moves.map(m => m.name).join(', '));
    console.log(`  - 重複映射 (M-to-1 Overlaps: ${rep.mTo1Overlaps.length}):`, rep.mTo1Overlaps.length > 0 ? JSON.stringify(rep.mTo1Overlaps) : '無');
    console.log(`  - 1對多泛濫連攜 (Over-Coverage >2: ${rep.overCoverageT1.length}):`, rep.overCoverageT1.length > 0 ? JSON.stringify(rep.overCoverageT1) : '無');
    console.log(`  - 孤兒 T2 招式 (Orphan T2: ${rep.orphanT2Moves.length}):`, rep.orphanT2Moves.length > 0 ? rep.orphanT2Moves.join(', ') : '無');

    totalMTo1Overlaps += rep.mTo1Overlaps.length;
    totalOverCoverage += rep.overCoverageT1.length;
    totalOrphans += rep.orphanT2Moves.length;
  });

  console.log(`\n================================================================================`);
  console.log(`📈 總結統計: 全 18 屬性掃描完畢`);
  console.log(`   - 總計多對一重複映射 (M-to-1 Overlaps): ${totalMTo1Overlaps} 處`);
  console.log(`   - 總計單一T1過度發放 (Over-Coverage >2): ${totalOverCoverage} 處`);
  console.log(`   - 總計無連攜孤兒 T2 招式 (Orphan T2 Moves): ${totalOrphans} 個`);
  console.log(`================================================================================\n`);

  fs.writeFileSync(path.resolve(__dirname, '../audit_report_18_types.json'), JSON.stringify(auditReport, null, 2), 'utf8');

  await browser.close();

  return { totalMTo1Overlaps, totalOverCoverage, totalOrphans };
}

auditSynergyGraph();
