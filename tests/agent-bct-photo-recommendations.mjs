import fs from 'node:fs';import assert from 'node:assert/strict';
const admin=fs.readFileSync('bct-photo-admin.js','utf8');
const rec=fs.readFileSync('agent-bct-photo-recommendation.js','utf8');
const api=fs.readFileSync('api/agent-bct-photo-recommendation.js','utf8');
const migration=fs.readFileSync('supabase/migrations/20261003170000_agent_bct_photo_recommendations.sql','utf8');
const loader=fs.readFileSync('bct-admin-sections.js','utf8');
assert.match(loader,/agent-bct-photo-recommendation\.js/);
assert.match(admin,/bct_gallery_photos/);assert.match(admin,/Agent BCT/);assert.match(admin,/data-a=\\"agent\\"/);
assert.match(rec,/bct_gallery_photos/);assert.match(rec,/bct_photo_recommendations/);assert.match(rec,/Use/);assert.match(rec,/Reject/);assert.match(rec,/Later/);assert.match(rec,/Marketing permission is separate/);assert.match(rec,/is_published/);
assert.match(api,/OPENAI_API_KEY/);assert.match(api,/input_image/);assert.match(api,/marketing_recommendation/);assert.doesNotMatch(api,/is_published/);assert.doesNotMatch(api,/show_on_home/);
assert.match(migration,/references public\.bct_gallery_photos/);assert.match(migration,/is_bct_admin/);assert.match(migration,/admin_decision/);assert.match(migration,/corrected_category/);assert.match(migration,/does not change the existing/);
console.log('Agent BCT Photo Recommendation static safety gate passed');

// Homepage gallery regression guards
const home = read('bct-home-gallery.js');
assert(home.includes("window.addEventListener('bct-gallery-changed'"), 'Homepage refreshes after Admin gallery changes');
assert(home.includes("FULL=PROJECTS.slice()"), 'Homepage photo cards open the existing gallery modal');
assert(home.includes(".eq('show_on_home',true)"), 'Homepage only loads first-page selected photos');
assert(!home.includes('is_published',false), 'No homepage publication mutation');
console.log('Homepage gallery regression gate passed');
