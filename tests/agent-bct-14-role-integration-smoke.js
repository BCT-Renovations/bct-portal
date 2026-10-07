// Agent BCT 14-role integration contract smoke test
(function(){
  'use strict';
  const x=window.BCT_AGENT_14_ROLE_INTEGRATION;
  if(!x) throw new Error('Agent BCT role integration contract missing');
  if(x.ROLES.length!==14) throw new Error('Expected exactly 14 roles');
  if(new Set(x.ROLE_IDS).size!==14) throw new Error('Role IDs must be unique');
  if(!x.integrationSnapshot().adminRemainsFinalAuthority) throw new Error('Admin authority boundary missing');
  if(!x.integrationSnapshot().sharedSourceOfTruth) throw new Error('Shared source-of-truth boundary missing');
  if(!x.requiresHuman('ai_estimate_approval')) throw new Error('AI approval must require human review');
  if(!x.requiresHuman('escrow_release')) throw new Error('Escrow release must require human review');
  if(!x.requiresHuman('public_photo_or_gallery_publish')) throw new Error('Public photo publication must require human review');
  if(x.requiresHuman('customer_selects_contractor_by_bid')!==true) throw new Error('Contractor-selection boundary missing');
  const wiring=window.BCT_AGENT_14_ROLE_WIRING;
  if(!wiring) throw new Error('Agent BCT live role wiring missing');
  if(wiring.duplicateSystemsCreated!==false) throw new Error('Live wiring must not create duplicate systems');
  const live=wiring.snapshot();
  if(live.adminFinalAuthority!==true) throw new Error('Live wiring admin boundary missing');
  if(live.noDuplicateStores!==true) throw new Error('Live wiring source-of-truth boundary missing');
  if(!live.existingSystems.estimatorSystem) throw new Error('Existing estimator system was not detected');
  console.log('PASS: Agent BCT 14-role contract + V46 live wiring');
})();