const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. If (!db) retry
content = content.replace(
  'if (!db) { toast("Firebase initializing..."); return; }',
  `if (!db) {
    toast("⏳ Firebase 初始化連線中，請稍候...");
    var retryCount = 0;
    var initCheckTimer = setInterval(function() {
      retryCount++;
      if (db) {
        clearInterval(initCheckTimer);
        fetchStudentData(studentId, pendingEvent);
      } else if (retryCount > 25) {
        clearInterval(initCheckTimer);
        toast("⚠️ 網路或 Firebase 連線逾時，請重新整理頁面");
        var btnErr = $("submitBtn");
        if (btnErr) { btnErr.textContent = "連線逾時"; btnErr.disabled = false; }
      }
    }, 200);
    return;
  }`
);

// 2. Remove orderBy from query
content = content.replace(
  'var snapshot = await db.collection("kpi_events").where("studentId", "==", studentId).orderBy("timestamp", "asc").get();',
  `var snapshot = await db.collection("kpi_events").where("studentId", "==", studentId).get();
    var events = snapshot.docs.map(function(d){ var o = {id:d.id}; for(var k in d.data()) o[k]=d.data()[k]; return o; });
    events.sort(function(a, b) {
      var tA = a.timestamp ? (a.timestamp.toMillis ? a.timestamp.toMillis() : new Date(a.timestamp).getTime()) : 0;
      var tB = b.timestamp ? (b.timestamp.toMillis ? b.timestamp.toMillis() : new Date(b.timestamp).getTime()) : 0;
      return tA - tB;
    });`
);

// 3. Remove duplicate map line right after replaced query
content = content.replace(
  `var events = snapshot.docs.map(function(d){ var o = {id:d.id}; for(var k in d.data()) o[k]=d.data()[k]; return o; });\n    var events = snapshot.docs.map`,
  `var events = snapshot.docs.map`
);

// 4. Non-fatal set
content = content.replace(
  'await db.collection("kpi_students").doc(studentId).set(refreshed, { merge: true });',
  'try { await db.collection("kpi_students").doc(studentId).set(refreshed, { merge: true }); } catch(eSet) { console.warn("Student doc save non-fatal error:", eSet); }'
);

// 5. Admin roster fallback
content = content.replace(
  'if (!globalData.roster || !globalData.roster.length) globalData.roster = [{ id: "P0", baseName: "\\u{1F43E} \\u4F0A\\u5E03 (\\u4E00\\u822C\\u7CFB)", totalExp: 0, initialLevel: 5, currentLevel: 5, expProgress: 0, expNeeded: 500, catchDate: "\\u521D\\u59CB\\u5925\\u4F34" }];',
  `if (!globalData.roster || !globalData.roster.length) globalData.roster = [{ id: "P0", baseName: "🐾 伊布 (一般系)", totalExp: 0, initialLevel: 5, currentLevel: 5, expProgress: 0, expNeeded: 500, catchDate: "初始夥伴" }];
    if (isAdmin && (!globalData.roster || globalData.roster.length <= 1)) {
      globalData.roster = [
        { id: "P1", baseName: "🔥 小火龍 (火系)", totalExp: 50000, initialLevel: 5, currentLevel: 54, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 245, totalSpEarned: 245, evoStage: 0, learnedMoves: {}, equippedMoves: [] },
        { id: "P2", baseName: "🐎 小火馬 (火系)", totalExp: 50000, initialLevel: 5, currentLevel: 54, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 245, totalSpEarned: 245, evoStage: 0, learnedMoves: {}, equippedMoves: [] },
        { id: "P3", baseName: "💧 水伊布 (水系)", totalExp: 20000, initialLevel: 5, currentLevel: 23, expProgress: 0, expNeeded: 500, catchDate: "管理員測試隊伍", skillPoints: 90, totalSpEarned: 90, evoStage: 1, learnedMoves: {}, equippedMoves: [] }
      ];
    }`
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('SUCCESS: Applied login flow fixes to frontend/kpi-dashboard.html');
