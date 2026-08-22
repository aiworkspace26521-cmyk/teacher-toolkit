const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log(`================================================================`);
console.log(`🔧 修復問題 1（甩尾 T2 破防連攜）與問題 2（招式學習狀態持久化與零遺失）`);
console.log(`================================================================`);

// 1. Update calculateMoveSynergyV33 to include 甩尾 [弱點降防] -> 物理招式 [🔗 破防連攜 物理傷+20%]
const newEngineCode = `function calculateMoveSynergyV33(learnedMovesMap, optName, tier, role, pkmnType) {
  if (!learnedMovesMap || tier < 2) return null;
  var learnedKeys = Object.keys(learnedMovesMap);
  if (learnedKeys.length === 0) return null;

  var learnedNames = learnedKeys.map(function(k) {
    var rec = learnedMovesMap[k];
    var nameStr = (rec && typeof rec === 'object' && rec.name) ? rec.name : String(k);
    return nameStr.replace(/^(ATK|SPA|BUF|DIS|ULT):/, '');
  });

  // 生存/輔助防禦招式（如守住、變硬、替身）不顯示攻擊性連攜，保持介面乾淨
  if (/^守住$|^替身$|^變硬$|^影子分身$|^哈欠$/.test(optName)) {
    return null;
  }

  // 1. 流派一：【先制速攻流】(前置：電光一閃、水流噴射、高速移動)
  var hasSpeedStance = learnedNames.some(function(n) { return /電光一閃|水流噴射|高速移動|影子分身/.test(n); });
  if (hasSpeedStance && /伏特攻擊|二連擊|伏特交換|電漿閃光|疾風|燕返|高速|十萬伏特/.test(optName)) {
    return { badge: '🔗 速攻連攜 SP-1', color: '#2980b9' };
  }

  // 2. 流派二：【控場元素流】(前置：電擊、水槍、火花、細雪、藤鞭)
  var hasControlStance = learnedNames.some(function(n) { return /電擊|水槍|火花|細雪|藤鞭|催眠粉/.test(n); });
  if (hasControlStance && /瘋狂伏特|十萬伏特|打雷|瘋狂雷霆|水炮|大字爆|暴風雪|日光束/.test(optName)) {
    var elemPct = tier >= 4 ? '+30%' : '+25%';
    return { badge: '🔗 麻痺連攜 ' + elemPct, color: '#f39c12' };
  }

  // 3. 流派三：【重擊破甲流】(前置：撞擊、抓、拍擊)
  var hasHeavyStance = learnedNames.some(function(n) { return /撞擊|抓|拍擊/.test(n); });
  if (hasHeavyStance && /雷電拳|攀瀑|閃焰衝鋒|近身戰|雷霆爆發|終極衝擊/.test(optName)) {
    var penPct = tier >= 4 ? '防穿+30%' : '防穿+20%';
    return { badge: '🔗 破甲連攜 ' + penPct, color: '#e74c3c' };
  }

  // 4. 流派四：【彈射爆破流】(前置：電球、水之波動、覺醒力量)
  var hasBurstStance = learnedNames.some(function(n) { return /電球|水之波動|覺醒力量/.test(n); });
  if (hasBurstStance && /伏特攻擊|十萬伏特|電弧脈衝|閃電爆裂|極致打雷|起源波動|水漩渦/.test(optName)) {
    return { badge: '🔗 彈射連攜 範圍+1', color: '#e67e22' };
  }

  // 5. 流派五：【弱點降防流】(前置：甩尾、叫聲、挑釁、煙幕)
  var hasDebuffStance = learnedNames.some(function(n) { return /甩尾|叫聲|挑釁|煙幕/.test(n); });
  if (hasDebuffStance) {
    if (/雷電拳|伏特攻擊|二連擊|瘋狂伏特|攀瀑|閃焰衝鋒|近身戰/.test(optName)) {
      return { badge: '🔗 破防連攜 物理傷+20%', color: '#27ae60' };
    }
    if (/充電|光合作用|自我再生/.test(optName)) {
      return { badge: '🔗 蓄能連攜 SP回復+1', color: '#8e44ad' };
    }
    if (role === 'DIS' || /電磁波|劇毒|清除之煙|黑霧|滅亡之歌|咆哮/.test(optName)) {
      return { badge: '🔗 弱點壓制 控場+1回合', color: '#16a085' };
    }
  }

  // 6. 領域場地專屬連攜
  if (/電氣場地|青草場地|薄霧場地|精神場地|求雨|大晴天|沙暴|雪景/.test(optName)) {
    return { badge: '🔗 領域連攜 全隊增傷+15%', color: '#8e44ad' };
  }

  // 7. 頂階奧義共鳴 (T5 專屬)
  if (tier === 5 && (role === 'ULT' || /交錯閃電|千雷轟頂|交錯雷霆毀滅|起源水之毀滅|森林神毀滅|創世毀滅/.test(optName))) {
    return { badge: '🔗 奧義共鳴 傷害+35%', color: '#d35400' };
  }

  return null;
}`;

const oldEngineRegex = /function calculateMoveSynergyV33\([\s\S]*?\n\}/;
if (oldEngineRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(oldEngineRegex, newEngineCode);
  console.log('✅ 成功更新 calculateMoveSynergyV33 加入 甩尾 [弱點降防流] 破防連攜！');
}

// 2. Fix line 10113 braces & update saveSkillTreeState to write to localStorage for instant local persistence
const oldInitLine = `if (!pkmn.learnedMoves) pkmn.learnedMoves = {}; pkmn.secondPicks = {}; pkmn.modifiers = {};`;
const newInitLine = `if (!pkmn.learnedMoves) pkmn.learnedMoves = {}; if (!pkmn.secondPicks) pkmn.secondPicks = {}; if (!pkmn.modifiers) pkmn.modifiers = {};`;
htmlContent = htmlContent.replace(oldInitLine, newInitLine);

const oldSaveState = `function saveSkillTreeState() {
  if (!_skillTreeDirty || !_skillTreePkmnId) return;
  scheduleStudentFieldUpdate({ roster: globalData.roster });
  _skillTreeDirty = false;
}`;

const newSaveState = `function saveSkillTreeState() {
  if (!_skillTreePkmnId || !globalData) return;
  var sid = globalData.studentId || 'Admin';
  try {
    localStorage.setItem("kpi_roster_" + sid, JSON.stringify(globalData.roster));
  } catch(e) { console.warn("Local roster save error:", e); }
  if (_skillTreeDirty) {
    scheduleStudentFieldUpdate({ roster: globalData.roster });
    _skillTreeDirty = false;
  }
}`;

htmlContent = htmlContent.replace(oldSaveState, newSaveState);

// 3. Ensure closeModal('skillTreeModal') calls saveSkillTreeState() first
htmlContent = htmlContent.replace(
  `onclick="closeModal('skillTreeModal');saveSkillTreeState();"`,
  `onclick="saveSkillTreeState();closeModal('skillTreeModal');"`
);

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ 成功更新 saveSkillTreeState() 雙重持久化 (localStorage + Firestore)，解決關閉分頁後招式遺失問題！');
