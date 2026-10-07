// Agent BCT V46 expanded role workflow smoke test
(function(){
  'use strict';
  const c=window.BCT_AGENT_14_ROLE_INTEGRATION;
  const x=window.BCT_AGENT_V46_ROLE_ORCHESTRATOR;
  if(!c||!x) throw new Error('Agent BCT orchestration prerequisites missing');
  if(c.ROLES.length!==14) throw new Error('Expected 14 roles');

  const lifecycle=x.routeProjectLifecycle({test:true});
  if(!lifecycle.ok) throw new Error('Project lifecycle routing failed');

  const materials=x.routeMaterials({test:true});
  if(!materials.ok) throw new Error('Materials routing failed');

  const communication=x.routeCommunication({test:true});
  if(!communication.ok) throw new Error('Communication routing failed');

  const claim=x.routeClaim({test:true});
  if(!claim.ok) throw new Error('Claims routing failed');

  const analytics=x.routeAnalytics({test:true});
  if(!analytics.ok) throw new Error('Analytics routing failed');

  const changeOrder=x.routeChangeOrder({action:'change_order_approval',test:true});
  if(!changeOrder.ok) throw new Error('Change-order approval must escalate to human review');

  const finance=x.routeFinance({action:'payment_dispute_resolution',test:true});
  if(!finance.ok) throw new Error('Payment dispute must escalate to human review');

  const health=x.health();
  if(health.roleCount!==14) throw new Error('Role telemetry count mismatch');
  if(health.productionChanged!==false) throw new Error('Production must remain unchanged');

  console.log('PASS: Agent BCT V46 expanded role workflow routing');
})();
