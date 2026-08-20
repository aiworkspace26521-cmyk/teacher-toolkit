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

// ========== v3.1 SP 經濟常數（Step 1.1） ==========
// 舊常數（TIER_SP_COST / TIER_SP_THRESHOLD / MAX_MOVE_LEVEL）保留供回滾
var TIER_SP_COST_V31     = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };      // 節點解鎖（6選1）成本
var TIER_SP_THRESHOLD_V31 = { 1: 0, 2: 3, 3: 8, 4: 15, 5: 24 };   // 同樹累計SP門檻
var MAX_MOVE_LEVEL_V31   = { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 };      // 全階統一 Lv.5
var MODIFIER_SP_COST     = 3;                                     // 質變成本
var SECOND_PICK_MULT     = 1.5;                                   // 同階第2招倍率
var MAX_TOTAL_SP_V31     = 90;                                    // 每寵總量

// ULT 招式新名稱映射（取代舊的 +Pro 規則）
var ULT_MOVE_RENAME = {
  "噴射火焰": "焚焰放射",
  "大字爆": "滅世爆焰",
  "暗影球": "噬影球",
  "地震": "震滅",
  "十萬伏特": "轟雷",
  "打雷": "萬雷轟"
};

var TYPE_SPEC_V2 = {
"一般": {
    theme: "萬能中庸，招式樸素直接",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "物理強攻型": {
        theme: "高物攻、壓制",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["撞擊"], SPA: ["覺醒力量"], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["泰山壓頂"], SPA: ["高速星星"], BUF: ["影子分身"], DIS: ["瞪眼"] },
          T3: { ATK: ["劈開"], SPA: [], BUF: ["劍舞"], DIS: ["清除之煙"] },
          T4: { ATK: ["捨身衝撞"], SPA: ["巨聲"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻轟炸型": {
        theme: "高特攻、轟炸",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["高速星星"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["摔打"], SPA: ["巨聲"], BUF: ["高速移動"], DIS: [] },
          T3: { ATK: [], SPA: ["覺醒力量"], BUF: ["冥想"], DIS: ["怪異之光"] },
          T4: { ATK: [], SPA: ["三角攻擊"], BUF: ["替身"], DIS: ["電磁波"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "速攻擾亂型": {
        theme: "先制、速度壓制",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["電光一閃"], SPA: [], BUF: ["搖尾巴"], DIS: ["瞪眼"] },
          T2: { ATK: ["摔打"], SPA: ["高速星星"], BUF: ["高速移動"], DIS: ["清除之煙"] },
          T3: { ATK: ["劈開"], SPA: [], BUF: ["替身"], DIS: ["黑霧"] },
          T4: { ATK: ["捨身衝撞"], SPA: [], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦回復型": {
        theme: "坦克、續航",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "D",
        tiers: {
          T1: { ATK: [], SPA: [], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["摔打"], SPA: ["高速星星"], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: [], SPA: ["巨聲"], BUF: ["瞬間失憶"], DIS: ["劇毒"] },
          T4: { ATK: ["泰山壓頂"], SPA: ["破壞光線"], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "雙刀均衡型": {
        theme: "靈活、適應",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["撞擊"], SPA: ["高速星星"], BUF: ["搖尾巴"], DIS: ["瞪眼"] },
          T2: { ATK: ["電光一閃"], SPA: ["巨聲"], BUF: ["影子分身"], DIS: [] },
          T3: { ATK: ["摔打"], SPA: ["三角攻擊"], BUF: ["劍舞"], DIS: ["黑霧"] },
          T4: { ATK: ["捨身衝撞"], SPA: ["破壞光線"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: ["哈欠"], BUF: ["腹鼓"], DIS: [] }
        }
      }
    
    }
  },

  "火": {
    theme: "高攻擊、燃燒特化、天氣主導",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "物理猛攻型": {
        theme: "物攻壓制、燃燒附帶",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["火花"], SPA: ["噴射火焰"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["火焰拳"], SPA: ["魔法火焰"], BUF: ["影子分身"], DIS: ["煙幕"] },
          T3: { ATK: ["火焰踢"], SPA: [], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["閃焰衝鋒"], SPA: ["大字爆"], BUF: ["大晴天"], DIS: ["鬼火"] },
          T5: { ATK: ["V熱焰"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻轟炸型": {
        theme: "特攻轟炸、範圍",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["火焰牙"], SPA: ["火花"], BUF: ["搖尾巴"], DIS: [] },
          T2: { ATK: [], SPA: ["噴射火焰"], BUF: ["高速移動"], DIS: ["火焰旋渦"] },
          T3: { ATK: ["火焰拳"], SPA: ["大字爆"], BUF: ["冥想"], DIS: ["怪異之光"] },
          T4: { ATK: [], SPA: ["熱風"], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["焚焰放射"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "速攻燃燒型": {
        theme: "速度壓制、先制",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["火花"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["火焰牙"], SPA: ["魔法火焰"], BUF: ["高速移動"], DIS: ["吼叫"] },
          T3: { ATK: ["閃焰衝鋒"], SPA: [], BUF: ["替身"], DIS: ["鬼火"] },
          T4: { ATK: ["雷電牙"], SPA: ["大字爆"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦反擊型": {
        theme: "坦克、反傷",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["火焰牙"], SPA: ["火花"], BUF: ["變硬"], DIS: [] },
          T2: { ATK: ["火焰拳"], SPA: ["魔法火焰"], BUF: ["鐵壁"], DIS: ["煙幕"] },
          T3: { ATK: [], SPA: ["噴射火焰"], BUF: ["健美"], DIS: ["清除之煙"] },
          T4: { ATK: ["泰山壓頂"], SPA: ["大字爆"], BUF: ["守住"], DIS: ["鬼火"] },
          T5: { ATK: ["大爆炸"], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "雙刀混合型": {
        theme: "靈活、全方面",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["火焰牙"], SPA: ["火花"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["火焰拳"], SPA: ["噴射火焰"], BUF: ["影子分身"], DIS: ["煙幕"] },
          T3: { ATK: ["火焰踢"], SPA: ["大字爆"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["閃焰衝鋒"], SPA: ["熱風"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["V熱焰"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "天氣主導型": {
        theme: "晴天戰術、日照加成",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "D",
        tiers: {
          T1: { ATK: [], SPA: ["火花"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["火焰牙"], SPA: ["噴射火焰"], BUF: ["大晴天"], DIS: ["火焰旋渦"] },
          T3: { ATK: [], SPA: ["大字爆"], BUF: ["替身"], DIS: ["鬼火"] },
          T4: { ATK: [], SPA: ["熱風"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: ["滅世爆焰"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "干擾消耗型": {
        theme: "燃燒、混亂疊加",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "E",
        tiers: {
          T1: { ATK: [], SPA: ["火花"], BUF: [], DIS: ["煙幕"] },
          T2: { ATK: [], SPA: ["噴射火焰"], BUF: ["替身"], DIS: ["鬼火"] },
          T3: { ATK: ["火焰拳"], SPA: ["大字爆"], BUF: [], DIS: ["怪異之光"] },
          T4: { ATK: [], SPA: ["熱風"], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      }
    
    }
  },

  "水": {
    theme: "防禦回復、潮濕干擾、天氣輔助",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "物理強攻型": {
        theme: "物攻壓制、冰牙輔助",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["水槍"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["噴射拳"], SPA: ["水之波動"], BUF: ["龍之舞"], DIS: [] },
          T3: { ATK: ["攀瀑"], SPA: [], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["水之尾"], SPA: ["衝浪"], BUF: ["鐵壁"], DIS: ["冰凍牙"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻壓制型": {
        theme: "特攻轟炸、續航",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["水槍"], BUF: ["搖尾巴"], DIS: ["叫聲"] },
          T2: { ATK: [], SPA: ["水之波動"], BUF: ["影子分身"], DIS: ["黑霧"] },
          T3: { ATK: [], SPA: ["熱水"], BUF: ["冥想"], DIS: ["浸水"] },
          T4: { ATK: ["摔打"], SPA: ["水炮"], BUF: ["瞬間失憶"], DIS: [] },
          T5: { ATK: [], SPA: ["衝浪"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "速攻擾亂型": {
        theme: "先制、變化",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["貝殼刃"], SPA: ["水槍"], BUF: [], DIS: ["叫聲"] },
          T2: { ATK: ["噴射拳"], SPA: ["水之波動"], BUF: ["高速移動"], DIS: ["玩水"] },
          T3: { ATK: [], SPA: ["熱水"], BUF: ["替身"], DIS: [] },
          T4: { ATK: ["水之尾"], SPA: ["衝浪"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦坦克型": {
        theme: "鐵壁、回復",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: [], SPA: ["水槍"], BUF: ["縮入殼中"], DIS: ["叫聲"] },
          T2: { ATK: ["泰山壓頂"], SPA: ["水之波動"], BUF: ["鐵壁"], DIS: ["玩水"] },
          T3: { ATK: [], SPA: ["熱水"], BUF: ["瞬間失憶"], DIS: [] },
          T4: { ATK: ["捨身衝撞"], SPA: ["水炮"], BUF: ["水流環"], DIS: ["劇毒"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "雙刀技巧型": {
        theme: "靈活、適應",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["貝殼刃"], SPA: ["水槍"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["噴射拳"], SPA: ["水之波動"], BUF: ["劍舞"], DIS: [] },
          T3: { ATK: ["攀瀑"], SPA: ["濁流"], BUF: ["替身"], DIS: [] },
          T4: { ATK: ["水之尾"], SPA: ["衝浪"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: ["水炮"], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "草": {
    theme: "回復續航、粉末干擾、天氣主導",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "物理強攻型": {
        theme: "木角、物攻壓制",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["藤鞭"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["飛葉快刀"], SPA: ["能量球"], BUF: ["生長"], DIS: ["麻痺粉"] },
          T3: { ATK: ["木角"], SPA: [], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["日光刃"], SPA: ["日光束"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["木槌"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻消耗型": {
        theme: "特攻轟炸、持續傷",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["藤鞭"], BUF: ["叫聲"], DIS: ["毒粉"] },
          T2: { ATK: [], SPA: ["魔法葉"], BUF: ["生長"], DIS: ["麻痺粉"] },
          T3: { ATK: ["種子炸彈"], SPA: ["能量球"], BUF: ["光合作用"], DIS: ["寄生種子"] },
          T4: { ATK: [], SPA: ["飛葉風暴"], BUF: ["芳香治療"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["萬葉裁決"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "回復續航型": {
        theme: "光合治療、坦克",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["藤鞭"], BUF: ["叫聲"], DIS: ["毒粉"] },
          T2: { ATK: [], SPA: ["魔法葉"], BUF: ["生長"], DIS: ["睡眠粉"] },
          T3: { ATK: ["木角"], SPA: ["能量球"], BUF: ["光合作用"], DIS: ["寄生種子"] },
          T4: { ATK: [], SPA: ["日光束"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "粉末干擾型": {
        theme: "睡眠、毒粉控制",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["藤鞭"], SPA: [], BUF: [], DIS: ["毒粉"] },
          T2: { ATK: [], SPA: ["魔法葉"], BUF: ["影子分身"], DIS: ["麻痺粉"] },
          T3: { ATK: ["種子炸彈"], SPA: ["能量球"], BUF: ["替身"], DIS: ["睡眠粉"] },
          T4: { ATK: ["木槌"], SPA: [], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "天氣加速型": {
        theme: "晴天、日光束戰術",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["藤鞭"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["飛葉快刀"], SPA: ["能量球"], BUF: ["高速移動"], DIS: ["麻痺粉"] },
          T3: { ATK: ["種子炸彈"], SPA: ["打草結"], BUF: ["大晴天"], DIS: [] },
          T4: { ATK: ["日光刃"], SPA: ["飛葉風暴"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: ["日光束"], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "均衡雙刀型": {
        theme: "靈活、全方面",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["藤鞭"], SPA: ["吸收"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["飛葉快刀"], SPA: ["魔法葉"], BUF: ["劍舞"], DIS: ["寄生種子"] },
          T3: { ATK: ["木角"], SPA: ["能量球"], BUF: ["光合作用"], DIS: [] },
          T4: { ATK: ["木槌"], SPA: ["飛葉風暴"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "電": {
    theme: "速度特化、麻痺干擾、高速壓制",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "閃電強攻型": {
        theme: "物攻壓制、電氣",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["電擊"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["雷電拳"], SPA: ["電球"], BUF: ["充電"], DIS: ["電磁波"] },
          T3: { ATK: ["瘋狂伏特"], SPA: [], BUF: ["替身"], DIS: [] },
          T4: { ATK: ["閃電強襲"], SPA: ["打雷"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻轟炸型": {
        theme: "特攻壓制、範圍",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["電擊"], BUF: ["搖尾巴"], DIS: [] },
          T2: { ATK: [], SPA: ["十萬伏特"], BUF: ["高速移動"], DIS: ["電磁波"] },
          T3: { ATK: [], SPA: ["放電"], BUF: ["充電"], DIS: ["怪異電波"] },
          T4: { ATK: [], SPA: ["打雷"], BUF: ["替身"], DIS: [] },
          T5: { ATK: [], SPA: ["萬雷轟"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "速攻壓制型": {
        theme: "先制、速度壓制",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["閃電踢"], SPA: ["電擊"], BUF: ["搖尾巴"], DIS: [] },
          T2: { ATK: ["雷電拳"], SPA: ["電球"], BUF: ["高速移動"], DIS: ["電磁波"] },
          T3: { ATK: ["瘋狂伏特"], SPA: [], BUF: ["替身"], DIS: [] },
          T4: { ATK: ["閃電強襲"], SPA: ["伏特交換"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "麻痺干擾型": {
        theme: "麻痺控場、消耗",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["電擊"], BUF: [], DIS: ["電磁波"] },
          T2: { ATK: ["雷電拳"], SPA: ["電球"], BUF: ["電磁漂浮"], DIS: ["綁緊"] },
          T3: { ATK: ["瘋狂伏特"], SPA: ["放電"], BUF: ["替身"], DIS: ["怪異電波"] },
          T4: { ATK: [], SPA: ["打雷"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["電磁炮"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "雙刀混合型": {
        theme: "靈活、適應",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["閃電踢"], SPA: ["電擊"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["雷電拳"], SPA: ["十萬伏特"], BUF: ["電磁漂浮"], DIS: ["電磁波"] },
          T3: { ATK: ["瘋狂伏特"], SPA: ["放電"], BUF: ["充電"], DIS: [] },
          T4: { ATK: ["雷電牙"], SPA: ["光澤電炮"], BUF: ["替身"], DIS: ["怪異電波"] },
          T5: { ATK: [], SPA: ["轟雷"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦電磁型": {
        theme: "坦克、漂浮",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: [], SPA: ["電擊"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["雷電拳"], SPA: ["電球"], BUF: ["電磁漂浮"], DIS: ["電磁波"] },
          T3: { ATK: [], SPA: ["十萬伏特"], BUF: ["鐵壁"], DIS: [] },
          T4: { ATK: ["雷電牙"], SPA: ["打雷"], BUF: ["守住"], DIS: ["金屬音"] },
          T5: { ATK: [], SPA: ["萬雷轟"], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "冰": {
    theme: "冰凍控制、氣候主導、緩速壓制",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "冰錐強攻型": {
        theme: "物攻、冰凍牙",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["冰礫"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["冰凍拳"], SPA: [], BUF: ["影子分身"], DIS: ["★冰霜陷阱"] },
          T3: { ATK: ["冰錐"], SPA: [], BUF: ["劍舞"], DIS: ["冰凍之風"] },
          T4: { ATK: ["冰柱墜擊"], SPA: ["冰凍光束"], BUF: ["替身"], DIS: [] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻雪暴型": {
        theme: "特攻、暴風雪",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["冰凍之風"], BUF: ["搖尾巴"], DIS: [] },
          T2: { ATK: ["冰凍牙"], SPA: ["冰凍光束"], BUF: ["雪景"], DIS: [] },
          T3: { ATK: [], SPA: ["暴風雪"], BUF: ["替身"], DIS: ["★雪崩詛咒"] },
          T4: { ATK: ["冰柱墜擊"], SPA: ["冷凍光束"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦冰牆型": {
        theme: "坦克、極光幕",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["冰凍之風"], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["冰凍牙"], SPA: ["冰凍光束"], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: [], SPA: ["暴風雪"], BUF: ["極光幕"], DIS: ["冰雹"] },
          T4: { ATK: ["冰柱墜擊"], SPA: [], BUF: ["替身"], DIS: ["唱歌"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "天氣雪崩型": {
        theme: "冰雹、天氣",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "D",
        tiers: {
          T1: { ATK: ["冰礫"], SPA: ["冰凍之風"], BUF: [], DIS: ["瞪眼"] },
          T2: { ATK: [], SPA: ["冰凍光束"], BUF: ["冰雹"], DIS: ["★冰霜陷阱"] },
          T3: { ATK: ["冰錐"], SPA: ["暴風雪"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["冰柱墜擊"], SPA: ["冷凍光束"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "速攻先制型": {
        theme: "先制、冰礫",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["冰礫"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["冰凍拳"], SPA: ["冰凍光束"], BUF: ["高速移動"], DIS: [] },
          T3: { ATK: ["冰柱針"], SPA: [], BUF: ["替身"], DIS: ["冰凍之風"] },
          T4: { ATK: ["冰柱墜擊"], SPA: ["暴風雪"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      }
    
    }
  },

  "格鬥": {
    theme: "近戰壓制、戰技強化、會心特化",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "近戰強攻型": {
        theme: "近身戰、高物攻",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["碎岩"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["空手劈"], SPA: [], BUF: ["影子分身"], DIS: ["挑釁"] },
          T3: { ATK: ["十字劈"], SPA: ["真氣彈"], BUF: ["健美"], DIS: [] },
          T4: { ATK: ["近身戰"], SPA: [], BUF: ["鐵壁"], DIS: ["清除之煙"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "子彈連擊型": {
        theme: "先制、連續技",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["碎岩"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["子彈拳"], SPA: ["吸收拳"], BUF: ["高速移動"], DIS: ["挑釁"] },
          T3: { ATK: ["音速拳"], SPA: ["波導彈"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["飛膝踢"], SPA: [], BUF: ["替身"], DIS: ["清除之煙"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "速攻先制型": {
        theme: "音速拳、先制",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["碎岩"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["音速拳"], SPA: ["真氣彈"], BUF: ["高速移動"], DIS: [] },
          T3: { ATK: ["飛膝踢"], SPA: [], BUF: ["劍舞"], DIS: ["挑釁"] },
          T4: { ATK: ["近身戰"], SPA: [], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦硬漢型": {
        theme: "坦克、反擊",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["碎岩"], SPA: [], BUF: ["變硬"], DIS: ["瞪眼"] },
          T2: { ATK: ["空手劈"], SPA: [], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: ["吸取拳"], SPA: ["真氣彈"], BUF: ["健美"], DIS: ["清除之煙"] },
          T4: { ATK: ["地獄翻滾"], SPA: [], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "雙刀武術型": {
        theme: "波導、適應",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["碎岩"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["空手劈"], SPA: ["真氣彈"], BUF: ["劍舞"], DIS: [] },
          T3: { ATK: ["十字劈"], SPA: ["波導彈"], BUF: ["健美"], DIS: ["挑釁"] },
          T4: { ATK: ["近身戰"], SPA: [], BUF: ["替身"], DIS: ["清除之煙"] },
          T5: { ATK: ["終極衝擊"], SPA: ["破壞光線"], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "指導輔助型": {
        theme: "團隊、強化",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["碎岩"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["空手劈"], SPA: [], BUF: ["影子分身"], DIS: ["挑釁"] },
          T3: { ATK: ["吸取拳"], SPA: ["波導彈"], BUF: ["指導"], DIS: [] },
          T4: { ATK: ["近身戰"], SPA: [], BUF: ["劍舞"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "毒": {
    theme: "中毒消耗、持續傷害、干擾主導",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "劇毒猛攻型": {
        theme: "物攻、毒附帶",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["毒針"], SPA: [], BUF: ["叫聲"], DIS: ["毒粉"] },
          T2: { ATK: ["毒擊"], SPA: ["溶解液"], BUF: ["影子分身"], DIS: [] },
          T3: { ATK: ["十字毒刃"], SPA: [], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["垃圾射擊"], SPA: ["污泥炸彈"], BUF: ["替身"], DIS: ["劇毒"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻溶解型": {
        theme: "特攻、污泥波",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["溶解液"], BUF: ["叫聲"], DIS: ["毒粉"] },
          T2: { ATK: ["毒擊"], SPA: ["污泥炸彈"], BUF: ["溶化"], DIS: [] },
          T3: { ATK: [], SPA: ["污泥波"], BUF: ["替身"], DIS: ["劇毒"] },
          T4: { ATK: ["垃圾射擊"], SPA: ["毒液衝擊"], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "中毒消耗型": {
        theme: "持續傷害、坦克",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["溶解液"], BUF: [], DIS: ["毒粉"] },
          T2: { ATK: ["毒擊"], SPA: ["污泥炸彈"], BUF: ["影子分身"], DIS: ["麻痺粉"] },
          T3: { ATK: ["十字毒刃"], SPA: ["污泥波"], BUF: ["替身"], DIS: ["劇毒"] },
          T4: { ATK: [], SPA: ["毒液衝擊"], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "干擾擴散型": {
        theme: "劇毒、吹飛控場",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["溶解液"], BUF: [], DIS: ["毒粉"] },
          T2: { ATK: ["毒擊"], SPA: ["污泥炸彈"], BUF: ["黑霧"], DIS: ["清除之煙"] },
          T3: { ATK: [], SPA: ["污泥波"], BUF: ["溶化"], DIS: ["劇毒"] },
          T4: { ATK: ["垃圾射擊"], SPA: [], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "物理連毒型": {
        theme: "連擊、高速",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["毒針"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["毒擊"], SPA: ["溶解液"], BUF: ["高速移動"], DIS: ["毒粉"] },
          T3: { ATK: ["十字毒刃"], SPA: [], BUF: ["劍舞"], DIS: ["清除之煙"] },
          T4: { ATK: ["垃圾射擊"], SPA: ["污泥炸彈"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      }
    
    }
  },

  "地面": {
    theme: "地震壓制、岩石破碎、沙暴主導",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "地震強攻型": {
        theme: "物攻、地震",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["潑沙"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["重踏"], SPA: ["泥巴射擊"], BUF: ["影子分身"], DIS: ["玩沙"] },
          T3: { ATK: ["挖洞"], SPA: ["大地之力"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["地震"], SPA: [], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "沙暴天氣型": {
        theme: "沙暴、岩石",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["潑沙"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["重踏"], SPA: ["泥巴炸彈"], BUF: ["沙暴"], DIS: [] },
          T3: { ATK: ["直衝鑽"], SPA: ["大地之力"], BUF: ["岩石打磨"], DIS: ["吼叫"] },
          T4: { ATK: ["地震"], SPA: ["熱沙大地"], BUF: ["鐵壁"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦坦克型": {
        theme: "鐵壁、坦克",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["潑沙"], SPA: [], BUF: ["變硬"], DIS: ["瞪眼"] },
          T2: { ATK: ["重踏"], SPA: ["泥巴射擊"], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: ["挖洞"], SPA: ["大地之力"], BUF: ["健美"], DIS: ["吼叫"] },
          T4: { ATK: ["地震"], SPA: [], BUF: ["岩石打磨"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "物理連擊型": {
        theme: "直衝鑽、連擊",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["潑沙"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["重踏"], SPA: ["泥巴射擊"], BUF: ["高速移動"], DIS: ["玩沙"] },
          T3: { ATK: ["直衝鑽"], SPA: ["大地之力"], BUF: ["健美"], DIS: [] },
          T4: { ATK: ["地震"], SPA: [], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "雙刀震盪型": {
        theme: "靈活、大地之力",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["潑沙"], SPA: ["泥巴射擊"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["重踏"], SPA: ["大地之力"], BUF: ["影子分身"], DIS: ["玩沙"] },
          T3: { ATK: ["挖洞"], SPA: ["泥巴炸彈"], BUF: ["替身"], DIS: ["吼叫"] },
          T4: { ATK: ["地震"], SPA: ["熱沙大地"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: [], SPA: ["震滅"], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },
"飛行": {
    theme: "速度壓制、空中打擊、天氣輔助",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "勇鳥猛攻型": {
        theme: "物攻、勇鳥猛攻",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["啄"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["翅膀攻擊"], SPA: [], BUF: ["影子分身"], DIS: [] },
          T3: { ATK: ["燕返"], SPA: [], BUF: ["劍舞"], DIS: ["清除之煙"] },
          T4: { ATK: ["啄鑽"], SPA: ["熱風"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["勇鳥猛攻"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻風暴型": {
        theme: "特攻、暴風",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["起風"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["翅膀攻擊"], SPA: ["空氣之刃"], BUF: ["高速移動"], DIS: ["超音波"] },
          T3: { ATK: ["雜技"], SPA: ["空氣斬"], BUF: ["替身"], DIS: ["清除之煙"] },
          T4: { ATK: [], SPA: ["熱風"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["暴風"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "速攻飛行型": {
        theme: "先制、速度",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["啄"], SPA: [], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["翅膀攻擊"], SPA: ["起風"], BUF: ["高速移動"], DIS: ["瞪眼"] },
          T3: { ATK: ["燕返"], SPA: [], BUF: ["替身"], DIS: [] },
          T4: { ATK: ["雜技"], SPA: ["空氣斬"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: ["勇鳥猛攻"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦順風型": {
        theme: "坦克、輔助",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["啄"], SPA: [], BUF: ["變硬"], DIS: ["瞪眼"] },
          T2: { ATK: ["翅膀攻擊"], SPA: [], BUF: ["鐵壁"], DIS: ["吼叫"] },
          T3: { ATK: ["啄鑽"], SPA: ["空氣斬"], BUF: ["順風"], DIS: ["清除之煙"] },
          T4: { ATK: ["勇鳥猛攻"], SPA: [], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "先制啄擊型": {
        theme: "先制、連擊",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["啄"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["啄食"], SPA: [], BUF: ["影子分身"], DIS: ["超音波"] },
          T3: { ATK: ["燕返"], SPA: ["空氣斬"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["啄鑽"], SPA: [], BUF: ["替身"], DIS: ["催眠術"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "天氣控場型": {
        theme: "雨天/順風",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "D",
        tiers: {
          T1: { ATK: [], SPA: ["起風"], BUF: ["叫聲"], DIS: [] },
          T2: { ATK: ["翅膀攻擊"], SPA: ["空氣之刃"], BUF: ["順風"], DIS: ["吼叫"] },
          T3: { ATK: [], SPA: ["空氣斬"], BUF: ["替身"], DIS: ["清除之煙"] },
          T4: { ATK: ["啄鑽"], SPA: ["熱風"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: ["暴風"], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "超能力": {
    theme: "精神控制、特殊打擊、場地主導",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "精神強念型": {
        theme: "特攻、念力壓制",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: [], SPA: ["念力"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["意念頭錘"], SPA: ["幻象光線"], BUF: ["影子分身"], DIS: ["奇異之光"] },
          T3: { ATK: [], SPA: ["精神強念"], BUF: ["冥想"], DIS: [] },
          T4: { ATK: ["精神利刃"], SPA: ["預知未來"], BUF: ["替身"], DIS: ["電磁波"] },
          T5: { ATK: [], SPA: ["極限精神"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "場地控制型": {
        theme: "精神場地、輔助",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["念力"], BUF: ["搖尾巴"], DIS: [] },
          T2: { ATK: ["意念頭錘"], SPA: ["幻象光線"], BUF: ["精神場地"], DIS: ["奇異之光"] },
          T3: { ATK: [], SPA: ["精神強念"], BUF: ["冥想"], DIS: ["反射壁"] },
          T4: { ATK: [], SPA: ["預知未來"], BUF: ["替身"], DIS: ["光牆"] },
          T5: { ATK: [], SPA: ["精神擊破"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦回復型": {
        theme: "自我再生、光牆",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["念力"], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["意念頭錘"], SPA: ["幻象光線"], BUF: ["光牆"], DIS: ["奇異之光"] },
          T3: { ATK: [], SPA: ["精神強念"], BUF: ["瞬間失憶"], DIS: ["反射壁"] },
          T4: { ATK: ["精神利刃"], SPA: [], BUF: ["替身"], DIS: ["劇毒"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "空間扭曲型": {
        theme: "戲法空間、速控",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["念力"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["意念頭錘"], SPA: ["幻象光線"], BUF: ["戲法空間"], DIS: ["奇異之光"] },
          T3: { ATK: [], SPA: ["精神強念"], BUF: ["替身"], DIS: ["催眠術"] },
          T4: { ATK: [], SPA: ["預知未來"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "干擾戰術型": {
        theme: "反射壁、雙牆",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["念力"], BUF: [], DIS: ["叫聲"] },
          T2: { ATK: ["精神利刃"], SPA: ["幻象光線"], BUF: ["替身"], DIS: ["奇異之光"] },
          T3: { ATK: [], SPA: ["精神強念"], BUF: ["冥想"], DIS: ["電磁波"] },
          T4: { ATK: [], SPA: ["預知未來"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "雙刀均衡型": {
        theme: "意念頭錘、適應",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["念力"], SPA: ["輔助力量"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["意念頭錘"], SPA: ["幻象光線"], BUF: ["劍舞"], DIS: [] },
          T3: { ATK: ["精神利刃"], SPA: ["精神強念"], BUF: ["替身"], DIS: ["奇異之光"] },
          T4: { ATK: ["意念爆破"], SPA: ["預知未來"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "蟲": {
    theme: "連擊壓制、急速干擾、進化戰術",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "急速連擊型": {
        theme: "連擊、高速",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["連斬"], SPA: [], BUF: ["叫聲"], DIS: ["吐絲"] },
          T2: { ATK: ["蟲咬"], SPA: [], BUF: ["高速移動"], DIS: [] },
          T3: { ATK: ["十字剪"], SPA: ["信號光束"], BUF: ["劍舞"], DIS: ["麻痺粉"] },
          T4: { ATK: ["急速折返"], SPA: [], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "蝶舞強化型": {
        theme: "強化、特攻",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["蟲之抵抗"], BUF: ["叫聲"], DIS: ["吐絲"] },
          T2: { ATK: ["蟲咬"], SPA: ["信號光束"], BUF: ["蝶舞"], DIS: ["麻痺粉"] },
          T3: { ATK: ["猛撲"], SPA: ["蟲鳴"], BUF: ["替身"], DIS: ["睡眠粉"] },
          T4: { ATK: [], SPA: ["蟲群風暴"], BUF: ["守住"], DIS: ["毒粉"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "物理坦克型": {
        theme: "物攻、防禦",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["連斬"], SPA: [], BUF: ["變硬"], DIS: ["瞪眼"] },
          T2: { ATK: ["蟲咬"], SPA: [], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: ["猛撲"], SPA: ["信號光束"], BUF: ["健美"], DIS: ["麻痺粉"] },
          T4: { ATK: ["十字剪"], SPA: [], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "特攻蟲鳴型": {
        theme: "特攻、蟲鳴",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["蟲咬"], BUF: ["叫聲"], DIS: ["吐絲"] },
          T2: { ATK: [], SPA: ["信號光束"], BUF: ["影子分身"], DIS: ["麻痺粉"] },
          T3: { ATK: ["猛撲"], SPA: ["蟲鳴"], BUF: ["替身"], DIS: ["睡眠粉"] },
          T4: { ATK: [], SPA: ["顫音共鳴"], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "干擾吐絲型": {
        theme: "網、緩速控場",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["連斬"], SPA: [], BUF: [], DIS: ["吐絲"] },
          T2: { ATK: ["蟲咬"], SPA: ["信號光束"], BUF: ["高速移動"], DIS: ["黏黏網"] },
          T3: { ATK: ["猛撲"], SPA: [], BUF: ["替身"], DIS: ["毒針"] },
          T4: { ATK: ["十字剪"], SPA: ["蟲鳴"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "岩石": {
    theme: "堅硬防禦、岩石壓制、沙暴主導",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "石刃強攻型": {
        theme: "物攻、尖石",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["落石"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["岩石封鎖"], SPA: ["原始之力"], BUF: ["影子分身"], DIS: ["隱形岩"] },
          T3: { ATK: ["岩崩"], SPA: [], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["尖石攻擊"], SPA: ["力量寶石"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["雙刃頭錘"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "沙暴防禦型": {
        theme: "沙暴、特防",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["落石"], SPA: [], BUF: ["變硬"], DIS: ["瞪眼"] },
          T2: { ATK: ["岩石封鎖"], SPA: ["原始之力"], BUF: ["沙暴"], DIS: [] },
          T3: { ATK: ["岩崩"], SPA: ["力量寶石"], BUF: ["鐵壁"], DIS: ["吼叫"] },
          T4: { ATK: ["尖石攻擊"], SPA: [], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "鐵壁坦克型": {
        theme: "防禦、鐵壁",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["落石"], SPA: [], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["岩石封鎖"], SPA: ["原始之力"], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: ["岩崩"], SPA: [], BUF: ["岩石打磨"], DIS: ["隱形岩"] },
          T4: { ATK: ["尖石攻擊"], SPA: ["力量寶石"], BUF: ["替身"], DIS: ["劇毒"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "暴力推土型": {
        theme: "岩石炮、重壓",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["落石"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["岩石封鎖"], SPA: [], BUF: ["高速移動"], DIS: ["吼叫"] },
          T3: { ATK: ["岩崩"], SPA: ["原始之力"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["尖石攻擊"], SPA: [], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: ["岩石炮"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "天氣加速型": {
        theme: "沙暴+速攻",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["落石"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["岩石封鎖"], SPA: ["原始之力"], BUF: ["沙暴"], DIS: ["岩石打磨"] },
          T3: { ATK: ["岩崩"], SPA: [], BUF: ["高速移動"], DIS: [] },
          T4: { ATK: ["尖石攻擊"], SPA: ["力量寶石"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "幽靈": {
    theme: "詛咒消耗、迴避擾亂、先制打擊",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "暗影潛襲型": {
        theme: "潛靈、物攻",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["暗影拳"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["暗影爪"], SPA: ["黑夜魔影"], BUF: ["影子分身"], DIS: ["奇異之光"] },
          T3: { ATK: ["潛靈奇襲"], SPA: ["暗影球"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["縫影"], SPA: ["禍不單行"], BUF: ["替身"], DIS: ["詛咒"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻噬魂型": {
        theme: "暗影球、特攻",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["驚嚇"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["暗影爪"], SPA: ["黑夜魔影"], BUF: ["影子分身"], DIS: ["奇異之光"] },
          T3: { ATK: [], SPA: ["暗影球"], BUF: ["替身"], DIS: ["催眠術"] },
          T4: { ATK: ["潛靈奇襲"], SPA: ["禍不單行"], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["深淵暗影"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "詛咒消耗型": {
        theme: "詛咒、分擔痛楚",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["驚嚇"], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["暗影拳"], SPA: ["黑夜魔影"], BUF: ["影子分身"], DIS: ["奇異之光"] },
          T3: { ATK: ["暗影爪"], SPA: ["暗影球"], BUF: ["詛咒"], DIS: ["分擔痛楚"] },
          T4: { ATK: [], SPA: ["禍不單行"], BUF: ["替身"], DIS: ["劇毒"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "同命干擾型": {
        theme: "同命、劍舞",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["暗影拳"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["暗影爪"], SPA: ["黑夜魔影"], BUF: ["高速移動"], DIS: ["奇異之光"] },
          T3: { ATK: ["潛靈奇襲"], SPA: ["暗影球"], BUF: ["劍舞"], DIS: ["同命"] },
          T4: { ATK: ["暗影偷襲"], SPA: ["禍不單行"], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "替身戰術型": {
        theme: "替身、保護",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["暗影拳"], SPA: [], BUF: [], DIS: ["叫聲"] },
          T2: { ATK: ["暗影爪"], SPA: ["黑夜魔影"], BUF: ["替身"], DIS: ["奇異之光"] },
          T3: { ATK: ["潛靈奇襲"], SPA: ["暗影球"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["影子偷襲"], SPA: ["禍不單行"], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "龍": {
    theme: "龍舞強化、逆鱗爆發、傳說威壓",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "逆鱗強攻型": {
        theme: "物攻、龍舞",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["龍爪"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["龍尾"], SPA: ["龍息"], BUF: ["龍舞"], DIS: [] },
          T3: { ATK: ["龍之俯衝"], SPA: ["龍之波動"], BUF: ["劍舞"], DIS: ["吼叫"] },
          T4: { ATK: ["逆鱗"], SPA: [], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: ["龍神逆鱗"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "龍舞強化型": {
        theme: "龍舞+物攻兼顧",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["龍爪"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["龍尾"], SPA: ["龍息"], BUF: ["龍舞"], DIS: [] },
          T3: { ATK: ["龍之俯衝"], SPA: ["龍之波動"], BUF: ["替身"], DIS: [] },
          T4: { ATK: ["逆鱗"], SPA: [], BUF: ["劍舞"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "特攻龍星型": {
        theme: "特攻、龍星群",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["龍息"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["龍爪"], SPA: ["龍之波動"], BUF: ["影子分身"], DIS: ["奇異之光"] },
          T3: { ATK: [], SPA: ["巨聲"], BUF: ["冥想"], DIS: [] },
          T4: { ATK: ["龍尾"], SPA: ["龍星群"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["龍星殞落"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "雙刀均衡型": {
        theme: "龍爪+龍波動",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["龍爪"], SPA: ["龍息"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["龍尾"], SPA: ["龍之波動"], BUF: ["劍舞"], DIS: [] },
          T3: { ATK: ["龍之俯衝"], SPA: ["巨聲"], BUF: ["替身"], DIS: ["吼叫"] },
          T4: { ATK: ["逆鱗"], SPA: ["龍星群"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦反擊型": {
        theme: "坦克、龍尾",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["龍爪"], SPA: [], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["龍尾"], SPA: ["龍息"], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: [], SPA: ["龍之波動"], BUF: ["替身"], DIS: ["吼叫"] },
          T4: { ATK: ["龍之俯衝"], SPA: ["巨聲"], BUF: ["守住"], DIS: ["吹飛"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "傳說威壓型": {
        theme: "傳說、時空之力",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "D",
        tiers: {
          T1: { ATK: ["龍爪"], SPA: ["龍息"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["龍尾"], SPA: ["龍之波動"], BUF: ["劍舞"], DIS: [] },
          T3: { ATK: ["龍之俯衝"], SPA: ["巨聲"], BUF: ["冥想"], DIS: ["吼叫"] },
          T4: { ATK: ["逆鱗"], SPA: ["時空咆哮"], BUF: ["替身"], DIS: ["吹飛"] },
          T5: { ATK: ["終極衝擊"], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "惡": {
    theme: "陰謀詭計、先制偷襲、心理壓制",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "咬碎強攻型": {
        theme: "物攻、咬碎",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["咬住"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["出奇一擊"], SPA: ["大聲咆哮"], BUF: ["影子分身"], DIS: ["挑釁"] },
          T3: { ATK: ["咬碎"], SPA: ["惡之波動"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["暗襲要害"], SPA: [], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "詭計特攻型": {
        theme: "特攻、陰謀",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["大聲咆哮"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["出奇一擊"], SPA: ["惡之波動"], BUF: ["詭計"], DIS: ["挑釁"] },
          T3: { ATK: ["暗襲要害"], SPA: ["暗黑洞"], BUF: ["替身"], DIS: ["臨別禮物"] },
          T4: { ATK: [], SPA: ["絕望制裁"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["深淵波動"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "先制偷襲型": {
        theme: "突襲、先制",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["咬住"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["出奇一擊"], SPA: ["大聲咆哮"], BUF: ["高速移動"], DIS: ["挑釁"] },
          T3: { ATK: ["暗襲要害"], SPA: [], BUF: ["劍舞"], DIS: ["突襲"] },
          T4: { ATK: ["咬碎"], SPA: ["惡之波動"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "干擾陰謀型": {
        theme: "挑釁、臨別禮物",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["大聲咆哮"], BUF: [], DIS: ["叫聲"] },
          T2: { ATK: ["暗襲要害"], SPA: ["惡之波動"], BUF: ["詭計"], DIS: ["挑釁"] },
          T3: { ATK: [], SPA: ["暗黑洞"], BUF: ["替身"], DIS: ["臨別禮物"] },
          T4: { ATK: ["咬碎"], SPA: [], BUF: ["守住"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "雙刀暗黑型": {
        theme: "暗黑洞、傳說",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "D",
        tiers: {
          T1: { ATK: ["咬住"], SPA: ["大聲咆哮"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["出奇一擊"], SPA: ["惡之波動"], BUF: ["劍舞"], DIS: ["挑釁"] },
          T3: { ATK: ["暗襲要害"], SPA: ["暗黑洞"], BUF: ["詭計"], DIS: [] },
          T4: { ATK: ["咬碎"], SPA: ["絕望制裁"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      }
    
    }
  },

  "鋼": {
    theme: "鋼鐵防壁、磁場干擾、子彈連擊",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "鐵頭強攻型": {
        theme: "物攻、鐵頭",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["金屬爪"], SPA: [], BUF: ["瞪眼"], DIS: [] },
          T2: { ATK: ["鐵頭"], SPA: ["加農光炮"], BUF: ["影子分身"], DIS: ["金屬音"] },
          T3: { ATK: ["彗星拳"], SPA: [], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["重磅衝撞"], SPA: ["光澤電炮"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["流星拳"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "鋼鐵防壁型": {
        theme: "防禦、鐵壁",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["金屬爪"], SPA: [], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["鐵頭"], SPA: ["加農光炮"], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: ["陀螺球"], SPA: [], BUF: ["健美"], DIS: ["吼叫"] },
          T4: { ATK: ["重磅衝撞"], SPA: ["光澤電炮"], BUF: ["替身"], DIS: ["劇毒"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "子彈連擊型": {
        theme: "先制、子彈拳",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["金屬爪"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["子彈拳"], SPA: ["加農光炮"], BUF: ["高速移動"], DIS: [] },
          T3: { ATK: ["彗星拳"], SPA: [], BUF: ["劍舞"], DIS: ["金屬音"] },
          T4: { ATK: ["鐵頭"], SPA: ["光澤電炮"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "磁場干擾型": {
        theme: "金屬音、電磁",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["電擊"], BUF: ["叫聲"], DIS: ["電磁波"] },
          T2: { ATK: ["金屬爪"], SPA: ["加農光炮"], BUF: ["電磁漂浮"], DIS: ["金屬音"] },
          T3: { ATK: [], SPA: ["光澤電炮"], BUF: ["充電"], DIS: ["吼叫"] },
          T4: { ATK: ["鐵頭"], SPA: ["打雷"], BUF: ["替身"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["鋼鐵加農"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "雙刀鋼鐵型": {
        theme: "靈活、傳說",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: ["金屬爪"], SPA: [], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["鐵頭"], SPA: ["加農光炮"], BUF: ["鐵壁"], DIS: ["電磁波"] },
          T3: { ATK: ["彗星拳"], SPA: ["光澤電炮"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["重磅衝撞"], SPA: ["打雷"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["流星拳"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  },

  "妖精": {
    theme: "魅力干擾、魔法閃耀、治癒輔助",
    UNIVERSAL_MOVES: {},
    VARIANTS: {
      "月亮強攻型": {
        theme: "特攻、月亮之力",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "A",
        tiers: {
          T1: { ATK: [], SPA: ["妖精之風"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["吸取吻"], SPA: ["魅惑之聲"], BUF: ["影子分身"], DIS: ["天使之吻"] },
          T3: { ATK: [], SPA: ["月亮之力"], BUF: ["冥想"], DIS: [] },
          T4: { ATK: ["嬉鬧"], SPA: ["魔法閃耀"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["妖精爆裂"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "物理嬉鬧型": {
        theme: "物攻、嬉鬧",
        preferredStats: { ATK: 1.2, SPA: 0.8, SPD: 1.0, DEF: 1.0 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: ["拍擊"], SPA: [], BUF: ["搖尾巴"], DIS: ["叫聲"] },
          T2: { ATK: ["吸取吻"], SPA: ["妖精之風"], BUF: ["影子分身"], DIS: ["天使之吻"] },
          T3: { ATK: ["嬉鬧"], SPA: ["魅惑之聲"], BUF: ["劍舞"], DIS: [] },
          T4: { ATK: ["泰山壓頂"], SPA: ["魔法閃耀"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      },
      "特攻魔法型": {
        theme: "魔法閃耀、範圍",
        preferredStats: { ATK: 0.8, SPA: 1.2, SPD: 1.0, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["妖精之風"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["吸取吻"], SPA: ["魅惑之聲"], BUF: ["高速移動"], DIS: ["天使之吻"] },
          T3: { ATK: [], SPA: ["月亮之力"], BUF: ["冥想"], DIS: [] },
          T4: { ATK: ["嬉鬧"], SPA: ["魔法閃耀"], BUF: ["替身"], DIS: ["清除之煙"] },
          T5: { ATK: [], SPA: ["月光爆破"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦回復型": {
        theme: "薄霧場地、治癒",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.0, DEF: 1.3 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["妖精之風"], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["吸取吻"], SPA: ["魅惑之聲"], BUF: ["薄霧場地"], DIS: ["天使之吻"] },
          T3: { ATK: [], SPA: ["月亮之力"], BUF: ["瞬間失憶"], DIS: ["治癒波動"] },
          T4: { ATK: ["嬉鬧"], SPA: ["魔法閃耀"], BUF: ["替身"], DIS: ["劇毒"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "魅力干擾型": {
        theme: "撒嬌、魅惑",
        preferredStats: { ATK: 1.0, SPA: 1.0, SPD: 1.3, DEF: 1.0 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: [], SPA: ["妖精之風"], BUF: ["搖尾巴"], DIS: ["叫聲"] },
          T2: { ATK: ["吸取吻"], SPA: ["魅惑之聲"], BUF: ["替身"], DIS: ["天使之吻"] },
          T3: { ATK: ["嬉鬧"], SPA: ["月亮之力"], BUF: ["冥想"], DIS: ["撒嬌"] },
          T4: { ATK: [], SPA: ["魔法閃耀"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      }
    
    }
  }
};

var TYPE_T5_SIGNATURES = {
  "一般": { ATK: ["百萬噸重拳"], SPA: ["三角攻擊", "巨聲"], BUF: ["腹鼓"], DIS: ["滅亡之歌"] },
  "火":   { ATK: ["V熱焰"], SPA: ["焚焰放射","滅世爆焰"], BUF: ["腹鼓"], DIS: ["滅亡之歌"] },
  "水":   { ATK: ["攀瀑·極","怒濤衝鋒"], SPA: ["極巨水炮","深海漩渦"], BUF: ["水流環·極"], DIS: ["絕對零度"] },
  "草":   { ATK: ["木槌·大木","輝煌綠葉"], SPA: ["萬葉裁決","日光束·極"], BUF: ["光合再生"], DIS: ["腐蝕孢子"] },
  "電":   { ATK: ["電氣猛攻"], SPA: ["萬雷轟","磁能炮"], BUF: ["電磁屏障"], DIS: ["靜電場·極"] },
  "冰":   { ATK: ["冰柱墜擊"], SPA: ["絕對零度","極寒風暴"], BUF: ["冰川甲"], DIS: ["永凍之風"] },
  "格鬥": { ATK: ["真·近身戰","氣魄拳"], SPA: ["真波導彈"], BUF: ["戰意高昂"], DIS: ["威嚇粉碎"] },
  "毒":   { ATK: ["毒垃圾雨"], SPA: ["劇毒擴散","溶解泥彈"], BUF: ["毒液護甲"], DIS: ["瘴氣瀰漫"] },
  "地面": { ATK: ["震滅","地龍鑽"], SPA: ["蓋亞能量","灼熱流沙"], BUF: ["地殼裝甲"], DIS: ["流沙地獄"] },
  "飛行": { ATK: ["神鳥猛攻"], SPA: ["天翔風暴","真空刃"], BUF: ["順風·極"], DIS: ["暴風眼"] },
  "超能力":{ ATK: ["意念爆破"], SPA: ["心靈風暴","極限精神"], BUF: ["精神屏障"], DIS: ["重力場"] },
  "蟲":   { ATK: ["巨角衝撞"], SPA: ["蟲群風暴","顫音共鳴"], BUF: ["蟲蛻重生"], DIS: ["黏稠蛛網"] },
  "岩石": { ATK: ["尖石隕落","雙刃撞擊"], SPA: ["隕石爆破","原始能量"], BUF: ["岩石護甲"], DIS: ["沙塵暴"] },
  "幽靈": { ATK: ["暗影強襲"], SPA: ["深淵暗影","魂火"], BUF: ["靈魂分擔"], DIS: ["詛咒連鎖"] },
  "龍":   { ATK: ["龍神爪","龍神逆鱗"], SPA: ["龍星殞落","時空崩壞"], BUF: ["龍之鼓舞"], DIS: ["龍之詛咒·極"] },
  "惡":   { ATK: ["暗黑亂舞","深淵突刺"], SPA: ["深淵波動","絕望制裁"], BUF: ["暗黑契約"], DIS: ["絕望告別"] },
  "鋼":   { ATK: ["流星拳","鋼鐵重壓"], SPA: ["鋼鐵加農","磁軌炮"], BUF: ["合金裝甲"], DIS: ["磁場崩壞"] },
  "妖精": { ATK: ["妖精狂歡"], SPA: ["妖精爆裂","月光爆破"], BUF: ["妖精領域"], DIS: ["魅惑漩渦"] }
};

var ARCHETYPE_TEMPLATES = {
  "物理強攻型": {
    theme: "高物攻、壓制",
    preferredStats: { ATK: 1.3, SPA: 0.7, SPD: 0.9, DEF: 0.9 },
    ultMapping: "A",
    slots: {
      T1: { ATK: "type_basic_atk", SPA: null, BUF: "type_common_buf", DIS: "type_basic_dis" },
      T2: { ATK: "type_medium_atk", SPA: "type_coverage_spa", BUF: "screening", DIS: null },
      T3: { ATK: "type_strong_atk", SPA: null, BUF: "swords_dance", DIS: "screech" },
      T4: { ATK: "type_top_atk", SPA: "type_strong_spa", BUF: "substitute", DIS: "roar" },
      T5: { ATK: "type_finisher_atk", SPA: null, BUF: "belly_drum", DIS: null }
    }
  },
  "特攻轟炸型": {
    theme: "高特攻、轟炸",
    preferredStats: { ATK: 0.7, SPA: 1.3, SPD: 1.0, DEF: 0.8 },
    ultMapping: "B",
    slots: {
      T1: { ATK: null, SPA: "type_basic_spa", BUF: "type_basic_buf", DIS: "type_basic_dis" },
      T2: { ATK: "type_coverage_atk", SPA: "type_medium_spa", BUF: "speed_boost", DIS: null },
      T3: { ATK: null, SPA: "type_strong_spa", BUF: "calm_mind", DIS: "confuse_ray" },
      T4: { ATK: "self_boom", SPA: "type_top_spa", BUF: "protect", DIS: "thunder_wave" },
      T5: { ATK: null, SPA: "type_finisher_spa", BUF: "rest", DIS: null }
    }
  },
  "速攻擾亂型": {
    theme: "先制、速度壓制",
    preferredStats: { ATK: 1.0, SPA: 0.9, SPD: 1.3, DEF: 0.7 },
    ultMapping: "C",
    slots: {
      T1: { ATK: "quick_atk", SPA: null, BUF: "tail_wag", DIS: "leer" },
      T2: { ATK: "type_medium_atk", SPA: null, BUF: "agility", DIS: "type_early_disrupt" },
      T3: { ATK: "type_strong_atk", SPA: null, BUF: "substitute", DIS: "haze" },
      T4: { ATK: "type_top_atk", SPA: null, BUF: "protect", DIS: "whirlwind" },
      T5: { ATK: "universal_finisher_atk", SPA: null, BUF: "rest", DIS: null }
    }
  },
  "防禦坦克型": {
    theme: "坦克、續航",
    preferredStats: { ATK: 0.8, SPA: 0.7, SPD: 0.7, DEF: 1.3 },
    ultMapping: "D",
    slots: {
      T1: { ATK: null, SPA: null, BUF: "harden", DIS: "growl" },
      T2: { ATK: "type_coverage_atk", SPA: "type_basic_spa", BUF: "iron_defense", DIS: null },
      T3: { ATK: null, SPA: "type_medium_spa", BUF: "amnesia", DIS: "toxic" },
      T4: { ATK: "type_top_atk", SPA: "type_strong_spa", BUF: "protect", DIS: "whirlwind" },
      T5: { ATK: null, SPA: null, BUF: "rest", DIS: "perish_song" }
    }
  },
  "雙刀均衡型": {
    theme: "靈活、適應",
    preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 0.9, DEF: 0.8 },
    ultMapping: "C",
    slots: {
      T1: { ATK: "type_basic_atk", SPA: "type_basic_spa", BUF: "tail_wag", DIS: "leer" },
      T2: { ATK: "quick_atk", SPA: "type_medium_spa", BUF: "double_team", DIS: null },
      T3: { ATK: "type_medium_atk", SPA: null, BUF: "swords_dance", DIS: "haze" },
      T4: { ATK: "type_strong_atk", SPA: "type_strong_spa", BUF: "substitute", DIS: "roar" },
      T5: { ATK: "universal_finisher_atk", SPA: null, BUF: "belly_drum", DIS: null }
    }
  },
  "天氣主導型": {
    theme: "天氣、日照加成",
    preferredStats: { ATK: 0.9, SPA: 1.1, SPD: 1.0, DEF: 0.9 },
    ultMapping: "D",
    slots: {
      T1: { ATK: null, SPA: "type_basic_spa", BUF: "growl", DIS: null },
      T2: { ATK: "type_medium_atk", SPA: "type_medium_spa", BUF: "weather_summon", DIS: "type_weather_disrupt" },
      T3: { ATK: null, SPA: "type_strong_spa", BUF: "substitute", DIS: "will_o_wisp" },
      T4: { ATK: null, SPA: "type_top_spa", BUF: "protect", DIS: "whirlwind" },
      T5: { ATK: "universal_finisher_atk", SPA: "type_finisher_spa", BUF: "rest", DIS: null }
    }
  },
  "干擾消耗型": {
    theme: "燃燒、混亂疊加",
    preferredStats: { ATK: 0.7, SPA: 1.1, SPD: 1.0, DEF: 1.0 },
    ultMapping: "E",
    slots: {
      T1: { ATK: null, SPA: null, BUF: null, DIS: "smokescreen" },
      T2: { ATK: null, SPA: "type_medium_spa", BUF: "substitute", DIS: "will_o_wisp" },
      T3: { ATK: "type_strong_atk", SPA: "type_strong_spa", BUF: null, DIS: "confuse_ray" },
      T4: { ATK: null, SPA: "type_top_spa", BUF: "protect", DIS: "haze" },
      T5: { ATK: null, SPA: "universal_finisher_spa", BUF: "rest", DIS: "perish_song" }
    }
  }
};

var TYPE_MOVE_LIBRARY = {
  "一般": {
    type_basic_atk:      ["撞擊"],
    type_basic_spa:      ["高速星星"],
    type_basic_buf:      ["變硬"],
    type_basic_dis:      ["叫聲"],
    type_medium_atk:     ["摔打"],
    type_medium_spa:     ["巨聲"],
    type_strong_atk:     ["劈開"],
    type_strong_spa:     ["三角攻擊"],
    type_top_atk:        ["捨身衝撞"],
    type_top_spa:        ["破壞光線"],
    type_finisher_atk:   ["終極衝擊"],
    type_finisher_spa:   ["破壞光線"],
    type_coverage_atk:   ["電光一閃"],
    type_coverage_spa:   ["覺醒力量"],
    type_early_disrupt:  ["瞪眼"],
    type_weather_disrupt:["黑霧"],
    weather_summon:      ["大晴天"],
  },
  "火": {
    type_basic_atk:      ["火花"],
    type_basic_spa:      ["火花"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["煙幕"],
    type_medium_atk:     ["火焰拳"],
    type_medium_spa:     ["魔法火焰", "噴射火焰"],
    type_strong_atk:     ["火焰踢", "火焰牙"],
    type_strong_spa:     ["大字爆", "熱風"],
    type_top_atk:        ["閃焰衝鋒"],
    type_top_spa:        ["大字爆", "過熱"],
    type_finisher_atk:   ["V熱焰"],
    type_finisher_spa:   ["焚焰放射", "滅世爆焰"],
    type_coverage_atk:   ["雷電牙", "劈開"],
    type_coverage_spa:   ["覺醒力量"],
    type_early_disrupt:  ["火焰旋渦"],
    type_weather_disrupt:["鬼火"],
    weather_summon:      ["大晴天"],
  },
  "水": {
    type_basic_atk:      ["水槍"],
    type_basic_spa:      ["水槍"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["玩水"],
    type_medium_atk:     ["噴射拳"],
    type_medium_spa:     ["水之波動"],
    type_strong_atk:     ["攀瀑"],
    type_strong_spa:     ["熱水"],
    type_top_atk:        ["水之尾"],
    type_top_spa:        ["水炮", "衝浪"],
    type_finisher_atk:   ["攀瀑·極", "噴射拳·改"],
    type_finisher_spa:   ["極巨水炮", "深海漩渦"],
    type_coverage_atk:   ["冰凍牙", "泰山壓頂"],
    type_coverage_spa:   ["冰凍光束"],
    type_early_disrupt:  ["黑霧"],
    type_weather_disrupt:["冰雹前置"],
    weather_summon:      ["祈雨"],
  },
  "草": {
    type_basic_atk:      ["藤鞭"],
    type_basic_spa:      ["藤鞭"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["毒粉"],
    type_medium_atk:     ["飛葉快刀"],
    type_medium_spa:     ["魔法葉"],
    type_strong_atk:     ["種子炸彈", "木角"],
    type_strong_spa:     ["能量球", "打草結"],
    type_top_atk:        ["日光刃", "木槌"],
    type_top_spa:        ["飛葉風暴", "日光束"],
    type_finisher_atk:   ["木槌·大木", "輝煌綠葉"],
    type_finisher_spa:   ["萬葉裁決", "日光束·極"],
    type_coverage_atk:   ["地震"],
    type_coverage_spa:   ["覺醒力量"],
    type_early_disrupt:  ["麻痺粉"],
    type_weather_disrupt:["睡眠粉"],
    weather_summon:      ["大晴天"],
  },
  "電": {
    type_basic_atk:      ["電擊"],
    type_basic_spa:      ["電擊"],
    type_basic_buf:      ["搖尾巴"],
    type_basic_dis:      ["電磁波"],
    type_medium_atk:     ["雷電拳"],
    type_medium_spa:     ["電球"],
    type_strong_atk:     ["瘋狂伏特"],
    type_strong_spa:     ["十萬伏特", "放電"],
    type_top_atk:        ["閃電強襲"],
    type_top_spa:        ["打雷", "伏特交換"],
    type_finisher_atk:   ["電氣猛攻"],
    type_finisher_spa:   ["萬雷轟", "磁能炮"],
    type_coverage_atk:   ["雷電牙"],
    type_coverage_spa:   ["光澤電炮"],
    type_early_disrupt:  ["綁緊"],
    type_weather_disrupt:["怪異電波"],
    weather_summon:      ["打雷"],
  },
  "冰": {
    type_basic_atk:      ["冰礫"],
    type_basic_spa:      ["冰凍之風"],
    type_basic_buf:      ["變硬"],
    type_basic_dis:      ["瞪眼"],
    type_medium_atk:     ["冰凍拳"],
    type_medium_spa:     ["冰凍光束"],
    type_strong_atk:     ["冰錐"],
    type_strong_spa:     ["暴風雪"],
    type_top_atk:        ["冰柱墜擊"],
    type_top_spa:        ["暴風雪"],
    type_finisher_atk:   ["冰柱墜擊"],
    type_finisher_spa:   ["絕對零度", "極寒風暴"],
    type_coverage_atk:   ["冰凍牙"],
    type_coverage_spa:   ["冰凍光束"],
    type_early_disrupt:  ["冰凍之風"],
    type_weather_disrupt:["雪景"],
    weather_summon:      ["冰雹"],
  },
  "格鬥": {
    type_basic_atk:      ["碎岩"],
    type_basic_spa:      ["真氣彈"],
    type_basic_buf:      ["瞪眼"],
    type_basic_dis:      ["挑釁"],
    type_medium_atk:     ["空手劈"],
    type_medium_spa:     ["吸收拳"],
    type_strong_atk:     ["十字劈"],
    type_strong_spa:     ["波導彈"],
    type_top_atk:        ["近身戰"],
    type_top_spa:        ["真氣彈"],
    type_finisher_atk:   ["真·近身戰", "氣魄拳"],
    type_finisher_spa:   ["真波導彈"],
    type_coverage_atk:   ["子彈拳", "音速拳"],
    type_coverage_spa:   ["吸收拳"],
    type_early_disrupt:  ["挑釁"],
    type_weather_disrupt:["清除之煙"],
    weather_summon:      ["大晴天"],
  },
  "毒": {
    type_basic_atk:      ["毒針"],
    type_basic_spa:      ["溶解液"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["毒粉"],
    type_medium_atk:     ["毒擊"],
    type_medium_spa:     ["污泥炸彈"],
    type_strong_atk:     ["十字毒刃"],
    type_strong_spa:     ["污泥波"],
    type_top_atk:        ["垃圾射擊"],
    type_top_spa:        ["毒液衝擊"],
    type_finisher_atk:   ["毒垃圾雨"],
    type_finisher_spa:   ["劇毒擴散", "溶解泥彈"],
    type_coverage_atk:   ["毒突"],
    type_coverage_spa:   ["溶解液"],
    type_early_disrupt:  ["毒粉"],
    type_weather_disrupt:["清除之煙"],
    weather_summon:      ["黑霧"],
  },
  "地面": {
    type_basic_atk:      ["潑沙"],
    type_basic_spa:      ["泥巴射擊"],
    type_basic_buf:      ["瞪眼"],
    type_basic_dis:      ["玩沙"],
    type_medium_atk:     ["重踏"],
    type_medium_spa:     ["泥巴炸彈"],
    type_strong_atk:     ["挖洞"],
    type_strong_spa:     ["大地之力"],
    type_top_atk:        ["地震"],
    type_top_spa:        ["熱沙大地"],
    type_finisher_atk:   ["震滅", "地龍鑽"],
    type_finisher_spa:   ["蓋亞能量", "灼熱流沙"],
    type_coverage_atk:   ["直衝鑽"],
    type_coverage_spa:   ["泥巴炸彈"],
    type_early_disrupt:  ["玩沙"],
    type_weather_disrupt:["沙暴"],
    weather_summon:      ["沙暴"],
  },
  "飛行": {
    type_basic_atk:      ["啄"],
    type_basic_spa:      ["起風"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["瞪眼"],
    type_medium_atk:     ["翅膀攻擊"],
    type_medium_spa:     ["空氣之刃"],
    type_strong_atk:     ["燕返"],
    type_strong_spa:     ["空氣斬"],
    type_top_atk:        ["啄鑽"],
    type_top_spa:        ["熱風"],
    type_finisher_atk:   ["神鳥猛攻"],
    type_finisher_spa:   ["天翔風暴", "真空刃"],
    type_coverage_atk:   ["雜技"],
    type_coverage_spa:   ["熱風"],
    type_early_disrupt:  ["超音波"],
    type_weather_disrupt:["清除之煙"],
    weather_summon:      ["順風"],
  },
  "超能力": {
    type_basic_atk:      ["拍擊"],
    type_basic_spa:      ["念力"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["瞪眼"],
    type_medium_atk:     ["意念頭錘"],
    type_medium_spa:     ["幻象光線"],
    type_strong_atk:     ["精神利刃"],
    type_strong_spa:     ["精神強念"],
    type_top_atk:        ["意念頭錘"],
    type_top_spa:        ["預知未來"],
    type_finisher_atk:   ["意念爆破"],
    type_finisher_spa:   ["心靈風暴", "極限精神"],
    type_coverage_atk:   ["精神利刃"],
    type_coverage_spa:   ["幻象術"],
    type_early_disrupt:  ["奇異之光"],
    type_weather_disrupt:["反射壁"],
    weather_summon:      ["精神場地"],
  },
  "蟲": {
    type_basic_atk:      ["連斬"],
    type_basic_spa:      ["蟲咬"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["吐絲"],
    type_medium_atk:     ["蟲咬"],
    type_medium_spa:     ["信號光束"],
    type_strong_atk:     ["十字剪"],
    type_strong_spa:     ["蟲鳴"],
    type_top_atk:        ["急速折返"],
    type_top_spa:        ["蟲鳴"],
    type_finisher_atk:   ["巨角衝撞"],
    type_finisher_spa:   ["蟲群風暴", "顫音共鳴"],
    type_coverage_atk:   ["猛撲"],
    type_coverage_spa:   ["信號光束"],
    type_early_disrupt:  ["吐絲"],
    type_weather_disrupt:["黏黏網"],
    weather_summon:      ["蝶舞"],
  },
  "岩石": {
    type_basic_atk:      ["落石"],
    type_basic_spa:      ["原始之力"],
    type_basic_buf:      ["瞪眼"],
    type_basic_dis:      ["隱形岩"],
    type_medium_atk:     ["岩石封鎖"],
    type_medium_spa:     ["原始之力"],
    type_strong_atk:     ["岩崩"],
    type_strong_spa:     ["力量寶石"],
    type_top_atk:        ["尖石攻擊"],
    type_top_spa:        ["力量寶石"],
    type_finisher_atk:   ["尖石隕落", "雙刃撞擊"],
    type_finisher_spa:   ["隕石爆破", "原始能量"],
    type_coverage_atk:   ["岩石爆擊"],
    type_coverage_spa:   ["原始之力"],
    type_early_disrupt:  ["隱形岩"],
    type_weather_disrupt:["沙暴"],
    weather_summon:      ["沙暴"],
  },
  "幽靈": {
    type_basic_atk:      ["暗影拳"],
    type_basic_spa:      ["驚嚇"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["瞪眼"],
    type_medium_atk:     ["暗影爪"],
    type_medium_spa:     ["黑夜魔影"],
    type_strong_atk:     ["潛靈奇襲"],
    type_strong_spa:     ["暗影球"],
    type_top_atk:        ["暗影爪"],
    type_top_spa:        ["禍不單行"],
    type_finisher_atk:   ["暗影強襲"],
    type_finisher_spa:   ["深淵暗影", "魂火"],
    type_coverage_atk:   ["影子偷襲"],
    type_coverage_spa:   ["暗影球"],
    type_early_disrupt:  ["奇異之光"],
    type_weather_disrupt:["詛咒"],
    weather_summon:      ["黑夜魔影"],
  },
  "龍": {
    type_basic_atk:      ["龍爪"],
    type_basic_spa:      ["龍息"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["瞪眼"],
    type_medium_atk:     ["龍尾"],
    type_medium_spa:     ["龍之波動"],
    type_strong_atk:     ["龍之俯衝"],
    type_strong_spa:     ["巨聲"],
    type_top_atk:        ["逆鱗"],
    type_top_spa:        ["龍星群"],
    type_finisher_atk:   ["龍神爪", "龍神逆鱗"],
    type_finisher_spa:   ["龍星殞落", "時空崩壞"],
    type_coverage_atk:   ["龍尾"],
    type_coverage_spa:   ["龍之波動"],
    type_early_disrupt:  ["龍息"],
    type_weather_disrupt:["吼叫"],
    weather_summon:      ["龍舞"],
  },
  "惡": {
    type_basic_atk:      ["咬住"],
    type_basic_spa:      ["大聲咆哮"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["瞪眼"],
    type_medium_atk:     ["出奇一擊"],
    type_medium_spa:     ["惡之波動"],
    type_strong_atk:     ["暗襲要害"],
    type_strong_spa:     ["惡之波動"],
    type_top_atk:        ["咬碎"],
    type_top_spa:        ["惡之波動"],
    type_finisher_atk:   ["暗黑亂舞", "深淵突刺"],
    type_finisher_spa:   ["深淵波動", "絕望制裁"],
    type_coverage_atk:   ["突襲"],
    type_coverage_spa:   ["大聲咆哮"],
    type_early_disrupt:  ["挑釁"],
    type_weather_disrupt:["臨別禮物"],
    weather_summon:      ["黑霧"],
  },
  "鋼": {
    type_basic_atk:      ["金屬爪"],
    type_basic_spa:      ["加農光炮"],
    type_basic_buf:      ["瞪眼"],
    type_basic_dis:      ["金屬音"],
    type_medium_atk:     ["鐵頭"],
    type_medium_spa:     ["加農光炮"],
    type_strong_atk:     ["彗星拳"],
    type_strong_spa:     ["光澤電炮"],
    type_top_atk:        ["重磅衝撞"],
    type_top_spa:        ["光澤電炮"],
    type_finisher_atk:   ["流星拳", "鋼鐵重壓"],
    type_finisher_spa:   ["鋼鐵加農", "磁軌炮"],
    type_coverage_atk:   ["子彈拳"],
    type_coverage_spa:   ["加農光炮"],
    type_early_disrupt:  ["金屬音"],
    type_weather_disrupt:["電磁波"],
    weather_summon:      ["鐵壁"],
  },
  "妖精": {
    type_basic_atk:      ["拍擊"],
    type_basic_spa:      ["妖精之風"],
    type_basic_buf:      ["叫聲"],
    type_basic_dis:      ["瞪眼"],
    type_medium_atk:     ["吸取吻"],
    type_medium_spa:     ["魅惑之聲"],
    type_strong_atk:     ["嬉鬧"],
    type_strong_spa:     ["月亮之力"],
    type_top_atk:        ["泰山壓頂"],
    type_top_spa:        ["魔法閃耀"],
    type_finisher_atk:   ["妖精狂歡"],
    type_finisher_spa:   ["妖精爆裂", "月光爆破"],
    type_coverage_atk:   ["吸取吻"],
    type_coverage_spa:   ["魔法火焰"],
    type_early_disrupt:  ["天使之吻"],
    type_weather_disrupt:["薄霧場地"],
    weather_summon:      ["薄霧場地"],
  }
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

function generateSpeciesSkillTree(speciesName, types, tier) {
  var typeSpec = types && types[0] && TYPE_SPEC_V2[types[0]];
  if (!typeSpec) return generateSkillTree(speciesName, types, 80, 80);
  var dummyPkm = { species: speciesName, types: types, tier: tier || 3, personality: Math.random() };
  var variant = selectVariant(dummyPkm, types, typeSpec);
  if (!variant) return generateSkillTree(speciesName, types, 80, 80);
  var tree = buildTreeFromVariant(variant, types);
  var result = { types: types, stages: [0, 1, 2, 3, 4, 5], label: variant.label, trees: {} };
  Object.keys(tree).forEach(function(k) { result.trees[k] = buildNodesFromVariantTree(tree[k], k); });
  var ultNode = buildUltNodes(variant, types, tier || 3);
  if (ultNode) result.trees.ult = ultNode;
  return result;
}

// ========== 公開 API ==========

function getSkillTree(speciesName, types, atkStat, spaStat, pokemon) {
  // 新系統：如果傳入完整 pokemon 物件且該屬性有 TYPE_SPEC_V2 定義
  if (pokemon && pokemon.primaryType && TYPE_SPEC_V2[pokemon.primaryType]) {
    var vName = selectVariant(pokemon);
    if (vName) {
      var variantTree = buildTreeFromVariant(pokemon, pokemon.primaryType, vName);
      return {
        types: types || [pokemon.primaryType],
        variant: vName,
        trees: {
          atk: { label: "攻擊系", nodes: buildNodesFromVariantTree(variantTree, "ATK"), passives: [{ tier: 2, effect: "物理傷害 +3%" }, { tier: 4, effect: "會心率 +5%" }] },
          spa: { label: "特攻系", nodes: buildNodesFromVariantTree(variantTree, "SPA"), passives: [{ tier: 2, effect: "特攻 +3%" }, { tier: 4, effect: "屬性加成 +5%" }] },
          buf: { label: "強化系", nodes: buildNodesFromVariantTree(variantTree, "BUF"), passives: [{ tier: 2, effect: "回復量 +10%" }, { tier: 4, effect: "被提升效果 +5%" }] },
          dis: { label: "干擾系", nodes: buildNodesFromVariantTree(variantTree, "DIS"), passives: [{ tier: 2, effect: "狀態命中 +5%" }, { tier: 4, effect: "對手弱化 +5%" }] },
          ult: { label: "奧義系", nodes: buildUltNodes(variantTree, pokemon, types), passives: [{ tier: 3, effect: "奧義威力 +10%" }] }
        }
      };
    }
  }
  // 舊系統：手工設計優先，無則自動生成
  if (SPECIES_SKILL_TREE[speciesName]) {
    return JSON.parse(JSON.stringify(SPECIES_SKILL_TREE[speciesName]));
  }
  return generateSkillTree(speciesName, types || ["一般"], atkStat || 50, spaStat || 50);
}

function buildNodesFromVariantTree(variantTree, role) {
  var roleKey = role;
  var tierKeys = ["T1", "T2", "T3", "T4", "T5"];
  var nodes = [];
  var tierMap = { T1: 1, T2: 2, T3: 3, T4: 4, T5: 5 };
  var prevNames = [];
  for (var i = 0; i < tierKeys.length; i++) {
    var t = tierKeys[i];
    var move = variantTree[roleKey] ? variantTree[roleKey][t] : null;
    if (move) {
      var prereqs = prevNames.length > 0 ? [prevNames[prevNames.length - 1]] : [];
      nodes.push({ tier: tierMap[t], name: move, spCost: tierMap[t], prereqs: prereqs });
      prevNames = [move];
    }
  }
  return nodes;
}

function buildUltNodes(variantTree, pokemon, types) {
  var primaryType = (types && types[0]) || pokemon.primaryType || "一般";
  var spec = TYPE_SPEC_V2[primaryType];
  var variantName = pokemon && pokemon.baseName && spec
    ? selectVariant(pokemon) : null;
  var firstVariant = spec ? Object.keys(spec.VARIANTS)[0] : null;
  variantName = variantName || firstVariant || "物理強攻型";
  var ultVariant = selectUltVariant(pokemon, primaryType, variantName);
  var ULT_TIER_MOVES = {
    "一般": { T1: "撞擊", T2: "高速星星", T3: "巨聲", T4: "捨身衝撞" },
    "火":   { T1: "火花", T2: "噴射火焰", T3: "大字爆", T4: "熱風" },
    "水":   { T1: "水槍", T2: "水之波動", T3: "衝浪", T4: "水炮" },
    "草":   { T1: "藤鞭", T2: "魔法葉", T3: "能量球", T4: "飛葉風暴" },
    "電":   { T1: "電擊", T2: "十萬伏特", T3: "打雷", T4: "伏特交換" },
    "冰":   { T1: "冰凍之風", T2: "冰凍光束", T3: "暴風雪", T4: "冰柱墜擊" },
    "格鬥": { T1: "碎岩", T2: "空手劈", T3: "十字劈", T4: "近身戰" },
    "毒":   { T1: "溶解液", T2: "污泥炸彈", T3: "污泥波", T4: "毒液衝擊" },
    "地面": { T1: "潑沙", T2: "重踏", T3: "挖洞", T4: "地震" },
    "飛行": { T1: "啄", T2: "翅膀攻擊", T3: "燕返", T4: "勇鳥猛攻" },
    "超能力": { T1: "念力", T2: "幻象光線", T3: "精神強念", T4: "預知未來" },
    "蟲":   { T1: "連斬", T2: "蟲咬", T3: "十字剪", T4: "急速折返" },
    "岩石": { T1: "落石", T2: "岩石封鎖", T3: "岩崩", T4: "尖石攻擊" },
    "幽靈": { T1: "暗影拳", T2: "暗影爪", T3: "暗影球", T4: "禍不單行" },
    "龍":   { T1: "龍息", T2: "龍之波動", T3: "龍之俯衝", T4: "逆鱗" },
    "惡":   { T1: "咬住", T2: "出奇一擊", T3: "咬碎", T4: "暗襲要害" },
    "鋼":   { T1: "金屬爪", T2: "鐵頭", T3: "彗星拳", T4: "重磅衝撞" },
    "妖精": { T1: "妖精之風", T2: "魅惑之聲", T3: "月亮之力", T4: "魔法閃耀" }
  };
  var typeMoves = ULT_TIER_MOVES[primaryType] || ULT_TIER_MOVES["一般"];
  // MOVE_DATABASE 存在時才檢查「真實招式」，不存在時視為皆真實
  var hasDb = (typeof MOVE_DATABASE !== "undefined" && MOVE_DATABASE);
  function isRealMove(m) { return hasDb ? !!MOVE_DATABASE[m] : true; }
  // 收集四樹（ATK/SPA/BUF/DIS）已使用的招式，ULT 不得與之重複
  var usedMoves = {};
  if (variantTree) {
    var ultRoles = ["ATK", "SPA", "BUF", "DIS"];
    for (var uri = 0; uri < ultRoles.length; uri++) {
      var roleTree = variantTree[ultRoles[uri]];
      if (!roleTree) continue;
      for (var ut = 1; ut <= 5; ut++) {
        var usedMv = roleTree["T" + ut];
        if (usedMv) usedMoves[usedMv] = true;
      }
    }
  }
  // 建立同屬性替補池（真實招式），供 ULT 與四樹衝突或招式不存在時替換
  var typeBase = TYPE_BASED_MOVES[primaryType] || TYPE_BASED_MOVES["一般"];
  var altPool = (typeBase.atk || []).concat(typeBase.spa || []).filter(isRealMove);
  // 跨屬性替補池（真實傷害招），同屬性池用盡時使用
  var altPoolAny = [];
  if (hasDb) {
    for (var altKey in MOVE_DATABASE) {
      var altDef = MOVE_DATABASE[altKey];
      if (!altDef || altDef.category === "變化") continue;
      if (altDef.type === primaryType) {
        if (altPool.indexOf(altKey) === -1) altPool.push(altKey);
      } else {
        if (altPoolAny.indexOf(altKey) === -1) altPoolAny.push(altKey);
      }
    }
  }
  var nodes = [];
  var lastMove = null;
  var chosenUlt = {};
  function pickSub(notMove) {
    var pools = [altPool, altPoolAny];
    for (var pi = 0; pi < pools.length; pi++) {
      for (var si = 0; si < pools[pi].length; si++) {
        var cand = pools[pi][si];
        if (cand !== notMove && !usedMoves[cand] && !chosenUlt[cand]) return cand;
      }
    }
    return null;
  }
  for (var ui = 1; ui <= 4; ui++) {
    var tierKey = "T" + ui;
    var moveName = typeMoves[tierKey];
    // 偏好 ULT_TIER_MOVES；若與四樹重複或非真實招式則從替補池挑不重複的真實招
    if (moveName && (usedMoves[moveName] || !isRealMove(moveName))) {
      var sub = pickSub(null);
      if (sub) moveName = sub;
    }
    if (!moveName) continue;
    if (moveName === lastMove) {
      var altSub = pickSub(lastMove);
      if (altSub) moveName = altSub;
    }
    chosenUlt[moveName] = true;
    usedMoves[moveName] = true;
    var prereqs = lastMove ? [lastMove] : [];
    nodes.push({ tier: ui, name: moveName, spCost: ui, prereqs: prereqs });
    lastMove = moveName;
  }
  var t5Move = ultVariant.t5Name || "終極衝擊";
  nodes.push({ tier: 5, name: t5Move, spCost: 5, prereqs: [lastMove] });
  return nodes;
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

// ========== Phase 1: 核心選擇演算法 ==========

// 1.2 確定性隨機
function seededRandom(seed) {
  var t = seed | 0;
  return function() {
    t = (t + 0x6D2B79F5) | 0;
    var m = Math.imul(t ^ (t >>> 15), 1 | t);
    m = (m + Math.imul(m ^ (m >>> 7), 61 | m)) ^ m;
    return ((m ^ (m >>> 14)) >>> 0) / 4294967296;
  };
}

function selectFromPool(pool, seed) {
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  var rng = seededRandom(seed);
  return pool[Math.floor(rng() * pool.length)];
}

// 副屬性偏移表
var TYPE2_AFFINITY_MAP = {
  "格鬥": { physical: 20, melee: 20 },
  "幽靈": { disrupt: 20, special: 20 },
  "地面": { physical: 15, weather: 15 },
  "飛行": { speed: 20, weather: 20 },
  "鋼":   { defense: 20, bullet: 20 },
  "水":   { defense: 15, recovery: 15 },
  "火":   { offense: 15, weather: 15 },
  "草":   { recovery: 20, consume: 20 },
  "電":   { speed: 20, disrupt: 20 },
  "超能力": { special: 20, field: 20 },
  "冰":   { special: 20, weather: 20 },
  "蟲":   { combo: 15, boost: 15 },
  "岩石": { defense: 15, sandstorm: 15 },
  "惡":   { priority: 20, disrupt: 20 },
  "妖精": { defense: 15, disrupt: 15 },
  "龍":   { offense: 20, dance: 20 },
  "毒":   { consume: 15, disrupt: 15 },
  "一般": { balanced: 0 }
};

function getType2Affinity(type2, variant) {
  if (!type2 || !TYPE2_AFFINITY_MAP[type2]) return 0;
  var affinity = TYPE2_AFFINITY_MAP[type2];
  var vname = variant.theme || "";
  for (var key in affinity) {
    if (vname.indexOf(key) >= 0 || variant.tags && variant.tags.indexOf(key) >= 0) {
      return affinity[key];
    }
  }
  return 0;
}

function hasWeatherAbility(ability) {
  if (!ability) return false;
  var weatherAbilities = ["乾旱", "揚沙", "降雨", "降雪", "始源之海", "終結之地"];
  return weatherAbilities.indexOf(ability) >= 0;
}

// 1.1 變體選擇演算法
function selectVariant(pokemon) {
  var type = pokemon.primaryType;
  var typeSpec = TYPE_SPEC_V2[type];
  if (!typeSpec) return null;
  var variants = typeSpec.VARIANTS;
  var stats = pokemon.stats || { atk: 50, spa: 50, spd: 50, def: 50, spDef: 50 };
  if (stats.spa === undefined && stats.spatk !== undefined) {
    stats = { hp: stats.hp, atk: stats.atk, def: stats.def, spa: stats.spatk, spd: stats.speed, spDef: stats.spdef };
  }
  var scores = {};
  var idx = 0;
  for (var name in variants) {
    if (variants.hasOwnProperty(name)) {
      var variant = variants[name];
      var score = 0;
      score += (stats.atk / 255) * (variant.preferredStats.ATK || 1.0) * 40;
      score += (stats.spa / 255) * (variant.preferredStats.SPA || 1.0) * 40;
      score += (stats.spd / 255) * (variant.preferredStats.SPD || 1.0) * 20;
      score += ((stats.def + stats.spDef) / 510) * (variant.preferredStats.DEF || 1.0) * 20;
      score += getType2Affinity(pokemon.type2, variant);
      if (pokemon.ability && hasWeatherAbility(pokemon.ability) && variant.tags && variant.tags.indexOf("weather") >= 0) score += 30;
      var seed = (pokemon.personality || 0) * 100 + idx;
      var noise = (seededRandom(seed)() * 6) - 3;
      scores[name] = score + noise;
      idx++;
    }
  }
  var best = null, bestScore = -Infinity;
  for (var n in scores) {
    if (scores[n] > bestScore) { bestScore = scores[n]; best = n; }
  }
  return best;
}

// 1.3 招式樹生成
function buildTreeFromVariant(pokemon, type, variantName) {
  var variant = TYPE_SPEC_V2[type].VARIANTS[variantName];
  var tiers = variant.tiers;
  var tree = {};
  var roles = ["ATK", "SPA", "BUF", "DIS"];
  var fallbackSeed = (pokemon.id || 0) * 100000 + (pokemon.personality || 0) * 1000 + 9999;
  for (var ri = 0; ri < roles.length; ri++) {
    var role = roles[ri];
    tree[role] = {};
    var tierLabels = ["T1", "T2", "T3", "T4", "T5"];
    for (var ti = 0; ti < tierLabels.length; ti++) {
      var t = tierLabels[ti];
      var pool = tiers[t][role];
      if (pool.length === 0) {
        tree[role][t] = null;
      } else if (pool.length === 1) {
        tree[role][t] = pool[0];
      } else {
        var seed = (pokemon.id || 0) * 100000 + (pokemon.personality || 0) * 1000 + ti * 10 + ri;
        tree[role][t] = selectFromPool(pool, seed);
      }
    }
  }
  var T5_FALLBACK = { ATK: ["終極衝擊"], SPA: ["破壞光線"], BUF: ["睡覺", "腹鼓"], DIS: ["滅亡之歌"] };
  for (ri = 0; ri < roles.length; ri++) {
    role = roles[ri];
    if (!tree[role].T5) {
      tree[role].T5 = resolveT5ForTree(type, role, tree[role], fallbackSeed + ri, T5_FALLBACK);
    }
  }
  return tree;
}

function resolveT5ForTree(type, role, roleTree, seed, fallback) {
  var used = [];
  for (var t = 1; t <= 4; t++) {
    var mv = roleTree["T" + t];
    if (mv) used.push(mv);
  }
  var sig = TYPE_T5_SIGNATURES[type] ? TYPE_T5_SIGNATURES[type][role] : null;
  if (sig) {
    for (var si = 0; si < sig.length; si++) {
      if (used.indexOf(sig[si]) === -1) return sig[si];
    }
  }
  var fb = (fallback && fallback[role]) || [];
  for (var fj = 0; fj < fb.length; fj++) {
    if (used.indexOf(fb[fj]) === -1) return fb[fj];
  }
  return fb[0] || (sig && sig[0]) || null;
}

// 1.5 T5 招式解析
function resolveT5Move(type, role, variant, pokemon) {
  var sig = TYPE_T5_SIGNATURES[type];
  var signature = sig ? sig[role] : null;
  if (signature && signature.length > 0) {
    if (signature.length === 1) return signature[0];
    return selectByVariantAffinity(signature, variant);
  }
  var subType = pokemon && pokemon.type2;
  if (subType && TYPE_T5_SIGNATURES[subType]) {
    var subSig = TYPE_T5_SIGNATURES[subType][role];
    if (subSig && subSig.length > 0) return subSig[0];
  }
  var FALLBACK = { ATK: ["終極衝擊"], SPA: ["破壞光線"], BUF: ["睡覺", "腹鼓"], DIS: ["滅亡之歌"] };
  return selectFromPool(FALLBACK[role], 0);
}

function selectByVariantAffinity(signature, variant) {
  if (!signature || signature.length === 0) return null;
  if (signature.length === 1) return signature[0];
  if (!variant) return signature[0];
  var seed = 0;
  if (variant.preferredStats) {
    seed = Math.round((variant.preferredStats.ATK || 1.0) * 100) ^
           Math.round((variant.preferredStats.SPA || 1.0) * 97) ^
           Math.round((variant.preferredStats.SPD || 1.0) * 53);
  } else {
    seed = (variant.ultMapping || "C").charCodeAt(0);
  }
  var idx = Math.abs(seed) % signature.length;
  return signature[idx];
}

// 1.4 ULT 變體選擇
function selectUltVariant(pokemon, type, variantName) {
  var variant = TYPE_SPEC_V2[type].VARIANTS[variantName];
  if (variant.ultMapping) {
    var ultIndex = variant.ultMapping;
    var ultVariants = {
      "A": { label: "制裁", suffix: "制裁" },
      "B": { label: "終結", suffix: "終結" },
      "C": { label: "極致", suffix: "極致" },
      "D": { label: "裁決", suffix: "裁決" },
      "E": { label: "傳說", suffix: "神聖" }
    };
    var uv = ultVariants[ultIndex] || ultVariants["C"];
    var typeLabel = type;
    var speciesLabel = pokemon && pokemon.baseName ? "·" + pokemon.baseName : "";
    return {
      index: ultIndex,
      label: uv.label,
      t5Name: typeLabel + "系" + speciesLabel + uv.suffix
    };
  }
  return { index: "C", label: "極致", t5Name: "極致衝擊" };
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
window.TIER_SP_COST = TIER_SP_COST;
window.TIER_SP_THRESHOLD = TIER_SP_THRESHOLD;
window.TIER_FP_COST = TIER_FP_COST;
window.BUF_FP_COST = BUF_FP_COST;
window.DIS_FP_COST = DIS_FP_COST;
window.ULT_FP_COST = ULT_FP_COST;
// v3.1 SP 經濟常數（Step 1.1）
window.TIER_SP_COST_V31 = TIER_SP_COST_V31;
window.TIER_SP_THRESHOLD_V31 = TIER_SP_THRESHOLD_V31;
window.MAX_MOVE_LEVEL_V31 = MAX_MOVE_LEVEL_V31;
window.MODIFIER_SP_COST = MODIFIER_SP_COST;
window.SECOND_PICK_MULT = SECOND_PICK_MULT;
window.MAX_TOTAL_SP_V31 = MAX_TOTAL_SP_V31;
// Phase 0 exports
window.TYPE_SPEC_V2 = TYPE_SPEC_V2;
window.TYPE_T5_SIGNATURES = TYPE_T5_SIGNATURES;
window.ARCHETYPE_TEMPLATES = ARCHETYPE_TEMPLATES;
window.TYPE_MOVE_LIBRARY = TYPE_MOVE_LIBRARY;
// Phase 1 exports
window.selectVariant = selectVariant;
window.buildTreeFromVariant = buildTreeFromVariant;
window.resolveT5Move = resolveT5Move;
window.selectUltVariant = selectUltVariant;
window.seededRandom = seededRandom;

})();
