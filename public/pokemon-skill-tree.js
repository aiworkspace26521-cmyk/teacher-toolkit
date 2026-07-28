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

// ULT 招式新名稱映射（取代舊的 +Pro 規則）
var ULT_MOVE_RENAME = {
  "噴射火焰": "焚焰放射",
  "大字爆": "滅世爆焰",
  "暗影球": "噬影球",
  "地震": "震滅",
  "十萬伏特": "轟雷",
  "打雷": "萬雷轟"
};

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
      { tier: 1, name: "高速星星", spCost: 1, prereqs: [] },
      { tier: 2, name: "劈開",     spCost: 2, prereqs: ["高速星星"] },
      { tier: 3, name: "焚焰放射", spCost: 3, prereqs: ["劈開"], evolveStage: 1 },
      { tier: 4, name: "滅世爆焰", spCost: 4, prereqs: ["焚焰放射"], evolveStage: 2 },
      { tier: 5, name: "燃燼衝鋒", spCost: 5, prereqs: ["滅世爆焰"], evolveStage: 2 }
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
      { tier: 1, name: "高速星星", spCost: 1, prereqs: [] },
      { tier: 2, name: "覺醒力量", spCost: 2, prereqs: ["高速星星"] },
      { tier: 3, name: "噬影球",   spCost: 3, prereqs: ["覺醒力量"] },
      { tier: 4, name: "波導彈",   spCost: 4, prereqs: ["噬影球"] },
      { tier: 5, name: "精神擊破", spCost: 5, prereqs: ["波導彈"] }
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
      { tier: 1, name: "高速星星", spCost: 1, prereqs: [] },
      { tier: 2, name: "電球",     spCost: 2, prereqs: ["高速星星"] },
      { tier: 3, name: "轟雷",     spCost: 3, prereqs: ["電球"] },
      { tier: 4, name: "萬雷轟",   spCost: 4, prereqs: ["轟雷"], evolveStage: 1 },
      { tier: 5, name: "千萬伏特", spCost: 5, prereqs: ["萬雷轟"], evolveStage: 1 }
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

// ========== Phase 0: 完整屬性招式風格表（18 屬性 × 多變體）==========

var TYPE_SPEC_V2 = {
    "一般": {
        "theme": "萬能中庸，招式樸素直接",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "物理強攻型": {
                "theme": "高物攻、壓制",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "泰山壓頂"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "劈開"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "捨身衝撞"
                          ],
                        "SPA": [
                            "巨聲"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "大爆炸"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻轟炸型": {
                "theme": "高特攻、轟炸",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      }
                  }
              },
            "速攻擾亂型": {
                "theme": "先制、速度壓制",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      }
                  }
              },
            "防禦回復型": {
                "theme": "坦克、續航",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "D",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      }
                  }
              },
            "雙刀均衡型": {
                "theme": "靈活、適應",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "火": {
        "theme": "高攻擊、燃燒特化、天氣主導",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "物理猛攻型": {
                "theme": "物攻壓制、燃燒附帶",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "火花"
                          ],
                        "SPA": [
                            "叫聲"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "火焰拳"
                          ],
                        "SPA": [
                            "魔法火焰"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "大晴天"
                          ],
                        "DIS": [
                            "鬼火"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "V熱焰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "大晴天"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻轟炸型": {
                "theme": "特攻轟炸、範圍",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "火花"
                          ],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "噴射火焰"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "火焰旋渦"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "滅世爆焰"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      }
                  }
              },
            "速攻燃燒型": {
                "theme": "速度壓制、先制",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "火花"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "火焰牙"
                          ],
                        "SPA": [
                            "魔法火焰"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "閃焰衝鋒"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "雷電牙"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "搖尾巴"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "火焰踢"
                          ],
                        "SPA": [],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦反擊型": {
                "theme": "坦克、反傷",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "火花"
                          ],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "火焰拳"
                          ],
                        "SPA": [
                            "魔法火焰"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "噴射火焰"
                          ],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "泰山壓頂"
                          ],
                        "SPA": [
                            "加農光炮"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "寄生種子"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "V熱焰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": [
                            "怪異電波"
                          ]
                      }
                  }
              },
            "雙刀混合型": {
                "theme": "靈活、全方面",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "火花"
                          ],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "火焰拳"
                          ],
                        "SPA": [
                            "噴射火焰"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "火焰踢"
                          ],
                        "SPA": [
                            "大字爆"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "閃焰衝鋒"
                          ],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "閃焰衝鋒"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      }
                  }
              },
            "天氣主導型": {
                "theme": "晴天戰術、日照加成",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "D",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "火焰牙"
                          ],
                        "SPA": [
                            "噴射火焰"
                          ],
                        "BUF": [
                            "大晴天"
                          ],
                        "DIS": [
                            "火焰旋渦"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "大字爆"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "鬼火"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "火焰踢"
                          ],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": []
                      }
                  }
              },
            "干擾消耗型": {
                "theme": "燃燒、混亂疊加",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "E",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "噴射火焰"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "鬼火"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "火焰拳"
                          ],
                        "SPA": [
                            "大字爆"
                          ],
                        "BUF": [],
                        "DIS": [
                            "怪異之光"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "焚焰放射"
                          ],
                        "BUF": [
                            "大晴天"
                          ],
                        "DIS": [
                            "鬼火"
                          ]
                      }
                  }
              }
          }
      },
    "水": {
        "theme": "防禦回復、潮濕干擾、天氣輔助",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "物理強攻型": {
                "theme": "物攻壓制、冰牙輔助",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "水槍"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "噴射拳"
                          ],
                        "SPA": [
                            "水之波動"
                          ],
                        "BUF": [
                            "龍之舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "攀瀑"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "水之尾"
                          ],
                        "SPA": [
                            "衝浪"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "冰凍牙"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "攀瀑·極"
                          ],
                        "SPA": [],
                        "BUF": [
                            "水流環·極"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻壓制型": {
                "theme": "特攻轟炸、續航",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "水槍"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "水之波動"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "黑霧"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": [
                            "浸水"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "摔打"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "深海漩渦"
                          ],
                        "BUF": [
                            "龍之舞"
                          ],
                        "DIS": [
                            "黑霧"
                          ]
                      }
                  }
              },
            "速攻擾亂型": {
                "theme": "先制、變化",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "水槍"
                          ],
                        "SPA": [
                            "水槍"
                          ],
                        "BUF": [],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "噴射拳"
                          ],
                        "SPA": [
                            "水之波動"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "玩水"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "熱水"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "水之尾"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦坦克型": {
                "theme": "鐵壁、回復",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "水槍"
                          ],
                        "BUF": [
                            "縮入殼中"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "泰山壓頂"
                          ],
                        "SPA": [
                            "水之波動"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "玩水"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "熱水"
                          ],
                        "BUF": [
                            "瞬間失憶"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "捨身衝撞"
                          ],
                        "SPA": [
                            "水炮"
                          ],
                        "BUF": [
                            "水流環"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "水流環·極"
                          ],
                        "DIS": [
                            "浸水"
                          ]
                      }
                  }
              },
            "雙刀技巧型": {
                "theme": "靈活、適應",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "水槍"
                          ],
                        "SPA": [
                            "水槍"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "噴射拳"
                          ],
                        "SPA": [
                            "水之波動"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "攀瀑"
                          ],
                        "SPA": [
                            "濁流"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "水之尾"
                          ],
                        "SPA": [
                            "衝浪"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "怒濤衝鋒"
                          ],
                        "SPA": [
                            "深海漩渦"
                          ],
                        "BUF": [
                            "龍之舞"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "草": {
        "theme": "回復續航、粉末干擾、天氣主導",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "物理強攻型": {
                "theme": "木角、物攻壓制",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "藤鞭"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "飛葉快刀"
                          ],
                        "SPA": [
                            "能量球"
                          ],
                        "BUF": [
                            "生長"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "木角"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "日光刃"
                          ],
                        "SPA": [
                            "日光束"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "木槌·大木"
                          ],
                        "SPA": [],
                        "BUF": [
                            "光合再生"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻消耗型": {
                "theme": "特攻轟炸、持續傷",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "藤鞭"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "魔法葉"
                          ],
                        "BUF": [
                            "生長"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "種子炸彈"
                          ],
                        "SPA": [
                            "能量球"
                          ],
                        "BUF": [
                            "光合作用"
                          ],
                        "DIS": [
                            "寄生種子"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "飛葉風暴"
                          ],
                        "BUF": [
                            "芳香治療"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "日光束·極"
                          ],
                        "BUF": [
                            "生長"
                          ],
                        "DIS": []
                      }
                  }
              },
            "回復續航型": {
                "theme": "光合治療、坦克",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "藤鞭"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "魔法葉"
                          ],
                        "BUF": [
                            "生長"
                          ],
                        "DIS": [
                            "睡眠粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "寄生種子"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "日光束"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      }
                  }
              },
            "粉末干擾型": {
                "theme": "睡眠、毒粉控制",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "藤鞭"
                          ],
                        "SPA": [],
                        "BUF": [],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "魔法葉"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "種子炸彈"
                          ],
                        "SPA": [
                            "能量球"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "睡眠粉"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "木槌"
                          ],
                        "SPA": [],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "萬葉裁決"
                          ],
                        "BUF": [
                            "光合再生"
                          ],
                        "DIS": []
                      }
                  }
              },
            "天氣加速型": {
                "theme": "晴天、日光束戰術",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "藤鞭"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "飛葉快刀"
                          ],
                        "SPA": [
                            "能量球"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "種子炸彈"
                          ],
                        "SPA": [
                            "打草結"
                          ],
                        "BUF": [
                            "大晴天"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "日光刃"
                          ],
                        "SPA": [
                            "飛葉風暴"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "輝煌綠葉"
                          ],
                        "SPA": [
                            "日光束·極"
                          ],
                        "BUF": [
                            "生長"
                          ],
                        "DIS": []
                      }
                  }
              },
            "均衡雙刀型": {
                "theme": "靈活、全方面",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "藤鞭"
                          ],
                        "SPA": [
                            "藤鞭"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "飛葉快刀"
                          ],
                        "SPA": [
                            "魔法葉"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "寄生種子"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "木角"
                          ],
                        "SPA": [
                            "能量球"
                          ],
                        "BUF": [
                            "光合作用"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "木槌"
                          ],
                        "SPA": [
                            "飛葉風暴"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "木槌"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "電": {
        "theme": "速度特化、麻痺干擾、高速壓制",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "閃電強攻型": {
                "theme": "物攻壓制、電氣",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "電擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "雷電拳"
                          ],
                        "SPA": [
                            "電球"
                          ],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "打雷"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "電氣猛攻"
                          ],
                        "SPA": [],
                        "BUF": [
                            "電磁屏障"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻轟炸型": {
                "theme": "特攻壓制、範圍",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "電擊"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "十萬伏特"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "磁能炮"
                          ],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      }
                  }
              },
            "速攻壓制型": {
                "theme": "先制、速度壓制",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "電擊"
                          ],
                        "SPA": [
                            "電擊"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "雷電拳"
                          ],
                        "SPA": [
                            "電球"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "閃電強襲"
                          ],
                        "SPA": [
                            "伏特交換"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "雷電牙"
                          ],
                        "SPA": [],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      }
                  }
              },
            "麻痺干擾型": {
                "theme": "麻痺控場、消耗",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "電擊"
                          ],
                        "BUF": [],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "雷電拳"
                          ],
                        "SPA": [
                            "電球"
                          ],
                        "BUF": [
                            "電磁漂浮"
                          ],
                        "DIS": [
                            "綁緊"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "瘋狂伏特"
                          ],
                        "SPA": [
                            "放電"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "怪異電波"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "打雷"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "萬雷轟"
                          ],
                        "BUF": [
                            "電磁屏障"
                          ],
                        "DIS": []
                      }
                  }
              },
            "雙刀混合型": {
                "theme": "靈活、適應",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "電擊"
                          ],
                        "SPA": [
                            "電擊"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "雷電拳"
                          ],
                        "SPA": [
                            "十萬伏特"
                          ],
                        "BUF": [
                            "電磁漂浮"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "瘋狂伏特"
                          ],
                        "SPA": [
                            "放電"
                          ],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "雷電牙"
                          ],
                        "SPA": [
                            "光澤電炮"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "怪異電波"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "磁能炮"
                          ],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦電磁型": {
                "theme": "坦克、漂浮",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "電擊"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "雷電拳"
                          ],
                        "SPA": [
                            "電球"
                          ],
                        "BUF": [
                            "電磁漂浮"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "十萬伏特"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "雷電牙"
                          ],
                        "SPA": [
                            "打雷"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "金屬音"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "打雷"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "冰": {
        "theme": "冰凍控制、氣候主導、緩速壓制",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "冰錐強攻型": {
                "theme": "物攻、冰凍牙",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "冰礫"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "冰凍拳"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "★冰霜陷阱"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "冰錐"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "冰凍光束"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T5": {
                        "ATK": [
                            "冰柱墜擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "冰川甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻雪暴型": {
                "theme": "特攻、暴風雪",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "冰凍之風"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "冰凍牙"
                          ],
                        "SPA": [
                            "冰凍光束"
                          ],
                        "BUF": [
                            "雪景"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "★雪崩詛咒"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "絕對零度"
                          ],
                        "BUF": [
                            "極光幕"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦冰牆型": {
                "theme": "坦克、極光幕",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "冰凍之風"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "冰凍牙"
                          ],
                        "SPA": [
                            "冰凍光束"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "幻象光線"
                          ],
                        "BUF": [
                            "極光幕"
                          ],
                        "DIS": [
                            "鬼火"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "出奇一擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "唱歌"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "沙暴"
                          ],
                        "DIS": [
                            "臨別禮物"
                          ]
                      }
                  }
              },
            "天氣雪崩型": {
                "theme": "冰雹、天氣",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "D",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "冰礫"
                          ],
                        "SPA": [
                            "冰凍之風"
                          ],
                        "BUF": [],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "冰凍光束"
                          ],
                        "BUF": [
                            "冰雹"
                          ],
                        "DIS": [
                            "★冰霜陷阱"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "冰錐"
                          ],
                        "SPA": [
                            "力量寶石"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "空手劈"
                          ],
                        "SPA": [
                            "魔法閃耀"
                          ],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "冰川甲"
                          ],
                        "DIS": [
                            "鬼火"
                          ]
                      }
                  }
              },
            "速攻先制型": {
                "theme": "先制、冰礫",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "冰礫"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "冰凍拳"
                          ],
                        "SPA": [
                            "冰凍光束"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "冰柱針"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "冰凍之風"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "冰柱墜擊"
                          ],
                        "SPA": [
                            "暴風雪"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "冰柱針"
                          ],
                        "SPA": [],
                        "BUF": [
                            "極光幕"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "格鬥": {
        "theme": "近戰壓制、戰技強化、會心特化",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "近戰強攻型": {
                "theme": "近身戰、高物攻",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "碎岩"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "空手劈"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "拍擊"
                          ],
                        "SPA": [
                            "真氣彈"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "真·近身戰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "戰意高昂"
                          ],
                        "DIS": []
                      }
                  }
              },
            "子彈連擊型": {
                "theme": "先制、連續技",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "碎岩"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "子彈拳"
                          ],
                        "SPA": [
                            "吸收拳"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "音速拳"
                          ],
                        "SPA": [
                            "波導彈"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "氣魄拳"
                          ],
                        "SPA": [],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": []
                      }
                  }
              },
            "速攻先制型": {
                "theme": "音速拳、先制",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "碎岩"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "音速拳"
                          ],
                        "SPA": [
                            "真氣彈"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "飛膝踢"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "近身戰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦硬漢型": {
                "theme": "坦克、反擊",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "碎岩"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "空手劈"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "吸取拳"
                          ],
                        "SPA": [
                            "真氣彈"
                          ],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "地獄翻滾"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "真·近身戰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "戰意高昂"
                          ],
                        "DIS": []
                      }
                  }
              },
            "雙刀武術型": {
                "theme": "波導、適應",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "碎岩"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "空手劈"
                          ],
                        "SPA": [
                            "真氣彈"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "十字劈"
                          ],
                        "SPA": [
                            "波導彈"
                          ],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "近身戰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "氣魄拳"
                          ],
                        "SPA": [
                            "波導彈"
                          ],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": []
                      }
                  }
              },
            "指導輔助型": {
                "theme": "團隊、強化",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "碎岩"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "空手劈"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "吸取拳"
                          ],
                        "SPA": [
                            "波導彈"
                          ],
                        "BUF": [
                            "指導"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "近身戰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "近身戰"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "毒": {
        "theme": "中毒消耗、持續傷害、干擾主導",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "劇毒猛攻型": {
                "theme": "物攻、毒附帶",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "毒針"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "毒擊"
                          ],
                        "SPA": [
                            "溶解液"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "毒垃圾雨"
                          ],
                        "SPA": [],
                        "BUF": [
                            "毒液護甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻溶解型": {
                "theme": "特攻、污泥波",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "溶解液"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "毒擊"
                          ],
                        "SPA": [
                            "污泥炸彈"
                          ],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "垃圾射擊"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "搖尾巴"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "溶解泥彈"
                          ],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": []
                      }
                  }
              },
            "中毒消耗型": {
                "theme": "持續傷害、坦克",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "溶解液"
                          ],
                        "BUF": [],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "毒擊"
                          ],
                        "SPA": [
                            "污泥炸彈"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "十字毒刃"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "毒液衝擊"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "污泥波"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      }
                  }
              },
            "干擾擴散型": {
                "theme": "劇毒、吹飛控場",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "溶解液"
                          ],
                        "BUF": [],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "毒擊"
                          ],
                        "SPA": [
                            "污泥炸彈"
                          ],
                        "BUF": [
                            "黑霧"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "污泥波"
                          ],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "垃圾射擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "劇毒擴散"
                          ],
                        "BUF": [
                            "毒液護甲"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      }
                  }
              },
            "物理連毒型": {
                "theme": "連擊、高速",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "毒針"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "毒擊"
                          ],
                        "SPA": [
                            "溶解液"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "十字毒刃"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "垃圾射擊"
                          ],
                        "SPA": [
                            "污泥炸彈"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "垃圾射擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "地面": {
        "theme": "地震壓制、岩石破碎、沙暴主導",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "地震強攻型": {
                "theme": "物攻、地震",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "潑沙"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "重踏"
                          ],
                        "SPA": [
                            "泥巴射擊"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "玩沙"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "挖洞"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "震滅"
                          ],
                        "SPA": [],
                        "BUF": [
                            "地殼裝甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "沙暴天氣型": {
                "theme": "沙暴、岩石",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "潑沙"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "重踏"
                          ],
                        "SPA": [
                            "泥巴炸彈"
                          ],
                        "BUF": [
                            "沙暴"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "直衝鑽"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "熱沙大地"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "地龍鑽"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦坦克型": {
                "theme": "鐵壁、坦克",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "潑沙"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "重踏"
                          ],
                        "SPA": [
                            "泥巴射擊"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "挖洞"
                          ],
                        "SPA": [
                            "暴風"
                          ],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "飛葉快刀"
                          ],
                        "SPA": [],
                        "BUF": [
                            "岩石打磨"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "啄鑽"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "毒粉"
                          ]
                      }
                  }
              },
            "物理連擊型": {
                "theme": "直衝鑽、連擊",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "潑沙"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "重踏"
                          ],
                        "SPA": [
                            "泥巴射擊"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "玩沙"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "直衝鑽"
                          ],
                        "SPA": [
                            "大地之力"
                          ],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "地震"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "震滅"
                          ],
                        "SPA": [],
                        "BUF": [
                            "地殼裝甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "雙刀震盪型": {
                "theme": "靈活、大地之力",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "潑沙"
                          ],
                        "SPA": [
                            "泥巴射擊"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "重踏"
                          ],
                        "SPA": [
                            "大地之力"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "玩沙"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "挖洞"
                          ],
                        "SPA": [
                            "泥巴炸彈"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "地震"
                          ],
                        "SPA": [
                            "熱沙大地"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "灼熱流沙"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "飛行": {
        "theme": "速度壓制、空中打擊、天氣輔助",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "勇鳥猛攻型": {
                "theme": "物攻、勇鳥猛攻",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "啄"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "翅膀攻擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "燕返"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "啄鑽"
                          ],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "神鳥猛攻"
                          ],
                        "SPA": [],
                        "BUF": [
                            "順風·極"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻風暴型": {
                "theme": "特攻、暴風",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "起風"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "翅膀攻擊"
                          ],
                        "SPA": [
                            "空氣之刃"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "超音波"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "真空刃"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      }
                  }
              },
            "速攻飛行型": {
                "theme": "先制、速度",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "啄"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "翅膀攻擊"
                          ],
                        "SPA": [
                            "起風"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "木槌"
                          ],
                        "SPA": [],
                        "BUF": [
                            "電磁漂浮"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "雜技"
                          ],
                        "SPA": [
                            "放電"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "冰礫"
                          ],
                        "SPA": [],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦順風型": {
                "theme": "坦克、輔助",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "啄"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "翅膀攻擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "順風"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "勇鳥猛攻"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "神鳥猛攻"
                          ],
                        "SPA": [],
                        "BUF": [
                            "順風·極"
                          ],
                        "DIS": [
                            "暴風眼"
                          ]
                      }
                  }
              },
            "先制啄擊型": {
                "theme": "先制、連擊",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "啄"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "啄食"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "超音波"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "燕返"
                          ],
                        "SPA": [
                            "空氣斬"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "啄鑽"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "催眠術"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "勇鳥猛攻"
                          ],
                        "SPA": [],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      }
                  }
              },
            "天氣控場型": {
                "theme": "雨天/順風",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "D",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "起風"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "翅膀攻擊"
                          ],
                        "SPA": [
                            "空氣之刃"
                          ],
                        "BUF": [
                            "順風"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "空氣斬"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "啄鑽"
                          ],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "啄鑽"
                          ],
                        "SPA": [
                            "暴風"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "超能力": {
        "theme": "精神控制、特殊打擊、場地主導",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "精神強念型": {
                "theme": "特攻、念力壓制",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "念力"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "意念頭錘"
                          ],
                        "SPA": [
                            "幻象光線"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "破壞光線"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "精神利刃"
                          ],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "極限精神"
                          ],
                        "BUF": [
                            "精神屏障"
                          ],
                        "DIS": [
                            "重力場"
                          ]
                      }
                  }
              },
            "場地控制型": {
                "theme": "精神場地、輔助",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "念力"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "意念頭錘"
                          ],
                        "SPA": [
                            "幻象光線"
                          ],
                        "BUF": [
                            "精神場地"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "空氣斬"
                          ],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": [
                            "反射壁"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "污泥波"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "光牆"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "龍息"
                          ],
                        "BUF": [
                            "黑霧"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦回復型": {
                "theme": "自我再生、光牆",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "念力"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "意念頭錘"
                          ],
                        "SPA": [
                            "幻象光線"
                          ],
                        "BUF": [
                            "光牆"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "魅惑之聲"
                          ],
                        "BUF": [
                            "瞬間失憶"
                          ],
                        "DIS": [
                            "反射壁"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "潑沙"
                          ],
                        "SPA": [],
                        "BUF": [
                            "順風"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "蝶舞"
                          ],
                        "DIS": [
                            "鬼火"
                          ]
                      }
                  }
              },
            "空間扭曲型": {
                "theme": "戲法空間、速控",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "念力"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "意念頭錘"
                          ],
                        "SPA": [
                            "幻象光線"
                          ],
                        "BUF": [
                            "戲法空間"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "催眠術"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "極限精神"
                          ],
                        "BUF": [
                            "精神屏障"
                          ],
                        "DIS": []
                      }
                  }
              },
            "干擾戰術型": {
                "theme": "反射壁、雙牆",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "念力"
                          ],
                        "BUF": [],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "精神利刃"
                          ],
                        "SPA": [
                            "幻象光線"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "精神強念"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "預知未來"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "心靈風暴"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": []
                      }
                  }
              },
            "雙刀均衡型": {
                "theme": "意念頭錘、適應",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "念力"
                          ],
                        "SPA": [
                            "念力"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "意念頭錘"
                          ],
                        "SPA": [
                            "幻象光線"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "精神利刃"
                          ],
                        "SPA": [
                            "精神強念"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "意念頭錘"
                          ],
                        "SPA": [
                            "預知未來"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "意念頭錘"
                          ],
                        "SPA": [],
                        "BUF": [
                            "光牆"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "蟲": {
        "theme": "連擊壓制、急速干擾、進化戰術",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "急速連擊型": {
                "theme": "連擊、高速",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "連斬"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "吐絲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "蟲咬"
                          ],
                        "SPA": [],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "急速折返"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "巨角衝撞"
                          ],
                        "SPA": [],
                        "BUF": [
                            "蟲蛻重生"
                          ],
                        "DIS": []
                      }
                  }
              },
            "蝶舞強化型": {
                "theme": "強化、特攻",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "蟲咬"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "吐絲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "蟲咬"
                          ],
                        "SPA": [
                            "信號光束"
                          ],
                        "BUF": [
                            "蝶舞"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "噴射火焰"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "毒粉"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "顫音共鳴"
                          ],
                        "BUF": [
                            "蝶舞"
                          ],
                        "DIS": []
                      }
                  }
              },
            "物理坦克型": {
                "theme": "物攻、防禦",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "連斬"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "蟲咬"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "信號光束"
                          ],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "猛撲"
                          ],
                        "SPA": [],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻蟲鳴型": {
                "theme": "特攻、蟲鳴",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "蟲咬"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "吐絲"
                          ]
                      },
                    "T2": {
                        "ATK": [],
                        "SPA": [
                            "信號光束"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "麻痺粉"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "睡眠粉"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "蟲群風暴"
                          ],
                        "BUF": [
                            "蟲蛻重生"
                          ],
                        "DIS": []
                      }
                  }
              },
            "干擾吐絲型": {
                "theme": "網、緩速控場",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "連斬"
                          ],
                        "SPA": [],
                        "BUF": [],
                        "DIS": [
                            "吐絲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "蟲咬"
                          ],
                        "SPA": [
                            "信號光束"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "黏黏網"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "猛撲"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "毒針"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "十字剪"
                          ],
                        "SPA": [
                            "蟲鳴"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "十字剪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "蝶舞"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "岩石": {
        "theme": "堅硬防禦、岩石壓制、沙暴主導",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "石刃強攻型": {
                "theme": "物攻、尖石",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "落石"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "岩石封鎖"
                          ],
                        "SPA": [
                            "原始之力"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "隱形岩"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "雙刃頭錘"
                          ],
                        "SPA": [],
                        "BUF": [
                            "岩石護甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "沙暴防禦型": {
                "theme": "沙暴、特防",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "落石"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "岩石封鎖"
                          ],
                        "SPA": [
                            "原始之力"
                          ],
                        "BUF": [
                            "沙暴"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "毒針"
                          ],
                        "SPA": [
                            "月亮之力"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "百萬噸重拳"
                          ],
                        "SPA": [],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "尖石攻擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": [
                            "沙暴"
                          ]
                      }
                  }
              },
            "鐵壁坦克型": {
                "theme": "防禦、鐵壁",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "落石"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "岩石封鎖"
                          ],
                        "SPA": [
                            "原始之力"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "岩石打磨"
                          ],
                        "DIS": [
                            "隱形岩"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      }
                  }
              },
            "暴力推土型": {
                "theme": "岩石炮、重壓",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "落石"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "岩石封鎖"
                          ],
                        "SPA": [],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "岩崩"
                          ],
                        "SPA": [
                            "原始之力"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "尖石攻擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "雙刃頭錘"
                          ],
                        "SPA": [],
                        "BUF": [
                            "岩石護甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "天氣加速型": {
                "theme": "沙暴+速攻",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "落石"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "岩石封鎖"
                          ],
                        "SPA": [
                            "原始之力"
                          ],
                        "BUF": [
                            "沙暴"
                          ],
                        "DIS": [
                            "岩石打磨"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "岩崩"
                          ],
                        "SPA": [],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "尖石攻擊"
                          ],
                        "SPA": [
                            "力量寶石"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "尖石攻擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "岩石打磨"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "幽靈": {
        "theme": "詛咒消耗、迴避擾亂、先制打擊",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "暗影潛襲型": {
                "theme": "潛靈、物攻",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "暗影拳"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "暗影爪"
                          ],
                        "SPA": [
                            "黑夜魔影"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "拍擊"
                          ],
                        "SPA": [
                            "破壞光線"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "連斬"
                          ],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "詛咒"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "暗影強襲"
                          ],
                        "SPA": [],
                        "BUF": [
                            "靈魂分擔"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻噬魂型": {
                "theme": "暗影球、特攻",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "驚嚇"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "暗影爪"
                          ],
                        "SPA": [
                            "黑夜魔影"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "潛靈奇襲"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "魂火"
                          ],
                        "BUF": [
                            "詛咒"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      }
                  }
              },
            "詛咒消耗型": {
                "theme": "詛咒、分擔痛楚",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "驚嚇"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "暗影拳"
                          ],
                        "SPA": [
                            "黑夜魔影"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "暗影爪"
                          ],
                        "SPA": [
                            "暗影球"
                          ],
                        "BUF": [
                            "詛咒"
                          ],
                        "DIS": [
                            "分擔痛楚"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "禍不單行"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      }
                  }
              },
            "同命干擾型": {
                "theme": "同命、劍舞",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "暗影拳"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "暗影爪"
                          ],
                        "SPA": [
                            "黑夜魔影"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "同命"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "暗影強襲"
                          ],
                        "SPA": [],
                        "BUF": [
                            "靈魂分擔"
                          ],
                        "DIS": []
                      }
                  }
              },
            "替身戰術型": {
                "theme": "替身、保護",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "暗影拳"
                          ],
                        "SPA": [],
                        "BUF": [],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "暗影爪"
                          ],
                        "SPA": [
                            "黑夜魔影"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "潛靈奇襲"
                          ],
                        "SPA": [
                            "暗影球"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "暗影爪"
                          ],
                        "SPA": [
                            "禍不單行"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "潛靈奇襲"
                          ],
                        "SPA": [],
                        "BUF": [
                            "詛咒"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "龍": {
        "theme": "龍舞強化、逆鱗爆發、傳說威壓",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "逆鱗強攻型": {
                "theme": "物攻、龍舞",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "龍爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "龍尾"
                          ],
                        "SPA": [
                            "龍息"
                          ],
                        "BUF": [
                            "龍舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "龍神逆鱗"
                          ],
                        "SPA": [],
                        "BUF": [
                            "龍之鼓舞"
                          ],
                        "DIS": []
                      }
                  }
              },
            "龍舞強化型": {
                "theme": "龍舞+物攻兼顧",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "龍爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "龍尾"
                          ],
                        "SPA": [
                            "龍息"
                          ],
                        "BUF": [
                            "龍舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "拍擊"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "龍神爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "龍之舞"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻龍星型": {
                "theme": "特攻、龍星群",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "龍息"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "龍爪"
                          ],
                        "SPA": [
                            "龍之波動"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "奇異之光"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "毒液衝擊"
                          ],
                        "BUF": [
                            "溶化"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "龍尾"
                          ],
                        "SPA": [
                            "熱風"
                          ],
                        "BUF": [
                            "反射壁"
                          ],
                        "DIS": [
                            "隱形岩"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "大字爆"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "臨別禮物"
                          ]
                      }
                  }
              },
            "雙刀均衡型": {
                "theme": "龍爪+龍波動",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "龍爪"
                          ],
                        "SPA": [
                            "龍息"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "龍尾"
                          ],
                        "SPA": [
                            "龍之波動"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "逆鱗"
                          ],
                        "SPA": [
                            "龍星群"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "搖尾巴"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "龍神逆鱗"
                          ],
                        "SPA": [],
                        "BUF": [
                            "龍之鼓舞"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦反擊型": {
                "theme": "坦克、龍尾",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "龍爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "龍尾"
                          ],
                        "SPA": [
                            "龍息"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "龍之波動"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "龍之舞"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      }
                  }
              },
            "傳說威壓型": {
                "theme": "傳說、時空之力",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "D",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "龍爪"
                          ],
                        "SPA": [
                            "龍息"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "龍尾"
                          ],
                        "SPA": [
                            "龍之波動"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "龍之俯衝"
                          ],
                        "SPA": [
                            "巨聲"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "逆鱗"
                          ],
                        "SPA": [
                            "時空咆哮"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吹飛"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "逆鱗"
                          ],
                        "SPA": [
                            "龍星群"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "惡": {
        "theme": "陰謀詭計、先制偷襲、心理壓制",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "咬碎強攻型": {
                "theme": "物攻、咬碎",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "咬住"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "出奇一擊"
                          ],
                        "SPA": [
                            "大聲咆哮"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "拍擊"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "連斬"
                          ],
                        "SPA": [],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "暗黑亂舞"
                          ],
                        "SPA": [],
                        "BUF": [
                            "暗黑契約"
                          ],
                        "DIS": []
                      }
                  }
              },
            "詭計特攻型": {
                "theme": "特攻、陰謀",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "大聲咆哮"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "出奇一擊"
                          ],
                        "SPA": [
                            "惡之波動"
                          ],
                        "BUF": [
                            "詭計"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "臨別禮物"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "絕望制裁"
                          ],
                        "BUF": [
                            "詭計"
                          ],
                        "DIS": []
                      }
                  }
              },
            "先制偷襲型": {
                "theme": "突襲、先制",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "咬住"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "出奇一擊"
                          ],
                        "SPA": [
                            "大聲咆哮"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "突襲"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "咬碎"
                          ],
                        "SPA": [],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      }
                  }
              },
            "干擾陰謀型": {
                "theme": "挑釁、臨別禮物",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "大聲咆哮"
                          ],
                        "BUF": [],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "暗襲要害"
                          ],
                        "SPA": [
                            "惡之波動"
                          ],
                        "BUF": [
                            "詭計"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "惡之波動"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "臨別禮物"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "咬碎"
                          ],
                        "SPA": [],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "深淵波動"
                          ],
                        "BUF": [
                            "暗黑契約"
                          ],
                        "DIS": []
                      }
                  }
              },
            "雙刀暗黑型": {
                "theme": "暗黑洞、傳說",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "D",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "咬住"
                          ],
                        "SPA": [
                            "大聲咆哮"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "出奇一擊"
                          ],
                        "SPA": [
                            "惡之波動"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "暗襲要害"
                          ],
                        "SPA": [
                            "惡之波動"
                          ],
                        "BUF": [
                            "詭計"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "咬碎"
                          ],
                        "SPA": [
                            "惡之波動"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "深淵突刺"
                          ],
                        "SPA": [
                            "絕望制裁"
                          ],
                        "BUF": [
                            "詭計"
                          ],
                        "DIS": [
                            "挑釁"
                          ]
                      }
                  }
              }
          }
      },
    "鋼": {
        "theme": "鋼鐵防壁、磁場干擾、子彈連擊",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "鐵頭強攻型": {
                "theme": "物攻、鐵頭",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "金屬爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "瞪眼"
                          ],
                        "DIS": []
                      },
                    "T2": {
                        "ATK": [
                            "鐵頭"
                          ],
                        "SPA": [
                            "加農光炮"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "金屬音"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "重磅衝撞"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "煙幕"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "流星拳"
                          ],
                        "SPA": [],
                        "BUF": [
                            "合金裝甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "鋼鐵防壁型": {
                "theme": "防禦、鐵壁",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "金屬爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "鐵頭"
                          ],
                        "SPA": [
                            "加農光炮"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "陀螺球"
                          ],
                        "SPA": [],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "重磅衝撞"
                          ],
                        "SPA": [
                            "光澤電炮"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "金屬音"
                          ]
                      }
                  }
              },
            "子彈連擊型": {
                "theme": "先制、子彈拳",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "金屬爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "子彈拳"
                          ],
                        "SPA": [
                            "加農光炮"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": []
                      },
                    "T3": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "金屬音"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "鐵頭"
                          ],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "重磅衝撞"
                          ],
                        "SPA": [],
                        "BUF": [
                            "健美"
                          ],
                        "DIS": []
                      }
                  }
              },
            "磁場干擾型": {
                "theme": "金屬音、電磁",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "電擊"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "金屬爪"
                          ],
                        "SPA": [
                            "加農光炮"
                          ],
                        "BUF": [
                            "電磁漂浮"
                          ],
                        "DIS": [
                            "金屬音"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "光澤電炮"
                          ],
                        "BUF": [
                            "充電"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "鐵頭"
                          ],
                        "SPA": [
                            "打雷"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "鋼鐵加農"
                          ],
                        "BUF": [
                            "合金裝甲"
                          ],
                        "DIS": []
                      }
                  }
              },
            "雙刀鋼鐵型": {
                "theme": "靈活、傳說",
                "preferredStats": {
                    "ATK": 1.1,
                    "SPA": 1.1,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "金屬爪"
                          ],
                        "SPA": [],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "鐵頭"
                          ],
                        "SPA": [
                            "加農光炮"
                          ],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": [
                            "電磁波"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "彗星拳"
                          ],
                        "SPA": [
                            "光澤電炮"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "重磅衝撞"
                          ],
                        "SPA": [
                            "打雷"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "鋼鐵重壓"
                          ],
                        "SPA": [],
                        "BUF": [
                            "鐵壁"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      },
    "妖精": {
        "theme": "魅力干擾、魔法閃耀、治癒輔助",
        "UNIVERSAL_MOVES": {},
        "VARIANTS": {
            "月亮強攻型": {
                "theme": "特攻、月亮之力",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "A",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "妖精之風"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "吸取吻"
                          ],
                        "SPA": [
                            "魅惑之聲"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "天使之吻"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "破壞光線"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "抓"
                          ],
                        "SPA": [
                            "火花"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "妖精爆裂"
                          ],
                        "BUF": [
                            "妖精領域"
                          ],
                        "DIS": []
                      }
                  }
              },
            "物理嬉鬧型": {
                "theme": "物攻、嬉鬧",
                "preferredStats": {
                    "ATK": 1.2,
                    "SPA": 0.8,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [
                            "拍擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "吸取吻"
                          ],
                        "SPA": [
                            "妖精之風"
                          ],
                        "BUF": [
                            "影子分身"
                          ],
                        "DIS": [
                            "天使之吻"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "陀螺球"
                          ],
                        "SPA": [
                            "魅惑之聲"
                          ],
                        "BUF": [
                            "劍舞"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "泰山壓頂"
                          ],
                        "SPA": [
                            "暗影球"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "怪異電波"
                          ]
                      },
                    "T5": {
                        "ATK": [
                            "翅膀攻擊"
                          ],
                        "SPA": [],
                        "BUF": [
                            "極光幕"
                          ],
                        "DIS": []
                      }
                  }
              },
            "特攻魔法型": {
                "theme": "魔法閃耀、範圍",
                "preferredStats": {
                    "ATK": 0.8,
                    "SPA": 1.2,
                    "SPD": 1,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "妖精之風"
                          ],
                        "BUF": [
                            "叫聲"
                          ],
                        "DIS": [
                            "瞪眼"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "吸取吻"
                          ],
                        "SPA": [
                            "魅惑之聲"
                          ],
                        "BUF": [
                            "高速移動"
                          ],
                        "DIS": [
                            "天使之吻"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "覺醒力量"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": []
                      },
                    "T4": {
                        "ATK": [
                            "撞擊"
                          ],
                        "SPA": [
                            "高速星星"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "清除之煙"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "魔法閃耀"
                          ],
                        "BUF": [
                            "薄霧場地"
                          ],
                        "DIS": []
                      }
                  }
              },
            "防禦回復型": {
                "theme": "薄霧場地、治癒",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1,
                    "DEF": 1.3
                  },
                "ultMapping": "B",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "妖精之風"
                          ],
                        "BUF": [
                            "變硬"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "吸取吻"
                          ],
                        "SPA": [
                            "魅惑之聲"
                          ],
                        "BUF": [
                            "薄霧場地"
                          ],
                        "DIS": [
                            "天使之吻"
                          ]
                      },
                    "T3": {
                        "ATK": [],
                        "SPA": [
                            "月亮之力"
                          ],
                        "BUF": [
                            "瞬間失憶"
                          ],
                        "DIS": [
                            "治癒波動"
                          ]
                      },
                    "T4": {
                        "ATK": [
                            "嬉鬧"
                          ],
                        "SPA": [
                            "魔法閃耀"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "劇毒"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [],
                        "BUF": [
                            "妖精領域"
                          ],
                        "DIS": [
                            "魅惑漩渦"
                          ]
                      }
                  }
              },
            "魅力干擾型": {
                "theme": "撒嬌、魅惑",
                "preferredStats": {
                    "ATK": 1,
                    "SPA": 1,
                    "SPD": 1.3,
                    "DEF": 1
                  },
                "ultMapping": "C",
                "tiers": {
                    "T1": {
                        "ATK": [],
                        "SPA": [
                            "妖精之風"
                          ],
                        "BUF": [
                            "搖尾巴"
                          ],
                        "DIS": [
                            "叫聲"
                          ]
                      },
                    "T2": {
                        "ATK": [
                            "吸取吻"
                          ],
                        "SPA": [
                            "魅惑之聲"
                          ],
                        "BUF": [
                            "替身"
                          ],
                        "DIS": [
                            "天使之吻"
                          ]
                      },
                    "T3": {
                        "ATK": [
                            "嬉鬧"
                          ],
                        "SPA": [
                            "月亮之力"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": [
                            "撒嬌"
                          ]
                      },
                    "T4": {
                        "ATK": [],
                        "SPA": [
                            "魔法閃耀"
                          ],
                        "BUF": [
                            "守住"
                          ],
                        "DIS": [
                            "吼叫"
                          ]
                      },
                    "T5": {
                        "ATK": [],
                        "SPA": [
                            "月光爆破"
                          ],
                        "BUF": [
                            "冥想"
                          ],
                        "DIS": []
                      }
                  }
              }
          }
      }
  };



var TYPE_T5_SIGNATURES = {
  "一般": { ATK: ["終極衝擊"], SPA: ["破壞光線"], BUF: ["腹鼓"], DIS: ["滅亡之歌"] },
  "火":   { ATK: ["V熱焰"], SPA: ["焚焰放射", "滅世爆焰"], BUF: ["腹鼓"], DIS: ["滅亡之歌"] },
  "水":   { ATK: ["攀瀑·極", "怒濤衝鋒"], SPA: ["極巨水炮", "深海漩渦"], BUF: ["水流環·極"], DIS: ["絕對零度"] },
  "草":   { ATK: ["木槌·大木", "輝煌綠葉"], SPA: ["萬葉裁決", "日光束·極"], BUF: ["光合再生"], DIS: ["腐蝕孢子"] },
  "電":   { ATK: ["電氣猛攻"], SPA: ["萬雷轟", "磁能炮"], BUF: ["電磁屏障"], DIS: ["靜電場·極"] },
  "冰":   { ATK: ["冰柱墜擊"], SPA: ["絕對零度", "極寒風暴"], BUF: ["冰川甲"], DIS: ["永凍之風"] },
  "格鬥": { ATK: ["真·近身戰", "氣魄拳"], SPA: ["真波導彈"], BUF: ["戰意高昂"], DIS: ["威嚇粉碎"] },
  "毒":   { ATK: ["毒垃圾雨"], SPA: ["劇毒擴散", "溶解泥彈"], BUF: ["毒液護甲"], DIS: ["瘴氣瀰漫"] },
  "地面": { ATK: ["震滅", "地龍鑽"], SPA: ["蓋亞能量", "灼熱流沙"], BUF: ["地殼裝甲"], DIS: ["流沙地獄"] },
  "飛行": { ATK: ["神鳥猛攻"], SPA: ["天翔風暴", "真空刃"], BUF: ["順風·極"], DIS: ["暴風眼"] },
  "超能力": { ATK: ["意念爆破"], SPA: ["心靈風暴", "極限精神"], BUF: ["精神屏障"], DIS: ["重力場"] },
  "蟲":   { ATK: ["巨角衝撞"], SPA: ["蟲群風暴", "顫音共鳴"], BUF: ["蟲蛻重生"], DIS: ["黏稠蛛網"] },
  "岩石": { ATK: ["尖石隕落", "雙刃撞擊"], SPA: ["隕石爆破", "原始能量"], BUF: ["岩石護甲"], DIS: ["沙塵暴"] },
  "幽靈": { ATK: ["暗影強襲"], SPA: ["深淵暗影", "魂火"], BUF: ["靈魂分擔"], DIS: ["詛咒連鎖"] },
  "龍":   { ATK: ["龍神爪", "龍神逆鱗"], SPA: ["龍星殞落", "時空崩壞"], BUF: ["龍之鼓舞"], DIS: ["龍之詛咒·極"] },
  "惡":   { ATK: ["暗黑亂舞", "深淵突刺"], SPA: ["深淵波動", "絕望制裁"], BUF: ["暗黑契約"], DIS: ["絕望告別"] },
  "鋼":   { ATK: ["流星拳", "鋼鐵重壓"], SPA: ["鋼鐵加農", "磁軌炮"], BUF: ["合金裝甲"], DIS: ["磁場崩壞"] },
  "妖精": { ATK: ["妖精狂歡"], SPA: ["妖精爆裂", "月光爆破"], BUF: ["妖精領域"], DIS: ["魅惑漩渦"] }
};

var ARCHETYPE_TEMPLATES = {};

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
        function getUltFallback(idx) {
          var fb = ["泰山壓頂", "地球上投", "終極衝擊", "破壞光線"];
          return fb[idx] || fb[0];
        }
        var ultT3Name = topAtk ? (ULT_MOVE_RENAME[topAtk] || getUltFallback(0)) : null;
        var ultT4Name = topSpa ? (ULT_MOVE_RENAME[topSpa] || getUltFallback(1)) : null;
        if (topAtk) ultNodes.push({ tier: 3, name: ultT3Name, spCost: 3, prereqs: [GENERIC_ULT_T2[0]] });
        if (topSpa) ultNodes.push({ tier: 4, name: ultT4Name, spCost: 4, prereqs: [ultT3Name] });
        if (sigMove) {
          ultNodes.push({ tier: 5, name: sigMove, spCost: 5, prereqs: [ultT4Name] });
        } else {
          ultNodes.push({ tier: 5, name: getUltFallback(2), spCost: 5, prereqs: [ultT4Name] });
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

// ========== Phase 1: 變體選擇演算法 ==========

var ULT_VARIANTS = {};

function seededRandom(seed) {
  var x = Math.abs(seed | 0) % 2147483647;
  if (x <= 0) x = 1;
  x = (x * 16807) % 2147483647;
  return (x - 1) / 2147483646;
}

function selectVariant(pokemonInfo) {
  if (!pokemonInfo || !pokemonInfo.primaryType) return null;

  var type = pokemonInfo.primaryType;
  var spec = TYPE_SPEC_V2[type];
  if (!spec || !spec.VARIANTS) return null;

  var variantNames = Object.keys(spec.VARIANTS);
  if (variantNames.length === 0) return null;
  if (variantNames.length === 1) return variantNames[0];

  var personality = pokemonInfo.personality != null ? pokemonInfo.personality : 42;
  var stats = pokemonInfo.stats || { atk: 50, spa: 50, spd: 50, def: 50 };
  var atk = stats.atk || 50;
  var spa = stats.spa || 50;
  var spd = stats.spd || 50;
  var def = stats.def || 50;

  var bestVariant = null;
  var bestScore = -Infinity;

  for (var vi = 0; vi < variantNames.length; vi++) {
    var name = variantNames[vi];
    var variant = spec.VARIANTS[name];
    var ps = variant.preferredStats || {};

    var score = (ps.ATK || 1.0) * atk + (ps.SPA || 1.0) * spa + (ps.SPD || 1.0) * spd + (ps.DEF || 1.0) * def;
    score += (personality % (vi + 3)) * 0.001;

    if (score > bestScore) {
      bestScore = score;
      bestVariant = name;
    }
  }

  return bestVariant;
}

function buildTreeFromVariant(variantData, personality) {
  if (!variantData || !variantData.tiers) return null;
  return {
    tiers: JSON.parse(JSON.stringify(variantData.tiers)),
    theme: variantData.theme || "",
    ultMapping: variantData.ultMapping || "A"
  };
}

function selectUltVariant(speciesName, pokemonData) {
  if (!pokemonData || !pokemonData.primaryType) return null;
  return selectVariant(pokemonData);
}

function resolveT5Move(variantData, type) {
  if (!variantData || !variantData.tiers || !variantData.tiers.T5) return null;
  var t5 = variantData.tiers.T5;
  var allMoves = [];
  var roles = ["ATK", "SPA", "BUF", "DIS"];
  for (var ri = 0; ri < roles.length; ri++) {
    var moves = t5[roles[ri]];
    if (moves && Array.isArray(moves)) {
      for (var mi = 0; mi < moves.length; mi++) {
        if (moves[mi]) allMoves.push(moves[mi]);
      }
    }
  }
  return allMoves.length > 0 ? allMoves : null;
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
window.TYPE_SPEC_V2 = TYPE_SPEC_V2;
window.TYPE_T5_SIGNATURES = TYPE_T5_SIGNATURES;
window.ULT_VARIANTS = ULT_VARIANTS;
window.selectVariant = selectVariant;
window.seededRandom = seededRandom;
window.buildTreeFromVariant = buildTreeFromVariant;
window.selectUltVariant = selectUltVariant;
window.resolveT5Move = resolveT5Move;

})();
