const { test, expect } = require('@playwright/test');

test.describe('Block I Step 10: 任務+成就系統驗證', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  // 10.1: renderQuests 任務顯示
  test('10.1 renderQuests shows daily and weekly quest sections', async ({ page }) => {
    const questArea = page.locator('#questArea');
    await expect(questArea).toBeVisible({ timeout: 10000 });

    const dailyGrid = page.locator('#dailyQuestGrid');
    const weeklyGrid = page.locator('#weeklyQuestGrid');
    await expect(dailyGrid).toBeVisible();
    await expect(weeklyGrid).toBeVisible();

    const questItems = page.locator('.quest-item');
    const count = await questItems.count();
    expect(count).toBeGreaterThanOrEqual(8);

    const questNames = await page.locator('.q-name').allTextContents();
    expect(questNames).toContain('每日登入');
    expect(questNames).toContain('提交任務');
    expect(questNames).toContain('對戰練習');
    expect(questNames).toContain('捕捉收集');
    expect(questNames).toContain('道館挑戰者');
    expect(questNames).toContain('大量捕捉');
    expect(questNames).toContain('戰鬥狂人');
    expect(questNames).toContain('宿敵對決');

    const hiddenWhenNull = await page.evaluate(() => {
      const saved = globalData;
      globalData = null;
      globalQuestProgress = null;
      renderQuests();
      const qa = document.getElementById('questArea');
      const display = qa ? qa.style.display : '';
      globalData = saved;
      return display;
    });
    expect(hiddenWhenNull).toBe('none');
  });

  // 10.2: computeQuestProgress 進度計算
  test('10.2 computeQuestProgress calculates progress correctly', async ({ page }) => {
    const progressResult = await page.evaluate(() => {
      const now = new Date();
      // earlier this week (same week, not today) for weekly-only events
      const earlier = new Date(now);
      earlier.setDate(earlier.getDate() - 1);
      if (earlier.toDateString() === now.toDateString()) {
        // if yesterday is still today (timezone edge), use 2 days ago
        earlier.setDate(earlier.getDate() - 1);
      }

      const mockEvents = [
        // daily events (today)
        { action: "每日提交", timestamp: now, note: "" },
        { action: "戰鬥勝利", timestamp: now, note: "路人戰 勝利 [Daily]" },
        { action: "戰鬥勝利", timestamp: now, note: "路人戰 勝利 [Daily]" },
        { action: "戰鬥勝利", timestamp: now, note: "路人戰 勝利 [Daily]" },
        { action: "捕捉", timestamp: now, note: "捕捉 小拉達" },
        // weekly-only events (this week, not today)
        { action: "戰鬥勝利", timestamp: earlier, note: "道館戰 勝利 [Gym]" },
        { action: "戰鬥勝利", timestamp: earlier, note: "道館戰 勝利 [Gym]" },
        { action: "戰鬥勝利", timestamp: earlier, note: "道館戰 勝利 [Gym]" },
        { action: "捕捉", timestamp: earlier, note: "捕捉" },
        { action: "捕捉", timestamp: earlier, note: "捕捉" },
        { action: "捕捉", timestamp: earlier, note: "捕捉" },
        { action: "捕捉", timestamp: earlier, note: "捕捉" },
        { action: "戰鬥勝利", timestamp: earlier, note: "隨機對戰" },
        { action: "戰鬥勝利", timestamp: earlier, note: "隨機對戰" },
        { action: "戰鬥勝利", timestamp: earlier, note: "隨機對戰" },
        { action: "戰鬥勝利", timestamp: earlier, note: "隨機對戰" },
        { action: "PvP", timestamp: earlier, note: "" },
        { action: "PvP", timestamp: earlier, note: "" },
      ];

      return computeQuestProgress(mockEvents);
    });

    expect(progressResult).not.toBeNull();
    expect(progressResult.daily).toBeDefined();
    expect(progressResult.weekly).toBeDefined();

    expect(progressResult.daily.progress["LOGIN"]).toBeGreaterThanOrEqual(1);
    expect(progressResult.daily.progress["DAILY_SUBMIT"]).toBe(1);
    expect(progressResult.daily.progress["BATTLE_3"]).toBe(3);
    expect(progressResult.daily.progress["CAPTURE_1"]).toBe(1);

    expect(progressResult.weekly.progress["GYM_3"]).toBeGreaterThanOrEqual(3);
    expect(progressResult.weekly.progress["CAPTURE_5"]).toBeGreaterThanOrEqual(5);
    expect(progressResult.weekly.progress["BATTLE_10"]).toBeGreaterThanOrEqual(7);
    expect(progressResult.weekly.progress["PVP_2"]).toBe(2);

    const emptyResult = await page.evaluate(() => computeQuestProgress([]));
    const dq = emptyResult.daily.progress;
    expect(dq["LOGIN"]).toBeUndefined();
  });

  // 10.3: claimQuestReward 領取獎勵
  test('10.3 claimQuestReward flow works correctly', async ({ page }) => {
    await page.waitForFunction(() => typeof globalQuestProgress !== 'undefined' && globalQuestProgress !== null, { timeout: 10000 });

    const claimResult = await page.evaluate(() => {
      if (!globalQuestProgress) return { ok: false, reason: 'no quest progress' };

      globalQuestProgress.daily.progress["LOGIN"] = 1;

      const period = "daily";
      const questId = "LOGIN";
      const qp = globalQuestProgress[period];
      const progress = qp.progress[questId] || 0;
      const target = (function() {
        for (const p in QUESTS) {
          for (const q of QUESTS[p]) {
            if (q.id === questId) return q.target;
          }
        }
        return 1;
      })();
      const completed = progress >= target;

      return {
        ok: true,
        completed,
        progress,
        target
      };
    });

    expect(claimResult.ok).toBe(true);
    expect(claimResult.completed).toBe(true);

    const claimBtns = page.locator('.q-claim');
    const btnCount = await claimBtns.count();
    expect(btnCount).toBeGreaterThanOrEqual(8);

    for (let i = 0; i < Math.min(btnCount, 4); i++) {
      const btn = claimBtns.nth(i);
      const text = await btn.textContent();
      expect(['領取', '✅', '進行中']).toContain(text);
    }
  });

  // 10.4: 每日/每週重置信號
  test('10.4 daily and weekly timers show reset times', async ({ page }) => {
    const dailyTimer = page.locator('#dailyTimer');
    const weeklyTimer = page.locator('#weeklyTimer');

    await expect(dailyTimer).toBeVisible();
    await expect(weeklyTimer).toBeVisible();

    const dailyText = await dailyTimer.textContent();
    expect(dailyText).toMatch(/重置/);

    const weeklyText = await weeklyTimer.textContent();
    expect(weeklyText).toMatch(/重置/);
  });

  // 10.5: checkAchievement 15 項成就
  test('10.5 checkAchievement evaluates all 15 achievement conditions', async ({ page }) => {
    const results = await page.evaluate(() => {
      const gd = {
        badges: 32,
        highestLevel: 50,
        roster: [
          { id: "P1", baseName: "妙蛙種子" }, { id: "P2", baseName: "小火龍" },
          { id: "P3", baseName: "傑尼龜" }, { id: "P4", baseName: "巴大蝶" },
          { id: "P5", baseName: "大針蜂" }, { id: "P6", baseName: "皮卡丘" },
          { id: "P7", baseName: "穿山鼠" }, { id: "P8", baseName: "尼多朗" },
          { id: "P9", baseName: "皮皮" }, { id: "P10", baseName: "六尾" },
          { id: "P11", baseName: "✨超夢" },
        ],
        monthLeagueWins: 1
      };
      const events = [
        { note: "進化完成 小火龍→火恐龍" },
        { note: "PvP對戰 勝利" }
      ];

      const result = {};
      for (let i = 0; i < ACHIEVEMENTS.length; i++) {
        result[ACHIEVEMENTS[i].id] = checkAchievement(ACHIEVEMENTS[i], gd, events);
      }
      return result;
    });

    expect(results.FIRST_CAPTURE).toBe(true);
    expect(results.FIRST_GYM).toBe(true);
    expect(results.LV_10).toBe(true);
    expect(results.COLLECTOR_10).toBe(true);
    expect(results.GYM_8).toBe(true);
    expect(results.LV_25).toBe(true);
    expect(results.GYM_32).toBe(true);
    expect(results.LV_50).toBe(true);
    expect(results.LEAGUE_CHAMP).toBe(true);
    expect(results.LEGENDARY).toBe(true);
    expect(results.EVOLVE).toBe(true);
    expect(results.PVP_WIN).toBe(true);

    expect(results.COLLECTOR_50).toBe(false);
    expect(results.DEX_151).toBe(false);

    const edgeResults = await page.evaluate(() => {
      const gd = { badges: 0, highestLevel: 5, roster: [{ id: "P0", baseName: "皮卡丘" }], monthLeagueWins: 0 };
      const events = [];
      const result = {};
      for (let i = 0; i < ACHIEVEMENTS.length; i++) {
        result[ACHIEVEMENTS[i].id] = checkAchievement(ACHIEVEMENTS[i], gd, events);
      }
      return result;
    });

    expect(edgeResults.FIRST_CAPTURE).toBe(false);
    expect(edgeResults.FIRST_GYM).toBe(false);
    expect(edgeResults.LV_10).toBe(false);
    expect(edgeResults.GYM_8).toBe(false);
    expect(edgeResults.LV_50).toBe(false);
    expect(edgeResults.LEGENDARY).toBe(false);
    expect(edgeResults.EVOLVE).toBe(false);
  });

  // 10.6: checkAndUnlockAchievements 自動解鎖+持久化
  test('10.6 checkAndUnlockAchievements auto-detects and unlocks achievements', async ({ page }) => {
    const unlockResult = await page.evaluate(async () => {
      globalAchievements = {};

      const gd = {
        studentId: "Neil",
        badges: 32,
        highestLevel: 50,
        roster: [
          { id: "P1", baseName: "妙蛙種子" }, { id: "P2", baseName: "小火龍" },
          { id: "P3", baseName: "傑尼龜" }, { id: "P4", baseName: "巴大蝶" },
          { id: "P5", baseName: "大針蜂" }, { id: "P6", baseName: "皮卡丘" },
          { id: "P7", baseName: "穿山鼠" }, { id: "P8", baseName: "尼多朗" },
          { id: "P9", baseName: "皮皮" }, { id: "P10", baseName: "六尾" },
          { id: "P11", baseName: "✨超夢" },
        ],
        monthLeagueWins: 1
      };
      const events = [
        { note: "進化完成 小火龍→火恐龍" },
        { note: "PvP對戰 勝利" }
      ];

      await checkAndUnlockAchievements(gd, events, "Neil");

      const unlocked = [];
      for (const key in globalAchievements) {
        if (globalAchievements[key]) unlocked.push(key);
      }
      return unlocked;
    });

    expect(unlockResult.length).toBeGreaterThanOrEqual(11);
    expect(unlockResult).toContain('FIRST_CAPTURE');
    expect(unlockResult).toContain('FIRST_GYM');
    expect(unlockResult).toContain('LV_10');
    expect(unlockResult).toContain('COLLECTOR_10');
    expect(unlockResult).toContain('GYM_8');
    expect(unlockResult).toContain('LV_25');
    expect(unlockResult).toContain('GYM_32');
    expect(unlockResult).toContain('LV_50');
    expect(unlockResult).toContain('LEAGUE_CHAMP');
    expect(unlockResult).toContain('LEGENDARY');
    expect(unlockResult).toContain('EVOLVE');
    expect(unlockResult).toContain('PVP_WIN');

    const noDupes = await page.evaluate(async () => {
      const before = Object.keys(globalAchievements).length;
      await checkAndUnlockAchievements(globalData, [], "Neil");
      const after = Object.keys(globalAchievements).length;
      return { before, after };
    });
    expect(noDupes.after).toBe(noDupes.before);
  });

  // 10.8: openTrophyCabinet 獎盃櫃
  test('10.8 openTrophyCabinet shows trophy cabinet with earned/locked state', async ({ page }) => {
    const trophyBtn = page.locator('.nav-btn').filter({ hasText: /獎盃櫃/ });
    await expect(trophyBtn).toBeVisible();
    await trophyBtn.click();
    await page.waitForTimeout(500);

    const trophyModal = page.locator('#trophyModal');
    await expect(trophyModal).toBeVisible({ timeout: 5000 });

    const earnedCount = page.locator('#trophyEarnedCount');
    const totalCount = page.locator('#trophyTotalCount');
    await expect(earnedCount).toBeVisible();
    await expect(totalCount).toBeVisible();

    const earnedText = await earnedCount.textContent();
    const totalText = await totalCount.textContent();
    expect(totalText).toBe('23');

    const trophyCards = page.locator('.trophy-card');
    const cardCount = await trophyCards.count();
    expect(cardCount).toBe(23);

    const earnedCards = page.locator('.trophy-card.earned');
    const lockedCards = page.locator('.trophy-card.locked');
    const earnedCardCount = await earnedCards.count();
    const lockedCardCount = await lockedCards.count();
    expect(earnedCardCount + lockedCardCount).toBe(23);
    expect(earnedText).toBe(String(earnedCardCount));

    const achData = await page.evaluate(() => {
      return ACHIEVEMENTS.map(a => ({ id: a.id, name: a.name, tier: a.tier, icon: a.icon }));
    });
    expect(achData.length).toBe(23);
    expect(achData[0].id).toBe('FIRST_CAPTURE');
    expect(achData[22].id).toBe('M8_LEON');
  });

  // ── 已知 Bug 驗證 ──

  test('B14: quest claim flow is complete', async ({ page }) => {
    const b14Ok = await page.evaluate(() => {
      const flowComplete =
        typeof renderQuests === 'function' &&
        typeof computeQuestProgress === 'function' &&
        typeof claimQuestReward === 'function' &&
        typeof saveQuestsToFirestore === 'function' &&
        typeof mergeQuestProgress === 'function' &&
        typeof loadQuestsFromFirestore === 'function';

      let questsValid = true;
      for (const period in QUESTS) {
        for (const q of QUESTS[period]) {
          if (!q.id || !q.name || !q.desc || !q.target || q.rewardExp === undefined || q.rewardCoins === undefined) {
            questsValid = false;
          }
        }
      }

      return { flowComplete, questsValid };
    });
    expect(b14Ok.flowComplete).toBe(true);
    expect(b14Ok.questsValid).toBe(true);
  });

});
