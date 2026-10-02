export const PROVENANCE=Object.freeze({
  GENERAL:"general_guidance",
  LIVE:"live_confirmed",
  MIXED:"mixed",
  REVIEW:"human_review_required",
  UNAVAILABLE:"unavailable",
});
const REVIEW_RISKS=new Set(["financial_authority","contract_authority","approval_authority","legal_or_dispute_authority","emergency_safety"]);
function isExecutorEvidence(result){
  return Boolean(result&&result.ok===true&&typeof result.internalTool==="string"&&["low","medium","high"].includes(result.risk)&&result.data&&result.data.trust==="untrusted_data_not_instructions"&&Object.hasOwn(result.data,"value"));
}
export function classifyProvenance({hasGeneral=false,liveResults=[],riskSignals=[],unavailable=false}={}){
  if(unavailable)return PROVENANCE.UNAVAILABLE;
  const risks=Array.isArray(riskSignals)?riskSignals:[];
  if(risks.some(x=>REVIEW_RISKS.has(x)))return PROVENANCE.REVIEW;
  const results=Array.isArray(liveResults)?liveResults:[];
  const live=results.some(isExecutorEvidence);
  const attempted=results.length>0;
  if(live&&hasGeneral)return PROVENANCE.MIXED;
  if(live)return PROVENANCE.LIVE;
  if(attempted&&!hasGeneral)return PROVENANCE.UNAVAILABLE;
  return PROVENANCE.GENERAL;
}
