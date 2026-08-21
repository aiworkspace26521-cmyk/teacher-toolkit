const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
  'timeoutMs = timeoutMs || 2000;',
  'timeoutMs = timeoutMs || 800;'
);

content = content.replace(
  'safeFirestoreGet(db.collection("kpi_events").where("studentId", "==", studentId).get(), 2500)',
  'safeFirestoreGet(db.collection("kpi_events").where("studentId", "==", studentId).get(), 800)'
);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('SUCCESS: Reduced Firestore timeout to 800ms');
