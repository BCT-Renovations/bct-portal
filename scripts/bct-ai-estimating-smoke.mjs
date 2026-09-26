import fs from 'node:fs';

const aiHtml = fs.readFileSync(new URL('../ai-estimating.html', import.meta.url), 'utf8');
const edgeSource = fs.readFileSync(new URL('../supabase/functions/bct-ai-estimate/index.ts', import.meta.url), 'utf8');
const safeEstimateSql = fs.readFileSync(new URL('../supabase/migrations/20260926104500_homeowner_safe_estimate_summary.sql', import.meta.url), 'utf8');
const completionMarker = fs.readFileSync(new URL('../supabase/migrations/20260925204500_ai_estimating_completion_applied.sql', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const scripts = [...aiHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(match => match[1]);
scripts.forEach((script, index) => {
  if (script.includes('cdn.jsdelivr.net')) return;
  try {
    new Function(script);
  } catch (error) {
    throw new Error(`AI estimating inline script ${index + 1} failed to parse: ${error.message}`);
  }
});

const uiMarkers = [
  'AI creates drafts only',
  'AI Cost Controls',
  'enforceAiCostGuard',
  'Save & Recalculate',
  'Materials, Labor & Other Costs',
  'Manual Approval Gate',
  'AI cannot approve or release this estimate',
  'approve_customer',
  'Manually Approve & Release to Homeowner',
  'Internal cost/markup fields are excluded from the homeowner estimate-item feed.'
];

for (const marker of uiMarkers) {
  assert(aiHtml.includes(marker), `AI estimating UI must include: ${marker}`);
}

const edgeMarkers = [
  "req.headers.get('authorization')",
  "rpc('is_bct_admin')",
  "return new Response(JSON.stringify({ error: 'BCT admin required' })",
  "rpc('bct_admin_generate_ai_estimate'",
  "rpc('bct_admin_update_estimate'",
  "rpc('bct_admin_save_estimate_item'",
  "rpc('bct_admin_recalculate_estimate'",
  "rpc('bct_admin_review_ai_estimate'",
  "rpc('bct_admin_approve_customer_estimate'",
  "rpc('bct_admin_ai_estimating_state'"
];

for (const marker of edgeMarkers) {
  assert(edgeSource.includes(marker), `AI edge function must preserve admin-only action mapping: ${marker}`);
}

assert(!edgeSource.includes('SUPABASE_SERVICE_ROLE'), 'AI edge function must not depend on a service-role key.');
assert(!edgeSource.includes("status='sent'"), 'AI edge function must not directly release estimates without the approval RPC.');
assert(!edgeSource.includes('approved_at=now()'), 'AI edge function must not directly set approval metadata.');

for (const field of ['internal_cost_subtotal', 'markup_percent', 'markup_amount', 'internal_notes', 'approved_by', 'created_by', 'ai_run_id']) {
  const safeFunction = safeEstimateSql.match(/create or replace function public\.bct_my_estimates_safe\(\)[\s\S]*?\$\$;/i)?.[0] || '';
  assert(!safeFunction.includes(field), `Homeowner-safe estimate summaries must not expose ${field}.`);
}

assert(completionMarker.includes('AI generation remains draft/review_required and never calls customer approval'), 'Completion marker must preserve AI manual approval boundary.');

console.log(`BCT AI estimating smoke passed: ${scripts.length} inline scripts parsed, admin-only edge action mapping verified, and customer-safe estimate fields protected.`);
