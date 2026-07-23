// 招式培養與學習系統 — 技能樹靜態資料
// 載入 kpi-dashboard.html 之後、pokemon-gen2-9.js 之後
(function(){

// ========== 技能樹節點定義輔助 ==========
// 五大樹系代號：ATK(攻擊) / SPA(特攻) / BUF(強化) / DIS(干擾) / ULT(奧義)
// 階層 T1~T5

var TIER_SP_COST = { 1: 0, 2: 5, 3: 12, 4: 20, 5: 30 };
var TIER_SP_THRESHOLD = { 1: 0, 2: 5, 3: 12, 4: 20, 5: 30 };
var TIER_FP_COST = { 1: 5, 2: 10, 3: 20, 4: 35, 5: 50 };
var BUF_FP_COST = { 1: 3, 2: 5, 3: 10, 4: 15, 5: 25 };
var DIS_FP_COST = { 1: 3, 2: 5, 3: 10, 4: 15, 5: 25 };
var ULT_FP_COST = { 1: 10, 2: 20, 3: 35, 4: 50, 5: 80 };
var MAX_MOVE_LEVEL = { 1: 10, 2: 8, 3: 5, 4: 3, 5: 3 };

// ========== 手工設計技能樹 ==========

var SPECIES_SKILL_TREE = {};

function addSpecies(name, data) {
  SPECIES_SKILL_TREE[name] = data;
}

// --- 噴火龍（火/飛行）---
addSpecies("噴火龍", {
  types: ["火", "飛行"],
  stages: [0, 1, 2],
  trees: {
    atk: { label: "攻擊系", nodes: [
      { tier: 1, name: "抓",       spCost: 1, prereqs: [] },
      { tier: 1, name: "叫聲",     spCost: 1, prereqs: [] },
      { tier: 1, name: "瞪眼",     spCost: 1, prereqs: [] },
      { tier: 2, name: "翅膀攻擊", spCost: 2, prereqs: ["抓"] },
      { tier: 2, name: "龍息",     spCost: 2, prereqs: ["抓"], evolveStage: 1 },
      { tier: 3, name: "劈開",     spCost: 3, prereqs: ["翅膀攻擊"] },
      { tier: 3, name: "龍爪",     spCost: 3, prereqs: ["龍息"], evolveStage: 1 },
      { tier: 4, name: "勇鳥猛攻", spCost: 4, prereqs: ["翅膀攻擊"], evolveStage: 2 },
      { tier: 5, name: "V熱焰",   spCost: 5, prereqs: ["劈開","噴射火焰"], evolveStage: 2 }
    ], passives: [
      { tier: 2, effect: "物理傷害 +3%" },
      { tier: 4, effect: "會心率 +5%" }
    ]},
    spa: { label: "特攻系", nodes: [
      { tier: 1, name: "火花",     spCost: 1, prereqs: [] },
      { tier: 1, name: "煙幕",     spCost: 1, prereqs: [] },
      { tier: 2, name: "火焰旋渦", spCost: 2, prereqs: ["火花"] },
      { tier: 2, name: "鬼火",     spCost: 2, prereqs: ["煙幕"] },
      { tier: 3, name: "噴射火焰", spCost: 3, prereqs: ["火焰旋渦"] },
      { tier: 3, name: "熱風",     spCost: 3, prereqs: ["火焰旋渦"], evolveStage: 1 },
      { tier: 4, name: "大字爆",   spCost: 4, prereqs: ["噴射火焰"], evolveStage: 2 },
      { tier: 4, name: "過熱",     spCost: 4, prereqs: ["噴射火焰"], evolveStage: 2 },
      { tier: 5, name: "爆炸烈焰", spCost: 5, prereqs: ["大字爆"], evolveStage: 2 }
    ], passives: [
      { tier: 2, effect: "特攻 +3%" },
      { tier: 4, effect: "火系招式 +5%" }
    ]},
    buf: { label: "強化系", nodes: [
      { tier: 1, name: "變硬",     spCost: 1, prereqs: [] },
      { tier: 1, name: "叫聲",     spCost: 1, prereqs: [] },
      { tier: 2, name: "影子分身", spCost: 2, prereqs: ["變硬"] },
      { tier: 2, name: "高速移動", spCost: 2, prereqs: ["變硬"] },
      { tier: 3, name: "劍舞",     spCost: 3, prereqs: ["高速移動"] },
      { tier: 3, name: "龍之舞",   spCost: 3, prereqs: ["影子分身"], evolveStage: 1 },
      { tier: 4, name: "守住",     spCost: 4, prereqs: ["劍舞"], evolveStage: 2 },
      { tier: 4, name: "大晴天",   spCost: 4, prereqs: ["劍舞"], evolveStage: 2 },
      { tier: 5, name: "腹鼓",     spCost: 5, prereqs: ["龍之舞","守住"], evolveStage: 2 }
    ], passives: [
      { tier: 2, effect: "回復量 +10%" },
      { tier: 4, effect: "火系招式 +5%" }
    ]},
    dis: { label: "干擾系", nodes: [
      { tier: 1, name: "煙幕",     spCost: 1, prereqs: [] },
      { tier: 1, name: "瞪眼",     spCost: 1, prereqs: [] },
      { tier: 2, name: "鬼火",     spCost: 2, prereqs: ["煙幕"] },
      { tier: 2, name: "火焰旋渦", spCost: 2, prereqs: ["煙幕"] },
      { tier: 3, name: "怪異之光", spCost: 3, prereqs: ["鬼火"] },
      { tier: 3, name: "熱風",     spCost: 3, prereqs: ["火焰旋渦"], evolveStage: 1 },
      { tier: 4, name: "劇毒",     spCost: 4, prereqs: ["怪異之光"], evolveStage: 2 },
      { tier: 4, name: "吹飛",     spCost: 4, prereqs: ["怪異之光"], evolveStage: 2 },
      { tier: 5, name: "滅亡之歌", spCost: 5, prereqs: ["劇毒"], evolveStage: 2 }
    ], passives: [
      { tier: 2, effect: "狀態命中 +5%" },
      { tier: 4, effect: "對手弱化 +5%" }
    ]},
    ult: { label: "奧義系", nodes: [
      { tier: 1, name: "高速星星",   spCost: 1, prereqs: [] },
      { tier: 2, name: "劈開",       spCost: 2, prereqs: ["高速星星"] },
      { tier: 3, name: "噴射火焰Pro", spCost: 3, prereqs: ["劈開"], evolveStage: 1 },
      { tier: 4, name: "大字爆Pro",   spCost: 4, prereqs: ["噴射火焰Pro"], evolveStage: 2 },
      { tier: 5, name: "燃燼衝鋒",    spCost: 5, prereqs: ["大字爆Pro"], evolveStage: 2 }
    ], passives: [
      { tier: 3, effect: "奧義威力 +10%" }
    ]}
  }
});

// --- 超夢（超能力/傳說）---
addSpecies("超夢", {
  types: ["超能力"],
  stages: [0, 1],
  trees: {
    atk: { label: "攻擊系", nodes: [
      { tier: 1, name: "拍擊",     spCost: 1, prereqs: [] },
      { tier: 1, name: "瞪眼",     spCost: 1, prereqs: [] },
      { tier: 2, name: "影子偷襲", spCost: 2, prereqs: ["拍擊"] },
      { tier: 2, name: "意念頭錘", spCost: 2, prereqs: ["拍擊"] },
      { tier: 3, name: "地震",     spCost: 3, prereqs: ["意念頭錘"] },
      { tier: 3, name: "咬碎",     spCost: 3, prereqs: ["影子偷襲"] },
      { tier: 4, name: "近身戰",   spCost: 4, prereqs: ["地震"] },
      { tier: 5, name: "蠻力",     spCost: 5, prereqs: ["近身戰"] }
    ], passives: [
      { tier: 2, effect: "物理傷害 +3%" },
      { tier: 4, effect: "會心率 +5%" }
    ]},
    spa: { label: "特攻系", nodes: [
      { tier: 1, name: "念力",     spCost: 1, prereqs: [] },
      { tier: 1, name: "幻象光線", spCost: 1, prereqs: [] },
      { tier: 2, name: "暗影球",   spCost: 2, prereqs: ["念力"] },
      { tier: 2, name: "十萬伏特", spCost: 2, prereqs: ["幻象光線"] },
      { tier: 3, name: "幻象術",   spCost: 3, prereqs: ["暗影球"] },
      { tier: 3, name: "冰凍光束", spCost: 3, prereqs: ["十萬伏特"] },
      { tier: 4, name: "精神衝擊", spCost: 4, prereqs: ["幻象術"] },
      { tier: 4, name: "打雷",     spCost: 4, prereqs: ["冰凍光束"] },
      { tier: 5, name: "亞空裂斬", spCost: 5, prereqs: ["精神衝擊"] }
    ], passives: [
      { tier: 2, effect: "特攻 +3%" },
      { tier: 4, effect: "超能力系 +5%" }
    ]},
    buf: { label: "強化系", nodes: [
      { tier: 1, name: "搖尾巴",   spCost: 1, prereqs: [] },
      { tier: 1, name: "變硬",     spCost: 1, prereqs: [] },
      { tier: 2, name: "瞬間失憶", spCost: 2, prereqs: ["變硬"] },
      { tier: 2, name: "充電光束", spCost: 2, prereqs: ["搖尾巴"] },
      { tier: 3, name: "冥想",     spCost: 3, prereqs: ["瞬間失憶"] },
      { tier: 3, name: "自我再生", spCost: 3, prereqs: ["充電光束"] },
      { tier: 4, name: "替身",     spCost: 4, prereqs: ["冥想"] },
      { tier: 4, name: "守住",     spCost: 4, prereqs: ["自我再生"] },
      { tier: 5, name: "精神場地", spCost: 5, prereqs: ["冥想","替身"] }
    ], passives: [
      { tier: 2, effect: "回復量 +10%" },
      { tier: 4, effect: "超能力系 +5%" }
    ]},
    dis: { label: "干擾系", nodes: [
      { tier: 1, name: "念力",     spCost: 1, prereqs: [] },
      { tier: 1, name: "瞪眼",     spCost: 1, prereqs: [] },
      { tier: 2, name: "充電光束", spCost: 2, prereqs: ["念力"] },
      { tier: 2, name: "電磁波",   spCost: 2, prereqs: ["瞪眼"] },
      { tier: 3, name: "怪異之光", spCost: 3, prereqs: ["電磁波"] },
      { tier: 3, name: "劇毒",     spCost: 3, prereqs: ["充電光束"] },
      { tier: 4, name: "戲法空間", spCost: 4, prereqs: ["怪異之光"] },
      { tier: 4, name: "特性交換", spCost: 4, prereqs: ["劇毒"] },
      { tier: 5, name: "重力",     spCost: 5, prereqs: ["戲法空間","特性交換"] }
    ], passives: [
      { tier: 2, effect: "狀態命中 +5%" },
      { tier: 4, effect: "對手弱化 +5%" }
    ]},
    ult: { label: "奧義系", nodes: [
      { tier: 1, name: "高速星星",   spCost: 1, prereqs: [] },
      { tier: 2, name: "覺醒力量",   spCost: 2, prereqs: ["高速星星"] },
      { tier: 3, name: "暗影球Pro",  spCost: 3, prereqs: ["覺醒力量"] },
      { tier: 4, name: "波導彈",     spCost: 4, prereqs: ["暗影球Pro"] },
      { tier: 5, name: "精神擊破",   spCost: 5, prereqs: ["波導彈"] }
    ], passives: [
      { tier: 3, effect: "奧義威力 +10%" }
    ]}
  }
});

// --- 皮卡丘（電）---
addSpecies("皮卡丘", {
  types: ["電"],
  stages: [0, 1],
  trees: {
    atk: { label: "攻擊系", nodes: [
      { tier: 1, name: "抓",       spCost: 1, prereqs: [] },
      { tier: 1, name: "叫聲",     spCost: 1, prereqs: [] },
      { tier: 1, name: "搖尾巴",   spCost: 1, prereqs: [] },
      { tier: 2, name: "電光一閃", spCost: 2, prereqs: ["抓"] },
      { tier: 2, name: "影子偷襲", spCost: 2, prereqs: ["抓"] },
      { tier: 3, name: "鐵尾",     spCost: 3, prereqs: ["電光一閃"] },
      { tier: 3, name: "劈開",     spCost: 3, prereqs: ["電光一閃"] },
      { tier: 4, name: "雷電拳",   spCost: 4, prereqs: ["鐵尾"], evolveStage: 1 }
    ], passives: [
      { tier: 2, effect: "物理傷害 +3%" }
    ]},
    spa: { label: "特攻系", nodes: [
      { tier: 1, name: "電擊",     spCost: 1, prereqs: [] },
      { tier: 1, name: "叫聲",     spCost: 1, prereqs: [] },
      { tier: 2, name: "電球",     spCost: 2, prereqs: ["電擊"] },
      { tier: 2, name: "電磁波",   spCost: 2, prereqs: ["電擊"] },
      { tier: 3, name: "十萬伏特", spCost: 3, prereqs: ["電球"] },
      { tier: 3, name: "放電",     spCost: 3, prereqs: ["電球"] },
      { tier: 4, name: "打雷",     spCost: 4, prereqs: ["十萬伏特"], evolveStage: 1 },
      { tier: 4, name: "伏特交換", spCost: 4, prereqs: ["十萬伏特"], evolveStage: 1 },
      { tier: 5, name: "電磁炮",   spCost: 5, prereqs: ["打雷"], evolveStage: 1 }
    ], passives: [
      { tier: 2, effect: "特攻 +3%" },
      { tier: 4, effect: "電系招式 +5%" }
    ]},
    buf: { label: "強化系", nodes: [
      { tier: 1, name: "搖尾巴",   spCost: 1, prereqs: [] },
      { tier: 1, name: "叫聲",     spCost: 1, prereqs: [] },
      { tier: 2, name: "高速移動", spCost: 2, prereqs: ["搖尾巴"] },
      { tier: 2, name: "影子分身", spCost: 2, prereqs: ["叫聲"] },
      { tier: 3, name: "充電",     spCost: 3, prereqs: ["高速移動"] },
      { tier: 3, name: "替身",     spCost: 3, prereqs: ["影子分身"] },
      { tier: 4, name: "守住",     spCost: 4, prereqs: ["充電"] }
    ], passives: [
      { tier: 2, effect: "回復量 +10%" }
    ]},
    dis: { label: "干擾系", nodes: [
      { tier: 1, name: "叫聲",     spCost: 1, prereqs: [] },
      { tier: 1, name: "搖尾巴",   spCost: 1, prereqs: [] },
      { tier: 2, name: "電磁波",   spCost: 2, prereqs: ["叫聲"] },
      { tier: 2, name: "影子分身", spCost: 2, prereqs: ["搖尾巴"] },
      { tier: 3, name: "怪異之光", spCost: 3, prereqs: ["電磁波"] },
      { tier: 4, name: "劇毒",     spCost: 4, prereqs: ["怪異之光"] }
    ], passives: [
      { tier: 2, effect: "狀態命中 +5%" }
    ]},
    ult: { label: "奧義系", nodes: [
      { tier: 1, name: "高速星星",  spCost: 1, prereqs: [] },
      { tier: 2, name: "電球",      spCost: 2, prereqs: ["高速星星"] },
      { tier: 3, name: "十萬伏特Pro", spCost: 3, prereqs: ["電球"] },
      { tier: 4, name: "打雷Pro",    spCost: 4, prereqs: ["十萬伏特Pro"], evolveStage: 1 },
      { tier: 5, name: "千萬伏特",   spCost: 5, prereqs: ["打雷Pro"], evolveStage: 1 }
    ], passives: [
      { tier: 3, effect: "奧義威力 +10%" }
    ]}
  }
});

// ========== 自動生成通用技能樹 ==========

var TYPE_BASED_MOVES = {
  "一般": { atk: ["撞擊","抓","電光一閃","摔打","劈開", "終極衝擊"], spa: ["高速星星","巨聲","破壞光線"] },
  "火":   { atk: ["火花","火焰拳","火焰踢","閃焰衝鋒"], spa: ["火花","噴射火焰","大字爆","過熱","熱風","魔法火焰"] },
  "水":   { atk: ["水槍","攀瀑","水之尾","噴射拳","潛水"], spa: ["水槍","水之波動","衝浪","水炮","熱水","濁流"] },
  "電":   { atk: ["電擊","雷電拳","瘋狂伏特","閃電強襲"], spa: ["電擊","電球","十萬伏特","打雷","放電","伏特交換","光澤電炮"] },
  "草":   { atk: ["藤鞭","飛葉快刀","種子炸彈","木角","日光刃"], spa: ["藤鞭","能量球","日光束","飛葉風暴","打草結"] },
  "冰":   { atk: ["冰礫","冰凍拳","冰凍牙","冰柱針","冰錐"], spa: ["冰凍光束","暴風雪","冰凍之風"] },
  "格鬥": { atk: ["碎岩","空手劈","音速拳","子彈拳","近身戰","吸取拳","十字劈"], spa: ["真氣彈","波導彈","吸收拳"] },
  "毒":   { atk: ["毒針","毒擊","十字毒刃","毒突","垃圾射擊"], spa: ["溶解液","污泥炸彈","污泥波"] },
  "地面": { atk: ["潑沙","泥巴射擊","重踏","地震","直衝鑽","挖洞"], spa: ["大地之力","泥巴炸彈"] },
  "飛行": { atk: ["翅膀攻擊","啄鑽","勇鳥猛攻","飛天","急轉彎"], spa: ["起風","暴風","熱風"] },
  "超能力": { atk: ["意念頭錘","精神利刃","拍擊"], spa: ["念力","幻象光線","精神強念","幻象術","預知未來","精神衝擊"] },
  "蟲":   { atk: ["蟲咬","十字剪","急速折返","超級角擊","飛彈針","連斬"], spa: ["蟲鳴","信號光束"] },
  "岩石": { atk: ["落石","岩崩","岩石封鎖","尖石攻擊","雙刃頭錘","岩石炮","岩石爆擊"], spa: [] },
  "幽靈": { atk: ["舌舔","暗影爪","影子偷襲","暗影偷襲"], spa: ["暗影球","禍不單行"] },
  "龍":   { atk: ["龍爪","逆鱗","龍尾","龍息"], spa: ["龍之波動","龍星群","時間咆哮","龍息"] },
  "惡":   { atk: ["抓","暗襲要害","咬碎","突襲","欺詐","狂舞揮打"], spa: ["惡之波動","拋下狠話","懲罰"] },
  "鋼":   { atk: ["金屬爪","鐵頭","鐵尾","重磅衝撞","子彈拳"], spa: ["加農光炮","鐵蹄光線","光澤電炮"] },
  "妖精": { atk: ["妖精之風","嬉鬧","吸收之吻"], spa: ["妖精之風","魔法閃耀","月亮之力","魔法火焰"] }
};

var GENERIC_ULT_T1 = ["高速星星","覺醒力量"];
var GENERIC_ULT_T2 = ["摔打","百萬噸重拳"];
var GENERIC_ULT_T3 = ["泰山壓頂","地球上投"];

function generateSkillTree(speciesName, types, atkStat, spaStat) {
  var primaryType = types[0];
  var secondaryType = types.length > 1 ? types[1] : null;
  var isPhysical = atkStat >= spaStat;
  var typeMoves = TYPE_BASED_MOVES[primaryType] || TYPE_BASED_MOVES["一般"];

  function buildTypeTree(isSpa) {
    var pool = isSpa ? (typeMoves.spa || []) : (typeMoves.atk || []);
    // 混入第二屬性招式
    if (secondaryType) {
      var secMoves = TYPE_BASED_MOVES[secondaryType];
      if (secMoves) {
        var secPool = isSpa ? (secMoves.spa || []) : (secMoves.atk || []);
        pool = pool.concat(secPool);
      }
    }
    // 去重
    var seen = {}, deduped = [];
    for (var i = 0; i < pool.length; i++) {
      if (!seen[pool[i]]) { seen[pool[i]] = true; deduped.push(pool[i]); }
    }
    return deduped;
  }

  function buildNodes(pool, startTier) {
    if (!pool || pool.length === 0) return [];
    var tierPool = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    for (var i = 0; i < pool.length; i++) {
      var m = pool[i];
      var moveDef = (typeof MOVE_DATABASE !== "undefined") ? MOVE_DATABASE[m] : null;
      var pwr = moveDef ? (moveDef.power || 0) : 40;
      // 根據威力分階
      var t = 1;
      if (pwr > 120) t = 5;
      else if (pwr > 90) t = 4;
      else if (pwr > 65) t = 3;
      else if (pwr > 40) t = 2;
      tierPool[t].push(m);
    }
    var nodes = [];
    var prevNames = [];
    for (var t = startTier; t <= 5; t++) {
      var tierMoves = tierPool[t] || [];
      for (var j = 0; j < tierMoves.length; j++) {
        var prereqs = prevNames.length > 0 ? [prevNames[prevNames.length - 1]] : [];
        nodes.push({ tier: t, name: tierMoves[j], spCost: Math.min(t, 5), prereqs: prereqs });
      }
      if (tierMoves.length > 0) prevNames = tierMoves;
    }
    return nodes;
  }

  function getSignatureMove(name) {
    var sigMap = (typeof SIGNATURE_MOVES !== "undefined") ? SIGNATURE_MOVES : {};
    if (sigMap[name]) return sigMap[name].name;
    return null;
  }

  // 建立五大樹系
  var atkPool = buildTypeTree(false);
  var spaPool = buildTypeTree(true);
  var bufPool = ["變硬","叫聲","瞪眼","搖尾巴","影子分身","高速移動","瞬間失憶","劍舞","冥想","替身","守住"];
  var disPool = ["煙幕","瞪眼","叫聲","電磁波","鬼火","劇毒","怪異之光","催眠粉","毒粉","吹飛"];
  var sigMove = getSignatureMove(speciesName);

  return {
    types: types,
    stages: [0, 1, 2],
    trees: {
      atk: { label: "攻擊系", nodes: buildNodes(atkPool, isPhysical ? 1 : 2),
        passives: [{ tier: 2, effect: "物理傷害 +3%" }, { tier: 4, effect: "會心率 +5%" }] },
      spa: { label: "特攻系", nodes: buildNodes(spaPool, isPhysical ? 2 : 1),
        passives: [{ tier: 2, effect: "特攻 +3%" }, { tier: 4, effect: "屬性加成 +5%" }] },
      buf: { label: "強化系", nodes: buildNodes(bufPool, 1),
        passives: [{ tier: 2, effect: "回復量 +10%" }, { tier: 4, effect: "被提升效果 +5%" }] },
      dis: { label: "干擾系", nodes: buildNodes(disPool, 1),
        passives: [{ tier: 2, effect: "狀態命中 +5%" }, { tier: 4, effect: "對手弱化 +5%" }] },
      ult: { label: "奧義系", nodes: (function(){
        var ultNodes = [
          { tier: 1, name: GENERIC_ULT_T1[0], spCost: 1, prereqs: [] },
          { tier: 2, name: GENERIC_ULT_T2[0], spCost: 2, prereqs: [GENERIC_ULT_T1[0]] }
        ];
        var topAtk = atkPool.length > 0 ? atkPool[atkPool.length - 1] : null;
        var topSpa = spaPool.length > 0 ? spaPool[spaPool.length - 1] : null;
        if (topAtk) ultNodes.push({ tier: 3, name: topAtk + "Pro", spCost: 3, prereqs: [GENERIC_ULT_T2[0]] });
        if (topSpa) ultNodes.push({ tier: 4, name: topSpa + "Pro", spCost: 4, prereqs: [topAtk + "Pro"] });
        if (sigMove) {
          ultNodes.push({ tier: 5, name: sigMove, spCost: 5, prereqs: [topSpa + "Pro"] });
        } else {
          ultNodes.push({ tier: 5, name: GENERIC_ULT_T3[0], spCost: 5, prereqs: [topSpa + "Pro"] });
        }
        return ultNodes;
      })(), passives: [{ tier: 3, effect: "奧義威力 +10%" }] }
    }
  };
}

// ========== 公開 API ==========

function getSkillTree(speciesName, types, atkStat, spaStat) {
  if (SPECIES_SKILL_TREE[speciesName]) {
    return JSON.parse(JSON.stringify(SPECIES_SKILL_TREE[speciesName]));
  }
  return generateSkillTree(speciesName, types || ["一般"], atkStat || 50, spaStat || 50);
}

function getTreeTypeLabel(treeType) {
  var labels = { atk: "攻擊系", spa: "特攻系", buf: "強化系", dis: "干擾系", ult: "奧義系" };
  return labels[treeType] || treeType;
}

function getTreeTypeEmoji(treeType) {
  var emojis = { atk: "✧", spa: "✦", buf: "✤", dis: "✦", ult: "★" };
  return emojis[treeType] || "";
}

function getTierFpCost(treeType, tier) {
  if (treeType === "buf" || treeType === "dis") {
    var bufMap = { 1: 3, 2: 5, 3: 10, 4: 15, 5: 25 };
    return bufMap[tier] || 5;
  }
  if (treeType === "ult") {
    var ultMap = { 1: 10, 2: 20, 3: 35, 4: 50, 5: 80 };
    return ultMap[tier] || 10;
  }
  var atkMap = { 1: 5, 2: 10, 3: 20, 4: 35, 5: 50 };
  return atkMap[tier] || 5;
}

function getMaxMoveLevel(tier) {
  return MAX_MOVE_LEVEL[tier] || 5;
}

function calcMovePower(basePower, moveLevel) {
  return Math.floor(basePower * (1 + 0.05 * moveLevel));
}

function calcMaxFp(pokemonLevel) {
  return 100 + (pokemonLevel * 3);
}

function getTreeSpThreshold(tier) {
  return TIER_SP_THRESHOLD[tier] || 0;
}

// ========== 初始化 ==========
// 如果 MOVE_DATABASE 已載入，為所有非傳說寶可夢生成技能樹
if (typeof POKEMON_TIERS !== "undefined" && typeof POKEMON_SPECIES_TYPES !== "undefined") {
  var ALL_POKEMON = {};
  for (var ti in POKEMON_TIERS) {
    var tierData = POKEMON_TIERS[ti];
    for (var pi = 0; pi < tierData.length; pi++) {
      var pkmn = tierData[pi];
      if (pkmn && pkmn.name && !SPECIES_SKILL_TREE[pkmn.name]) {
        ALL_POKEMON[pkmn.name] = true;
      }
      // 也為伊布進化型生成（他們在 tierData 中但可能沒有手工樹）
    }
  }
  // 為所有未手工設計的寶可夢生成
  for (var name in ALL_POKEMON) {
    var types = POKEMON_SPECIES_TYPES[name] || ["一般"];
    SPECIES_SKILL_TREE[name] = generateSkillTree(name, types, 50, 50);
  }
}

// ========== 匯出 ==========
window.SPECIES_SKILL_TREE = SPECIES_SKILL_TREE;
window.getSkillTree = getSkillTree;
window.getTreeTypeLabel = getTreeTypeLabel;
window.getTreeTypeEmoji = getTreeTypeEmoji;
window.getTierFpCost = getTierFpCost;
window.getMaxMoveLevel = getMaxMoveLevel;
window.calcMovePower = calcMovePower;
window.calcMaxFp = calcMaxFp;
window.getTreeSpThreshold = getTreeSpThreshold;
window.TIER_FP_COST = TIER_FP_COST;
window.BUF_FP_COST = BUF_FP_COST;
window.DIS_FP_COST = DIS_FP_COST;
window.ULT_FP_COST = ULT_FP_COST;

})();
