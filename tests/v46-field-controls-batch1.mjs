import fs from 'node:fs';

const sql=fs.readFileSync(new URL('../supabase/migrations/20261002080000_v46_field_controls_extension_batch1.sql', import.meta.url),'utf8');

const required=[
  'bct_incidents','immediate_safety_response','bct_alerted_at','follow_up_required',
  'bct_stop_work_orders','affected_scope','corrective_requirements',
  'bct_site_keys','access_type','access_purpose','revoked_at',
  'bct_customer_materials','brand','model','size_spec','additional_material_required',
  'bct_delivery_receipts','delivery_ticket_path','secured_location','quantity_received',
  'bct_daily_logs','crew_present','issue_summary','next_steps','photo_refs',
  'bct_equipment_usage','rental_company','return_deadline','late_fee_exposure',
  'bct_customer_decisions','reminder_count','schedule_impact',
  'bct_utility_interruptions','safe_restoration_confirmed',
  'bct_code_corrections','clearance_status',
  'bct_special_orders','measurement_verified','selection_approved','price_approved',
  'bct_refresh_equipment_return_attention','bct_action_inbox',
  'bct_admin_release_stop_work','is_bct_admin'
];

for (const token of required) {
  if (!sql.includes(token)) throw new Error('Missing expected token: '+token);
}

const forbidden=[
  'create table public.bct_incidents',
  'create table public.bct_stop_work_orders',
  'create table public.bct_site_keys',
  'create table public.bct_customer_materials',
  'create table public.bct_daily_logs',
  'create table public.bct_equipment_usage',
  'create table public.bct_action_inbox'
];

for (const token of forbidden) {
  if (sql.toLowerCase().includes(token)) throw new Error('Duplicate system creation detected: '+token);
}

console.log('V46 field controls batch 1 smoke checks passed');
