const fs = require('fs');
const path = require('path');

const stJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');
let stJsContent = fs.readFileSync(stJsPath, 'utf8');

stJsContent = stJsContent.replace("T5: ['起源波動', '蒸氣爆炸', '水漩渦', '海浪滔天', '水之舞', '絕對零度']", "T5: ['起源波動', '蒸氣爆炸', '水漩渦', '海浪滔天', '水之舞', '極致水流']");

fs.writeFileSync(stJsPath, stJsContent, 'utf8');
console.log('✅ 替換水系 SPA T5 中的最後一招 絕對零度 -> 極致水流！');
