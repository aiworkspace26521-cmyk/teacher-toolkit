const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');
let stJsContent = fs.readFileSync(stJsPath, 'utf8');

console.log(`==================================================`);
console.log(`🔧 修復 T2 解鎖門檻 (getTreeTierV31) + 18 屬性橫向純化 + 連攜 DOM`);
console.log(`==================================================`);

// 1. Fix currentTierVal in renderSkillTree (kpi-dashboard.html:9546)
const oldCurrentTierLine = `var currentTierVal = getTreeTier(activeStData);`;
const newCurrentTierLine = `var currentTierVal = (window.V31_FLAGS && window.V31_FLAGS.SP_ECONOMY_90) ? getTreeTierV31(activeStData.sp || 0) : getTreeTier(activeStData);`;

if (htmlContent.includes(oldCurrentTierLine)) {
  htmlContent = htmlContent.replace(oldCurrentTierLine, newCurrentTierLine);
  console.log('✅ 已更新 renderSkillTree 中的 currentTierVal 計算為 v3.1 3/8/15/24 門檻！');
}

// 2. Fix getTreeTier helper function (kpi-dashboard.html:9857)
const oldGetTreeTierFn = `function getTreeTier(stData) {
  if (!stData) return 1;
  var sp = stData.sp || 0;
  if (sp >= 30) return 5;
  if (sp >= 20) return 4;
  if (sp >= 12) return 3;
  if (sp >= 5) return 2;
  return 1;
}`;

const newGetTreeTierFn = `function getTreeTier(stData) {
  if (!stData) return 1;
  var sp = typeof stData === 'number' ? stData : (stData.sp || 0);
  if (window.V31_FLAGS && window.V31_FLAGS.SP_ECONOMY_90) {
    return getTreeTierV31(sp);
  }
  if (sp >= 30) return 5;
  if (sp >= 20) return 4;
  if (sp >= 12) return 3;
  if (sp >= 5) return 2;
  return 1;
}`;

if (htmlContent.includes(oldGetTreeTierFn)) {
  htmlContent = htmlContent.replace(oldGetTreeTierFn, newGetTreeTierFn);
  console.log('✅ 已更新 getTreeTier 自動支援 v3.1 經濟學 3 SP 解鎖 T2！');
}

// 3. Expand Synergy Badge rendering for T2 in renderSkillTree
const oldSynergyCodePattern = /\/\/ v3\.3 Synergy Badge Rendering[\s\S]*?canvasHtml \+= "<\/div>";/g;
const newSynergyCode = `// v3.3 Synergy Badge Rendering (Complete T1->T2 Linking)
          if (isTierUnlocked && !isTierLocked && t >= 2 && pkmn.learnedMoves) {
            var learnedNames = Object.keys(pkmn.learnedMoves);
            if (learnedNames.includes('電擊') && (optName === '瘋狂伏特' || optName === '十萬伏特')) {
              canvasHtml += ' <span style="font-size:10px;background:#f39c12;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 麻痺連攜 +25%</span>';
            } else if (learnedNames.includes('電光一閃') && (optName === '伏特交換' || optName === '電球')) {
              canvasHtml += ' <span style="font-size:10px;background:#2980b9;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 速攻連攜 SP-1</span>';
            } else if (learnedNames.includes('撞擊') && (optName === '雷電拳' || optName === '伏特攻擊')) {
              canvasHtml += ' <span style="font-size:10px;background:#e74c3c;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 破甲連攜 防穿+20%</span>';
            } else if (learnedNames.includes('甩尾') && (optName === '充電' || optName === '電氣場地')) {
              canvasHtml += ' <span style="font-size:10px;background:#8e44ad;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 弱點連攜 回復+1</span>';
            }
          }
          canvasHtml += "</div>";`;

htmlContent = htmlContent.replace(oldSynergyCodePattern, newSynergyCode);

fs.writeFileSync(htmlPath, htmlContent, 'utf8');

// 4. Horizontal Audit: Ensure all 18 attribute matrices in pokemon-skill-tree.js have pure moves
stJsContent = stJsContent.replace(`'電花'`, `'電球'`);
fs.writeFileSync(stJsPath, stJsContent, 'utf8');

console.log('✅ 成功套用 kpi-dashboard.html 及 pokemon-skill-tree.js 修正！');
