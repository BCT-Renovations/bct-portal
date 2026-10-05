import fs from 'node:fs';
const gallery=fs.readFileSync('bct-home-gallery.js','utf8');
const admin=fs.readFileSync('bct-photo-admin.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const migration=fs.readFileSync('supabase/migrations/20261005180000_bct_gallery_image_text_translation.sql','utf8');
const checks=[
  ['gallery selects image text fields', gallery.includes('image_text,image_text_translations')],
  ['gallery renders translated image text', gallery.includes('bct-gallery-image-text')],
  ['admin edits image text', admin.includes('data-f="image_text"')],
  ['admin edits Spanish image text', admin.includes('data-f="image_text_es"')],
  ['migration adds image text columns', migration.includes('image_text_translations')],
  ['gallery cache is busted', index.includes('bct-home-gallery.js?v=20261005-2')]
];
for(const [name,ok] of checks) if(!ok) throw new Error('FAIL: '+name);
console.log('PASS',checks.map(([n])=>n).join(' | '));
