const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(targetPath, 'utf8');

content = content.replace('<script src="/pokemon-gen2-9.js"></script>', '<script src="./pokemon-gen2-9.js"></script>');
content = content.replace('<script src="/pokemon-skill-tree.js"></script>', '<script src="./pokemon-skill-tree.js"></script>');
content = content.replace('<script src="/move-generator.js"></script>', '<script src="./move-generator.js"></script>');

fs.writeFileSync(targetPath, content, 'utf8');
console.log('SUCCESS: Updated relative script paths in kpi-dashboard.html');
