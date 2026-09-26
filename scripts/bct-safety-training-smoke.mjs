import fs from 'node:fs';
const files=[
 'supabase/migrations/20260926114500_contractor_safety_training_automation.sql',
 'supabase/migrations/20260926115500_safety_training_admin_automation.sql'
];
const sql=files.map(p=>fs.readFileSync(p,'utf8')).join('\n');
const checks=[
 ['monthly default',/cadence_days[^\n]*default 30/i],
 ['grace period',/grace_days/i],
 ['core and trade modules',/module_type[^\n]*core[^\n]*trade/i],
 ['quiz requirement',/quiz_required/i],
 ['verified completion',/completion_verified/i],
 ['safety workforce restriction',/safety_restricted/i],
 ['separate admin hold',/admin_hold/i],
 ['completion RPC',/bct_complete_my_safety_training/i],
 ['admin exemption',/bct_admin_exempt_safety_training/i],
 ['admin hold RPC',/bct_admin_set_contractor_hold/i],
 ['compliance refresh',/bct_refresh_safety_training_compliance/i],
 ['reminder automation',/bct_admin_process_safety_training_reminders/i],
 ['deduplicated reminders',/unique\(assignment_id,reminder_key\)/i],
 ['new work eligibility',/bct_contractor_workforce_eligible/i],
 ['assignment gate',/bct_assignment_workforce_eligibility/i],
 ['available jobs gate',/bct_my_available_jobs/i],
 ['audit completion',/safety_training_assignment[^\n]*completed/i],
 ['RLS enabled',/enable row level security/i],
 ['anonymous access revoked',/revoke all[^;]*from anon/i],
 ['foreign-key indexes',/idx_safety_assignments_module_id/i]
];
let failed=0;
for(const [name,re] of checks){
 const ok=re.test(sql); console.log(`${ok?'PASS':'FAIL'}: ${name}`); if(!ok) failed++;
}
if(failed) process.exit(1);
console.log(`PASS: ${checks.length} safety-training launch assertions.`);
