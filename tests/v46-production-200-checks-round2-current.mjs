// Run the established round-2 guard against the current public-entry implementation.
// This preserves all 200 historical assertions and changes only the retired
// data-entry-native expectation to the current data-entry-login controls that
// the iPhone/WebKit interaction suite exercises in production.
import fs from 'node:fs';

const sourceUrl = new URL('./v46-production-200-checks-round2.mjs', import.meta.url);
let source = fs.readFileSync(sourceUrl, 'utf8');

const stale = 'data-entry-native="';
const current = 'data-entry-login="';
if (!source.includes(stale)) {
  throw new Error('Round 2 compatibility wrapper could not find the retired native-entry expectation.');
}
source = source.replaceAll(stale, current)
  .replace('three native public role entries', 'three current public role entries');

const tempUrl = new URL(`./.v46-round2-current-${process.pid}.mjs`, import.meta.url);
fs.writeFileSync(tempUrl, source, 'utf8');
try {
  await import(tempUrl.href + `?run=${Date.now()}`);
} finally {
  try { fs.unlinkSync(tempUrl); } catch (_) {}
}
