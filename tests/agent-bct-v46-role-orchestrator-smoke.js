// Agent BCT V46 role orchestrator smoke test
(function(){
  'use strict';
  const x=window.BCT_AGENT_V46_ROLE_ORCHESTRATOR;
  const c=window.BCT_AGENT_14_ROLE_INTEGRATION;
  if(!x||!c) throw new Error('Agent BCT role orchestrator prerequisites missing');
  if(c.ROLES.length!==14) throw new Error('Expected 14 roles');
  for(const role of c.ROLES){
    if(!x.health().stats[role.id]) throw new Error('Missing role telemetry: '+role.id);
  }
  const allowed=x.dispatch('credential_compliance','contractor_manager','credential_readiness',{test:true});
  if(!allowed.ok) throw new Error('Expected valid credential handoff');
  const blocked=x.dispatch('credential_compliance','finance_payment','invalid_handoff',{test:true});
  if(blocked.ok) throw new Error('Invalid handoff must be blocked');
  const escalated=x.escalate('finance_payment','payment_dispute',{test:true});
  if(!escalated.ok) throw new Error('Finance escalation must route to human review');
  if(!c.requiresHuman('credential_approval')) throw new Error('Credential approval must require human review');
  if(!c.requiresHuman('contract_approval')) throw new Error('Contract approval must require human review');
  if(!c.requiresHuman('safety_hold_clearance')) throw new Error('Safety hold clearance must require human review');
  if(x.snapshot().productionChanged!==false) throw new Error('Production must remain unchanged');
  console.log('PASS: Agent BCT V46 role orchestrator');
})();
// Cross-role handoff integrity: every declared source/target must be a real role,
// and every human-only boundary must remain represented in the contract.
for (const [source, targets] of Object.entries(c.HANDOFFS)) {
  if(!c.getRole(source)) throw new Error('handoff source role '+source);
  for (const target of targets) if(!c.getRole(target)) throw new Error('handoff target role '+source+' -> '+target);
}
for (const role of c.ROLES) {
  if(!c.canAct(role.id,role.authority)) throw new Error('role authority not actionable: '+role.id);
}
for (const action of c.NEVER_AUTO_DECIDE) if(!c.requiresHuman(action)) throw new Error('human boundary '+action);
