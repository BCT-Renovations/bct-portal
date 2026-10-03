/* BCT V46 contract signing UI — reuses canonical contract/signature RPCs. */
(function(){
'use strict';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>Number.isFinite(Number(v))?new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(v)):'—';
const sigFor=(sigs,id,role)=>(sigs||[]).find(s=>s.contract_id===id&&s.signature_role===role);
function contractRows(state){return {contracts:Array.isArray(state?.contracts)?state.contracts:[],signatures:Array.isArray(state?.contract_signatures)?state.contract_signatures:[]};}
function contractsFromState(state){const rows=contractRows(state);return rows.contracts.length?rows.contracts:[];}
function card(c,sigs,role,rpcName){
 const signed=sigFor(sigs,c.id,role);const eligible=['sent','partially_signed'].includes(c.status)&&!signed;
 return `<article class="stage bct-contract-sign-card" data-contract-id="${esc(c.id)}"><div class="toolbar"><div><b>${esc(c.contract_number||'BCT Contract')}</b><div class="muted">${esc(c.status||'')}</div></div><b>${money(c.contract_amount)}</b></div><small>Terms version: ${esc(c.terms_version||'Not listed')}</small>${signed?`<div class="notice"><b>Signed / acknowledged</b><br>${esc(signed.typed_name||'')} • ${esc(signed.signed_at||'')}</div>`:eligible?`<form class="bct-contract-sign-form" data-rpc="${rpcName}" data-id="${esc(c.id)}"><label>Type your full legal name</label><input name="typedName" required minlength="2" autocomplete="name"><label><input name="consent" type="checkbox" required style="width:auto"> I consent to use this typed name as my electronic signature/acknowledgment for this contract.</label><button type="submit">Sign / Acknowledge Contract</button><div class="muted" data-status></div></form>`:`<div class="muted">No signature action is currently available for this contract.</div>`}</article>`;
}
function ensureHost(selector,id,title,copy){
 const parent=document.querySelector(selector);if(!parent)return null;
 let host=document.getElementById(id);if(!host){host=document.createElement('div');host.id=id;host.className='section';host.innerHTML=`<h3>${title}</h3><p class="muted">${copy}</p><div data-list></div>`;parent.appendChild(host)}return host;
}
function bind(host,reload){
 host?.querySelectorAll('.bct-contract-sign-form').forEach(f=>f.onsubmit=async e=>{e.preventDefault();const status=f.querySelector('[data-status]');const btn=f.querySelector('button');try{btn.disabled=true;status.textContent='Saving signature...';const typedName=f.typedName.value.trim();if(!typedName)throw new Error('Type your full legal name.');if(!f.consent.checked)throw new Error('Electronic signature consent is required.');const callRpc=window.bctContractSigningRpc;if(typeof callRpc!=='function')throw new Error('BCT contract signing connection is not ready.');await callRpc(f.dataset.rpc,{p_contract_id:f.dataset.id,p_typed_name:typedName,p_consent:true});status.textContent='Signature recorded.';await reload()}catch(err){status.textContent=err?.message||'Signature could not be recorded.'}finally{btn.disabled=false}});
}
window.bctRenderHomeownerContracts=function(state){
 if(state?.feature_flags?.electronic_signatures_enabled===false)return;
 const host=ensureHost('[data-customer-page-panel="estimate"]','bctHomeownerContractSigning','Contract Signatures','Only contracts BCT has released to your account appear here. Required BCT policies must be accepted before signing.');
 if(!host)return;const {contracts,sigs}=(()=>{const r=contractRows(state);return {contracts:r.contracts,sigs:r.signatures}})();host.querySelector('[data-list]').innerHTML=contracts.length?contracts.map(c=>card(c,sigs,'homeowner','bct_homeowner_esign_contract')).join(''):'<div class="notice">No released contracts are available yet.</div>';bind(host,async()=>{await window.bctContractSigningReload?.('homeowner')});
};
window.bctRenderContractorContracts=function(state){
 if(state?.feature_flags?.electronic_signatures_enabled===false)return;
 const host=ensureHost('#view-jobs','bctContractorContractSigning','Contract Acknowledgments','Only contracts tied to your authorized BCT assignments appear here. Current contractor policies must be accepted before acknowledgment.');
 if(!host)return;const {contracts,sigs}=(()=>{const r=contractRows(state);return {contracts:r.contracts,sigs:r.signatures}})();host.querySelector('[data-list]').innerHTML=contracts.length?contracts.map(c=>card(c,sigs,'contractor','bct_contractor_esign_contract')).join(''):'<div class="notice">No assigned contracts are available yet.</div>';bind(host,async()=>{await window.bctContractSigningReload?.('contractor')});
};
window.bctRenderAdminContracts=function(state){
 if(state?.feature_flags?.electronic_signatures_enabled===false)return;
 const host=ensureHost('#view-admin','bctAdminContractSigning','BCT Contract Signatures','BCT Admin may sign only eligible contracts. Homeowner and contractor signatures remain separate, immutable evidence.');
 if(!host)return;host.dataset.adminPagePanel='contracts';host.dataset.bctBoardInclude='1';const {contracts,sigs}=(()=>{const r=contractRows(state);return {contracts:r.contracts,sigs:r.signatures}})();host.querySelector('[data-list]').innerHTML=contracts.length?contracts.map(c=>card(c,sigs,'bct','bct_admin_esign_contract')).join(''):'<div class="notice">No contracts are available.</div>';bind(host,async()=>{await window.bctContractSigningReload?.('admin')});
};
})();