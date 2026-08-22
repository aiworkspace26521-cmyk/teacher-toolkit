const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log(`================================================================`);
console.log(`🎯 套用 1對1 精準流派連攜 (1-to-1 Stance Synergy) 與 Roster 智慧防覆蓋對齊`);
console.log(`================================================================`);

// 1. Refine calculateMoveSynergyV33 for strict 1-to-1 or 1-to-2 Stance Link
const newEngineCode = `function calculateMoveSynergyV33(learnedMovesMap, optName, tier, role, pkmnType) {
  if (!learnedMovesMap || tier < 2) return null;
  var learnedKeys = Object.keys(learnedMovesMap);
  if (learnedKeys.length === 0) return null;

  var learnedNames = learnedKeys.map(function(k) {
    var rec = learnedMovesMap[k];
    var nameStr = (rec && typeof rec === 'object' && rec.name) ? rec.name : String(k);
    return nameStr.replace(/^(ATK|SPA|BUF|DIS|ULT):/, '');
  });

  // 生存/輔助防禦招式（如守住、充電、變硬、替身）不顯示攻擊性連攜，保持介面乾淨
  if (/^守住$|^替身$|^充電$|^變硬$|^影子分身$|^哈欠$|^叫聲$|^甩尾$/.test(optName)) {
    return null;
  }

  // 1. 流派一：【先制速攻流】(前置：電光一閃、水流噴射、高速移動) -> 獨家連攜 伏特攻擊/二連擊/疾風
  var hasSpeedStance = learnedNames.some(function(n) { return /^電光一閃$|^水流噴射$|^高速移動$/.test(n); });
  if (hasSpeedStance && /伏特攻擊|疾風|燕返|高速/.test(optName)) {
    return { badge: '🔗 速攻連攜 SP-1', color: '#2980b9' };
  }

  // 2. 流派二：【控場元素流】(前置：電擊、水槍、火花、細雪、藤鞭) -> 獨家連攜 瘋狂伏特/十萬伏特/水炮
  var hasControlStance = learnedNames.some(function(n) { return /^電擊$|^水槍$|^火花$|^細雪$|^藤鞭$|^催眠粉$/.test(n); });
  if (hasControlStance && /瘋狂伏特|十萬伏特|打雷|瘋狂雷霆|水炮|大字爆|暴風雪|日光束/.test(optName)) {
    var elemPct = tier >= 4 ? '+30%' : '+25%';
    return { badge: '🔗 麻痺連攜 ' + elemPct, color: '#f39c12' };
  }

  // 3. 流派三：【重擊破甲流】(前置：撞擊、抓、拍擊) -> 獨家連攜 雷電拳 (T2) / 伏特交換/電擊波 (T3)
  var hasHeavyStance = learnedNames.some(function(n) { return /^撞擊$|^抓$|^拍擊$/.test(n); });
  if (hasHeavyStance && /雷電拳|伏特交換|電擊波|攀瀑|閃焰衝鋒|近身戰|雷霆爆發|終極衝擊/.test(optName)) {
    var penPct = tier >= 4 ? '防穿+30%' : '防穿+20%';
    return { badge: '🔗 破甲連攜 ' + penPct, color: '#e74c3c' };
  }

  // 4. 流派四：【彈射爆破流】(前置：電球、水之波動、覺醒力量) -> 獨家連攜 伏特攻擊/十萬伏特
  var hasBurstStance = learnedNames.some(function(n) { return /^電球$|^水之波動$|^覺醒力量$/.test(n); });
  if (hasBurstStance && /伏特攻擊|十萬伏特|電弧脈衝|閃電爆裂|極致打雷|起源波動|水漩渦/.test(optName)) {
    return { badge: '🔗 彈射連攜 範圍+1', color: '#e67e22' };
  }

  // 5. 流派五：【弱點降防流】(前置：甩尾、叫聲、挑釁、煙幕) -> 獨家連攜 二連擊
  var hasDebuffStance = learnedNames.some(function(n) { return /^甩尾$|^叫聲$|^挑釁$|^煙幕$/.test(n); });
  if (hasDebuffStance) {
    if (/二連擊|攀瀑|閃焰衝鋒|近身戰/.test(optName)) {
      return { badge: '🔗 破防連攜 物理傷+20%', color: '#27ae60' };
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
  console.log('✅ 成功精準化 calculateMoveSynergyV33 1對1 流派連攜！');
}

// 2. Add Smart Roster Merge right after recalculateStudentState (line 1478)
const markerAfterStateRecalc = `  if (!globalData) {`;
const smartMergeCode = `  // Seamlessly merge saved skill tree state (learnedMoves, skillTree, skillPoints) into active roster
  var savedRosterStr = localStorage.getItem("kpi_roster_" + studentId);
  if (savedRosterStr && globalData && globalData.roster && globalData.roster.length > 0) {
    try {
      var savedRoster = JSON.parse(savedRosterStr);
      if (Array.isArray(savedRoster)) {
        for (var sRi = 0; sRi < savedRoster.length; sRi++) {
          var sPkmn = savedRoster[sRi];
          var matchPkmn = globalData.roster.find(function(p){
            return p.id === sPkmn.id || (p.baseName && sPkmn.baseName && (typeof getRawName === 'function' ? getRawName(p.baseName) === getRawName(sPkmn.baseName) : p.baseName === sPkmn.baseName));
          });
          if (matchPkmn) {
            if (sPkmn.learnedMoves && Object.keys(sPkmn.learnedMoves).length > 0) matchPkmn.learnedMoves = sPkmn.learnedMoves;
            if (sPkmn.skillTree) matchPkmn.skillTree = sPkmn.skillTree;
            if (sPkmn.secondPicks) matchPkmn.secondPicks = sPkmn.secondPicks;
            if (sPkmn.modifiers) matchPkmn.modifiers = sPkmn.modifiers;
            if (sPkmn.skillPoints !== undefined) matchPkmn.skillPoints = sPkmn.skillPoints;
            if (sPkmn.totalSpEarned !== undefined) matchPkmn.totalSpEarned = sPkmn.totalSpEarned;
          }
        }
      }
    } catch(eRoster) {}
  }

  ` + markerAfterStateRecalc;

if (htmlContent.includes(markerAfterStateRecalc) && !htmlContent.includes('Seamlessly merge saved skill tree state')) {
  htmlContent = htmlContent.replace(markerAfterStateRecalc, smartMergeCode);
  console.log('✅ 成功加入 recalculateStudentState 後的 Smart Roster Merge 邏輯！');
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
