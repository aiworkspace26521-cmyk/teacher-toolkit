const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log(`================================================================`);
console.log(`🚀 全面建構 v3.3 全 18 屬性 x 雙屬性 全軌道 (ATK/SPA/BUF/DIS/ULT) 系統化招式連攜引擎`);
console.log(`================================================================`);

// Universal Synergy Engine function
const universalEngineCode = `
function calculateMoveSynergyV33(learnedMovesMap, optName, tier, role, pkmnType) {
  if (!learnedMovesMap || tier < 2) return null;
  var learnedKeys = Object.keys(learnedMovesMap);
  if (learnedKeys.length === 0) return null;

  var learnedNames = learnedKeys.map(function(k) {
    var rec = learnedMovesMap[k];
    return (rec && rec.name) ? rec.name : k.replace(/^(ATK|SPA|BUF|DIS|ULT):/, '');
  });

  // 1. 先制速攻連攜 (Speed / Priority Link)
  var hasSpeedPre = learnedNames.some(function(n) { return /電光一閃|水流噴射|影子分身|高速|二連擊|飛翔|疾風|電擊波|電球|神速|燕返/.test(n); });
  if (hasSpeedPre && /雷電拳|伏特攻擊|二連擊|瘋狂伏特|伏特交換|電球|電漿閃光|水流尾|攀瀑|烈焰衝擊|飛葉快刀|劈開|泰山壓頂/.test(optName)) {
    return { badge: '🔗 速攻連攜 SP-1', color: '#2980b9' };
  }

  // 2. 元素控場連攜 (Element / Control Link)
  var hasElemPre = learnedNames.some(function(n) { return /電擊|水槍|火花|細雪|藤鞭|念力|毒針|起風|大地|金屬|暗影|妖精|龍之|撞擊/.test(n); });
  if (hasElemPre && /十萬伏特|打雷|瘋狂雷霆|水炮|大字爆|日光束|暴風雪|地震|加農光炮|精神強念|龍之波動|破壞光線|瘋狂伏特/.test(optName)) {
    var elemPct = tier >= 4 ? '+30%' : '+25%';
    return { badge: '🔗 元素連攜 ' + elemPct, color: '#f39c12' };
  }

  // 3. 破甲重擊連攜 (Armor Penetration / Heavy Physical Link)
  var hasHeavyPre = learnedNames.some(function(n) { return /撞擊|抓|甩尾|叫聲|拍擊|泰山壓頂|劈開|猛撞|近身戰|地震/.test(n); });
  if (hasHeavyPre && (role === 'ATK' || /雷電拳|伏特攻擊|瘋狂雷霆|雷霆爆發|攀瀑|水流裂破|閃焰衝鋒|近身戰|終極衝擊/.test(optName))) {
    var penPct = tier >= 4 ? '防穿+30%' : '防穿+20%';
    return { badge: '🔗 破甲連攜 ' + penPct, color: '#e74c3c' };
  }

  // 4. 領域場地連攜 (Field / Terrain Link)
  if (/電氣場地|青草場地|薄霧場地|精神場地|求雨|大晴天|沙暴|雪景/.test(optName)) {
    return { badge: '🔗 領域連攜 全隊增傷+15%', color: '#8e44ad' };
  }

  // 5. 干擾弱點連攜 (Debuff / Disruption Link)
  var hasDebuffPre = learnedNames.some(function(n) { return /叫聲|甩尾|挑釁|煙幕|黑霧|劇毒|哈欠|怪異之光|黑色眼光/.test(n); });
  if (hasDebuffPre && (role === 'DIS' || /電磁波|劇毒|挑釁|滅亡之歌|清除之煙|吹飛|咆哮|壓制/.test(optName))) {
    return { badge: '🔗 弱點壓制 控場+1回合', color: '#16a085' };
  }

  // 6. 奧義共鳴連攜 (Ultimate Resonance Link)
  if (tier === 5) {
    return { badge: '🔗 奧義共鳴 傷害+35%', color: '#d35400' };
  }

  // 預設通用屬性共鳴 (Fallback Type Resonance)
  return { badge: '🔗 屬性連攜 威力+20%', color: '#f39c12' };
}
`;

if (!htmlContent.includes('function calculateMoveSynergyV33')) {
  htmlContent = htmlContent.replace('function countPicks(', universalEngineCode + '\nfunction countPicks(');
}

// Replace the old synergy badge block in renderSkillTree
const oldBadgeBlock = `// v3.3 Dynamic Synergy Badge Rendering (T2~T5 Full Matrix Support)
          if (isTierUnlocked && !isTierLocked && t >= 2 && pkmn.learnedMoves) {
            var learnedNames = Object.keys(pkmn.learnedMoves);
            var hasElementControl = learnedNames.some(function(k){ return /電擊|水槍|火花|細雪|藤鞭/.test(k); });
            var hasSpeed = learnedNames.some(function(k){ return /電光一閃|水流噴射|影子分身|高速/.test(k); });
            var hasPhys = learnedNames.some(function(k){ return /撞擊|抓|雷電拳|二連擊/.test(k); });

            if (hasElementControl && (optName === '瘋狂伏特' || optName === '十萬伏特' || optName === '打雷' || optName === '瘋狂雷霆' || optName === '水炮' || optName === '大字爆' || optName === '日光束')) {
              var bonusPct = t >= 4 ? '+30%' : '+25%';
              canvasHtml += ' <span style="font-size:10px;background:#f39c12;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 元素連攜 ' + bonusPct + '</span>';
            } else if (hasSpeed && (optName === '伏特交換' || optName === '電球' || optName === '電漿閃光' || optName === '水流尾')) {
              canvasHtml += ' <span style="font-size:10px;background:#2980b9;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 速攻連攜 SP-1</span>';
            } else if (hasPhys && (optName === '雷電拳' || optName === '伏特攻擊' || optName === '雷霆爆發' || optName === '攀瀑')) {
              var penPct = t >= 4 ? '防穿+30%' : '防穿+20%';
              canvasHtml += ' <span style="font-size:10px;background:#e74c3c;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 破甲連攜 ' + penPct + '</span>';
            } else if (optName === '電氣場地' || optName === '青草場地') {
              canvasHtml += ' <span style="font-size:10px;background:#8e44ad;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 領域連攜 全隊增傷+15%</span>';
            } else if (t === 5 && (optName === '交錯閃電' || optName === '千雷轟頂' || optName === '交錯雷霆毀滅' || optName === '起源波動')) {
              canvasHtml += ' <span style="font-size:10px;background:#d35400;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 奧義共鳴 傷害+35%</span>';
            }
          }`;

const newBadgeBlock = `// v3.3 Universal Dynamic Synergy Engine
          if (isTierUnlocked && !isTierLocked && t >= 2 && pkmn.learnedMoves) {
            var synResult = calculateMoveSynergyV33(pkmn.learnedMoves, optName, t, activeRoleUpper, pkmn.type || pkmn.types);
            if (synResult) {
              canvasHtml += ' <span style="font-size:10px;background:' + synResult.color + ';color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">' + synResult.badge + '</span>';
            }
          }`;

if (htmlContent.includes('// v3.3 Dynamic Synergy Badge Rendering')) {
  htmlContent = htmlContent.replace(oldBadgeBlock, newBadgeBlock);
  console.log('✅ 成功替換舊版條件判斷為通用動態連攜計算引擎！');
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
