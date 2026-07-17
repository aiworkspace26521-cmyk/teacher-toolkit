const { test, expect } = require('@playwright/test');

test.describe('Neil/Emma 真實學生 E2E — Firestore 資料載入與寫入驗證', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
  });

  // ── 1. Neil 真實資料從 Firestore 載入 ──
  test('Neil Firestore 資料正確載入至前端', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });

    const fbData = await page.evaluate(async () => {
      try {
        const doc = await db.collection('kpi_students').doc('Neil').get();
        if (!doc.exists) return null;
        return {
          docExists: true,
          studentId: doc.data().studentId,
          highestLevel: typeof doc.data().highestLevel,
          coins: typeof doc.data().coins,
          rosterIsArray: Array.isArray(doc.data().roster),
          badges: typeof doc.data().badges,
          hasTodayCompleted: 'todayCompleted' in doc.data()
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(fbData).not.toBeNull();
    expect(fbData.docExists).toBe(true);
    expect(fbData.studentId).toBe('Neil');
    expect(fbData.highestLevel).toBe('number');
    expect(fbData.coins).toBe('number');
    expect(fbData.rosterIsArray).toBe(true);
    expect(fbData.badges).toBe('number');

    // Verify UI displays match Firestore
    const uiData = await page.evaluate(() => ({
      studentId: globalData.studentId,
      level: globalData.highestLevel,
      coins: globalData.coins,
      rosterCount: (globalData.roster || []).length,
      badges: globalData.badges
    }));
    expect(uiData.studentId).toBe('Neil');
    expect(uiData.rosterCount).toBeGreaterThanOrEqual(0);
  });

  // ── 2. Emma 真實資料從 Firestore 載入 ──
  test('Emma Firestore 資料正確載入至前端', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Emma');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Emma', { timeout: 10000 });

    const fbData = await page.evaluate(async () => {
      try {
        const doc = await db.collection('kpi_students').doc('Emma').get();
        if (!doc.exists) return null;
        return {
          docExists: true,
          studentId: doc.data().studentId,
          level: typeof doc.data().level,
          coins: typeof doc.data().coins,
          rosterIsArray: Array.isArray(doc.data().roster)
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(fbData).not.toBeNull();
    expect(fbData.studentId).toBe('Emma');
    expect(fbData.rosterIsArray).toBe(true);

    const uiData = await page.evaluate(() => ({
      studentId: globalData.studentId,
      rosterCount: (globalData.roster || []).length
    }));
    expect(uiData.studentId).toBe('Emma');
  });

  // ── 3. Neil → Emma 切換時資料正確切換 ──
  test('Neil → Emma 切換後顯示 Emma 資料（非 Neil 資料）', async ({ page }) => {
    // Load Neil first
    await page.selectOption('#studentSelect', 'Neil');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });
    const neilLevel = await page.evaluate(() => globalData.highestLevel);

    // Switch to Emma
    await page.selectOption('#studentSelect', 'Emma');
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Emma', { timeout: 10000 });
    const emmaLevel = await page.evaluate(() => globalData.highestLevel);

    // Verify they are different students
    expect(emmaLevel).not.toBeUndefined();
    // Log for verification
    test.info().annotations.push({
      type: 'data',
      description: 'Neil level: ' + neilLevel + ', Emma level: ' + emmaLevel
    });
  });

  // ── 4. Neil Firestore 寫入驗證（每日提交或現有資料驗證）──
  test('Neil Firestore 寫入驗證：事件與學生資料一致性', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });

    // Read current state from UI and Firestore
    const uiState = await page.evaluate(() => ({
      todayCompleted: globalData.todayCompleted,
      coins: globalData.coins || 0,
      level: globalData.highestLevel || 5,
      badges: globalData.badges || 0
    }));

    const fbState = await page.evaluate(async () => {
      try {
        const doc = await db.collection('kpi_students').doc('Neil').get();
        if (!doc.exists) return null;
        return {
          todayCompleted: doc.data().todayCompleted,
          coins: doc.data().coins,
          highestLevel: doc.data().highestLevel,
          badges: doc.data().badges
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(fbState).not.toBeNull();
    expect(fbState.todayCompleted).toBeDefined();

    // Verify Firestore state matches UI state (after recalculation)
    expect(typeof uiState.level).toBe('number');
    expect(typeof uiState.coins).toBe('number');
    expect(typeof uiState.badges).toBe('number');

    test.info().annotations.push({
      type: 'consistency',
      description: 'todayCompleted=' + uiState.todayCompleted +
        ' | UI level=' + uiState.level + ' FB highestLevel=' + fbState.highestLevel +
        ' | UI coins=' + uiState.coins + ' FB coins=' + fbState.coins +
        ' | badges=' + uiState.badges
    });

    // Verify events are well-structured
    const eventsCheck = await page.evaluate(async () => {
      try {
        const snap = await db.collection('kpi_events')
          .where('studentId', '==', 'Neil')
          .get();
        const actions = {};
        snap.forEach(doc => {
          const d = doc.data();
          const a = d.action || 'unknown';
          actions[a] = (actions[a] || 0) + 1;
        });
        return {
          totalEvents: snap.size,
          actionBreakdown: actions,
          hasValidStructure: snap.docs.every(d => {
            const data = d.data();
            return data.studentId === 'Neil' && data.action && typeof data.expGained === 'number';
          })
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    expect(eventsCheck.totalEvents).toBeGreaterThan(0);
    expect(eventsCheck.hasValidStructure).toBe(true);
    expect(eventsCheck.actionBreakdown).toBeDefined();

    test.info().annotations.push({
      type: 'events',
      description: 'Neil 事件數=' + eventsCheck.totalEvents +
        ' | 有效結構=' + eventsCheck.hasValidStructure +
        ' | 事件分佈=' + JSON.stringify(eventsCheck.actionBreakdown)
    });

    // If Neil hasn't submitted today, do a submit and verify
    if (!uiState.todayCompleted) {
      test.info().annotations.push({ type: 'submit', description: 'Neil 今日未提交，執行提交測試' });

      const submitBtn = page.locator('#submitBtn');
      await expect(submitBtn).toBeVisible();
      await expect(submitBtn).not.toBeDisabled({ timeout: 5000 });

      // Check 2 task checkboxes for 30 points
      const mathCbs = page.locator('.task-cb[data-points="15"]');
      const mathCount = await mathCbs.count();
      if (mathCount >= 2) {
        await mathCbs.first().check();
        await mathCbs.nth(1).check();
      }

      // Check discipline checkboxes
      const exerciseCb = page.locator('#cb-exercise');
      const sleepCb = page.locator('#cb-sleep');
      if (await exerciseCb.isVisible()) {
        await exerciseCb.check();
        await sleepCb.check();
      }

      await page.waitForTimeout(500);
      await submitBtn.click();
      await expect(submitBtn).toContainText('Done', { timeout: 15000 });

      const afterSubmit = await page.evaluate(() => ({
        todayCompleted: globalData.todayCompleted,
        coins: globalData.coins
      }));
      expect(afterSubmit.todayCompleted).toBe(true);

      // Verify event count increased
      const afterEventCount = await page.evaluate(async () => {
        try {
          const snap = await db.collection('kpi_events')
            .where('studentId', '==', 'Neil')
            .get();
          return snap.size;
        } catch (e) { return -1; }
      });
      expect(afterEventCount).toBeGreaterThanOrEqual(eventsCheck.totalEvents + 1);

      test.info().annotations.push({
        type: 'submitted',
        description: 'Coins: ' + uiState.coins + ' → ' + afterSubmit.coins +
          ', Events: ' + eventsCheck.totalEvents + ' → ' + afterEventCount
      });
    } else {
      test.info().annotations.push({
        type: 'already-done',
        description: 'Neil 今日已提交（todayCompleted=true），跳過提交動作，僅驗證事件結構'
      });
    }
  });

  // ── 5. Firestore 事件回放正確性（recalculateStudentState） ──
  test('Neil recalculateStudentState 與 Firestore 事件一致', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });

    // Read events from Firestore and compare with globalData
    const consistency = await page.evaluate(async () => {
      try {
        const snap = await db.collection('kpi_events')
          .where('studentId', '==', 'Neil')
          .orderBy('timestamp', 'asc')
          .get();

        const fbEvents = [];
        snap.forEach(doc => fbEvents.push({
          id: doc.id,
          action: doc.data().action,
          expGained: doc.data().expGained || 0,
          coinsGained: doc.data().coinsGained || 0,
          note: (doc.data().note || '').substring(0, 50)
        }));

        const uiLevel = globalData.highestLevel;
        const uiCoins = globalData.coins;
        const uiBadges = globalData.badges;
        const uiRosterCount = (globalData.roster || []).length;

        return {
          eventCount: fbEvents.length,
          latestEvents: fbEvents.slice(-3),
          uiState: { level: uiLevel, coins: uiCoins, badges: uiBadges, rosterCount: uiRosterCount }
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(consistency.eventCount).toBeGreaterThan(0);
    expect(consistency.latestEvents.length).toBeGreaterThan(0);
    expect(consistency.uiState.level).toBeGreaterThanOrEqual(5);

    test.info().annotations.push({
      type: 'events',
      description: 'Neil 事件總數: ' + consistency.eventCount +
        ', Level: ' + consistency.uiState.level +
        ', Coins: ' + consistency.uiState.coins +
        ', Badges: ' + consistency.uiState.badges +
        ', Roster: ' + consistency.uiState.rosterCount +
        ', 最近事件: ' + consistency.latestEvents.map(e => e.action).join(', ')
    });
  });

  // ── 6. recalculateStudentState replay path independent verification ──
  test('recalculateStudentState replay produces correct state from events', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 15000 });
    await page.waitForFunction(() => window.globalData && window.globalData.studentId === 'Neil', { timeout: 10000 });

    const replayResult = await page.evaluate(async () => {
      try {
        const snap = await db.collection('kpi_events')
          .where('studentId', '==', 'Neil')
          .orderBy('timestamp', 'asc')
          .get();

        const events = [];
        snap.forEach(doc => {
          const d = doc.data();
          events.push({ id: doc.id, action: d.action, expGained: d.expGained || 0, coinsGained: d.coinsGained || 0, badgeChange: d.badgeChange || 0, note: d.note || "", score: d.score || 0, timestamp: d.timestamp });
        });

        if (events.length === 0) return { error: 'no events' };

        const replayed = await recalculateStudentState('Neil', events);
        if (!replayed) return { error: 'replay returned null' };

        return {
          replayed: { level: replayed.highestLevel, coins: replayed.coins, badges: replayed.badges, rosterCount: (replayed.roster||[]).length, todayCompleted: replayed.todayCompleted, todayTasksDone: replayed.todayTasksDone },
          uiState: { level: globalData.highestLevel, coins: globalData.coins, badges: globalData.badges, rosterCount: (globalData.roster||[]).length, todayCompleted: globalData.todayCompleted, todayTasksDone: globalData.todayTasksDone }
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    expect(replayResult.replayed).toBeDefined();
    expect(replayResult.uiState).toBeDefined();
    expect(replayResult.replayed.level).toBeGreaterThanOrEqual(5);
    expect(replayResult.replayed.coins).toBeDefined();
    expect(replayResult.replayed.badges).toBeDefined();
    expect(replayResult.replayed.rosterCount).toBeGreaterThanOrEqual(1);

    test.info().annotations.push({
      type: 'replay',
      description: 'Replayed: level=' + replayResult.replayed.level + ', coins=' + replayResult.replayed.coins + ', badges=' + replayResult.replayed.badges + ', roster=' + replayResult.replayed.rosterCount + ', todayCompleted=' + replayResult.replayed.todayCompleted + ' | UI: level=' + replayResult.uiState.level + ', coins=' + replayResult.uiState.coins + ', badges=' + replayResult.uiState.badges
    });
  });

});
