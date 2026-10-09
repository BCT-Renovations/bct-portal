import fs from 'node:fs';
import assert from 'node:assert/strict';

const gallery=fs.readFileSync('bct-home-gallery.js','utf8');
const index=fs.readFileSync('index.html','utf8');

assert.ok(gallery.includes("const VERSION='BCT-PHOTO-BUILD-2026.10.09-translation-shell-1'"),'gallery version missing');
assert.ok(gallery.includes("let PROJECTS=[]"),'secure project list state missing');
assert.ok(gallery.includes("index>=4"),'first-four visibility rule missing');
assert.ok(gallery.includes("View More Projects"),'View More Projects copy missing');
assert.ok(gallery.includes("Show Fewer Projects"),'collapse copy missing');
assert.ok(gallery.includes("license.insertAdjacentElement('beforebegin',section)"),'gallery is not isolated below current home content');
assert.ok(gallery.includes("body:not(.bct-authenticated):not(.bct-portal-entered) #bctHomeGallery"),'public-home visibility lock missing');
assert.ok(gallery.includes("grid-template-columns:repeat(2"),'mobile two-column gallery missing');
assert.ok(gallery.includes("grid-template-columns:repeat(4"),'wide four-column gallery missing');
assert.ok(index.includes('/bct-home-gallery.js?v=20261009-1'),'gallery loader is not wired into branch index');
assert.ok(index.includes('data-i18n="gallery.title"'),'static gallery title translation key missing');
assert.ok(index.includes('data-i18n="entry.estimator"'),'BCT Estimator entry translation key missing');

for (const protectedId of ['bctSignedOutEntry','bctEntryActions','bctShareAppBtn','bctPublicLicenseBar']) {
  assert.ok(index.includes(`id=\"${protectedId}\"`),`protected landing element missing: ${protectedId}`);
}

console.log('V46 isolated home gallery smoke checks passed.');
// Re-run marker after duplicate-loader cleanup.
