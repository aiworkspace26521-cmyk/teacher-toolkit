const fs = require('fs');
const path = require('path');

const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');
let stJsContent = fs.readFileSync(stJsPath, 'utf8');

const updatedInferFn = `function inferMoveTypeByName(moveName) {
  if (!moveName) return '一般';

  // 1. 特殊與多字精準詞彙優先判定
  if (/^(火花|閃焰|熱浪|烈焰|熔岩|地獄火|爆炎|過熱|燼|灼|噴射火焰|神火|焰)/.test(moveName)) return '火';
  if (/^(水槍|泡泡|水之|貝殼|水流|衝浪|濁流|起源波動|蒸氣|海浪|潮旋|冷水|水炮|攀瀑)/.test(moveName)) return '水';
  if (/^(吸取|超級吸取|終極吸取|飛葉|日光|藤鞭|種子|能量球|木角|森林|芳香|青草)/.test(moveName)) return '草';
  if (/^(電擊|十萬伏特|打雷|伏特|電球|電漿|千雷|交錯閃電|充電|電磁)/.test(moveName)) return '電';
  if (/^(細雪|冰針|凍風|絕對零度|暴風雪|冰凍|霜|雪)/.test(moveName)) return '冰';
  if (/^(念力|精神|超能力|幻象|心靈|意念頭錘|神聖)/.test(moveName)) return '超能力';
  if (/^(大地|震浪|地震|沙暴|泥巴|重力)/.test(moveName)) return '地面';
  if (/^(毒針|劇毒|毒粉|溶解液|清除之煙|臭泥)/.test(moveName)) return '毒';
  if (/^(起風|空氣斬|啄|羽毛|暴風|疾風|飛翔)/.test(moveName)) return '飛行';
  if (/^(龍之|龍息|龍爪|龍尾|千龍)/.test(moveName)) return '龍';
  if (/^(金屬|鋼鐵|加農|鐵頭)/.test(moveName)) return '鋼';

  // 2. 通用與無屬性傾向招式一律歸類為 一般 系
  if (/(極致|全能|萬物|創世|衝擊|重擊|破壞|大爆炸|叫聲|甩尾|撞擊|抓|拍擊|二連踢|電光一閃|變硬|影子分身|聚能|蓄力|守住|替身|黑霧|煙幕|哈欠|吹飛|咆哮)/.test(moveName)) return '一般';

  // 3. 單字匹配備援
  if (/[水泡浪瀑海潮泉冷]/.test(moveName)) return '水';
  if (/[電雷伏閃霹霆]/.test(moveName)) return '電';
  if (/[草藤葉花樹木自然植物]/.test(moveName)) return '草';
  if (/[冰雪霜凍寒零]/.test(moveName)) return '冰';
  if (/[炎火爆熱燼灼熔陽業]/.test(moveName)) return '火';

  return '一般';
}`;

stJsContent = stJsContent.replace(/function inferMoveTypeByName\(moveName\) \{[\s\S]*?return '一般';\n\}/, updatedInferFn);

fs.writeFileSync(stJsPath, stJsContent, 'utf8');
console.log('✅ 成功優化 inferMoveTypeByName 詞彙判定優先序！');
