export const PROVENANCE=Object.freeze({
  GENERAL:"general_guidance",
  LIVE:"live_confirmed",
  MIXED:"mixed",
  REVIEW:"human_review_required",
  UNAVAILABLE:"unavailable",
});
export function classifyProvenance({hasGeneral=false,liveResults=[],riskSignals=[],unavailable=false}={}){
  if(unavailable)return PROVENANCE.UNAVAILABLE;
  const risks=Array.isArray(riskSignals)?riskSignals:[];
  if(risks.some(x=>["financial_authority","contract_authority","approval_authority","legal_or_dispute_authority","emergency_safety"].includes(x)))return PROVENANCE.REVIEW;
  const live=Array.isArray(liveResults)&&liveResults.some(x=>x&&x.ok===true);
  if(live&&hasGeneral)return PROVENANCE.MIXED;
  if(live)return PROVENANCE.LIVE;
  return PROVENANCE.GENERAL;
}
