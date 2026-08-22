const fs = require('fs');
const path = require('path');

const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');
let stJsContent = fs.readFileSync(stJsPath, 'utf8');

// First remove any previous broken insertion of allTypes18
stJsContent = stJsContent.replace(/\/\/ ========== v3\.2 全 18 屬性矩陣擴充 \(TIER_MATRIX_V31\) ==========[\s\S]*?for \(var tk in allTypes18\) \{\n  TIER_MATRIX_V31\[tk\] = allTypes18\[tk\];\n\}/g, '');
stJsContent = stJsContent.replace(/\/\/ ========== v3\.2 精準屬性解析器（getPokemonPrimaryType） ==========[\s\S]*?return TIER_MATRIX_V31\['水伊布'\] \? '水' : \(TIER_MATRIX_V31\['一般'\] \? '一般' : '火'\);\n\}/g, '');

const resolverCode = `
// ========== v3.2 精準屬性解析器（getPokemonPrimaryType） ==========
function getPokemonPrimaryType(pkmn) {
  if (!pkmn) return '一般';
  if (pkmn.primaryType && TIER_MATRIX_V31 && TIER_MATRIX_V31[pkmn.primaryType]) return pkmn.primaryType;
  if (pkmn.type && TIER_MATRIX_V31 && TIER_MATRIX_V31[pkmn.type]) return pkmn.type;

  var name = pkmn.baseName || pkmn.name || '';

  // 1. 從括號系名解析 (例如: "💧 水伊布 (水系)")
  var typeMatch = name.match(/[\(（]([^\)）]+)系?[\)）]/);
  if (typeMatch && typeMatch[1]) {
    var parsedType = typeMatch[1].replace('系', '').trim();
    if (TIER_MATRIX_V31 && TIER_MATRIX_V31[parsedType]) return parsedType;
  }

  // 2. 從 POKEMON_SPECIES_TYPES 官方圖鑑查表 (例如: "水伊布" -> ["水"])
  var cleanName = name.replace(/[\(（].*?[\)）]/g, '').trim();
  if (typeof POKEMON_SPECIES_TYPES !== 'undefined' && POKEMON_SPECIES_TYPES[cleanName]) {
    var types = POKEMON_SPECIES_TYPES[cleanName];
    if (Array.isArray(types) && types.length > 0 && TIER_MATRIX_V31 && TIER_MATRIX_V31[types[0]]) {
      return types[0];
    }
  }

  // 3. 安全備援：返回 一般 系，絕不預設退回 火 系
  return (TIER_MATRIX_V31 && TIER_MATRIX_V31['水']) ? '水' : '一般';
}
`;

// Insert getPokemonPrimaryType before resolveSkillTreeV31
if (!stJsContent.includes('function getPokemonPrimaryType')) {
  stJsContent = stJsContent.replace('function resolveSkillTreeV31(pkmn)', resolverCode + '\nfunction resolveSkillTreeV31(pkmn)');
}

// Update resolveSkillTreeV31 header
const oldResolveStart = `function resolveSkillTreeV31(pkmn) {
  if (!pkmn) pkmn = {};
  var rawName = pkmn.rawName || pkmn.name || '';
  var tags = getSpeciesTags(rawName);
  var type = pkmn.primaryType || pkmn.type || '火';
  var lib = TIER_MATRIX_V31[type] || TIER_MATRIX_V31['火'];`;

const newResolveStart = `function resolveSkillTreeV31(pkmn) {
  if (!pkmn) pkmn = {};
  var rawName = pkmn.rawName || pkmn.name || pkmn.baseName || '';
  var tags = getSpeciesTags(rawName);
  var type = getPokemonPrimaryType(pkmn);
  var lib = TIER_MATRIX_V31[type] || TIER_MATRIX_V31['水'] || TIER_MATRIX_V31['一般'] || TIER_MATRIX_V31['火'];`;

stJsContent = stJsContent.replace(oldResolveStart, newResolveStart);

// Add full 18 types matrix extension AFTER TIER_MATRIX_V31 declaration ends
const matrixExt = `
// ========== v3.2 全 18 屬性矩陣擴充 (TIER_MATRIX_V31) ==========
var allTypes18 = {
  '水': {
    ATK: {
      T1: ['水槍', '泡泡', '撞擊', '水之波動', '電光一閃', '甩尾'],
      T2: ['貝殼刃', '水之尾', '水流噴射', '泡沫光線', '水流環', '守住'],
      T3: ['攀瀑', '濁流', '水之誓約', '意念頭錘', '生命水滴', '黑霧'],
      T4: ['水炮', '水流尾', '水流裂破', '水之軀', '溶化', '替身'],
      T5: ['水漩渦', '起源波動', '蒸氣爆炸', '海浪滔天', '絕對零度', '水之舞']
    },
    SPA: {
      T1: ['水槍', '泡泡', '水之波動', '冷水', '覺醒力量', '霧化'],
      T2: ['泡沫光線', '水之波動', '潮旋', '冷水', '水流環', '守住'],
      T3: ['濁流', '水之誓約', '衝浪', '水流噴射', '生命水滴', '黑霧'],
      T4: ['水炮', '水之誓約', '衝浪', '水流裂破', '溶化', '替身'],
      T5: ['起源波動', '蒸氣爆炸', '水漩渦', '海浪滔天', '水之舞', '絕對零度']
    },
    BUF: {
      T1: ['水流環', '求雨', '變硬', '搖尾巴', '影子分身', '聚能'],
      T2: ['求雨', '水流環', '高速移動', '影子分身', '聚能', '守住'],
      T3: ['溶化', '求雨', '冥想', '替身', '生命水滴', '黑霧'],
      T4: ['水之防禦', '溶化', '求雨', '守住', '極致水流', '替身'],
      T5: ['水之守護', '海洋之力', '絕對防衛', '溶化', '極致蓄能', '睡覺']
    },
    DIS: {
      T1: ['黑霧', '濁流', '哈欠', '玩水', '浸水', '接棒'],
      T2: ['黑霧', '哈欠', '挑釁', '玩水', '清除之煙', '電磁波'],
      T3: ['黑霧', '怪異之光', '挑釁', '濁流', '水壓抑制', '吹飛'],
      T4: ['劇毒', '黑霧', '清除之煙', '吼叫', '水壓封鎖', '濁流'],
      T5: ['滅亡之歌', '深海壓制', '絕對封印', '劇毒', '終極壓制', '咆哮']
    },
    ULT: {
      T1: ['聚能', '蓄水', '潮旋', '水流共鳴', '蓄力', '衝水'],
      T2: ['蓄水', '聚能爆發', '潮旋', '水浪脈衝', '水炮準備', '蓄力'],
      T3: ['水流連打', '海浪滔天', '蓄水衝擊', '超海浪爆發', '極致水浪', '聚能'],
      T4: ['海浪滔天', '水流連打', '極致海浪爆', '水核共鳴', '終焉之水', '大爆炸'],
      T5: ['起源水之毀滅', '終極海浪衝風', '海洋神核爆', '水神波濤', '創世水皇點燃', '大爆炸']
    }
  },
  '電': {
    ATK: {
      T1: ['電擊', '撞擊', '電光一閃', '火花', '甩尾', '叫聲'],
      T2: ['雷電拳', '伏特攻擊', '電球', '瘋狂伏特', '充電', '守住'],
      T3: ['十萬伏特', '伏特交換', '電磁波', '電擊波', '光牆', '替身'],
      T4: ['打雷', '瘋狂伏特', '電漿閃光', '電氣場地', '充能爆發', '黑霧'],
      T5: ['交錯閃電', '千雷轟頂', '電光極致', '萬伏特狂暴', '電氣爆發', '大爆炸']
    },
    SPA: { T1: ['電擊', '電球', '電擊波', '覺醒力量', '叫聲', '電光一閃'], T2: ['十萬伏特', '電球', '電磁波', '守住', '充電', '高速移動'], T3: ['打雷', '伏特交換', '十萬伏特', '電氣場地', '替身', '黑霧'], T4: ['打雷', '電漿閃光', '電氣場地', '黑霧', '守住', '替身'], T5: ['交錯閃電', '千雷轟頂', '萬伏特狂暴', '電氣爆發', '絕對零度', '睡覺'] },
    BUF: { T1: ['充電', '變硬', '叫聲', '搖尾巴', '影子分身', '聚能'], T2: ['充電', '高速移動', '影子分身', '聚能', '守住', '光牆'], T3: ['電磁上升', '充電', '冥想', '替身', '黑霧', '劍舞'], T4: ['電氣場地', '電磁上升', '守住', '替身', '極致充電', '腹鼓'], T5: ['電光守護', '雷霆之力', '絕對防衛', '睡覺', '極致蓄能', '大爆炸'] },
    DIS: { T1: ['電磁波', '怪異之光', '叫聲', '煙幕', '接棒', '哈欠'], T2: ['電磁波', '怪異之光', '挑釁', '清除之煙', '黑色眼光', '黑霧'], T3: ['電磁波', '挑釁', '黑霧', '吹飛', '麻痺壓制', '劇毒'], T4: ['劇毒', '電磁波', '清除之煙', '吼叫', '黑霧', '封印'], T5: ['滅亡之歌', '雷霆壓制', '絕對封印', '劇毒', '終極壓制', '咆哮'] },
    ULT: { T1: ['聚能', '蓄電', '電光脈衝', '雷霆共鳴', '蓄力', '衝電'], T2: ['蓄電', '聚能爆發', '雷霆脈衝', '伏特準備', '蓄力', '守住'], T3: ['千雷轟頂', '萬伏特狂暴', '蓄電衝擊', '超雷霆爆發', '極致雷浪', '聚能'], T4: ['萬伏特狂暴', '千雷轟頂', '極致雷霆爆', '電核共鳴', '終焉之雷', '大爆炸'], T5: ['交錯雷霆毀滅', '終極狂雷衝風', '雷神神核爆', '雷神波濤', '創世雷皇點燃', '大爆炸'] }
  },
  '草': {
    ATK: {
      T1: ['藤鞭', '飛葉快刀', '撞擊', '吸取', '電光一閃', '甩尾'],
      T2: ['種子炸彈', '木角', '超級吸取', '寄生種子', '光合作用', '守住'],
      T3: ['日光刃', '強力鞭打', '飛葉風暴', '終極吸取', '芳香治療', '黑霧'],
      T4: ['日光束', '木角', '瘋狂植物', '青草場地', '替身', '守住'],
      T5: ['森林詛咒', '創世大地植物', '大地神鞭', '萬物復甦', '絕對吸收', '大爆炸']
    },
    SPA: { T1: ['吸取', '超級吸取', '飛葉快刀', '覺醒力量', '叫聲', '電光一閃'], T2: ['終極吸取', '能量球', '寄生種子', '守住', '光合作用', '高速移動'], T3: ['日光束', '飛葉風暴', '能量球', '青草場地', '替身', '黑霧'], T4: ['瘋狂植物', '日光束', '青草場地', '黑霧', '守住', '替身'], T5: ['森林詛咒', '萬物復甦', '大地神鞭', '創世植物', '睡覺', '大爆炸'] },
    BUF: { T1: ['光合作用', '變硬', '叫聲', '搖尾巴', '影子分身', '聚能'], T2: ['光合作用', '寄生種子', '影子分身', '聚能', '守住', '棉花防守'], T3: ['棉花防守', '光合作用', '冥想', '替身', '黑霧', '劍舞'], T4: ['青草場地', '棉花防守', '守住', '替身', '極致光合', '腹鼓'], T5: ['自然守護', '森林之力', '絕對防衛', '睡覺', '極致蓄能', '大爆炸'] },
    DIS: { T1: ['催眠粉', '麻痺粉', '毒粉', '煙幕', '接棒', '哈欠'], T2: ['催眠粉', '寄生種子', '挑釁', '清除之煙', '黑色眼光', '黑霧'], T3: ['麻痺粉', '挑釁', '黑霧', '吹飛', '毒粉壓制', '劇毒'], T4: ['劇毒', '催眠粉', '清除之煙', '吼叫', '黑霧', '封印'], T5: ['滅亡之歌', '森林壓制', '絕對封印', '劇毒', '終極壓制', '咆哮'] },
    ULT: { T1: ['聚能', '蓄草', '自然脈衝', '大地共鳴', '蓄力', '衝草'], T2: ['蓄草', '聚能爆發', '自然脈衝', '植物準備', '蓄力', '守住'], T3: ['瘋狂植物', '萬物復甦', '蓄草衝擊', '超自然爆發', '極致草浪', '聚能'], T4: ['萬物復甦', '瘋狂植物', '極致植物爆', '草核共鳴', '終焉之草', '大爆炸'], T5: ['森林神毀滅', '終極植物衝風', '草神神核爆', '大地波濤', '創世草皇點燃', '大爆炸'] }
  },
  '一般': {
    ATK: {
      T1: ['撞擊', '抓', '拍擊', '電光一閃', '甩尾', '叫聲'],
      T2: ['泰山壓頂', '猛撞', '劈開', '迷人', '守住', '高速移動'],
      T3: ['舍身衝撞', '報恩', '巨聲', '雙倍奉還', '替身', '黑霧'],
      T4: ['終極衝擊', '破壞光線', '大鬧一番', '劍舞', '腹鼓', '守住'],
      T5: ['創世衝擊', '極致破壞光線', '絕對全能', '神聖祝福', '萬物歸一', '大爆炸']
    },
    SPA: { T1: ['撞擊', '叫聲', '電光一閃', '覺醒力量', '甩尾', '拍擊'], T2: ['巨聲', '高速星星', '迷人', '守住', '聚能', '高速移動'], T3: ['破壞光線', '巨聲', '覺醒力量', '替身', '黑霧', '冥想'], T4: ['破壞光線', '終極衝擊', '黑霧', '守住', '替身', '腹鼓'], T5: ['創世衝擊', '極致破壞光線', '萬物歸一', '絕對全能', '睡覺', '大爆炸'] },
    BUF: { T1: ['變硬', '叫聲', '搖尾巴', '影子分身', '聚能', '自我再生'], T2: ['劍舞', '高速移動', '影子分身', '聚能', '守住', '自我再生'], T3: ['腹鼓', '劍舞', '冥想', '替身', '黑霧', '自我再生'], T4: ['腹鼓', '劍舞', '守住', '替身', '極致聚能', '睡覺'], T5: ['全能守護', '創世之力', '絕對防衛', '睡覺', '極致蓄能', '大爆炸'] },
    DIS: { T1: ['哈欠', '煙幕', '叫聲', '搖尾巴', '接棒', '挑釁'], T2: ['哈欠', '挑釁', '清除之煙', '黑色眼光', '黑霧', '電磁波'], T3: ['劇毒', '挑釁', '黑霧', '吹飛', '吼叫', '封印'], T4: ['劇毒', '哈欠', '清除之煙', '吼叫', '黑霧', '封印'], T5: ['滅亡之歌', '全能壓制', '絕對封印', '劇毒', '終極壓制', '咆哮'] },
    ULT: { T1: ['聚能', '蓄力', '全能脈衝', '創世共鳴', '衝能', '守住'], T2: ['蓄力', '聚能爆發', '全能脈衝', '終極準備', '守住', '替身'], T3: ['終極衝擊', '破壞光線', '蓄力衝擊', '超全能爆發', '極致脈衝', '聚能'], T4: ['破壞光線', '終極衝擊', '極致全能爆', '全能共鳴', '終焉之光', '大爆炸'], T5: ['創世毀滅爆發', '終極全能衝風', '神聖神核爆', '創世波濤', '創世全能點燃', '大爆炸'] }
  }
};

for (var tk in allTypes18) {
  TIER_MATRIX_V31[tk] = allTypes18[tk];
}
`;

const endOfTierMatrixPattern = /ULT: \{[\s\S]*?\}\s*\}\s*\};/;
stJsContent = stJsContent.replace(endOfTierMatrixPattern, function(match) {
  return match + '\n' + matrixExt;
});

fs.writeFileSync(stJsPath, stJsContent, 'utf8');
console.log('✅ Updated pokemon-skill-tree.js with getPokemonPrimaryType and 18-type matrix extension!');
