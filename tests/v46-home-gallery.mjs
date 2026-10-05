import fs from 'node:fs';
import assert from 'node:assert/strict';

const gallery=fs.readFileSync('bct-home-gallery.js','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.ok(gallery.includes("const VERSION='BCT-PHOTO-BUILD-2026.10.05-gallery-i18n-1'"),'gallery version missing');
assert.ok(gallery.includes("let PROJECTS=[]"),'project collection missing');
assert.ok(gallery.includes("index>=4"),'first-four visibility rule missing');
assert.ok(gallery.includes("View More Projects"),'View More Projects copy missing');
assert.ok(gallery.includes("¡Más de nuestro trabajo!"),'Spanish photo caption translation missing');
assert.ok(gallery.includes("Sucio"),'Spanish photo/category translation missing');
assert.equal((gallery.match(/function ensureGalleryModal\(/g)||[]).length,1,'duplicate gallery modal wiring remains');
assert.equal((gallery.match(/function wireGalleryControls\(/g)||[]).length,1,'duplicate gallery control wiring remains');
assert.ok(gallery.includes("c.category"),'translated category label missing');
assert.ok(gallery.includes("Show Fewer Projects"),'collapse copy missing');
assert.ok(gallery.includes("license.insertAdjacentElement('beforebegin',section)"),'gallery is not isolated below current home content');
assert.ok(gallery.includes("body:not(.bct-authenticated):not(.bct-portal-entered) #bctHomeGallery"),'public-home visibility lock missing');
assert.ok(gallery.includes("grid-template-columns:repeat(2"),'mobile two-column gallery missing');
assert.ok(gallery.includes("grid-template-columns:repeat(4"),'wide four-column gallery missing');
assert.ok(index.includes('/bct-home-gallery.js?v=20261005-2'),'gallery loader cache-bust is not wired to translated build');

for (const protectedId of ['bctSignedOutEntry','bctEntryActions','bctShareAppBtn','bctPublicLicenseBar']) {
  assert.ok(index.includes(`id=\"${protectedId}\"`),`protected landing element missing: ${protectedId}`);
}

console.log('V46 isolated home gallery smoke checks passed.');
// Re-run marker after duplicate-loader cleanup.
