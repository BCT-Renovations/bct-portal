import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const aiHtml = fs.readFileSync(new URL('../ai-estimating.html', import.meta.url), 'utf8');
const homeownerEstimateSafetySql = fs.readFileSync(
  new URL('../supabase/migrations/20260926104500_homeowner_safe_estimate_summary.sql', import.meta.url),
  'utf8'
);
const contractorJobSafetySql = fs.readFileSync(
  new URL('../supabase/migrations/20260926110500_contractor_safe_available_jobs.sql', import.meta.url),
  'utf8'
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const safeFunctionMatch = homeownerEstimateSafetySql.match(
  /create or replace function public\.bct_my_estimates_safe\(\)[\s\S]*?\$\$;/i
);
assert(safeFunctionMatch, 'Missing bct_my_estimates_safe function.');

const safeFunction = safeFunctionMatch[0];
const forbiddenHomeownerEstimateFields = [
  'internal_cost_subtotal',
  'markup_percent',
  'markup_amount',
  'internal_notes',
  'approved_by',
  'created_by',
  'ai_run_id'
];

for (const field of forbiddenHomeownerEstimateFields) {
  assert(!safeFunction.includes(field), `Homeowner-safe estimates must not expose ${field}.`);
}

assert(
  homeownerEstimateSafetySql.includes("'estimates',coalesce((select jsonb_agg(to_jsonb(x) order by x.created_at desc) from public.bct_my_estimates_safe() x)"),
  'Homeowner state must use bct_my_estimates_safe for estimate summaries.'
);
assert(
  homeownerEstimateSafetySql.includes("'estimate_items',coalesce((select jsonb_agg(to_jsonb(x) order by x.estimate_id,x.sort_order) from public.bct_my_estimate_items_safe() x)"),
  'Homeowner state must keep using bct_my_estimate_items_safe for line items.'
);

const safeJobsMatch = contractorJobSafetySql.match(
  /create or replace function public\.bct_my_available_jobs_safe\(\)[\s\S]*?\$\$;/i
);
assert(safeJobsMatch, 'Missing bct_my_available_jobs_safe function.');

const safeJobsFunction = safeJobsMatch[0];
for (const field of ['target_subcontract_amount', 'project_id']) {
  assert(!safeJobsFunction.includes(field), `Contractor available jobs must not expose ${field}.`);
}
assert(
  contractorJobSafetySql.includes('from public.bct_my_available_jobs_safe()'),
  'Contractor state must use bct_my_available_jobs_safe for available jobs.'
);
assert(
  indexHtml.includes('Customer information is BCT-only. Contractors receive a separate sanitized scope'),
  'Admin UI must keep contractor publication framed as sanitized scope only.'
);
assert(
  indexHtml.includes('contractorAccessMessage(app)') && indexHtml.includes('Contractor access locked'),
  'Contractor portal must keep jobs and bids locked until screening/admin approval.'
);
assert(
  indexHtml.includes('Your bid is private. Other contractors cannot see it. BCT target amounts stay internal.'),
  'Contractor bids must stay private and BCT target amounts must stay internal.'
);
assert(!indexHtml.includes('j.target_subcontract_amount'), 'Contractor UI must not render BCT target subcontract amounts.');
assert(
  aiHtml.includes('Internal cost/markup fields are excluded from the homeowner estimate-item feed.'),
  'AI estimating release message must preserve customer-safe estimate feed wording.'
);

console.log('BCT role visibility smoke passed: homeowner estimates, contractor jobs, and bid privacy markers verified.');
