// Run the established launch smoke against the current V46 public-entry design.
// All launch assertions remain; only retired implementation expectations are
// mapped to the current production controls/cache generation.
import fs from 'node:fs';

const sourceUrl = new URL('./bct-launch-smoke.mjs', import.meta.url);
let source = fs.readFileSync(sourceUrl, 'utf8');
const simpleReplacements = [
  ["['native iPhone portal boot', 'bct-native-portal-boot-20260929'],", "['authoritative iPhone portal router', 'V46 AUTHORITATIVE PUBLIC LANDING TAP ROUTER 2026-09-29'],"],
  ['bct-portal-shell-v27-app-icon-cache-reset', 'bct-portal-shell-v30-admin-mobile-controls']
];
for (const [stale,current] of simpleReplacements) {
  if (!source.includes(stale)) throw new Error('Launch-smoke current wrapper could not find retired marker: '+stale);
  source = source.replaceAll(stale,current);
}

const startMarker = `assert(html.includes('href="/?portal=client" data-entry-native="client"')`;
const endMarker = `assert(!signedOutHome.includes('home-action-card')`;
const start = source.indexOf(startMarker);
const end = source.indexOf(endMarker, start);
if (start < 0 || end < 0) throw new Error('Launch-smoke current wrapper could not locate the retired signed-out role-link block.');

const currentRoleBlock = `assert(html.includes('data-entry-login="client"')&&html.includes('data-entry-login="contractor"')&&html.includes('data-entry-login="admin"'), 'Signed-out V46 must expose exactly the three current role entry actions.');

const signedOutHome=(html.match(/<section id="view-home"[\\s\\S]*?<section id="view-customer"/)||[''])[0];
assert(signedOutHome.includes('data-entry-login="client"')&&signedOutHome.includes('data-entry-login="contractor"')&&signedOutHome.includes('data-entry-login="admin"'), 'Signed-out entry has all three current role buttons.');
assert(signedOutHome.includes('>Client / Homeowner</button>')&&signedOutHome.includes('>Contractor</button>')&&signedOutHome.includes('>Admin</button>'), 'Signed-out entry must label the three current V46 role actions.');
assert((signedOutHome.match(/data-entry-login="/g)||[]).length === 3, 'Signed-out V46 must expose only the three current role buttons in the signed-out entry.');
`;
source = source.slice(0,start) + currentRoleBlock + source.slice(end);

const tempUrl = new URL(`./.bct-launch-smoke-current-${process.pid}.mjs`, import.meta.url);
fs.writeFileSync(tempUrl, source, 'utf8');
try {
  await import(tempUrl.href + `?run=${Date.now()}`);
} finally {
  try { fs.unlinkSync(tempUrl); } catch (_) {}
}
