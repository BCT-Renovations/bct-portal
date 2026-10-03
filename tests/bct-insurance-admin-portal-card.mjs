import fs from'node:fs';import assert from'node:assert/strict';const a=fs.readFileSync('bct-insurance-admin.js','utf8'),b=fs.readFileSync('bct-admin-control-board.js','utf8');
assert.ok(a.includes("p.dataset.bctBoardInclude='1'"));assert.ok(a.includes("p.className='card section hidden'"));
assert.ok(b.includes("panel.classList.contains('hidden')&&!panel.dataset.bctBoardInclude"));
assert.ok(!a.includes('bctUrgentCategory'),'Insurance must be an Admin portal card, not an urgent category');
console.log('Insurance Admin portal-card visibility checks passed');