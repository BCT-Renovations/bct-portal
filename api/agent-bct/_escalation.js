const LABEL_MAP=Object.freeze({
  project_question:{caseType:"issue",category:"communication"},schedule_issue:{caseType:"issue",category:"schedule"},
  payment_question:{caseType:"issue",category:"payment"},financing_question:{caseType:"issue",category:"payment"},
  escrow_question:{caseType:"issue",category:"payment"},contract_question:{caseType:"issue",category:"scope"},
  estimate_question:{caseType:"issue",category:"scope"},change_order_question:{caseType:"issue",category:"scope"},
  contractor_issue:{caseType:"issue",category:"contractor"},estimator_issue:{caseType:"issue",category:"other"},
  document_issue:{caseType:"issue",category:"communication"},access_or_portal_issue:{caseType:"issue",category:"communication"},
  warranty_or_service_call:{caseType:"issue",category:"quality"},dispute_or_claim:{caseType:"dispute",category:"other"},
  safety_concern:{caseType:"issue",category:"safety"},other:{caseType:"issue",category:"other"},
});
const SEVERITIES=new Set(["low","normal","high"]);
function cleanText(value,max){return typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g," ").replace(/\s+/g," ").trim().slice(0,max):"";}
function safeId(value){const v=cleanText(value,80);return !v||/^[a-z0-9_-]+$/i.test(v)?v:"";}
export function prepareEscalation({label="other",severity="normal",subject="",description="",confirmed=false,projectId="",jobId=""}={}){
  if(confirmed!==true)return{ok:false,error:"confirmation_required"};
  const mapped=LABEL_MAP[label];if(!mapped)return{ok:false,error:"invalid_escalation_label"};
  if(!SEVERITIES.has(severity))return{ok:false,error:"invalid_escalation_severity"};
  const safeSubject=cleanText(subject,160),safeDescription=cleanText(description,1200);
  if(!safeSubject||!safeDescription)return{ok:false,error:"invalid_escalation_text"};
  return{ok:true,caseType:mapped.caseType,category:mapped.category,severity,subject:safeSubject,description:safeDescription,projectId:safeId(projectId),jobId:safeId(jobId)};
}
export function escalationRpcArgs(prepared={}){
  if(!prepared?.ok)return null;
  return Object.freeze({p_project_id:prepared.projectId||null,p_job_id:prepared.jobId||null,p_case_type:prepared.caseType,p_category:prepared.category,p_severity:prepared.severity,p_subject:prepared.subject,p_description:prepared.description});
}
export function escalationFingerprint(payload={}){
  const r=prepareEscalation({...payload,confirmed:true});if(!r.ok)return"";
  return[r.projectId,r.jobId,r.caseType,r.category,r.severity,r.subject.toLowerCase(),r.description.toLowerCase()].join("|");
}
export function escalationLabels(){return Object.keys(LABEL_MAP);}
