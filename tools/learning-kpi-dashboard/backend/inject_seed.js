const admin = require('firebase-admin');

async function main() {
  admin.initializeApp({
    projectId: 'opencodefirebase',
    credential: admin.credential.applicationDefault()
  });

  const db = admin.firestore();

  // Delete all events for Neil + Emma
  const snap = await db.collection('kpi_events').get();
  let delCount = 0;
  for (const doc of snap.docs) {
    const sid = doc.get('studentId');
    if (sid === 'Neil' || sid === 'Emma') {
      await doc.ref.delete();
      delCount++;
    }
  }
  console.log(`Deleted ${delCount} old events.`);

  // Delete student docs
  for (const id of ['Neil', 'Emma']) {
    try {
      await db.collection('kpi_students').doc(id).delete();
      console.log(`Deleted ${id} doc.`);
    } catch (_) {}
  }

  // Add events
  const batchSize = 10;
  async function addEvents(studentId, events) {
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = db.batch();
      const chunk = events.slice(i, i + batchSize);
      for (const evt of chunk) {
        const ref = db.collection('kpi_events').doc();
        batch.set(ref, {
          ...evt,
          studentId,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      await batch.commit();
    }
    console.log(`+ ${events.length} events for ${studentId}`);
  }

  const badges = ['岩', '水', '雷', '草', '格', '毒', '地', '超'];

  // Neil events
  await addEvents('Neil', [
    {
      type: 'evolution', subType: null,
      pokemonId: 'P0', speciesFrom: '伊布', speciesTo: '仙子伊布',
      flavor: '妖精', level: 5, totalExp: 0
    },
    ...badges.map((g, i) => ({
      type: 'badge', subType: null,
      gymName: `${g}屬性道館`, gymLevel: 5 + i * 3,
      badgeIndex: i, pokemonUsed: ['P0']
    })),
    { type: 'capture', subType: null, pokemonId: 'P1', species: '噴火龍', initLv: 33, level: 33, score: 132 },
    { type: 'capture', subType: null, pokemonId: 'P2', species: '水箭龜', initLv: 30, level: 30, score: 120 },
    { type: 'capture', subType: null, pokemonId: 'P3', species: '妙蛙花', initLv: 30, level: 30, score: 120 },
    { type: 'capture', subType: null, pokemonId: 'P4', species: '路卡利歐', initLv: 25, level: 25, score: 100 },
    { type: 'capture', subType: null, pokemonId: 'P5', species: '尖牙陸鯊', initLv: 20, level: 20, score: 80 },
    { type: 'exp', subType: 'training', pokemonId: 'P5', totalExpGained: 20000, targetLevel: 20 }
  ]);

  // Emma events
  await addEvents('Emma', [
    {
      type: 'evolution', subType: null,
      pokemonId: 'P0', speciesFrom: '伊布', speciesTo: '月亮伊布',
      flavor: '惡', level: 5, totalExp: 0
    },
    ...badges.map((g, i) => ({
      type: 'badge', subType: null,
      gymName: `${g}屬性道館`, gymLevel: 5 + i * 3,
      badgeIndex: i, pokemonUsed: ['P0']
    })),
    { type: 'capture', subType: null, pokemonId: 'P1', species: '耿鬼', initLv: 33, level: 33, score: 132 },
    { type: 'capture', subType: null, pokemonId: 'P2', species: '雷丘', initLv: 30, level: 30, score: 120 },
    { type: 'capture', subType: null, pokemonId: 'P3', species: '沙奈朵', initLv: 30, level: 30, score: 120 },
    { type: 'capture', subType: null, pokemonId: 'P4', species: '暴鯉龍', initLv: 25, level: 25, score: 100 },
    { type: 'capture', subType: null, pokemonId: 'P5', species: '沙基拉斯', initLv: 20, level: 20, score: 80 },
    { type: 'exp', subType: 'training', pokemonId: 'P5', totalExpGained: 20000, targetLevel: 20 }
  ]);

  // Write student docs
  const shared = {
    coins: 3000,
    highestLevel: 35,
    lockedGymLevel: 30,
    potions: 10, revives: 5, candies: 3,
    maxPotions: 3, maxRevives: 2,
    expSharePurchased: true,
    hasQuickClaw: true, hasAmuletCoin: true,
    hasExpertBelt: false, hasEviolite: false,
    hasChampionCloak: false, hasFocusLens: false,
    hasShellBell: false, hasLifeOrb: false,
    hasAssaultVest: false, hasFocusSash: false,
    hasEjectButton: false, hasRockyHelmet: false,
    hasWeaknessPolicy: false,
    oranBerries: 10, cheriBerries: 3,
    lumBerries: 2, chilanBerries: 2,
    todayStatus: "PENDING", todayBattles: 0,
    weekGymWins: 0, monthLeagueWins: 0,
    submitStreak: 3, daysSinceLastBadge: 3,
    simpleMode: false, leagueRegionsWon: {},
    '電擊盒': true, '金屬膜': true, '龍之鱗片': true,
    '王者之證': true, '岩漿盒': false, '護具': false,
    tms: { universal: 3 },
    pokemonTMs: {},
    achievements: [
      'FIRST_CAPTURE', 'FIRST_GYM', 'LV_10',
      'GYM_8', 'EVOLVE', 'COLLECTOR_10'
    ],
    partyIds: ['P0', 'P1', 'P3'],
    badges: 8
  };

  const neilRoster = [
    { id: 'P0', baseName: '⭐ 仙子伊布 (妖精)', initialLevel: 5, totalExp: 120000, catchDate: '初始夥伴', heldItem: '', happiness: 30, currentLevel: 35, expProgress: 0, expNeeded: 10500 },
    { id: 'P1', baseName: '⭐ 噴火龍 (火/飛行)', initialLevel: 33, totalExp: 9900, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 34, expProgress: 100, expNeeded: 10200 },
    { id: 'P2', baseName: '⭐ 水箭龜 (水)', initialLevel: 30, totalExp: 5000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 30, expProgress: 5000, expNeeded: 9000 },
    { id: 'P3', baseName: '⭐ 妙蛙花 (草/毒)', initialLevel: 30, totalExp: 5000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 30, expProgress: 5000, expNeeded: 9000 },
    { id: 'P4', baseName: '⭐ 路卡利歐 (格鬥/鋼)', initialLevel: 25, totalExp: 5000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 25, expProgress: 5000, expNeeded: 5000 },
    { id: 'P5', baseName: '⭐ 尖牙陸鯊 (龍/地面)', initialLevel: 20, totalExp: 4000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 21, expProgress: 50, expNeeded: 4200 }
  ];

  const emmaRoster = [
    { id: 'P0', baseName: '⭐ 月亮伊布 (惡)', initialLevel: 5, totalExp: 120000, catchDate: '初始夥伴', heldItem: '', happiness: 30, currentLevel: 35, expProgress: 0, expNeeded: 10500 },
    { id: 'P1', baseName: '⭐ 耿鬼 (幽靈/毒)', initialLevel: 33, totalExp: 9900, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 34, expProgress: 100, expNeeded: 10200 },
    { id: 'P2', baseName: '⭐ 雷丘 (電)', initialLevel: 30, totalExp: 5000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 30, expProgress: 5000, expNeeded: 9000 },
    { id: 'P3', baseName: '⭐ 沙奈朵 (超能力/妖精)', initialLevel: 30, totalExp: 5000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 30, expProgress: 5000, expNeeded: 9000 },
    { id: 'P4', baseName: '⭐ 暴鯉龍 (水/飛行)', initialLevel: 25, totalExp: 5000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 25, expProgress: 5000, expNeeded: 5000 },
    { id: 'P5', baseName: '⭐ 沙基拉斯 (岩石/地面)', initialLevel: 20, totalExp: 4000, catchDate: '2026/06/25', heldItem: '', happiness: 5, currentLevel: 21, expProgress: 50, expNeeded: 4200 }
  ];

  await db.collection('kpi_students').doc('Neil').set({ ...shared, studentId: 'Neil', roster: neilRoster });
  console.log('Neil doc written.');

  await db.collection('kpi_students').doc('Emma').set({ ...shared, studentId: 'Emma', roster: emmaRoster });
  console.log('Emma doc written.');

  console.log('\nDone!');
}

main().catch(e => { console.error(e); process.exit(1); });
