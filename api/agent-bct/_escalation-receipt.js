const MAX_RECEIPT_TEXT=120;
function safe(value,max=MAX_RECEIPT_TEXT){return typeof value==="string"?value.replace(/[\u0000-\u001f\u007f]/g," ").trim().slice(0,max):"";}
export function projectEscalationReceipt(value){
  if(!value||typeof value!=="object"||Array.isArray(value))return null;
  return Object.freeze({
    caseId:safe(value.id,80),
    caseNumber:safe(value.case_number,80),
    projectId:safe(value.project_id,80),
    caseType:safe(value.case_type,20),
    category:safe(value.category,40),
    severity:safe(value.severity,20),
    status:safe(value.status,30),
    createdAt:safe(value.created_at,80),
  });
}
