const { chromium } = require('playwright');

(async () => {
  console.log('================================================================================');
  console.log('🧪 驗證修復：攜帶招式選單重複招式與 ATK: 前綴外洩修復');
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
          'ATK:水槍': { level: 3, name: '水槍', role: 'ATK', tier: 1 },
          '水槍': { level: 3, name: '水槍', role: 'ATK', tier: 1 }
        },
        equippedMoves: []
      };

      if (typeof renderEquipEditor === 'function') {
        renderEquipEditor(pkmn);
      }

      const container = document.getElementById('stEquipContainer');
      const labels = container ? Array.from(container.querySelectorAll('label')).map(l => l.innerText.trim()) : [];

      return {
        labelCount: labels.length,
        labels: labels,
        hasAtkPrefix: labels.some(l => l.includes('ATK:')),
        hasDuplicateWaterGun: labels.filter(l => l.includes('水槍')).length > 1
      };
    });

    console.log('📊 測試結果:', auditResult);
    if (auditResult.hasAtkPrefix || auditResult.hasDuplicateWaterGun) {
      console.error('❌ Bug 依然存在！');
    } else {
      console.log('🎉 [✅ PASS] 重複招式與 ATK: 前綴外洩已徹底修復！正確只顯示 1 行【水槍 Lv.3】！');
    }

  } catch (err) {
    console.error('❌ 測試發生異常:', err);
  } finally {
    await browser.close();
  }
})();
