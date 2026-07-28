/**
 * Regenerate section 3i of the Pokémon skill tree analysis report.
 * Fixes BUF/DIS all-in-T1, empty ATK/SPA tiers, wrong ULT T2.
 */
const fs = require("fs");
const path = require("path");

// ========== CONFIG ==========
const REPORT_PATH = "D:\\20260521opencode\\teacher-toolkit-analysis\\pokemon-skill-tree-analysis-report.txt";

// ========== MOVE POWERS extracted from MOVE_DATABASE + extensions ==========
const MOVE_POWER = {
  // 一般
  "撞擊":40,"抓":40,"電光一閃":40,"摔打":80,"劈開":70,"終極衝擊":150,
  "高速星星":60,"巨聲":90,"破壞光線":150,"大爆炸":250,
  // 火
  "火花":40,"火焰拳":75,"火焰踢":85,"閃焰衝鋒":120,
  "噴射火焰":90,"大字爆":110,"過熱":130,"熱風":95,"魔法火焰":70,
  "爆炸烈焰":40,"V熱焰":150,"燃燼衝鋒":40,"煙幕":0,"火焰旋渦":40,
  "鬼火":0,"大晴天":0,"焚焰放射":40,"滅世爆焰":40,"火焰球":120,
  "火焰牙":65,"交錯火焰":100,"神聖之火":100,"火焰踢":85,
  // 水
  "水槍":40,"攀瀑":80,"水之尾":90,"噴射拳":40,"潛水":80,
  "水之波動":60,"衝浪":90,"水炮":110,"熱水":80,"濁流":90,
  "根源波動":110,"泡沫":40,"泡沫光線":65,"鹽水":65,"貝殼刃":75,
  "縮入殼中":0,
  // 草
  "藤鞭":45,"飛葉快刀":55,"種子炸彈":80,"木角":75,"日光刃":125,
  "能量球":90,"日光束":120,"飛葉風暴":110,"打草結":60,
  "催眠粉":0,"毒粉":0,"光合作用":0,"魔法葉":60,"寄生種子":0,
  "生長":0,"木槌":120,"鼓擊":80,"飛葉風暴":110,
  // 電
  "電擊":40,"雷電拳":75,"瘋狂伏特":90,"閃電強襲":100,
  "電球":60,"十萬伏特":90,"打雷":110,"放電":80,"伏特交換":70,"光澤電炮":80,
  "轟雷":40,"萬雷轟":40,"電磁波":0,"電網":55,
  // 冰
  "冰礫":40,"冰凍拳":75,"冰凍牙":65,"冰柱針":25,"冰錐":25,
  "冰凍光束":90,"暴風雪":110,"冰凍之風":55,
  "冰柱墜擊":85,"三旋擊":20,
  // 格鬥
  "碎岩":40,"空手劈":50,"音速拳":40,"子彈拳":40,"近身戰":120,"吸取拳":75,"十字劈":100,
  "真氣彈":120,"波導彈":80,"吸收拳":75,
  "地球上投":80,"飛膝踢":120,"地獄翻滾":80,"絕處逢生":200,
  // 毒
  "毒針":15,"毒擊":80,"十字毒刃":70,"毒突":80,"垃圾射擊":120,
  "溶解液":40,"污泥炸彈":90,"污泥波":95,"清除之煙":50,
  // 地面
  "潑沙":0,"泥巴射擊":55,"重踏":60,"地震":100,"直衝鑽":80,"挖洞":80,
  "大地之力":90,"泥巴炸彈":40,
  "斷崖之劍":120,"十萬馬力":95,"擲泥":20,
  // 飛行
  "翅膀攻擊":60,"啄鑽":80,"勇鳥猛攻":120,"飛天":90,"急轉彎":60,
  "起風":40,"暴風":110,
  "神鳥猛擊":140,"空氣斬":75,"鑽啄":80,
  // 超能力
  "意念頭錘":80,"精神利刃":40,"拍擊":40,
  "念力":50,"幻象光線":65,"精神強念":90,"幻象術":80,"預知未來":120,"精神衝擊":80,
  "精神擊破":100,"亞空裂斬":100,"高速移動":0,"冥想":0,"幻象術":40,
  "瞬間失憶":0,"充電光束":40,"戲法空間":0,"特性交換":0,"自我再生":0,"重力":0,
  "光澤電炮":40,"輔助力量":80,
  // 蟲
  "蟲咬":60,"十字剪":80,"急速折返":70,"超級角擊":120,"飛彈針":40,"連斬":40,
  "蟲鳴":90,"信號光束":75,
  "猛撲":80,"蟲之抵抗":50,
  // 岩石
  "落石":50,"岩崩":75,"岩石封鎖":60,"尖石攻擊":100,"雙刃頭錘":120,"岩石炮":150,"岩石爆擊":25,
  "力量寶石":80,
  // 幽靈
  "舌舔":30,"暗影爪":70,"影子偷襲":40,"暗影偷襲":40,"地獄突刺":80,
  "暗影球":80,"禍不單行":65,
  "噬影球":40,"奇異之光":0,"驚嚇":30,"黑夜魔影":60,
  "潛靈奇襲":90,"縫影":80,
  // 龍
  "龍爪":80,"逆鱗":120,"龍尾":60,"龍息":60,
  "龍之波動":85,"龍星群":120,"時間咆哮":150,
  "龍之怒":40,"龍捲風":40,
  // 惡
  "暗襲要害":70,"咬碎":80,"突襲":70,"欺詐":95,"狂舞揮打":60,
  "惡之波動":80,"拋下狠話":55,"懲罰":60,
  "咬住":60,"地獄突刺":40,
  // 鋼
  "金屬爪":50,"鐵頭":80,"鐵尾":100,"重磅衝撞":120,"子彈拳":40,
  "加農光炮":80,"鐵蹄光線":140,
  "流星閃衝":100,"陀螺球":80,
  // 妖精
  "妖精之風":40,"嬉鬧":90,"吸收之吻":50,
  "魔法閃耀":80,"月亮之力":95,
  "魅惑之聲":40,"撒嬌":0,"薄霧場地":0,"薄霧炸裂":100,
  // Universal / Status
  "叫聲":0,"瞪眼":0,"搖尾巴":0,"變硬":0,"影子分身":0,"替身":0,"守住":0,"睡覺":0,
  "覺醒力量":60,"百萬噸重拳":80,"泰山壓頂":85,"捨身衝撞":120,"絕對零度":40,"玉石俱碎":200,
  "腹鼓":0,"劍舞":0,"龍之舞":0,"吹飛":0,"滅亡之歌":0,"劇毒":0,"怪異之光":0,
  "電磁波":0,"鬼火":0,"煙幕":0,"潑沙":0,"麻痺粉":0,"清除之煙":50,
  // Signature moves
  "制裁光礫":100,"巨獸斬":100,"巨獸彈":100,"等離子拳":100,"極巨炮":120,
  "暗影強襲":100,"冰封世界":65,"幾何雪花":100,"死亡之翼":100,"氣旋攻擊":100,
  "神鳥猛擊":140,"神聖之火":100,"根源波動":110,"斷崖之劍":120,
  "交錯火焰":100,"交錯閃電":100,"亞空裂斬":100,"時光咆哮":150,
  // Extra gen2-9 moves
  "龍之波動":85,"大地之力":90,"能量球":90,"暗影球":80,
  "惡意追擊":60,"狂舞揮打":60,"洩憤":75,"鱗射":25,"龍錘":90,
  "雙刃頭錘":150,"鐵滾輪":130,"撲擊":80,"靈魂衝擊":120,
  "滄海鳴奏":100,"大地恩惠":100,
};

function getMovePower(name) {
  return MOVE_POWER[name] !== undefined ? MOVE_POWER[name] : 40;
}

function getTier(power) {
  if (power > 120) return 5;
  if (power > 90) return 4;
  if (power > 65) return 3;
  if (power > 40) return 2;
  return 1;
}

// ========== TYPE_BASED_MOVES ==========
const TYPE_BASED_MOVES = {
  "一般": { atk: ["撞擊","抓","電光一閃","摔打","劈開","終極衝擊"], spa: ["高速星星","巨聲","破壞光線"] },
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

// ========== FIXED BUF/DIS tier distributions ==========
const BUF_TIERS = {
  1: ["變硬","叫聲","瞪眼","搖尾巴"],
  2: ["影子分身","高速移動"],
  3: ["劍舞","冥想","瞬間失憶","生長"],
  4: ["替身","守住","睡覺"],
  5: ["腹鼓"]
};

const DIS_TIERS = {
  1: ["煙幕","潑沙","叫聲"],
  2: ["電磁波","鬼火","毒粉"],
  3: ["劇毒","怪異之光","催眠粉"],
  4: ["吹飛","麻痺粉","清除之煙"],
  5: ["滅亡之歌"]
};

// ========== FILLER MOVES for empty ATK/SPA tiers ==========
const ATK_FILLER = {
  1: ["拍擊","電光一閃"],
  2: ["高速星星","覺醒力量"],
  3: ["劈開","摔打","百萬噸重拳"],
  4: ["泰山壓頂","捨身衝撞"],
  5: ["終極衝擊","大爆炸"]
};

const SPA_FILLER = {
  1: ["拍擊","電光一閃"],
  2: ["高速星星","覺醒力量"],
  3: ["劈開","摔打","百萬噸重拳"],
  4: ["泰山壓頂","捨身衝撞"],
  5: ["終極衝擊","大爆炸"]
};

// ========== ULT_MOVE_RENAME ==========
const ULT_MOVE_RENAME = {
  "噴射火焰": "焚焰放射",
  "大字爆": "滅世爆焰",
  "暗影球": "噬影球",
  "地震": "震滅",
  "十萬伏特": "轟雷",
  "打雷": "萬雷轟"
};

// ========== SIGNATURE_MOVES ==========
const SIGNATURE_MOVES = {
  "阿爾宙斯":"制裁光礫","火焰鳥":"神鳥猛擊","烈空坐":"畫龍點睛",
  "洛奇亞":"氣旋攻擊","鳳王":"神聖之火","帝牙盧卡":"時光咆哮",
  "超夢":"精神擊破","雷公":"打雷","炎帝":"噴射火焰",
  "水君":"熱水","蓋歐卡":"根源波動","固拉多":"斷崖之劍",
  "帕路奇亞":"亞空裂斬","騎拉帝納":"暗影強襲","萊希拉姆":"交錯火焰",
  "捷克羅姆":"交錯閃電","酋雷姆":"冰封世界","哲爾尼亞斯":"幾何雪花",
  "伊裴爾塔爾":"死亡之翼","捷拉奧拉":"等離子拳","蒼響":"巨獸斬",
  "藏瑪然特":"巨獸彈","無極汰那":"極巨炮"
};

// ========== HAND-CRAFTED TREES ==========
const HAND_CRAFTED = {
  "噴火龍": {
    atk: "T1抓/叫聲/瞪眼 T2翅膀攻擊/龍息 T3劈開/龍爪 T4勇鳥猛攻 T5V熱焰",
    spa: "T1火花/煙幕 T2火焰旋渦/鬼火 T3噴射火焰/熱風 T4大字爆/過熱 T5爆炸烈焰",
    buf: "T1變硬/叫聲 T2影子分身/高速移動 T3劍舞/龍之舞 T4守住/大晴天 T5腹鼓",
    dis: "T1煙幕/瞪眼 T2鬼火/火焰旋渦 T3怪異之光/熱風 T4劇毒/吹飛 T5滅亡之歌",
    ult: "T1高速星星 T2劈開 T3焚焰放射 T4滅世爆焰 T5燃燼衝鋒"
  },
  "超夢": {
    atk: "T1拍擊/瞪眼 T2影子偷襲/意念頭錘 T3地震/咬碎 T4近身戰 T5蠻力",
    spa: "T1念力/幻象光線 T2暗影球/十萬伏特 T3幻象術/冰凍光束 T4精神衝擊/打雷 T5亞空裂斬",
    buf: "T1搖尾巴/變硬 T2瞬間失憶/充電光束 T3冥想/自我再生 T4替身/守住 T5精神場地",
    dis: "T1念力/瞪眼 T2充電光束/電磁波 T3怪異之光/劇毒 T4戲法空間/特性交換 T5重力",
    ult: "T1高速星星 T2覺醒力量 T3噬影球 T4波導彈 T5精神擊破"
  },
  "皮卡丘": {
    atk: "T1抓/叫聲/搖尾巴 T2電光一閃/影子偷襲 T3鐵尾/劈開 T4雷電拳",
    spa: "T1電擊/叫聲 T2電球/電磁波 T3十萬伏特/放電 T4打雷/伏特交換 T5電磁炮",
    buf: "T1搖尾巴/叫聲 T2高速移動/影子分身 T3充電/替身 T4守住",
    dis: "T1叫聲/搖尾巴 T2電磁波/影子分身 T3怪異之光 T4劇毒",
    ult: "T1高速星星 T2電球 T3轟雷 T4萬雷轟 T5千萬伏特"
  }
};

// ========== HELPERS ==========

function buildAtkSpaTree(pool, fillerMap) {
  // Assign type moves to tiers by power
  const tiers = {1:[],2:[],3:[],4:[],5:[]};
  for (const m of pool) {
    const pwr = getMovePower(m);
    const t = getTier(pwr);
    tiers[t].push(m);
  }
  // Fill empty tiers with filler
  for (let t = 1; t <= 5; t++) {
    if (tiers[t].length === 0) {
      tiers[t] = [...fillerMap[t]];
    }
  }
  // Format: T1move1/move2 T2move1 T3move1/move2 ...
  const parts = [];
  for (let t = 1; t <= 5; t++) {
    let moves = tiers[t];
    if (moves.length === 0) continue;
    parts.push(`T${t}${moves.join("/")}`);
  }
  return parts.join(" ");
}

function buildBufTree() {
  const parts = [];
  for (let t = 1; t <= 5; t++) {
    const moves = BUF_TIERS[t];
    if (!moves || moves.length === 0) continue;
    parts.push(`T${t}${moves.join("/")}`);
  }
  return parts.join(" ");
}

function buildDisTree() {
  const parts = [];
  for (let t = 1; t <= 5; t++) {
    const moves = DIS_TIERS[t];
    if (!moves || moves.length === 0) continue;
    parts.push(`T${t}${moves.join("/")}`);
  }
  return parts.join(" ");
}

function buildUltTree(atkPool, spaPool, speciesName) {
  // T1: 高速星星, T2: 摔打 (prereq: 高速星星)
  // T3: ULT_MOVE_RENAME[lastAtkMove] || "泰山壓頂" (prereq: 摔打)
  // T4: ULT_MOVE_RENAME[lastSpaMove] || "地球上投" (prereq: T3)
  // T5: SIGNATURE_MOVES[speciesName] || "終極衝擊" (prereq: T4)

  const t1 = "高速星星";
  const t2 = "摔打";
  
  const lastAtkMove = atkPool.length > 0 ? atkPool[atkPool.length - 1] : null;
  const lastSpaMove = spaPool.length > 0 ? spaPool[spaPool.length - 1] : null;
  
  let t3 = lastAtkMove ? (ULT_MOVE_RENAME[lastAtkMove] || lastAtkMove) : "泰山壓頂";
  // Only use rename, otherwise fall back to 泰山壓頂
  if (lastAtkMove && ULT_MOVE_RENAME[lastAtkMove]) {
    t3 = ULT_MOVE_RENAME[lastAtkMove];
  } else {
    t3 = "泰山壓頂";
  }
  
  let t4 = lastSpaMove ? (ULT_MOVE_RENAME[lastSpaMove] || "地球上投") : "地球上投";
  if (lastSpaMove && ULT_MOVE_RENAME[lastSpaMove]) {
    t4 = ULT_MOVE_RENAME[lastSpaMove];
  } else {
    t4 = "地球上投";
  }
  
  // Special case: if the move name happens to be in the rename map through the atk/spa pool itself
  // (not through lastAtkMove/lastSpaMove matching), use direct rule
  // Actually per Fix 4: use ULT_MOVE_RENAME[lastAtkMove] || "泰山壓頂"
  // Let me re-read: "T3: ULT_MOVE_RENAME[lastAtkMove] || "泰山壓頂" (prereq: 摔打)"
  // So t3 = ULT_MOVE_RENAME[lastAtkMove] if lastAtkMove is in the map, else "泰山壓頂"
  // Same for t4
  
  // Wait, I need to reconsider. The ULT_MOVE_RENAME maps specific moves to renamed versions.
  // If lastAtkMove is one of those mapped moves, use the rename. Otherwise use "泰山壓頂".
  // Let me redo this:
  
  const rawT3 = lastAtkMove && ULT_MOVE_RENAME[lastAtkMove] ? ULT_MOVE_RENAME[lastAtkMove] : "泰山壓頂";
  const rawT4 = lastSpaMove && ULT_MOVE_RENAME[lastSpaMove] ? ULT_MOVE_RENAME[lastSpaMove] : "地球上投";
  
  t3 = rawT3;
  t4 = rawT4;
  
  const t5 = SIGNATURE_MOVES[speciesName] || "終極衝擊";
  
  return `T1${t1} T2${t2} T3${t3} T4${t4} T5${t5}`;
}

// ========== MAIN ==========

function main() {
  const content = fs.readFileSync(REPORT_PATH, "utf8");
  const lines = content.split("\n");

  // Find 3i section boundaries
  let startIdx = -1;
  let endIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("▸ 3i.")) {
      startIdx = i;
    }
    if (startIdx >= 0 && lines[i].includes("【第四部分】")) {
      // Walk backwards to find a box/divider line to include
      let divider = i - 1;
      while (divider >= 0 && lines[divider].trim() === "") divider--;
      if (divider >= 0 && lines[divider].includes("■")) {
        endIdx = divider; // include the box divider line
      } else {
        endIdx = i;
      }
      break;
    }
  }

  if (startIdx === -1 || endIdx === -1) {
    console.error("ERROR: Could not find section 3i boundaries");
    process.exit(1);
  }

  // Parse species from existing 3i content (lines after startIdx until endIdx)
  const speciesList = [];
  for (let i = startIdx; i < endIdx; i++) {
    const m = lines[i].match(/^###\s+(.+?)\s*\((.+?)\)/);
    if (m) {
      speciesList.push({
        name: m[1].trim(),
        typeStr: m[2].trim(),
        types: m[2].split("/").map(s => s.trim())
      });
    }
  }

  console.log(`Found ${speciesList.length} species in section 3i`);

  // Generate new 3i content
  const newLines = [];
  newLines.push(lines[startIdx]); // "▸ 3i. ..." header
  
  for (const species of speciesList) {
    const { name, types, typeStr } = species;
    
    // Format: ### Name (type1/type2)
    newLines.push("");
    newLines.push(`### ${name} (${typeStr})`);
    
    let atkLine, spaLine, bufLine, disLine, ultLine;
    
    if (HAND_CRAFTED[name]) {
      const hc = HAND_CRAFTED[name];
      atkLine = hc.atk;
      spaLine = hc.spa;
      bufLine = hc.buf;
      disLine = hc.dis;
      ultLine = hc.ult;
    } else {
      // Build ATK pool from types
      let atkPool = [];
      let spaPool = [];
      for (const type of types) {
        const tm = TYPE_BASED_MOVES[type];
        if (tm) {
          if (tm.atk) atkPool = atkPool.concat(tm.atk);
          if (tm.spa) spaPool = spaPool.concat(tm.spa);
        }
      }
      // Dedupe (keep first occurrence)
      const seenAtk = {}, dedupedAtk = [];
      for (const m of atkPool) {
        if (!seenAtk[m]) { seenAtk[m] = true; dedupedAtk.push(m); }
      }
      const seenSpa = {}, dedupedSpa = [];
      for (const m of spaPool) {
        if (!seenSpa[m]) { seenSpa[m] = true; dedupedSpa.push(m); }
      }
      
      atkLine = buildAtkSpaTree(dedupedAtk, ATK_FILLER);
      spaLine = buildAtkSpaTree(dedupedSpa, SPA_FILLER);
      bufLine = buildBufTree();
      disLine = buildDisTree();
      ultLine = buildUltTree(dedupedAtk, dedupedSpa, name);
    }
    
    newLines.push(`ATK: ${atkLine}`);
    newLines.push(`SPA: ${spaLine}`);
    newLines.push(`BUF: ${bufLine}`);
    newLines.push(`DIS: ${disLine}`);
    newLines.push(`ULT: ${ultLine}`);
  }
  
  // Replace content between startIdx+1 and endIdx
  const before = lines.slice(0, startIdx + 1);
  const after = lines.slice(endIdx);
  
  const newContent = before.concat(newLines.slice(1), after).join("\n");
  
  fs.writeFileSync(REPORT_PATH, newContent, "utf8");
  console.log("Done! Section 3i regenerated.");
  
  // Validate
  const finalContent = fs.readFileSync(REPORT_PATH, "utf8");
  const finalLines = finalContent.split("\n");
  
  const headerLine = finalLines.findIndex(l => l.includes("▸ 3i."));
  const fourthStart = finalLines.findIndex((l, i) => i > headerLine && l.includes("■■■■■■■■■■【第四部分】"));
  const sectionLines = finalLines.slice(headerLine, fourthStart);
  
  const speciesCount = sectionLines.filter(l => l.startsWith("### ")).length;
  console.log(`Species count in 3i: ${speciesCount}`);
  
  // Check BUF has T1-T5 distribution
  let bufOk = 0, disOk = 0, ultT2Ok = 0;
  for (const line of sectionLines) {
    if (line.startsWith("BUF: ")) {
      if (line.includes("T2") && line.includes("T3") && line.includes("T4") && !line.includes("T1變硬/叫聲/瞪眼/搖尾巴/影子分身/高速移動/瞬間失憶/劍舞/冥想/替身/守住")) {
        bufOk++;
      }
    }
    if (line.startsWith("DIS: ")) {
      if (line.includes("T2") && line.includes("T3") && !line.includes("煙幕/瞪眼/叫聲/電磁波/鬼火/劇毒/怪異之光/催眠粉/毒粉/吹飛")) {
        disOk++;
      }
    }
    if (line.startsWith("ULT: ")) {
      const t2Match = line.match(/T2(\S+)/);
      if (t2Match && t2Match[1] === "摔打") {
        ultT2Ok++;
      }
    }
  }
  
  // Check hand-crafted
  let mewtwoOk = false, charizardOk = false;
  for (let i = 0; i < sectionLines.length; i++) {
    if (sectionLines[i] === "### 超夢 (超能力)") {
      if (i+1 < sectionLines.length && sectionLines[i+1].includes("ATK: T1拍擊/瞪眼 T2影子偷襲/意念頭錘 T3地震/咬碎 T4近身戰 T5蠻力")) {
        mewtwoOk = true;
      }
    }
    if (sectionLines[i] === "### 噴火龍 (火/飛行)") {
      if (i+1 < sectionLines.length && sectionLines[i+1].includes("ATK: T1抓/叫聲/瞪眼 T2翅膀攻擊/龍息 T3劈開/龍爪 T4勇鳥猛攻 T5V熱焰")) {
        charizardOk = true;
      }
    }
  }
  
  console.log(`BUF properly distributed: ${bufOk}/${speciesCount}`);
  console.log(`DIS properly distributed: ${disOk}/${speciesCount}`);
  console.log(`ULT T2=摔打: ${ultT2Ok}/${speciesCount}`);
  console.log(`噴火龍 hand-crafted: ${charizardOk}`);
  console.log(`超夢 hand-crafted: ${mewtwoOk}`);
  
  // File stats
  const stats = fs.statSync(REPORT_PATH);
  console.log(`File size: ${stats.size} bytes`);
  console.log(`File lines: ${finalLines.length}`);
}

main();
