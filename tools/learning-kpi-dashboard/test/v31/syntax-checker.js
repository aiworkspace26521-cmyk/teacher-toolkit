const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
const html = fs.readFileSync(filePath, 'utf8');

// Extract all inline <script> contents
const scriptRegex = /<script>([\s\S]*?)<\/script>/g;
let match;
let scriptIndex = 0;

while ((match = scriptRegex.exec(html)) !== null) {
  scriptIndex++;
  const code = match[1];
  const tempFile = path.resolve(__dirname, `temp_script_${scriptIndex}.js`);
  fs.writeFileSync(tempFile, code, 'utf8');

  try {
    require('child_process').execSync(`node --check "${tempFile}"`);
    console.log(`✅ Inline <script #${scriptIndex}> syntax check PASSED`);
  } catch (err) {
    console.error(`❌ Inline <script #${scriptIndex}> syntax check FAILED:`);
    console.error(err.output ? err.output.toString() : err.message);
  } finally {
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }
}
