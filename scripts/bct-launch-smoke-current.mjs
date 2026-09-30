// Run the established launch smoke against the current V46 public-entry design.
// The historical suite is preserved; only the retired native-portal boot marker
// is mapped to the authoritative three-button landing router now used in production.
import fs from 'node:fs';

const sourceUrl = new URL('./bct-launch-smoke.mjs', import.meta.url);
let source = fs.readFileSync(sourceUrl, 'utf8');
const stale = "['native iPhone portal boot', 'bct-native-portal-boot-20260929'],";
const current = "['authoritative iPhone portal router', 'V46 AUTHORITATIVE PUBLIC LANDING TAP ROUTER 2026-09-29'],";
if (!source.includes(stale)) throw new Error('Launch-smoke compatibility wrapper could not find the retired native-portal marker.');
source = source.replace(stale, current);

const tempUrl = new URL(`./.bct-launch-smoke-current-${process.pid}.mjs`, import.meta.url);
fs.writeFileSync(tempUrl, source, 'utf8');
try {
  await import(tempUrl.href + `?run=${Date.now()}`);
} finally {
  try { fs.unlinkSync(tempUrl); } catch (_) {}
}
