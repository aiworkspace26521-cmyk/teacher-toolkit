// Phase 0 — TYPE_SPEC_V2 for properties 10–18
// Extracted from 招式培養系統-完整實作規格書-v3.0.md §2.3

const TYPE_SPEC_V2_PHASE0 = {
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
          T1: { ATK: ["念力"], SPA: ["念力"], BUF: ["叫聲"], DIS: ["瞪眼"] },
          T2: { ATK: ["意念頭錘"], SPA: ["幻象光線"], BUF: ["劍舞"], DIS: [] },
          T3: { ATK: ["精神利刃"], SPA: ["精神強念"], BUF: ["替身"], DIS: ["奇異之光"] },
          T4: { ATK: ["意念頭錘"], SPA: ["預知未來"], BUF: ["守住"], DIS: ["吼叫"] },
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
          T1: { ATK: [], SPA: ["蟲咬"], BUF: ["叫聲"], DIS: ["吐絲"] },
          T2: { ATK: ["蟲咬"], SPA: ["信號光束"], BUF: ["蝶舞"], DIS: ["麻痺粉"] },
          T3: { ATK: ["猛撲"], SPA: ["蟲鳴"], BUF: ["替身"], DIS: ["睡眠粉"] },
          T4: { ATK: [], SPA: ["蟲鳴"], BUF: ["守住"], DIS: ["毒粉"] },
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
          T4: { ATK: [], SPA: ["蟲鳴"], BUF: ["守住"], DIS: ["清除之煙"] },
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
          T4: { ATK: ["暗影爪"], SPA: ["禍不單行"], BUF: ["替身"], DIS: ["詛咒"] },
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
          T3: { ATK: [], SPA: ["暗影球"], BUF: ["替身"], DIS: ["禍不單行"] },
          T4: { ATK: ["潛靈奇襲"], SPA: ["暗影球"], BUF: ["守住"], DIS: ["清除之煙"] },
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
          T4: { ATK: ["暗影爪"], SPA: ["禍不單行"], BUF: ["替身"], DIS: ["吹飛"] },
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
          T4: { ATK: ["暗影爪"], SPA: ["禍不單行"], BUF: ["守住"], DIS: ["清除之煙"] },
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
          T3: { ATK: ["暗襲要害"], SPA: ["惡之波動"], BUF: ["替身"], DIS: ["臨別禮物"] },
          T4: { ATK: [], SPA: ["惡之波動"], BUF: ["守住"], DIS: ["吼叫"] },
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
          T3: { ATK: [], SPA: ["惡之波動"], BUF: ["替身"], DIS: ["臨別禮物"] },
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
          T3: { ATK: ["暗襲要害"], SPA: ["惡之波動"], BUF: ["詭計"], DIS: [] },
          T4: { ATK: ["咬碎"], SPA: ["惡之波動"], BUF: ["替身"], DIS: ["吼叫"] },
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

module.exports = TYPE_SPEC_V2_PHASE0;
