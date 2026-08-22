const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

const modalRegex = /function openSkillTreePkmnSelector\(\) \{[\s\S]*?var div = document\.querySelector\("div\[style\*='z-index:9999'\]"\);\s*if \(div\) div\.remove\(\);\s*\}/;

const targetNew = `function openSkillTreePkmnSelector() {
  var roster = globalData.roster || [];
  var options = "";
  for (var ri = 0; ri < roster.length; ri++) {
    var p = roster[ri];
    var sel = p.id === _skillTreePkmnId ? "selected" : "";
    options += "<option value='" + p.id + "' " + sel + ">" + p.baseName + " Lv." + (p.currentLevel || 5) + "</option>";
  }
  var existingModal = document.getElementById("stPkmnSelectorModal");
  if (existingModal) existingModal.remove();

  var div = document.createElement("div");
  div.id = "stPkmnSelectorModal";
  div.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;";
  div.innerHTML = "<div style='background:white;padding:20px;border-radius:12px;text-align:center;max-width:300px;width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.3);'>" +
    "<h4 style='margin:0 0 10px;color:#2c3e50;'>切換寶可夢</h4>" +
    "<select id='stPkmnSelect' style='width:100%;padding:8px;border-radius:6px;font-weight:700;margin-bottom:12px;border:1px solid #ccc;'>" + options + "</select>" +
    "<button class='st-sp-btn' style='background:#3B4CCA;color:white;width:100%;padding:8px;font-weight:bold;cursor:pointer;' onclick='confirmStPkmnSwitch()'>確認切換</button>" +
    "<button class='st-sp-btn' style='background:#95a5a6;color:white;width:100%;padding:8px;margin-top:6px;cursor:pointer;' onclick='closeSkillTreePkmnSelector()'>取消</button>" +
    "</div>";
  document.body.appendChild(div);
}

function closeSkillTreePkmnSelector() {
  var modal = document.getElementById("stPkmnSelectorModal");
  if (modal) modal.remove();
}

function confirmStPkmnSwitch() {
  var sel = document.getElementById("stPkmnSelect");
  if (sel && sel.value) {
    _skillTreePkmnId = sel.value;
    _skillTreeActiveTab = "atk";
    renderSkillTree();
  }
  closeSkillTreePkmnSelector();
}`;

if (!modalRegex.test(htmlContent)) {
  console.error('❌ Error: modalRegex did not match kpi-dashboard.html');
  process.exit(1);
}

htmlContent = htmlContent.replace(modalRegex, targetNew);
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log('✅ 100% 精準以 Regex 替換 openSkillTreePkmnSelector 與 confirmStPkmnSwitch 關閉邏輯！');
