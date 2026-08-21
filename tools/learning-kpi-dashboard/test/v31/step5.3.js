const assert = require('assert');
const path = require('path');
const { runBalanceSuite } = require('../balance-sim');

console.log('=== G2 Step 5.3 自動平衡模擬器 (balance-sim.js) 斷言 ===');

const res = runBalanceSuite();
assert.strictEqual(res, true, 'runBalanceSuite 應傳回 true');

console.log('\nG2 step5.3 gate PASS');
