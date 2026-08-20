// v3.1 Step 0.1 G2: assert V31_FLAGS exists with 5 keys, all false, ENABLED=false.
// Instead of executing the full dashboard (needs browser/Firebase), parse the
// flag object literal directly from the HTML to keep the gate hermetic.
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const htmlPath = path.join(__dirname, '..', '..', 'frontend', 'kpi-dashboard.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Locate the V31_FLAGS block.
const m = html.match(/window\.V31_FLAGS\s*=\s*\{([\s\S]*?)\};/);
assert.ok(m, 'V31_FLAGS definition not found in kpi-dashboard.html');

const block = m[1];
const parseKey = (name) => {
  const km = block.match(new RegExp('\\b' + name + '\\s*:\\s*(true|false)'));
  return km ? km[1] === 'true' : undefined;
};

// The 5 expected flags.
const flags = ['ENABLED', 'MORPHOLOGY_FILTER', 'SIX_MOVES_PER_TIER', 'SP_ECONOMY_90', 'LV5_MODIFIER'];
for (const f of flags) {
  assert.strictEqual(parseKey(f), false, `flag ${f} must be false`);
  console.log(`PASS  flag ${f} = false`);
}

// Ensure no stray extra flags were introduced.
const known = flags.join('|');
const unknown = block.split('\n').map(l => l.trim()).filter(l => /^\w+\s*:/.test(l) && !new RegExp('\\b(' + known + ')\\b\\s*:').test(l));
assert.strictEqual(unknown.length, 0, `unexpected extra flags: ${unknown.join(', ')}`);

// V31_FLAGS must be attached to window.
assert.ok(/^window\.V31_FLAGS/.test(html.match(/window\.V31_FLAGS\s*=/)[0].trim().split('=')[0].trim()), 'V31_FLAGS must be on window');

console.log('G2 step0.1 gate PASS');
process.exit(0);