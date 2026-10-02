import fs from 'node:fs';import assert from 'node:assert/strict';
const admin=fs.readFileSync('bct-photo-admin.js','utf8');
const pub=fs.readFileSync('bct-home-gallery.js','utf8');
const loader=fs.readFileSync('bct-admin-sections.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261001220000_bct_photo_build_gallery.sql','utf8');
assert.match(loader,/bct-photo-admin\.js/);
assert.match(admin,/BCT PHOTO BUILD/);assert.match(admin,/Photo Control/);assert.match(admin,/1,000 photos/);assert.match(admin,/🟢/);assert.match(admin,/🔴/);
assert.match(admin,/project_work_date/);assert.match(admin,/1,000 photos/);assert.match(admin,/count:'exact'/);assert.match(admin,/home_order/);assert.match(admin,/max="30"/);assert.match(admin,/storage\.from\('bct-gallery'\)/);
assert.doesNotMatch(pub,/Project 1/);assert.match(pub,/PROJECTS=\[\]/);assert.match(pub,/bct_gallery_photos/);assert.match(pub,/eq\('show_on_home',true\)/);assert.match(pub,/limit\(30\)/);assert.match(pub,/project_work_date/);assert.match(pub,/Open Full Gallery/);assert.match(pub,/touchstart/);assert.match(pub,/bctGalleryCategory/);assert.match(pub,/FULL_PAGE=24/);assert.match(pub,/Load More Photos/);assert.match(pub,/range\(from,to\)/);
assert.match(migration,/bct_gallery_photos/);assert.match(migration,/between 1 and 30/);assert.match(migration,/is_bct_admin/);assert.match(migration,/bct-gallery/);
assert.match(migration,/show_on_home and is_published/);assert.match(migration,/limited to 30/);assert.match(migration,/limited to 1,000 photos/);
// Privacy gate: gallery storage is private and object reads require published metadata.
assert.match(migration,/bct-gallery/);assert.match(migration,/p\.is_published/);assert.doesNotMatch(pub,/object\/public\/bct-gallery/);assert.doesNotMatch(admin,/object\/public\/bct-gallery/);

assert.match(admin,/createSignedUrl\(path,900\)/);assert.match(migration,/public=excluded\.public/);assert.match(migration,/p\.thumbnail_path=storage\.objects\.name/);

assert.match(pub,/Intl\.DateTimeFormat/);assert.match(pub,/figure\.tabIndex=0/);assert.match(pub,/FULL\.findIndex/);

assert.match(pub,/createSignedUrl\(path,3600\)/);assert.match(pub,/createSignedUrl\(x\.storage_path,3600\)/);assert.doesNotMatch(pub,/\/storage\/v1\/object\/bct-gallery\//);assert.match(migration,/pg_advisory_xact_lock/);assert.match(pub,/priorCategory=fullCategory,priorIndex=fullIndex/);

// Production hardening gates: slow rotation, accessibility preference, exact-photo fallback, and localized modal controls.
assert.match(pub,/ROTATION_MS=9000/);
assert.match(pub,/prefers-reduced-motion: reduce/);
assert.match(pub,/visibilitychange/);
assert.match(pub,/mouseenter/);assert.match(pub,/focusin/);
assert.match(pub,/async function openProject\(id\)/);
assert.match(pub,/\.eq\('id',id\)\.eq\('is_published',true\)\.maybeSingle\(\)/);
assert.match(pub,/loadFull\(true,false\)/);
for(const lang of ['es','fr','ht','pt','vi','zh','ar','ru']){
  const start=pub.indexOf(lang+':{');
  const end=start<0?-1:pub.indexOf('},',start);
  const block=start<0?'':pub.slice(start,end<0?pub.length:end+1);
  assert.ok(block.includes("full:")&&block.includes("close:")&&block.includes("category:")&&block.includes("prev:")&&block.includes("next:")&&block.includes("load:"),lang+' gallery controls must be localized');
}
console.log('BCT PHOTO BUILD static deployment gate passed');
