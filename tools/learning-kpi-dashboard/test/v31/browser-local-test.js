const { chromium } = require('playwright');
const path = require('path');

async function runLocalTest() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n==================================================`);
  console.log(`🔍 測試本地檔案: ${localFile}`);
  console.log(`==================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`  [Browser ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile);
  console.log(`✓ 本地頁面載入完成，Title: "${await page.title()}"`);

  console.log(`🖱️ 在下拉選單選擇 Admin...`);
  await page.selectOption('#studentSelect', 'Admin');
  await page.waitForTimeout(3000);

  const dashDisp = await page.$eval('#dashboard', el => getComputedStyle(el).display);
  const adminDisp = await page.$eval('#adminPanel', el => getComputedStyle(el).display);
  const btnText = await page.$eval('#submitBtn', el => el.textContent);

  console.log(`📊 本地測試結果:`);
  console.log(`  - #dashboard display: ${dashDisp}`);
  console.log(`  - #adminPanel display: ${adminDisp}`);
  console.log(`  - #submitBtn text: "${btnText}"`);

  if (dashDisp === 'block' && adminDisp === 'block') {
    console.log(`🎉 SUCCESS: 本地登錄管理員 100% 成功！`);
  } else {
    console.error(`❌ FAIL: 本地登錄失敗`);
  }

  await browser.close();
}

runLocalTest();
