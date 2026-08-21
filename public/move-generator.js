// 招式生成器 move-generator.js — v3.1 18屬性 2700 招量產引擎
(function(exports) {
  'use strict';

  var TYPES = ['火', '水', '草', '電', '冰', '格鬥', '毒', '地面', '飛行', '超能力', '蟲', '岩石', '幽靈', '龍', '惡', '鋼', '妖精', '一般'];
  var ROLES = ['ATK', 'SPA', 'BUF', 'DIS', 'ULT'];
  var TIERS = [1, 2, 3, 4, 5];

  var CURVES = {
    ATK: {
      1: [55, 60, 66, 73, 82],
      2: [60, 66, 73, 82, 92],
      3: [65, 72, 80, 90, 102],
      4: [70, 78, 88, 100, 114],
      5: [80, 90, 102, 116, 132]
    },
    SPA: {
      1: [55, 60, 66, 73, 82],
      2: [60, 66, 73, 82, 92],
      3: [65, 72, 80, 90, 102],
      4: [70, 78, 88, 100, 114],
      5: [80, 90, 102, 116, 132]
    },
    BUF: {
      1: [0, 0, 0, 0, 0],
      2: [0, 0, 0, 0, 0],
      3: [0, 0, 0, 0, 0],
      4: [0, 0, 0, 0, 0],
      5: [0, 0, 0, 0, 0]
    },
    DIS: {
      1: [0, 0, 0, 0, 0],
      2: [0, 0, 0, 0, 0],
      3: [0, 0, 0, 0, 0],
      4: [0, 0, 0, 0, 0],
      5: [0, 0, 0, 0, 0]
    },
    ULT: {
      1: [85, 95, 106, 118, 132],
      2: [90, 100, 112, 125, 140],
      3: [95, 106, 118, 132, 148],
      4: [100, 112, 125, 140, 158],
      5: [110, 122, 136, 152, 170]
    }
  };

  var MODIFIER_POOL = {
    ATK: {
      '爆裂重擊': { damageMult: 1.15 },
      '連擊加速': { multiHit: 2, perHitPower: 0.6 }
    },
    SPA: {
      '焚焰穿透': { damageMult: 1.15 },
      '焦油重燃': { damageMult: 1.15 }
    },
    BUF: {
      '持久增幅': { buffRounds: 2 },
      '能量回流': { damageMult: 1.1 }
    },
    DIS: {
      '掣肘壓制': { debuffPower: 1.2 },
      '深層封鎖': { damageMult: 1.1 }
    },
    ULT: {
      '終焉蓄能': { ultDamage: 1.2 },
      '星辰湮滅': { damageMult: 1.2 }
    }
  };

  var TYPE_PREFIXES = {
    '火': ['炎', '爆', '灼', '焰', '烈', '燼'],
    '水': ['水', '湧', '浪', '濤', '潮', '潤'],
    '草': ['藤', '葉', '花', '芽', '綠', '蔓'],
    '電': ['雷', '電', '閃', '震', '霹', '伏'],
    '冰': ['冰', '霜', '凍', '寒', '雪', '零'],
    '格鬥': ['拳', '踢', '打', '勁', '鬥', '霸'],
    '毒': ['毒', '蝕', '瘴', '溶', '劇', '穢'],
    '地面': ['地', '震', '沙', '泥', '坍', '裂'],
    '飛行': ['飛', '羽', '風', '翔', '翼', '疾'],
    '超能力': ['念', '幻', '超', '思', '心', '波'],
    '蟲': ['蟲', '刺', '蛹', '絲', '甲', '蟄'],
    '岩石': ['岩', '石', '崩', '硬', '礫', '礦'],
    '幽靈': ['影', '魂', '幽', '鬼', '詛', '祟'],
    '龍': ['龍', '咆', '鱗', '威', '帝', '極'],
    '惡': ['惡', '暗', '煞', '襲', '狡', '殘'],
    '鋼': ['鋼', '鐵', '金', '刃', '鎧', '堅'],
    '妖精': ['妖', '魅', '仙', '萌', '星', '祈'],
    '一般': ['猛', '重', '衝', '擊', '狂', '極']
  };

  var ROLE_SUFFIXES = {
    ATK: ['重擊', '突襲', '爪擊', '橫掃', '強襲', '崩滅'],
    SPA: ['波導', '衝擊', '光束', '風暴', '新星', '裁決'],
    BUF: ['聚能', '強化', '高昂', '戰意', '屏障', '覺醒'],
    DIS: ['壓制', '封印', '擾亂', '迷霧', '阻滯', '癱瘓'],
    ULT: ['極致爆發', '終焉審判', '天地咆哮', '創世之光', '絕望降臨', '無盡奔流']
  };

  function generateMovesForType(type) {
    var matrix = { ATK: {}, SPA: {}, BUF: {}, DIS: {}, ULT: {} };
    var prefixes = TYPE_PREFIXES[type] || TYPE_PREFIXES['火'];

    for (var r = 0; r < ROLES.length; r++) {
      var role = ROLES[r];
      var suffixes = ROLE_SUFFIXES[role];

      for (var t = 1; t <= 5; t++) {
        var tierKey = 'T' + t;
        var moves = [];

        for (var c = 0; c < 6; c++) {
          var moveName = type + prefixes[c % prefixes.length] + suffixes[c % suffixes.length] + '_T' + t + '_' + (c + 1);
          moves.push(moveName);

          // 註冊 specs
          if (typeof window !== 'undefined' && window.MOVE_SPECS_V31 && !window.MOVE_SPECS_V31[moveName]) {
            window.MOVE_SPECS_V31[moveName] = {
              category: role,
              type: type,
              growth: {
                power: CURVES[role][t],
                acc: 100,
                burn: [0, 0, 0, 0, 0]
              },
              lv5_modifiers: MODIFIER_POOL[role]
            };
          }
        }
        matrix[role][tierKey] = moves;
      }
    }
    return matrix;
  }

  function initAllTypeMatrix() {
    if (typeof window === 'undefined') return;
    if (!window.TIER_MATRIX_V31) window.TIER_MATRIX_V31 = {};
    if (!window.MOVE_SPECS_V31) window.MOVE_SPECS_V31 = {};

    for (var i = 0; i < TYPES.length; i++) {
      var type = TYPES[i];
      if (!window.TIER_MATRIX_V31[type] || type !== '火') {
        window.TIER_MATRIX_V31[type] = generateMovesForType(type);
      }
    }
  }

  // 立即執行初始化
  initAllTypeMatrix();

  exports.TYPES = TYPES;
  exports.generateMovesForType = generateMovesForType;
  exports.initAllTypeMatrix = initAllTypeMatrix;

})(typeof exports !== 'undefined' ? exports : (typeof window !== 'undefined' ? (window.MoveGenerator = {}) : {}));
