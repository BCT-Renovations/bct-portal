import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const preview = read('bct-insurance-preview-shell.js');
const portal = read('bct-insurance-portal.js');
const admin = read('bct-insurance-admin.js');

assert.match(preview, /Preview only:/, 'Public preview must disclose its nonfunctional state');
assert.match(preview, /not enabled/, 'Preview must not imply live claims submission');
assert.doesNotMatch(preview, /\.from\s*\(|\.rpc\s*\(|auth\.signIn|auth\.signOut|fetch\s*\(/, 'Visual-only preview must not call database, auth, or network APIs');
assert.doesNotMatch(preview, /bct-insurance-portal\.js|bct-insurance-admin\.js/, 'Preview must not load live insurance modules');
assert.match(portal, /bct_insurance_submit_claim/, 'Partner submissions must use the authorized RPC');
assert.doesNotMatch(portal, /\.from\s*\(\s*['"`]bct_projects['"`]\s*\)\s*\.insert/, 'Insurance portal must not create BCT projects directly');
assert.doesNotMatch(admin, /\.from\s*\(\s*['"`]bct_projects['"`]\s*\)\s*\.insert/, 'Admin insurance panel must not bypass canonical project creation');
assert.doesNotMatch(portal + admin, /contractor_bids/, 'Insurance modules must not expose contractor bidding');
console.log('TAKAI insurance preview and project-write isolation checks passed');
