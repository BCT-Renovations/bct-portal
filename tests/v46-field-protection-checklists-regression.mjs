import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002143000_v46_field_protection_checklists.sql','utf8');
for(const x of ['bct_admin_ensure_field_protection_checklists','preconstruction_orientation','occupied_home_protection','contents_protection','noise_dust_odor','temporary_protection','end_of_day_security','final_property_return','bct_project_checklists','bct_checklist_items','public.is_bct_admin()'])assert.ok(sql.includes(x),'field protection checklist coverage missing '+x);
assert.ok(sql.includes('where not exists'),'checklist bootstrap must be idempotent');
assert.ok(sql.includes('evidence_required')&&sql.includes('blocks_progress'),'checklist evidence/progress controls missing');
console.log('V46 field protection checklist regression checks passed');