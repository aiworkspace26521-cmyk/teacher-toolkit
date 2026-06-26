const admin = require('firebase-admin');
const { Timestamp } = require('firebase-admin/firestore');

const db = admin.firestore();
const EVENTS_COL = 'kpi_events';
const STUDENTS_COL = 'kpi_students';
const SUBJECTS_COL = 'kpi_subjects';
const ACHIEVEMENTS_COL = 'kpi_achievements';

function getStartOfWeek(date) {
  let d = new Date(date);
  let day = d.getDay() || 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day + 1);
  return d;
}

function getStartOfMonth(date) {
  let d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDefaultQuestProgress() {
  var today = new Date();
  var weekStart = getStartOfWeek(today);
  return {
    daily: { resetKey: today.toDateString(), progress: {}, claimed: {} },
    weekly: { resetKey: weekStart.toDateString(), progress: {}, claimed: {} }
  };
}

function computeQuestProgress(events) {
  if (!events || events.length === 0) return getDefaultQuestProgress();
  var qp = getDefaultQuestProgress();
  var now = new Date();
  var todayStr = now.toDateString();
  var weekStart = getStartOfWeek(now).getTime();

  for (var i = 0; i < events.length; i++) {
    var evt = events[i];
    var rowDate = evt.timestamp instanceof Timestamp
      ? evt.timestamp.toDate()
      : new Date(evt.timestamp);
    var action = String(evt.action || "");
    var safeNote = String(evt.note || "");

    if (rowDate.toDateString() === todayStr) {
      if (action !== "系統測試") qp.daily.progress["LOGIN"] = (qp.daily.progress["LOGIN"] || 0) + 1;
      if (action === "每日提交") qp.daily.progress["DAILY_SUBMIT"] = (qp.daily.progress["DAILY_SUBMIT"] || 0) + 1;
      if (action === "戰鬥勝利" && (safeNote.indexOf("路人") !== -1 || safeNote.indexOf("[Daily]") !== -1 || safeNote.indexOf("Raid") !== -1)) {
        qp.daily.progress["BATTLE_3"] = (qp.daily.progress["BATTLE_3"] || 0) + 1;
      }
      if (action === "捕捉" || action === "A") qp.daily.progress["CAPTURE_1"] = (qp.daily.progress["CAPTURE_1"] || 0) + 1;
    }

    if (rowDate.getTime() >= weekStart) {
      if (action === "戰鬥勝利" && (safeNote.indexOf("[Gym]") !== -1 || safeNote.indexOf("道館") !== -1)) {
        qp.weekly.progress["GYM_3"] = (qp.weekly.progress["GYM_3"] || 0) + 1;
      }
      if (action === "捕捉" || action === "A") qp.weekly.progress["CAPTURE_5"] = (qp.weekly.progress["CAPTURE_5"] || 0) + 1;
      if (action === "戰鬥勝利") qp.weekly.progress["BATTLE_10"] = (qp.weekly.progress["BATTLE_10"] || 0) + 1;
      if (action === "PvP") qp.weekly.progress["PVP_2"] = (qp.weekly.progress["PVP_2"] || 0) + 1;
    }
  }
  return qp;
}

function getExpNeeded(lvl) {
  if (lvl <= 10) return lvl * 30;
  if (lvl <= 20) return lvl * 60;
  if (lvl <= 35) return lvl * 120;
  if (lvl <= 55) return lvl * 200;
  if (lvl <= 75) return lvl * 350;
  if (lvl <= 85) return lvl * 800;
  if (lvl <= 92) return lvl * 3500;
  return lvl * 5000;
}
function calcLevelAndExp(totalExp, initialLevel) {
  let lvl = initialLevel || 5;
  let currentExp = totalExp;
  let expNeeded = getExpNeeded(lvl);
  while (currentExp >= expNeeded) {
    currentExp -= expNeeded;
    lvl++;
    expNeeded = getExpNeeded(lvl);
    if (lvl >= 99) { lvl = 99; currentExp = 0; expNeeded = 0; break; }
  }
  if (lvl >= 99) { lvl = 99; currentExp = 0; expNeeded = 0; }
  return { level: lvl, expProgress: currentExp, expNeeded };
}

async function getStudentEvents(studentId) {
  const snapshot = await db.collection(EVENTS_COL)
    .where('studentId', '==', studentId)
    .orderBy('timestamp', 'asc')
    .get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

async function recalculateStudentState(studentId) {
  const events = await getStudentEvents(studentId);
  if (events.length === 0) return null;

  let state = {
    studentId,
    level: 5,
    totalExp: 0,
    coins: 0,
    badges: 0,
    lockedGymLevel: 5,
    highestLevel: 5,
    potions: 0, revives: 0, candies: 0,
    maxPotions: 0, maxRevives: 0,
    expSharePurchased: false,
    hasExpertBelt: false,
    hasEviolite: false, hasChampionCloak: false, hasAmuletCoin: false,
    hasQuickClaw: false, hasFocusLens: false, hasShellBell: false, hasLifeOrb: false, hasAssaultVest: false,
    電擊盒: false, 岩漿盒: false, '龍之鱗片': false, 護具: false, 金屬膜: false, '王者之證': false,
    todayCompleted: false,
    daysSinceLastBadge: 0,
    lastBadgeTime: null,
    firstLogTime: null,
    submitDates: {},
    todayBattles: 0,
    weekGymWins: 0,
    monthLeagueWins: 0,
    roster: { P0: { id: 'P0', baseName: '🐾 伊布 (一般系)', totalExp: 0, initialLevel: 5, catchDate: '初始夥伴', heldItem: '' } },
    submitStreak: 0,
    oranBerries: 0, cheriBerries: 0, lumBerries: 0, chilanBerries: 0,
    hasFocusSash: false, hasEjectButton: false, hasRockyHelmet: false, hasWeaknessPolicy: false,
    tms: {},
    simpleMode: false,
    leagueRegionsWon: {},
    lastEventTimestamp: null,
    lastUpdated: Timestamp.now()
  };

  const dNow = new Date();
  const todayStr = dNow.toDateString();
  const startOfWeek = getStartOfWeek(dNow).getTime();
  const startOfMonth = getStartOfMonth(dNow).getTime();

  for (const evt of events) {
    const rowDate = evt.timestamp instanceof Timestamp
      ? evt.timestamp.toDate()
      : new Date(evt.timestamp);
    const { action, score, expGained, coinsGained, badgeChange, note, tasks } = evt;
    const rowExp = expGained || 0;
    const rowCoins = coinsGained || 0;
    const rowBadges = badgeChange || 0;
    const safeNote = String(note || '');
    const rowAction = String(action || '');
    const rowTasks = Array.isArray(tasks) ? tasks : [];

    if (!state.firstLogTime) state.firstLogTime = rowDate.getTime();
    state.badges += rowBadges;
    if (rowBadges > 0) state.lastBadgeTime = rowDate.getTime();
    state.coins += rowCoins;

    if (!['商城兌換', '戰鬥消耗', '物品消耗', 'E', '系統測試', 'trade', '道具裝備'].includes(rowAction)) {
      state.submitDates[rowDate.toDateString()] = true;
    }

    if (rowDate.toDateString() === todayStr &&
        !['商城兌換', '戰鬥消耗', '物品消耗', 'E', '戰鬥勝利', '系統測試', 'trade', '捕捉', 'A', '糖果升級', 'B', '道具裝備', 'PvP'].includes(rowAction)) {
      state.todayCompleted = true;
    }

    // 親密度統計
    if (!state._happinessEvents) state._happinessEvents = {};
    if (rowAction === '每日提交' || rowAction === '捕捉' || rowAction === 'A') {
      for (const hid in state.roster) {
        if (!state._happinessEvents[hid]) state._happinessEvents[hid] = 0;
        state._happinessEvents[hid]++;
      }
    }
    if (rowAction === '戰鬥勝利') {
      const pMatch = safeNote.match(/參與(?:者)?:\s*([^|]+)/);
      if (pMatch) {
        const pIds = pMatch[1].split(',').map(s => s.trim());
        for (const pid of pIds) {
          if (pid && state.roster[pid]) {
            if (!state._happinessEvents[pid]) state._happinessEvents[pid] = 0;
            state._happinessEvents[pid] += 2;
          }
        }
      }
    }

    if (rowAction === '商城兌換') {
      if (safeNote.includes('好傷藥')) state.potions++;
      if (safeNote.includes('活力塊')) state.revives++;
      if (safeNote.includes('神奇糖果')) state.candies++;
      if (safeNote.includes('全滿藥')) state.maxPotions++;
      if (safeNote.includes('元氣藥塊')) state.maxRevives++;
      if (safeNote.includes('學習裝置')) state.expSharePurchased = true;
      if (safeNote.includes('進化奇石')) state.hasEviolite = true;
      if (safeNote.includes('達人帶')) state.hasExpertBelt = true;
      if (safeNote.includes('護符金幣')) state.hasAmuletCoin = true;
      if (safeNote.includes('冠軍披風')) state.hasChampionCloak = true;
      if (safeNote.includes('先制之爪')) state.hasQuickClaw = true;
      if (safeNote.includes('焦點鏡')) state.hasFocusLens = true;
      if (safeNote.includes('貝殼之鈴')) state.hasShellBell = true;
      if (safeNote.includes('生命寶珠')) state.hasLifeOrb = true;
      if (safeNote.includes('AV背心')) state.hasAssaultVest = true;
    if (safeNote.includes('電擊盒')) state.電擊盒 = true;
    if (safeNote.includes('岩漿盒')) state.岩漿盒 = true;
    if (safeNote.includes('龍之鱗片')) state['龍之鱗片'] = true;
    if (safeNote.includes('護具')) state.護具 = true;
    if (safeNote.includes('金屬膜')) state.金屬膜 = true;
    if (safeNote.includes('王者之證')) state['王者之證'] = true;
    if (safeNote.includes('橙橙果')) state.oranBerries++;
    if (safeNote.includes('奇異果')) state.cheriBerries++;
    if (safeNote.includes('木子果')) state.lumBerries++;
    if (safeNote.includes('抗性果')) state.chilanBerries++;
    if (safeNote.includes('氣勢披帶')) state.hasFocusSash = true;
    if (safeNote.includes('逃脱按鈕')) state.hasEjectButton = true;
    if (safeNote.includes('凸凸頭盔')) state.hasRockyHelmet = true;
    if (safeNote.includes('弱點保險')) state.hasWeaknessPolicy = true;
    const tmMatch = safeNote.match(/TM學習器:\s*(\S+)/);
    if (tmMatch) { if (!state.tms) state.tms = {}; state.tms[tmMatch[1]] = (state.tms[tmMatch[1]] || 0) + 1; }
    }

    let m;
    if ((m = safeNote.match(/消耗(\d+)瓶好傷藥/))) state.potions -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶活力塊/))) state.revives -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶神奇糖果/))) state.candies -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶全滿藥/))) state.maxPotions -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶元氣藥塊/))) state.maxRevives -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)個橙橙果/))) state.oranBerries = Math.max(0, (state.oranBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個奇異果/))) state.cheriBerries = Math.max(0, (state.cheriBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個木子果/))) state.lumBerries = Math.max(0, (state.lumBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個抗性果/))) state.chilanBerries = Math.max(0, (state.chilanBerries||0) - parseInt(m[1]));
    if ((m = safeNote.match(/消耗(\d+)個氣勢披帶/))) state.hasFocusSash = false;
    if ((m = safeNote.match(/消耗(\d+)個弱點保險/))) state.hasWeaknessPolicy = false;
    if ((m = safeNote.match(/消耗(\d+)個TM學習器/))) { const tmN = safeNote.match(/TM學習器:\s*(\S+)/); if (tmN && state.tms) state.tms[tmN[1]] = Math.max(0, (state.tms[tmN[1]]||0) - parseInt(m[1])); }

    if (rowAction === 'A' || rowAction === '捕捉') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1] || 'legacy_' + evt.id;
      const pNameRaw = ((safeNote.match(/獲得:\s*([^|]+)/) || [])[1] || '未知寶可夢 (一般系)').trim();
      let initLv = score >= 95 ? Math.max(5, Math.floor(score / 4)) : (score >= 75 ? Math.max(5, Math.floor(score / 6)) : Math.max(5, Math.floor(score / 8)));
      const lvMatch = pNameRaw.match(/(.+?)\s*\(Lv\.(\d+)\)/);
      if (lvMatch) { initLv = parseInt(lvMatch[2], 10); }
      initLv = Math.min(initLv, Math.max(5, (state.lockedGymLevel || 5)) + 3);
      const cleanName = pNameRaw.includes('(') ? pNameRaw : pNameRaw + ' (一般系)';
      if (!state.roster[pid]) {
        state.roster[pid] = {
          id: pid, baseName: cleanName, totalExp: 0, initialLevel: initLv,
          catchDate: `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`,
          heldItem: ''
        };
      }
    } else if (rowAction === '道具裝備') {
      const HELD_NAMES = { expShare: '學習裝置', expertBelt: '達人帶', eviolite: '進化奇石', championCloak: '冠軍披風', amuletCoin: '護符金幣', quickClaw: '先制之爪', focusLens: '焦點鏡', shellBell: '貝殼之鈴', lifeOrb: '生命寶珠', assaultVest: 'AV背心', focusSash: '氣勢披帶', ejectButton: '逃脱按鈕', rockyHelmet: '凸凸頭盔', weaknessPolicy: '弱點保險' };
      for (const [hid, hname] of Object.entries(HELD_NAMES)) {
        const ep = new RegExp(`裝備${hname}給\\s*ID:(\\S+)`);
        const em = safeNote.match(ep);
        if (em && state.roster[em[1]]) {
          for (const ek in state.roster) { if (state.roster[ek].heldItem === hid) state.roster[ek].heldItem = ''; }
          state.roster[em[1]].heldItem = hid;
        }
        if (safeNote.includes('卸下' + hname)) {
          for (const ek in state.roster) { if (state.roster[ek].heldItem === hid) state.roster[ek].heldItem = ''; }
        }
      }
    } else if (rowAction === 'B' || rowAction === '糖果升級') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1];
      if (pid) {
        for (const k in state.roster) {
          const isHolder = state.roster[k].heldItem === 'expShare';
          state.roster[k].totalExp += (k === pid) ? rowExp : (isHolder ? Math.floor(rowExp * 0.8) : Math.floor(rowExp * 0.5));
        }
      }
    } else if (rowAction === '戰鬥勝利') {
      const match = safeNote.match(/參與(?:者)?:\s*([^|]+)/);
      const parts = match ? match[1].split(',').map(s => s.trim()) : [];
      for (const k in state.roster) {
        const isHolder = state.roster[k].heldItem === 'expShare';
        state.roster[k].totalExp += (parts.includes(k)) ? rowExp : (isHolder ? Math.floor(rowExp * 0.8) : Math.floor(rowExp * 0.5));
      }
      const bossMatch = safeNote.match(/🏆 捕獲:\s*([^|]+)/);
      if (bossMatch) {
        const bossId = 'P' + rowDate.getTime() + '_LEG';
        const bossName = (bossMatch[1].trim().includes('(') ? bossMatch[1].trim() : bossMatch[1].trim() + ' (一般系)');
        if (!state.roster[bossId]) {
          state.roster[bossId] = {
            id: bossId, baseName: bossName, totalExp: 0,
            initialLevel: Math.min(99, Math.max(5, state.lockedGymLevel) + 5),
            catchDate: `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`,
            heldItem: ''
          };
        }
      }
      const isRowToday = rowDate.toDateString() === todayStr;
      const isRowThisWeek = rowDate.getTime() >= startOfWeek;
      const isRowThisMonth = rowDate.getTime() >= startOfMonth;
      if (isRowToday && (safeNote.includes('[Daily]') || safeNote.includes('路人') || safeNote.includes('Raid'))) state.todayBattles++;
      if (isRowThisWeek && (safeNote.includes('[Gym]') || safeNote.includes('道館'))) state.weekGymWins++;
      if (isRowThisMonth && (safeNote.includes('[League]') || safeNote.includes('大會') || safeNote.includes('魔王'))) { state.monthLeagueWins++; const lr = safeNote.match(/\[(.+?)\s*League\]/); if (lr) state.leagueRegionsWon[lr[1]] = true; }
    } else if (rowAction === 'E') {
      const nm = safeNote.match(/獲得:\s*([^|]+)/);
      if (nm && state.roster['P0']) {
        const newName = (nm[1].trim().includes('(') ? nm[1].trim() : nm[1].trim() + ' (一般系)');
        state.roster['P0'].baseName = newName;
      }
      // 新格式: 進化ID:{pokemonId} => {newName}
      const evoMatch = safeNote.match(/進化ID:(\S+)\s*=>\s*(.+)/);
      if (evoMatch && state.roster[evoMatch[1]]) {
        state.roster[evoMatch[1]].baseName = evoMatch[2].trim();
      }
    } else if (rowAction === '滿級轉化') {
      state.coins += rowCoins;
    }

    let currentIterLevel = 5;
    for (const k in state.roster) {
      const lvlInfo = calcLevelAndExp(state.roster[k].totalExp, state.roster[k].initialLevel);
      if (lvlInfo.level > currentIterLevel) currentIterLevel = lvlInfo.level;
    }
    state.highestLevel = currentIterLevel;
    if (rowBadges > 0) state.lockedGymLevel = state.highestLevel;
    state.lastEventTimestamp = rowDate.toISOString();
  }

  state.daysSinceLastBadge = state.lastBadgeTime
    ? (Date.now() - state.lastBadgeTime) / 86400000
    : (state.firstLogTime ? (Date.now() - state.firstLogTime) / 86400000 : 0);

  state.submitStreak = 0;
  const sortedSubDates = Object.keys(state.submitDates).sort((a, b) => new Date(b) - new Date(a));
  for (let si = 0; si < sortedSubDates.length; si++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - si);
    if (sortedSubDates[si] === expected.toDateString()) state.submitStreak++;
    else break;
  }

  // V5.4: MIN compensation — badges for persistent submitters
  var totalSubmitDays = Object.keys(state.submitDates).length;
  if (totalSubmitDays >= 60) state.badges += 5;
  else if (totalSubmitDays >= 30) state.badges += 2;

  const rosterArray = [];
  let finalHighestLevel = 5;
  for (const k in state.roster) {
    const p = state.roster[k];
    const lvlInfo = calcLevelAndExp(p.totalExp, p.initialLevel);
    p.currentLevel = lvlInfo.level;
    p.expProgress = lvlInfo.expProgress;
    p.expNeeded = lvlInfo.expNeeded;
    if (state._happinessEvents && state._happinessEvents[p.id]) {
      p.happiness = (p.happiness || 0) + state._happinessEvents[p.id];
    } else {
      p.happiness = p.happiness || 0;
    }
    if (p.currentLevel > finalHighestLevel) finalHighestLevel = p.currentLevel;
    rosterArray.push(p);
  }

  // F4: quest progress
  const quests = computeQuestProgress(events);
  // Preserve claimed status from existing Firestore data
  try {
    const existingDoc = await db.collection(STUDENTS_COL).doc(studentId).get();
    if (existingDoc.exists && existingDoc.data().quests) {
      const eq = existingDoc.data().quests;
      const now = new Date();
      const todayStr = now.toDateString();
      const weekStartStr = getStartOfWeek(now).toDateString();
      if (eq.daily && eq.daily.resetKey === todayStr) {
        for (const k in eq.daily.claimed) quests.daily.claimed[k] = eq.daily.claimed[k];
      }
      if (eq.weekly && eq.weekly.resetKey === weekStartStr) {
        for (const k in eq.weekly.claimed) quests.weekly.claimed[k] = eq.weekly.claimed[k];
      }
    }
  } catch(e) {
    // ignore read errors
  }

  return {
    studentId: state.studentId,
    highestLevel: finalHighestLevel,
    lockedGymLevel: state.lockedGymLevel,
    coins: state.coins,
    badges: state.badges,
    potions: state.potions,
    revives: state.revives,
    candies: state.candies,
    maxPotions: state.maxPotions,
    maxRevives: state.maxRevives,
    expSharePurchased: state.expSharePurchased || false,
    hasExpertBelt: state.hasExpertBelt,
    hasEviolite: state.hasEviolite,
    hasChampionCloak: state.hasChampionCloak,
    hasAmuletCoin: state.hasAmuletCoin,
    hasQuickClaw: state.hasQuickClaw,
    hasFocusLens: state.hasFocusLens,
    hasShellBell: state.hasShellBell,
    hasLifeOrb: state.hasLifeOrb,
    hasAssaultVest: state.hasAssaultVest,
    '電擊盒': state.電擊盒 || false,
    '岩漿盒': state.岩漿盒 || false,
    '龍之鱗片': state['龍之鱗片'] || false,
    '護具': state.護具 || false,
    '金屬膜': state.金屬膜 || false,
    '王者之證': state['王者之證'] || false,
    todayCompleted: state.todayCompleted,
    daysSinceLastBadge: state.daysSinceLastBadge,
    roster: rosterArray,
    todayBattles: state.todayBattles,
    weekGymWins: state.weekGymWins,
    monthLeagueWins: state.monthLeagueWins,
    quests: quests,
    submitStreak: state.submitStreak || 0,
    oranBerries: state.oranBerries || 0,
    cheriBerries: state.cheriBerries || 0,
    lumBerries: state.lumBerries || 0,
    chilanBerries: state.chilanBerries || 0,
    hasFocusSash: state.hasFocusSash || false,
    hasEjectButton: state.hasEjectButton || false,
    hasRockyHelmet: state.hasRockyHelmet || false,
    hasWeaknessPolicy: state.hasWeaknessPolicy || false,
    tms: state.tms || {},
    simpleMode: state.simpleMode || false,
    leagueRegionsWon: state.leagueRegionsWon || {},
    lastUpdated: Timestamp.now()
  };
}

async function getDefaultSubjects() {
  const snapshot = await db.collection(SUBJECTS_COL).orderBy('order').get();
  const existing = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  const existingNames = new Set(existing.map(s => s.name));

  const allDefaults = [
    { name: '📐 數理道館', category: 'gym', maxScore: 30, order: 0,
      tasks: [
        { name: '劉威宏/南PC (代數先修)', score: 15 },
        { name: '計算練習與私中魔王題', score: 15 }
      ] },
    { name: '📖 國語道館', category: 'gym', maxScore: 25, order: 1,
      tasks: [
        { name: '國學與字音字形特訓', score: 15 },
        { name: '閱讀測驗與古詩文', score: 10 }
      ] },
    { name: '🎧 英文道館', category: 'gym', maxScore: 25, order: 2,
      tasks: [
        { name: 'PET/FCE 與聽力特訓', score: 15 },
        { name: 'NonFiction 與雜誌閱讀', score: 10 }
      ] },
    { name: '✨ 紀律與體能修練', category: 'daily', maxScore: 20, order: 3,
      tasks: [
        { name: '跳繩500下 / 運動30分', score: 5, discipline: true },
        { name: '小提琴專注練習', score: 5, discipline: true },
        { name: '家務小幫手', score: 5, discipline: true },
        { name: '晚上 22:15 前就寢', score: 5, discipline: true }
      ] },
  ];

  if (snapshot.empty) {
    const batch = db.batch();
    for (const subj of allDefaults) {
      batch.set(db.collection(SUBJECTS_COL).doc(), subj);
    }
    await batch.commit();
    return allDefaults;
  }

  const batch = db.batch();
  let added = 0;
  for (const subj of allDefaults) {
    if (existingNames.has(subj.name)) continue;
    const ref = db.collection(SUBJECTS_COL).doc();
    batch.set(ref, subj);
    existing.push(subj);
    added++;
  }
  if (added > 0) {
    await batch.commit();
  }
  return existing;
}

module.exports = {
  getStartOfWeek, getStartOfMonth, getExpNeeded, calcLevelAndExp,
  getStudentEvents, recalculateStudentState, getDefaultSubjects,
  computeQuestProgress
};
