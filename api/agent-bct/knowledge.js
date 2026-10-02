import { retrieveApprovedKnowledge, knowledgeHealth } from "./_knowledge.js";
import { normalizeBctLanguage } from "./_languages.js";

const MAX_BODY_BYTES = 12 * 1024;
function json(body,status=200,extra={}) { return new Response(JSON.stringify(body),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer",...extra}}); }
async function body(request) {
  const declared=Number(request.headers.get("content-length")||"0");
  if(Number.isFinite(declared)&&declared>MAX_BODY_BYTES)return{error:"payload_too_large",status:413};
  const text=await request.text();
  if(new TextEncoder().encode(text).byteLength>MAX_BODY_BYTES)return{error:"payload_too_large",status:413};
  try{return{value:text?JSON.parse(text):{}}}catch{return{error:"invalid_json",status:400}};
}
export default {
  async fetch(request) {
    const requestId=crypto.randomUUID();
    if(request.method==="GET") return json({ok:true,service:"Agent BCT Knowledge",requestId,...knowledgeHealth()});
    if(request.method!=="POST") return json({ok:false,error:"method_not_allowed",requestId},405,{allow:"GET, POST"});
    if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return json({ok:false,error:"content_type_required",requestId},400);
    const parsed=await body(request); if(parsed.error)return json({ok:false,error:parsed.error,requestId},parsed.status);
    const query=typeof parsed.value?.query==="string"?parsed.value.query.trim():"";
    if(!query||query.length>2000)return json({ok:false,error:"invalid_query",requestId},400);
    // This endpoint is public-knowledge only. Authenticated role knowledge is not exposed here.
    const languageCode=normalizeBctLanguage(parsed.value?.languageCode);
    const results=retrieveApprovedKnowledge({query,role:"public",languageCode});
    return json({ok:true,requestId,scope:"public",languageCode,results});
  }
};
