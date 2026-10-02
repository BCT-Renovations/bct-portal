import fs from 'node:fs';import assert from 'node:assert/strict';
const s=fs.readFileSync('supabase/migrations/20261002002500_bct_insurance_internal_notes.sql','utf8');
for(const x of ['bct_admin_add_insurance_internal_note',"'bct_only'",'public.is_bct_admin()',"visibility='insurance_and_bct'",'bct_insurance_can_read_claim(claim_id)'])assert.ok(s.includes(x),x+' missing');
assert.ok(s.includes("'status_note'"),'internal note event type missing');
console.log('BCT Insurance private-note boundary checks passed');