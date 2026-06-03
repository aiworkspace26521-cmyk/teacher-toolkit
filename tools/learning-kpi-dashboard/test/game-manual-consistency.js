#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const FRONTEND = path.join(__dirname, '..', 'frontend', 'kpi-dashboard.html');
const MANUAL = path.join(__dirname, '..', 'GAME-MANUAL.md');

let errors = [];

function readFile(p) { return fs.readFileSync(p, 'utf-8'); }

// ── EXP curve check ──────────────────────────────────────────────
function checkExpCurve() {
  const html = readFile(FRONTEND);
  const manual = readFile(MANUAL);

  const htmlMatch = html.match(/getExpNeeded\s*[=:]\s*function\s*\([^)]*\)\s*\{([^}]+)\}/);
  if (!htmlMatch) { errors.push('EXP: getExpNeeded not found in frontend'); return; }

  const htmlBlock = htmlMatch[1];
  const htmlRules = {
    '56-75': htmlBlock.includes('* 300') || htmlBlock.includes('*300'),
    '76-85': htmlBlock.includes('* 450') || htmlBlock.includes('*450'),
    '86+': (htmlBlock.includes('* 450') || htmlBlock.includes('*450')) &&
           !htmlBlock.includes('* 900')
  };

  const manualSection56 = manual.match(/5[6６]~?7[5５][^]*?(?:level|等級)\s*[×xX*]\s*(\d+)/);
  const manualSection76 = manual.match(/7[6６]~?8[5５][^]*?(?:level|等級)\s*[×xX*]\s*(\d+)/);
  const manualSection86 = manual.match(/8[6６][^]*?(?:level|等級)\s*[×xX*]\s*(\d+)/);

  if (manualSection56 && !htmlRules['56-75'])
    errors.push(`EXP 56-75: manual says ×${manualSection56[1]} but frontend doesn't match`);
  if (manualSection76 && !htmlRules['76-85'])
    errors.push(`EXP 76-85: manual says ×${manualSection76[1]} but frontend doesn't match`);
  if (manualSection86) {
    const manVal = parseInt(manualSection86[1]);
    if ((manVal >= 600) === htmlRules['86+'])
      errors.push(`EXP 86+: manual says ×${manVal} but frontend doesn't match`);
  }
}

// ── TYPE_RATIO check (spot check 3 properties) ───────────────────
function checkTypeRatio() {
  const html = readFile(FRONTEND);
  const manual = readFile(MANUAL);
  const htmlMatch = html.match(/TYPE_RATIO\s*=\s*\{([^}]+)\}/);
  if (!htmlMatch) { errors.push('TYPE_RATIO not found in frontend'); return; }

  const checks = [
    { type: '龍', prop: '龍', idx: 14 },
    { type: '鋼', prop: '鋼', idx: 15 },
    { type: '一般', prop: '一般', idx: 0 },
  ];

  for (const c of checks) {
    const re = new RegExp(`["']${c.type}["']\\s*:\\s*\\[([^\\]]+)\\]`);
    const m = html.match(re);
    if (!m) { errors.push(`TYPE_RATIO ${c.type} not found in frontend`); continue; }
    const vals = m[1].split(',').map(v => parseFloat(v.trim()));
    const manRe = new RegExp(`\\|\\s*${c.prop}\\s*\\|\\s*([\\d.]+/[\\d./]+)`);
    const manM = manual.match(manRe);
    if (manM) {
      const manVals = manM[1].split('/').map(v => parseFloat(v.trim()));
      for (let i = 0; i < vals.length; i++) {
        if (Math.abs(vals[i] - manVals[i]) > 0.01)
          errors.push(`TYPE_RATIO ${c.type}[${i}]: frontend=${vals[i]} manual=${manVals[i]}`);
      }
    }
  }
}

// ── Legendary rate check ─────────────────────────────────────────
function checkLegendaryRate() {
  const html = readFile(FRONTEND);
  const manual = readFile(MANUAL);

  const htmlLegendary = html.match(/Math\.random\s*\(\s*\)\s*<\s*0\.01/);
  const manualLegendary = manual.match(/[~≈約]?\s*1%/);
  if (htmlLegendary && !manualLegendary)
    errors.push('路人戰傳說率: frontend has 1% but manual may differ');
}

// ── RUN ──────────────────────────────────────────────────────────
checkExpCurve();
checkTypeRatio();
checkLegendaryRate();

if (errors.length > 0) {
  console.error('GAME-MANUAL 一致性檢查失敗:');
  errors.forEach(e => console.error('  ❌', e));
  process.exit(1);
} else {
  console.log('GAME-MANUAL 一致性檢查通過 ✅');
}
