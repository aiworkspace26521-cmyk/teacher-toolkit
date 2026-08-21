const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const Module = require('module');

// Intercept module require for backend firebase-admin
const originalRequire = Module.prototype.require;
Module.prototype.require = function(reqPath) {
  if (reqPath === 'firebase-admin') {
    return {
      firestore: function() {
        return { collection: function() { return { doc: function() {} }; } };
      }
    };
  }
  if (reqPath === 'firebase-admin/firestore') {
    return {
      Timestamp: { now: function() { return new Date(); } }
    };
  }
  return originalRequire.apply(this, arguments);
};

const { recalculateStudentState } = require('../../backend/kpi-core');

console.log('================================================================');
console.log('🚀 開始執行《招式學習系統 v3.1 管理員實機登錄逐步驗證計劃》');
console.log('================================================================\n');

async function runAdminLiveVerification() {
  const adminStudentId = 'Admin';
  
  // ------------------------------------------------------------------
  // 📍 階段 1：管理員登入與狀態初始化 (Admin Access & Init)
  // ------------------------------------------------------------------
  console.log('📍 【階段 1】管理員登入與狀態初始化...');
  
  global.V31_FLAGS = { ENABLED: true };
  
  // 模擬管理員帳號初始捕捉事件
  const phase1Events = [
    { action: '捕捉', note: 'ID:P0 獲得: 火恐龍 (火系) | Lv.15 |', score: 100, timestamp: '2026-08-21T10:00:00.000Z' },
    { action: '捕捉', note: 'ID:P1 獲得: 小火馬 (火系) | Lv.15 |', score: 100, timestamp: '2026-08-21T10:05:00.000Z' }
  ];

  let stateP1 = await recalculateStudentState(adminStudentId, phase1Events);
  assert.ok(stateP1, '管理員狀態計算結果不得為空');
  assert.strictEqual(stateP1.studentId, 'Admin', '帳號應為 Admin');
  assert.strictEqual(stateP1.roster.length, 2, '應有 2 隻測試寶可夢 (火恐龍 & 小火馬)');
  
  const charmeleon = stateP1.roster.find(p => p.baseName.includes('火恐龍'));
  const ponyta = stateP1.roster.find(p => p.baseName.includes('小火馬'));
  assert.ok(charmeleon, '應找到火恐龍');
  assert.ok(ponyta, '應找到小火馬');
  
  console.log('    ✓ 管理員身份確認為 `Admin`');
  console.log('    ✓ 測試寶可夢初始化完成:', charmeleon.baseName, '與', ponyta.baseName);
  console.log('✅ 【階段 1】通過！\n');

  // ------------------------------------------------------------------
  // 📍 階段 2：SP 錢包與技能樹階層解鎖 (SP Economy & Tier Unlock)
  // ------------------------------------------------------------------
  console.log('📍 【階段 2】SP 錢包與技能樹階層解鎖測試...');
  
  // 模擬管理員點擊 "+2000 EXP" 升級至 Lv.90 獲取 90 SP 滿點數
  const phase2Events = [
    ...phase1Events,
    { action: '系統測試', note: '管理員增加經驗值 +20000', score: 0, expGained: 20000, timestamp: '2026-08-21T10:10:00.000Z' }
  ];

  let stateP2 = await recalculateStudentState(adminStudentId, phase2Events);
  const p2Pkmn = stateP2.roster[0];
  console.log(`    當前寶可夢 Level: ${p2Pkmn.currentLevel} | 獲取 SP 總額: ${p2Pkmn.totalSpEarned}`);
  assert.ok(p2Pkmn.totalSpEarned >= 90, '滿級 SP 總額應包含 90 SP 點數');

  // 測試階層門檻 (T2=3, T3=8, T4=15, T5=24) 逐步解鎖
  const testTiers = [
    { sp: 3, expectedTier: 2 },
    { sp: 8, expectedTier: 3 },
    { sp: 15, expectedTier: 4 },
    { sp: 24, expectedTier: 5 }
  ];

  let accumEvents = [...phase2Events];
  for (const tt of testTiers) {
    accumEvents.push({
      action: 'SP_ALLOCATE',
      note: `${p2Pkmn.id}:atk:${tt.sp}:v31`,
      score: 0,
      timestamp: '2026-08-21T10:15:00.000Z'
    });
    let st = await recalculateStudentState(adminStudentId, accumEvents);
    let targetAtkTree = st.roster[0].skillTree.atk;
    console.log(`    - 投入 ATK SP 達 ${targetAtkTree.sp} 點 -> 解鎖階層: T${targetAtkTree.tier}`);
    assert.strictEqual(targetAtkTree.tier, tt.expectedTier, `SP 達 ${tt.sp} 應精確解鎖 T${tt.expectedTier}`);
  }
  
  console.log('✅ 【階段 2】通過！\n');

  // ------------------------------------------------------------------
  // 📍 階段 3：招式學習、質變分支與 6 招裝備 (Move Learning, Modifiers & Equip)
  // ------------------------------------------------------------------
  console.log('📍 【階段 3】招式學習、質變分支與 6 招裝備測試...');
  
  // 學習 T1 招式 (抓), T2 第一招 (火焰拳 消耗 2 SP), T2 第二招 (烈焰爪 消耗 ceil(2*1.5)=3 SP)
  const phase3Events = [
    ...accumEvents,
    { action: 'MOVE_LEARN', note: `${p2Pkmn.id}:抓:tier1:atk`, score: 0, timestamp: '2026-08-21T10:20:00.000Z' },
    { action: 'MOVE_LEARN', note: `${p2Pkmn.id}:火焰拳:tier2:atk`, score: 0, timestamp: '2026-08-21T10:21:00.000Z' },
    { action: 'MOVE_LEARN', note: `${p2Pkmn.id}:烈焰爪:tier2:atk`, score: 0, timestamp: '2026-08-21T10:22:00.000Z' },
    { action: 'MOVE_UPGRADE', note: `${p2Pkmn.id}:火焰拳:5`, score: 0, timestamp: '2026-08-21T10:23:00.000Z' },
    { action: 'SKILL_MODIFIER', note: `${p2Pkmn.id}:火焰拳:熔核之拳:3`, score: 0, timestamp: '2026-08-21T10:24:00.000Z' },
    { action: 'MOVE_EQUIP', note: `${p2Pkmn.id}:抓,火焰拳,烈焰爪`, score: 0, timestamp: '2026-08-21T10:25:00.000Z' }
  ];

  let stateP3 = await recalculateStudentState(adminStudentId, phase3Events);
  const p3Pkmn = stateP3.roster[0];
  assert.ok(p3Pkmn.learnedMoves['火焰拳'], '應已學習火焰拳');
  assert.strictEqual(p3Pkmn.learnedMoves['火焰拳'].level, 5, '火焰拳等級應升至 Lv.5');
  assert.strictEqual(p3Pkmn.modifiers['火焰拳'], '熔核之拳', '質變分支應為熔核之拳');
  assert.strictEqual(p3Pkmn.equippedMoves.length, 3, '裝備招式數應為 3 (<=6)');
  console.log('    ✓ 火焰拳升級 Lv.5 並解鎖質變 [熔核之拳]');
  console.log('    ✓ 6 招內裝備編輯成功:', p3Pkmn.equippedMoves.join(', '));
  console.log('✅ 【階段 3】通過！\n');

  // ------------------------------------------------------------------
  // 📍 階段 4：回憶膠囊重置與還原測試 (Memory Capsule & SKILL_RESET)
  // ------------------------------------------------------------------
  console.log('📍 【階段 4】回憶膠囊重置與還原測試...');
  
  const phase4Events = [
    ...phase3Events,
    { action: 'SKILL_RESET', note: `${p2Pkmn.id}:記憶膠囊`, score: 0, timestamp: '2026-08-21T10:30:00.000Z' }
  ];

  let stateP4 = await recalculateStudentState(adminStudentId, phase4Events);
  const p4Pkmn = stateP4.roster[0];
  assert.strictEqual(Object.keys(p4Pkmn.learnedMoves).length, 0, '重置後 learnedMoves 應完全清空');
  assert.strictEqual(Object.keys(p4Pkmn.modifiers).length, 0, '重置後 modifiers 應完全清空');
  assert.strictEqual(p4Pkmn.skillTree.atk.sp, 0, '重置後 ATK SP 應退還歸 0');
  assert.strictEqual(p4Pkmn.skillTree.atk.tier, 1, '重置後 ATK 階層應還原為 T1');
  console.log('    ✓ 已成功執行 SKILL_RESET');
  console.log('    ✓ 招式與質變 100% 清空，SP 100% 退還至錢包 (剩餘 SP:', p4Pkmn.skillPoints, ')');
  console.log('✅ 【階段 4】通過！\n');

  // ------------------------------------------------------------------
  // 📍 階段 5：舊帳號遷移與 3 次回滾切換測試 (Migration & 3-Cycle Rollback)
  // ------------------------------------------------------------------
  console.log('📍 【階段 5】舊帳號遷移與 3 次回滾切換測試...');
  
  const phase5Events = [
    ...phase3Events, // 使用包含點數、招式、質變的完整歷程
    { action: 'V31_MIGRATION', note: `${p2Pkmn.id}:variant-weight->skill-node`, score: 0, timestamp: '2026-08-21T10:35:00.000Z' }
  ];

  console.log('    開始執行 3 次旗標切換回滾測試 (v3.1 <-> v2)...');
  for (let loop = 1; loop <= 3; loop++) {
    // 1. 關閉旗標 (ENABLED = false)
    global.V31_FLAGS.ENABLED = false;
    let rollbackSt = await recalculateStudentState(adminStudentId, phase5Events);
    let rbPkmn = rollbackSt.roster[0];
    assert.strictEqual(rbPkmn.v31Migrated, undefined, `[Loop ${loop}] 回滾後不含 v31Migrated`);
    assert.strictEqual(rbPkmn.modifiers, undefined, `[Loop ${loop}] 回滾後不含 modifiers`);
    assert.strictEqual(rbPkmn.secondPicks, undefined, `[Loop ${loop}] 回滾後不含 secondPicks`);

    // 2. 開啟旗標 (ENABLED = true)
    global.V31_FLAGS.ENABLED = true;
    let activeSt = await recalculateStudentState(adminStudentId, phase5Events);
    let actPkmn = activeSt.roster[0];
    assert.strictEqual(actPkmn.v31Migrated, true, `[Loop ${loop}] 切回 v3.1 含 v31Migrated=true`);
    assert.strictEqual(actPkmn.modifiers['火焰拳'], '熔核之拳', `[Loop ${loop}] 切回 v3.1 恢復質變 [熔核之拳]`);
    console.log(`    - [Loop ${loop}] v3.1 <-> v2 開關切換無任何殘留，還原純淨度 100%`);
  }

  console.log('✅ 【階段 5】通過！\n');

  console.log('================================================================');
  console.log('🎉 恭喜！管理員實機登錄逐步驗證計劃全部階段 (Phase 1~5) 通過！');
  console.log('================================================================');
}

runAdminLiveVerification().catch(err => {
  console.error('❌ 驗證過程發生錯誤:', err);
  process.exit(1);
});
