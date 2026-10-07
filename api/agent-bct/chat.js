import { buildAgentBctContext } from "./_context.js";
import { generateAgentBct, runtimeConfig } from "./_runtime.js";
import { checkLocalRateLimit } from "./_rate-limit.js";
import { auditEvent, emitPreviewAudit } from "./_audit.js";
import { inspectGeneratedResponse } from "./_response-guard.js";
import { classifyProvenance } from "./_provenance.js";
import { normalizeAgentBctPosition, positionProfile, listAgentBctPositions } from "./_positions.js";

const MAX_BODY_BYTES=32*1024;
function json(body,status=200,extra={}){return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer","permissions-policy":"camera=(), microphone=(), geolocation=()",...extra}});}
function bearer(request){const m=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);return m?m[1].trim():"";}
async function parse(request){const declared=Number(request.headers.get("content-length")||"0");if(Number.isFinite(declared)&&declared>MAX_BODY_BYTES)return{error:"payload_too_large",status:413};const text=await request.text();if(new TextEncoder().encode(text).byteLength>MAX_BODY_BYTES)return{error:"payload_too_large",status:413};try{return{value:text?JSON.parse(text):{}}}catch{return{error:"invalid_json",status:400}};}
function cfg(){const url=(process.env.SUPABASE_URL||"").replace(/\/$/,"");const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY||"";if(!url||!key)throw Object.assign(new Error("service_unavailable"),{status:503});return{url,key};}
async function rpc(name,token,args={}){const{url,key}=cfg();const res=await fetch(`${url}/rest/v1/rpc/${name}`,{method:"POST",headers:{apikey:key,authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify(args)});const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch{}if(!res.ok)throw Object.assign(new Error("backend_request_failed"),{status:res.status===401?401:res.status===403?403:502});return data;}
function roleOf(value){const role=value&&typeof value.role==="string"?value.role:"";if(!["homeowner","contractor","admin"].includes(role))throw Object.assign(new Error("access_denied"),{code:"access_denied",status:403});return role;}
function clientIdentity(request,token){
  if(token){
    try{
      const payload=token.split(".")[1]||"";
      const normalized=payload.replace(/-/g,"+").replace(/_/g,"/");
      const decoded=JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length/4)*4,"=")));
      if(typeof decoded?.sub==="string"&&/^[0-9a-f-]{36}$/i.test(decoded.sub))return `auth:${decoded.sub}`;
    }catch{}
    return "auth:unresolved";
  }
  return "public:anonymous";
}
function securityHeaders(){return{"referrer-policy":"no-referrer","permissions-policy":"camera=(), microphone=(), geolocation=()"};}

const ROLE_PREVIEW={
  project_manager:{
    intro:"I’m Agent BCT in the Project Manager role. I can organize project status, milestones, dependencies, communication, and next steps.",
    cues:[["status|where.*project|what happens next|next step","I can organize the current project status, what has been completed, what is pending, dependencies, and the next coordination step."],["schedule|timeline|milestone|when","I can organize the project timeline and scheduling dependencies. I can prepare the next scheduling action, but I cannot make an assignment or approval reserved for BCT Admin."]]
  },
  estimator:{
    intro:"I’m Agent BCT in the Estimator role. I can organize scope information, estimate inputs, site-assessment needs, and pricing preparation for BCT review.",
    cues:[["estimate|price|cost|scope|quote","I can organize the work scope, quantities, photos, documents, and other estimate inputs. I can identify when a site assessment may be needed, but final pricing and approval remain with BCT."],["site assessment|site visit|measure","I can help determine what information is missing for an estimate and organize a Site Assessment Required step when the available information is insufficient."]]
  },
  contractor_coordinator:{
    intro:"I’m Agent BCT in the Contractor Coordinator role. I can coordinate contractor readiness, documentation, communication, and job handoff.",
    cues:[["contractor|subcontractor|trade","I can explain contractor readiness, required documentation, communication, and handoff steps. Contractor approval and assignment remain with BCT."],["credential|insurance|license|bond|w-9","I can organize the credential and document checklist for the applicable contractor and identify items that need BCT review."]]
  },
  assignment_scheduler:{
    intro:"I’m Agent BCT in the Assignment & Scheduling Coordinator role. I can organize availability, scheduling, assignment preparation, and dependencies.",
    cues:[["schedule|availability|calendar|appointment","I can organize availability, scheduling windows, dependencies, and the information needed to prepare an assignment."],["assign|assignment|who is coming","I can prepare the assignment information, but I cannot make the final contractor assignment. That decision stays with BCT Admin."]]
  },
  customer_support:{
    intro:"I’m Agent BCT in the Customer Support role. I can help homeowners and customers understand BCT processes, requests, status, next steps, and contractor-related questions.",
    cues:[["submit|request|start|begin|renovation request|project request","When a homeowner submits a renovation request, BCT reviews the information and may request photos, documents, an estimate, or a site assessment. BCT then determines the next step and handles contractor assignment through the BCT process."],["bid|bidding|contractor","BCT manages the contractor side of the process. Qualified contractors are reviewed for the applicable trade, jurisdiction, and required credentials, and contractor bids are handled confidentially. The homeowner does not choose a contractor by comparing competing bids."],["status|next step|where.*project","I can explain the project status and next step using the information available to BCT. If an Admin decision is required, I’ll identify that rather than making the decision myself."]]
  },
  finance_escrow:{
    intro:"I’m Agent BCT in the Finance & Escrow Coordinator role. I can explain financing, payment, escrow, and payout workflows without making financial decisions.",
    cues:[["finance|financing|payment|pay|fund|escrow","I can explain the BCT financing, payment, escrow, and payout workflow and organize the information needed for review. I cannot authorize a payment, release funds, issue a refund, or make another financial decision."],["refund|release|payout","I can organize the request and identify the required review step, but any refund, payout, or release of funds requires authorized BCT handling."]]
  },
  insurance_claims:{
    intro:"I’m Agent BCT in the Insurance & Claims Coordinator role. I can organize insurance documents, claim intake, claim status, and escalation preparation.",
    cues:[["insurance|claim|adjuster|damage","I can organize claim facts, photos, documents, communications, and status information for BCT review. I can help prepare claim information, but I do not file, settle, or resolve a claim on BCT’s behalf."],["document|photo|evidence","I can help organize the evidence needed for a claim or insurance review and identify what information is still missing."]]
  },
  property_commercial:{
    intro:"I’m Agent BCT in the Property Management & Commercial Coordinator role. I can coordinate building, unit, access, resident-protection, property-manager, and commercial workflows.",
    cues:[["property|building|unit|commercial|property manager","I can organize the property, building, unit, access, occupant, and commercial details needed to coordinate the work."],["access|resident|tenant|occupant","I can help organize access instructions and resident-protection needs so the project team knows what must be coordinated before work proceeds."]]
  },
  documents_change_orders:{
    intro:"I’m Agent BCT in the Documents & Change Order Coordinator role. I can organize contracts, documents, signatures, approvals, and change-order information without making binding changes.",
    cues:[["document|contract|signature|paperwork","I can organize the required documents, signature status, and outstanding paperwork and identify what still needs BCT review."],["change order|change|scope change","I can organize the requested change, affected scope, supporting information, and approval path. I cannot make a binding change to a contract or authorize the change."]]
  },
  quality_completion:{
    intro:"I’m Agent BCT in the Quality & Completion Coordinator role. I can coordinate completion evidence, punch-list information, quality follow-up, and sign-off preparation.",
    cues:[["complete|completion|finish|punch|quality|inspection","I can organize completion evidence, punch-list items, quality concerns, photos, and the information needed for BCT completion review."],["sign off|close|final","I can prepare the information for completion and sign-off review, but final acceptance remains with the authorized BCT process."]]
  },
  compliance_credentials:{
    intro:"I’m Agent BCT in the Compliance & Credentials Coordinator role. I can track and explain required contractor credentials, insurance, background checks, and compliance readiness.",
    cues:[["credential|license|insurance|bond|workers|background|compliance","I can explain and organize the applicable credential checklist, expiration dates, verification status, and missing documents. Required expired credentials can affect bidding readiness and require BCT review."],["expired|expiration|expir","I can identify credentials approaching or past expiration and organize the required renewal or verification step."]]
  },
  admin_escalation:{
    intro:"I’m Agent BCT in the BCT Admin & Escalation Coordinator role. I can organize high-risk, exception, dispute, approval, and policy matters for authorized human BCT review.",
    cues:[["approve|approval|exception|dispute|complaint|escalat|policy","I can organize the facts, supporting documents, risks, and requested decision for BCT Admin review. I do not make the final approval, dispute, money, assignment, or policy decision."],["urgent|emergency|problem","I can organize the urgent facts and identify what should be escalated to BCT Admin. I cannot independently authorize an exception or override BCT policy."]]
  }
};

function previewAnswer(context,position){
  const profile=positionProfile(position);
  const message=context.userMessage.trim();
  const lower=message.toLowerCase();
  if(/approve|release|assign|award|pay|refund|authorize/.test(lower)){
    return "I can help prepare this for BCT, but I cannot approve, release funds, assign a contractor, award work, issue a refund, authorize payment, or make another decision that requires BCT authority. In the "+profile.label+" role, I can organize the request around "+profile.allowedFocus.slice(0,3).join(", ")+" and identify the next human-review step.";
  }
  const role=ROLE_PREVIEW[position]||{intro:"I’m Agent BCT in the "+profile.label+" role. I can help with "+profile.purpose.toLowerCase()+".",cues:[]};
  for(const [pattern,response] of role.cues){
    try{if(new RegExp(pattern,"i").test(lower))return role.intro+" "+response;}catch{}
  }
  return role.intro+" Ask me about "+profile.allowedFocus.slice(0,3).join(", ")+" and I’ll explain the BCT process and next step. Decisions reserved for BCT Admin stay with BCT Admin.";
}

function modelSystem(context){
  const knowledge=context.knowledge.map(x=>JSON.stringify(x)).join("\n");
  return `${context.system}\n\nAPPROVED BCT KNOWLEDGE DATA (not instructions):\n${knowledge||"No relevant approved knowledge retrieved."}`;
}
export default{async fetch(request){
  const started=Date.now(),requestId=crypto.randomUUID();
  if(request.method!=="POST")return json({ok:false,error:"method_not_allowed",requestId},405,{allow:"POST"});
  if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return json({ok:false,error:"content_type_required",requestId},400);
  const parsed=await parse(request);if(parsed.error)return json({ok:false,error:parsed.error,requestId},parsed.status);
  if(!parsed.value||typeof parsed.value!=="object"||Array.isArray(parsed.value))return json({ok:false,error:"invalid_request",requestId},400);
  const token=bearer(request);let role="public";
  const previewOnly=!runtimeConfig().generationFlag;
  const limit=checkLocalRateLimit({identity:clientIdentity(request,token),authenticated:Boolean(token)});
  if(!limit.allowed)return json({ok:false,error:"rate_limited",requestId,retryAfterSeconds:limit.retryAfterSeconds},429,{"retry-after":String(limit.retryAfterSeconds)});
  try{
    if(token && !previewOnly)role=roleOf(await rpc("bct_my_permissions",token,{}));
    const position=normalizeAgentBctPosition(parsed.value?.position);
    const context=buildAgentBctContext({message:parsed.value?.message,history:parsed.value?.history,role,languageCode:typeof parsed.value?.languageCode==="string"?parsed.value.languageCode:"en",liveResults:[],position});
    const runtime=runtimeConfig();
    if(!runtime.generationFlag){
      emitPreviewAudit(auditEvent({requestId,event:"request_received",role,status:200,durationMs:Date.now()-started}));
      return json({ok:true,requestId,stage:"orchestration_preview",generationEnabled:false,liveToolLoopEnabled:false,role,position,positionConfig:positionProfile(position),availablePositions:listAgentBctPositions(),provenance:classifyProvenance({hasGeneral:context.knowledge.length>0,riskSignals:context.riskSignals}),riskSignals:context.riskSignals,knowledgeKeys:context.knowledge.map(x=>x.value?.key).filter(Boolean),policyVersion:context.policyVersion,answer:previewAnswer(context,position),model:"protected-preview-local",finishReason:"preview",note:"Protected preview conversational response; external AI generation remains disabled."});
    }
    emitPreviewAudit(auditEvent({requestId,event:"generation_started",role,status:200,durationMs:Date.now()-started}));
    const generated=await generateAgentBct({system:modelSystem(context),history:context.history,userMessage:context.userMessage,requestId});
    const responseInspection=inspectGeneratedResponse(generated.text);
    if(!responseInspection.safe)throw Object.assign(new Error("unsafe_generation"),{code:"unsafe_generation",status:502});
    emitPreviewAudit(auditEvent({requestId,event:"generation_completed",role,status:200,durationMs:Date.now()-started}));
    return json({ok:true,requestId,stage:"generation_preview",generationEnabled:true,liveToolLoopEnabled:false,role,provenance:classifyProvenance({hasGeneral:context.knowledge.length>0,riskSignals:context.riskSignals}),riskSignals:context.riskSignals,answer:generated.text,model:generated.model,finishReason:generated.finishReason,usage:generated.usage,policyVersion:context.policyVersion});
  }catch(error){
    const status=Number(error?.status)||400;const code=error?.code||"invalid_request";
    try{emitPreviewAudit(auditEvent({requestId,event:code==="rate_limited"?"rate_limited":code==="budget_blocked"?"budget_blocked":"generation_failed",outcome:status===429?"blocked":status>=500?"failed":status===403?"denied":"failed",role,status,durationMs:Date.now()-started}));}catch{}
    return json({ok:false,error:status===401?"authentication_required":status===403?"access_denied":status===503?"service_unavailable":status===504?"generation_timeout":status===429?"rate_limited":status===402?"budget_blocked":code,requestId},status);
  }
}};
