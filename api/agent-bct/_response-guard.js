const SECRET_PATTERNS=[
  /\b(?:sk|pk|rk)_[a-z0-9_-]{16,}\b/i,
  /\bBearer\s+[A-Za-z0-9._~+\/-]{16,}/i,
  /\b(?:service.?role|api.?key|access token|refresh token|database password)\b\s*[:=]\s*\S+/i,
];
const RESERVED_COMPLETION=[
  /\bI\s+(?:have\s+)?(?:released|refunded|approved|assigned|rejected|amended|signed)\b.{0,60}\b(?:escrow|payment|refund|financing|payout|contractor|estimator|contract)\b/i,
  /\b(?:escrow|payment|refund|financing|payout|contractor|estimator|contract)\b.{0,60}\b(?:has been|is now)\s+(?:released|refunded|approved|assigned|rejected|amended|signed)\b/i,
];
const HUMAN_CLAIM=/\bI\s+(?:am|am\s+actually|work\s+as)\s+(?:Ty|Tyrone(?:\s+Perry)?|a human|your general contractor)\b/i;

export function inspectGeneratedResponse(text,{confirmedActions=[]}={}){
  const value=typeof text==="string"?text:"";
  if(!value.trim())return {safe:false,findings:["empty_response"]};
  if(value.length>12000)return {safe:false,findings:["response_too_large"]};
  const findings=[];
  if(SECRET_PATTERNS.some(x=>x.test(value)))findings.push("possible_secret_leak");
  if(HUMAN_CLAIM.test(value))findings.push("human_impersonation_claim");
  const confirmed=Array.isArray(confirmedActions)?confirmedActions.filter(x=>typeof x==="string"):[];
  if(confirmed.length===0&&RESERVED_COMPLETION.some(x=>x.test(value)))findings.push("unconfirmed_reserved_action_claim");
  return {safe:findings.length===0,findings};
}
