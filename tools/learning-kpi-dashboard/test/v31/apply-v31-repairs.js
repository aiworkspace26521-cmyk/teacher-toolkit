const fs = require('fs');
const path = require('path');

const kpiHtmlPath = path.resolve(__dirname, '../../frontend/kpi-dashboard.html');
const skillTreeJsPath = path.resolve(__dirname, '../../frontend/pokemon-skill-tree.js');
const kpiCorePath = path.resolve(__dirname, '../../../backend/kpi-core.js');

let htmlContent = fs.readFileSync(kpiHtmlPath, 'utf8');
let stJsContent = fs.readFileSync(skillTreeJsPath, 'utf8');
let coreContent = fs.existsSync(kpiCorePath) ? fs.readFileSync(kpiCorePath, 'utf8') : null;

// 1. Enable V31_FLAGS by default in kpi-dashboard.html
htmlContent = htmlContent.replace(
  `window.V31_FLAGS = {
  ENABLED: false,        // 總開關
  MORPHOLOGY_FILTER: false,
  SIX_MOVES_PER_TIER: false,
  SP_ECONOMY_90: false,
  LV5_MODIFIER: false,
};`,
  `window.V31_FLAGS = {
  ENABLED: true,        // 總開關
  MORPHOLOGY_FILTER: true,
  SIX_MOVES_PER_TIER: true,
  SP_ECONOMY_90: true,
  LV5_MODIFIER: true,
};`
);

fs.writeFileSync(kpiHtmlPath, htmlContent, 'utf8');
console.log('✅ Step 1: V31_FLAGS set to default ENABLED: true in kpi-dashboard.html');

// 2. Expand SPECIES_TAGS in pokemon-skill-tree.js
const expandedTags = `var SPECIES_TAGS = {
  charmander: { tags: ['BIPEDAL_CLAW', 'TAIL'] },
  charmeleon: { tags: ['BIPEDAL_CLAW', 'TAIL'] },
  charizard:  { tags: ['BIPEDAL_CLAW', 'TAIL', 'WINGED'] },
  ponyta:     { tags: ['QUADRUPED_HOOF'] },
  rapidash:   { tags: ['QUADRUPED_HOOF'] },
  heatran:    { tags: ['QUADRUPED_CLAW', 'ARMORED'] },
  hooh:       { tags: ['WINGED', 'LEGEND'] },
  eevee:      { tags: ['BEAST', 'QUADRUPED_CLAW', 'TAIL'] },
  vaporeon:   { tags: ['SERPENTINE', 'TAIL', 'BEAST'] },
  jolteon:    { tags: ['QUADRUPED_CLAW', 'BEAST'] },
  flareon:    { tags: ['QUADRUPED_CLAW', 'BEAST'] },
  espeon:     { tags: ['QUADRUPED_CLAW', 'TAIL', 'BEAST'] },
  umbreon:    { tags: ['QUADRUPED_CLAW', 'TAIL', 'BEAST'] },
  leafeon:    { tags: ['QUADRUPED_CLAW', 'TAIL', 'BEAST'] },
  glaceon:    { tags: ['QUADRUPED_CLAW', 'TAIL', 'BEAST'] },
  sylveon:    { tags: ['QUADRUPED_CLAW', 'TAIL', 'BEAST'] },
  pikachu:    { tags: ['BIPEDAL_CLAW', 'TAIL'] },
  raichu:     { tags: ['BIPEDAL_CLAW', 'TAIL'] },
  bulbasaur:  { tags: ['QUADRUPED_CLAW'] },
  ivysaur:    { tags: ['QUADRUPED_CLAW'] },
  venusaur:   { tags: ['QUADRUPED_CLAW'] },
  squirtle:   { tags: ['BIPEDAL_CLAW', 'TAIL', 'ARMORED'] },
  wartortle:  { tags: ['BIPEDAL_CLAW', 'TAIL', 'ARMORED'] },
  blastoise:  { tags: ['BIPEDAL_CLAW', 'TAIL', 'ARMORED'] },
  mewtwo:     { tags: ['BIPEDAL_CLAW', 'TAIL', 'LEGEND'] },
  mew:        { tags: ['BIPEDAL_CLAW', 'TAIL', 'LEGEND'] },
};`;

stJsContent = stJsContent.replace(/var SPECIES_TAGS = \{[\s\S]*?\};/, expandedTags);
fs.writeFileSync(skillTreeJsPath, stJsContent, 'utf8');
console.log('✅ Step 2: Expanded SPECIES_TAGS with Eeveelutions, Starters, Pikachu');

// 3. Update backend kpi-core.js if exists
if (coreContent) {
  if (!coreContent.includes('state.roster[pid].skillTree[treeName].sp += parseInt(mdParts[4]) || MODIFIER_SP_COST;')) {
    coreContent = coreContent.replace(
      'state.roster[mdParts[1]].modifiers[mdParts[2]] = mdParts[3];',
      `state.roster[mdParts[1]].modifiers[mdParts[2]] = mdParts[3];
    const treeName = (state.roster[mdParts[1]].learnedMoves && state.roster[mdParts[1]].learnedMoves[mdParts[2]]?.role) || 'ATK';
    if (state.roster[mdParts[1]].skillTree && state.roster[mdParts[1]].skillTree[treeName]) {
      state.roster[mdParts[1]].skillTree[treeName].sp += parseInt(mdParts[4]) || 3;
      const totalSp = state.roster[mdParts[1]].skillTree[treeName].sp;
      if (totalSp >= 24) state.roster[mdParts[1]].skillTree[treeName].tier = 5;
      else if (totalSp >= 15) state.roster[mdParts[1]].skillTree[treeName].tier = 4;
      else if (totalSp >= 8)  state.roster[mdParts[1]].skillTree[treeName].tier = 3;
      else if (totalSp >= 3)  state.roster[mdParts[1]].skillTree[treeName].tier = 2;
    }`
    );
    fs.writeFileSync(kpiCorePath, coreContent, 'utf8');
    console.log('✅ Step 4: Updated backend kpi-core.js with +3 SP modifier tree deposit');
  }
}
