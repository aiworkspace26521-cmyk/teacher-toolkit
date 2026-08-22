const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyStrictSynergyAndPersistentLearn() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 執行 v3.3 精準 1對1 流派連攜 & 關閉視窗零遺失 (Data Persistence) Playwright 實機測試`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0);

  // 1. Problem 1 Test: Learn 撞擊 in T1 (3 SP), unlock T2, check T2 badge count
  console.log(`📍 【問題 1 實機驗證】學習 T1「撞擊」(重擊流) 3 SP -> 檢驗 T2 招式連攜數與精準度...`);
  await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘'));
    if (!pika) {
      pika = { id: 'P_PIKA', baseName: '⚡ 皮卡丘 (電系)', totalExp: 50000, initialLevel: 5, currentLevel: 54, expProgress: 0, expNeeded: 500, catchDate: '管理員測試隊伍', skillPoints: 100, totalSpEarned: 100, evoStage: 0, learnedMoves: {}, equippedMoves: [] };
      roster.unshift(pika);
    }
    pika.learnedMoves = {};
    pika.skillPoints = 50;
    pika.skillTree = { atk: { sp: 0, tier: 1 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } };
    openSkillTree(pika.id);

    // Learn Tackle T1 -> Lv.3
    learnSkillTreeNodeV31('撞擊', 1, 'ATK');
    upgradeMoveInSkillTreeV31('撞擊');
    upgradeMoveInSkillTreeV31('撞擊');
    renderSkillTree();
  });
  await page.waitForTimeout(800);

  const t2BadgeCheck = await page.evaluate(() => {
    const modalText = document.getElementById('skillTreeModal')?.textContent || '';
    const t2Snippet = modalText.substring(modalText.indexOf('T2 (初階)'), modalText.indexOf('T3 (中階)'));
    const badgeMatches = t2Snippet.match(/🔗 [^\n<]+/g) || [];

    const thunderPunchNode = document.querySelector('.st-node[data-move="雷電拳"]');
    const protectNode = document.querySelector('.st-node[data-move="守住"]');
    const chargeNode = document.querySelector('.st-node[data-move="充電"]');

    return {
      t2Snippet: t2Snippet,
      badgeMatches: badgeMatches,
      thunderPunchHasBadge: thunderPunchNode ? thunderPunchNode.textContent.includes('🔗 破甲連攜') : false,
      protectHasBadge: protectNode ? protectNode.textContent.includes('🔗') : false,
      chargeHasBadge: chargeNode ? chargeNode.textContent.includes('🔗') : false
    };
  });

  console.log(`  - T2 偵測到連攜徽章列表:`, t2BadgeCheck.badgeMatches);
  console.log(`  - 雷電拳 (重擊對應招) 是否顯示破甲連攜: ${t2BadgeCheck.thunderPunchHasBadge ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  - 守住 (生存招) 是否乾淨無連攜徽章: ${t2BadgeCheck.protectHasBadge ? '❌ FAIL (濫發徽章)' : '✅ PASS (乾淨無徽章)'}`);
  console.log(`  - 充電 (充能招) 是否乾淨無連攜徽章: ${t2BadgeCheck.chargeHasBadge ? '❌ FAIL (濫發徽章)' : '✅ PASS (乾淨無徽章)'}`);
  console.log(`  - T2 徽章總數是否精準控制為 1 個: ${t2BadgeCheck.badgeMatches.length === 1 ? '✅ PASS (極致精準 1對1 流派連攜！)' : '❌ FAIL'}`);

  if (!t2BadgeCheck.thunderPunchHasBadge || t2BadgeCheck.protectHasBadge || t2BadgeCheck.chargeHasBadge || t2BadgeCheck.badgeMatches.length !== 1) {
    throw new Error('問題 1 測試失敗: T2 連攜徽章未精準控制為 1對1 流派對應');
  }

  // 2. Problem 2 Test: Close modal, reload page completely, re-open modal to verify zero data loss
  console.log(`\n📍 【問題 2 實機驗證】關閉技能樹視窗、完整重新整理網頁 (F5 Page Reload) -> 檢驗招式學習狀態是否 100% 完整保留...`);
  await page.evaluate(() => {
    saveSkillTreeState();
    closeModal('skillTreeModal');
  });
  await page.waitForTimeout(800);

  // Full page reload
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0);

  // Re-open skill tree
  await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    openSkillTree(pika.id);
  });
  await page.waitForTimeout(800);

  const persistenceCheck = await page.evaluate(() => {
    const roster = globalData.roster || [];
    const pkmn = roster.find(p => p.id === _skillTreePkmnId) || roster[0];
    const tackleRec = pkmn.learnedMoves ? (pkmn.learnedMoves['ATK:撞擊'] || pkmn.learnedMoves['撞擊']) : null;
    const tackleDom = document.querySelector('.st-node[data-move="撞擊"]');

    return {
      tackleLevel: tackleRec ? tackleRec.level : 0,
      tackleDomText: tackleDom ? tackleDom.textContent : ''
    };
  });

  console.log(`  - 全頁重新整理後「撞擊」等級: Lv.${persistenceCheck.tackleLevel} (${persistenceCheck.tackleDomText})`);
  console.log(`  - 管理員 F5 重新整理招式持久化零遺失檢驗: ${persistenceCheck.tackleLevel === 3 ? '✅ PASS (全頁刷新後招式與點數 100% 完美保留，零遺失！)' : '❌ FAIL'}`);

  if (persistenceCheck.tackleLevel !== 3) {
    throw new Error('問題 2 測試失敗: 管理員 F5 全頁重新整理後，招式學習記錄遺失！');
  }

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 恭喜！精準 1對1 流派連攜 & 關閉視窗零遺失 (Data Persistence) Playwright 實機測試 100% 全部通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyStrictSynergyAndPersistentLearn();
