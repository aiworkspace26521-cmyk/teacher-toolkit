#!/usr/bin/env node
/**
 * skill-tree-fix-verify.js — V3.2 fix verification
 * Tests through exported API: getSkillTree, buildTreeFromVariant, selectVariant
 *
 * Usage: node test/skill-tree-fix-verify.js
 */

'use strict';

var vm = require('vm'), fs = require('fs'), path = require('path');
var PUBLIC_DIR = path.resolve(__dirname, '..', '..', '..', 'public');

var sandbox = {
  console: console, Math: Math, JSON: JSON, Object: Object, Array: Array,
  String: String, Number: Number, Boolean: Boolean, Date: Date,
  RegExp: RegExp, Error: Error, isNaN: isNaN,
  parseInt: parseInt, parseFloat: parseFloat,
  POKEMON_SPECIES_TYPES: {
    "水伊布":["水"],"雷伊布":["電"],"火伊布":["火"],
    "太陽伊布":["超能力"],"月亮伊布":["惡"],
    "葉伊布":["草"],"冰伊布":["冰"],"仙子伊布":["妖精"],
    "噴火龍":["火","飛行"],"妙蛙花":["草","毒"]
  },
  globalData:{roster:[]}
};
var ctx = vm.createContext(sandbox);
vm.runInContext('window = this; window.self = this;', ctx);
var code = fs.readFileSync(path.join(PUBLIC_DIR, 'pokemon-skill-tree.js'), 'utf8');
vm.createScript(code, 'pokemon-skill-tree.js').runInContext(ctx);

function $(n){ return ctx[n]; }
var pass=0, fail=0;
function test(name, fn){
  try{ fn(); pass++; console.log('  OK ' + name); }
  catch(e){ fail++; console.log('  XX ' + name + ': ' + (e.message||e)); }
}

console.log('\n=== v3.2 Skill Tree Fix Verification ===\n');

// ── 1. TYPE_SPEC_V2 ──
console.log('--- 1. TYPE_SPEC_V2 data ---');
var TS=$('TYPE_SPEC_V2');
test('TYPE_SPEC_V2 exists', function(){ if(!TS) throw new Error('missing'); });
var v=TS['水'].VARIANTS['特攻壓制型'];
test('水·特攻壓制型 variant exists', function(){ if(!v) throw new Error('missing'); });
test('SPA T1 = 水槍', function(){ if(v.tiers.T1.SPA[0]!=='水槍') throw new Error(JSON.stringify(v.tiers.T1.SPA)); });
test('SPA T3 = 熱水', function(){ if(v.tiers.T3.SPA[0]!=='熱水') throw new Error(JSON.stringify(v.tiers.T3.SPA)); });
test('ATK T4 = 摔打', function(){ if(v.tiers.T4.ATK[0]!=='摔打') throw new Error(JSON.stringify(v.tiers.T4.ATK)); });
test('ATK T1/T2/T3 are empty []', function(){
  if(v.tiers.T1.ATK.length!==0||v.tiers.T2.ATK.length!==0||v.tiers.T3.ATK.length!==0)
    throw new Error('not empty');
});

// ── 2. buildTreeFromVariant ──
console.log('\n--- 2. buildTreeFromVariant ---');
var btfv=$('buildTreeFromVariant');
var pkmn={baseName:'水伊布',primaryType:'水',personality:42,
  stats:{atk:65,spa:110,spd:65,def:60,spDef:95,hp:130}};
var tree=btfv(pkmn,'水','特攻壓制型');
test('SPA T3 = 熱水', function(){ if(tree.SPA.T3!=='熱水') throw new Error(JSON.stringify(tree.SPA.T3)); });
test('ATK T4 = 摔打', function(){ if(tree.ATK.T4!=='摔打') throw new Error(JSON.stringify(tree.ATK.T4)); });
test('ATK T1=null T2=null T3=null', function(){
  if(tree.ATK.T1!==null||tree.ATK.T2!==null||tree.ATK.T3!==null)
    throw new Error('expected nulls');
});

// ── 3. getSkillTree final output ──
console.log('\n--- 3. getSkillTree with 特攻壓制型 (via override) ---');
// Force 特攻壓制型 variant by setting personality to match
// personality 42 gives 速攻擾亂型 for water. We test with the correct variant name explicitly.
var tr=btfv(pkmn,'水','特攻壓制型');

// Now test getSkillTree via the real path
// selectVariant picks based on personality. pkmn with personality=42 picks 速攻擾亂型.
// To test 特攻壓制型, we can directly use the tree built above.
var gst=$('getSkillTree');

// Test with actual selectVariant decision (personality=42 → 速攻擾亂型)
var trReal=gst('水伊布',['水'],65,110,pkmn);
test('getSkillTree returns tree', function(){ if(!trReal||!trReal.trees) throw new Error('null'); });

// Check which variant was selected
var sv=$('selectVariant');
var variantName=sv(pkmn);
console.log('  => variant selected:', variantName);

// ── No-Fallback Test ──
// Build tree directly for 特攻壓制型 variant and check ATK has only 摔打 at T4
var variantTree=TS['水'].VARIANTS['特攻壓制型'];
// buildNodesFromVariantTree is not exported, but we can check through buildTreeFromVariant
// The ATK tree for 特攻壓制型: only T4 has 摔打
// buildNodesFromVariantTree converts {ATK:{T1:null,T2:null,T3:null,T4:"摔打",T5:null}}
// to nodes array with only 1 entry (T4: 摔打)
// We verify by checking the conversion result
test('Variant tree ATK T1/T2/T3=null (empty source), T4=摔打, T5 fallback added', function(){
  var vt=btfv(pkmn,'水','特攻壓制型');
  if(vt.ATK.T1!==null) throw new Error('T1 not null');
  if(vt.ATK.T2!==null) throw new Error('T2 not null');
  if(vt.ATK.T3!==null) throw new Error('T3 not null');
  if(vt.ATK.T4!=='摔打') throw new Error('T4 not 摔打');
  // T5 has its own fallback (different from removed buildNodesFromVariantTree fallback)
  // This is correct — T5 should always have a move available
  if(!vt.ATK.T5) throw new Error('T5 should have fallback');
});

// ── ULT tree test ──
console.log('\n--- 4. ULT tree via selectUltVariant ---');
var uv=$('selectUltVariant');
test('selectUltVariant exists', function(){ if(typeof uv!=='function') throw new Error('missing'); });
var ult=uv(pkmn,'水','特攻壓制型');
test('ULT T5 has name', function(){ if(!ult||!ult.t5Name) throw new Error(JSON.stringify(ult)); });
console.log('  => ULT variant:', ult.label, 'T5:', ult.t5Name);

// ── Verify all tree types ──
console.log('\n--- 5. All 5 tree types present ---');
test('5 trees in getSkillTree output', function(){
  var keys=Object.keys(trReal.trees);
  if(keys.length!==5) throw new Error('got '+keys.length+': '+keys.join(','));
});

// ── Verify ATK has exactly the expected nodes for selected variant ──
console.log('\n--- 6. Node count verification (no fallback T1-T4) ---');
// For the default personality=42, variant=速攻擾亂型:
// ATK: T1=水槍, T2=噴射拳, T3=null(empty), T4=水之尾, T5=終極衝擊
// Template: only nodes for non-null moves = 4 nodes
var atkReal=trReal.trees.atk;
test('ATK nodes have correct names (no unexpected fallback)', function(){
  if(!atkReal||!atkReal.nodes) throw new Error('no nodes');
  // For 速攻擾亂型 ATK, expect: 水槍(T1), 噴射拳(T2), 水之尾(T4), 終極衝擊(T5)
  // No T3 (because pool is empty → null → no node)
  var names=atkReal.nodes.map(function(n){return n.name;});
  // Verify no generic fallback like "撞擊" (old FALLBACK_MOVES.ATK[0])
  if(names.indexOf('撞擊')!==-1) throw new Error('fallback 撞擊 present!');
  if(names.indexOf('電光一閃')!==-1) throw new Error('fallback 電光一閃 present!');
  if(names.indexOf('劈開')!==-1) throw new Error('fallback 劈開 present!');
  if(names.indexOf('捨身衝撞')!==-1) throw new Error('fallback 捨身衝撞 present!');
  console.log('  => ATK names:', names.join(', '));
});

// ── Summary ──
console.log('\n' + '='.repeat(50));
console.log(pass + ' passed, ' + fail + ' failed');
if(fail>0) process.exitCode=1;
else console.log('ALL TESTS PASSED');
console.log('='.repeat(50)+'\n');
