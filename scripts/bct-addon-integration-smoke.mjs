import fs from 'node:fs';

const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const index=read('index.html');
const adminSections=read('bct-admin-sections.js');
const liveVerification=read('bct-live-project-verification.js');
const contractSigning=read('bct-contract-signing.js');
const contractorCloseout=read('bct-contractor-closeout.js');
const gallery=read('bct-home-gallery.js');
const photoAdmin=read('bct-photo-admin.js');
const estimatorPortal=read('bct-estimator-portal.js');
const adminBoard=read('bct-admin-control-board.js');
const adminMfa=read('bct-admin-mfa.js');
const serviceWorker=read('service-worker.js');

function assert(ok,message){if(!ok)throw new Error(message)}

assert(index.includes('window.supabaseClient=supabaseClient'),'Shared Supabase client must be exposed to isolated add-ons.');
assert(index.includes('window.SUPABASE_URL=SUPABASE_URL'),'Shared public Supabase URL must be exposed to isolated add-ons.');
assert(index.includes('window.BCT_V46_BRIDGE'),'Private V46 state/RPC bridge must exist.');
assert(index.includes('bct-contract-signing.js'),'Contract-signing add-on must be loaded.');

for(const file of ['bct-admin-sections.js','bct-admin-control-board.js','bct-admin-mobile-fix.js','bct-home-gallery.js','bct-contract-signing.js','bct-contractor-closeout.js']){
  assert(fs.existsSync(new URL('../'+file,import.meta.url)),`Missing index add-on: ${file}`);
}
for(const file of ['bct-live-project-verification.js','bct-admin-job-pages.js','bct-estimator-system.js','bct-estimator-portal.js','bct-estimator-admin.js','bct-photo-admin.js','bct-admin-mfa.js']){
  assert(fs.existsSync(new URL('../'+file,import.meta.url)),`Missing Admin-loaded add-on: ${file}`);
  assert(adminSections.includes('/'+file),`Admin loader must reference ${file}`);
}

assert(adminMfa.includes("auth.mfa.enroll"),'Admin MFA UI must support authenticator enrollment.');
assert(adminMfa.includes("auth.mfa.challenge"),'Admin MFA UI must challenge the authenticator.');
assert(adminMfa.includes("auth.mfa.verify"),'Admin MFA UI must verify the authenticator code.');
assert(adminMfa.includes('bct_admin_set_mfa_ui_ready'),'Admin MFA UI must mark readiness only through the canonical Admin RPC.');
assert(adminMfa.includes('bct_admin_enable_mfa_enforcement'),'Admin MFA enforcement must use the canonical AAL2-gated RPC.');
assert(adminMfa.includes('window.BCT_V46_BRIDGE'),'Admin MFA must use the shared V46 bridge for protected RPCs.');

assert(liveVerification.includes('window.BCT_V46_BRIDGE'),'Live verification must use the V46 bridge.');
assert(!liveVerification.includes("typeof rpc!=='function'"),'Live verification must not access the private rpc binding.');
assert(!liveVerification.includes("typeof activeManagedJob!=='undefined'"),'Live verification must not access the private active-job binding.');
assert(contractSigning.includes('bctContractSigningBridge'),'Contract signing must use the approved bridge alias.');
assert(contractorCloseout.includes('bct_completion_requests'),'Contractor closeout must reuse the existing completion-request table.');
assert(contractorCloseout.includes('bct_contractor_cancel_completion_request'),'Contractor closeout must use the canonical cancellation RPC.');
assert(contractorCloseout.includes('bct_submit_completion_rating'),'Contractor closeout must use the canonical rating RPC.');
assert(contractorCloseout.includes('window.BCT_V46_BRIDGE'),'Contractor closeout must use the shared V46 bridge.');
assert(index.includes('bct-contractor-closeout.js'),'V46 must load the contractor closeout add-on.');
assert(index.includes('bctRenderContractorCloseout'),'Contractor state load must render closeout controls.');
assert(!contractSigning.includes('await rpc('),'Contract signing must not access private rpc directly.');

for(const [name,source] of [
  ['gallery',gallery],['photo admin',photoAdmin],['estimator portal',estimatorPortal],['admin board',adminBoard]
]){
  if(source.includes('window.supabaseClient'))assert(index.includes('window.supabaseClient=supabaseClient'),`${name} requires the shared Supabase client exposure.`);
}

assert(gallery.includes('createSignedUrl'),'Gallery must preserve signed object delivery.');
assert(photoAdmin.includes("storage.from('bct-gallery')"),'Photo Admin must use the canonical BCT gallery bucket.');
assert(serviceWorker.includes("const STATIC_ASSETS=['/bct-logo-master.png','/bct-app-icon-v46.png']"),'Service worker must keep private/data-bearing app files out of its static cache list.');

console.log('BCT add-on integration smoke passed.');
