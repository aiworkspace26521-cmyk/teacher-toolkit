const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Enable V31_FLAGS by default
content = content.replace(
  `window.V31_FLAGS = {
  ENABLED: false,        // 總開關
  MORPHOLOGY_FILTER: false,
  SIX_MOVES_PER_TIER: false,
  SP_ECONOMY_90: false,
  LV5_MODIFIER: false,
};`,
  `window.V31_FLAGS = {
  ENABLED: true,         // 總開關 (預設啟用 v3.1)
  MORPHOLOGY_FILTER: true,
  SIX_MOVES_PER_TIER: true,
  SP_ECONOMY_90: true,
  LV5_MODIFIER: true,
};`
);

// 2. Dynamic threshold calculation helper inside renderSkillTree()
const oldThresholdCalc = `    var maxSp = TIER_SP_THRESHOLD[5] || 30;`;
const newThresholdCalc = `    var activeThresh = (window.V31_FLAGS && window.V31_FLAGS.SP_ECONOMY_90) ? (window.TIER_SP_THRESHOLD_V31 || { 1: 0, 2: 3, 3: 8, 4: 15, 5: 24 }) : (window.TIER_SP_THRESHOLD || { 1: 0, 2: 5, 3: 12, 4: 20, 5: 30 });
    var maxSp = activeThresh[5] || 24;`;

content = content.replace(oldThresholdCalc, newThresholdCalc);

content = content.replace(
  `  var tierSpThresholds = [0, 0, 5, 12, 20, 30];`,
  `  var activeThresh = (window.V31_FLAGS && window.V31_FLAGS.SP_ECONOMY_90) ? (window.TIER_SP_THRESHOLD_V31 || { 1: 0, 2: 3, 3: 8, 4: 15, 5: 24 }) : (window.TIER_SP_THRESHOLD || { 1: 0, 2: 5, 3: 12, 4: 20, 5: 30 });
  var tierSpThresholds = [0, 0, activeThresh[2], activeThresh[3], activeThresh[4], activeThresh[5]];`
);

content = content.replace(
  `    var tierSpNeeded = TIER_SP_THRESHOLD[t];`,
  `    var activeThresh = (window.V31_FLAGS && window.V31_FLAGS.SP_ECONOMY_90) ? (window.TIER_SP_THRESHOLD_V31 || { 1: 0, 2: 3, 3: 8, 4: 15, 5: 24 }) : (window.TIER_SP_THRESHOLD || { 1: 0, 2: 5, 3: 12, 4: 20, 5: 30 });
    var tierSpNeeded = activeThresh[t];`
);

content = content.replace(
  `      var tierPrevSp = TIER_SP_THRESHOLD[Math.max(1, t - 1)] || 0;
      var tierNextSp = TIER_SP_THRESHOLD[Math.min(t + 1, 5)] || TIER_SP_THRESHOLD[5];`,
  `      var tierPrevSp = activeThresh[Math.max(1, t - 1)] || 0;
      var tierNextSp = activeThresh[Math.min(t + 1, 5)] || activeThresh[5];`
);

// 3. Add Lv.5 Upgrade & Dual-Branch Modifier Buttons in SIX_MOVES_PER_TIER rendering
const oldPickedRender = `            if (isPickedOpt) {
              canvasHtml += " <b>✓已選</b>";
              var optRec = pkmn.learnedMoves[optName];
              var optLv = optRec ? (optRec.level || 1) : 1;
              canvasHtml += " <small style='color:#8e44ad;'>Lv." + optLv + "/5</small>";
            }`;

const newPickedRender = `            if (isPickedOpt) {
              canvasHtml += " <b>✓已選</b>";
              var optRec = pkmn.learnedMoves[optName];
              var optLv = optRec ? (optRec.level || 1) : 1;
              canvasHtml += " <small style='color:#8e44ad;'>Lv." + optLv + "/5</small>";
              if (optLv < 5) {
                canvasHtml += " <button class='st-upgrade-btn' style='background:#3498db;color:white;margin-left:4px;' onclick='event.stopPropagation();upgradeMoveInSkillTreeV31(\"" + optName + "\")'>+1SP 升級</button>";
              } else if (window.V31_FLAGS && window.V31_FLAGS.LV5_MODIFIER) {
                var modSelected = pkmn.modifiers && pkmn.modifiers[optName];
                if (modSelected) {
                  canvasHtml += " <span class='st-variant-name'>✨ " + modSelected + "</span>";
                } else {
                  var optSpec = typeof getMoveSpecV31 === "function" ? getMoveSpecV31(optName) : null;
                  if (optSpec && optSpec.lv5_modifiers) {
                    var branches = Object.keys(optSpec.lv5_modifiers);
                    for (var bi = 0; bi < branches.length; bi++) {
                      var bName = branches[bi];
                      canvasHtml += " <button class='st-upgrade-btn' style='background:#9b59b6;color:white;margin-left:2px;' onclick='event.stopPropagation();applySkillModifierV31(\"" + optName + "\", \"" + bName + "\")'>✨ " + bName + " (3SP)</button>";
                    }
                  }
                }
              }
            }`;

content = content.replace(oldPickedRender, newPickedRender);

// 4. Add V31 toggle button in admin panel
const oldAdminBtns = `<button class="admin-btn" onclick="sfx.click();devAdd('EXP',2000)">✨ +2000 EXP</button>`;
const newAdminBtns = `<button class="admin-btn" onclick="sfx.click();devAdd('EXP',2000)">✨ +2000 EXP</button>
        <button class="admin-btn" id="v31ToggleBtn" style="background:#8e44ad;" onclick="sfx.click();toggleV31Flags()">⚡ v3.1系統: ON</button>`;

if (content.includes(oldAdminBtns) && !content.includes('v31ToggleBtn')) {
  content = content.replace(oldAdminBtns, newAdminBtns);
}

// 5. Add toggleV31Flags helper function
const oldToggleHelper = `function forceAdminUpdate() {`;
const newToggleHelper = `function toggleV31Flags() {
  if (!window.V31_FLAGS) return;
  var nextState = !window.V31_FLAGS.ENABLED;
  window.V31_FLAGS.ENABLED = nextState;
  window.V31_FLAGS.MORPHOLOGY_FILTER = nextState;
  window.V31_FLAGS.SIX_MOVES_PER_TIER = nextState;
  window.V31_FLAGS.SP_ECONOMY_90 = nextState;
  window.V31_FLAGS.LV5_MODIFIER = nextState;
  var btn = document.getElementById("v31ToggleBtn");
  if (btn) {
    btn.style.background = nextState ? "#8e44ad" : "#7f8c8d";
    btn.innerHTML = nextState ? "⚡ v3.1系統: ON" : "⚡ v3.1系統: OFF";
  }
  toast(nextState ? "⚡ 已切換至 3.1 版技能樹系統" : "🔄 已切換至 2.0 版舊技能樹系統");
  if (typeof renderSkillTree === "function") renderSkillTree();
}

function forceAdminUpdate() {`;

if (content.includes(oldToggleHelper) && !content.includes('toggleV31Flags()')) {
  content = content.replace(oldToggleHelper, newToggleHelper);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('SUCCESS: Applied v3.1 UI fixes to kpi-dashboard.html');
