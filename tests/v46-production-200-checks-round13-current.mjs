// Run the established round-13 launch-gap contracts against the current
// public-entry implementation. The 96 launch-gap needles remain untouched;
// only the retired native-link regression block is replaced by the current
// button/tap-router contract that is exercised by the iPhone/WebKit suite.
import fs from 'node:fs';

const sourceUrl = new URL('./v46-production-200-checks-round13.mjs', import.meta.url);
let source = fs.readFileSync(sourceUrl, 'utf8');

const startMarker = '/* 2026-09-29 iPhone portal-button regression guards */';
const resumeMarker = "check('authoritative router handles homeowner signup'";
const start = source.indexOf(startMarker);
const resume = source.indexOf(resumeMarker, start);
if (start < 0 || resume < 0) {
  throw new Error('Round 13 compatibility wrapper could not locate the portal regression block.');
}

const currentBlock = `/* 2026-09-30 current iPhone portal-button regression guards */
check('authoritative public landing tap router is present',html.includes('V46 AUTHORITATIVE PUBLIC LANDING TAP ROUTER 2026-09-29'));
check('current client portal button is present',html.includes('data-entry-login="client"'));
check('current contractor portal button is present',html.includes('data-entry-login="contractor"'));
check('current admin portal button is present',html.includes('data-entry-login="admin"'));
check('retired native public role links are absent',!html.includes('data-entry-native="client"')&&!html.includes('data-entry-native="contractor"')&&!html.includes('data-entry-native="admin"'));
`;

source = source.slice(0, start) + currentBlock + source.slice(resume);
const tempUrl = new URL(`./.v46-round13-current-${process.pid}.mjs`, import.meta.url);
fs.writeFileSync(tempUrl, source, 'utf8');
try {
  await import(tempUrl.href + `?run=${Date.now()}`);
} finally {
  try { fs.unlinkSync(tempUrl); } catch (_) {}
}
