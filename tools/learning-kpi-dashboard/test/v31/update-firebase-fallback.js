const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace(
  /<script defer src="\/__\/firebase\/12\.13\.0\/firebase-app-compat\.js"><\/script>\s*<script defer src="\/__\/firebase\/12\.13\.0\/firebase-auth-compat\.js"><\/script>\s*<script defer src="\/__\/firebase\/12\.13\.0\/firebase-firestore-compat\.js"><\/script>\s*<script defer src="\/__\/firebase\/init\.js\?useEmulator=false"><\/script>/,
  `<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>\n  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>\n  <script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js"></script>\n  <script src="/__/firebase/init.js?useEmulator=false" onerror="console.warn('Firebase init.js not present, fallback config used')"></script>`
);

const oldInit = `if (typeof firebase !== "undefined" && firebase.app) {`;
const newInit = `if (typeof firebase !== "undefined") {
      if (!firebase.apps || !firebase.apps.length) {
        try {
          firebase.initializeApp({
            projectId: "opencodefirebase",
            authDomain: "opencodefirebase.firebaseapp.com",
            storageBucket: "opencodefirebase.appspot.com"
          });
        } catch(eInit) {}
      }`;

if (!content.includes('gstatic.com')) {
  console.error('ERROR: Regex match failed for script tags');
  process.exit(1);
}

content = content.replace(oldInit, newInit);

fs.writeFileSync(targetPath, content, 'utf8');
console.log('SUCCESS: Updated Firebase SDK fallback in kpi-dashboard.html');
