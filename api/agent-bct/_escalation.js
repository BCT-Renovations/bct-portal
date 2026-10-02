const LABEL_MAP=Object.freeze({
  project_question:{caseType:"issue",category:"communication"},
  schedule_issue:{caseType:"issue",category:"schedule"},
  payment_question:{caseType:"issue",category:"payment"},
  financing_question:{caseType:"issue",category:"payment"},
  escrow_question:{caseType:"issue",category:"payment"},
  contract_question:{caseType:"issue",category:"scope"},
  estimate_question:{caseType:"issue",category:"scope"},
  change_order_question:{caseType:"issue",category:"scope"},
  contractor_issue:{caseType:"issue",category:"contractor"},
  estimator_issue:{caseType:"issue",category:"other"},
  document_issue:{caseType:"issue",category:"communication"},
  access_or_portal_issue:{caseType:"issue",category:"communication"},
  warranty_or_service_call:{caseType:"issue",category:"quality"},
  dispute_or_claim:{caseType:"dispute",category:"other"},
  safety_concern:{caseType:"issue",category:"safety"},
  other:{caseType:"issue",category:"other"},
});
const SEVERITIES=new Set(["low","normal","high"]);
function cleanText(value,max){return typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max):"";}
export function prepareEscalation({label="other",severity="normal",subject="",description="",confirmed=false,projectId="",jobId=""}={}){
  if(confirmed!==true)return{ok:false,error:"confirmation_required"};
  const mapped=LABEL_MAP[label];
  if(!mapped)return{ok:false,error:"invalid_escalation_label"};
  if(!SEVERITIES.has(severity))return{ok:false,error:"invalid_escalation_severity"};
  const safeSubject=cleanText(subject,160),safeDescription=cleanText(description,1200);
  if(!safeSubject||!safeDescription)return{ok:false,error:"invalid_escalation_text"};
  return{ok:true,caseType:mapped.caseType,category:mapped.category,severity,subject:safeSubject,description:safeDescription,projectId:cleanText(projectId,80),jobId:cleanText(jobId,80)};
}
export function escalationLabels(){return Object.keys(LABEL_MAP);}
