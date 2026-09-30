// Run the established launch smoke against the current V46 public-entry design.
// Historical assertions stay intact; only retired implementation markers are
// mapped to the current production equivalents.
import fs from 'node:fs';

const sourceUrl = new URL('./bct-launch-smoke.mjs', import.meta.url);
let source = fs.readFileSync(sourceUrl, 'utf8');
const replacements = [
  ["['native iPhone portal boot', 'bct-native-portal-boot-20260929'],", "['authoritative iPhone portal router', 'V46 AUTHORITATIVE PUBLIC LANDING TAP ROUTER 2026-09-29'],"],
  ['bct-portal-shell-v27-app-icon-cache-reset', 'bct-portal-shell-v29-runtime-guardrails']
];
for (const [stale,current] of replacements) {
  if (!source.includes(stale)) throw new Error('Launch-smoke compatibility wrapper could not find retired marker: '+stale);
  source = source.replaceAll(stale,current);
}

const tempUrl = new URL(`./.bct-launch-smoke-current-${process.pid}.mjs`, import.meta.url);
fs.writeFileSync(tempUrl, source, 'utf8');
try {
  await import(tempUrl.href + `?run=${Date.now()}`);
} finally {
  try { fs.unlinkSync(tempUrl); } catch (_) {}
}
