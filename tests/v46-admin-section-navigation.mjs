import fs from 'node:fs';
import assert from 'node:assert/strict';

const js=fs.readFileSync('bct-admin-sections.js','utf8');

assert(js.includes("const ROOT_ID='view-admin'"),'Admin section navigation must stay scoped to the signed-in Admin view.');
assert(js.includes("const COLLAPSED='bct-admin-section-collapsed'"),'Admin section navigation must collapse inactive Admin sections.');
assert(js.includes('bctAdminSectionSwitcher'),'Admin section switcher must exist.');
assert(js.includes('[data-admin-page-tab]'),'Existing Admin page tabs must remain the top-level navigation source.');
assert(js.includes('[data-admin-page-panel]'),'Existing Admin page panels must remain the content source.');
assert(js.includes('bct-admin-back-btn'),'Admin panels must receive Back controls.');
assert(js.includes('bct-admin-dashboard-btn'),'Admin panels must receive Admin Dashboard controls.');
assert(js.includes("background:#2563a6!important;color:#fff!important"),'Admin Back/Dashboard controls must use the approved blue with white text.');
assert(js.includes('historyStack'),'Admin Back behavior must preserve an in-portal navigation history.');
assert(js.includes("selectedByPage.set('jobs','jobHealthDashboard')"),'Closing job management must return to Job Health rather than leaving a blank Jobs page.');
assert(!js.includes('supabaseClient'),'Admin organization layer must not alter Supabase data/auth behavior.');
assert(!js.includes('signOut('),'Admin organization layer must not sign the Admin out.');
assert(!js.includes('view-customer')&&!js.includes('view-status'),'Admin organization layer must not alter Client or Contractor portal views.');

console.log('V46 Admin section navigation regression: PASS');
