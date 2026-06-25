const path = require('path');
const admin = require(path.join(__dirname, 'node_modules', 'firebase-admin'));

async function main() {
  // Try initializing with application default credentials
  try {
    admin.initializeApp({
      projectId: 'opencodefirebase',
      credential: admin.credential.applicationDefault()
    });
    console.log('Initialized with ADC');
  } catch (e) {
    console.error('ADC failed:', e.message);
    try {
      admin.initializeApp({ projectId: 'opencodefirebase' });
      console.log('Initialized without explicit credential');
    } catch (e2) {
      console.error('Fallback failed:', e2.message);
      process.exit(1);
    }
  }

  const db = admin.firestore();
  const eventsCol = db.collection('kpi_events');
  const studentsCol = db.collection('kpi_students');

  // STEP 1: Clear old events for Neil and Emma
  console.log('Clearing old events...');
  let cleared = 0;
  const snap = await eventsCol.get();
  for (const doc of snap.docs) {
    const data = doc.data();
    if (data.studentId === 'Neil' || data.studentId === 'Emma') {
      await doc.ref.delete();
      cleared++;
    }
  }
  console.log(`Cleared ${cleared} old events`);

  // STEP 2: Clear old student docs
  console.log('Clearing old student docs...');
  for (const id of ['Neil', 'Emma']) {
    try {
      await studentsCol.doc(id).delete();
      console.log(`Deleted ${id} student doc`);
    } catch (e) {
      console.log(`${id} student doc not found or error: ${e.message}`);
    }
  }

  // STEP 3: Write events + student docs
  // Helper to add event
  async function addEvent(studentId, type, subType, data) {
    const ref = eventsCol.doc();
    const event = {
      studentId,
      type,
      subType,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ...data
    };
    await ref.set(event);
    return ref.id;
  }

  // === NEIL ===
  // P0 evolution: Eevee -> Sylveon
  await addEvent('Neil', 'evolution', null, {
    pokemonId: 'P0',
    speciesFrom: '伊布',
    speciesTo: '仙子伊布',
    flavor: '妖精',
    level: 5,
    totalExp: 0
  });

  // 8 gym badges
  const badges = ['岩', '水', '雷', '草', '格', '毒', '地', '超'];
  for (let i = 0; i < 8; i++) {
    await addEvent('Neil', 'badge', null, {
      gymName: `${badges[i]}属性道館`,
      gymLevel: 5 + i * 3,
      badgeIndex: i,
      pokemonUsed: ['P0']
    });
  }

  // Captures
  const captures = [
    { pid: 'P1', name: '噴火龍', initLv: 33, score: 132 },
    { pid: 'P2', name: '水箭龜', initLv: 30, score: 120 },
    { pid: 'P3', name: '妙蛙花', initLv: 30, score: 120 },
    { pid: 'P4', name: '路卡利歐', initLv: 25, score: 100 },
    { pid: 'P5', name: '尖牙陸鯊', initLv: 20, score: 80 }
  ];
  for (const c of captures) {
    await addEvent('Neil', 'capture', null, {
      pokemonId: c.pid,
      species: c.name,
      initLv: c.initLv,
      level: c.initLv,
      score: c.score
    });
  }

  // EXP events for P5 (Lv13 -> Lv20)
  await addEvent('Neil', 'exp', 'training', {
    pokemonId: 'P5',
    totalExpGained: 20000,
    targetLevel: 20
  });

  // === EMMA ===
  // P0 evolution: Eevee -> Umbreon
  await addEvent('Emma', 'evolution', null, {
    pokemonId: 'P0',
    speciesFrom: '伊布',
    speciesTo: '月亮伊布',
    flavor: '惡',
    level: 5,
    totalExp: 0
  });

  // 8 badges
  for (let i = 0; i < 8; i++) {
    await addEvent('Emma', 'badge', null, {
      gymName: `${badges[i]}屬性道館`,
      gymLevel: 5 + i * 3,
      badgeIndex: i,
      pokemonUsed: ['P0']
    });
  }

  // Captures
  const eCaptures = [
    { pid: 'P1', name: '耿鬼', initLv: 33, score: 132 },
    { pid: 'P2', name: '雷丘', initLv: 30, score: 120 },
    { pid: 'P3', name: '沙奈朵', initLv: 30, score: 120 },
    { pid: 'P4', name: '暴鯉龍', initLv: 25, score: 100 },
    { pid: 'P5', name: '沙基拉斯', initLv: 20, score: 80 }
  ];
  for (const c of eCaptures) {
    await addEvent('Emma', 'capture', null, {
      pokemonId: c.pid,
      species: c.name,
      initLv: c.initLv,
      level: c.initLv,
      score: c.score
    });
  }

  await addEvent('Emma', 'exp', 'training', {
    pokemonId: 'P5',
    totalExpGained: 20000,
    targetLevel: 20
  });

  console.log('All events written successfully!');
  console.log(`Total events written: ${2 + 16 + 10 + 2} (2 evo + 16 badge + 10 capture + 2 exp)`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
