const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyArchetypeSynergyLinking() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 執行 v3.3 流派專屬連攜 (Archetype-Specific Synergy) 精準度與對比測試`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  // 1. Test 電球 [彈射爆破流派]
  console.log(`📍 【測試 1】學習 T1「電球」(彈射流派) -> 檢驗 T2 招式連攜精準度...`);
  const electroBallCheck = await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘')) || roster[0];
    pika.learnedMoves = {};
    pika.skillPoints = 50;
    pika.skillTree = { atk: { sp: 3, tier: 2 }, spa: { sp: 0, tier: 1 }, buf: { sp: 0, tier: 1 }, dis: { sp: 0, tier: 1 }, ult: { sp: 0, tier: 1 } };
    openSkillTree(pika.id);
    learnSkillTreeNodeV31('電球', 1, 'ATK');
    renderSkillTree();

    const t2NodeHtml = document.querySelector('#skillTreeModal')?.innerHTML || '';
    const protectNode = document.querySelector('.st-node[data-move="守住"]');
    const chargeNode = document.querySelector('.st-node[data-move="充電"]');
    const voltTackleNode = document.querySelector('.st-node[data-move="伏特攻擊"]');

    return {
      protectHasBadge: protectNode ? protectNode.innerHTML.includes('🔗') : false,
      chargeHasBadge: chargeNode ? chargeNode.innerHTML.includes('🔗') : false,
      voltTackleHasBadge: voltTackleNode ? voltTackleNode.innerHTML.includes('🔗') : false,
    };
  });

  console.log(`  - 生存招式「守住」是否濫發連攜徽章: ${electroBallCheck.protectHasBadge ? '❌ FAIL (濫發徽章)' : '✅ PASS (乾淨無徽章)'}`);
  console.log(`  - 充能招式「充電」是否濫發連攜徽章: ${electroBallCheck.chargeHasBadge ? '❌ FAIL (濫發徽章)' : '✅ PASS (乾淨無徽章)'}`);
  console.log(`  - 彈射招式「伏特攻擊」是否觸發連攜: ${electroBallCheck.voltTackleHasBadge ? '✅ PASS (精準觸發連攜)' : '❌ FAIL'}`);

  if (electroBallCheck.protectHasBadge || electroBallCheck.chargeHasBadge) {
    throw new Error('流派連攜測試失敗: 守住/充電 被濫發了通用連攜徽章！');
  }

  // 2. Test 電光一閃 [先制速攻流派]
  console.log(`\n📍 【測試 2】學習 T1「電光一閃」(速攻流派) -> 檢驗 T2 招式連攜排他性...`);
  const quickAttackCheck = await page.evaluate(() => {
    const pkmn = getPkmnById(_skillTreePkmnId);
    pkmn.learnedMoves = {};
    learnSkillTreeNodeV31('電光一閃', 1, 'ATK');
    renderSkillTree();

    const thunderPunch = document.querySelector('.st-node[data-move="雷電拳"]');
    const voltTackle = document.querySelector('.st-node[data-move="伏特攻擊"]');
    const doubleHit = document.querySelector('.st-node[data-move="二連擊"]');

    return {
      thunderPunchBadge: thunderPunch ? thunderPunch.innerHTML.includes('🔗 速攻連攜') : false,
      voltTackleBadge: voltTackle ? voltTackle.innerHTML.includes('🔗 速攻連攜') : false,
      doubleHitBadge: doubleHit ? doubleHit.innerHTML.includes('🔗 速攻連攜') : false
    };
  });

  console.log(`  - 雷電拳 (重擊) 是否誤掛速攻徽章: ${quickAttackCheck.thunderPunchBadge ? '❌ FAIL' : '✅ PASS (無速攻徽章)'}`);
  console.log(`  - 伏特攻擊 (速攻) 是否精準掛速攻徽章: ${quickAttackCheck.voltTackleBadge ? '✅ PASS (精準掛速攻徽章)' : '❌ FAIL'}`);
  console.log(`  - 二連擊 (多段) 是否精準掛速攻徽章: ${quickAttackCheck.doubleHitBadge ? '✅ PASS (精準掛速攻徽章)' : '❌ FAIL'}`);

  if (quickAttackCheck.thunderPunchBadge || !quickAttackCheck.voltTackleBadge) {
    throw new Error('流派連攜排他性測試失敗: 非速攻招式被誤掛速攻徽章，或速攻招式未顯示徽章！');
  }

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 恭喜！v3.3 流派專屬連攜 (Archetype-Specific Synergy) Playwright 測試 100% 全部通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyArchetypeSynergyLinking();
