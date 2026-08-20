// v3.1 G1: extract inline <script> blocks from an HTML file and `node --check` each.
// Usage: node test/v31/extract-check.js <path-to-html>
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

const htmlPath = process.argv[2];
if (!htmlPath) {
  console.error('Usage: node test/v31/extract-check.js <path-to-html>');
  process.exit(2);
}
if (!fs.existsSync(htmlPath)) {
  console.error('File not found: ' + htmlPath);
  process.exit(2);
}

const html = fs.readFileSync(htmlPath, 'utf8');
// Match inline scripts (no src=), including type-less and application/javascript.
const re = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let m, idx = 0, failed = 0, count = 0;

while ((m = re.exec(html)) !== null) {
  count++;
  const code = m[1];
  if (!code.trim()) continue;
  // Strip HTML-escaped entities that would break JS syntax (rare; keep simple).
  const tmp = path.join(os.tmpdir(), `v31-extract-${process.pid}-${idx++}.js`);
  fs.writeFileSync(tmp, code, 'utf8');
  const r = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
  fs.unlinkSync(tmp);
  if (r.status !== 0) {
    failed++;
    console.error(`[FAIL] inline script #${idx} syntax error:`);
    console.error(r.stderr);
  } else {
    console.log(`[ok] inline script #${idx} checked (${code.length} bytes)`);
  }
}

console.log(`G1 inline scripts checked: ${count} found, ${failed} failed`);
process.exit(failed ? 1 : 0);