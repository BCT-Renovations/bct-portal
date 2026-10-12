/* BCT V46 Contractor Network + Renter Intake expansion. Additive and isolated. */
(function(){
'use strict';
if(window.__bctNetworkExpansionLoaded)return;
window.__bctNetworkExpansionLoaded=true;

const $=id=>document.getElementById(id);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const roles=[
  ['handyman_services','Handyman / Small Jobs','Punch-list repairs, move-out repairs, furniture assembly, drywall patches, minor repair work.'],
  ['general_contractor','General Contractor / Renovations','Full renovation work, multi-trade coordination, larger scopes, and BCT-managed construction projects.'],
  ['electrical','Licensed Electrical','Electrical work that may require licensing, permit review, or BCT Admin approval before assignment.'],
  ['plumbing','Licensed Plumbing','Plumbing work that may require licensing, permit review, or BCT Admin approval before assignment.'],
  ['hvac','Licensed HVAC','Heating, cooling, ventilation, and related licensed trade work.'],
  ['specialty_trade','Other Licensed / Specialty Trade','Roofing, siding, windows, doors, concrete, mitigation, or other trade-specific work.']
];

function field(name){return document.querySelector(`[name="${name}"]`)}
function lang(){return (localStorage.getItem('bctPreferredLanguage')||localStorage.getItem('bctLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}

function installRenterFlow(){
  const owner=field('ownerStatus');
  const propertyCard=owner?.closest('.card');
  if(!owner||!propertyCard||$('bctRenterApprovalPanel'))return;
  if(![...owner.options].some(opt=>opt.value==='Renter / tenant - landlord approval required')){
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
  const isRenter=owner?.value==='Renter / tenant - landlord approval required';
  if(!isRenter)return {is_renter:false};
  const required=['landlordName','landlordPhone','landlordEmail','renterPaymentResponsibility'];
  for(const name of required){
    const el=form.elements[name];
    if(!String(el?.value||'').trim()){
      fail(`${el?.previousElementSibling?.textContent||name} is required for renter requests.`,el);
      return {__blocked:true};
    }
  }
  if(!form.elements.renterLandlordSignatureAck?.checked){
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

function installContractorNetwork(){
  const signup=$('bctContractorSignupCard');
  if(!signup||$('bctContractorNetworkChooser'))return;
  const chooser=document.createElement('div');
  chooser.id='bctContractorNetworkChooser';
  chooser.className='card section bct-network-chooser';
  chooser.innerHTML=[
    '<h3>Contractor Network Choices</h3>',
    '<p class="muted">One BCT contractor profile can request more than one work category. BCT reviews and approves each category separately.</p>',
    '<div class="bct-network-choice-grid">',
    '<button type="button" data-bct-network-open="contractor"><b>Contractor / Renovations</b><span>Apply for regular BCT contractor work.</span></button>',
    '<button type="button" data-bct-network-open="handyman"><b>Handyman / Small Jobs</b><span>Small repairs, move-out repairs, punch-list work, and tenant-friendly jobs.</span></button>',
    '<button type="button" data-bct-network-open="licensed"><b>Licensed Trades</b><span>Electrical, plumbing, HVAC, and other credentialed work.</span></button>',
    '</div>',
    '<div id="bctLicensedTradeNotice" class="notice hidden"><b>Licensed trade lane:</b> Start the contractor application and choose Electrical, Plumbing, HVAC, or Specialty Trade. BCT Admin verifies credentials before assignments.</div>'
  ].join('');
  signup.after(chooser);
  chooser.addEventListener('click',event=>{
    const action=event.target.closest('[data-bct-network-open]')?.dataset.bctNetworkOpen;
    if(!action)return;
    if(action==='handyman'){
      window.BCTHandymanPortal?.open?.();
      return;
    }
    if(action==='licensed'){
      $('bctLicensedTradeNotice')?.classList.remove('hidden');
    }
    $('bctContractorSignupBtn')?.click();
  });

  const form=$('applicationForm');
  if(!form||$('bctContractorRoleChoices'))return;
  const tradeSelect=form.querySelector('select[name="trade"]')?.closest('div');
  const box=document.createElement('div');
  box.id='bctContractorRoleChoices';
  box.className='full bct-role-choice-panel';
  box.innerHTML='<label>Work Categories You Want BCT to Review</label><p class="muted">Select all that apply. This is one contractor account with role-by-role BCT approval.</p><div class="bct-role-choice-grid">'+roles.map(([code,label,copy])=>'<label class="check-tile"><input type="checkbox" name="contractorNetworkRole" value="'+esc(code)+'"> <b>'+esc(label)+'</b><span>'+esc(copy)+'</span></label>').join('')+'</div><div class="notice">No extra duplicate account is needed. BCT can approve one category and hold another until credentials are verified.</div>';
  (tradeSelect||form.firstElementChild)?.insertAdjacentElement('afterend',box);
  const h2=form.closest('.card')?.querySelector('h2');
  if(h2&&/Handyman Pre-Application/i.test(h2.textContent))h2.textContent='Stage 1 - Contractor Network Pre-Application';
  const intro=h2?.nextElementSibling;
  if(intro&&intro.classList.contains('muted'))intro.textContent='This form helps BCT learn who the applicant is, what categories they want reviewed, and what credentials must be verified before assignment.';
}

function readRoles(form){
  const selected=[...form.querySelectorAll('input[name="contractorNetworkRole"]:checked')].map(input=>input.value);
  const primary=String(new FormData(form).get('trade')||'');
  if(!selected.length&&primary)selected.push(primary);
  return [...new Set(selected)];
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
    'contractor.resend_confirmation':'Resend Confirmation Email'
  };
  for(const [key,label] of Object.entries(english)){
    document.querySelectorAll(`[data-i18n="${key}"]`).forEach(el=>{
      if(el.textContent.trim()===key)el.textContent=label;
    });
  }
}

function install(){
  installRenterFlow();
  installContractorNetwork();
  repairLanding();
  repairAuthLabels();
}

window.BCTRenterFlow={read:readRenter};
window.BCTContractorNetwork={readRoles};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
window.addEventListener('pageshow',install);
document.addEventListener('click',()=>setTimeout(repairAuthLabels,0),true);
document.addEventListener('change',event=>{if(event.target?.matches?.('#bctLoginLanguage,#bctLanguage,[data-language-selector]'))setTimeout(repairLanding,0)},true);
})();
