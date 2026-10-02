const GATEWAY_BASE="https://ai-gateway.vercel.sh/v1";
const DEFAULT_TIMEOUT_MS=25_000;
const MAX_OUTPUT_TOKENS=900;
const ALLOWED_MODEL_ID=/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._:-]*$/i;

function required(name){
  const value=String(process.env[name]||"").trim();
  if(!value) throw Object.assign(new Error("runtime_not_configured"),{code:"runtime_not_configured",status:503});
  return value;
}
function boundedText(value,max){
  return typeof value==="string"?value.slice(0,max):"";
}
function safeUsage(value){const n=Number(value);return Number.isFinite(n)&&n>=0?Math.min(Math.floor(n),10_000_000):0;}
export function runtimeConfig(){
  return {
    model:String(process.env.AGENT_BCT_MODEL||"").trim(),
    gatewayConfigured:Boolean(String(process.env.AI_GATEWAY_API_KEY||"").trim()),
    generationFlag:String(process.env.AGENT_BCT_GENERATION_ENABLED||"").toLowerCase()==="true",
    base:GATEWAY_BASE,
  };
}
export async function generateAgentBct({system,history=[],userMessage,requestId}){
  const cfg=runtimeConfig();
  if(!cfg.generationFlag) throw Object.assign(new Error("generation_disabled"),{code:"generation_disabled",status:503});
  const apiKey=required("AI_GATEWAY_API_KEY");
  const model=required("AGENT_BCT_MODEL");
  if(!ALLOWED_MODEL_ID.test(model)) throw Object.assign(new Error("runtime_not_configured"),{code:"runtime_not_configured",status:503});

  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),DEFAULT_TIMEOUT_MS);
  try{
    const messages=[
      {role:"system",content:boundedText(system,14000)},
      ...history.slice(-12).map(x=>({role:x.role==="assistant"?"assistant":"user",content:boundedText(x.content,6000)})),
      {role:"user",content:boundedText(userMessage,6000)},
    ];
    const response=await fetch(`${GATEWAY_BASE}/chat/completions`,{
      method:"POST",
      signal:controller.signal,
      headers:{
        authorization:`Bearer ${apiKey}`,
        "content-type":"application/json",
        "x-agent-bct-request-id":boundedText(requestId,80),
      },
      body:JSON.stringify({
        model,
        messages,
        stream:false,
        max_completion_tokens:MAX_OUTPUT_TOKENS,
      }),
    });
    const text=await response.text();
    let payload=null; try{payload=text?JSON.parse(text):null}catch{}
    if(!response.ok){
      const status=response.status===402?402:response.status===429?429:response.status>=500?503:502;
      const code=response.status===402?"budget_blocked":response.status===429?"rate_limited":"generation_failed";
      throw Object.assign(new Error(code),{code,status});
    }
    if(!payload||typeof payload!=="object"||!Array.isArray(payload.choices)) throw Object.assign(new Error("invalid_generation_response"),{code:"invalid_generation_response",status:502});
    const answer=payload?.choices?.[0]?.message?.content;
    if(payload?.choices?.[0]?.message?.tool_calls?.length) throw Object.assign(new Error("unexpected_tool_call"),{code:"unexpected_tool_call",status:502});
    if(typeof answer!=="string"||!answer.trim()) throw Object.assign(new Error("empty_generation"),{code:"empty_generation",status:502});
    return {
      text:answer.trim(),
      model:typeof payload?.model==="string"?payload.model:model,
      finishReason:payload?.choices?.[0]?.finish_reason||null,
      usage:payload?.usage?{
        promptTokens:safeUsage(payload.usage.prompt_tokens),
        completionTokens:safeUsage(payload.usage.completion_tokens),
        totalTokens:safeUsage(payload.usage.total_tokens),
      }:null,
    };
  }catch(error){
    if(error?.name==="AbortError") throw Object.assign(new Error("generation_timeout"),{code:"generation_timeout",status:504});
    throw error;
  }finally{clearTimeout(timeout);}
}
