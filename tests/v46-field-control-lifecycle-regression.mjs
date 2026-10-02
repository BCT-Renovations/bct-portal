import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002140000_v46_field_control_lifecycle_hardening.sql','utf8');
const b2=fs.readFileSync('supabase/migrations/20261002083000_v46_field_controls_extension_batch2.sql','utf8');
for(const x of ['bct_admin_field_control_blockers','required_checklist','utility_not_restored','failed_inspection_correction','bct_refresh_field_logistics_attention','delivery_discrepancy','dumpster_expiration'])assert.ok(sql.includes(x),'field lifecycle missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'Admin authority missing');
assert.ok((b2.match(/as \$\$/g)||[]).length>=3,'Batch2 function delimiters not hardened');
assert.ok(!/as \$\ndeclare/.test(b2),'Invalid single-dollar function delimiter remains');
console.log('V46 multi-control lifecycle regression checks passed');