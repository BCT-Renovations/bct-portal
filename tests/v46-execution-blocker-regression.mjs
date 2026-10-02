import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002141000_v46_execution_blocker_hardening.sql','utf8');
for(const x of ['bct_refresh_execution_blocker_attention','bct_execution_blockers','homeowner_decision_overdue','hidden_condition_unresolved','material_substitution_approval','public.is_bct_admin()'])assert.ok(sql.includes(x),'execution blocker missing '+x);
assert.ok(sql.includes('customer_approval_required')&&sql.includes('approved_at is null'),'substitution approval gate missing');
assert.ok(sql.includes('work_stopped')&&sql.includes('resolved_at is null'),'hidden condition stop-work gate missing');
console.log('V46 execution blocker regression checks passed');