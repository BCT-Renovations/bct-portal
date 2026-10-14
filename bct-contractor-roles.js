/* BCT V46 Contractor Network + Renter Intake expansion. Additive and isolated. */
(function(){
'use strict';
if(window.__bctNetworkExpansionLoaded)return;
window.__bctNetworkExpansionLoaded=true;

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const workerRoles=[
  {code:'general_contractor',short:'Contractor',label:'Contractor / Renovations',signin:'Contractor Sign In',apply:'Start Contractor Application',agent:'contractor_coordinator',copy:'Renovations, larger scopes, and BCT-managed contractor work.'},
  {code:'electrical',short:'Electrician',label:'Electrician',signin:'Electrician Sign In',apply:'Start Electrician Application',agent:'compliance_credentials',copy:'Electrical applicants need license, insurance, and credential review before assignment.'},
  {code:'plumbing',short:'Plumber',label:'Plumber',signin:'Plumber Sign In',apply:'Start Plumber Application',agent:'compliance_credentials',copy:'Plumbing applicants need license, insurance, and credential review before assignment.'},
  {code:'hvac',short:'HVAC',label:'HVAC',signin:'HVAC Sign In',apply:'Start HVAC Application',agent:'compliance_credentials',copy:'Heating, cooling, ventilation, and licensed HVAC work.'},
  {code:'roofing',short:'Roofer',label:'Roofer',signin:'Roofer Sign In',apply:'Start Roofer Application',agent:'compliance_credentials',copy:'Roof repair, replacement, leak work, and licensed roofing review.'},
  {code:'drywall',short:'Drywaller',label:'Drywaller',signin:'Drywaller Sign In',apply:'Start Drywaller Application',agent:'contractor_coordinator',copy:'Drywall repair, hanging, finishing, patches, taping, and related wall work.'},
  {code:'concrete_masonry',short:'Concrete / Masonry',label:'Concrete / Masonry',signin:'Concrete / Masonry Sign In',apply:'Start Concrete / Masonry Application',agent:'contractor_coordinator',copy:'Concrete flatwork, masonry repair, drainage pads, walks, and related exterior work.'},
  {code:'flooring',short:'Flooring',label:'Flooring',signin:'Flooring Sign In',apply:'Start Flooring Application',agent:'contractor_coordinator',copy:'Ceramic tile, hardwood, laminate, vinyl, carpet, subfloor, and flooring repair work.'},
  {code:'handyman_services',short:'Handyman',label:'Handyman',signin:'Handyman Sign In',apply:'Start Handyman Application',agent:'contractor_coordinator',copy:'Small jobs, punch-list repairs, move-out repairs, and handyman work.'}
];
const categoryRoles=[
  ['handyman_services','Handyman / Small Jobs','Punch-list repairs, move-out repairs, furniture assembly, drywall patches, minor repair work.'],
  ['general_contractor','General Contractor / Renovations','Full renovation work, multi-trade coordination, larger scopes, and BCT-managed construction projects.'],
  ['electrical','Electrician','Electrical work that may require licensing, permit review, or BCT Admin approval before assignment.'],
  ['plumbing','Plumber','Plumbing work that may require licensing, permit review, or BCT Admin approval before assignment.'],
  ['hvac','Licensed HVAC','Heating, cooling, ventilation, and related licensed trade work.'],
  ['roofing','Roofer','Roof repair, replacement, leak work, and related licensed trade work.'],
  ['drywall','Drywaller','Drywall repair, hanging, finishing, patches, taping, and related wall work.'],
  ['concrete_masonry','Concrete / Masonry','Concrete flatwork, masonry repair, pads, walks, drainage work, and related exterior scopes.'],
  ['flooring','Flooring','Ceramic tile, hardwood, laminate, vinyl, carpet, subfloor, and flooring repair work.'],
  ['specialty_trade','Other Licensed / Specialty Trade','Siding, windows, doors, mitigation, or other trade-specific work.']
];
let activeRole=null;

function field(name){return document.querySelector('[name="'+name+'"]')}
function roleByCode(code){return workerRoles.find(role=>role.code===code)||null}
function publicLoginCard(){return document.querySelector('.bct-public-contractor-login')||$('bctContractorLoginCard')}
function setText(el,text){if(el)el.textContent=text}
function setValueIfEmpty(el,value){if(el&&!String(el.value||'').trim())el.value=value}
function setValue(el,value){if(el)el.value=value}
function selectedCategoryInputs(){return Array.from(document.querySelectorAll('input[name="contractorNetworkRole"]'))}

function installRenterFlow(){
  const owner=field('ownerStatus');
  const propertyCard=owner&&owner.closest('.card');
  if(!owner||!propertyCard||$('bctRenterApprovalPanel'))return;
  if(!Array.from(owner.options).some(opt=>opt.value==='Renter / tenant - landlord approval required')){
    owner.add(new Option('Renter / tenant - landlord approval required','Renter / tenant - landlord approval required'));
  }
  const panel=document.createElement('div');
  panel.id='bctRenterApprovalPanel';
  panel.className='bct-expansion-panel hidden';
  panel.innerHTML=[
    '<h3>Renter Landlord Approval</h3>',
    '<p class="muted">Renter requests stay locked until the landlord signs off. BCT will not assign the work until landlord permission is received.</p>',
    '<div class="grid grid-2">',
    '<div><label>Landlord / Property Manager Name</label><input name="landlordName" autocomplete="organization"></div>',
    '<div><label>Landlord Phone</label><input name="landlordPhone" type="tel" autocomplete="tel"></div>',
    '<div><label>Landlord Email for Signature</label><input name="landlordEmail" type="email" autocomplete="email"></div>',
    '<div><label>Who is responsible for payment?</label><select name="renterPaymentResponsibility"><option value="">Select one</option><option>Tenant / renter</option><option>Landlord / property manager</option><option>Not sure - BCT should confirm</option></select></div>',
    '</div>',
    '<label>Renter Notes for BCT</label><textarea name="renterApprovalNotes" placeholder="Deposit return, move-out repair, landlord instructions, or what permission is needed."></textarea>',
    '<label class="bct-checkbox-line"><input type="checkbox" name="renterLandlordSignatureAck"> I understand this project stays in Waiting for Landlord Signature status until BCT receives landlord approval.</label>',
    '<div class="notice"><b>Status lock:</b> Waiting for Landlord Signature. BCT Admin must review before assignment.</div>'
  ].join('');
  propertyCard.appendChild(panel);
  const sync=()=>panel.classList.toggle('hidden',owner.value!=='Renter / tenant - landlord approval required');
  owner.addEventListener('change',sync);
  sync();
}

function readRenter(form,fail){
  const owner=form.elements.ownerStatus;
  const isRenter=owner&&owner.value==='Renter / tenant - landlord approval required';
  if(!isRenter)return {is_renter:false};
  const required=['landlordName','landlordPhone','landlordEmail','renterPaymentResponsibility'];
  for(const name of required){
    const el=form.elements[name];
    if(!String((el&&el.value)||'').trim()){
      fail(String((el&&el.previousElementSibling&&el.previousElementSibling.textContent)||name)+' is required for renter requests.',el);
      return {__blocked:true};
    }
  }
  if(!form.elements.renterLandlordSignatureAck||!form.elements.renterLandlordSignatureAck.checked){
    fail('Confirm that landlord signature is required before BCT assigns the work.',form.elements.renterLandlordSignatureAck);
    return {__blocked:true};
  }
  return {
    is_renter:true,
    renter_intake_path:'client_portal',
    landlord_name:form.elements.landlordName.value.trim(),
    landlord_phone:form.elements.landlordPhone.value.trim(),
    landlord_email:form.elements.landlordEmail.value.trim(),
    renter_payment_responsibility:form.elements.renterPaymentResponsibility.value,
    renter_approval_notes:form.elements.renterApprovalNotes.value.trim(),
    landlord_signature_status:'waiting_for_landlord_signature',
    workflow_status:'waiting_for_landlord_signature',
    admin_assignment_hold_reason:'Renter request requires landlord signature before BCT assigns work.'
  };
}

function ensureRoleRouter(){
  const login=publicLoginCard();
  const signup=$('bctContractorSignupCard');
  if(!login&&!signup)return;
  if($('bctContractorRoleRouter')){
    document.querySelectorAll('[data-bct-worker-role]').forEach(button=>{const role=roleByCode(button.dataset.bctWorkerRole);if(role){button.dataset.bctRoleTitle=role.short;button.setAttribute('aria-label',role.short);}});
    return;
  }
  const router=document.createElement('section');
  router.id='bctContractorRoleRouter';
  router.className='card section bct-role-router';
  router.innerHTML=[
    '<h3>Choose Your Profession</h3>',
    '<p class="muted">Tap your profession to continue.</p>',
    '<div class="bct-worker-role-grid">',
    workerRoles.map(role=>'<button type="button" data-bct-worker-role="'+esc(role.code)+'" data-bct-role-title="'+esc(role.short)+'" aria-label="'+esc(role.short)+'"></button>').join(''),
    '</div>',
    '<div id="bctActiveRoleNotice" class="notice"><b>Selected:</b> <span>Choose a profession to continue.</span></div>'
  ].join('');
  (login||signup).insertAdjacentElement('beforebegin',router);
  router.classList.remove('hidden','bct-signedout-hidden');
  router.addEventListener('click',event=>{
    const button=event.target.closest&&event.target.closest('[data-bct-worker-role]');
    if(!button)return;
    applyWorkerRole(button.dataset.bctWorkerRole,{scroll:false});
  });
  clearWorkerRole();
}

function ensureApplicationRoleChoices(){
  const form=$('applicationForm');
  if(!form||$('bctContractorRoleChoices'))return;
  const tradeSelect=form.querySelector('select[name="trade"]')&&form.querySelector('select[name="trade"]').closest('div');
  const box=document.createElement('div');
  box.id='bctContractorRoleChoices';
  box.className='full bct-role-choice-panel';
  box.innerHTML='<label>Work Categories You Want BCT to Review</label><p class="muted">Select all that apply. This is one contractor account with role-by-role BCT approval.</p><div class="bct-role-choice-grid">'+categoryRoles.map(([code,label,copy])=>'<label class="check-tile"><input type="checkbox" name="contractorNetworkRole" value="'+esc(code)+'"> <b>'+esc(label)+'</b><span>'+esc(copy)+'</span></label>').join('')+'</div><div class="notice">No extra duplicate account is needed. BCT can approve one category and hold another until credentials are verified.</div>';
  (tradeSelect||form.firstElementChild).insertAdjacentElement('afterend',box);
  const h2=form.closest('.card')&&form.closest('.card').querySelector('h2');
  if(h2&&/Handyman Pre-Application/i.test(h2.textContent))h2.textContent='Stage 1 - Contractor Network Pre-Application';
  const intro=h2&&h2.nextElementSibling;
  if(intro&&intro.classList.contains('muted'))intro.textContent='This form helps BCT learn who the applicant is, what categories they want reviewed, and what credentials must be verified before assignment.';
  if(activeRole)applyWorkerRole(activeRole.code,{scroll:false});
}

function updateAgentRole(role){
  window.BCTContractorNetwork.activeRole=role;
  window.BCTContractorNetwork.activeAgentRole=role.agent;
  try{sessionStorage.setItem('bctContractorActiveRole',role.code)}catch(_){}
  const agentSelect=$('bctAgentPosition');
  if(agentSelect){
    const option=Array.from(agentSelect.options).find(opt=>opt.value===role.agent);
    if(option){
      agentSelect.value=role.agent;
      agentSelect.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }
  document.dispatchEvent(new CustomEvent('bct:contractor-role-change',{detail:{role:role.code,agentRole:role.agent,label:role.label}}));
}

function updateApplicationCopy(role){
  document.querySelectorAll('#view-apply h2').forEach(heading=>{
    if(/Handyman Pre-Application|Contractor Network Pre-Application|Contractor Application/i.test(heading.textContent)){
      heading.textContent='Stage 1 - '+role.short+' Pre-Application';
    }
  });
  const form=$('applicationForm');
  const formCard=form&&form.closest('.card');
  const intro=formCard&&Array.from(formCard.querySelectorAll('p.muted')).find(p=>/This form helps BCT learn/i.test(p.textContent));
  if(intro)intro.textContent='This form helps BCT learn who the '+role.short.toLowerCase()+' applicant is, what credentials must be verified, and what work category BCT should review before assignment.';
}

function applyWorkerRole(code,opts={}){
  const role=roleByCode(code);
  if(!role)return clearWorkerRole();
  activeRole=role;
  document.body.dataset.bctContractorRole=role.code;
  document.querySelectorAll('[data-bct-worker-role]').forEach(button=>{
    const selected=button.dataset.bctWorkerRole===role.code;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
  const notice=$('bctActiveRoleNotice')&&$('bctActiveRoleNotice').querySelector('span');
  setText(notice,role.label);
  const login=publicLoginCard();
  setText(login&&login.querySelector('h3'),role.signin);
  const signup=$('bctContractorSignupCard');
  setText(signup&&signup.querySelector('h3'),'New '+role.short+' - Application');
  const intro=signup&&signup.querySelector('p');
  if(intro)intro.textContent='New to the BCT Contractor Network? Choose '+role.short+' and start the right BCT pre-application path.';
  const start=$('bctContractorSignupBtn');
  setText(start,role.apply);
  if(start)start.setAttribute('data-bct-selected-role',role.code);
  setValue(field('trade'),role.code);
  selectedCategoryInputs().forEach(input=>{input.checked=input.value===role.code});
  updateApplicationCopy(role);
  updateAgentRole(role);
  if(opts.scroll) (login||signup).scrollIntoView({behavior:'smooth',block:'start'});
}

function installContractorNetwork(){
  ensureRoleRouter();
  ensureApplicationRoleChoices();

  const old=$('bctContractorNetworkChooser');
  if(old&&$('bctContractorRoleRouter'))old.remove();

  document.addEventListener('click',event=>{
    const closest=event.target.closest&&event.target.closest.bind(event.target);
    if(closest&&closest('#bctContractorSignupBtn')){
      setTimeout(()=>{if(activeRole)applyWorkerRole(activeRole.code,{scroll:false});},0);
    }
    if(closest&&closest('#bctAgentOpen')){
      setTimeout(()=>{if(activeRole)updateAgentRole(activeRole);},0);
    }
  },true);
}

function readRoles(form){
  const selected=Array.from(form.querySelectorAll('input[name="contractorNetworkRole"]:checked')).map(input=>input.value);
  const primary=String(new FormData(form).get('trade')||'');
  if(!selected.length&&activeRole&&activeRole.code)selected.push(activeRole.code);
  if(!selected.length&&primary)selected.push(primary);
  return Array.from(new Set(selected));
}

function repairLanding(){
  const old=$('bctHandymanPortalBtn');
  if(old)old.remove();
  const contractor=document.querySelector('[data-entry-login="contractor"]');
  if(contractor&&!contractor.textContent.trim())contractor.textContent='Contractor';
}

function repairAuthLabels(){
  const english={
    'contractor.email':'Email',
    'contractor.password':'Password',
    'contractor.signin_button':'Sign In',
    'contractor.forgot_password':'Forgot Password?',
    'contractor.resend_confirmation':'Resend Confirmation Email',
    'homeowner.first_name':'First Name',
    'homeowner.last_name':'Last Name',
    'homeowner.mobile_phone':'Mobile Phone',
    'homeowner.create_password':'Create Password',
    'homeowner.confirm_password':'Confirm Password'
  };
  for(const [key,label] of Object.entries(english)){
    document.querySelectorAll('[data-i18n="'+key+'"]').forEach(el=>{
      if(el.textContent.trim()===key)el.textContent=label;
    });
    document.querySelectorAll('label,button,h2,h3,span,p').forEach(el=>{
      if(el.children.length===0&&el.textContent.trim()===key)el.textContent=label;
    });
  }
}

function install(){
  installRenterFlow();
  installContractorNetwork();
  repairLanding();
  repairAuthLabels();
  if(!window.__bctLabelRepairObserver){
    window.__bctLabelRepairObserver=new MutationObserver(()=>repairAuthLabels());
    window.__bctLabelRepairObserver.observe(document.body,{childList:true,subtree:true});
  }
}

window.BCTRenterFlow={read:readRenter};
window.BCTContractorNetwork={readRoles,activeRole:null,activeAgentRole:null,setActiveRole:code=>applyWorkerRole(code,{scroll:false})};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
window.addEventListener('pageshow',install);
document.addEventListener('click',()=>setTimeout(repairAuthLabels,0),true);
document.addEventListener('change',event=>{if(event.target&&event.target.matches&&event.target.matches('#bctLoginLanguage,#bctLanguage,[data-language-selector]'))setTimeout(repairLanding,0)},true);
})();
