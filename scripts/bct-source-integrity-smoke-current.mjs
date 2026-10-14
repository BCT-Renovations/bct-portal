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

// TAKAI's approved iPhone fix unregisters its worker instead of caching startup HTML.
assert(serviceWorker.includes('await self.registration.unregister()'), 'worker must unregister for the approved iPhone icon fix.');
assert(serviceWorker.includes('key.startsWith(BCT_CACHE_PREFIX)'), 'worker must remove only BCT caches.');
assert(!serviceWorker.includes('respondWith('), 'worker must not intercept network requests.');
assert(/src=["'][^"']*bct-admin-sections\.js/.test(html), 'Admin Control Board must be wired into the live Admin document.');
assert(html.indexOf('/bct-admin-sections.js') < html.indexOf('/bct-admin-mobile-fix.js?v=20260930-4'), 'Admin Control Board must load before the mobile Admin compatibility layer.');
const adminControlBoard = fs.readFileSync(new URL('../bct-admin-control-board.js', import.meta.url), 'utf8');
const adminSections = fs.readFileSync(new URL('../bct-admin-sections.js', import.meta.url), 'utf8');
assert(!adminControlBoard.includes('scrollIntoView('), 'Admin Control Board must not auto-scroll with scrollIntoView.');
assert(!adminControlBoard.includes('scrollTo('), 'Admin Control Board must not auto-scroll with scrollTo.');
assert(!adminControlBoard.includes("addEventListener('pageshow'"), 'Admin Control Board must not reposition on pageshow.');
assert(!adminControlBoard.includes("addEventListener('hashchange'"), 'Admin Control Board must not reposition on hashchange.');
assert(!adminControlBoard.includes('position:sticky'), 'Admin Control Board navigation must not use sticky positioning.');
assert(adminSections.includes('script[src*="/bct-admin-control-board.js"]'), 'Admin section loader must prevent duplicate Control Board script loading.');
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

try {
  new Function(serviceWorker);
} catch (error) {
  throw new Error(`service-worker.js failed to parse: ${error.message}`);
}

console.log('BCT current source integrity smoke passed.');
