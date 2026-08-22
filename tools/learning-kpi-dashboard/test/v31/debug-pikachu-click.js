const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function debugPikachuClick() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n==================================================`);
  console.log(`🔍 測試管理員隊伍皮卡丘點擊點學招式...`);
  console.log(`==================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  // Open Pikachu's skill tree or P1 (小火龍) skill tree
  const pikaResult = await page.evaluate(() => {
    const roster = globalData.roster || [];
    let pika = roster.find(p => p.baseName && p.baseName.includes('皮卡丘'));
    if (!pika) {
      // Add test Pikachu to roster if missing
      pika = {
        id: 'P_PIKA',
        baseName: '⚡ 皮卡丘 (電系)',
        totalExp: 50000,
        currentLevel: 54,
        skillPoints: 50,
        totalSpEarned: 50,
        learnedMoves: {},
        skillTree: { atk: { sp: 0, tier: 1 } }
      };
      roster.push(pika);
    }
    openSkillTree(pika.id);

    // Inspect Pikachu's SP and move options
    const moveNodes = Array.from(document.querySelectorAll('.st-node.move-opt'));
    const firstMove = moveNodes.find(n => !n.classList.contains('locked'));

    return {
      pikaId: pika.id,
      pikaSp: pika.skillPoints,
      moveCount: moveNodes.length,
      firstMoveName: firstMove ? firstMove.getAttribute('data-move') : null,
      firstMoveOnClick: firstMove ? firstMove.getAttribute('onclick') : null
    };
  });

  console.log(`📊 皮卡丘技能樹狀態:`, JSON.stringify(pikaResult, null, 2));

  // Try clicking the first move (電擊 / 抓)
  console.log(`🖱️ 嘗試實機點擊第一招: "${pikaResult.firstMoveName}"...`);

  const clickResult = await page.evaluate((moveName) => {
    const node = document.querySelector(`.st-node.move-opt[data-move="${moveName}"]`);
    if (!node) return { error: 'node element not found' };

    // Record initial state
    const pkmn = getPkmnById(_skillTreePkmnId);
    const initialLearned = Object.keys(pkmn.learnedMoves || {});

    // Execute click
    node.click();

    const toastMsg = document.getElementById('toastContainer')?.textContent || '';
    const afterLearned = Object.keys(pkmn.learnedMoves || {});

    return {
      initialLearned,
      afterLearned,
      toastMsg,
      learnedSuccess: afterLearned.includes(moveName)
    };
  }, pikaResult.firstMoveName);

  console.log(`\n🧪 點擊結果:`, JSON.stringify(clickResult, null, 2));

  await browser.close();
}

debugPikachuClick();
