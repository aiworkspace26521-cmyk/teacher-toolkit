#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');

const FRONTEND = path.join(__dirname, '..', 'frontend', 'kpi-dashboard.html');
const MANUAL = path.join(__dirname, '..', 'GAME-MANUAL VER5.6.md');

let errors = [];

function readFile(p) { return fs.readFileSync(p, 'utf-8'); }

// ── Backend core scripts ─────────────────────────────────────────
const BACKEND = path.join(__dirname, '..', 'backend', 'kpi-core.js');
const SIMULATION = path.join(__dirname, '..', 'test', 'simulation-test.js');

// ── EXP curve check ──────────────────────────────────────────────
function checkExpCurve() {
  const html = readFile(FRONTEND);
  const manual = readFile(MANUAL);

  const htmlMatch = html.match(/(?:function\s+getExpNeeded|getExpNeeded\s*[=:]\s*function)\s*\([^)]*\)\s*\{([^}]+)\}/);
  if (!htmlMatch) { errors.push('EXP: getExpNeeded not found in frontend'); return; }

  const htmlBlock = htmlMatch[1];
  const levels = htmlBlock.match(/\*\s*(\d+)/g) || [];
  const mults = levels.map(v => parseInt(v.replace('* ', '').replace('*', ''), 10));
  const expected = [30, 60, 120, 200, 350, 800, 3500, 5000];
  for (let i = 0; i < Math.min(mults.length, expected.length); i++) {
    if (mults[i] !== expected[i])
      errors.push(`EXP tier ${i}: frontend=${mults[i]} expected=${expected[i]}`);
  }
  if (mults.length !== expected.length)
    errors.push(`EXP: frontend has ${mults.length} tiers, expected ${expected.length}`);
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

// ── Backend EXP curve check ─────────────────────────────────────
function checkBackendExpCurve() {
  const backendContent = readFile(BACKEND);
  const html = readFile(FRONTEND);

  const backendMatch = backendContent.match(/function getExpNeeded\([^)]+\)\s*\{([^}]+)\}/);
  const htmlMatch = html.match(/function getExpNeeded\([^)]+\)\s*\{([^}]+)\}/);
  if (!backendMatch) { errors.push('EXP: getExpNeeded not found in backend'); return; }
  if (!htmlMatch) { errors.push('EXP: getExpNeeded not found in frontend'); return; }

  if (backendMatch[1].replace(/\r/g, '').trim() !== htmlMatch[1].replace(/\r/g, '').trim())
    errors.push('EXP: backend getExpNeeded differs from frontend');
}

// ── Simulation EXP curve check ──────────────────────────────────
function checkSimulationExpCurve() {
  const simContent = readFile(SIMULATION);
  const html = readFile(FRONTEND);

  const simMatch = simContent.match(/function getExpNeeded\([^)]+\)\s*\{([^}]+)\}/);
  const htmlMatch = html.match(/function getExpNeeded\([^)]+\)\s*\{([^}]+)\}/);
  if (!simMatch) { errors.push('EXP: getExpNeeded not found in simulation'); return; }
  if (!htmlMatch) { errors.push('EXP: getExpNeeded not found in frontend'); return; }

  if (simMatch[1].replace(/\r/g, '').trim() !== htmlMatch[1].replace(/\r/g, '').trim())
    errors.push('EXP: simulation getExpNeeded differs from frontend');
}

// ── RUN ──────────────────────────────────────────────────────────
checkExpCurve();
checkBackendExpCurve();
checkSimulationExpCurve();
checkTypeRatio();
checkLegendaryRate();

if (errors.length > 0) {
  console.error('GAME-MANUAL 一致性檢查失敗:');
  errors.forEach(e => console.error('  ❌', e));
  process.exit(1);
} else {
  console.log('GAME-MANUAL 一致性檢查通過 ✅');
}
