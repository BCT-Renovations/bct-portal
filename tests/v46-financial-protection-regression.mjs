import fs from 'node:fs';import assert from 'node:assert/strict';
const sql=fs.readFileSync('supabase/migrations/20261002123000_v46_financial_protection_controls.sql','utf8');
const completion=fs.readFileSync('supabase/migrations/20261002124000_v46_financial_protection_completion.sql','utf8');
const closeout=fs.readFileSync('supabase/migrations/20261002125000_v46_financial_closeout_enforcement.sql','utf8');
const batch3=fs.readFileSync('supabase/migrations/20261002090000_v46_field_controls_extension_batch3.sql','utf8');
for(const x of ['bct_refresh_financial_protection_attention','bct_financial_closeout_blockers','bct_budget_lines','bct_allowances','bct_unbudgeted_cost_alerts','bct_lien_waivers','bct_retainage','bct_refunds_credits','bct_back_charges','bct_action_inbox'])assert.ok(sql.includes(x),'financial protection missing '+x);
for(const x of ["'job_cost_variance'","'allowance_overage'","'unbudgeted_cost'"])assert.ok(sql.includes(x),'financial attention category missing '+x);
for(const x of ["'lien_waiver'","'retainage'","'refund_credit'","'back_charge'"])assert.ok(sql.includes(x),'financial closeout blocker missing '+x);
assert.ok(sql.includes('public.is_bct_admin()'),'BCT Admin authorization missing');
assert.ok(sql.includes('security definer set search_path=public,auth,pg_temp'),'hardened search path missing');
assert.ok(batch3.includes('variance_amount')&&batch3.includes('variance_status'),'existing job-cost variance extension missing');
console.log('V46 financial protection regression checks passed');
for(const x of ['bct_financial_protection_snapshot','bct_refresh_payment_milestone_attention','payment_past_due','milestone_overdue','late_fee_exposure','bct_warranty_responsibility','bct_financial_closeouts'])assert.ok(completion.includes(x),'financial completion control missing '+x);
assert.ok(completion.includes('public.is_bct_admin()'),'financial snapshot Admin guard missing');

for(const x of ['bct_admin_finalize_financial_closeout','bct_refresh_financial_closeout_attention','bct_payment_dispute_holds','bct_warranty_responsibility','Financial closeout blocked'])assert.ok(closeout.includes(x),'final financial closeout protection missing '+x);
assert.ok(closeout.includes("status='closed',closed_at=now(),closed_by=auth.uid()"),'closeout audit fields missing');
