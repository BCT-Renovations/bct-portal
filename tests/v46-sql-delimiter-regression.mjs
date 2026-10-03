import fs from 'node:fs';import assert from 'node:assert/strict';
const files=[
'supabase/migrations/20261002083000_v46_field_controls_extension_batch2.sql',
'supabase/migrations/20261002100000_v46_portal_composition_batch5.sql',
'supabase/migrations/20261002113000_v46_homeowner_portal_actions.sql',
'supabase/migrations/20261002050000_contractor_identity_trade_leads.sql'
];
for(const f of files){const s=fs.readFileSync(f,'utf8');assert.ok(!/^\s*as \$\s*$/m.test(s),f+' contains malformed as $ delimiter');assert.ok(!/^\s*end \$;\s*$/m.test(s),f+' contains malformed end $; delimiter');}
console.log('V46 SQL delimiter regression checks passed');