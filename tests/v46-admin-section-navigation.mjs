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
assert(js.includes('bct-admin-home-btn'),'Admin panels must receive Back to Home controls.');
assert(js.includes("background:#0f5f63!important;color:#fff!important"),'Admin navigation controls must use BCT teal with white text.');
assert(js.includes("border:1px solid #0a4549!important"),'Admin navigation controls must use the approved dark-teal border.');
assert(js.includes("touch-action:pan-y!important"),'Admin root must allow normal vertical iPhone touch scrolling.');
assert(js.includes('bctRenderKey'),'Admin section switcher must avoid repeated self-rebuilds.');
assert(!js.includes("(tabs||r).scrollIntoView({behavior:'smooth'"),'Admin refresh must not auto-scroll the page.');
assert(js.includes("observer.observe(r,"),'Admin mutation observer must be scoped to the Admin root.');
assert(!js.includes("observe(document.documentElement"),'Admin section observer must not watch the full document.');
assert(js.includes("window.showView?.('home')"),'Back to Home must use the existing Home route so the Admin session is not intentionally signed out.');
assert(js.includes('historyStack'),'Admin Back behavior must preserve an in-portal navigation history.');
assert(js.includes("selectedByPage.set('jobs','jobHealthDashboard')"),'Closing job management must return to Job Health rather than leaving a blank Jobs page.');
assert(!js.includes('supabaseClient'),'Admin organization layer must not alter Supabase data/auth behavior.');
assert(!js.includes('signOut('),'Admin organization layer must not sign the Admin out.');
assert(!js.includes('view-customer')&&!js.includes('view-status'),'Admin organization layer must not alter Client or Contractor portal views.');

console.log('V46 Admin section navigation + scroll stability regression: PASS');
