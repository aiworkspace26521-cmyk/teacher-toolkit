const TYPE_SPEC_V2 = {
  "一般": {
    theme: "萬能中庸，招式樸素直接",
    VARIANTS: {
      "物理強攻型": {
        theme: "高物攻、壓制",
        preferredStats: { ATK: 1.3, SPA: 0.7, SPD: 0.9, DEF: 0.9 },
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
        preferredStats: { ATK: 0.7, SPA: 1.3, SPD: 1.0, DEF: 0.8 },
        ultMapping: "B",
        tiers: {
          T1: { ATK: [], SPA: ["覺醒力量"], BUF: ["搖尾巴"], DIS: ["叫聲"] },
          T2: { ATK: ["泰山壓頂"], SPA: ["高速星星"], BUF: ["高速移動"], DIS: [] },
          T3: { ATK: [], SPA: ["巨聲"], BUF: ["冥想"], DIS: ["清除之煙"] },
          T4: { ATK: ["大爆炸"], SPA: ["巨聲"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: ["破壞光線"], BUF: ["睡覺"], DIS: [] }
        }
      },
      "速攻擾亂型": {
        theme: "先制、速度壓制",
        preferredStats: { ATK: 1.0, SPA: 0.9, SPD: 1.3, DEF: 0.7 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["撞擊"], SPA: [], BUF: ["搖尾巴"], DIS: ["瞪眼"] },
          T2: { ATK: ["泰山壓頂"], SPA: [], BUF: ["高速移動"], DIS: ["叫聲"] },
          T3: { ATK: ["劈開"], SPA: [], BUF: ["替身"], DIS: ["清除之煙"] },
          T4: { ATK: ["捨身衝撞"], SPA: [], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["睡覺"], DIS: [] }
        }
      },
      "防禦回復型": {
        theme: "坦克、續航",
        preferredStats: { ATK: 0.8, SPA: 0.7, SPD: 0.7, DEF: 1.3 },
        ultMapping: "D",
        tiers: {
          T1: { ATK: [], SPA: [], BUF: ["變硬"], DIS: ["叫聲"] },
          T2: { ATK: ["泰山壓頂"], SPA: ["覺醒力量"], BUF: ["鐵壁"], DIS: [] },
          T3: { ATK: [], SPA: ["高速星星"], BUF: ["瞬間失憶"], DIS: ["劇毒"] },
          T4: { ATK: ["捨身衝撞"], SPA: ["巨聲"], BUF: ["守住"], DIS: ["吼叫"] },
          T5: { ATK: [], SPA: [], BUF: ["睡覺"], DIS: ["滅亡之歌"] }
        }
      },
      "雙刀均衡型": {
        theme: "靈活、適應",
        preferredStats: { ATK: 1.1, SPA: 1.1, SPD: 0.9, DEF: 0.8 },
        ultMapping: "C",
        tiers: {
          T1: { ATK: ["撞擊"], SPA: ["覺醒力量"], BUF: ["搖尾巴"], DIS: ["瞪眼"] },
          T2: { ATK: ["泰山壓頂"], SPA: ["高速星星"], BUF: ["影子分身"], DIS: [] },
          T3: { ATK: ["劈開"], SPA: [], BUF: ["劍舞"], DIS: ["清除之煙"] },
          T4: { ATK: ["捨身衝撞"], SPA: ["巨聲"], BUF: ["替身"], DIS: ["吼叫"] },
          T5: { ATK: ["終極衝擊"], SPA: [], BUF: ["腹鼓"], DIS: [] }
        }
      }
    }
  }
};
