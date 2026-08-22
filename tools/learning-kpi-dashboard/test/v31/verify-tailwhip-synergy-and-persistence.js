const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyTailwhipSynergyAndPersistence() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 執行 v3.3 甩尾破防連攜 & 關閉視窗零遺失 (Data Persistence) Playwright 實機測試`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  // 1. Problem 1 Test: Learn 甩尾 in T1 and inspect T2 synergy badges
  console.log(`📍 【問題 1 實機驗證】學習 T1「甩尾」(弱點降防流) Lv.3 (3 SP) -> 檢驗 T2 物理招式破防連攜...`);
  await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    pika.learnedMoves = {};
    pika.skillPoints = 50;
    pika.skillTree = { atk: { sp: 3, tier: 2 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } };
    openSkillTree(pika.id);
    learnSkillTreeNodeV31('甩尾', 1, 'ATK');
    upgradeMoveInSkillTreeV31('甩尾');
    upgradeMoveInSkillTreeV31('甩尾');
    renderSkillTree();
  });
  await page.waitForTimeout(800);

  const tailwhipT2Check = await page.evaluate(() => {
    const thunderPunch = document.querySelector('.st-node[data-move="雷電拳"]');
    const voltTackle = document.querySelector('.st-node[data-move="伏特攻擊"]');
    const chargeNode = document.querySelector('.st-node[data-move="充電"]');

    return {
      thunderPunchText: thunderPunch ? thunderPunch.textContent : '',
      voltTackleText: voltTackle ? voltTackle.textContent : '',
      hasArmorBreakBadge: thunderPunch ? thunderPunch.textContent.includes('🔗 破防連攜') : false,
      hasChargeBadge: chargeNode ? chargeNode.textContent.includes('🔗 蓄能連攜') : false
    };
  });

  console.log(`  - 雷電拳 (物理打擊) 破防連攜文字: ${tailwhipT2Check.thunderPunchText}`);
  console.log(`  - 伏特攻擊 (物理打擊) 破防連攜文字: ${tailwhipT2Check.voltTackleText}`);
  console.log(`  - 「甩尾」T2 破防連攜檢驗結果: ${tailwhipT2Check.hasArmorBreakBadge ? '✅ PASS (精準觸發 🔗 破防連攜 物理傷+20%！)' : '❌ FAIL'}`);

  if (!tailwhipT2Check.hasArmorBreakBadge) {
    throw new Error('問題 1 測試失敗: 「甩尾」學習後 T2 物理招式未顯示破防連攜徽章');
  }

  // 2. Problem 2 Test: Close modal, save state, and re-open modal to verify zero data loss
  console.log(`\n📍 【問題 2 實機驗證】關閉技能樹分頁並重新進入 -> 檢驗招式學習狀態與 SP 點數是否 100% 完整保留...`);
  await page.evaluate(() => {
    saveSkillTreeState();
    closeModal('skillTreeModal');
  });
  await page.waitForTimeout(800);

  // Re-open skill tree
  await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    openSkillTree(pika.id);
  });
  await page.waitForTimeout(800);

  const persistenceCheck = await page.evaluate(() => {
    const pkmn = getPkmnById(_skillTreePkmnId);
    const rec = getLearnedMoveRecord(pkmn, '甩尾', 'ATK');
    const tailwhipDom = document.querySelector('.st-node[data-move="甩尾"]');
    return {
      atkSp: pkmn.skillTree.atk ? pkmn.skillTree.atk.sp : 0,
      learnedLevel: rec ? rec.level : 0,
      domText: tailwhipDom ? tailwhipDom.textContent : ''
    };
  });

  console.log(`  - 重新進入後攻擊軌投入 SP: ${persistenceCheck.atkSp}`);
  console.log(`  - 重新進入後「甩尾」等級: Lv.${persistenceCheck.learnedLevel}`);
  console.log(`  - DOM 節點文字呈現: ${persistenceCheck.domText}`);
  console.log(`  - 招式持久化零遺失檢驗: ${persistenceCheck.atkSp === 6 && persistenceCheck.learnedLevel === 3 ? '✅ PASS (招式狀態 100% 完美保留，零遺失！)' : '❌ FAIL'}`);

  if (persistenceCheck.atkSp !== 6 || persistenceCheck.learnedLevel !== 3) {
    throw new Error('問題 2 測試失敗: 關閉技能樹後重新進入，學習狀態遺失！');
  }

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 恭喜！甩尾連攜 & 關閉分頁零遺失 (Data Persistence) Playwright 實機測試 100% 全部通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyTailwhipSynergyAndPersistence();
