const assert = require('assert');
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(path) {
  if (path === 'firebase-admin') {
    return {
      firestore: function() {
        return { collection: function() { return { doc: function() {} }; } };
      }
    };
  }
  if (path === 'firebase-admin/firestore') {
    return {
      Timestamp: { now: function() { return new Date(); } }
    };
  }
  return originalRequire.apply(this, arguments);
};

const { recalculateStudentState } = require('../../backend/kpi-core');

console.log('=== Step 5.4 舊帳號遷移 + 回滾 (v3.0 白皮書 Phase 4 落地) 斷言 ===');

global.V31_FLAGS = { ENABLED: true };

async function runStep54Tests() {
  // 1. 舊帳號經典事件模擬
  const legacyEvents = [
    { action: '捕捉', note: 'ID:P0 獲得: 小火龍 (一般系) | Lv.5 |', score: 100, timestamp: '2026-08-01T10:00:00.000Z' },
    { action: 'SP_ALLOCATE', note: 'P0:atk:5', score: 0, timestamp: '2026-08-02T10:00:00.000Z' },
    { action: 'MOVE_LEARN', note: 'P0:抓:tier1:atk', score: 0, timestamp: '2026-08-03T10:00:00.000Z' },
    { action: 'MOVE_UPGRADE', note: 'P0:抓:3', score: 0, timestamp: '2026-08-04T10:00:00.000Z' }
  ];

  console.log('\n--- 1. 執行舊帳號狀態計算 (v2 模式) ---');
  global.V31_FLAGS.ENABLED = false;
  let stateV2 = await recalculateStudentState('student_001', legacyEvents);
  assert.ok(stateV2.roster && stateV2.roster.length > 0, '應包含寶可夢 roster 陣列');
  const pkmnV2 = stateV2.roster[0];
  assert.strictEqual(pkmnV2.learnedMoves['抓'].level, 3, '舊版 learnedMoves 應保留原等級 3');
  assert.strictEqual(pkmnV2.v31Migrated, undefined, 'v2 模式下無 v31Migrated 標記');
  assert.strictEqual(pkmnV2.modifiers, undefined, 'v2 模式下無 modifiers 欄位');
  console.log('PASS  舊版 learnedMoves 等級保留且無 v31 殘留');

  console.log('\n--- 2. 執行舊帳號 v3.1 遷移 (V31_MIGRATION) ---');
  global.V31_FLAGS.ENABLED = true;
  const migrationEvents = [
    ...legacyEvents,
    { action: 'V31_MIGRATION', note: 'P0:variant-weight->skill-node', score: 0, timestamp: '2026-08-05T10:00:00.000Z' },
    { action: 'SKILL_MODIFIER', note: 'P0:火焰拳:熔核之拳:3', score: 0, timestamp: '2026-08-06T10:00:00.000Z' }
  ];

  let stateV31 = await recalculateStudentState('student_001', migrationEvents);
  const pkmnV31 = stateV31.roster[0];
  assert.strictEqual(pkmnV31.v31Migrated, true, '遷移後應含有 v31Migrated=true 標記');
  assert.strictEqual(pkmnV31.modifiers['火焰拳'], '熔核之拳', '遷移後 v31 特性質變應正確建立');
  assert.strictEqual(pkmnV31.learnedMoves['抓'].level, 3, '遷移後舊招式等級仍保持 3');
  console.log('PASS  舊帳號遷移成功，V31_MIGRATION 事件與新欄位建立完成');

  console.log('\n--- 3. 回滾機制 (ENABLED=false 來回切換 3 次測試) ---');
  for (let loop = 1; loop <= 3; loop++) {
    // 切換旗標為 false
    global.V31_FLAGS.ENABLED = false;
    let rollbackState = await recalculateStudentState('student_001', migrationEvents);
    const pRollback = rollbackState.roster[0];
    assert.strictEqual(pRollback.v31Migrated, undefined, `[Loop ${loop}] 回滾後 v31Migrated 被移除`);
    assert.strictEqual(pRollback.modifiers, undefined, `[Loop ${loop}] 回滾後 modifiers 被移除`);
    assert.strictEqual(pRollback.secondPicks, undefined, `[Loop ${loop}] 回滾後 secondPicks 被移除`);

    // 切換旗標為 true
    global.V31_FLAGS.ENABLED = true;
    let activeState = await recalculateStudentState('student_001', migrationEvents);
    const pActive = activeState.roster[0];
    assert.strictEqual(pActive.v31Migrated, true, `[Loop ${loop}] 切回 v3.1 狀態還原`);
    assert.strictEqual(pActive.modifiers['火焰拳'], '熔核之拳', `[Loop ${loop}] 切回 v3.1 質變屬性還原`);
  }

  console.log('PASS  來回切換旗標 3 次無任何殘留狀態或干擾');

  console.log('\nG2 step5.4 gate PASS');
}

runStep54Tests().catch(err => {
  console.error(err);
  process.exit(1);
});
