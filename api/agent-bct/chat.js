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
function previewAnswer(context,position){
  const profile=positionProfile(position);
  const focus=profile.allowedFocus.slice(0,3).join(", ");
  const message=context.userMessage.trim();
  const lower=message.toLowerCase();

  if(/approve|release|assign|award|pay|refund|authorize/.test(lower)){
    return "I can help prepare this for BCT, but I cannot approve, release funds, assign a contractor, or make another decision that requires BCT authority. In the " + profile.label + " role, I can organize the request around " + focus + " and identify the next human-review step.";
  }

  if(position === "customer_support"){
    if(/what can you help|what do you do|how can you help|help me/.test(lower)){
      return "I’m Agent BCT, your Customer Support assistant. I can help homeowners and customers understand how BCT works, explain what happens next with a request or project, explain status updates, organize questions or information for BCT, and help identify the right next step. I can also explain things in your preferred language. I cannot make BCT Admin decisions about pricing, contracts, contractor assignment, payments, refunds, or approvals."; 
    }
    if(/submit|request|start|begin|renovation request|project request/.test(lower)){
      return "When a homeowner submits a renovation request, BCT first reviews the information provided and determines what is needed to move the project forward. BCT may request photos, documents, an estimate, or a site assessment if more information is needed. After review, BCT determines the appropriate next step and handles contractor assignment through the BCT process. The homeowner does not choose a contractor based on competing bids. I can explain any step in that process in more detail."; 
    }
    if(/bid|bidding|contractor/.test(lower)){
      return "BCT manages the contractor side of the process. Qualified contractors are reviewed for the applicable trade, jurisdiction, and required credentials before they can participate. Contractor bids are handled confidentially by BCT; the homeowner does not select the contractor by comparing bids. I can explain what the homeowner sees next or what a contractor needs to do."; 
    }
    if(/status|next step|what happens next|where.*project|project.*where/.test(lower)){
      return "I can help explain a project’s status and next step using the information available to BCT. I can organize what has happened, what is still needed, and what normally comes next. If the next step requires an Admin decision, I’ll identify that rather than making the decision myself."; 
    }
    return "I’m Agent BCT in the Customer Support role. I can answer questions about BCT’s homeowner process, project requests, status and next steps, contractor-related process questions, and general BCT procedures. Ask me the specific question you want answered, and I’ll explain it directly."; 
  }

  return "I’m Agent BCT in the " + profile.label + " role. I can help with " + profile.purpose.toLowerCase() + " Based on your question, I’ll organize the relevant BCT information around " + focus + " and explain the next step. Decisions reserved for BCT Admin stay with BCT Admin.";
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
