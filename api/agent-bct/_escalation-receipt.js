const MAX_RECEIPT_TEXT=120;
function safe(value,max=MAX_RECEIPT_TEXT){return typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max):"";}
export function projectEscalationReceipt(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  const caseId=safe(value.id,80);
  const caseType=["issue","dispute"].includes(value.case_type)?value.case_type:"";
  const severity=["low","normal","high"].includes(value.severity)?value.severity:"";
  const status=["open","in_review","waiting_on_customer","waiting_on_contractor","resolved","closed"].includes(value.status)?value.status:"";
  if(!caseId||!caseType||!severity||!status)return null;
  return Object.freeze({
    caseId,
    caseNumber:safe(value.case_number,80),
    projectId:safe(value.project_id,80),
    caseType,
    category:safe(value.category,40),
    severity,
    status,
    createdAt:safe(value.created_at,80),
  });
}
