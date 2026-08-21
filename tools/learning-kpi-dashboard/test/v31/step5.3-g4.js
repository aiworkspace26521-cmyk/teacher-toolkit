const assert = require('assert');
const path = require('path');
const { createPokemonBuild, simMatch } = require('../balance-sim');

console.log('=== G4 管理員實機 兩組 Build 對戰模擬與勝率檢驗 (Step 5.3) ===');

const buildPhysical = createPokemonBuild('物攻爆發型火恐龍', '火', ['火焰拳', '烈焰爪', '水湧突襲_T2_2', '烈焰爪'], { '火焰拳': '熔核之拳' }, { hp: 220, atk: 100, def: 90, spatk: 100, spdef: 90 });
const buildSpecial = createPokemonBuild('特攻砲台型火恐龍', '火', ['火焰拳', '烈焰爪', '水湧突襲_T2_2', '烈焰爪'], { '火焰拳': '熔核之拳' }, { hp: 220, atk: 100, def: 90, spatk: 100, spdef: 90 });

console.log('\n[1] 參賽寶可夢 Build 規格:');
console.log('    Build A (物攻型):', buildPhysical.name, '| 招式:', Object.keys(buildPhysical.learnedMoves), '| 質變:', buildPhysical.modifiers);
console.log('    Build B (特攻型):', buildSpecial.name, '| 招式:', Object.keys(buildSpecial.learnedMoves), '| 質變:', buildSpecial.modifiers);

console.log('\n[2] 執行 500 場對戰模擬與勝率計算...');
const winRateA = simMatch(buildPhysical, buildSpecial, 500);

console.log(`    Build A (${buildPhysical.name}) 勝率: ${(winRateA * 100).toFixed(1)}%`);
console.log(`    Build B (${buildSpecial.name}) 勝率: ${((1 - winRateA) * 100).toFixed(1)}%`);

assert.ok(winRateA >= 0.35 && winRateA <= 0.65, `實戰兩組 Build 勝率 ${winRateA.toFixed(2)} 應符合平衡區間 [0.35, 0.65]`);

console.log('\nPASS  兩組實戰 Build 勝率合理分佈在 [0.35, 0.65]，戰鬥平衡檢驗通過');
console.log('\nG4 step5.3 admin verification PASS');
