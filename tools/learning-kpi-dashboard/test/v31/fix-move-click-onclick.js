const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Fix onclick attribute escaping in renderSkillTree for v3.1 move nodes
const oldCode = `          var optOnClick = "";
          if (isEligibleOpt && !isPickedOpt && isTierUnlocked && !isTierLocked) {
            optOnClick = "learnSkillTreeNodeV31('" + optName + "', " + t + ", '" + activeRoleUpper + "')";
          }

          canvasHtml += "<div class='" + optCls + "' data-move='" + optName + "' onclick='sfx.click();" + optOnClick + "'>";`;

const newCode = `          var optOnClick = "";
          if (isEligibleOpt && !isPickedOpt && isTierUnlocked && !isTierLocked) {
            optOnClick = "learnSkillTreeNodeV31('" + optName.replace(/'/g, "\\\\'") + "', " + t + ", '" + activeRoleUpper + "')";
          }

          canvasHtml += '<div class="' + optCls + '" data-move="' + optName.replace(/"/g, '&quot;') + '" onclick="sfx.click(); ' + optOnClick + '">';`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(htmlPath, content, 'utf8');
  console.log('✅ Successfully fixed move node onclick escaping in kpi-dashboard.html');
} else {
  console.error('❌ Could not find oldCode in kpi-dashboard.html');
}
