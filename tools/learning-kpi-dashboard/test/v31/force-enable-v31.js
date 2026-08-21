const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  path.resolve(__dirname, '../../frontend/kpi-dashboard.html'),
  path.resolve(__dirname, '../../../../public/kpi-dashboard.html')
];

filesToUpdate.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace ENABLED: false with ENABLED: true and all sub-flags to true
  const oldFlagsRegex = /window\.V31_FLAGS = \{[\s\S]*?\};/;
  const newFlags = `window.V31_FLAGS = {
  ENABLED: true,        // 總開關（預設開啟 v3.1）
  MORPHOLOGY_FILTER: true,
  SIX_MOVES_PER_TIER: true,
  SP_ECONOMY_90: true,
  LV5_MODIFIER: true,
};`;

  if (oldFlagsRegex.test(content)) {
    content = content.replace(oldFlagsRegex, newFlags);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Successfully updated V31_FLAGS in: ${filePath}`);
  } else {
    console.error(`❌ Could not find V31_FLAGS in: ${filePath}`);
  }
});
