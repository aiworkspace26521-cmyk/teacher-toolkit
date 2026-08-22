const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log(`================================================================`);
console.log(`🎯 全面擴展 calculateMoveSynergyV33 支持全 18 屬性 T3~T5 破甲/速攻/元素連攜`);
console.log(`================================================================`);

const newEngineCode = `function calculateMoveSynergyV33(learnedMovesMap, optName, tier, role, pkmnType) {
  if (!learnedMovesMap || tier < 2) return null;
  var learnedKeys = Object.keys(learnedMovesMap);
  if (learnedKeys.length === 0) return null;

  var learnedNames = learnedKeys.map(function(k) {
    var rec = learnedMovesMap[k];
    var nameStr = (rec && typeof rec === 'object' && rec.name) ? rec.name : String(k);
    return nameStr.replace(/^(ATK|SPA|BUF|DIS|ULT):/, '');
  });

  // 1. 流派一：【先制速攻流】(前置：電光一閃、水流噴射、高速移動)
  var hasSpeedStance = learnedNames.some(function(n) { return /電光一閃|水流噴射|高速移動|影子分身/.test(n); });
  if (hasSpeedStance && /伏特攻擊|二連擊|伏特交換|電漿閃光|疾風|燕返|高速|十萬伏特|打雷|烈焰衝擊|飛葉快刀/.test(optName)) {
    return { badge: '🔗 速攻連攜 SP-1', color: '#2980b9' };
  }

  // 2. 流派二：【控場元素流】(前置：電擊、水槍、火花、細雪、藤鞭)
  var hasControlStance = learnedNames.some(function(n) { return /電擊|水槍|火花|細雪|藤鞭|催眠粉/.test(n); });
  if (hasControlStance && /瘋狂伏特|十萬伏特|打雷|瘋狂雷霆|伏特交換|電擊波|水炮|大字爆|暴風雪|日光束|炎牙/.test(optName)) {
    var elemPct = tier >= 4 ? '+30%' : '+25%';
    return { badge: '🔗 麻痺連攜 ' + elemPct, color: '#f39c12' };
  }

  // 3. 流派三：【重擊破甲流】(前置：撞擊、抓、拍擊、雷電拳)
  var hasHeavyStance = learnedNames.some(function(n) { return /撞擊|抓|拍擊|雷電拳|火焰拳|冷凍拳/.test(n); });
  if (hasHeavyStance) {
    if (/雷電拳|伏特交換|電擊波|瘋狂伏特|打雷|電漿閃光|攀瀑|閃焰衝鋒|近身戰|雷霆爆發|終極衝擊|炎牙|烈焰衝擊|摔打|泰山壓頂|十萬伏特/.test(optName)) {
      var penPct = tier >= 4 ? '防穿+30%' : '防穿+20%';
      return { badge: '🔗 破甲連攜 ' + penPct, color: '#e74c3c' };
    }
    if (/光牆|替身|守住|充電/.test(optName)) {
      return { badge: '🔗 防護連攜 減傷+15%', color: '#8e44ad' };
    }
  }

  // 4. 流派四：【彈射爆破流】(前置：電球、水之波動、覺醒力量)
  var hasBurstStance = learnedNames.some(function(n) { return /電球|水之波動|覺醒力量/.test(n); });
  if (hasBurstStance && /伏特攻擊|十萬伏特|伏特交換|電擊波|打雷|電弧脈衝|閃電爆裂|極致打雷|起源波動|水漩渦/.test(optName)) {
    return { badge: '🔗 彈射連攜 範圍+1', color: '#e67e22' };
  }

  // 5. 流派五：【弱點降防流】(前置：甩尾、叫聲、挑釁、煙幕)
  var hasDebuffStance = learnedNames.some(function(n) { return /甩尾|叫聲|挑釁|煙幕/.test(n); });
  if (hasDebuffStance) {
    if (/雷電拳|伏特攻擊|二連擊|瘋狂伏特|十萬伏特|伏特交換|電擊波|攀瀑|閃焰衝鋒|近身戰|炎牙|烈焰衝擊|摔打/.test(optName)) {
      return { badge: '🔗 破防連攜 物理傷+20%', color: '#27ae60' };
    }
    if (/充電|光合作用|自我再生|光牆|替身/.test(optName)) {
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
  console.log('✅ 成功更新 calculateMoveSynergyV33 支持全 18 屬性所有招式！');
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
