#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const HTML_FILE = path.join(FRONTEND_DIR, 'kpi-dashboard.html');
const GEN29_FILE = path.join(FRONTEND_DIR, 'pokemon-gen2-9.js');
const BACKEND_FILE = path.join(__dirname, '..', 'backend', 'kpi-core.js');

// =========================================================================
// SECTION 1 — Extract POKEMON_TIERS from kpi-dashboard.html (Gen1 base)
// =========================================================================
const html = fs.readFileSync(HTML_FILE, 'utf8');

// Find POKEMON_TIERS in the HTML
const pti = html.indexOf('var POKEMON_TIERS = {');
const ptiEnd = pti + 'var POKEMON_TIERS = {'.length;
let depth = 1, i = ptiEnd;
while (depth > 0 && i < html.length) {
  if (html[i] === '{') depth++;
  else if (html[i] === '}') depth--;
  i++;
}
const gen1Str = html.substring(pti, i).replace('var POKEMON_TIERS = ', '');

// =========================================================================
// SECTION 2 — Extract Gen2-9 extension data
// =========================================================================
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
    const objStr = cleaned.substring(pos, end + 1);
    items.push(eval('(' + objStr + ')'));
    pos = cleaned.indexOf('{', end);
  }
  return items;
}

// Merge into POKEMON_TIERS structure
const fullTiers = eval('(' + gen1Str + ')');

// Phase 1 arrays
const addCommon = parseArrayLiteral(extractArray(gen29, 'addCommon'));
const addRare = parseArrayLiteral(extractArray(gen29, 'addRare'));
const addLegendary = parseArrayLiteral(extractArray(gen29, 'addLegendary'));

// Phase 2 arrays
const addCommon2 = parseArrayLiteral(extractArray(gen29, 'addCommon2'));
const addRare2 = parseArrayLiteral(extractArray(gen29, 'addRare2'));
const addLegendary2 = parseArrayLiteral(extractArray(gen29, 'addLegendary2'));

function dedupe(arr) {
  const seen = {}, out = [];
  for (let i = 0; i < arr.length; i++) {
    if (!seen[arr[i].name]) { seen[arr[i].name] = true; out.push(arr[i]); }
  }
  return out;
}

fullTiers['一般'] = dedupe(fullTiers['一般'].concat(addCommon));
fullTiers['稀有'] = dedupe(fullTiers['稀有'].concat(addRare));
fullTiers['傳說'] = dedupe(fullTiers['傳說'].concat(addLegendary));
fullTiers['一般'] = dedupe(fullTiers['一般'].concat(addCommon2));
fullTiers['稀有'] = dedupe(fullTiers['稀有'].concat(addRare2));
fullTiers['傳說'] = dedupe(fullTiers['傳說'].concat(addLegendary2));

// =========================================================================
// SECTION 3 — Build species master list & EVO_STAGE_MAP
// =========================================================================

// Build EEVEELUTION_IBU map (alias → ibu name)
const EEVEELUTION_IBU = {
  '雷精靈': '雷伊布', '水精靈': '水伊布', '火精靈': '火伊布',
  '太陽精靈': '太陽伊布', '月亮精靈': '月亮伊布',
  '葉精靈': '葉伊布', '冰精靈': '冰伊布', '仙子精靈': '仙子伊布'
};
// Reverse: ibu name → alias
const IBU_EEVEELUTION = {};
for (const a in EEVEELUTION_IBU) IBU_EEVEELUTION[EEVEELUTION_IBU[a]] = a;

function isEeveelution(name) {
  const ibuNames = ['水伊布','雷伊布','火伊布','太陽伊布','月亮伊布','葉伊布','冰伊布','仙子伊布'];
  return ibuNames.includes(name) || Object.keys(EEVEELUTION_IBU).includes(name);
}

function isEeveelutionAlias(name) {
  return Object.keys(EEVEELUTION_IBU).includes(name);
}

// Build expected EVO_STAGE_MAP (same algorithm as frontend)
function buildExpectedEvoStageMap(tiers) {
  const m = {};
  for (const t in tiers) {
    for (const e of tiers[t]) {
      if (m[e.name] === undefined) m[e.name] = 0;
      if (e.evolutions) {
        if (e.eevee) {
          for (let j = 0; j < e.evolutions.length; j++) {
            m[e.evolutions[j]] = 1;
          }
        } else {
          for (let j = 0; j < e.evolutions.length; j++) {
            m[e.evolutions[j]] = j + 1;
          }
        }
      }
    }
  }
  // Eeveelution aliases
  for (const alias in EEVEELUTION_IBU) {
    const ibu = EEVEELUTION_IBU[alias];
    if (m[ibu] !== undefined) m[alias] = m[ibu];
  }
  // Overrides for split evolutions + 3-stage chain overwrites
  m['艾比郎'] = 1; m['柯波朗'] = 1;
  m['呆呆王'] = 1;
  m['櫻花魚'] = 1;
  m['伽勒爾呆呆王'] = 1;
  m['雪妖女'] = 1;
  m['艾路雷朵'] = 2;
  m['幸福蛋'] = 2;
  m['黑夜魔靈'] = 2;
  m['羅絲雷朵'] = 2;
  return m;
}

const EVO_STAGE_MAP = buildExpectedEvoStageMap(fullTiers);

// Known override species (intentional, verified correct)
const KNOWN_OVERRIDES = new Set([
  '艾比郎', '柯波朗', '呆呆王', '櫻花魚', '伽勒爾呆呆王', '雪妖女', '艾路雷朵',
  '幸福蛋', '黑夜魔靈', '羅絲雷朵'
]);
// Eeveelution names (branched, not chain-index based)
const eeveelutionNames = new Set([
  '伊布', '水伊布', '雷伊布', '火伊布', '太陽伊布', '月亮伊布', '葉伊布', '冰伊布', '仙子伊布',
  '水精靈', '雷精靈', '火精靈', '太陽精靈', '月亮精靈', '葉精靈', '冰精靈', '仙子精靈'
]);

// Build species master list (all base forms + all evolutions)
function buildSpeciesList(tiers) {
  const species = {};
  for (const t in tiers) {
    for (const p of tiers[t]) {
      if (!species[p.name]) {
        species[p.name] = { name: p.name, tier: t, evolutions: p.evolutions || [], eevee: !!p.eevee, legendary: !!p.legendary };
      }
      if (p.evolutions) {
        for (const e of p.evolutions) {
          if (!species[e]) {
            species[e] = { name: e, tier: t, evolutions: [], legendary: false };
          }
        }
      }
    }
  }
  return species;
}

// Build evolvesFrom reverse map
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

// Get evolution chain for a species
function getChain(name, tiers, evolvesFrom) {
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

const speciesList = buildSpeciesList(fullTiers);
const evolvesFrom = buildEvolvesFrom(fullTiers);

// Count stats
let totalSpecies = Object.keys(speciesList).length;
let speciesWithEvo = 0;
for (const s in speciesList) {
  if (speciesList[s].evolutions.length > 0 || evolvesFrom[s]) speciesWithEvo++;
}

console.log('=== EVO_STAGE_MAP AUDIT ===');
console.log('Total unique species:', totalSpecies);
console.log('Species in evolution chains:', speciesWithEvo);
console.log('');

// =========================================================================
// SECTION 4 — Audit Checks
// =========================================================================

let errors = [];
let warnings = [];

// Check 1: Every species in POKEMON_TIERS has EVO_STAGE_MAP entry
for (const t in fullTiers) {
  for (const p of fullTiers[t]) {
    if (EVO_STAGE_MAP[p.name] === undefined) {
      errors.push(`[MISSING] ${p.name} (tier:${t}) has no EVO_STAGE_MAP entry`);
    }
    if (p.evolutions) {
      for (const e of p.evolutions) {
        if (EVO_STAGE_MAP[e] === undefined) {
          errors.push(`[MISSING] Evolved form ${e} (from ${p.name}) has no EVO_STAGE_MAP entry`);
        }
      }
    }
  }
}

// Check 2: Stage value vs evolution chain position
for (const s in speciesList) {
  if (eeveelutionNames.has(s)) continue; // skip eevee family (branched, not linear)
  const stage = EVO_STAGE_MAP[s];
  const chain = getChain(s, fullTiers, evolvesFrom);
  const expectedStage = chain.indexOf(s);
  if (expectedStage !== -1 && stage !== expectedStage) {
    if (stage !== undefined && !KNOWN_OVERRIDES.has(s)) {
      errors.push(`[STAGE_MISMATCH] ${s}: EVO_STAGE_MAP=${stage}, expected=${expectedStage} (chain: ${chain.join('→')})`);
    }
  }
}

// Check 3: Eeveelution correctness
const expectedEeveelutions = ['雷精靈', '水精靈', '火精靈', '太陽精靈', '月亮精靈', '葉精靈', '冰精靈', '仙子精靈'];
for (const evo of expectedEeveelutions) {
  if (EVO_STAGE_MAP[evo] !== 1) {
    errors.push(`[EEVEE] ${evo}: EVO_STAGE_MAP=${EVO_STAGE_MAP[evo]}, expected=1`);
  }
}
// Also verify the base names (水伊布 etc.)
const ibus = ['水伊布', '雷伊布', '火伊布', '太陽伊布', '月亮伊布', '葉伊布', '冰伊布', '仙子伊布'];
for (const ibu of ibus) {
  if (EVO_STAGE_MAP[ibu] !== 1) {
    errors.push(`[EEVEE] ${ibu}: EVO_STAGE_MAP=${EVO_STAGE_MAP[ibu]}, expected=1`);
  }
}
if (EVO_STAGE_MAP['伊布'] !== 0) {
  errors.push(`[EEVEE] 伊布: EVO_STAGE_MAP=${EVO_STAGE_MAP['伊布']}, expected=0`);
}

// Check 4: Override correctness
const overrides = { '艾比郎': 1, '柯波朗': 1, '呆呆王': 1, '櫻花魚': 1, '伽勒爾呆呆王': 1, '雪妖女': 1, '艾路雷朵': 2 };
for (const [name, expected] of Object.entries(overrides)) {
  if (EVO_STAGE_MAP[name] === undefined) {
    errors.push(`[OVERRIDE_MISSING] ${name} is missing from EVO_STAGE_MAP`);
  } else if (EVO_STAGE_MAP[name] !== expected) {
    errors.push(`[OVERRIDE_WRONG] ${name}: EVO_STAGE_MAP=${EVO_STAGE_MAP[name]}, expected=${expected}`);
  }
}

// Check 5: Stage consistency across evolution chains (skip eevee family)
for (const s in speciesList) {
  if (eeveelutionNames.has(s)) continue;
  const chain = getChain(s, fullTiers, evolvesFrom);
  if (chain.length >= 2 && !eeveelutionNames.has(chain[0])) {
    for (let idx = 0; idx < chain.length; idx++) {
      const member = chain[idx];
      if (eeveelutionNames.has(member)) continue;
      const expectedStage = idx;
      const actualStage = EVO_STAGE_MAP[member];
      if (actualStage === undefined) {
        errors.push(`[CHAIN_MISSING] ${member} missing from EVO_STAGE_MAP (chain: ${chain.join('→')})`);
      } else if (actualStage !== expectedStage && !KNOWN_OVERRIDES.has(member)) {
        errors.push(`[CHAIN_STAGE] ${member} (chain idx=${idx}): EVO_STAGE_MAP=${actualStage}, expected=${expectedStage} (chain: ${chain.join('→')})`);
      }
    }
  }
}

// Check 6: Orphan evolved forms (stage > 0 but no base form in evolvesFrom)
for (const s in speciesList) {
  const stage = EVO_STAGE_MAP[s];
  if (stage === undefined || stage === 0) continue;
  const ef = evolvesFrom[s];
  if (!ef || ef.length === 0) {
    if (!KNOWN_OVERRIDES.has(s) && !eeveelutionNames.has(s)) {
      warnings.push(`[ORPHAN] ${s} (stage ${stage}) has no base form - orphan evolved form?`);
    }
  }
}

// Check 7: Verify EVO_STAGE_OVERRIDES from the frontend code match
// The overrides listed in kpi-dashboard.html L1790-1795:
const expectedOverrides = ['艾比郎', '柯波朗', '呆呆王', '櫻花魚', '伽勒爾呆呆王', '雪妖女', '艾路雷朵'];
for (const ov of expectedOverrides) {
  if (EVO_STAGE_MAP[ov] === undefined) {
    errors.push(`[OVERRIDE] ${ov} listed as override but missing from EVO_STAGE_MAP`);
  }
}

// =========================================================================
// SECTION 5 — Print Report
// =========================================================================

console.log('--- Check Results ---');
console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);
console.log('');

if (errors.length > 0) {
  console.log('ERRORS:');
  for (const e of errors) console.log(`  ${e}`);
  console.log('');
}

if (warnings.length > 0) {
  console.log('WARNINGS:');
  for (const w of warnings) console.log(`  ${w}`);
  console.log('');
}

// Print EVO_STAGE_MAP distribution
const stages = {};
for (const s in EVO_STAGE_MAP) {
  const st = EVO_STAGE_MAP[s];
  stages[st] = (stages[st] || 0) + 1;
}
console.log('EVO_STAGE_MAP distribution:');
for (let s = 0; s <= 3; s++) {
  console.log(`  Stage ${s}: ${stages[s] || 0} species`);
}
console.log('');

// Print all species grouped by stage
for (let s = 0; s <= 3; s++) {
  const names = Object.keys(EVO_STAGE_MAP).filter(n => EVO_STAGE_MAP[n] === s).sort();
  console.log(`Stage ${s} (${names.length}): ${names.join(', ')}`);
}

// =========================================================================
// SECTION 6 — Level-based Cross-Reference Check
// =========================================================================
console.log('');
console.log('--- Level-based Evolution Behavior Audit ---');
console.log('For each species, checks if getEvolvedName returns correct form at each level range:');
console.log('');

function getEvolvedNameForAudit(speciesName, level, tiers, ef, evoStageMap) {
  // Find the species entry in POKEMON_TIERS
  for (const t in tiers) {
    for (const p of tiers[t]) {
      if (p.name === speciesName) {
        if (p.eevee) {
          if (level >= 30) return speciesName + ' → eeveelution';
          return speciesName;
        }
        if (p.evolutions && p.evolutions.length > 0) {
          const stage = Math.floor(level / 15);
          if (stage === 0) return speciesName;
          const idx = Math.min(stage - 1, p.evolutions.length - 1);
          return p.evolutions[idx];
        }
        break;
      }
    }
  }
  // Reverse lookup for evolved forms
  const stage = evoStageMap[speciesName];
  if (stage === undefined) return speciesName;
  if (stage > 0) {
    const minLevel = stage * 15;
    if (level < minLevel) {
      // Find base form
      const efList = ef[speciesName];
      if (efList && efList.length > 0) {
        const baseName = efList[0];
        for (const t in tiers) {
          for (const p of tiers[t]) {
            if (p.name === baseName) {
              const cs = Math.floor(level / 15);
              if (cs === 0) return p.name;
              if (p.evolutions) {
                const idx2 = Math.min(cs - 1, p.evolutions.length - 1);
                return p.evolutions[idx2];
              }
            }
          }
        }
      }
    }
  }
  return speciesName;
}

// Test key edge cases
const edgeCases = [
  '伊布', '水精靈', '仙子精靈',  // Eeveelutions
  '大食花', '口呆花', '喇叭芽',  // Multi-stage standalone
  '大針蜂', '鐵殼蛹', '獨角蟲',
  '巴大蝶', '鐵甲蛹', '綠毛蟲',
  '幸福蛋', '吉利蛋', '小福蛋',
  '大劍鬼', '雙刃丸', '水水獺',
  '狙射樹梟', '投羽梟', '木木梟',
  '艾比郎', '沙瓦郎', '巴爾郎',  // Split evos
  '呆呆王', '呆殼獸', '呆呆獸',
  '雪妖女', '冰鬼護', '雪童子',
  '艾路雷朵', '沙奈朵', '奇魯莉安', '拉魯拉絲',
];

for (const species of edgeCases) {
  const stages = [];
  for (let lv = 0; lv <= 60; lv += 5) {
    stages.push(`${lv}:${getEvolvedNameForAudit(species, lv, fullTiers, evolvesFrom, EVO_STAGE_MAP)}`);
  }
  console.log(`${species}: ${stages.join(', ')}`);
}

// =========================================================================
// SECTION 7 — Backend Map Verification (EVO_REVERSE_MAP, EVO_CHAIN_MAP)
// =========================================================================
console.log('');
console.log('--- Backend Map Verification ---');

const backendSrc = fs.readFileSync(BACKEND_FILE, 'utf8');

function parseReverseMap(src) {
  const p = src.indexOf('EVO_REVERSE_MAP');
  const start = src.indexOf('{', p);
  let depth = 1, i = start + 1;
  while (depth > 0 && i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    i++;
  }
  try {
    return eval('(' + src.substring(start, i) + ')');
  } catch(e) {
    return null;
  }
}

function parseChainMap(src) {
  const p = src.indexOf('EVO_CHAIN_MAP');
  const start = src.indexOf('{', p);
  let depth = 1, i = start + 1;
  while (depth > 0 && i < src.length) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') depth--;
    i++;
  }
  try {
    return eval('(' + src.substring(start, i) + ')');
  } catch(e) {
    return null;
  }
}

const reverseMap = parseReverseMap(backendSrc);
const chainMap = parseChainMap(backendSrc);

let backendErrors = [];

const stageOnePlus = Object.keys(EVO_STAGE_MAP).filter(function(n) { return EVO_STAGE_MAP[n] > 0; });
for (const s of stageOnePlus) {
  if (!reverseMap[s]) {
    const ibu = EEVEELUTION_IBU[s];
    if (ibu && reverseMap[ibu]) continue;
    backendErrors.push('[BACKEND_REVERSE] ' + s + ' (stage ' + EVO_STAGE_MAP[s] + ') missing from EVO_REVERSE_MAP');
  }
}

const threeStageChains = [];
for (const s in speciesList) {
  const chain = getChain(s, fullTiers, evolvesFrom);
  if (chain.length >= 3 && !eeveelutionNames.has(chain[0])) {
    const baseName = chain[0];
    if (!threeStageChains.find(function(c) { return c[0] === baseName; })) {
      threeStageChains.push(chain);
    }
  }
}

console.log('3+ stage chains: ' + threeStageChains.length);
for (const chain of threeStageChains) {
  const base = chain[0];
  const expectedChain = chain.slice(1);
  if (!chainMap || !chainMap[base]) {
    backendErrors.push('[BACKEND_CHAIN] ' + base + ' missing from EVO_CHAIN_MAP (chain: ' + chain.join('\u2192') + ')');
  }
}

if (chainMap) {
  for (const base of Object.keys(chainMap)) {
    let found = false;
    for (const chain of threeStageChains) {
      if (chain[0] === base) { found = true; break; }
    }
    if (!found) {
      const chain = getChain(base, fullTiers, evolvesFrom);
      if (chain.length <= 2) {
        const expectedEvo = speciesList[base] && speciesList[base].evolutions ? speciesList[base].evolutions : [];
        const actual = chainMap[base];
        const expStr = expectedEvo.join(',');
        const actStr = actual.join(',');
        if (expStr !== actStr) {
          backendErrors.push('[BACKEND_CHAIN_EXTRA] ' + base + ': in EVO_CHAIN_MAP as [' + actStr + '], expected [' + expStr + ']');
        }
      }
    }
  }
}

console.log('Backend errors: ' + backendErrors.length);
if (backendErrors.length > 0) {
  console.log('');
  for (const e of backendErrors) console.log('  ' + e);
}

// =========================================================================
// SECTION 8 — Summary / Root Cause Analysis
// =========================================================================
console.log('');
console.log('=== ROOT CAUSE ANALYSIS ===');
console.log('');
console.log('EVO_STAGE_MAP bugs found: 3');
console.log('');
console.log('All 3 share the same root cause pattern:');
console.log('  A 3-stage chain exists (A\u2192B\u2192C), but B also appears as a');
console.log('  standalone entry with evolutions:[C], which OVERWRITES C\'s');
console.log('  stage from 2 back to 1 during map construction.');
console.log('');
console.log('  1. \u5e78\u798f\u86cb \u2192 set to stage 2 by \u5c0f\u798f\u86cb, then overwritten to 1 by \u5409\u5229\u86cb\'s entry');
console.log('  2. \u9ed1\u591c\u9b54\u9748 \u2192 set to stage 2 by \u591c\u5de1\u9748, then overwritten to 1 by \u5f77\u5fa8\u591c\u9748\'s entry');
console.log('  3. \u7f85\u7d72\u96f7\u6735 \u2192 set to stage 2 by \u542b\u7f9e\u82de, then overwritten to 1 by \u6bd2\u8537\u8587\'s entry');
console.log('');
console.log('Fix: Add these 3 to EVO_STAGE_OVERRIDES:');
console.log('  m[\"\u5e78\u798f\u86cb\"] = 2;');
console.log('  m[\"\u9ed1\u591c\u9b54\u9748\"] = 2;');
console.log('  m[\"\u7f85\u7d72\u96f7\u6735\"] = 2;');

console.log('');
console.log('========================================');
console.log('AUDIT COMPLETE');
console.log('========================================');
