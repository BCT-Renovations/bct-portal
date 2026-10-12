// Run the established round-2 guard against the current public-entry implementation.
// The base round-2 guard keeps older source needles; this wrapper maps the
// official logo marker to the current approved comma-logo asset.
import fs from 'node:fs';

const sourceUrl = new URL('./v46-production-200-checks-round2.mjs', import.meta.url);
let source = fs.readFileSync(sourceUrl, 'utf8');
source = source.replace('official-bct-logo-v46-green-band', 'official-bct-logo-v46-comma-20261008');

const tempUrl = new URL(`./.v46-round2-current-${process.pid}.mjs`, import.meta.url);
fs.writeFileSync(tempUrl, source, 'utf8');
try {
  await import(tempUrl.href + `?run=${Date.now()}`);
} finally {
  try { fs.unlinkSync(tempUrl); } catch (_) {}
}
