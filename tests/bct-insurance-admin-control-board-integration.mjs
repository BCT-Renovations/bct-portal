import fs from'node:fs';import assert from'node:assert/strict';const s=fs.readFileSync('bct-admin-sections.js','utf8'),a=fs.readFileSync('bct-insurance-admin.js','utf8'),b=fs.readFileSync('bct-admin-control-board.js','utf8');
assert.ok(s.includes("/bct-insurance-admin.js?v=20261002-1"));assert.ok(s.includes("data-bct-insurance-admin"));
assert.ok(a.includes("data.adminPagePanel='insurance'"));assert.ok(a.includes("BCT Insurance Portal"));
assert.ok(b.includes("renderPortalCards"));assert.ok(!b.includes("['jobs','contractors','clients','insurance']"),'must not create fourth urgent category');
console.log('Insurance Admin Control Board integration checks passed');