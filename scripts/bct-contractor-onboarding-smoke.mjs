import fs from 'node:fs';

const indexHtml = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const bootstrapSql = fs.readFileSync(new URL('../supabase/migrations/20260925210000_harden_public_bootstrap_admin_role.sql', import.meta.url), 'utf8');
const launchStatus = fs.readFileSync(new URL('../LAUNCH_STATUS.md', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (let i = 1; i <= 5; i += 1) {
  assert(indexHtml.includes(`Professional Reference #${i}`), `Contractor form must show professional reference #${i}.`);
  assert(indexHtml.includes(`name="ref${i}" required`), `Contractor reference #${i} name must be required.`);
  assert(indexHtml.includes(`name="ref${i}contact" required`), `Contractor reference #${i} contact must be required.`);
}

assert(indexHtml.includes('for(let i=1;i<=5;i++)'), 'Contractor submit handler must collect all five references.');
assert(indexHtml.includes("refs.length!==5"), 'Contractor submit handler must reject incomplete reference sets.');
assert(indexHtml.includes('All five professional references and their contact information are required.'), 'Contractor reference validation must show exact-five wording.');
assert(indexHtml.includes('references,screening_result:screeningResult'), 'Contractor payload must include references and screening result together.');
assert(bootstrapSql.includes("'minimum_contractor_references',5"), 'Public bootstrap must advertise five minimum contractor references.');
assert(bootstrapSql.includes("'maximum_contractor_references',5"), 'Public bootstrap must advertise five maximum contractor references.');
assert(launchStatus.includes('Production Supabase verification confirms `bct_submit_contractor_application` rejects fewer than five or more than five complete professional references'), 'Launch status must record live Supabase contractor-reference verification.');

console.log('BCT contractor onboarding smoke passed: exact five-reference UI, payload, bootstrap, and launch-status verification markers present.');
