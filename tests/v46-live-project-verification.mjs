import fs from 'node:fs';
import assert from 'node:assert/strict';

const live=fs.readFileSync('bct-live-project-verification.js','utf8');
const admin=fs.readFileSync('bct-admin-sections.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20260930165200_add_live_project_verification.sql','utf8');

for (const checkpoint of ['arrival','pre_cover','progress','final']) {
  assert.ok(live.includes(checkpoint),`missing checkpoint ${checkpoint}`);
  assert.ok(migration.includes(checkpoint),`migration missing checkpoint ${checkpoint}`);
}
for (const result of ['passed','needs_correction','recheck_required']) {
  assert.ok(live.includes(result),`missing result ${result}`);
  assert.ok(migration.includes(result),`migration missing result ${result}`);
}

assert.ok(live.includes('bct_admin_create_live_verification'),'admin create RPC missing');
assert.ok(live.includes('bct_admin_update_live_verification'),'admin update RPC missing');
assert.ok(live.includes('bct_my_assigned_inspections'),'contractor inspection feed missing');
assert.ok(live.includes('not a city or code inspection'),'quality-control disclaimer missing');
assert.ok(live.includes('https://'),'secure video-link requirement missing');
assert.ok(migration.includes("verification_mode in ('standard','live_video')"),'verification-mode constraint missing');
assert.ok(migration.includes('revoke all on function public.bct_admin_create_live_verification'),'RPC public execute revoke missing');
assert.ok(migration.includes('grant execute on function public.bct_admin_create_live_verification'),'authenticated RPC grant missing');
assert.ok(admin.includes('/bct-live-project-verification.js?v=20260930-1'),'Admin loader is not wired to live verification script');

console.log('V46 live project verification smoke checks passed.');
