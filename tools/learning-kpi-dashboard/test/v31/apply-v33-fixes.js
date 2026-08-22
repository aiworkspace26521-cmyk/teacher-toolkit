const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');
let stJsContent = fs.readFileSync(stJsPath, 'utf8');

console.log(`==================================================`);
console.log(`🔧 套用 v3.3 修復：升級按鈕轉義 + 屬性純化 + 連攜 DOM 標籤`);
console.log(`==================================================`);

// 1. Fix +1SP Upgrade Button and LV5 Modifier Button Quote Escaping in kpi-dashboard.html
const oldUpgradeBtnHtml = `canvasHtml += " <button class='st-upgrade-btn' style='background:#3498db;color:white;margin-left:4px;' onclick='event.stopPropagation();upgradeMoveInSkillTreeV31(\"' + optName + '\")'>+1SP 升級</button>";`;
const newUpgradeBtnHtml = `canvasHtml += '<button class="st-upgrade-btn" style="background:#3498db;color:white;margin-left:4px;" onclick="event.stopPropagation(); upgradeMoveInSkillTreeV31(\\\'' + optName.replace(/'/g, "\\\\'") + '\\\')">+1SP 升級</button>';`;

htmlContent = htmlContent.replace(oldUpgradeBtnHtml, newUpgradeBtnHtml);

const oldModBtnHtml = `canvasHtml += " <button class='st-upgrade-btn' style='background:#9b59b6;color:white;margin-left:2px;' onclick='event.stopPropagation();applySkillModifierV31(\"' + optName + '\", \"' + bName + '\")'>✨ " + bName + " (3SP)</button>";`;
const newModBtnHtml = `canvasHtml += '<button class="st-upgrade-btn" style="background:#9b59b6;color:white;margin-left:2px;" onclick="event.stopPropagation(); applySkillModifierV31(\\\'' + optName.replace(/'/g, "\\\\'") + '\\\', \\\'' + bName.replace(/'/g, "\\\\'") + '\\\')">✨ ' + bName + ' (3SP)</button>';`;

htmlContent = htmlContent.replace(oldModBtnHtml, newModBtnHtml);

// 2. Add visual Synergy Badge rendering for T2~T5 in renderSkillTree in kpi-dashboard.html
const oldNodeRenderEnd = `canvasHtml += "</div>";\n        }\n      }`;
const newNodeRenderWithSynergy = `          // v3.3 Synergy Badge Rendering
          if (isTierUnlocked && !isTierLocked && t >= 2 && pkmn.learnedMoves) {
            var learnedNames = Object.keys(pkmn.learnedMoves);
            if (learnedNames.includes('電擊') && (optName === '瘋狂伏特' || optName === '十萬伏特')) {
              canvasHtml += ' <span style="font-size:10px;background:#f39c12;color:white;padding:1px 4px;border-radius:3px;margin-left:2px;">🔗 麻痺連攜 +25%</span>';
            } else if (learnedNames.includes('電光一閃') && (optName === '伏特交換' || optName === '電球')) {
              canvasHtml += ' <span style="font-size:10px;background:#2980b9;color:white;padding:1px 4px;border-radius:3px;margin-left:2px;">🔗 速攻連攜 SP-1</span>';
            }
          }
          canvasHtml += "</div>";
        }
      }`;

if (!htmlContent.includes('🔗 麻痺連攜')) {
  htmlContent = htmlContent.replace(oldNodeRenderEnd, newNodeRenderWithSynergy);
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ 成功修復 kpi-dashboard.html 中的 +1SP 升級按鈕與連攜標籤繪製！');

// 3. Purify TIER_MATRIX_V31['電'] in pokemon-skill-tree.js (replace 火花 with 電球)
stJsContent = stJsContent.replace(
  `T1: ['電擊', '撞擊', '電光一閃', '火花', '甩尾', '叫聲']`,
  `T1: ['電擊', '撞擊', '電光一閃', '電球', '甩尾', '叫聲']`
);

// 4. Update isEligible to include strict Attribute Matching
if (!stJsContent.includes('spec.type !== pokemonType')) {
  stJsContent = stJsContent.replace(
    'function isEligible(speciesTags, spec) {',
    `function isEligible(speciesTags, spec, pokemonType) {
  if (spec && spec.type && pokemonType && pokemonType !== '一般' && spec.type !== '一般' && spec.type !== pokemonType) {
    return false;
  }`
  );
}

fs.writeFileSync(stJsPath, stJsContent, 'utf8');
console.log('✅ 成功移除電系矩陣中的「火花」，並在 isEligible 加入嚴格屬性比對過濾！');
