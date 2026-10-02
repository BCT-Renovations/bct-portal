/* BCT V46 Admin Authenticator / MFA control. Source-only UI; enforcement changes occur only by explicit Admin action. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let pendingFactorId='';
function bridge(){return window.BCT_V46_BRIDGE}
async function rpc(name,args={}){const b=bridge();if(!b?.callRpc)throw new Error('BCT security connection is not ready.');return b.callRpc(name,args)}
function client(){if(!window.supabaseClient)throw new Error('BCT authentication client is not ready.');return window.supabaseClient}
function host(){
 const root=$('view-admin');if(!root)return null;
 let el=$('bctAdminMfaPanel');
 if(!el){el=document.createElement('section');el.id='bctAdminMfaPanel';el.className='card section';el.dataset.adminPagePanel='security';el.dataset.bctBoardInclude='1';root.appendChild(el)}
 return el;
}
function notice(msg){const n=$('bctAdminMfaStatus');if(n)n.textContent=msg}
async function factorState(){
 const {data,error}=await client().auth.mfa.listFactors();if(error)throw error;
 const verified=[...(data?.totp||[])].filter(f=>f.status==='verified');
 return {verified,all:data?.all||[]};
}
async function refresh(){
 const el=host();if(!el)return;
 try{
  const [status,factors]=await Promise.all([rpc('bct_admin_mfa_status'),factorState()]);
  const verified=factors.verified;
  el.innerHTML=`<h2>Admin Authenticator Security</h2>
  <p class="muted">Use an authenticator app to protect BCT Admin. Enrollment and verification happen through Supabase MFA. BCT enforcement is not enabled automatically.</p>
  <div class="grid grid-2">
   <div class="stage"><b>Current assurance</b><br><span class="badge ${status?.aal2?'good':'warn'}">${esc(status?.current_aal||'aal1')}</span></div>
   <div class="stage"><b>MFA enforcement</b><br><span class="badge ${status?.mfa_enforced?'good':'warn'}">${status?.mfa_enforced?'ENABLED':'NOT ENABLED'}</span></div>
   <div class="stage"><b>Verified authenticator factors</b><br>${verified.length}</div>
   <div class="stage"><b>MFA UI readiness</b><br><span class="badge ${status?.mfa_ui_ready?'good':'warn'}">${status?.mfa_ui_ready?'READY':'NOT VERIFIED'}</span></div>
  </div>
  <div id="bctAdminMfaStatus" class="notice section" aria-live="polite"></div>
  <div class="toolbar">
   <button type="button" id="bctMfaEnrollBtn">Add Authenticator</button>
   ${verified.length?`<button type="button" class="secondary" id="bctMfaVerifyExistingBtn">Verify Existing Authenticator</button>`:''}
   ${status?.aal2&&status?.mfa_ui_ready&&!status?.mfa_enforced?`<button type="button" class="success" id="bctMfaEnforceBtn">Enable Admin MFA Enforcement</button>`:''}
  </div>
  <div id="bctMfaEnrollBox" class="section"></div>`;
  $('bctMfaEnrollBtn')?.addEventListener('click',enroll);
  $('bctMfaVerifyExistingBtn')?.addEventListener('click',()=>showVerify(verified[0]?.id||''));
  $('bctMfaEnforceBtn')?.addEventListener('click',enableEnforcement);
 }catch(e){el.innerHTML=`<h2>Admin Authenticator Security</h2><div class="notice">MFA status unavailable: ${esc(e?.message||e)}</div>`}
}
async function enroll(){
 try{
  notice('Creating authenticator enrollment…');
  const {data,error}=await client().auth.mfa.enroll({factorType:'totp',friendlyName:'BCT Admin Authenticator'});
  if(error)throw error;
  pendingFactorId=data?.id||'';
  const box=$('bctMfaEnrollBox');if(!box||!pendingFactorId)throw new Error('Authenticator enrollment did not return a factor ID.');
  const qr=data?.totp?.qr_code||'',secret=data?.totp?.secret||'';
  box.innerHTML=`<div class="stage"><h3>Scan with your authenticator app</h3>${qr?`<img src="${esc(qr)}" alt="BCT Admin authenticator QR code" style="max-width:220px;width:100%;height:auto;background:#fff;padding:8px;border-radius:10px">`:''}<p class="muted">If scanning is unavailable, enter this setup key manually:</p><code style="overflow-wrap:anywhere">${esc(secret)}</code><form id="bctMfaVerifyForm" class="section"><label>6-digit authenticator code</label><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required><button type="submit">Verify Authenticator</button></form></div>`;
  $('bctMfaVerifyForm').addEventListener('submit',e=>{e.preventDefault();verifyFactor(pendingFactorId,e.currentTarget.code.value)});
  notice('Scan the code, then enter the 6-digit authenticator code.');
 }catch(e){notice(e?.message||'Authenticator enrollment failed.')}
}
function showVerify(id){
 pendingFactorId=id;const box=$('bctMfaEnrollBox');if(!box||!id)return;
 box.innerHTML=`<form id="bctMfaVerifyForm" class="stage"><h3>Verify Authenticator</h3><label>6-digit authenticator code</label><input name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" minlength="6" maxlength="6" required><button type="submit">Verify</button></form>`;
 $('bctMfaVerifyForm').addEventListener('submit',e=>{e.preventDefault();verifyFactor(id,e.currentTarget.code.value)});
}
async function verifyFactor(factorId,code){
 try{
  notice('Verifying authenticator…');
  const {data:challenge,error:challengeError}=await client().auth.mfa.challenge({factorId});if(challengeError)throw challengeError;
  const challengeId=challenge?.id;if(!challengeId)throw new Error('MFA challenge could not be created.');
  const {error}=await client().auth.mfa.verify({factorId,challengeId,code:String(code||'').trim()});if(error)throw error;
  await rpc('bct_admin_set_mfa_ui_ready',{p_ready:true});
  notice('Authenticator verified. This Admin session is now MFA-verified.');
  await refresh();
 }catch(e){notice(e?.message||'Authenticator verification failed.')}
}
async function enableEnforcement(){
 if(!confirm('Enable MFA enforcement for BCT Admin? Future Admin access will require an MFA-verified (AAL2) session.'))return;
 try{notice('Enabling Admin MFA enforcement…');await rpc('bct_admin_enable_mfa_enforcement');notice('Admin MFA enforcement enabled.');await refresh()}catch(e){notice(e?.message||'MFA enforcement could not be enabled.')}
}
function init(){host();refresh()}
window.bctRefreshAdminMfa=refresh;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
window.addEventListener('pageshow',()=>{if(document.body.classList.contains('bct-authenticated'))refresh()});
})();