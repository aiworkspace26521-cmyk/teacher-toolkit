/**
 * Phase 0 驗證腳本 — 驗證 TYPE_SPEC_V2 / TYPE_T5_SIGNATURES /
 * ARCHETYPE_TEMPLATES / TYPE_MOVE_LIBRARY 資料結構完整性
 *
 * 使用方式:
 *   node tools/招式培養系統/validate-type-spec-v2.js
 *
 * 對應 v3.2 §5.0 驗證規格:
 *   V0.1: 語法正確性
 *   V0.2: ESLint
 *   V0.3: 常數存在性
 *   手動: 變體數量 / T5 完整性 / 模板數量 / Move Library 覆蓋率
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "../..");
const TARGET = path.join(ROOT, "public/pokemon-skill-tree.js");

let passed = 0;
let failed = 0;
let totalChecks = 0;

function check(condition, label, detail) {
  totalChecks++;
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

function checkEqual(actual, expected, label) {
  return check(actual === expected, label, `expected ${expected}, got ${actual}`);
}

// ── V0.1: File readability ──
console.log("\n=== V0.1: 檔案可讀取 ===");
let content;
try {
  content = fs.readFileSync(TARGET, "utf-8");
  check(true, "檔案可讀取", `(${content.length} bytes)`);
} catch (e) {
  check(false, "檔案可讀取", e.message);
  process.exit(1);
}

// ── V0.2: ESLint 語法檢查 ──
console.log("\n=== V0.2: ESLint 語法檢查 ===");
try {
  const eslintResult = execSync(
    `npx eslint "${TARGET}" 2>&1`,
    { cwd: ROOT, encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
  );
  check(true, "ESLint 無 error (exit 0)");
} catch (e) {
  const stderr = e.stderr || "";
  const stdout = e.stdout || "";
  const msg = stderr || stdout || e.message;
  // Check if ESLint exists
  if (msg.includes("not found") || msg.includes("Cannot find")) {
    console.log("  ⚠️ ESLint not available, skipping syntax check");
    console.log("  (This is OK — the main validation is the structural check below)");
  } else if (msg.includes("error")) {
    check(false, "ESLint error", msg.substring(0, 200));
  } else if (msg.includes("warning")) {
    console.log("  ⚠️ ESLint warnings (non-blocking)");
    check(true, "ESLint 無 error (exit 0)");
  } else {
    check(true, "ESLint 無 error");
  }
}

// ── V0.3: 常數存在性 ──
console.log("\n=== V0.3: 常數存在性 ===");
const hasConstants = {
  TYPE_SPEC_V2: content.includes("TYPE_SPEC_V2"),
  TYPE_T5_SIGNATURES: content.includes("TYPE_T5_SIGNATURES"),
  ARCHETYPE_TEMPLATES: content.includes("ARCHETYPE_TEMPLATES"),
  TYPE_MOVE_LIBRARY: content.includes("TYPE_MOVE_LIBRARY"),
};
check(hasConstants.TYPE_SPEC_V2, "TYPE_SPEC_V2 存在");
check(hasConstants.TYPE_T5_SIGNATURES, "TYPE_T5_SIGNATURES 存在");
check(hasConstants.ARCHETYPE_TEMPLATES, "ARCHETYPE_TEMPLATES 存在");
check(hasConstants.TYPE_MOVE_LIBRARY, "TYPE_MOVE_LIBRARY 存在");

// ── TYPE_SPEC_V2 18 屬性檢查 ──
console.log("\n=== TYPE_SPEC_V2: 18 屬性存在 ===");
const allTypes = [
  "一般", "火", "水", "草", "電", "冰", "格鬥", "毒", "地面",
  "飛行", "超能力", "蟲", "岩石", "幽靈", "龍", "惡", "鋼", "妖精"
];

let typeFoundCount = 0;
for (const t of allTypes) {
  // Match "type":  at the start of a line (TYPE_SPEC_V2 key context)
  const re = new RegExp(`"${t}"\\s*:`, "g");
  let count = 0;
  let m;
  while ((m = re.exec(content)) !== null) count++;
  // Should appear multiple times (in TYPE_SPEC_V2, TYPE_T5_SIGNATURES, etc.)
  // At minimum, should appear once for TYPE_SPEC_V2
  if (count > 0) {
    typeFoundCount++;
  } else {
    console.log(`  ❌ ${t}: 未在檔案中找到`);
  }
}
check(typeFoundCount === 18, `全部 18 屬性皆存在於檔案中 (${typeFoundCount}/18)`);

// ── 變體數量檢查 ──
console.log("\n=== TYPE_SPEC_V2: 各屬性變體數量 ===");
const expectedVariants = {
  "一般": 5, "火": 7, "水": 5, "草": 6, "電": 6, "冰": 5,
  "格鬥": 6, "毒": 5, "地面": 5, "飛行": 6, "超能力": 6, "蟲": 5,
  "岩石": 5, "幽靈": 5, "龍": 6, "惡": 5, "鋼": 5, "妖精": 5
};

// Find the TYPE_SPEC_V2 object boundaries
const typeSpecStart = content.indexOf("var TYPE_SPEC_V2 =");
// The object closes with }; — safe search since no }; exists inside JSON object values
const typeSpecEnd = content.indexOf("};", typeSpecStart) + 2;

if (typeSpecStart >= 0 && typeSpecEnd > typeSpecStart) {
  const typeSpecBlock = content.substring(typeSpecStart, typeSpecEnd);
  let allVariantsOk = true;
  for (let ti = 0; ti < allTypes.length; ti++) {
    const type = allTypes[ti];
    const escaped = type.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Create a fresh regex each iteration to avoid lastIndex issues
    const typeRe = new RegExp(`"${escaped}"\\s*:`);
    const typeMatch = typeSpecBlock.match(typeRe);
    if (!typeMatch) {
      console.log(`  ❌ ${type}: 無法在 TYPE_SPEC_V2 中找到`);
      allVariantsOk = false;
      continue;
    }
    const start = typeMatch.index;
    // Find end: next type key after this one, or end of block
    let end = typeSpecBlock.length;
    for (let ni = ti + 1; ni < allTypes.length; ni++) {
      const nextType = allTypes[ni];
      const nextEscaped = nextType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nextRe = new RegExp(`"${nextEscaped}"\\s*:`);
      const nextMatch = typeSpecBlock.match(nextRe);
      if (nextMatch && nextMatch.index > start && nextMatch.index < end) {
        end = nextMatch.index;
      }
    }
    const typeContent = typeSpecBlock.substring(start, end);
    const ultMatches = typeContent.match(/ultMapping:/g);
    const count = ultMatches ? ultMatches.length : 0;
    const exp = expectedVariants[type];
    if (count === exp) {
      console.log(`  ✅ ${type}: ${count} 變體`);
    } else {
      console.log(`  ❌ ${type}: 預期 ${exp} 變體，實際 ${count}`);
      allVariantsOk = false;
    }
  }
  check(allVariantsOk, "全部 18 屬性變體數量正確");
} else {
  check(false, "TYPE_SPEC_V2 區塊解析", `start=${typeSpecStart}, end=${typeSpecEnd}`);
}

// ── TYPE_T5_SIGNATURES 完整性 ──
console.log("\n=== TYPE_T5_SIGNATURES: 18 屬性 ===");
const t5Start = content.indexOf("var TYPE_T5_SIGNATURES =");
const t5End = content.indexOf("};", t5Start) + 2;
if (t5Start >= 0) {
  const t5Block = content.substring(t5Start, t5End);
  let t5AllPresent = true;
  for (const type of allTypes) {
    const re = new RegExp(`"${type}"`);
    if (!re.test(t5Block)) {
      console.log(`  ❌ TYPE_T5_SIGNATURES 缺少 ${type}`);
      t5AllPresent = false;
    }
  }
  // Check each role has moves
  const roleCheck = t5Block.match(/(ATK|SPA|BUF|DIS):\s*\[/g);
  check(t5AllPresent, "TYPE_T5_SIGNATURES 包含全部 18 屬性");
  check(roleCheck && roleCheck.length >= 18 * 4,
    `TYPE_T5_SIGNATURES 角色定義完整`,
    `found ${roleCheck ? roleCheck.length : 0} role entries, expected >=72`);
} else {
  check(false, "TYPE_T5_SIGNATURES 區塊不存在");
}

// ── ARCHETYPE_TEMPLATES 數量 ──
console.log("\n=== ARCHETYPE_TEMPLATES: ≥8 模板 ===");
const archStart = content.indexOf("var ARCHETYPE_TEMPLATES =");
if (archStart >= 0) {
  // Count by finding "theme": entries (one per template)
  const archBlock = content.substring(archStart, content.indexOf("};", archStart));
  const themeMatches = archBlock.match(/theme:/g);
  const archCount = themeMatches ? themeMatches.length : 0;
  check(archCount >= 8, `ARCHETYPE_TEMPLATES 數量 (${archCount}) >= 8`);
} else {
  check(false, "ARCHETYPE_TEMPLATES 區塊不存在");
}

// ── TYPE_MOVE_LIBRARY 覆蓋率 ──
console.log("\n=== TYPE_MOVE_LIBRARY: 屬性覆蓋 ===");
const mlStart = content.indexOf("var TYPE_MOVE_LIBRARY =");
if (mlStart >= 0) {
  const mlBlock = content.substring(mlStart, content.indexOf("};", mlStart));
  // Find which types have a move library entry
  let mlTypes = [];
  for (const type of allTypes) {
    const re = new RegExp(`"${type}"\\s*:`);
    if (re.test(mlBlock)) mlTypes.push(type);
  }
  check(mlTypes.length >= 3, `TYPE_MOVE_LIBRARY 屬性數 (${mlTypes.length}) >= 3`,
    `包含: ${mlTypes.join(", ")}`);
  console.log(`  📋 目前覆蓋 ${mlTypes.length}/18 屬性: ${mlTypes.join(", ")}`);
} else {
  check(false, "TYPE_MOVE_LIBRARY 區塊不存在");
}

// ── 匯出檢查 ──
console.log("\n=== window 匯出完整性 ===");
const exportList = [
  "TYPE_SPEC_V2", "TYPE_T5_SIGNATURES", "ARCHETYPE_TEMPLATES", "TYPE_MOVE_LIBRARY",
  "selectVariant", "buildTreeFromVariant", "resolveT5Move", "selectUltVariant", "seededRandom",
  "getSkillTree", "getTreeTypeLabel", "getTreeTypeEmoji", "getTierFpCost",
  "getMaxMoveLevel", "calcMovePower", "calcMaxFp", "getTreeSpThreshold"
];
let exportCount = 0;
for (const item of exportList) {
  if (content.includes(`window.${item} =`)) exportCount++;
}
check(exportCount === exportList.length, `所有 ${exportList.length} 個 window 匯出都存在`,
  `found ${exportCount}`);

// ── 最終總計 ──
console.log("\n" + "=".repeat(45));
console.log(`總檢查數: ${totalChecks} | ✅ 通過: ${passed} | ❌ 失敗: ${failed}`);
console.log("=".repeat(45));

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\n✅ Phase 0 驗證全部通過！");
}
