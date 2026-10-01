/* BCT V46 Estimator System
   Separate estimator role and workflow policy layer. Big Dog 3 remains untouched. */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-estimator-system-1';
  const WORKFLOW=[
    'assessment_required','payment_pending','paid','estimator_assigned','scheduled',
    'site_assessment_completed','assessment_submitted','bct_review','bct_approved',
    'contractor_bidding','credited_to_project'
  ];
  const LABELS={
    assessment_required:'Assessment Required',payment_pending:'Payment Pending',paid:'Paid',
    estimator_assigned:'Estimator Assigned',scheduled:'Scheduled',
    site_assessment_completed:'Site Assessment Completed',assessment_submitted:'Assessment Submitted',
    bct_review:'BCT Review',bct_approved:'BCT Approved',contractor_bidding:'Contractor Bidding',
    credited_to_project:'Credited to Project'
  };
  const COMPLETE_REQUIREMENTS=['site_visit','photos','measurements','documentation','assessment_package'];
  const roleOf=user=>String(user?.app_metadata?.role||user?.app_metadata?.bct_role||'').trim().toLowerCase();

  function canEstimatorAccess(user){return roleOf(user)==='estimator'}
  function canAdminAccess(user){return roleOf(user)==='admin'}
  function nextStatus(current){
    const i=WORKFLOW.indexOf(current);
    return i<0?WORKFLOW[0]:(WORKFLOW[i+1]||current);
  }
  function validTransition(from,to){
    const a=WORKFLOW.indexOf(from),b=WORKFLOW.indexOf(to);
    return a>=0&&b===a+1;
  }
  function canSchedule(assessment){return assessment?.status==='paid'&&Number(assessment?.homeowner_fee||0)>=0&&!!assessment?.fee_paid_at}
  function canReleaseForBidding(assessment){return assessment?.status==='bct_approved'&&assessment?.bct_accepted_complete===true&&!!assessment?.bct_approved_at}
  function projectCredit(assessment,homeownerProceeds){return homeownerProceeds?Number(assessment?.homeowner_fee||0):0}
  function paymentEligible(pkg){
    return COMPLETE_REQUIREMENTS.every(k=>pkg?.[k]===true)&&pkg?.bct_accepted===true;
  }
  function assignmentTravel(assignment){
    return {
      included:true,
      extraAllowed:!!assignment?.travel_extra_preapproved,
      extraAmount:assignment?.travel_extra_preapproved?Number(assignment?.travel_extra_amount||0):0
    };
  }
  function mayContractorBid({contractor,project,assessment}){
    if(!contractor||!project)return {allowed:false,reason:'Missing contractor or project.'};
    if(assessment?.estimator_user_id&&assessment.estimator_user_id===contractor.user_id)
      return {allowed:false,reason:'Separation of duties: the site estimator cannot bid on this project.'};
    if(!contractor.credentials_active)
      return {allowed:false,reason:'Active BCT-verified credentials are required.'};
    const tradeOk=(contractor.verified_trades||[]).includes(project.required_trade);
    const jurisdictionOk=(contractor.verified_jurisdictions||[]).includes(project.jurisdiction);
    if(!tradeOk||!jurisdictionOk)
      return {allowed:false,reason:'Required verified trade and jurisdiction credentials are required.'};
    if(assessment&&!assessment.bct_approved)
      return {allowed:false,reason:'BCT must approve the assessment package before contractor bidding.'};
    return {allowed:true,reason:''};
  }
  function mayPerformProject({contractor,assessment}){
    if(assessment?.estimator_user_id&&assessment.estimator_user_id===contractor?.user_id)
      return {allowed:false,reason:'Separation of duties: the site estimator cannot perform this project.'};
    return {allowed:true,reason:''};
  }
  function homeownerAssessmentTerms(fee){
    return {
      fee:Number(fee||0),upfront:true,discloseBeforeScheduling:true,
      fullCreditIfProjectProceeds:true,earnedNonrefundableAfterCompletedAssessment:true
    };
  }
  function remoteEstimateFirst(project){
    const hasDescription=!!String(project?.description||'').trim();
    const hasMedia=(project?.photos?.length||0)+(project?.videos?.length||0)>0;
    const hasMeasurements=!!project?.measurements;
    const hasPropertyInfo=!!project?.property_info;
    return {free:true,sufficient:hasDescription&&hasMedia&&hasMeasurements&&hasPropertyInfo,
      next:hasDescription&&hasMedia&&hasMeasurements&&hasPropertyInfo?'remote_estimate':'assessment_required'};
  }

  window.BCT_ESTIMATOR_SYSTEM={
    VERSION,WORKFLOW,LABELS,COMPLETE_REQUIREMENTS,canEstimatorAccess,canAdminAccess,nextStatus,validTransition,canSchedule,canReleaseForBidding,projectCredit,
    paymentEligible,assignmentTravel,mayContractorBid,mayPerformProject,homeownerAssessmentTerms,remoteEstimateFirst,
    compensation:{basis:'per_completed_assignment',hourlyDefault:false,constructionPercentage:false,openEndedGasAllowance:false},
    contractorTravel:{standardGasAllowance:false,normalTravelInBid:true,exceptionalTravelRequiresAdvanceApproval:true},
    assessmentPolicy:{bctReviewRequired:true,contractorsSetOwnBids:true,aiDoesNotDictateBid:true,estimatorAssessmentDoesNotDictateBid:true}
  };
})();