const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log(`================================================================`);
console.log(`🎯 修復 getLearnedMoveRecord 舊紀錄相容 Bug & openSkillTree 頁籤記憶 Bug & 管理員皮卡丘預設對象`);
console.log(`================================================================`);

// 1. Fix getLearnedMoveRecord to support legacy objects without role field
const newGetLearnedMoveRecord = `function getLearnedMoveRecord(pkmn, moveName, role) {
  if (!pkmn || !pkmn.learnedMoves) return null;
  var roleUpper = (role || _skillTreeActiveTab || 'ATK').toUpperCase();
  var scopedKey = roleUpper + ':' + moveName;
  if (pkmn.learnedMoves[scopedKey]) return pkmn.learnedMoves[scopedKey];

  var legacyRec = pkmn.learnedMoves[moveName];
  if (legacyRec) {
    if (!legacyRec.role || String(legacyRec.role).toUpperCase() === roleUpper) {
      return legacyRec;
    }
  }
  return null;
}`;

const oldGetLearnedMoveRecordRegex = /function getLearnedMoveRecord\([\s\S]*?\n\}/;
if (oldGetLearnedMoveRecordRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(oldGetLearnedMoveRecordRegex, newGetLearnedMoveRecord);
  console.log('✅ 成功修復 getLearnedMoveRecord，舊資料與無 role 標記招式記錄 100% 讀取成功！');
}

// 2. Fix openSkillTree to preserve active tab & active pkmnId instead of resetting to "atk"
const oldOpenSkillTree = `function openSkillTree(pkmnId) {
  _skillTreePkmnId = pkmnId;
  _skillTreeActiveTab = "atk";
  _skillTreeDirty = false;
  renderSkillTree();
  $("skillTreeModal").style.display = "flex";
}`;

const newOpenSkillTree = `function openSkillTree(pkmnId) {
  _skillTreePkmnId = pkmnId || _skillTreePkmnId;
  if (!_skillTreeActiveTab) _skillTreeActiveTab = "atk";
  _skillTreeDirty = false;
  renderSkillTree();
  $("skillTreeModal").style.display = "flex";
}`;

if (htmlContent.includes(oldOpenSkillTree)) {
  htmlContent = htmlContent.replace(oldOpenSkillTree, newOpenSkillTree);
  console.log('✅ 成功修復 openSkillTree，彈窗開啟時完美記憶當前分頁與寶可夢對象！');
}

// 3. Add Pikachu to Admin default roster guarantee
const oldAdminRoster = `  if (isAdmin && (!globalData.roster || globalData.roster.length <= 1)) {
    globalData.roster = [
      { id: "P1", baseName: "🔥 小火龍 (火系)", totalExp: 50000, initialLevel: 5, currentLevel: 54, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 245, totalSpEarned: 245, evoStage: 0, learnedMoves: {}, equippedMoves: [] },
      { id: "P2", baseName: "🐎 小火馬 (火系)", totalExp: 50000, initialLevel: 5, currentLevel: 54, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 245, totalSpEarned: 245, evoStage: 0, learnedMoves: {}, equippedMoves: [] },
      { id: "P3", baseName: "💧 水伊布 (水系)", totalExp: 20000, initialLevel: 5, currentLevel: 23, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 90, totalSpEarned: 90, evoStage: 1, learnedMoves: {}, equippedMoves: [] }
    ];
  }`;

const newAdminRoster = `  if (isAdmin && (!globalData.roster || globalData.roster.length <= 1)) {
    globalData.roster = [
      { id: "P1", baseName: "🔥 小火龍 (火系)", totalExp: 50000, initialLevel: 5, currentLevel: 54, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 245, totalSpEarned: 245, evoStage: 0, learnedMoves: {}, equippedMoves: [] },
      { id: "P2", baseName: "🐎 小火馬 (火系)", totalExp: 50000, initialLevel: 5, currentLevel: 54, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 245, totalSpEarned: 245, evoStage: 0, learnedMoves: {}, equippedMoves: [] },
      { id: "P3", baseName: "💧 水伊布 (水系)", totalExp: 20000, initialLevel: 5, currentLevel: 23, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 90, totalSpEarned: 90, evoStage: 1, learnedMoves: {}, equippedMoves: [] },
      { id: "P4", baseName: "⚡ 皮卡丘 (電系)", totalExp: 30000, initialLevel: 5, currentLevel: 35, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 120, totalSpEarned: 120, evoStage: 0, learnedMoves: {}, equippedMoves: [] }
    ];
  }`;

if (htmlContent.includes(oldAdminRoster)) {
  htmlContent = htmlContent.replace(oldAdminRoster, newAdminRoster);
  console.log('✅ 成功加入⚡ 皮卡丘 (電系) 至管理員預設測試隊伍！');
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
