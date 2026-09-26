import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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
