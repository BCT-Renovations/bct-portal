import fs from 'node:fs';
import assert from 'node:assert/strict';

const html = fs.readFileSync('index.html', 'utf8');
const sw = fs.readFileSync('service-worker.js', 'utf8');

const sourceGuard = "const hasSession=!!session?.user;const publicHome=!entryIntent&&!document.body.classList.contains('bct-portal-entered')&&!document.body.classList.contains('bct-home-signup')&&!document.body.classList.contains('bct-contractor-signup')&&(!location.hash||location.hash==='#home');const signedIn=hasSession&&!publicHome;";
assert.equal(html.includes(sourceGuard), true, 'index.html must keep restored sessions visually signed out on public Home');
assert.equal(sw.includes('patchPublicHomeAuthShell'), false, 'service worker must not rewrite auth-shell source at runtime');
assert.equal(sw.includes("const BCT_CACHE_PREFIX = 'bct-portal-shell-';"), true, 'service worker must target old BCT shell caches for cleanup');
assert.equal(sw.includes('self.registration.unregister()'), true, 'service worker must unregister so iPhone Add to Home Screen sees direct Vercel assets');
assert.equal(html.includes("serviceWorker.getRegistrations().then(function(regs){"), true, 'index.html must proactively unregister stale service workers on load');

function authenticated({hasSession, entryIntent=null, portalEntered=false, homeSignup=false, contractorSignup=false, hash=''}) {
  const publicHome = !entryIntent && !portalEntered && !homeSignup && !contractorSignup && (!hash || hash === '#home');
  return hasSession && !publicHome;
}

assert.equal(authenticated({hasSession:true}), false, 'cold standalone Home launch with restored session must remain public');
assert.equal(authenticated({hasSession:true, hash:'#home'}), false, '#home with restored session must remain public');
assert.equal(authenticated({hasSession:true, entryIntent:'client'}), true, 'deliberate Client portal entry may use restored session');
assert.equal(authenticated({hasSession:true, entryIntent:'contractor'}), true, 'deliberate Contractor portal entry may use restored session');
assert.equal(authenticated({hasSession:true, entryIntent:'admin'}), true, 'deliberate Admin portal entry may use restored session');
assert.equal(authenticated({hasSession:true, portalEntered:true}), true, 'already-entered portal may remain authenticated');

console.log('V46 PWA cold-launch source regression: PASS');
