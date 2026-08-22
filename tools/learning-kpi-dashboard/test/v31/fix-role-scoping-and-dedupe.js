const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');

let htmlContent = fs.readFileSync(htmlPath, 'utf8');
let stJsContent = fs.readFileSync(stJsPath, 'utf8');

console.log(`================================================================`);
console.log(`🔧 修復 Issue 1 & 2：角色軌道隔離 (Role Scoping) + 同軌道重複招式名純化`);
console.log(`================================================================`);

// 1. Add getLearnedMoveRecord and update learn/render/upgrade/reset in kpi-dashboard.html

const helperCode = `
function getLearnedMoveRecord(pkmn, moveName, role) {
  if (!pkmn || !pkmn.learnedMoves) return null;
  var roleUpper = (role || _skillTreeActiveTab || 'ATK').toUpperCase();
  var scopedKey = roleUpper + ':' + moveName;
  if (pkmn.learnedMoves[scopedKey]) return pkmn.learnedMoves[scopedKey];

  // Legacy single key check: only if role matches
  var legacyRec = pkmn.learnedMoves[moveName];
  if (legacyRec && legacyRec.role && String(legacyRec.role).toUpperCase() === roleUpper) {
    return legacyRec;
  }
  return null;
}
`;

if (!htmlContent.includes('function getLearnedMoveRecord')) {
  htmlContent = htmlContent.replace('function countPicks(', helperCode + '\nfunction countPicks(');
}

// Update renderSkillTree isPickedOpt check
const oldIsPickedOpt = `var isPickedOpt = !!(pkmn.learnedMoves && pkmn.learnedMoves[optName]);`;
const newIsPickedOpt = `var optRec = getLearnedMoveRecord(pkmn, optName, activeRoleUpper);
          var isPickedOpt = !!optRec;`;

htmlContent = htmlContent.replace(oldIsPickedOpt, newIsPickedOpt);

// Update renderSkillTree optRec lookup
const oldOptRec = `var optRec = pkmn.learnedMoves[optName];`;
const newOptRec = `var optRec = getLearnedMoveRecord(pkmn, optName, activeRoleUpper);`;
htmlContent = htmlContent.replace(oldOptRec, newOptRec);

// Update learnSkillTreeNodeV31 already learned check & learn write
const oldAlreadyLearnedCheck = `if (pkmn.learnedMoves && pkmn.learnedMoves[moveName]) {`;
const newAlreadyLearnedCheck = `if (getLearnedMoveRecord(pkmn, moveName, role)) {`;
htmlContent = htmlContent.replace(oldAlreadyLearnedCheck, newAlreadyLearnedCheck);

const oldLearnWrite = `pkmn.learnedMoves[moveName] = { level: 1, learnedAt: Date.now(), tier: tier, role: role };`;
const newLearnWrite = `var scopedKey = role + ':' + moveName;
  pkmn.learnedMoves[scopedKey] = { level: 1, learnedAt: Date.now(), tier: tier, role: role, name: moveName };
  pkmn.learnedMoves[moveName] = pkmn.learnedMoves[scopedKey];`;
htmlContent = htmlContent.replace(oldLearnWrite, newLearnWrite);

// Update upgradeMoveInSkillTreeV31 lookup
const oldUpgradeLookup = `if (!pkmn.learnedMoves || !pkmn.learnedMoves[moveName]) {`;
const newUpgradeLookup = `var scopedKey = (_skillTreeActiveTab || 'ATK').toUpperCase() + ':' + moveName;
  var rec = pkmn.learnedMoves ? (pkmn.learnedMoves[scopedKey] || pkmn.learnedMoves[moveName]) : null;
  if (!rec) {`;
htmlContent = htmlContent.replace(oldUpgradeLookup, newUpgradeLookup);

// Update applySkillModifierV31 lookup
const oldModLookup = `if (!pkmn.learnedMoves || !pkmn.learnedMoves[moveName]) {`;
const newModLookup = `var scopedKey = (_skillTreeActiveTab || 'ATK').toUpperCase() + ':' + moveName;
  var rec = pkmn.learnedMoves ? (pkmn.learnedMoves[scopedKey] || pkmn.learnedMoves[moveName]) : null;
  if (!rec) {`;
htmlContent = htmlContent.replace(oldModLookup, newModLookup);

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ 成功於 kpi-dashboard.html 部署角色軌道隔離機制 (Role Scoping)！');

// 2. Remove duplicate move names in TIER_MATRIX_V31['電'] in pokemon-skill-tree.js
stJsContent = stJsContent.replace(
  `ATK: {
      T1: ['電擊', '撞擊', '電光一閃', '電球', '甩尾', '叫聲'],
      T2: ['雷電拳', '伏特攻擊', '電球', '瘋狂伏特', '充電', '守住'],
      T3: ['十萬伏特', '伏特交換', '電磁波', '電擊波', '光牆', '替身'],
      T4: ['打雷', '瘋狂伏特', '電漿閃光', '電氣場地', '雷霆爆發', '黑霧'],
      T5: ['交錯閃電', '千雷轟頂', '電光極致', '萬伏特狂暴', '電氣爆發', '大爆炸']
    },`,
  `ATK: {
      T1: ['電擊', '撞擊', '電光一閃', '電球', '甩尾', '叫聲'],
      T2: ['雷電拳', '伏特攻擊', '二連擊', '瘋狂伏特', '充電', '守住'],
      T3: ['十萬伏特', '伏特交換', '電磁波', '電擊波', '光牆', '替身'],
      T4: ['打雷', '瘋狂雷霆', '電漿閃光', '電氣場地', '雷霆爆發', '黑霧'],
      T5: ['交錯閃電', '千雷轟頂', '電光極致', '萬伏特狂暴', '電氣爆發', '大爆炸']
    },`
);

stJsContent = stJsContent.replace(
  `SPA: { T1: ['電擊', '電球', '電擊波', '覺醒力量', '叫聲', '電光一閃'], T2: ['十萬伏特', '電球', '電磁波', '守住', '充電', '高速移動'], T3: ['打雷', '伏特交換', '十萬伏特', '電氣場地', '替身', '黑霧'], T4: ['打雷', '電漿閃光', '電氣場地', '黑霧', '守住', '替身'], T5: ['交錯閃電', '千雷轟頂', '萬伏特狂暴', '電氣爆發', '雷霆極致', '睡覺'] },`,
  `SPA: { T1: ['電火花', '電脈衝', '電擊波', '覺醒力量', '叫聲', '電光一閃'], T2: ['十萬伏特', '電弧脈衝', '電磁波', '守住', '充電', '高速移動'], T3: ['打雷', '伏特交換', '閃電爆裂', '電氣場地', '替身', '黑霧'], T4: ['極致打雷', '電漿閃光', '電氣場地', '黑霧', '守住', '替身'], T5: ['交錯閃電', '千雷轟頂', '萬伏特狂暴', '電氣爆發', '雷霆極致', '睡覺'] },`
);

fs.writeFileSync(stJsPath, stJsContent, 'utf8');
console.log('✅ 成功去重複電系技能樹中的「瘋狂伏特」與「十萬伏特」！');
