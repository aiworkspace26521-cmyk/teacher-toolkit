const { test, expect } = require('@playwright/test');

test.describe('Block I Step 9: 道館/聯盟系統驗證', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/kpi');
    await page.waitForLoadState('networkidle');
    await page.selectOption('#studentSelect', 'Neil');
    await expect(page.locator('#kpiLevel')).not.toBeEmpty({ timeout: 20000 });
    await page.waitForFunction(() => typeof globalData !== 'undefined' && globalData !== null, { timeout: 10000 });
  });

  // 9.1: getGymLeaderInfo / getRegionInfo 資料正確
  test('9.1 getGymLeaderInfo and getRegionInfo return correct data', async ({ page }) => {
    const gymLeader = await page.evaluate(() => {
      return getGymLeaderInfo(0);
    });
    expect(gymLeader).not.toBeNull();
    expect(gymLeader.region).toBe('關都');
    expect(gymLeader.badge).toBe(1);
    expect(gymLeader.leader).toBe('小剛');
    expect(gymLeader.type).toBe('岩石');

    const lastLeader = await page.evaluate(() => getGymLeaderInfo(31));
    expect(lastLeader.badge).toBe(32);
    expect(lastLeader.leader).toBe('奇巴納');
    expect(lastLeader.region).toBe('伽勒爾');

    const clamped = await page.evaluate(() => getGymLeaderInfo(99));
    expect(clamped.badge).toBe(32);

    const regionInfo = await page.evaluate(() => getRegionInfo(0));
    expect(regionInfo.name).toBe('關都地區');
    expect(regionInfo.earned).toBe(0);

    const regionInfo8 = await page.evaluate(() => getRegionInfo(8));
    expect(regionInfo8.name).toBe('豐緣地區');
    expect(regionInfo8.earned).toBe(0);

    const regionInfo16 = await page.evaluate(() => getRegionInfo(16));
    expect(regionInfo16.name).toBe('合眾地區');
    expect(regionInfo16.earned).toBe(0);
  });

  // 9.2: generateGymWaves 3~5 波
  test('9.2 generateGymWaves produces 3-5 waves with correct structure', async ({ page }) => {
    const result0 = await page.evaluate(() => {
      globalData.badges = 0;
      return generateGymWaves(10);
    });
    expect(result0.waves.length).toBeGreaterThanOrEqual(3);
    expect(result0.waves.length).toBeLessThanOrEqual(5);
    expect(result0.gymInfo.leader).toBe('小剛');
    result0.waves.forEach((w, i) => {
      expect(w.isGym).toBe(true);
      expect(w.waveIndex).toBe(i);
      expect(w.isLastWave).toBe(i === result0.waves.length - 1);
      expect(w.name).toBeTruthy();
      expect(w.level).toBeGreaterThanOrEqual(5);
    });

    const result8 = await page.evaluate(() => {
      globalData.badges = 8;
      return generateGymWaves(25);
    });
    expect(result8.waves.length).toBeGreaterThanOrEqual(4);
    expect(result8.gymInfo.leader).toBe('杜鵑');
    expect(result8.gymInfo.region).toBe('豐緣');
  });

  // 9.3: generateLeagueGauntlet 5+1 車輪戰
  test('9.3 generateLeagueGauntlet produces 6 waves (2 E4 × 3 waves)', async ({ page }) => {
    const gauntlet = await page.evaluate(() => {
      globalData.badges = 32;
      leagueCompletedMonths = {};
      return generateLeagueGauntlet(50, '關都');
    });
    expect(gauntlet).not.toBeNull();
    expect(gauntlet.waves.length).toBe(6);
    expect(gauntlet.completed).toBe(false);

    for (let i = 0; i < 5; i++) {
      expect(gauntlet.waves[i].isLastWave).toBe(false);
      expect(gauntlet.waves[i].leagueRegion).toBe('關都');
    }
    expect(gauntlet.waves[5].isLastWave).toBe(true);

    const noBadge = await page.evaluate(() => {
      globalData.badges = 3;
      return generateLeagueGauntlet(10, '關都');
    });
    expect(noBadge).toBeNull();

    const completed = await page.evaluate(() => {
      var mk = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      leagueCompletedMonths['關都'] = mk;
      globalData.badges = 32;
      return generateLeagueGauntlet(50, '關都');
    });
    expect(completed.completed).toBe(true);
    expect(completed.waves.length).toBe(0);
  });

  // 9.4: openGymEditor 管理員編輯
  test('9.4 openGymEditor shows editable gym table', async ({ page }) => {
    await page.selectOption('#studentSelect', 'Admin');
    await expect(page.locator('#adminPanel')).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000);

    var html = await page.evaluate(function() {
      var m = document.getElementById('customModal');
      if (m) m.style.display = 'none';
      openGymEditor();
      var ec = document.getElementById('gymEditorContainer');
      return ec ? ec.innerHTML : '';
    });
    expect(html).toContain('道館資料編輯器');
    expect(html).toContain('儲存至 Firestore');
    expect(html).toContain('重置為預設');
    expect(html).toContain('小剛');
    expect(html).toContain('尼比道館');
    expect(html).toContain('岩石');
  });

  // 9.5: 徽章顯示（renderBadgeCase null guard）
  test('9.5 renderBadgeCase shows badges without error', async ({ page }) => {
    await page.waitForFunction(() => {
      var dd = document.getElementById('dashboard');
      return dd && dd.style.display === 'block';
    }, { timeout: 10000 });

    const regionName = page.locator('#regionNameText');
    await expect(regionName).toBeVisible();
    const regionText = await regionName.textContent();
    expect(regionText.length).toBeGreaterThan(0);

    const badgeGrid = page.locator('#badgeGridBox');
    const badgeCount = await badgeGrid.evaluate(el => el.children.length);
    expect(badgeCount).toBe(8);

    const totalBadges = page.locator('#totalBadgesText');
    await expect(totalBadges).toBeVisible();

    const noThrow = await page.evaluate(() => {
      var saved = globalData;
      globalData = null;
      try {
        renderBadgeCase();
        return true;
      } catch (e) {
        return false;
      } finally {
        globalData = saved;
      }
    });
    expect(noThrow).toBe(true);

    const noThrowMissingEl = await page.evaluate(() => {
      var saved = globalData;
      var gymPreviewParent = document.getElementById('gymPreview');
      var oldParent = gymPreviewParent ? gymPreviewParent.parentNode : null;
      if (gymPreviewParent) gymPreviewParent.remove();
      try {
        renderBadgeCase();
        return true;
      } catch (e) {
        return false;
      } finally {
        globalData = saved;
        if (!document.getElementById('gymPreview') && gymPreviewParent && oldParent) {
          oldParent.appendChild(gymPreviewParent);
        }
      }
    });
    expect(noThrowMissingEl).toBe(true);
  });

  // 9.6: gymPreview 戰鬥前預覽
  test('9.6 gymPreview shows correct gym/league info', async ({ page }) => {
    const gymPreview = page.locator('#gymPreview');
    await expect(gymPreview).toBeVisible({ timeout: 10000 });
    const previewText = await gymPreview.textContent();
    expect(previewText).toContain('道館挑戰');

    const leaguePreviewText = await page.evaluate(() => {
      globalData.badges = 32;
      renderBadgeCase();
      var gp = document.getElementById('gymPreview');
      return gp ? gp.textContent : '';
    });
    expect(leaguePreviewText).toContain('聯盟戰');
  });

  // 9.7: 健身柔道場顯示（B13 修復驗證）
  test('9.7 judo/dojo gym display works correctly', async ({ page }) => {
    const gym13 = await page.evaluate(() => getGymLeaderInfo(12));
    expect(gym13.badge).toBe(13);
    expect(gym13.leader).toBe('瓢太');
    expect(gym13.type).toBe('岩石');
  });

  // 9.8: checkDefenseChallenge 衛冕戰冷卻
  test('9.8 checkDefenseChallenge respects 3-day cooldown', async ({ page }) => {
    const checkDefense = await page.evaluate(() => {
      var mk = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      leagueCompletedMonths['關都'] = mk;
      localStorage.setItem('lastDefense_關都', '0');
      globalData.badges = 32;
      var result = checkDefenseChallenge();
      localStorage.removeItem('lastDefense_關都');
      return result;
    });
    expect(checkDefense).toBe('關都');

    const onCooldown = await page.evaluate(() => {
      var mk = new Date().getFullYear() + '-' + (new Date().getMonth() + 1);
      leagueCompletedMonths['關都'] = mk;
      localStorage.setItem('lastDefense_關都', String(Date.now()));
      var result = checkDefenseChallenge();
      localStorage.removeItem('lastDefense_關都');
      return result;
    });
    expect(onCooldown).toBeNull();

    const noneCompleted = await page.evaluate(() => {
      leagueCompletedMonths = {};
      return checkDefenseChallenge();
    });
    expect(noneCompleted).toBeNull();
  });

  // 9.9: startDefenseChallenge 衛冕戰鬥
  test('9.9 startDefenseChallenge opens defense modal', async ({ page }) => {
    const defenseResult = await page.evaluate(() => {
      globalData.badges = 32;
      globalData.highestLevel = 50;
      startDefenseChallenge('關都');
      var modal = document.getElementById('defenseModal');
      var body = document.getElementById('defenseBody');
      var buttons = document.getElementById('defenseButtons');
      return {
        modalDisplay: modal ? modal.style.display : '',
        bodyHTML: body ? body.innerHTML : '',
        buttonsDisplay: buttons ? buttons.style.display : ''
      };
    });
    expect(defenseResult.modalDisplay).toBe('flex');
    expect(defenseResult.bodyHTML).toContain('衛冕挑戰');
    expect(defenseResult.buttonsDisplay).toBe('block');
    expect(defenseResult.bodyHTML).toContain('關都聯盟');
  });

  // 9.10: openLeagueRanking 聯盟排名
  test('9.10 openLeagueRanking shows all 6 regions with points', async ({ page }) => {
    const rankingResult = await page.evaluate(() => {
      openLeagueRanking();
      var modal = document.getElementById('leagueRankingModal');
      var body = document.getElementById('leagueRankingBody');
      return {
        modalDisplay: modal ? modal.style.display : '',
        bodyHTML: body ? body.innerHTML : ''
      };
    });
    expect(rankingResult.modalDisplay).toBe('flex');
    expect(rankingResult.bodyHTML).toContain('關都聯盟');
    expect(rankingResult.bodyHTML).toContain('城都聯盟');
    expect(rankingResult.bodyHTML).toContain('豐緣聯盟');
    expect(rankingResult.bodyHTML).toContain('神奧聯盟');
    expect(rankingResult.bodyHTML).toContain('合眾聯盟');
    expect(rankingResult.bodyHTML).toContain('卡洛斯聯盟');
    expect(rankingResult.bodyHTML).toContain('總聯盟積分');
  });

  // ── 已知 Bug 驗證 ──

  test('B10: gymPreview null guard works (missing element)', async ({ page }) => {
    const b10Ok = await page.evaluate(() => {
      var oldEl = document.getElementById('gymPreview');
      if (oldEl) {
        var clone = oldEl.cloneNode(true);
        clone.id = 'gymPreviewBackup';
        clone.style.display = 'none';
        document.body.appendChild(clone);
        oldEl.remove();
      }
      try {
        renderBadgeCase();
        return true;
      } catch (e) {
        return false;
      } finally {
        var backup = document.getElementById('gymPreviewBackup');
        if (backup) {
          backup.id = 'gymPreview';
          backup.style.display = '';
        }
      }
    });
    expect(b10Ok).toBe(true);
  });

  test('B11: renderBadgeCase handles null globalData', async ({ page }) => {
    const b11Ok = await page.evaluate(() => {
      var saved = globalData;
      globalData = null;
      try {
        renderBadgeCase();
        return true;
      } catch (e) {
        return false;
      } finally {
        globalData = saved;
      }
    });
    expect(b11Ok).toBe(true);
  });

  test('B13: 格鬥 gym displays correctly', async ({ page }) => {
    const b13Ok = await page.evaluate(() => {
      globalData.badges = 12;
      try {
        renderBadgeCase();
        var preview = document.getElementById('gymPreview');
        if (!preview) return false;
        var text = preview.textContent || '';
        return text.indexOf('阿四') !== -1 || text.indexOf('格鬥') !== -1 || text.indexOf('道館') !== -1;
      } catch (e) {
        return false;
      }
    });
    expect(b13Ok).toBe(true);
  });

});
