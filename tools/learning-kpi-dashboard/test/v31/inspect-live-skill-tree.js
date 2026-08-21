const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function inspectSkillTree() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n==================================================`);
  console.log(`🔍 正在使用 Playwright 檢測 Skill Tree v3.1 UI...`);
  console.log(`==================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile);
  console.log(`✓ 本地頁面載入完成`);

  console.log(`🖱️ 選擇 Admin...`);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  // Enable all V31 flags and open Skill Tree for P1 (小火龍) and P3 (水伊布)
  const inspectResult = await page.evaluate(() => {
    window.V31_FLAGS = {
      ENABLED: true,
      MORPHOLOGY_FILTER: true,
      SIX_MOVES_PER_TIER: true,
      SP_ECONOMY_90: true,
      LV5_MODIFIER: true
    };

    if (typeof openSkillTree !== 'function') return { error: 'openSkillTree function not found' };

    const roster = globalData.roster || [];
    const p1 = roster.find(p => p.id === 'P1') || roster[0];
    const p3 = roster.find(p => p.id === 'P3') || roster[0];

    // Open skill tree for P1 (小火龍)
    openSkillTree(p1.id);

    const modal = document.getElementById('skillTreeModal');
    const title = document.getElementById('st-title')?.textContent || '';
    const spInfo = document.getElementById('st-sp-info')?.textContent || '';
    const nodeText = modal ? modal.textContent : '';

    const moveOpts = Array.from(document.querySelectorAll('.move-opt, .st-move-card, .st-node')).map(el => el.textContent.trim());
    const lockOpts = Array.from(document.querySelectorAll('.move-opt.locked, .locked')).map(el => el.textContent.trim());
    const buttons = Array.from(modal.querySelectorAll('button')).map(el => el.textContent.trim());

    return {
      title,
      spInfo,
      moveOptsCount: moveOpts.length,
      moveOptsSample: moveOpts.slice(0, 12),
      lockOptsCount: lockOpts.length,
      lockOptsSample: lockOpts.slice(0, 6),
      buttonsSample: buttons.filter(b => b && b !== '關閉'),
      fullTextSnippet: nodeText.substring(0, 500)
    };
  });

  console.log(`\n📊 v3.1 技能樹 UI 實測結果 (小火龍):`);
  console.log(JSON.stringify(inspectResult, null, 2));

  // Save screenshot
  const shotDir = path.resolve(__dirname, '../../../../docs/screenshots');
  if (!fs.existsSync(shotDir)) fs.mkdirSync(shotDir, { recursive: true });
  await page.screenshot({ path: path.join(shotDir, 'v31_skill_tree_inspection.png') });
  console.log(`📸 截圖已儲存至 docs/screenshots/v31_skill_tree_inspection.png`);

  await browser.close();
}

inspectSkillTree();
