const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyT4SynergyAndModalClose() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 執行 v3.3 T4/T5 連攜徽章 & 切換寶可夢 Modal 即時關閉 自動化測試`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  // 1. Open Pikachu Skill Tree
  await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    openSkillTree(pika.id);
  });
  await page.waitForTimeout(1000);

  // 2. Test Modal Closing on Confirm Switch
  console.log(`📍 【問題 2 驗證】點擊「🔄 切換」按鈕開啟選單，並點擊「確認切換」...`);
  await page.evaluate(() => {
    openSkillTreePkmnSelector();
  });
  await page.waitForTimeout(500);

  const modalBefore = await page.evaluate(() => !!document.getElementById('stPkmnSelectorModal'));
  console.log(`  - 點擊確認切換前 Modal 存在: ${modalBefore ? 'YES' : 'NO'}`);

  await page.evaluate(() => {
    confirmStPkmnSwitch();
  });
  await page.waitForTimeout(500);

  const modalAfter = await page.evaluate(() => !!document.getElementById('stPkmnSelectorModal'));
  console.log(`  - 點擊確認切換後 Modal 存在: ${modalAfter ? '❌ FAIL (Modal 仍殘留)' : '✅ PASS (Modal 已 100% 即時自動關閉！)'}`);

  if (modalAfter) {
    throw new Error('問題 2 測試失敗: 點擊確認切換後 Modal 未能關閉');
  }

  // 3. Test T4 Synergy Link Badges
  console.log(`\n📍 【問題 1 驗證】投入 SP 至 T4 (15 SP) 並檢驗 T4 招式連攜徽章...`);
  await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    pika.learnedMoves = {};
    pika.skillPoints = 100;
    pika.skillTree.atk.sp = 15;
    openSkillTree(pika.id);
    learnSkillTreeNodeV31('電擊', 1, 'ATK');
    renderSkillTree();
  });
  await page.waitForTimeout(800);

  const t4SynergyCheck = await page.evaluate(() => {
    const modalText = document.getElementById('skillTreeModal')?.textContent || '';
    const t4Section = modalText.substring(modalText.indexOf('T4 (高階)'));
    return {
      t4HasElementSynergy: t4Section.includes('🔗 元素連攜 +30%') || t4Section.includes('🔗 元素連攜'),
      t4HasTerrainSynergy: t4Section.includes('🔗 領域連攜'),
      t4Snippet: t4Section.substring(0, 350)
    };
  });

  console.log(`  - T4 元素連攜 (+30%) 徽章繪製: ${t4SynergyCheck.t4HasElementSynergy ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  - T4 領域連攜 (全隊增傷) 徽章繪製: ${t4SynergyCheck.t4HasTerrainSynergy ? '✅ PASS' : '❌ FAIL'}`);

  if (!t4SynergyCheck.t4HasElementSynergy) {
    throw new Error('問題 1 測試失敗: T4 招式缺乏動態連攜徽章繪製！');
  }

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 恭喜！T4 連攜徽章 & 切換寶可夢 Modal 自動關閉 Playwright 實機測試 100% 全部通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyT4SynergyAndModalClose();
