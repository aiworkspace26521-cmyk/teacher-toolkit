const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyAllTrainersAndAllPokemon() {
  const localFile = 'file:///' + path.resolve(__dirname, '../../../../public/kpi-dashboard.html').replace(/\\/g, '/');
  console.log(`\n================================================================================`);
  console.log(`🤖 跨全體訓練家與所有隊伍寶可夢：招式學習、視窗關閉、F5刷新持久化 (Zero Data Loss) 驗證`);
  console.log(`================================================================================`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.text().includes('WARNING') || msg.text().includes('Error')) console.log(`  [Browser Console] ${msg.text()}`);
  });
  page.on('pageerror', err => console.error(`  💥 Page Error: ${err.message}`));

  await page.goto(localFile, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Clear all residual localStorage/sessionStorage from previous manual tests
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  const trainers = ['Neil', 'Emma', 'Lawrence', 'Admin'];
  let totalTestsPassed = 0;
  let totalTestsAttempted = 0;

  for (const trainerId of trainers) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`👤 【訓練家驗證】切換至訓練家: ${trainerId}`);
    console.log(`--------------------------------------------------------------------------------`);

    await page.evaluate(() => {
      window.globalData = null;
      sessionStorage.clear();
    });

    await page.selectOption('#studentSelect', trainerId);

    // Wait until globalData is properly set for the current trainer
    await page.waitForFunction((targetSid) => {
      if (!window.globalData || !window.globalData.roster || window.globalData.roster.length === 0) return false;
      if (targetSid === 'Admin') return window.isAdmin === true;
      return window.globalData.studentId === targetSid;
    }, trainerId, { timeout: 10000 });

    await page.waitForTimeout(1000);

    const rosterInfo = await page.evaluate(() => {
      return (globalData.roster || []).map(p => ({
        id: p.id,
        baseName: p.baseName,
        currentLevel: p.currentLevel || 5
      }));
    });

    console.log(`  - 找到 ${rosterInfo.length} 隻寶可夢:`, rosterInfo.map(p => p.baseName).join(', '));

    for (const pInfo of rosterInfo) {
      totalTestsAttempted++;
      console.log(`  📌 測試寶可夢 [${pInfo.id}] ${pInfo.baseName}...`);

      // 1. Open skill tree & find an eligible skill tree move (skipping TM moves)
      const learnResult = await page.evaluate((targetId) => {
        openSkillTree(targetId);
        const pkmn = getPkmnById(_skillTreePkmnId);
        if (!pkmn) return { success: false, reason: 'PKMN_NOT_FOUND' };
        pkmn.skillPoints = Math.max(100, pkmn.skillPoints || 0);

        const tree = resolveSkillTreeV31(pkmn);
        const roles = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
        let targetMoveName = null;
        let foundRole = 'ATK';

        for (const r of roles) {
          const t1Node = tree[r] ? tree[r].T1 : null;
          const choices = Array.isArray(t1Node) ? t1Node : (t1Node && t1Node.choices ? t1Node.choices : []);
          if (choices.length > 0) {
            const elChoice = choices.find(c => {
              if (c.eligible === false) return false;
              if (pkmn.tmMoves && pkmn.tmMoves.indexOf(c.name) !== -1) return false;
              return true;
            });
            if (elChoice) {
              targetMoveName = elChoice.name;
              foundRole = r;
              break;
            }
          }
        }

        // Fallback: search any choice in any T1 track for this pokemon
        if (!targetMoveName) {
          for (const r of roles) {
            const t1Node = tree[r] ? tree[r].T1 : null;
            const choices = Array.isArray(t1Node) ? t1Node : (t1Node && t1Node.choices ? t1Node.choices : []);
            if (choices.length > 0) {
              targetMoveName = choices[0].name;
              foundRole = r;
              break;
            }
          }
        }

        if (!targetMoveName) {
          targetMoveName = '撞擊';
          foundRole = 'ATK';
        }

        selectSkillTreeTab(foundRole.toLowerCase());

        let res1 = learnSkillTreeNodeV31(targetMoveName, 1, foundRole);
        let res2 = { success: true };
        if (res1.reason === 'ALREADY_LEARNED') {
          res2 = upgradeMoveInSkillTreeV31(targetMoveName);
        }
        renderSkillTree();

        const recCheck = getLearnedMoveRecord(pkmn, targetMoveName, foundRole);

        return {
          success: !!recCheck,
          moveName: targetMoveName,
          role: foundRole || 'ATK',
          res1: res1,
          res2: res2,
          level: recCheck ? recCheck.level : 0
        };
      }, pInfo.id);

      console.log(`    - 在 ${learnResult.role} 軌道操作招式「${learnResult.moveName}」 (Lv.${learnResult.level})`);

      // 2. Close modal
      await page.evaluate(() => {
        saveSkillTreeState();
        closeModal('skillTreeModal');
      });
      await page.waitForTimeout(500);

      // 3. Re-open modal & assert move is preserved
      const modalCheck = await page.evaluate((targetArgs) => {
        openSkillTree(targetArgs.id);
        const activeRole = (targetArgs.role || 'ATK').toLowerCase();
        selectSkillTreeTab(activeRole);
        const pkmn = getPkmnById(_skillTreePkmnId);
        const rec = getLearnedMoveRecord(pkmn, targetArgs.moveName, targetArgs.role);
        const nodeDom = document.querySelector('.st-node[data-move="' + targetArgs.moveName + '"]');
        return {
          level: rec ? rec.level : 0,
          domText: nodeDom ? nodeDom.textContent : ''
        };
      }, { id: pInfo.id, moveName: learnResult.moveName, role: learnResult.role });

      const isModalPass = modalCheck.level >= 1 && modalCheck.domText.includes('✓已選');
      console.log(`    - 關閉視窗後重新進入: 等級 Lv.${modalCheck.level}, 標籤: ${isModalPass ? '✅ 已選' : '❌ 遺失'}`);

      // 4. Reload page & assert move is preserved after F5
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await page.selectOption('#studentSelect', trainerId);

      await page.waitForFunction((targetSid) => {
        if (!window.globalData || !window.globalData.roster || window.globalData.roster.length === 0) return false;
        if (targetSid === 'Admin') return window.isAdmin === true;
        return window.globalData.studentId === targetSid;
      }, trainerId, { timeout: 10000 });

      await page.waitForTimeout(1000);

      const f5Check = await page.evaluate((targetArgs) => {
        openSkillTree(targetArgs.id);
        const activeRole = (targetArgs.role || 'ATK').toLowerCase();
        selectSkillTreeTab(activeRole);
        const pkmn = getPkmnById(_skillTreePkmnId);
        const rec = getLearnedMoveRecord(pkmn, targetArgs.moveName, targetArgs.role);
        const nodeDom = document.querySelector('.st-node[data-move="' + targetArgs.moveName + '"]');
        return {
          level: rec ? rec.level : 0,
          domText: nodeDom ? nodeDom.textContent : ''
        };
      }, { id: pInfo.id, moveName: learnResult.moveName, role: learnResult.role });

      const isF5Pass = f5Check.level >= 1 && f5Check.domText.includes('✓已選');
      console.log(`    - F5 全頁重新整理後重新進入: 等級 Lv.${f5Check.level}, 標籤: ${isF5Pass ? '✅ 100% 保留' : '❌ 遺失'}`);

      if (isModalPass && isF5Pass) {
        totalTestsPassed++;
        console.log(`    ✅ 訓練家 ${trainerId} 的寶可夢 [${pInfo.baseName}] 招式零遺失測試 PASS！`);
      } else {
        throw new Error(`訓練家 ${trainerId} 的寶可夢 [${pInfo.baseName}] 招式學習後遺失！ (ModalPass: ${isModalPass}, F5Pass: ${isF5Pass})`);
      }
    }
  }

  console.log(`\n================================================================================`);
  console.log(`🎉🎉🎉 全體 ${trainers.length} 位訓練家、共 ${totalTestsAttempted} 隻寶可夢招式學習零遺失 (Zero Data Loss) 實測 100% 全部通過！`);
  console.log(`================================================================================\n`);

  await browser.close();
}

verifyAllTrainersAndAllPokemon();
