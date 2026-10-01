import fs from 'node:fs';
import assert from 'node:assert/strict';

const loader=fs.readFileSync('bct-admin-sections.js','utf8');
const js=fs.readFileSync('bct-admin-control-board.js','utf8');

assert(loader.includes('/bct-admin-control-board.js?v=20260930-2'),'Admin navigation loader must load the new control board.');
assert(js.includes("const ROOT_ID='view-admin'"),'Admin control board must stay scoped to the signed-in Admin view.');
assert(js.includes("const BOARD_ID='bctAdminControlBoard'"),'Admin control board landing must exist.');
assert(js.includes("const URGENT_ID='bctAdminUrgentView'"),'Urgent detail view must exist.');
assert(js.includes("['jobs',t.jobs,t.noJobs]"),'Jobs urgent attention must remain separate.');
assert(js.includes("['contractors',t.contractors,t.noContractors]"),'Contractor urgent attention must remain separate.');
assert(js.includes("['clients',t.clients,t.noClients]"),'Client/Homeowner urgent attention must remain separate.');
assert(js.includes('bct-admin-alert-count'),'Each urgent category must show its own alert count.');
assert(js.includes('data-level="critical"'),'Critical-only alert styling must exist.');
assert(js.includes('@media(prefers-reduced-motion:reduce)'),'Critical pulse must respect reduced-motion accessibility.');
assert(js.includes('bct-admin-portal-grid'),'Normal Admin areas must render as portal cards instead of a long expanded page.');
assert(js.includes('setPanelVisibility(null)'),'Control Board mode must collapse Admin content panels.');
assert(js.includes("mode='panel'"),'Selecting a portal must switch to one Admin section.');
assert(js.includes('bct-admin-board-back'),'Opened sections must provide Back navigation.');
assert(js.includes('data-bct-board-homeboard'),'Opened sections must provide Admin Control Board navigation.');
assert(js.includes('data-bct-board-publichome'),'Opened sections must provide Back to Home navigation.');
assert(js.includes("background:#0f5f63!important"),'Admin navigation and portal controls must use BCT teal.');
assert(js.includes("border:1px solid #0a4549!important"),'Admin navigation controls must use the approved dark-teal border.');
assert(js.includes("touch-action:pan-y!important"),'Admin root must allow normal vertical iPhone touch scrolling.');
assert(!js.includes('scrollIntoView('),'Admin control board must not use scrollIntoView auto-navigation.');
assert(!js.includes('window.scrollTo('),'Admin control board must not force page scrolling.');
assert(!js.includes("behavior:'smooth'"),'Admin control board must not introduce smooth-scroll loops.');
assert(js.includes('observer.observe(r,'),'Admin mutation observer must be scoped to the Admin root.');
assert(!js.includes('observe(document.documentElement'),'Admin control board must not watch the full document for mutations.');
assert(js.includes("typeof window.bctReturnToPublicLanding==='function'"),'Back to Home must prefer the proven public-landing routine.');
assert(js.includes('window.bctReturnToPublicLanding();'),'Back to Home must return to public Home without clearing the Supabase session.');
assert(js.includes("if(!category)return;"),'Unrelated system/launch alerts must not be silently mixed into Jobs urgency.');
assert(js.includes("return '';"),'Unmatched Admin panels must remain outside Jobs/Contractors/Clients urgent counts.');
assert(!js.includes('supabaseClient'),'Admin organization layer must not alter Supabase data/auth behavior.');
assert(!js.includes('signOut('),'Admin organization layer must not sign the Admin out.');
assert(!js.includes('view-customer')&&!js.includes('view-status'),'Admin organization layer must not alter Client or Contractor portal views.');

console.log('V46 Admin Control Board + urgent categories + iPhone scroll regression: PASS');