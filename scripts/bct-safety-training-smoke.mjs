import fs from 'node:fs';
const ui=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const reminderSql=fs.readFileSync(new URL('../supabase/migrations/20260926161000_safety_settings_privacy_and_reminder_schedule.sql',import.meta.url),'utf8');
const configSql=fs.readFileSync(new URL('../supabase/migrations/20260926160500_admin_safety_configuration_state.sql',import.meta.url),'utf8');
const files=[
 'supabase/migrations/20260926114500_contractor_safety_training_automation.sql',
 'supabase/migrations/20260926115500_safety_training_admin_automation.sql',
 'supabase/migrations/20260926140500_safety_training_assignment_snapshots.sql',
 'supabase/migrations/20260926153000_safety_completion_invoker_and_hold_guard.sql',
 'supabase/migrations/20260926153500_admin_permanent_safety_training_history.sql'
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
 ['foreign-key indexes',/idx_safety_assignments_module_id/i],
 ['immutable assignment snapshots',/module_title_snapshot/i],
 ['completion uses caller privileges',/security invoker/i],
 ['completion preserves admin hold',/admin_hold[^\n]*false/i],
 ['permanent admin history RPC',/bct_admin_safety_training_history/i],
 ['history includes acknowledgment evidence',/acknowledged_at/i],
 ['history includes quiz evidence',/quiz_score/i]
,
 ['safety settings are BCT Admin-only',reminderSql.includes('create policy "Safety settings admin read"')&&!reminderSql.includes('create policy "Safety settings authenticated read"')],
 ['reminders honor configured reminder days',reminderSql.includes('s.reminder_days')&&reminderSql.includes('foreach d')],
 ['reminders stop when training program is paused',reminderSql.includes("enabled',false")],
 ['admin safety configuration is admin-only',configSql.includes("is_bct_admin()")&&configSql.includes("revoke all")],
 ['admin can control safety cadence',ui.includes("adminSafetySettingsForm")&&ui.includes("bct_admin_upsert_safety_training_settings")],
 ['admin can create core and trade training modules',ui.includes("adminSafetyModuleForm")&&ui.includes("bct_admin_create_safety_training_module")],
 ['admin safety module creation is audited',ui.includes("Safety training module created")&&ui.includes("adminAuditEvent")]
];
let failed=0;
for(const [name,re] of checks){
 const ok=typeof re==='boolean'?re:re.test(sql); console.log(`${ok?'PASS':'FAIL'}: ${name}`); if(!ok) failed++;
}
if(failed) process.exit(1);
console.log(`PASS: ${checks.length} safety-training launch assertions.`);
