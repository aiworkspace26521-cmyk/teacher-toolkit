const assert = require('assert');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../../frontend/kpi-dashboard.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// 驗證 renderSkillTree 函式中是否正確引入 SIX_MOVES_PER_TIER 旗標判斷
assert.ok(htmlContent.includes('V31_FLAGS.SIX_MOVES_PER_TIER'), 'kpi-dashboard.html 應包含 V31_FLAGS.SIX_MOVES_PER_TIER 判斷');
assert.ok(htmlContent.includes('🔒 生理不符：'), 'UI 渲染中應包含 🔒 生理不符 標籤');
assert.ok(htmlContent.includes('move-opt'), 'UI 渲染中應包含 move-opt class');
assert.ok(htmlContent.includes('✓已選'), 'UI 渲染中應包含 ✓已選 標籤');

console.log('PASS  kpi-dashboard.html renderSkillTree 包含 SIX_MOVES_PER_TIER 旗標控制');
console.log('PASS  UI 正確包含 🔒 生理不符、move-opt 與 ✓已選 標記');
console.log('\nG2 step2.3 gate PASS');
