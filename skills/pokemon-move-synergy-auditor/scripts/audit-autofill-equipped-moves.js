const { chromium } = require('playwright');

(async () => {
  console.log('================================================================================');
  console.log('🧪 驗證：裝備少量招式時自動由種族預設招式補足至 4 招（保障玩家不遺失預設招）');
  console.log('================================================================================\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const fileUrl = 'file:///G:/%E6%88%91%E7%9A%84%E4%BA%91%E7%AB%AF%E7%A1%AC%E7%9B%98/teacher-toolkit/tools/learning-kpi-dashboard/frontend/kpi-dashboard.html';
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const auditResult = await page.evaluate(() => {
      const pkmn = {
        id: 'P3',
        baseName: '💧 水伊布 (水系)',
        currentLevel: 23,
        learnedMoves: {
          '水槍': { level: 3, name: '水槍', role: 'ATK', tier: 1 }
        },
        equippedMoves: ['水槍'] // 玩家僅手動勾選裝備 1 招【水槍】
      };

      window.globalData = { studentId: 'Admin', roster: [pkmn], partyIds: ['P3'] };

      if (typeof openPkmnDetail === 'function') {
        openPkmnDetail('P3');
      }

      const body = document.getElementById('pkmnDetailBody');
      const text = body ? body.innerText : '';
      const moveCards = body ? Array.from(body.querySelectorAll("div[style*='background:white']")).map(d => d.innerText.split('\n')[0]) : [];

      return {
        modalVisible: document.getElementById('pkmnDetailModal').style.display !== 'none',
        moveCount: moveCards.length,
        movesInModal: moveCards,
        firstMove: moveCards[0]
      };
    });

    console.log('📊 測試結果:', auditResult);
    if (auditResult.moveCount === 4 && auditResult.firstMove === '水槍') {
      console.log('🎉 [✅ PASS] 水槍優先作為第 1 招，其餘 3 招已自動補足，總招式數確為 4 招！');
    } else {
      console.error('❌ 測試失敗:', auditResult);
    }

  } catch (err) {
    console.error('❌ 測試發生異常:', err);
  } finally {
    await browser.close();
  }
})();
