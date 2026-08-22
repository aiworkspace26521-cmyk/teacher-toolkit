const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(htmlPath, 'utf8');

// Fix upgrade button onclick string concatenation cleanly
const oldUpgradePattern = /canvasHtml \+= ['"].*?upgradeMoveInSkillTreeV31.*?;/g;

const cleanUpgradeBtn = `canvasHtml += ' <button class="st-upgrade-btn" style="background:#3498db;color:white;margin-left:4px;" onclick="event.stopPropagation(); upgradeMoveInSkillTreeV31(\\\'' + optName.replace(/'/g, "\\\\'") + '\\\')">+1SP 升級</button>';`;

// Clean replacement
content = content.replace(
  /canvasHtml \+= ['"].*?upgradeMoveInSkillTreeV31.*?['"];/g,
  `canvasHtml += " <button class='st-upgrade-btn' style='background:#3498db;color:white;margin-left:4px;' onclick='event.stopPropagation();upgradeMoveInSkillTreeV31(\\\"" + optName + "\\\")'>+1SP 升級</button>";`
);

content = content.replace(
  /canvasHtml \+= ['"].*?applySkillModifierV31.*?['"];/g,
  `canvasHtml += " <button class='st-upgrade-btn' style='background:#9b59b6;color:white;margin-left:2px;' onclick='event.stopPropagation();applySkillModifierV31(\\\"" + optName + "\\\", \\\"" + bName + "\\\")'>✨ " + bName + " (3SP)</button>";`
);

fs.writeFileSync(htmlPath, content, 'utf8');
console.log('✅ Cleanly updated upgrade button onclick in kpi-dashboard.html');
