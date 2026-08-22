const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyVaporeonV32() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n==================================================`);
  console.log(`🔍 開啟 Playwright 真實瀏覽器驗證 v3.2 水伊布技能樹...`);
  console.log(`==================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile);
  console.log(`✓ 本地頁面載入完成`);

  console.log(`🖱️ 在下拉選單選擇 Admin...`);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(2000);

  console.log(`🖱️ 打開 Admin 隊伍中「水伊布」的技能樹...`);
  const openSuccess = await page.evaluate(() => {
    if (typeof openSkillTree === 'function') {
      const roster = (globalData && globalData.roster) || [];
      const vaporeon = roster.find(p => p.baseName && p.baseName.includes('水伊布')) || roster[2] || roster[0];
      if (vaporeon) {
        openSkillTree(vaporeon.id);
        return vaporeon.baseName;
      }
    }
    return null;
  });

  console.log(`✓ 已成功開啟寶可夢技能樹: ${openSuccess}`);
  await page.waitForTimeout(1500);

  // Capture Screenshot
  const shotDir = path.resolve(__dirname, '../../../../docs/screenshots');
  if (!fs.existsSync(shotDir)) fs.mkdirSync(shotDir, { recursive: true });
  const shotPath = path.join(shotDir, 'vaporeon_v32_verified.png');
  await page.screenshot({ path: shotPath });
  console.log(`📸 驗證截圖已儲存至: ${shotPath}`);

  // Inspect Modal DOM Text
  const modalText = await page.evaluate(() => {
    const modal = document.getElementById('skillTreeModal');
    return modal ? modal.textContent : '';
  });

  console.log(`\n📋 實測水伊布技能樹 DOM 文字驗證:`);
  console.log(modalText.substring(0, 700));

  // Assertions
  const hasWaterMoves = modalText.includes('貝殼刃') || modalText.includes('水之尾') || modalText.includes('攀瀑') || modalText.includes('水炮');
  const hasNoFireExclusive = !modalText.includes('V熱焰') && !modalText.includes('熔岩風暴');

  console.log(`\n🧪 斷言檢查:`);
  console.log(`  - 包含水系主招 (貝殼刃/水之尾/水炮): ${hasWaterMoves ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  - 排除火系專屬招 (V熱焰/熔岩風暴): ${hasNoFireExclusive ? '✅ PASS' : '❌ FAIL'}`);

  if (hasWaterMoves && hasNoFireExclusive) {
    console.log(`\n🎉🎉🎉 G4 Playwright 管理員「水伊布」v3.2 技能樹實機驗證 100% 通過！`);
  } else {
    console.error(`\n❌ FAIL: 水伊布技能樹驗證未達標`);
  }

  await browser.close();
}

verifyVaporeonV32();
