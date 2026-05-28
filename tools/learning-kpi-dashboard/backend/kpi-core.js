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

function calcLevelAndExp(totalExp, initialLevel) {
  let lvl = initialLevel || 5;
  let expNeeded = lvl * 100;
  let currentExp = totalExp;
  while (currentExp >= expNeeded) {
    currentExp -= expNeeded;
    lvl++;
    expNeeded = lvl * 100;
    if (lvl >= 99) { lvl = 99; currentExp = expNeeded; break; }
  }
  if (lvl >= 99) { lvl = 99; currentExp = 9900; expNeeded = 9900; }
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
    hasExpShare: false, hasExpertBelt: false,
    hasEviolite: false, hasChampionCloak: false, hasAmuletCoin: false,
    todayCompleted: false,
    daysSinceLastBadge: 0,
    lastBadgeTime: null,
    firstLogTime: null,
    todayBattles: 0,
    weekGymWins: 0,
    monthLeagueWins: 0,
    roster: { P0: { id: 'P0', baseName: '🐾 伊布 (一般系)', totalExp: 0, initialLevel: 5, catchDate: '初始夥伴' } },
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

    if (rowDate.toDateString() === todayStr &&
        !['商城兌換', '戰鬥消耗', '物品消耗', 'E', '戰鬥勝利', '系統測試'].includes(rowAction)) {
      state.todayCompleted = true;
    }

    if (rowAction === '商城兌換') {
      const costMatch = safeNote.match(/花費(\d+)幣/);
      if (costMatch) state.coins -= parseInt(costMatch[1]);
      if (safeNote.includes('好傷藥')) state.potions++;
      if (safeNote.includes('活力塊')) state.revives++;
      if (safeNote.includes('神奇糖果')) state.candies++;
      if (safeNote.includes('全滿藥')) state.maxPotions++;
      if (safeNote.includes('元氣藥塊')) state.maxRevives++;
      if (safeNote.includes('學習裝置')) state.hasExpShare = true;
      if (safeNote.includes('進化奇石')) state.hasEviolite = true;
      if (safeNote.includes('達人帶')) state.hasExpertBelt = true;
      if (safeNote.includes('護符金幣')) state.hasAmuletCoin = true;
      if (safeNote.includes('冠軍披風')) state.hasChampionCloak = true;
    }

    let m;
    if ((m = safeNote.match(/消耗(\d+)瓶好傷藥/))) state.potions -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)個活力塊/))) state.revives -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)顆神奇糖果/))) state.candies -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)瓶全滿藥/))) state.maxPotions -= parseInt(m[1]);
    if ((m = safeNote.match(/消耗(\d+)個元氣塊/))) state.maxRevives -= parseInt(m[1]);

    if (rowAction === 'A' || rowAction === '捕捉') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1] || 'legacy_' + evt.id;
      const pNameRaw = ((safeNote.match(/獲得:\s*([^|]+)/) || [])[1] || '未知寶可夢 (一般系)').trim();
      let initLv = Math.min(99, Math.max(5, Math.max(5, state.lockedGymLevel) + (score === 100 ? 3 : (score >= 80 ? 2 : 0))));
      const lvMatch = pNameRaw.match(/(.+?)\s*\(Lv\.(\d+)\)/);
      if (lvMatch) { initLv = parseInt(lvMatch[2], 10); }
      const cleanName = pNameRaw.includes('(') ? pNameRaw : pNameRaw + ' (一般系)';
      if (!state.roster[pid]) {
        state.roster[pid] = {
          id: pid, baseName: cleanName, totalExp: 0, initialLevel: initLv,
          catchDate: `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`
        };
      }
    } else if (rowAction === 'B' || rowAction === '糖果升級') {
      const pid = (safeNote.match(/ID:(P\d+(?:_LEG)?|legacy_\d+)/) || [])[1];
      if (pid) {
        for (const k in state.roster) {
          state.roster[k].totalExp += (k === pid ? rowExp : Math.floor(rowExp * (state.hasExpShare ? 0.2 : 0.1)));
        }
      }
    } else if (rowAction === '戰鬥勝利') {
      const match = safeNote.match(/參與(?:者)?:\s*([^|]+)/);
      const parts = match ? match[1].split(',').map(s => s.trim()) : [];
      for (const k in state.roster) {
        state.roster[k].totalExp += parts.includes(k) ? rowExp : Math.floor(rowExp * (state.hasExpShare ? 0.2 : 0.1));
      }
      const bossMatch = safeNote.match(/🏆 捕獲:\s*([^|]+)/);
      if (bossMatch) {
        const bossId = 'P' + rowDate.getTime() + '_LEG';
        const bossName = (bossMatch[1].trim().includes('(') ? bossMatch[1].trim() : bossMatch[1].trim() + ' (一般系)');
        if (!state.roster[bossId]) {
          state.roster[bossId] = {
            id: bossId, baseName: bossName, totalExp: 0,
            initialLevel: Math.min(99, Math.max(5, state.lockedGymLevel) + 5),
            catchDate: `${rowDate.getFullYear()}/${(rowDate.getMonth() + 1).toString().padStart(2, '0')}/${rowDate.getDate().toString().padStart(2, '0')}`
          };
        }
      }
      const isRowToday = rowDate.toDateString() === todayStr;
      const isRowThisWeek = rowDate.getTime() >= startOfWeek;
      const isRowThisMonth = rowDate.getTime() >= startOfMonth;
      if (isRowToday && (safeNote.includes('[Daily]') || safeNote.includes('路人') || safeNote.includes('Raid'))) state.todayBattles++;
      if (isRowThisWeek && (safeNote.includes('[Gym]') || safeNote.includes('道館'))) state.weekGymWins++;
      if (isRowThisMonth && (safeNote.includes('[League]') || safeNote.includes('大會') || safeNote.includes('魔王'))) state.monthLeagueWins++;
    } else if (rowAction === 'E') {
      const nm = safeNote.match(/獲得:\s*([^|]+)/);
      if (nm && state.roster['P0']) {
        const newName = (nm[1].trim().includes('(') ? nm[1].trim() : nm[1].trim() + ' (一般系)');
        state.roster['P0'].baseName = newName;
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

  const rosterArray = [];
  let finalHighestLevel = 5;
  for (const k in state.roster) {
    const p = state.roster[k];
    const lvlInfo = calcLevelAndExp(p.totalExp, p.initialLevel);
    p.currentLevel = lvlInfo.level;
    p.expProgress = lvlInfo.expProgress;
    p.expNeeded = lvlInfo.expNeeded;
    if (p.currentLevel > finalHighestLevel) finalHighestLevel = p.currentLevel;
    rosterArray.push(p);
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
    hasExpShare: state.hasExpShare,
    hasExpertBelt: state.hasExpertBelt,
    hasEviolite: state.hasEviolite,
    hasChampionCloak: state.hasChampionCloak,
    hasAmuletCoin: state.hasAmuletCoin,
    todayCompleted: state.todayCompleted,
    daysSinceLastBadge: state.daysSinceLastBadge,
    roster: rosterArray,
    todayBattles: state.todayBattles,
    weekGymWins: state.weekGymWins,
    monthLeagueWins: state.monthLeagueWins,
    lastUpdated: Timestamp.now()
  };
}

async function getDefaultSubjects() {
  const snapshot = await db.collection(SUBJECTS_COL).orderBy('order').get();
  if (!snapshot.empty) {
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  const defaults = [
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
      ] }
  ];
  const batch = db.batch();
  for (const subj of defaults) {
    const ref = db.collection(SUBJECTS_COL).doc();
    batch.set(ref, subj);
  }
  await batch.commit();
  return defaults;
}

module.exports = {
  getStartOfWeek, getStartOfMonth, calcLevelAndExp,
  getStudentEvents, recalculateStudentState, getDefaultSubjects
};
