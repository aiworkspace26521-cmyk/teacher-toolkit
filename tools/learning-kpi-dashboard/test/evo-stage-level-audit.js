#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const HTML_FILE = path.join(FRONTEND_DIR, 'kpi-dashboard.html');
const GEN29_FILE = path.join(FRONTEND_DIR, 'pokemon-gen2-9.js');

// ===================== DATA EXTRACTION =====================
const html = fs.readFileSync(HTML_FILE, 'utf8');

function extractPOKEMON_TIERS(src) {
  const pti = src.indexOf('var POKEMON_TIERS = {');
  const ptiEnd = pti + 'var POKEMON_TIERS = {'.length;
  let depth = 1, i = ptiEnd;
  while (depth > 0 && i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    i++;
  }
  return eval('(' + src.substring(pti, i).replace('var POKEMON_TIERS = ', '') + ')');
}

const gen29 = fs.readFileSync(GEN29_FILE, 'utf8');

function extractArray(text, varName) {
  const re = new RegExp('var\\s+' + varName + '\\s*=\\s*(\\[[\\s\\S]*?\\]);');
  const m = text.match(re);
  if (!m) throw new Error('Could not find ' + varName);
  return m[1];
}

function parseArrayLiteral(arrText) {
  const cleaned = arrText.replace(/\/\/.*$/gm, '').replace(/\s+/g, ' ');
  const items = [];
  let pos = cleaned.indexOf('{');
  while (pos !== -1) {
    const end = cleaned.indexOf('}', pos);
    if (end === -1) break;
    items.push(eval('(' + cleaned.substring(pos, end + 1) + ')'));
    pos = cleaned.indexOf('{', end);
  }
  return items;
}

const fullTiers = extractPOKEMON_TIERS(html);

function dedupe(arr) {
  const seen = {}, out = [];
  for (let i = 0; i < arr.length; i++) {
    if (!seen[arr[i].name]) { seen[arr[i].name] = true; out.push(arr[i]); }
  }
  return out;
}

const addCommon = parseArrayLiteral(extractArray(gen29, 'addCommon'));
const addRare = parseArrayLiteral(extractArray(gen29, 'addRare'));
const addLegendary = parseArrayLiteral(extractArray(gen29, 'addLegendary'));
const addCommon2 = parseArrayLiteral(extractArray(gen29, 'addCommon2'));
const addRare2 = parseArrayLiteral(extractArray(gen29, 'addRare2'));
const addLegendary2 = parseArrayLiteral(extractArray(gen29, 'addLegendary2'));

fullTiers['一般'] = dedupe(fullTiers['一般'].concat(addCommon));
fullTiers['稀有'] = dedupe(fullTiers['稀有'].concat(addRare));
fullTiers['傳說'] = dedupe(fullTiers['傳說'].concat(addLegendary));
fullTiers['一般'] = dedupe(fullTiers['一般'].concat(addCommon2));
fullTiers['稀有'] = dedupe(fullTiers['稀有'].concat(addRare2));
fullTiers['傳說'] = dedupe(fullTiers['傳說'].concat(addLegendary2));

const tiers = fullTiers;

// ===================== DERIVED DATA STRUCTURES =====================
const EEVEELUTION_IBU = {
  '雷精靈':'雷伊布', '水精靈':'水伊布', '火精靈':'火伊布',
  '太陽精靈':'太陽伊布', '月亮精靈':'月亮伊布',
  '葉精靈':'葉伊布', '冰精靈':'冰伊布', '仙子精靈':'仙子伊布'
};
const IBU_EEVEELUTION = {};
for (const a in EEVEELUTION_IBU) IBU_EEVEELUTION[EEVEELUTION_IBU[a]] = a;

const eeveelutionIbuNames = new Set(['水伊布','雷伊布','火伊布','太陽伊布','月亮伊布','葉伊布','冰伊布','仙子伊布']);
const eeveelutionAliasNames = new Set(Object.keys(EEVEELUTION_IBU));
const eeveelutionAllNames = new Set(['伊布', ...eeveelutionIbuNames, ...eeveelutionAliasNames]);

function buildEvoStageMap(tiers) {
  const m = {};
  for (const t in tiers) {
    for (const e of tiers[t]) {
      if (m[e.name] === undefined) m[e.name] = 0;
      if (e.evolutions) {
        if (e.eevee) {
          for (let j = 0; j < e.evolutions.length; j++) m[e.evolutions[j]] = 1;
        } else {
          for (let j = 0; j < e.evolutions.length; j++) m[e.evolutions[j]] = j + 1;
        }
      }
    }
  }
  for (const alias in EEVEELUTION_IBU) {
    const ibu = EEVEELUTION_IBU[alias];
    if (m[ibu] !== undefined) m[alias] = m[ibu];
  }
  m['艾比郎'] = 1; m['柯波朗'] = 1;
  m['呆呆王'] = 1; m['櫻花魚'] = 1; m['伽勒爾呆呆王'] = 1;
  m['雪妖女'] = 1; m['艾路雷朵'] = 2;
  m['幸福蛋'] = 2; m['黑夜魔靈'] = 2; m['羅絲雷朵'] = 2; m['劈斧螳螂'] = 2;
  return m;
}

const EVO_STAGE_MAP = buildEvoStageMap(tiers);

function buildEvolvesFrom(tiers) {
  const ef = {};
  for (const t in tiers) {
    for (const p of tiers[t]) {
      if (p.evolutions) {
        for (const e of p.evolutions) {
          if (!ef[e]) ef[e] = [];
          ef[e].push(p.name);
        }
      }
    }
  }
  return ef;
}

const evolvesFrom = buildEvolvesFrom(tiers);

function getChain(name, tiers) {
  let base = name;
  while (evolvesFrom[base] && evolvesFrom[base].length > 0) {
    base = evolvesFrom[base][0];
  }
  for (const t in tiers) {
    for (const p of tiers[t]) {
      if (p.name === base && p.evolutions) {
        return [base].concat(p.evolutions);
      }
    }
  }
  return [name];
}

function findTierEntry(name, tiers) {
  let best = null;
  for (const t in tiers) {
    for (const p of tiers[t]) {
      if (p.name === name) {
        if (!best || (p.evolutions && p.evolutions.length > 0 && !best.evolutions)) {
          best = p;
        }
      }
    }
  }
  return best;
}

// ===================== CORE AUDIT LOGIC =====================
//
// Replicating the frontend getEvolvedName logic exactly:
function getEvolvedName(speciesName, level, tiers) {
  const entry = findTierEntry(speciesName, tiers);
  if (!entry) return speciesName;
  if (entry.eevee) {
    if (level >= 30) return speciesName + ' → eeveelution';
    return speciesName;
  }
  if (entry.evolutions && entry.evolutions.length > 0) {
    const stage = Math.floor(level / 15);
    if (stage === 0) return speciesName;
    const idx = Math.min(stage - 1, entry.evolutions.length - 1);
    return entry.evolutions[idx];
  }
  if (EVO_STAGE_MAP[speciesName] > 0) {
    const minLevel = EVO_STAGE_MAP[speciesName] * 15;
    if (level < minLevel) {
      let searchName = speciesName;
      if (EEVEELUTION_IBU[speciesName]) searchName = EEVEELUTION_IBU[speciesName];
      for (const t in tiers) {
        for (const _p of tiers[t]) {
          if (_p.evolutions && _p.evolutions.indexOf(searchName) !== -1) {
            const cs = Math.floor(level / 15);
            if (cs === 0) return _p.name;
            const idx2 = Math.min(cs - 1, _p.evolutions.length - 1);
            return _p.evolutions[idx2];
          }
        }
      }
    }
  }
  return speciesName;
}

// ===================== AUDIT: Level Gate Correctness =====================
console.log('=== EVO_STAGE_MAP × LEVEL AUDIT ===');
console.log('');

// Collect all species
const allSpecies = {};
const speciesWithEvo = {};
for (const t in tiers) {
  for (const p of tiers[t]) {
    if (!allSpecies[p.name]) {
      allSpecies[p.name] = { type: 'base', entry: p, tier: t };
    }
    if (!speciesWithEvo[p.name] || (p.evolutions && p.evolutions.length > 0)) {
      speciesWithEvo[p.name] = p;
    }
    if (p.evolutions) {
      for (const e of p.evolutions) {
        if (!allSpecies[e]) {
          allSpecies[e] = { type: 'evolved', entry: { name: e }, tier: t };
        }
      }
    }
  }
}

console.log('Total unique species:', Object.keys(allSpecies).length);
console.log('EVO_STAGE_MAP entries:', Object.keys(EVO_STAGE_MAP).length);

// Audit 1: Every species in POKEMON_TIERS has EVO_STAGE_MAP entry
let errors = [];
for (const s in allSpecies) {
  if (EVO_STAGE_MAP[s] === undefined) {
    errors.push(`[MISSING] ${s} missing from EVO_STAGE_MAP`);
  }
}

// Audit 2: For every base form with evolutions, verify level gates produce correct form
const levelBreaks = [0, 5, 10, 14, 15, 20, 25, 29, 30, 35, 40, 45, 50, 55, 60];
let levelErrors = [];

for (const s in speciesWithEvo) {
  const entry = speciesWithEvo[s];
  if (entry.eevee) {
    // Eevee: Lv<30 → 伊布, Lv>=30 → random eeveelution
    for (const lv of levelBreaks) {
      const result = getEvolvedName(s, lv, tiers);
      if (lv < 30 && result !== s) {
        levelErrors.push(`[EEVEE] ${s} at Lv${lv}: expected ${s}, got ${result}`);
      }
      if (lv >= 30 && result === s) {
        levelErrors.push(`[EEVEE] ${s} at Lv${lv}: expected eeveelution, got ${result}`);
      }
    }
    continue;
  }

  if (!entry.evolutions || entry.evolutions.length === 0) {
    // No evolutions defined; skip (standalone evolved forms handled below)
    continue;
  }

  const evos = entry.evolutions;
  const maxStage = evos.length;

  for (const lv of levelBreaks) {
    const stageIdx = Math.floor(lv / 15);
    let expected;
    if (stageIdx === 0) {
      expected = s;
    } else {
      expected = evos[Math.min(stageIdx - 1, maxStage - 1)];
    }
    const actual = getEvolvedName(s, lv, tiers);
    if (actual !== expected) {
      levelErrors.push(`[LEVEL] ${s} at Lv${lv}: expected ${expected}, got ${actual} (evos: [${evos.join(', ')}])`);
    }
  }
}

// Audit 3: For every evolved form (standalone entry, EVO_STAGE_MAP > 0), verify level downgrade logic
const KNOWN_OVERRIDES = new Set(['艾比郎', '柯波朗', '呆呆王', '櫻花魚', '伽勒爾呆呆王', '雪妖女', '艾路雷朵', '幸福蛋', '黑夜魔靈', '羅絲雷朵']);

for (const s in allSpecies) {
  if (speciesWithEvo[s]) continue; // already checked above
  const stage = EVO_STAGE_MAP[s];
  if (stage === undefined || stage === 0) continue;
  if (eeveelutionAllNames.has(s)) continue;

  const minLevel = stage * 15;

  for (const lv of levelBreaks) {
    const actual = getEvolvedName(s, lv, tiers);
    if (lv < minLevel) {
      // Should downgrade to a lower form
      if (actual === s) {
        levelErrors.push(`[DEVOLVE] ${s} (stage ${stage}) at Lv${lv}: expected lower form, got ${actual} (minLevel=${minLevel})`);
      }
    } else {
      // At or above min level → should stay as itself or higher
      const chain = getChain(s, tiers);
      const idxInChain = chain.indexOf(s);
      if (idxInChain >= 0) {
        const expectedStage = idxInChain;
        const lvStage = Math.floor(lv / 15);
        const expectedIdx = Math.min(lvStage, chain.length - 1);
        // For a standalone evolved form at high level, it should return the last form in chain
        if (lvStage >= stage && actual !== s) {
          // If it's reverting to a lower form at an inappropriate level, flag it
          const chainStage = Math.floor(lv / 15);
          if (chainStage >= stage && chain.indexOf(actual) < chain.indexOf(s)) {
            if (!KNOWN_OVERRIDES.has(s)) {
              levelErrors.push(`[REVERT] ${s} at Lv${lv}: reverted to ${actual}, chain=${chain.join('→')}`);
            }
          }
        }
      }
    }
  }
}

// Audit 4: EVO_STAGE_MAP stage vs chain position consistency (skip eevee)
let chainErrors = [];
for (const s in allSpecies) {
  if (eeveelutionAllNames.has(s)) continue;
  const stage = EVO_STAGE_MAP[s];
  if (stage === undefined) continue;
  const chain = getChain(s, tiers);
  const chainIdx = chain.indexOf(s);
  if (chainIdx >= 0 && chainIdx !== stage && !KNOWN_OVERRIDES.has(s)) {
    chainErrors.push(`[CHAIN] ${s}: EVO_STAGE_MAP=${stage}, chain idx=${chainIdx} (chain: ${chain.join('→')})`);
  }
}

// Audit 5: For each base species, verify capture level → form mapping
// When a Pokémon is caught at a certain level, what form should it appear as?
console.log('--- Audit 1: Missing EVO_STAGE_MAP entries ---');
if (errors.length === 0) {
  console.log('  PASS: All species have EVO_STAGE_MAP entries');
} else {
  for (const e of errors) console.log(`  FAIL: ${e}`);
}

console.log('');
console.log('--- Audit 2: Level gate correctness (base forms with evolutions) ---');
const levelErrorsBySpecies = {};
for (const e of levelErrors) {
  const species = e.match(/^\[(\w+)\]\s+(\S+)/);
  const key = species ? species[2] : 'unknown';
  if (!levelErrorsBySpecies[key]) levelErrorsBySpecies[key] = [];
  levelErrorsBySpecies[key].push(e);
}
console.log(`  Errors: ${levelErrors.length}, Affected species: ${Object.keys(levelErrorsBySpecies).length}`);

console.log('');
console.log('--- Audit 3: Chain consistency (EVO_STAGE_MAP vs chain index) ---');
if (chainErrors.length === 0) {
  console.log('  PASS: All EVO_STAGE_MAP values match chain position');
} else {
  for (const e of chainErrors) console.log(`  FAIL: ${e}`);
}

// Detailed breakdown
console.log('');
console.log('=== DETAILED SPECIES REPORT (level evolution) ===');
console.log('');

const reportSpecies = Object.keys(speciesWithEvo).sort((a, b) => {
  const sa = EVO_STAGE_MAP[a] || 0;
  const sb = EVO_STAGE_MAP[b] || 0;
  return sa - sb || a.localeCompare(b, 'zh');
});

let passCount = 0, failCount = 0;
for (const s of reportSpecies) {
  const entry = speciesWithEvo[s];
  if (entry.eevee) continue;
  if (!entry.evolutions || entry.evolutions.length === 0) continue;

  const chain = getChain(s, tiers);
  const stage = EVO_STAGE_MAP[s];
  const speciesErrors = levelErrorsBySpecies[s] || [];

  const forms = [];
  for (let lv = 0; lv <= 60; lv += 5) {
    forms.push(getEvolvedName(s, lv, tiers));
  }

  const status = speciesErrors.length === 0 ? 'PASS' : 'FAIL';
  if (speciesErrors.length === 0) passCount++; else failCount++;

  console.log(`${status} | ${s.padEnd(6)} | stage=${stage} | chain=[${chain.join('→')}] | Lv0-60: ${forms.join(' → ')}`);
  if (speciesErrors.length > 0) {
    for (const err of speciesErrors.slice(0, 3)) {
      console.log(`      ${err}`);
    }
    if (speciesErrors.length > 3) console.log(`      ... and ${speciesErrors.length - 3} more`);
  }
}

console.log('');
console.log('=== SUMMARY ===');
console.log(`Pass: ${passCount}, Fail: ${failCount}, Chain errors: ${chainErrors.length}, Missing: ${errors.length}`);
console.log('');

// Special edge cases report
console.log('=== EDGE CASE SPOT CHECK ===');
const edgeCases = [
  '伊布', '雷精靈', '仙子精靈',
  '幸福蛋', '吉利蛋', '小福蛋',
  '黑夜魔靈', '彷徨夜靈', '夜巡靈',
  '羅絲雷朵', '毒薔薇', '含羞苞',
  '艾路雷朵', '沙奈朵', '奇魯莉安', '拉魯拉絲',
  '大食花', '口呆花', '喇叭芽',
  '艾比郎', '沙瓦郎', '巴爾郎',
  '呆呆王', '呆殼獸', '呆呆獸',
  '雪妖女', '冰鬼護', '雪童子',
];

for (const s of edgeCases) {
  const chain = getChain(s, tiers);
  const stage = EVO_STAGE_MAP[s] !== undefined ? EVO_STAGE_MAP[s] : '?';
  const forms = [];
  for (let lv = 0; lv <= 60; lv += 5) {
    forms.push(getEvolvedName(s, lv, tiers));
  }
  console.log(`${s.padEnd(8)} | stage=${String(stage).padEnd(1)} | chain=[${chain.join('→')}] | ${forms.join(' → ')}`);
}

console.log('');
console.log('========================================');
console.log('AUDIT COMPLETE');
console.log('========================================');
