import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const forbiddenSourceMarkers = [
  'Warning: truncated output',
  'Total output lines:',
  'tokens truncated',
  'connector truncation',
  'Script error:',
  'TypeError: Cannot read properties of undefined'
];

assert(html.startsWith('<!DOCTYPE html>'), 'index.html must start directly with <!DOCTYPE html>; no tool/header text may appear before the document.');

for (const marker of forbiddenSourceMarkers) {
  assert(!html.includes(marker), `index.html contains accidental tool/output marker: ${marker}`);
}

assert(/<html\s+lang="en"/i.test(html), 'index.html must keep the primary HTML shell.');
assert(/<title>[^<]*BCT Renovations/i.test(html), 'index.html must keep the BCT Renovations title.');
assert(html.trim().endsWith('</html>'), 'index.html must end with a closing </html> tag.');

const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
assert(scripts.length >= 1, 'index.html must include executable inline scripts for the current single-file V46 build.');

scripts.forEach((script, index) => {
  try {
    new Function(script);
  } catch (error) {
    throw new Error(`Inline script ${index + 1} failed to parse after source-integrity check: ${error.message}`);
  }
});

console.log('BCT source integrity smoke passed.');
