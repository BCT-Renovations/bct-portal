import fs from 'node:fs';

const batch1=fs.readFileSync(new URL('../supabase/migrations/20261002080000_v46_field_controls_extension_batch1.sql', import.meta.url),'utf8').toLowerCase();
const batch2=fs.readFileSync(new URL('../supabase/migrations/20261002083000_v46_field_controls_extension_batch2.sql', import.meta.url),'utf8').toLowerCase();

const required=[
  ['incident lifecycle','immediate_safety_response',batch1],
  ['bct-only stop work release','bct_admin_release_stop_work',batch1],
  ['access custody','access_type',batch1],
  ['customer materials','additional_material_required',batch1],
  ['delivery custody','delivery_ticket_path',batch1],
  ['daily report','crew_present',batch1],
  ['rental escalation','bct_refresh_equipment_return_attention',batch1],
  ['customer decision impact','schedule_impact',batch1],
  ['utility restoration','safe_restoration_confirmed',batch1],
  ['failed inspection clearance','clearance_status',batch1],
  ['trade handoff','handoff_acknowledged_at',batch2],
  ['crew attendance','checked_in_at',batch2],
  ['substitution approval','substitute_approval_status',batch2],
  ['cannot perform','cannot_perform_reason',batch2],
  ['need BCT decision','question_category',batch2],
  ['hidden condition link','change_order_id',batch2],
  ['prework baseline','required_before_work',batch2],
  ['neighbor issue','bct_review_status',batch2],
  ['inspection hold point','clearance_required',batch2],
  ['material substitution approval','approval_id',batch2],
  ['special order confirmation','confirmation_complete',batch2],
  ['authorized crew check-in','bct_check_in_project_crew',batch2]
];

for (const [label,token,src] of required) {
  if (!src.includes(token)) throw new Error(label+' missing token '+token);
}

const duplicateCreates=[
  'create table public.bct_incidents',
  'create table public.bct_stop_work_orders',
  'create table public.bct_site_keys',
  'create table public.bct_customer_materials',
  'create table public.bct_delivery_receipts',
  'create table public.bct_daily_logs',
  'create table public.bct_equipment_usage',
  'create table public.bct_customer_decisions',
  'create table public.bct_utility_interruptions',
  'create table public.bct_code_corrections',
  'create table public.bct_special_orders',
  'create table public.bct_work_packages',
  'create table public.bct_project_crews',
  'create table public.bct_scope_items',
  'create table public.bct_field_questions',
  'create table public.bct_hidden_conditions',
  'create table public.bct_site_condition_baselines',
  'create table public.bct_neighbor_property_conditions',
  'create table public.bct_quality_hold_points',
  'create table public.bct_material_substitutions'
];
const combined=batch1+'\n'+batch2;
for (const token of duplicateCreates) {
  if (combined.includes(token)) throw new Error('Duplicate subsystem creation found: '+token);
}
if (!batch1.includes("bct_action_inbox")) throw new Error('Rental attention is not wired to existing action inbox');
if (!batch1.includes("critical")) throw new Error('Rental critical escalation missing');
if (!batch1.includes("overdue")) throw new Error('Rental overdue state missing');
if (!batch2.includes("bct_worker_assignments")) throw new Error('Crew check-in is not assignment-gated');
if (!batch2.includes("substitute_approval_status='approved'")) throw new Error('Substitution approval gate missing');

console.log('V46 field controls batches 1-2 integration smoke checks passed');
