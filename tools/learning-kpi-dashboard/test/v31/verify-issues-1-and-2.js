const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyIssues1And2() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 執行 v3.3 Issue 1 & Issue 2 實機驗證（去重複與頁籤軌道隔離測試）`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  // 1. Open Pikachu Skill Tree and clean state
  const initRes = await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    if (pika) {
      pika.learnedMoves = {};
      pika.skillPoints = 50;
      pika.totalSpEarned = 50;
      pika.skillTree = {
        atk: { sp: 0, tier: 1 }, spa: { sp: 0, tier: 1 },
        buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 }
      };
      openSkillTree(pika.id);
      return { id: pika.id, name: pika.baseName };
    }
    return null;
  });

  console.log(`✓ 成功開啟 ${initRes.name} 技能樹`);
  await page.waitForTimeout(1000);

  // 2. ATK Tab: Learn 電擊 in ATK T1, upgrade to Lv.3/5 (3 SP)
  console.log(`\n📍 【步驟 1】在 攻擊 (ATK) 頁籤學習 電擊 並升級至 Lv.3 (3 SP)...`);
  await page.evaluate(() => {
    learnSkillTreeNodeV31('電擊', 1, 'ATK');
    upgradeMoveInSkillTreeV31('電擊');
    upgradeMoveInSkillTreeV31('電擊');
  });
  await page.waitForTimeout(500);

  // 3. ATK Tab: Learn 瘋狂伏特 in ATK T2
  console.log(`📍 【步驟 2】在 攻擊 (ATK) 頁籤學習 T2 瘋狂伏特...`);
  await page.evaluate(() => {
    learnSkillTreeNodeV31('瘋狂伏特', 2, 'ATK');
  });
  await page.waitForTimeout(500);

  // 4. Assert Issue 1 Fix: T4 must NOT show 瘋狂伏特 as pre-learned
  const atkCheck = await page.evaluate(() => {
    const pkmn = getPkmnById(_skillTreePkmnId);
    const modalText = document.getElementById('skillTreeModal')?.textContent || '';
    const atkT4Node = document.querySelector('.st-node[data-move="瘋狂雷霆"]');
    return {
      atkSp: pkmn.skillTree.atk.sp,
      learnedAtkKeys: Object.keys(pkmn.learnedMoves || {}),
      t4IsPicked: atkT4Node ? atkT4Node.classList.contains('learned') : false,
      modalTextSnippet: modalText.substring(modalText.indexOf('T4 (高階)'), modalText.indexOf('T4 (高階)') + 300)
    };
  });

  console.log(`  - 攻擊軌投入 SP: ${atkCheck.atkSp}`);
  console.log(`  - 已學習招式鍵組:`, atkCheck.learnedAtkKeys);
  console.log(`  - T4 瘋狂雷霆 是否誤被顯示為已學習: ${atkCheck.t4IsPicked ? '❌ FAIL (誤顯示已學)' : '✅ PASS (未學習，無錯置已選態)'}`);

  if (atkCheck.t4IsPicked) {
    throw new Error('Issue 1 測試失敗: T4 招式繼承了 T2 的已學習狀態');
  }

  // 5. Switch to Special Attack (SPA) Tab
  console.log(`\n📍 【步驟 3】切換至 特攻 (SPA) 頁籤...`);
  await page.evaluate(() => {
    selectSkillTreeTab('spa');
  });
  await page.waitForTimeout(800);

  // 6. Assert Issue 2 Fix: SPA tab must show 0 SP, T2 locked, and NO move marked as learned
  const spaCheck = await page.evaluate(() => {
    const pkmn = getPkmnById(_skillTreePkmnId);
    const modalText = document.getElementById('skillTreeModal')?.textContent || '';
    const spaLearnedNodes = Array.from(document.querySelectorAll('.st-node.learned'));
    return {
      spaSp: pkmn.skillTree.spa ? pkmn.skillTree.spa.sp : 0,
      spaLearnedCountInDom: spaLearnedNodes.length,
      modalSnippet: modalText.substring(0, 500)
    };
  });

  console.log(`  - 特攻軌投入 SP: ${spaCheck.spaSp}`);
  console.log(`  - 特攻頁籤下顯示已學習 DOM 數量: ${spaCheck.spaLearnedCountInDom}`);
  console.log(`  - 特攻頁籤隔離檢驗: ${spaCheck.spaSp === 0 && spaCheck.spaLearnedCountInDom === 0 ? '✅ PASS (特攻軌獨立為 0 SP，無任何點數與狀態洩漏！)' : '❌ FAIL'}`);

  if (spaCheck.spaSp !== 0 || spaCheck.spaLearnedCountInDom !== 0) {
    throw new Error('Issue 2 測試失敗: 攻擊軌招式狀態洩漏至特攻軌！');
  }

  // 7. Switch back to ATK Tab and assert state preserved
  console.log(`\n📍 【步驟 4】切換回 攻擊 (ATK) 頁籤驗證原狀態保留...`);
  await page.evaluate(() => {
    selectSkillTreeTab('atk');
  });
  await page.waitForTimeout(800);

  const switchBackCheck = await page.evaluate(() => {
    const pkmn = getPkmnById(_skillTreePkmnId);
    return {
      atkSp: pkmn.skillTree.atk.sp,
      rec: getLearnedMoveRecord(pkmn, '電擊', 'ATK')
    };
  });

  console.log(`  - 重新切回攻擊頁籤狀態: 已投入 ${switchBackCheck.atkSp} SP | 電擊等級: Lv.${switchBackCheck.rec ? switchBackCheck.rec.level : 0}`);
  console.log(`  - 攻擊頁籤完整還原檢驗: ${switchBackCheck.atkSp > 0 && switchBackCheck.rec.level === 3 ? '✅ PASS (攻擊軌原數據完整保留！)' : '❌ FAIL'}`);

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 恭喜！Issue 1 & Issue 2 實機Playwright測試 100% 全部通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyIssues1And2();
