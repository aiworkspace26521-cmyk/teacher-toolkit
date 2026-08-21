const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(targetPath, 'utf8');

// Fix unescaped quotes in upgradeMoveInSkillTreeV31 and applySkillModifierV31
content = content.replace(
  `upgradeMoveInSkillTreeV31("" + optName + "")`,
  `upgradeMoveInSkillTreeV31(\\\"' + optName + '\\\")`
);

content = content.replace(
  `applySkillModifierV31("" + optName + "", "" + bName + "")`,
  `applySkillModifierV31(\\\"' + optName + '\\\", \\\"' + bName + '\\\")`
);

// Also remove duplicate events definition in fetchStudentData if present
content = content.replace(
  `var events = snapshot.docs.map(function(d){ var o = {id:d.id}; for(var k in d.data()) o[k]=d.data()[k]; return o; });\n    var events = snapshot.docs.map(function(d){ var o = {id:d.id}; for(var k in d.data()) o[k]=d.data()[k]; return o; });`,
  `var events = snapshot.docs.map(function(d){ var o = {id:d.id}; for(var k in d.data()) o[k]=d.data()[k]; return o; });`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('SUCCESS: Fixed syntax error in kpi-dashboard.html');
