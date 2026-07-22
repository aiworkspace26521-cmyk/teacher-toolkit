const { setGlobalOptions } = require('firebase-functions');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

admin.initializeApp();
setGlobalOptions({ maxInstances: 10 });

const kpi = require('./kpi-core');
const db = admin.firestore();

exports.getStudentData = onCall(async (request) => {
  const studentId = request.data.studentId;
  if (!studentId) throw new HttpsError('invalid-argument', '需要 studentId');
  try {
    const doc = await db.collection('kpi_students').doc(studentId).get();
    if (doc.exists) {
      logger.info(`Cache hit for ${studentId}`);
      return { ...doc.data(), cached: true };
    }
    const state = await kpi.recalculateStudentState(studentId);
    if (!state) {
      return { studentId, level: 5, coins: 0, badges: 0, roster: [], highestLevel: 5, lockedGymLevel: 5 };
    }
    await db.collection('kpi_students').doc(studentId).set(state, { merge: true });
    logger.info(`Recalculated state for ${studentId}`);
    return { ...state, cached: false };
  } catch (e) {
    logger.error('getStudentData error', e);
    throw new HttpsError('internal', e.message);
  }
});

exports.saveKpiEvent = onCall(async (request) => {
  const data = request.data;
  if (!data.studentId) throw new HttpsError('invalid-argument', '需要 studentId');
  try {
    const safeTasks = Array.isArray(data.tasks) ? data.tasks : [];
    const event = {
      studentId: String(data.studentId),
      tasks: safeTasks,
      score: Number(data.score) || 0,
      action: String(data.action || ''),
      expGained: Number(data.expGained) || 0,
      coinsGained: Number(data.coinsGained) || 0,
      badgeChange: Number(data.badgeChange) || 0,
      note: String(data.note || ''),
      timestamp: admin.firestore.Timestamp.now()
    };
    const ref = await db.collection('kpi_events').add(event);
    logger.info(`Event saved: ${ref.id} for ${data.studentId}`);
    return { success: true, eventId: ref.id };
  } catch (e) {
    logger.error('saveKpiEvent error', e);
    throw new HttpsError('internal', e.message);
  }
});

exports.onKpiEventWritten = onDocumentWritten('kpi_events/{eventId}', async (event) => {
  if (!event.data.after.exists) return;
  const studentId = event.data.after.get('studentId');
  if (!studentId) return;
  // Skip Admin — Admin is a management account, not a real student.
  // Replaying events on Admin would overwrite its state with defaults,
  // corrupting its roster, coins, badges, etc.
  if (studentId === 'Admin') return;
  try {
    const state = await kpi.recalculateStudentState(studentId);
    if (state) {
      await db.collection('kpi_students').doc(studentId).set(state, { merge: true });
      logger.info(`State updated for ${studentId} after event ${event.params.eventId}`);
    }
  } catch (e) {
    logger.error('onKpiEventWritten error', e);
  }
});

exports.getSubjects = onCall(async () => {
  try {
    const subjects = await kpi.getDefaultSubjects();
    return { subjects };
  } catch (e) {
    throw new HttpsError('internal', e.message);
  }
});

exports.resetStudent = onCall(async (request) => {
  const { studentId, confirm } = request.data;
  if (!studentId || !confirm) throw new HttpsError('invalid-argument', '需要 studentId 與確認');
  try {
    const events = await db.collection('kpi_events').where('studentId', '==', studentId).get();
    const batch = db.batch();
    events.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();
    await db.collection('kpi_students').doc(studentId).delete();
    logger.info(`Student ${studentId} data reset`);
    return { success: true };
  } catch (e) {
    throw new HttpsError('internal', e.message);
  }
});

exports.adminAddResource = onCall(async (request) => {
  const { studentId, resourceType, amount, note } = request.data;
  if (!studentId || !resourceType || !amount) throw new HttpsError('invalid-argument', '參數不足');
  try {
    const event = {
      studentId,
      tasks: ['管理員操作'],
      score: 0,
      action: '系統測試',
      expGained: 0,
      coinsGained: resourceType === 'COIN' ? Number(amount) : 0,
      badgeChange: resourceType === 'BADGE' ? Number(amount) : 0,
      note: `管理員發放：${resourceType}+${amount} | ${note || ''}`,
      timestamp: admin.firestore.Timestamp.now()
    };
    const ref = await db.collection('kpi_events').add(event);
    return { success: true, eventId: ref.id };
  } catch (e) {
    throw new HttpsError('internal', e.message);
  }
});

exports.getPvPData = onCall(async (request) => {
  const { studentIds } = request.data;
  if (!studentIds || !Array.isArray(studentIds)) throw new HttpsError('invalid-argument', '需要 studentIds 陣列');
  try {
    const results = {};
    for (const sid of studentIds) {
      const doc = await db.collection('kpi_students').doc(sid).get();
      results[sid] = doc.exists ? doc.data() : null;
    }
    return { students: results };
  } catch (e) {
    throw new HttpsError('internal', e.message);
  }
});
