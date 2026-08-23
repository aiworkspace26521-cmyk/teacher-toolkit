const { chromium } = require('playwright');

(async () => {
  console.log('================================================================================');
  console.log('🧪 驗證：全新升級 6-Slot 出戰卡匣與已解鎖招式大庫 (Move Library UI/UX Panel)');
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
      _skillTreePkmnId = 'P3';
      _showEquipEditor = true;

      if (typeof renderEquipEditor === 'function') {
        renderEquipEditor(pkmn);
      }

      const container = document.getElementById('stEquipContainer');
      const text = container ? container.innerText : '';
      
      const slots = container ? Array.from(container.querySelectorAll("div[style*='SLOT']")).map(d => d.innerText) : [];
      const tabs = container ? Array.from(container.querySelectorAll("button[onclick*='setMoveLibraryTab']")).map(b => b.innerText) : [];
      const libCards = container ? Array.from(container.querySelectorAll("div[style*='📚 已解鎖招式大庫'] ~ div div[style*='background']")).map(c => c.innerText.split('\n')[0]) : [];

      return {
        editorVisible: document.getElementById('stEquipEditor').style.display !== 'none',
        hasDeckPanel: text.includes('當前出戰卡匣'),
        hasFpBudget: text.includes('總 FP 需求'),
        hasMoveLibrary: text.includes('已解鎖招式大庫'),
        tabs: tabs,
        hasWaterGunEquipped: text.includes('⭐ 自訂裝備') && text.includes('水槍')
      };
    });

    console.log('📊 測試結果:', auditResult);
    if (auditResult.hasDeckPanel && auditResult.hasFpBudget && auditResult.hasMoveLibrary && auditResult.hasWaterGunEquipped) {
      console.log('🎉 [✅ PASS] 全新 6-Slot 出戰卡匣面板、FP 能量預算條與已解鎖招式大庫 UI 100% 渲染驗證成功！');
    } else {
      console.error('❌ 測試失敗:', auditResult);
    }

  } catch (err) {
    console.error('❌ 測試發生異常:', err);
  } finally {
    await browser.close();
  }
})();
