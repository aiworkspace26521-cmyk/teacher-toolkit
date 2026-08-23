const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runDetailModalUxAudit() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../tools/learning-kpi-dashboard/frontend/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🧪 [UX DOM Auditor] 模擬玩家點擊能力值詳情 Modal 檢體 FP 能量上限與招式 FP 消耗標籤`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const auditReport = await page.evaluate(async () => {
    window.globalData = {
      studentId: 'test_student',
      roster: [
        { id: 'p1', baseName: '小火龍 (火系)', currentLevel: 5, initialLevel: 5, totalExp: 0, expProgress: 0, expNeeded: 100, happiness: 50, catchDate: '2026/08/23' },
        { id: 'p2', baseName: '風速狗 (火系)', currentLevel: 50, initialLevel: 5, totalExp: 5000, expProgress: 200, expNeeded: 1000, happiness: 100, catchDate: '2026/08/20' },
        { id: 'p3', baseName: '太陽伊布 (超能力系)', currentLevel: 90, initialLevel: 5, totalExp: 20000, expProgress: 500, expNeeded: 2000, happiness: 120, catchDate: '2026/08/15' }
      ],
      partyIds: ['p1', 'p2', 'p3']
    };

    const results = [];
    const testIds = ['p1', 'p2', 'p3'];

    for (const pid of testIds) {
      const pkmn = window.globalData.roster.find(p => p.id === pid);
      openPkmnDetail(pid);
      const modal = document.getElementById('pkmnDetailModal');
      const body = document.getElementById('pkmnDetailBody');
      const htmlText = body ? body.innerHTML : '';

      const expectedMaxFp = typeof calcMaxFp !== 'undefined' ? calcMaxFp(pkmn.currentLevel) : (100 + pkmn.currentLevel * 3);
      const hasMaxFpBadge = htmlText.includes(`FP上限`) || htmlText.includes(`FP ${expectedMaxFp}`) || htmlText.includes(`${expectedMaxFp} FP`);

      // Check if move cards contain FP cost labels
      const moveCards = body ? body.querySelectorAll('div[style*="background:white"]') : [];
      let movesWithFpCount = 0;
      moveCards.forEach(card => {
        if (card.textContent.includes('FP') || card.innerHTML.includes('FP')) {
          movesWithFpCount++;
        }
      });

      results.push({
        id: pid,
        name: pkmn.baseName,
        level: pkmn.currentLevel,
        expectedMaxFp: expectedMaxFp,
        modalDisplayed: modal && modal.style.display !== 'none',
        hasMaxFpBadge: hasMaxFpBadge,
        totalMoveCards: moveCards.length,
        movesWithFpCount: movesWithFpCount
      });
    }

    return results;
  });

  await browser.close();

  console.log(`\n================================================================================`);
  console.log(`📊 詳情 Modal UX Audit 測試結果:`);
  console.log(`================================================================================`);
  let passCount = 0;
  auditReport.forEach(item => {
    const isPass = item.modalDisplayed && item.hasMaxFpBadge && (item.totalMoveCards === 0 || item.movesWithFpCount === item.totalMoveCards);
    if (isPass) passCount++;
    console.log(`  [${isPass ? '✅ PASS' : '❌ FAIL'}] ${item.name} (Lv.${item.level}) - 期望 Max FP: ${item.expectedMaxFp}`);
    console.log(`     - Modal 顯示: ${item.modalDisplayed}`);
    console.log(`     - FP 上限膠囊: ${item.hasMaxFpBadge ? 'Present ✅' : 'Missing ❌'}`);
    console.log(`     - 招式 FP 標籤覆蓋率: ${item.movesWithFpCount} / ${item.totalMoveCards}`);
  });

  console.log(`\n  Console 錯誤數: ${consoleErrors.length}`);
  console.log(`================================================================================\n`);

  return { passCount, total: auditReport.length, auditReport, consoleErrors };
}

runDetailModalUxAudit();
