import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const serviceWorker = fs.readFileSync(new URL('../service-worker.js', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) throw new Error(message);
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

assert(serviceWorker.includes('bct-command-center-hotfix'), 'service worker must keep the V46 command center/typeahead shell fresh.');
assert(serviceWorker.includes('bct-clean-signin-hotfix'), 'service worker must force the clean signed-out entry screen.');
assert(serviceWorker.includes('bct-admin-login-hotfix'), 'service worker must keep the admin login hotfix.');
assert(serviceWorker.includes('bct-official-logo-hotfix'), 'service worker must force the selected official logo rollout.');
assert(serviceWorker.includes('bct-green-logo-band-hotfix'), 'service worker must force the full-width green logo band rollout.');
assert(serviceWorker.includes('bct-portal-entry-hotfix'), 'service worker must preserve repaired Client and Contractor portal entry rendering.');
assert(serviceWorker.includes('bct-signup-home-nav-hotfix'), 'service worker must preserve the seven-step signup Back to Home control.');
assert(serviceWorker.includes('bct-runtime-guardrails'), 'service worker must preserve V46 runtime guardrails.');
assert(serviceWorker.includes('bct-admin-mobile-controls-hotfix'), 'service worker must preserve signed-in Admin touch protection.');
const cacheMatch = serviceWorker.match(/const CACHE_NAME='bct-portal-shell-v(\d+)-[^']+'/);
assert(cacheMatch && Number(cacheMatch[1]) >= 30, 'service worker must use the current V46 iPhone/PWA cache generation.');
assert(serviceWorker.includes('/bct-admin-mobile-fix.js?v=20260930-4'), 'current Admin mobile and Spanish stability script must be injected.');
assert(html.includes('/bct-admin-control-board.js?v=20260930-2'), 'Admin Control Board must be wired into the live Admin document.');
assert(serviceWorker.includes("const STATIC_ASSETS=['/bct-logo-master.png','/bct-app-icon-v46.png']"), 'service worker static cache must stay limited to the official logo and app icon.');
assert(!/APP_SHELL\s*=\s*\[[^\]]*['"]\/['"]/s.test(serviceWorker), 'service worker must not cache the root HTML startup path.');
assert(!/APP_SHELL\s*=\s*\[[^\]]*['"]\/index\.html['"]/s.test(serviceWorker), 'service worker must not cache index.html.');
assert(serviceWorker.includes("if(!STATIC_ASSETS.includes(url.pathname)||url.search)return;"), 'service worker must refuse to cache non-asset routes and query-string responses.');
assert(serviceWorker.includes("cache:'no-store'"), 'service worker must fetch startup HTML with no-store.');
assert(!serviceWorker.includes("'/bct-homeowner-pages.js'"), 'service worker must not cache the retired standalone homeowner controller.');

assert(html.includes('data-entry-login="client"'), 'Client/Homeowner public entry control must remain in the primary HTML.');
assert(html.includes('data-entry-login="contractor"'), 'Contractor public entry control must remain in the primary HTML.');
assert(html.includes('data-entry-login="admin"'), 'Admin public entry control must remain in the primary HTML.');
assert(html.includes('V46 AUTHORITATIVE PUBLIC LANDING TAP ROUTER 2026-09-29'), 'authoritative public landing tap router must remain present.');
assert(html.includes('id="bctShareAppBtn"'), 'Share App button must remain present.');
assert(html.includes('id="bctClientBackHomeTop"'), 'Client Back to Home control must remain present.');
assert(html.includes('id="bctNewClientBackBtn"'), 'New-client Back control must remain present.');

assert(html.includes('maxFiles:10'), 'V46 must enforce the 10-file upload limit in JavaScript.');
assert(html.includes('maxFileSizeBytes:25*1024*1024'), 'V46 must enforce the 25 MB document/image upload limit.');
assert(html.includes('maxVideoSizeBytes:100*1024*1024'), 'V46 must enforce the 100 MB project video upload limit.');
assert(html.includes("files=validateUploadFiles(files,'project')"), 'Homeowner uploads must be revalidated immediately before Supabase storage upload.');
assert(html.includes("files=validateUploadFiles(files,documentType==='work_photo'?'contractorPhoto':'contractorDocument')"), 'Contractor uploads must be revalidated immediately before Supabase storage upload.');
assert(html.includes("if(refs.length!==5)throw new Error('All five professional references and their contact information are required.')"), 'Contractor submission must require all five professional references.');
assert(html.includes("p_sanitized_scope:String(f.get('scope')||'')"), 'Published contractor jobs must use the sanitized scope field.');
assert(html.includes("esc(j.sanitized_scope||'')"), 'Contractor job cards must render only the sanitized scope.');
assert(!/available_jobs[\s\S]{0,1800}resident_(?:name|phone)/i.test(html), 'Contractor available-job rendering must not expose resident name or phone.');
assert(html.includes('p_admin_override_second_job:override'), 'Second active contractor assignment must remain behind an explicit BCT Admin override.');

assert(serviceWorker.includes("const OPTIONAL_FEATURES=['weather_external_provider_enabled','electronic_signatures_enabled','ai_estimating_external_engine_enabled']"), 'optional integration safe-mode list must remain defined.');
assert(serviceWorker.includes("bctFeatureEnabled('weather_external_provider_enabled',false)"), 'live weather provider must default off.');
assert(serviceWorker.includes("bctFeatureEnabled('ai_estimating_enabled',true)"), 'AI estimating core flag must remain available.');

try {
  new Function(serviceWorker);
} catch (error) {
  throw new Error(`service-worker.js failed to parse: ${error.message}`);
}

console.log('BCT current source integrity smoke passed.');
