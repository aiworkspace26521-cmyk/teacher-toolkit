const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

console.log(`================================================================`);
console.log(`🔧 套用 v3.3 修復：T4/T5 動態連攜徽章 + 切換寶可夢 Modal 即時自動關閉`);
console.log(`================================================================`);

// 1. Fix Pokemon Switch Modal (confirmStPkmnSwitch & openSkillTreePkmnSelector)
const oldModalCode = `function openSkillTreePkmnSelector() {
  var roster = globalData.roster || [];
  var options = "";
  for (var ri = 0; ri < roster.length; ri++) {
    var p = roster[ri];
    var sel = p.id === _skillTreePkmnId ? "selected" : "";
    options += "<option value='" + p.id + "' " + sel + ">" + p.baseName + " Lv." + (p.currentLevel || 5) + "</option>";
  }
  var div = document.createElement("div");
  div.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;";
  div.innerHTML = "<div style='background:white;padding:20px;border-radius:12px;text-align:center;max-width:300px;width:90%;'>" +
    "<h4 style='margin:0 0 10px;'>切換寶可夢</h4>" +
    "<select id='stPkmnSelect' style='width:100%;padding:8px;border-radius:6px;font-weight:700;margin-bottom:12px;'>" + options + "</select>" +
    "<button class='st-sp-btn' style='background:#3B4CCA;color:white;width:100%;padding:8px;' onclick='confirmStPkmnSwitch()'>確認切換</button>" +
    "<button class='st-sp-btn' style='background:#95a5a6;color:white;width:100%;padding:8px;margin-top:6px;' onclick='this.parentElement.parentElement.remove()'>取消</button>" +
    "</div>";
  document.body.appendChild(div);
}

function confirmStPkmnSwitch() {
  var sel = document.getElementById("stPkmnSelect");
  if (sel && sel.value) {
    _skillTreePkmnId = sel.value;
    _skillTreeActiveTab = "atk";
    renderSkillTree();
  }
  var div = document.querySelector("div[style*='z-index:9999']");
  if (div) div.remove();
}`;

const newModalCode = `function openSkillTreePkmnSelector() {
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

if (htmlContent.includes('function confirmStPkmnSwitch')) {
  htmlContent = htmlContent.replace(oldModalCode, newModalCode);
  console.log('✅ 成功修正 confirmStPkmnSwitch 點擊確認切換後 100% 即時關閉 Modal 分頁！');
}

// 2. Expand Synergy Badges to include T4 and T5 moves in renderSkillTree
const oldSynergySection = `// v3.3 Synergy Badge Rendering (Complete T1->T2 Linking)
          if (isTierUnlocked && !isTierLocked && t >= 2 && pkmn.learnedMoves) {
            var learnedNames = Object.keys(pkmn.learnedMoves);
            if (learnedNames.includes('電擊') && (optName === '瘋狂伏特' || optName === '十萬伏特')) {
              canvasHtml += ' <span style="font-size:10px;background:#f39c12;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 麻痺連攜 +25%</span>';
            } else if (learnedNames.includes('電光一閃') && (optName === '伏特交換' || optName === '電球')) {
              canvasHtml += ' <span style="font-size:10px;background:#2980b9;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 速攻連攜 SP-1</span>';
            } else if (learnedNames.includes('撞擊') && (optName === '雷電拳' || optName === '伏特攻擊')) {
              canvasHtml += ' <span style="font-size:10px;background:#e74c3c;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 破甲連攜 防穿+20%</span>';
            } else if (learnedNames.includes('甩尾') && (optName === '充電' || optName === '電氣場地')) {
              canvasHtml += ' <span style="font-size:10px;background:#8e44ad;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 弱點連攜 回復+1</span>';
            }
          }`;

const newSynergySection = `// v3.3 Dynamic Synergy Badge Rendering (T2~T5 Full Matrix Support)
          if (isTierUnlocked && !isTierLocked && t >= 2 && pkmn.learnedMoves) {
            var learnedNames = Object.keys(pkmn.learnedMoves);
            var hasElementControl = learnedNames.some(function(k){ return /電擊|水槍|火花|細雪|藤鞭/.test(k); });
            var hasSpeed = learnedNames.some(function(k){ return /電光一閃|水流噴射|影子分身|高速/.test(k); });
            var hasPhys = learnedNames.some(function(k){ return /撞擊|抓|雷電拳|二連擊/.test(k); });

            if (hasElementControl && (optName === '瘋狂伏特' || optName === '十萬伏特' || optName === '打雷' || optName === '瘋狂雷霆' || optName === '水炮' || optName === '大字爆' || optName === '日光束')) {
              var bonusPct = t >= 4 ? '+30%' : '+25%';
              canvasHtml += ' <span style="font-size:10px;background:#f39c12;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 元素連攜 ' + bonusPct + '</span>';
            } else if (hasSpeed && (optName === '伏特交換' || optName === '電球' || optName === '電漿閃光' || optName === '水流尾')) {
              canvasHtml += ' <span style="font-size:10px;background:#2980b9;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 速攻連攜 SP-1</span>';
            } else if (hasPhys && (optName === '雷電拳' || optName === '伏特攻擊' || optName === '雷霆爆發' || optName === '攀瀑')) {
              var penPct = t >= 4 ? '防穿+30%' : '防穿+20%';
              canvasHtml += ' <span style="font-size:10px;background:#e74c3c;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 破甲連攜 ' + penPct + '</span>';
            } else if (optName === '電氣場地' || optName === '青草場地') {
              canvasHtml += ' <span style="font-size:10px;background:#8e44ad;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 領域連攜 全隊增傷+15%</span>';
            } else if (t === 5 && (optName === '交錯閃電' || optName === '千雷轟頂' || optName === '交錯雷霆毀滅' || optName === '起源波動')) {
              canvasHtml += ' <span style="font-size:10px;background:#d35400;color:white;padding:1px 5px;border-radius:3px;margin-left:4px;font-weight:bold;">🔗 奧義共鳴 傷害+35%</span>';
            }
          }`;

if (htmlContent.includes('// v3.3 Synergy Badge Rendering')) {
  htmlContent = htmlContent.replace(oldSynergySection, newSynergySection);
  console.log('✅ 成功擴充 T4 & T5 動態連攜徽章 (包含打雷/瘋狂雷霆/電漿閃光/電氣場地/奧義共鳴)！');
}

fs.writeFileSync(htmlPath, htmlContent, 'utf8');
