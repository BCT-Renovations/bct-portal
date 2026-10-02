import { buildAgentBctContext } from "./_context.js";

const MAX_BODY_BYTES = 32 * 1024;

function json(body,status=200,extra={}) {
  return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...extra}});
}
function bearer(request) {
  const m=(request.headers.get("authorization")||"").match(/^Bearer\\s+(.+)$/i); return m?m[1].trim():"";
}
async function parse(request) {
  const declared=Number(request.headers.get("content-length")||"0");
  if(Number.isFinite(declared)&&declared>MAX_BODY_BYTES)return{error:"payload_too_large",status:413};
  const text=await request.text();
  if(new TextEncoder().encode(text).byteLength>MAX_BODY_BYTES)return{error:"payload_too_large",status:413};
  try{return{value:text?JSON.parse(text):{}}}catch{return{error:"invalid_json",status:400}};
}
function cfg() {
  const url=(process.env.SUPABASE_URL||"").replace(/\\/$/,"");
  const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_ANON_KEY||"";
  if(!url||!key)throw Object.assign(new Error("service_unavailable"),{status:503});
  return{url,key};
}
async function rpc(name,token,args={}) {
  const {url,key}=cfg();
  const res=await fetch(`${url}/rest/v1/rpc/${name}`,{method:"POST",headers:{apikey:key,authorization:`Bearer ${token}`,"content-type":"application/json"},body:JSON.stringify(args)});
  const text=await res.text(); let data=null; try{data=text?JSON.parse(text):null}catch{}
  if(!res.ok)throw Object.assign(new Error("backend_request_failed"),{status:res.status===401?401:res.status===403?403:502});
  return data;
}
function roleOf(value) {
  const role=value&&typeof value.role==="string"?value.role:"";
  return ["homeowner","contractor","admin"].includes(role)?role:"homeowner";
}
export default {
  async fetch(request) {
    const requestId=crypto.randomUUID();
    if(request.method!=="POST")return json({ok:false,error:"method_not_allowed",requestId},405,{allow:"POST"});
    if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return json({ok:false,error:"content_type_required",requestId},400);
    const parsed=await parse(request); if(parsed.error)return json({ok:false,error:parsed.error,requestId},parsed.status);
    const token=bearer(request);
    let role="public";
    try {
      if(token) role=roleOf(await rpc("bct_my_permissions",token,{}));
      const context=buildAgentBctContext({
        message:parsed.value?.message,
        history:parsed.value?.history,
        role,
        languageCode:typeof parsed.value?.languageCode==="string"?parsed.value.languageCode:"en",
        liveResults:[], // Model-directed live tools are intentionally not connected yet.
      });
      return json({
        ok:true,
        requestId,
        stage:"orchestration_preview",
        generationEnabled:false,
        liveToolLoopEnabled:false,
        role,
        riskSignals:context.riskSignals,
        knowledgeKeys:context.knowledge.map(x=>x.value?.key).filter(Boolean),
        policyVersion:context.policyVersion,
        note:"Context assembled safely. Model generation is intentionally disabled until Gateway preview configuration is verified.",
      });
    } catch(error) {
      const status=Number(error?.status)||400;
      return json({ok:false,error:status===401?"authentication_required":status===403?"access_denied":status===503?"service_unavailable":"invalid_request",requestId},status);
    }
  }
};
