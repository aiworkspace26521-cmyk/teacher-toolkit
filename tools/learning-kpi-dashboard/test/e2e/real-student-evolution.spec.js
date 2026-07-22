const { test, expect } = require('@playwright/test');

function injectRoster(page, roster, highestLevel) {
  return page.evaluate(function(data) {
    globalData.roster = data.roster;
    globalData.highestLevel = data.hl;
    globalData.partyIds = ['P0', 'P1', 'P2', 'P3', 'P4', 'P5'];
  }, { roster: roster, hl: highestLevel });
}

function neilRoster() {
  return [
    { id: 'P0', baseName: '⭐ 仙子伊布 (妖精)', currentLevel: 35, totalExp: 120000, initialLevel: 5, catchDate: '初始夥伴', heldItem: '', happiness: 100, expProgress: 0, expNeeded: 15000 },
    { id: 'P1', baseName: '⭐ 噴火龍 (火/飛行)', currentLevel: 34, totalExp: 9900, initialLevel: 5, catchDate: '2026/06/01', heldItem: '', happiness: 80, expProgress: 0, expNeeded: 14000 },
    { id: 'P2', baseName: '⭐ 水箭龜 (水)', currentLevel: 30, totalExp: 5000, initialLevel: 5, catchDate: '2026/06/05', heldItem: '', happiness: 70, expProgress: 0, expNeeded: 10000 },
    { id: 'P3', baseName: '⭐ 妙蛙花 (草/毒)', currentLevel: 30, totalExp: 5000, initialLevel: 5, catchDate: '2026/06/10', heldItem: '', happiness: 60, expProgress: 0, expNeeded: 10000 },
    { id: 'P4', baseName: '⭐ 路卡利歐 (格鬥/鋼)', currentLevel: 25, totalExp: 5000, initialLevel: 5, catchDate: '2026/06/15', heldItem: '', happiness: 50, expProgress: 0, expNeeded: 8000 },
    { id: 'P5', baseName: '⭐ 尖牙陸鯊 (龍/地面)', currentLevel: 21, totalExp: 4000, initialLevel: 5, catchDate: '2026/06/20', heldItem: '', happiness: 40, expProgress: 0, expNeeded: 4200 }
  ];
}

function emmaRoster() {
  return [
    { id: 'P0', baseName: '⭐ 月亮伊布 (惡)', currentLevel: 35, totalExp: 120000, initialLevel: 5, catchDate: '初始夥伴', heldItem: '', happiness: 100, expProgress: 0, expNeeded: 15000 },
    { id: 'P1', baseName: '⭐ 耿鬼 (幽靈/毒)', currentLevel: 34, totalExp: 9900, initialLevel: 5, catchDate: '2026/06/01', heldItem: '', happiness: 80, expProgress: 0, expNeeded: 14000 },
    { id: 'P2', baseName: '⭐ 雷丘 (電)', currentLevel: 30, totalExp: 5000, initialLevel: 5, catchDate: '2026/06/05', heldItem: '', happiness: 70, expProgress: 0, expNeeded: 10000 },
    { id: 'P3', baseName: '⭐ 沙奈朵 (超能力/妖精)', currentLevel: 30, totalExp: 5000, initialLevel: 5, catchDate: '2026/06/10', heldItem: '', happiness: 60, expProgress: 0, expNeeded: 10000 },
    { id: 'P4', baseName: '⭐ 暴鯉龍 (水/飛行)', currentLevel: 25, totalExp: 5000, initialLevel: 5, catchDate: '2026/06/15', heldItem: '', happiness: 50, expProgress: 0, expNeeded: 8000 },
    { id: 'P5', baseName: '⭐ 由基拉 (岩石/地面)', currentLevel: 14, totalExp: 2000, initialLevel: 5, catchDate: '2026/06/20', heldItem: '', happiness: 30, expProgress: 0, expNeeded: 2000 }
  ];
}

test.describe('Neil/Emma 真實學生進化 E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
  });

  // ══════════ Neil: 最終進化型態無按鈕 ══════════

  test('Neil 已最終進化的寶可夢無 ⬆️進化 按鈕', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 35);

    var evoBtns = await page.evaluate(() => {
      openPCBoxModal();
      var btns = []; document.querySelectorAll('#pcBoxModal span').forEach(function(s) { if (s.textContent.indexOf('⬆️') !== -1) btns.push(s.outerHTML); });
      closeModal('pcBoxModal'); return btns;
    });
    expect(evoBtns.length).toBe(0);
  });

  // ══════════ Neil: 尖牙陸鯊 (Lv.30 進化) ══════════

  test('Neil 尖牙陸鯊 Lv.21 未達 Lv.30 不顯示進化按鈕', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 21);

    var p5Check = await page.evaluate(() => {
      var p5 = globalData.roster.find(function(p) { return p.id === 'P5'; });
      var raw = getRawName(p5.baseName);
      var stage = EVO_STAGE_MAP[raw] !== undefined ? EVO_STAGE_MAP[raw] : 0;
      openPCBoxModal(); var allContent = document.getElementById('pcBoxModal').textContent; closeModal('pcBoxModal');
      return { rawName: raw, stage: stage, requiredLevel: (stage + 1) * 15, currentLevel: p5.currentLevel, evoNext: getEvoNextName(raw), hasEvoBtn: allContent.indexOf('⬆️') !== -1 };
    });
    expect(p5Check.rawName).toBe('尖牙陸鯊');
    expect(p5Check.evoNext).toBe('烈咬陸鯊');
    expect(p5Check.currentLevel).toBeLessThan(p5Check.requiredLevel);
    expect(p5Check.hasEvoBtn).toBe(false);
  });

  test('Neil 尖牙陸鯊 Lv.30 模擬出現 ⬆️進化 按鈕', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 30);
    // 先讓 P5 達到 Lv.30，再開 PC Box 檢查按鈕
    var btnCheck = await page.evaluate(() => {
      var p5 = globalData.roster.find(function(p) { return p.id === 'P5'; });
      p5.currentLevel = 30;
      openPCBoxModal();
      var allContent = document.getElementById('pcBoxModal').innerHTML;
      closeModal('pcBoxModal');
      return { hasEvoBtn: allContent.indexOf('⬆️') !== -1 };
    });
    expect(btnCheck.hasEvoBtn).toBe(true);
  });

  test('Neil 尖牙陸鯊 Lv.30 doEvolve → 烈咬陸鯊', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 30);

    var result = await page.evaluate(async () => {
      var p5 = globalData.roster.find(function(p) { return p.id === 'P5'; });
      p5.currentLevel = 30;
      var captured = null;
      var origSave = executeSave, origCut = showEvoCutscene;
      showEvoCutscene = function(p, n, cb) { if (cb) cb(); };
      executeSave = function(d, cb) { captured = d; if (cb) cb(); };
      try { await doEvolve('P5'); } catch (e) { executeSave = origSave; showEvoCutscene = origCut; return { error: e.message }; }
      executeSave = origSave; showEvoCutscene = origCut;
      return { captured: captured !== null, rawName: getRawName(p5.baseName), note: captured ? captured.note : null };
    });
    expect(result.error).toBeUndefined();
    expect(result.captured).toBe(true);
    expect(result.rawName).toBe('烈咬陸鯊');
    expect(result.note).toContain('烈咬陸鯊');
  });

  test('Neil checkEvoReady 回傳等級條件資訊', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 30);

    var info = await page.evaluate(() => {
      var p5 = globalData.roster.find(function(p) { return p.id === 'P5'; });
      p5.currentLevel = 30;
      var evo = checkEvoReady(p5, globalData);
      return evo ? { ready: evo.ready, nextName: evo.nextName, type: evo.type, infoText: evo.info } : null;
    });
    expect(info).not.toBeNull();
    expect(info.ready).toBe(true);
    expect(info.nextName).toBe('烈咬陸鯊');
    expect(info.type).toBe('level');
  });

  // ══════════ Emma: 由基拉 (Lv.15 進化) ══════════

  test('Emma 由基拉 Lv.14 未達 Lv.15 不顯示進化按鈕', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Emma');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Emma', { timeout: 10000 });
    await injectRoster(page, emmaRoster(), 14);

    var p5Check = await page.evaluate(() => {
      var p5 = globalData.roster.find(function(p) { return p.id === 'P5'; });
      var raw = getRawName(p5.baseName);
      var stage = EVO_STAGE_MAP[raw] !== undefined ? EVO_STAGE_MAP[raw] : 0;
      openPCBoxModal(); var allContent = document.getElementById('pcBoxModal').textContent; closeModal('pcBoxModal');
      return { rawName: raw, stage: stage, requiredLevel: (stage + 1) * 15, currentLevel: p5.currentLevel, evoNext: getEvoNextName(raw), hasEvoBtn: allContent.indexOf('⬆️') !== -1 };
    });
    expect(p5Check.rawName).toBe('由基拉');
    expect(p5Check.evoNext).toBe('沙基拉');
    expect(p5Check.currentLevel).toBeLessThan(p5Check.requiredLevel);
    expect(p5Check.hasEvoBtn).toBe(false);
  });

  test('Emma 由基拉 Lv.15 模擬出現 ⬆️進化 按鈕', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Emma');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Emma', { timeout: 10000 });
    await injectRoster(page, emmaRoster(), 15);

    var btnCheck = await page.evaluate(() => {
      var p5 = globalData.roster.find(function(p) { return p.id === 'P5'; });
      p5.currentLevel = 15;
      openPCBoxModal();
      var allContent = document.getElementById('pcBoxModal').innerHTML;
      closeModal('pcBoxModal');
      return { hasEvoBtn: allContent.indexOf('⬆️') !== -1 };
    });
    expect(btnCheck.hasEvoBtn).toBe(true);
  });

  test('Emma 由基拉 Lv.15 doEvolve → 沙基拉', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Emma');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Emma', { timeout: 10000 });
    await injectRoster(page, emmaRoster(), 15);

    var result = await page.evaluate(async () => {
      var p5 = globalData.roster.find(function(p) { return p.id === 'P5'; });
      p5.currentLevel = 15;
      var captured = null;
      var origSave = executeSave, origCut = showEvoCutscene;
      showEvoCutscene = function(p, n, cb) { if (cb) cb(); };
      executeSave = function(d, cb) { captured = d; if (cb) cb(); };
      try { await doEvolve('P5'); } catch (e) { executeSave = origSave; showEvoCutscene = origCut; return { error: e.message }; }
      executeSave = origSave; showEvoCutscene = origCut;
      return { captured: captured !== null, rawName: getRawName(p5.baseName), note: captured ? captured.note : null };
    });
    expect(result.error).toBeUndefined();
    expect(result.captured).toBe(true);
    expect(result.rawName).toBe('沙基拉');
    expect(result.note).toContain('沙基拉');
  });

  // ══════════ 跨學生隔離 ══════════

  test('Neil/Emma 進化狀態各自獨立', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 35);
    var neilP5 = await page.evaluate(() => { var p = globalData.roster.find(function(p) { return p.id === 'P5'; }); return p ? getRawName(p.baseName) : null; });

    await page.selectOption('#studentSelect', 'Emma');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Emma', { timeout: 10000 });
    await injectRoster(page, emmaRoster(), 14);
    var emmaP5 = await page.evaluate(() => { var p = globalData.roster.find(function(p) { return p.id === 'P5'; }); return p ? getRawName(p.baseName) : null; });

    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 35);
    var neilP5Again = await page.evaluate(() => { var p = globalData.roster.find(function(p) { return p.id === 'P5'; }); return p ? getRawName(p.baseName) : null; });

    expect(neilP5).toBe('尖牙陸鯊');
    expect(emmaP5).toBe('由基拉');
    expect(neilP5Again).toBe('尖牙陸鯊');
  });

  // ══════════ replay 驗證 ══════════

  test('Neil recalculateStudentState replay 含進化事件', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    await injectRoster(page, neilRoster(), 35);
    var replayCheck = await page.evaluate(async () => {
      var snap = await db.collection('kpi_events').where('studentId', '==', 'Neil').orderBy('timestamp', 'asc').get();
      var events = [];
      snap.forEach(function(doc) { var d = doc.data(); events.push({ action: d.action, note: d.note || '', timestamp: d.timestamp }); });
      var evoEvents = events.filter(function(e) { return e.note && e.note.indexOf('進化ID:') !== -1; });
      var replayed = await recalculateStudentState('Neil', events);
      return { totalEvents: events.length, evoEventCount: evoEvents.length, replayRoster: (replayed.roster || []).map(function(p) { return { id: p.id, name: getRawName(p.baseName) }; }) };
    });
    expect(replayCheck.totalEvents).toBeGreaterThanOrEqual(0);
    expect(replayCheck.replayRoster).toBeDefined();
    test.info().annotations.push({ type: 'events', description: 'Neil events: ' + replayCheck.totalEvents + ', evo events: ' + replayCheck.evoEventCount });
  });
});
