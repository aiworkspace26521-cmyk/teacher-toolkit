const path = require('path');
const fs = require('fs');

global.window = global;
global.POKEMON_TIERS = { "一般": [], "稀有": [], "傳說": [] };
global.POKEMON_SPECIES_TYPES = {};

const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');
const mgJsPath = path.resolve(__dirname, '../../frontend/move-generator.js');

eval(fs.readFileSync(stJsPath, 'utf8'));

if (fs.existsSync(mgJsPath)) {
  eval(fs.readFileSync(mgJsPath, 'utf8'));
}

console.log(`================================================================`);
console.log(`🔍 全 18 屬性技能樹招式屬性對應性橫向全面審查 (18-Type Cross Audit)`);
console.log(`================================================================`);

const ALL_TYPES = ['火', '水', '草', '電', '冰', '格鬥', '毒', '地面', '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精', '一般'];

// Universal moves allowed in any tree
const UNIVERSAL_MOVES = [
  '撞擊', '抓', '拍擊', '二連踢', '電光一閃', '甩尾', '叫聲', '變硬', '搖尾巴',
  '影子分身', '聚能', '蓄力', '守住', '替身', '黑霧', '煙幕', '哈欠', '吹飛',
  '劇毒', '大爆炸', '咆哮', '接棒', '挑釁', '光牆', '自我再生', '冥想', '劍舞',
  '腹鼓', '高速移動', '迷人', '報恩', '巨聲', '雙倍奉還', '破壞光線', '終極衝擊',
  '大鬧一番', '睡覺', '清除之煙', '黑色眼光', '封印', '滅亡之歌', '覺醒力量'
];

let totalMismatchCount = 0;
const auditReport = {};

ALL_TYPES.forEach(typeKey => {
  const typeMatrix = TIER_MATRIX_V31[typeKey];
  auditReport[typeKey] = { totalMoves: 0, mismatches: [] };

  if (!typeMatrix) return;

  const roles = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
  roles.forEach(role => {
    const roleTrack = typeMatrix[role];
    if (!roleTrack) return;

    for (let t = 1; t <= 5; t++) {
      const tierMoves = roleTrack['T' + t] || [];
      tierMoves.forEach(moveName => {
        auditReport[typeKey].totalMoves++;

        // If it's a universal move, it's 100% valid in any tree
        if (UNIVERSAL_MOVES.includes(moveName)) return;

        const spec = typeof getMoveSpecV31 === 'function' ? getMoveSpecV31(moveName) : null;
        const moveType = spec ? spec.type : null;

        // Check if move has elemental mismatch
        if (moveType && moveType !== '一般' && moveType !== typeKey) {
          totalMismatchCount++;
          auditReport[typeKey].mismatches.push({
            role, tier: 'T' + t, moveName, moveType, expectedType: typeKey
          });
        }
      });
    }
  });
});

console.log(`📊 18 屬性對應性審查結果摘要:`);
ALL_TYPES.forEach(tk => {
  const rep = auditReport[tk];
  if (rep.mismatches.length === 0) {
    console.log(`  - 屬性 【${tk}】: 共 ${rep.totalMoves} 招 -> ✅ 100% 純正合規 (0 屬性不符)`);
  } else {
    console.log(`  - 屬性 【${tk}】: 共 ${rep.totalMoves} 招 -> ⚠️ 發現 ${rep.mismatches.length} 招跨系雜招: ${rep.mismatches.map(m => m.moveName + '[' + m.moveType + ']').join(', ')}`);
  }
});

console.log(`\n----------------------------------------------------------------`);
if (totalMismatchCount === 0) {
  console.log(`🎉 SUCCESS: 全 18 屬性技能樹交叉審查 100% 完全通過！無任何跨系錯置招式！`);
} else {
  console.log(`⚠️ 總計發現 ${totalMismatchCount} 處屬性不符招式，準備進行橫向純化替換...`);
}
