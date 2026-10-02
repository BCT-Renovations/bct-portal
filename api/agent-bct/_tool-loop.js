import { internalToolName, schemasForInternalTools } from "./_model-tools.js";
import { listAgentBctTools, resolveAgentBctTool } from "./_tool-registry.js";
import { wrapUntrustedData } from "./_guardrails.js";

export const MAX_TOOL_STEPS=3;

const RISK_ORDER=Object.freeze({low:0,medium:1,high:2});
export function modelToolsForRole(role,{maxRisk="medium"}={}){
  if(!Object.hasOwn(RISK_ORDER,maxRisk))return[];
  const names=listAgentBctTools(role).filter(x=>Object.hasOwn(RISK_ORDER,x.risk)&&RISK_ORDER[x.risk]<=RISK_ORDER[maxRisk]).map(x=>x.name);
  return schemasForInternalTools(names);
}

export async function executeModelToolCall({call,role,executeRpc,maxRisk="medium"}){
  if(!["homeowner","contractor","admin"].includes(role))return{ok:false,error:"tool_role_denied"};
  if(typeof role!=="string")return{ok:false,error:"tool_role_denied"};
  if(typeof executeRpc!=="function")return{ok:false,error:"tool_executor_unavailable"};
  if(!Object.hasOwn(RISK_ORDER,maxRisk))return{ok:false,error:"invalid_tool_risk_stage"};
  if(!call||typeof call!=="object"||Array.isArray(call))return{ok:false,error:"invalid_tool_call"};
  const internal=internalToolName(call.name);
  if(!internal)return{ok:false,error:"tool_not_allowed"};
  let args={};
  try{args=typeof call.arguments==="string"?JSON.parse(call.arguments):call.arguments||{};}catch{return{ok:false,error:"invalid_tool_arguments"};}
  if(!args||typeof args!=="object"||Array.isArray(args))return{ok:false,error:"invalid_tool_arguments"};
  const resolved=resolveAgentBctTool(internal,role,args);
  if(!resolved.ok)return{ok:false,error:resolved.error};
  if(!Object.hasOwn(RISK_ORDER,resolved.risk)||RISK_ORDER[resolved.risk]>RISK_ORDER[maxRisk])return{ok:false,error:"tool_risk_denied"};
  let raw;
  try{raw=await executeRpc(resolved.rpc,resolved.args);}catch{return{ok:false,error:"tool_execution_failed",internalTool:internal,risk:resolved.risk};}
  return{
    ok:true,
    internalTool:internal,
    risk:resolved.risk,
    data:wrapUntrustedData(`tool:${internal}`,resolved.project(raw)),
  };
}

export async function boundedToolSequence({calls,role,executeRpc,maxRisk="medium"}){
  const source=Array.isArray(calls)?calls:[];
  if(source.length>MAX_TOOL_STEPS)return{ok:false,error:"too_many_tool_steps",results:[]};
  const signatures=new Set();
  for(const call of source){
    let signature="invalid";
    try{signature=call&&typeof call==="object"&&!Array.isArray(call)?`${String(call.name||"")}:${typeof call.arguments==="string"?call.arguments:JSON.stringify(call.arguments||{})}`:"invalid";}catch{return{ok:false,error:"invalid_tool_call",results:[]};}
    if(signatures.has(signature))return{ok:false,error:"duplicate_tool_call",results:[]};
    signatures.add(signature);
  }
  if(source.length===0)return{ok:true,results:[]};
  const results=[];
  let highRiskReads=0;
  for(const call of source){
    if(maxRisk==="high"&&call&&typeof call==="object"&&!Array.isArray(call)){
      const internal=internalToolName(call.name);
      const listed=listAgentBctTools(role).find(x=>x.name===internal);
      if(listed?.risk==="high"&&highRiskReads>=1)return{ok:false,error:"too_many_high_risk_tools",results};
    }
    const result=await executeModelToolCall({call,role,executeRpc,maxRisk});
    results.push(result);
    if(result.ok&&result.risk==="high")highRiskReads+=1;
    if(!result.ok)break;
  }
  return{ok:results.every(x=>x.ok),results};
}
