const { chromium } = require('playwright');

(async () => {
  console.log('================================================================================');
  console.log('🧪 驗證：技能樹裝備招式 (equippedMoves) 於能力值詳情 Modal 精確同步顯示');
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
        equippedMoves: ['水槍']
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
        hasWaterGun: text.includes('水槍'),
        movesInModal: moveCards,
        bodyTextSnippet: text
      };
    });

    console.log('📊 測試結果:', auditResult);
    if (auditResult.hasWaterGun && auditResult.movesInModal.includes('水槍')) {
      console.log('🎉 [✅ PASS] 水伊布已裝備之【水槍】招式成功 100% 顯示於能力值詳情 Modal 中！');
    } else {
      console.error('❌ 測試失敗：詳情 Modal 依然未顯示裝備招式【水槍】');
    }

  } catch (err) {
    console.error('❌ 測試發生異常:', err);
  } finally {
    await browser.close();
  }
})();
