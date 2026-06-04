#!/usr/bin/env node
// encoding-check.js — Pre-commit / CI gate for UTF-8 validity
// Run: node tools/scripts/encoding-check.js
// Returns exit code 0 if all JS/HTML files pass, 1 if any fail.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const CHECK_DIRS = [
  'tools/learning-kpi-dashboard/frontend',
  'public',
];

const EXTENSIONS = ['.js', '.html'];
const GARBLED_PATTERNS = [
  // Common mojibake patterns — Big5 bytes misread as UTF-8
  /鍩庨兘/, /鎴撮/, /榛戦/, /鍦熷湴/, /闆峰叕/, /鐐庡笣/, /姘村悰/,
  // Generic CJK replacement char
  /\uFFFD/,
];

let failures = 0;

for (const dir of CHECK_DIRS) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) continue;

  const files = fs.readdirSync(fullDir).filter(f =>
    EXTENSIONS.includes(path.extname(f).toLowerCase())
  );

  for (const file of files) {
    const filePath = path.join(fullDir, file);
    const buf = fs.readFileSync(filePath);

    // 1. Check for UTF-8 validity
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    if (text.includes('\uFFFD')) {
      console.error(`❌ ${filePath}: Contains U+FFFD (replacement char) — encoding corruption`);
      failures++;
      continue;
    }

    // 2. Check for known mojibake patterns
    for (const pattern of GARBLED_PATTERNS) {
      if (pattern.test(text)) {
        console.error(`❌ ${filePath}: Matches mojibake pattern ${pattern}`);
        failures++;
        break;
      }
    }

    // 3. If .html, check script tag balance
    if (file.endsWith('.html')) {
      const openCount = (text.match(/<script[\s>]/g) || []).length;
      const closeCount = (text.match(/<\/script>/g) || []).length;
      if (openCount !== closeCount) {
        console.error(`❌ ${filePath}: <script> tag mismatch — ${openCount} opens vs ${closeCount} closes`);
        failures++;
      }
    }

    // 4. If .js, try VM compile
    if (file.endsWith('.js')) {
      try {
        require('vm').compileFunction(text);
      } catch (e) {
        console.error(`❌ ${filePath}: VM compile failed — ${e.message.slice(0, 80)}`);
        failures++;
      }
    }
  }
}

if (failures === 0) {
  console.log('✅ Encoding check passed — all files clean');
  process.exit(0);
} else {
  console.error(`❌ ${failures} file(s) failed encoding check`);
  process.exit(1);
}
