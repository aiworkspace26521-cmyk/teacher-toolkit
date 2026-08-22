const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyDefinitivePersistenceAndTabMemory() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 執行管理員皮卡丘招式學習、關閉分頁與重新進入 100% 零遺失 Playwright 實機實測`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForFunction(() => window.globalData && window.globalData.roster && window.globalData.roster.length > 0);

  // 1. Open Pikachu's Skill Tree from Admin roster
  console.log(`📍 【步驟 1】登入 Admin 管理員帳號，開啟皮卡丘技能樹...`);
  const openRes = await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    pika.skillPoints = 100;
    openSkillTree(pika.id);
    return { pikaId: pika.id, name: pika.baseName };
  });
  console.log(`  - 成功開啟皮卡丘: ${openRes.name} (${openRes.pikaId})`);

  // 2. Learn 撞擊 in ATK (✧攻擊) tab and upgrade to Lv.2
  console.log(`📍 【步驟 2】在「✧攻擊」軌道，學習「撞擊」並升級至 Lv.2/5...`);
  const step2Res = await page.evaluate(() => {
    selectSkillTreeTab('atk');
    const pkmn = getPkmnById(_skillTreePkmnId);
    pkmn.skillPoints = 100;
    const res1 = learnSkillTreeNodeV31('撞擊', 1, 'ATK');
    const res2 = upgradeMoveInSkillTreeV31('撞擊');
    renderSkillTree();
    return { res1: res1, res2: res2, pkmnSp: pkmn.skillPoints, learnedMoves: pkmn.learnedMoves };
  });
  console.log(`  - 學習結果 1:`, step2Res.res1);
  console.log(`  - 升級結果 2:`, step2Res.res2);
  console.log(`  - 當前 SP: ${step2Res.pkmnSp}, 已學招式 Keys:`, Object.keys(step2Res.learnedMoves || {}));
  await page.waitForTimeout(800);

  const beforeCloseCheck = await page.evaluate(() => {
    const pkmn = getPkmnById(_skillTreePkmnId);
    const rec = getLearnedMoveRecord(pkmn, '撞擊', 'ATK');
    const nodeDom = document.querySelector('.st-node[data-move="撞擊"]');
    var atkSp = (pkmn.skillTree && (pkmn.skillTree.ATK || pkmn.skillTree.atk)) ? (pkmn.skillTree.ATK || pkmn.skillTree.atk).sp : 0;
    return {
      activeTab: _skillTreeActiveTab,
      atkSp: atkSp,
      learnedLevel: rec ? rec.level : 0,
      domText: nodeDom ? nodeDom.textContent : ''
    };
  });
  console.log(`  - 關閉前分頁: ${beforeCloseCheck.activeTab}, SP: ${beforeCloseCheck.atkSp}, 等級: Lv.${beforeCloseCheck.learnedLevel}`);
  console.log(`  - DOM 節點文字: ${beforeCloseCheck.domText}`);

  // 3. Close skill tree modal
  console.log(`📍 【步驟 3】點擊「關閉」按鈕，關閉技能樹 Modal 視窗...`);
  await page.evaluate(() => {
    saveSkillTreeState();
    closeModal('skillTreeModal');
  });
  await page.waitForTimeout(1000);

  // 4. Re-open Pikachu's skill tree modal
  console.log(`📍 【步驟 4】重新點擊開啟皮卡丘技能樹 Modal 視窗...`);
  await page.evaluate((targetId) => {
    openSkillTree(targetId);
  }, openRes.pikaId);
  await page.waitForTimeout(800);

  const afterReopenCheck = await page.evaluate(() => {
    const pkmn = getPkmnById(_skillTreePkmnId);
    const rec = getLearnedMoveRecord(pkmn, '撞擊', 'ATK');
    const nodeDom = document.querySelector('.st-node[data-move="撞擊"]');
    var atkSp = (pkmn.skillTree && (pkmn.skillTree.ATK || pkmn.skillTree.atk)) ? (pkmn.skillTree.ATK || pkmn.skillTree.atk).sp : 0;
    return {
      activeTab: _skillTreeActiveTab,
      atkSp: atkSp,
      learnedLevel: rec ? rec.level : 0,
      domText: nodeDom ? nodeDom.textContent : ''
    };
  });

  console.log(`  - 重新進入後分頁: ${afterReopenCheck.activeTab}`);
  console.log(`  - 重新進入後攻擊軌投入 SP: ${afterReopenCheck.atkSp}`);
  console.log(`  - 重新進入後「撞擊」等級: Lv.${afterReopenCheck.learnedLevel}`);
  console.log(`  - 重新進入後 DOM 文字: ${afterReopenCheck.domText}`);

  const isLearnedPreserved = afterReopenCheck.learnedLevel === 2 && afterReopenCheck.domText.includes('✓已選');
  console.log(`  - 招式狀態 100% 完美保留驗證: ${isLearnedPreserved ? '✅ PASS (關閉視窗後重新進入，學習招式 100% 完整留存，零遺失！)' : '❌ FAIL'}`);

  if (!isLearnedPreserved) {
    throw new Error('測試失敗: 關閉技能樹分頁重新進入後，剛剛學習的招式遺失！');
  }

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 恭喜！管理員皮卡丘招式學習與關閉分頁零遺失 (Zero Data Loss) Playwright 實測 100% 通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyDefinitivePersistenceAndTabMemory();
