(function(){
"use strict";
const KEY="bct_v46_insurance_verification_preview_v1";
const CARRIER_SUGGESTIONS=["The Hartford","Travelers","Nationwide","State Farm","Progressive","Liberty Mutual","CNA","Chubb","Zurich","Erie","Other / Regional Carrier"];
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function supa(){return typeof supabaseClient!=="undefined"&&supabaseClient?supabaseClient:null}
function getPreview(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch(_){return {}}}
function setPreview(v){localStorage.setItem(KEY,JSON.stringify(v))}
function carrierOptions(selected){return CARRIER_SUGGESTIONS.map(x=>'<option value="'+esc(x)+'"'+(x===selected?' selected':'')+'>'+esc(x)+'</option>').join("")}
function daysLeft(d){if(!d)return null;const a=new Date();a.setHours(0,0,0,0);const b=new Date(d+"T00:00:00");return Math.ceil((b-a)/86400000)}
function health(policy){
 const d=daysLeft(policy.expires_on); if(policy.status==="rejected"||policy.status==="expired")return "bad";
 if(policy.status==="active"&&d!==null&&d>=0)return d<=30?"warn":"good";
 return "warn";
}
function badge(h){return h==="good"?'🟢 VERIFIED':h==="warn"?'🟡 REVIEW / EXPIRING':'🔴 ACTION REQUIRED'}
async function myPolicies(){
 const s=supa(); if(!s)return [];
 const r=await s.rpc("bct_my_insurance_policies");
 if(r.error)throw r.error; return Array.isArray(r.data)?r.data:[];
}
async function renderContractor(){
 const host=document.getElementById("bctInsuranceVerificationPanel"); if(!host)return;
 const p=getPreview(); let policies=[];
 try{policies=await myPolicies()}catch(_){}
 const rows=policies.map(x=>'<div class="stage"><div class="toolbar"><div><b>'+esc(x.policy_type.replaceAll("_"," "))+'</b><div class="muted">'+esc(x.carrier)+(x.policy_number?' • Policy ending '+esc(String(x.policy_number).slice(-4)):"")+'</div></div><span class="badge '+(health(x)==="good"?"good":health(x)==="warn"?"warn":"bad")+'">'+badge(health(x))+'</span></div><small>Effective '+esc(x.effective_on)+' • Expires '+esc(x.expires_on)+' • BCT status: '+esc(x.status)+'</small></div>').join("");
 host.innerHTML='<div class="toolbar"><div><h3>Insurance Verification & Authorization</h3><p class="muted">BCT verifies insurance coverage independently of the carrier. Your carrier, broker, or an authorized insurance-data provider may be contacted to confirm current policy status.</p></div><span class="badge info">V46 Isolated Preview</span></div>'+
 (p.signedAt?'<div class="notice"><b>Authorization captured for this isolated preview.</b><br>Signed '+esc(p.signedAt)+' by '+esc(p.signature||"contractor")+'. This preview does not create a production legal record.</div>':"")+
 '<div class="grid grid-2 section"><div><label>Policy Type</label><select id="bctInsType"><option value="general_liability">General Liability</option><option value="workers_comp">Workers’ Compensation</option><option value="commercial_auto">Commercial Auto</option><option value="other">Other Required Coverage</option></select></div><div><label>Insurance Carrier</label><input id="bctInsCarrier" list="bctCarrierList" placeholder="Insurance company name"><datalist id="bctCarrierList">'+CARRIER_SUGGESTIONS.map(x=>'<option value="'+esc(x)+'"></option>').join("")+'</datalist></div><div><label>Policy Number</label><input id="bctInsPolicy"></div><div><label>Coverage Amount</label><input id="bctInsAmount" type="number" min="0" step="1" placeholder="e.g. 1000000"></div><div><label>Effective Date</label><input id="bctInsEffective" type="date"></div><div><label>Expiration Date</label><input id="bctInsExpires" type="date"></div></div>'+
 '<div class="stage section"><b>Contractor Authorization</b><p class="muted">I authorize BCT Renovations, LLC and its authorized verification providers to verify my insurance coverage, including policy status, coverage type, limits, effective date, expiration date, and cancellation or non-renewal status, with my insurer, broker, agent, or authorized insurance-data source. This authorization is for contractor qualification and ongoing compliance.</p>'+
 '<label><input id="bctInsAuth" type="checkbox" style="width:auto"> I authorize BCT to perform this insurance verification.</label><label>Electronic Signature (type your full legal/business name)<input id="bctInsSignature" autocomplete="name" placeholder="Full name"></label></div>'+
 '<div class="admin-project-actions"><button type="button" id="bctInsSave">Save Insurance + Authorization</button><button type="button" class="secondary" id="bctInsRefresh">Refresh</button></div><div id="bctInsStatus" class="section"></div>'+
 '<div class="section"><h4>Current BCT Insurance Records</h4>'+(rows||'<div class="muted">No submitted policies yet.</div>')+'</div>'+
 '<div class="privacy-note"><b>Carrier independent:</b> BCT does not require a specific insurance company. Verification can use an available direct carrier/agent check, industry verification provider, ACORD/COI review, or documented manual verification.</div>';
 document.getElementById("bctInsSave")?.addEventListener("click",saveContractor);
 document.getElementById("bctInsRefresh")?.addEventListener("click",renderContractor);
}
async function saveContractor(){
 const status=document.getElementById("bctInsStatus"),s=supa(); const auth=document.getElementById("bctInsAuth")?.checked, sig=document.getElementById("bctInsSignature")?.value.trim();
 const payload={policy_type:document.getElementById("bctInsType")?.value,carrier:document.getElementById("bctInsCarrier")?.value.trim(),policy_number:document.getElementById("bctInsPolicy")?.value.trim(),coverage_amount:Number(document.getElementById("bctInsAmount")?.value||0)||null,effective_on:document.getElementById("bctInsEffective")?.value,expires_on:document.getElementById("bctInsExpires")?.value};
 if(!auth||!sig){status.textContent="Authorization checkbox and electronic signature are required.";return}
 if(!payload.carrier||!payload.effective_on||!payload.expires_on){status.textContent="Carrier and valid policy dates are required.";return}
 try{
   if(!s)throw new Error("BCT authentication is unavailable.");
   const r=await s.rpc("bct_submit_insurance_policy",{p_policy_type:payload.policy_type,p_carrier:payload.carrier,p_policy_number:payload.policy_number,p_coverage_amount:payload.coverage_amount,p_effective_on:payload.effective_on,p_expires_on:payload.expires_on,p_coi_storage_path:null});
   if(r.error)throw r.error;
   setPreview({signedAt:new Date().toISOString(),signature:sig,policyType:payload.policy_type,carrier:payload.carrier,verificationSource:"pending_selection"});
   status.innerHTML='<div class="notice"><b>Insurance record submitted to BCT for review.</b> Authorization was captured in this isolated preview. Production authorization persistence will be wired through the dedicated credential-audit schema before release.</div>';
   await renderContractor();
 }catch(e){status.textContent=e?.message||"Unable to submit insurance record."}
}
async function renderAdmin(){
 const host=document.getElementById("bctInsuranceVerificationAdminPanel");if(!host)return;
 let rows=[];try{const s=supa();if(s){const r=await s.rpc("bct_admin_insurance_policies");if(!r.error)rows=r.data||[]}}catch(_){}
 const preview=getPreview();
 host.innerHTML='<div class="toolbar"><div><h3>Insurance Verification Layer</h3><p class="muted">Extension of the existing Contractor Credentials Board — not a duplicate credential system.</p></div><span class="badge info">Carrier Independent</span></div>'+
 '<div class="grid grid-4 section"><div class="card"><div class="metric">'+rows.filter(x=>x.status==="active").length+'</div><small>Active Policies</small></div><div class="card"><div class="metric">'+rows.filter(x=>x.status==="pending_review").length+'</div><small>Pending BCT Review</small></div><div class="card"><div class="metric">'+rows.filter(x=>x.status==="expired").length+'</div><small>Expired</small></div><div class="card"><div class="metric">'+rows.filter(x=>daysLeft(x.expires_on)!==null&&daysLeft(x.expires_on)<=30&&daysLeft(x.expires_on)>=0).length+'</div><small>Expiring ≤30 Days</small></div></div>'+
 '<div class="stage"><b>Verification paths</b><div class="check-grid section"><div class="check-tile">1. Direct carrier / agent verification</div><div class="check-tile">2. Carrier-independent verification provider</div><div class="check-tile">3. ACORD / COI document verification</div><div class="check-tile">4. Manual BCT verification</div></div><p class="muted">The contractor authorization is intended to cover all approved verification paths without requiring a particular carrier.</p></div>'+
 (preview.signedAt?'<div class="notice section"><b>Isolated preview authorization test:</b> '+esc(preview.signature)+' • '+esc(preview.signedAt)+'</div>':"")+
 '<div class="section">'+(rows.length?rows.map(x=>'<div class="stage"><div class="toolbar"><div><b>'+esc(x.policy_type.replaceAll("_"," "))+'</b><div class="muted">'+esc(x.carrier)+'</div></div><span class="badge '+(health(x)==="good"?"good":health(x)==="warn"?"warn":"bad")+'">'+badge(health(x))+'</span></div><small>Expires '+esc(x.expires_on)+' • Status '+esc(x.status)+'</small></div>').join(""):'<div class="muted">No insurance policy records returned.</div>')+'</div>';
}
function inject(){
 let changed=false;
 const docs=document.getElementById("bctContractorDocsPanel");
 if(docs&&!document.getElementById("bctInsuranceVerificationPanel")){
  const el=document.createElement("section");el.id="bctInsuranceVerificationPanel";el.className="card section";docs.appendChild(el);changed=true;
 }
 const board=document.getElementById("adminContractorCredentials");
 if(board&&!document.getElementById("bctInsuranceVerificationAdminPanel")){
  const el=document.createElement("section");el.id="bctInsuranceVerificationAdminPanel";el.className="stage section";board.appendChild(el);changed=true;
 }
 if(changed){renderContractor();renderAdmin();}
}
document.addEventListener("click",e=>{if(e.target.closest?.("#bctContractorLoginBtn,#bctContractorLogoutBtn,#refreshContractorCredentialsBtn,[data-view='status']"))setTimeout(inject,500)},true);
document.addEventListener("DOMContentLoaded",()=>setTimeout(inject,700));
const mo=new MutationObserver(()=>{if(document.getElementById("bctContractorDocsPanel")||document.getElementById("adminContractorCredentials"))inject()});
mo.observe(document.documentElement,{childList:true,subtree:true});
})();