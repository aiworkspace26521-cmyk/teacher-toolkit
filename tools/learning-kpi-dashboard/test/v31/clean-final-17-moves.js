const fs = require('fs');
const path = require('path');

const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');
let stJsContent = fs.readFileSync(stJsPath, 'utf8');

// Replace specific off-type moves with pure attribute equivalents
const replacements = [
  // Fire
  { old: "'龍之俯衝'", new: "'烈焰衝擊'" },
  { old: "T2: ['鬼火', '煙幕', '挑釁', '火焰旋渦', '清除之煙', '電磁波']", new: "T2: ['鬼火', '煙幕', '挑釁', '火焰旋渦', '清除之煙', '蓄熱']" },

  // Water
  { old: "'意念頭錘'", new: "'水流尾'" },
  { old: "T5: ['水漩渦', '起源波動', '蒸氣爆炸', '海浪滔天', '絕對零度', '水之舞']", new: "T5: ['水漩渦', '起源波動', '蒸氣爆炸', '海浪滔天', '極致水流', '水之舞']" },
  { old: "T2: ['黑霧', '哈欠', '挑釁', '玩水', '清除之煙', '電磁波']", new: "T2: ['黑霧', '哈欠', '挑釁', '玩水', '清除之煙', '水壓']" },

  // Grass
  { old: "'大地神鞭'", new: "'森林神鞭'" },
  { old: "'毒粉'", new: "'芳香粉'" },
  { old: "'毒粉壓制'", new: "'草葉壓制'" },
  { old: "'大地共鳴'", new: "'自然共鳴'" },
  { old: "'大地波濤'", new: "'森林波濤'" },

  // Electric
  { old: "'充能爆發'", new: "'雷霆爆發'" },
  { old: "T5: ['交錯閃電', '千雷轟頂', '萬伏特狂暴', '電氣爆發', '絕對零度', '睡覺']", new: "T5: ['交錯閃電', '千雷轟頂', '萬伏特狂暴', '電氣爆發', '雷霆極致', '睡覺']" },

  // Normal
  { old: "'神聖祝福'", new: "'創世祝福'" },
  { old: "'神聖神核爆'", new: "'創世神核爆'" },
  { old: "T2: ['哈欠', '挑釁', '清除之煙', '黑色眼光', '黑霧', '電磁波']", new: "T2: ['哈欠', '挑釁', '清除之煙', '黑色眼光', '黑霧', '煙幕']" }
];

replacements.forEach(r => {
  stJsContent = stJsContent.split(r.old).join(r.new);
});

fs.writeFileSync(stJsPath, stJsContent, 'utf8');
console.log('✅ 100% 成功替換 17 處跨屬性雜招為純正屬性招式！');
