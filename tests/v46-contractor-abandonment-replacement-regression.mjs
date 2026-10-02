import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002145000_v46_contractor_abandonment_replacement.sql','utf8');
for(const x of ['bct_admin_mark_contractor_abandonment','bct_admin_resolve_contractor_replacement','abandonment_reported_at','abandonment_reason','replacement_required','replacement_assignment_id','contractor_replacement_required','bct_admin_set_assignment_status'])assert.ok(sql.includes(x),'contractor replacement coverage missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'contractor replacement Admin guard missing');
assert.ok(sql.includes('same project'),'replacement project boundary missing');
assert.ok(sql.includes("perform public.bct_admin_set_assignment_status(p_assignment_id,'cancelled')"),'canonical assignment cancellation path not reused');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'contractor replacement hardened search path missing');
console.log('V46 contractor abandonment/replacement regression checks passed');