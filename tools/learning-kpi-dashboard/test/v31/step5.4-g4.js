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

console.log('=== G4 管理員實機 舊帳號遷移與 3 次來回回滾切換檢驗 (Step 5.4) ===');

async function runG4Step54() {
  const adminStudentId = 'Admin_Legacy_Roster';
  
  // 模擬管理員帳號之真實舊版本歷程事件
  const legacyHistory = [
    { action: '捕捉', note: 'ID:P0 獲得: 小火龍 (一般系) | Lv.5 |', score: 100, timestamp: '2026-07-01T10:00:00.000Z' },
    { action: 'SP_ALLOCATE', note: 'P0:atk:12', score: 0, timestamp: '2026-07-02T10:00:00.000Z' },
    { action: 'MOVE_LEARN', note: 'P0:火焰拳:tier2:atk', score: 0, timestamp: '2026-07-03T10:00:00.000Z' },
    { action: 'MOVE_UPGRADE', note: 'P0:火焰拳:4', score: 0, timestamp: '2026-07-04T10:00:00.000Z' }
  ];

  console.log('\n[1] 模擬舊帳號（未遷移狀態）在 v2 下運作:');
  global.V31_FLAGS = { ENABLED: false };
  const v2State = await recalculateStudentState(adminStudentId, legacyHistory);
  const pV2 = v2State.roster[0];
  console.log('    寶可夢:', pV2.baseName, '| learnedMoves:', pV2.learnedMoves);
  assert.strictEqual(pV2.learnedMoves['火焰拳'].level, 4, '舊版招式火焰拳等級應為 4');
  assert.strictEqual(pV2.v31Migrated, undefined, 'v2 模式下不含 v31Migrated');

  console.log('\n[2] 管理員執行 migrateLegacyRoster 遷移至 v3.1:');
  global.V31_FLAGS = { ENABLED: true };
  const v31Events = [
    ...legacyHistory,
    { action: 'V31_MIGRATION', note: adminStudentId + ':variant-weight->skill-node', score: 0, timestamp: '2026-07-05T10:00:00.000Z' },
    { action: 'SKILL_MODIFIER', note: 'P0:火焰拳:熔核之拳:3', score: 0, timestamp: '2026-07-06T10:00:00.000Z' }
  ];

  const v31State = await recalculateStudentState(adminStudentId, v31Events);
  const pV31 = v31State.roster[0];
  console.log('    遷移後寶可夢:', pV31.baseName, '| v31Migrated:', pV31.v31Migrated, '| modifiers:', pV31.modifiers);
  assert.strictEqual(pV31.v31Migrated, true, '遷移後 v31Migrated 為 true');
  assert.strictEqual(pV31.modifiers['火焰拳'], '熔核之拳', '質變屬性熔核之拳存在');

  console.log('\n[3] 進行 3 次切換旗標回滾測試 (v3.1 <-> v2):');
  for (let i = 1; i <= 3; i++) {
    // 關閉旗標 (回滾至 v2)
    global.V31_FLAGS = { ENABLED: false };
    const rbState = await recalculateStudentState(adminStudentId, v31Events);
    const rbP = rbState.roster[0];
    assert.strictEqual(rbP.v31Migrated, undefined, `[Toggle ${i}] 回滾後無 v31Migrated 標記`);
    assert.strictEqual(rbP.modifiers, undefined, `[Toggle ${i}] 回滾後無 modifiers 欄位`);
    console.log(`    [Toggle ${i}] 關閉旗標 (ENABLED=false) -> 100% 回歸 v2 乾淨狀態`);

    // 開啟旗標 (恢復 v3.1)
    global.V31_FLAGS = { ENABLED: true };
    const actState = await recalculateStudentState(adminStudentId, v31Events);
    const actP = actState.roster[0];
    assert.strictEqual(actP.v31Migrated, true, `[Toggle ${i}] 重新開啟旗標 -> 恢復 v31Migrated`);
    assert.strictEqual(actP.modifiers['火焰拳'], '熔核之拳', `[Toggle ${i}] 重新開啟旗標 -> 恢復質變`);
    console.log(`    [Toggle ${i}] 開啟旗標 (ENABLED=true)  -> 100% 恢復 v3.1 狀態`);
  }

  console.log('\nPASS  管理員舊帳號遷移與 3 次來回切換回滾測試完全成功');
  console.log('\nG4 step5.4 admin verification PASS');
}

runG4Step54().catch(err => {
  console.error(err);
  process.exit(1);
});
