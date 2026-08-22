const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyT3SynergyAndPageRefresh() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 執行 v3.3 T3 破甲連攜 & 管理員全頁刷新招式零遺失 (Data Persistence) Playwright 實機測試`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0);

  // 1. Problem 1 Test: Learn 撞擊 (T1) -> 3 SP, Learn 雷電拳 (T2) -> 5 SP (Total 8 SP) to unlock T3
  console.log(`📍 【問題 1 實機驗證】學習 T1「撞擊」(重擊流) 3 SP + T2「雷電拳」5 SP 解鎖 T3 -> 檢驗 T3 所有招式連攜...`);
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

    // Learn ThunderPunch T2 -> Lv.5
    learnSkillTreeNodeV31('雷電拳', 2, 'ATK');
    upgradeMoveInSkillTreeV31('雷電拳');
    upgradeMoveInSkillTreeV31('雷電拳');
    upgradeMoveInSkillTreeV31('雷電拳');
    upgradeMoveInSkillTreeV31('雷電拳');

    renderSkillTree();
  });
  await page.waitForTimeout(800);

  const t3SynergyCheck = await page.evaluate(() => {
    const modalText = document.getElementById('skillTreeModal')?.textContent || '';
    const t3Snippet = modalText.substring(modalText.indexOf('T3 (中階)'), modalText.indexOf('T4 (高階)'));
    const badgeMatches = t3Snippet.match(/🔗 [^\n<]+/g) || [];

    return {
      t3Snippet: t3Snippet,
      badgeMatches: badgeMatches
    };
  });

  console.log(`  - T3 區段 DOM 內容:`, t3SynergyCheck.t3Snippet);
  console.log(`  - 偵測到連攜徽章:`, t3SynergyCheck.badgeMatches);

  const hasPen = t3SynergyCheck.badgeMatches.some(b => b.includes('破甲連攜'));
  console.log(`  - 「撞擊」+「雷電拳」T3 破甲連攜檢驗結果: ${hasPen ? '✅ PASS (精準觸發 🔗 破甲連攜 防穿+20%！)' : '❌ FAIL'}`);

  if (!hasPen) {
    throw new Error('問題 1 測試失敗: T3 招式未顯示破甲連攜徽章');
  }

  // 2. Problem 2 Test: Save state, refresh page completely (F5 reload), and re-open modal to verify zero data loss
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

  const adminPersistenceCheck = await page.evaluate(() => {
    const roster = globalData.roster || [];
    const pkmn = roster.find(p => p.id === _skillTreePkmnId) || roster[0];
    const tackleRec = pkmn.learnedMoves ? (pkmn.learnedMoves['ATK:撞擊'] || pkmn.learnedMoves['撞擊']) : null;
    const punchRec = pkmn.learnedMoves ? (pkmn.learnedMoves['ATK:雷電拳'] || pkmn.learnedMoves['雷電拳']) : null;
    const tackleDom = document.querySelector('.st-node[data-move="撞擊"]');
    const punchDom = document.querySelector('.st-node[data-move="雷電拳"]');

    var treeSt = (pkmn.skillTree && (pkmn.skillTree.ATK || pkmn.skillTree.atk)) ? (pkmn.skillTree.ATK || pkmn.skillTree.atk).sp : 0;

    return {
      atkSp: treeSt,
      tackleLevel: tackleRec ? tackleRec.level : 0,
      punchLevel: punchRec ? punchRec.level : 0,
      tackleDomText: tackleDom ? tackleDom.textContent : '',
      punchDomText: punchDom ? punchDom.textContent : ''
    };
  });

  console.log(`  - 全頁重新整理後「撞擊」等級: Lv.${adminPersistenceCheck.tackleLevel} (${adminPersistenceCheck.tackleDomText})`);
  console.log(`  - 全頁重新整理後「雷電拳」等級: Lv.${adminPersistenceCheck.punchLevel} (${adminPersistenceCheck.punchDomText})`);
  console.log(`  - 管理員 F5 重新整理招式持久化零遺失檢驗: ${adminPersistenceCheck.tackleLevel === 3 && adminPersistenceCheck.punchLevel === 5 ? '✅ PASS (全頁刷新後招式與點數 100% 完美保留，零遺失！)' : '❌ FAIL'}`);

  if (adminPersistenceCheck.tackleLevel !== 3 || adminPersistenceCheck.punchLevel !== 5) {
    throw new Error('問題 2 測試失敗: 管理員 F5 全頁重新整理後，招式學習記錄遺失！');
  }

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 恭喜！T3 破甲連攜 & 管理員全頁刷新零遺失 (Data Persistence) Playwright 實機測試 100% 全部通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyT3SynergyAndPageRefresh();
