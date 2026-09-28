import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenHeaderMarkers = [
  'Warning: truncated output',
  'Total output lines:',
  'connector truncation'
];

const firstDocumentBytes = html.slice(0, 1000);

assert(html.startsWith('<!DOCTYPE html>'), 'index.html must start directly with <!DOCTYPE html>; no tool/header text may appear before the document.');

for (const marker of forbiddenHeaderMarkers) {
  assert(!firstDocumentBytes.includes(marker), `index.html begins with accidental tool/output marker: ${marker}`);
}

assert(!html.includes('Warning: truncated output (original token count:'), 'index.html contains an accidental connector truncation warning.');
assert(!html.includes('\nTotal output lines: '), 'index.html contains an accidental connector total-lines header.');
assert(!html.includes('connector truncation'), 'index.html contains an accidental connector truncation marker.');
assert(!html.includes('TypeError: Cannot read properties of undefined'), 'index.html contains copied runtime error text.');

assert(/<html\s+lang="en"/i.test(html), 'index.html must keep the primary HTML shell.');
assert(/<title>[^<]*BCT Renovations/i.test(html), 'index.html must keep the BCT Renovations title.');
assert(html.trim().endsWith('</html>'), 'index.html must end with a closing </html> tag.');

assert(serviceWorker.includes('bct-command-center-hotfix'), 'service worker must inject the V46 command center/typeahead shell.');
assert(serviceWorker.includes('bct-clean-signin-hotfix'), 'service worker must force the clean signed-out entry screen.');
assert(serviceWorker.includes('bct-admin-login-hotfix'), 'service worker must keep the admin login hotfix.');
assert(serviceWorker.includes('bct-official-logo-hotfix'), 'service worker must force the selected official logo rollout.');
assert(serviceWorker.includes('bct-portal-shell-v18-original-slogan-position'), 'service worker cache version must stay bumped for the current V46 rollout.');
assert(serviceWorker.includes('bct-portal-shell-v18-original-slogan-position'), 'service worker cache version must include the current V46 live cleanup rollout.');
assert(!serviceWorker.includes("'/bct-homeowner-pages.js'"), 'service worker must not cache the retired standalone homeowner controller.');

try {
  new Function(serviceWorker);
} catch (error) {
  throw new Error(`service-worker.js failed to parse: ${error.message}`);
}


console.log('BCT source integrity smoke passed.');
