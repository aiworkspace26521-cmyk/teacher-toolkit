const { chromium } = require('playwright');

(async () => {
  console.log('================================================================================');
  console.log('🧪 驗證：指定槽位替換 (Direct Slot Swap Replacement)');
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
          '水槍': { level: 3, name: '水槍', role: 'ATK', tier: 1 },
          '泡沫光線': { level: 1, name: '泡沫光線', role: 'ATK', tier: 2 }
        },
        equippedMoves: ['水槍']
      };

      window.globalData = { studentId: 'Admin', roster: [pkmn], partyIds: ['P3'] };
      _skillTreePkmnId = 'P3';
      _showEquipEditor = true;

      if (typeof openSkillTree === 'function') openSkillTree('P3');
      if (typeof renderEquipEditor === 'function') renderEquipEditor(pkmn);

      // Select Slot 1 for replace (slotIdx = 0)
      selectSlotForReplace(0);
      const isSlotSelected = _selectedSlotForReplace === 0;

      // Directly replace Slot 1 with '泡沫光線'
      assignMoveToSlot('泡沫光線', 0);
      const updatedEquipped = pkmn.equippedMoves;

      return {
        isSlotSelected: isSlotSelected,
        updatedEquipped: updatedEquipped,
        firstSlotIsBubbleBeam: updatedEquipped[0] === '泡沫光線'
      };
    });

    console.log('📊 測試結果:', auditResult);
    if (auditResult.isSlotSelected && auditResult.firstSlotIsBubbleBeam) {
      console.log('🎉 [✅ PASS] 指定槽位替換功能 100% 成功運作！Slot 1 已由【水槍】替換為【泡沫光線】！');
    } else {
      console.error('❌ 測試失敗:', auditResult);
    }

  } catch (err) {
    console.error('❌ 測試發生異常:', err);
  } finally {
    await browser.close();
  }
})();
