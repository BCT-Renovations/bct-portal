import { internalToolName, schemasForInternalTools } from "./_model-tools.js";
import { listAgentBctTools, resolveAgentBctTool } from "./_tool-registry.js";
import { wrapUntrustedData } from "./_guardrails.js";

export const MAX_TOOL_STEPS=3;

export function modelToolsForRole(role){
  const names=listAgentBctTools(role).map(x=>x.name);
  return schemasForInternalTools(names);
}

export async function executeModelToolCall({call,role,executeRpc}){
  if(!["homeowner","contractor","admin"].includes(role))return{ok:false,error:"tool_role_denied"};
  if(typeof executeRpc!=="function")return{ok:false,error:"tool_executor_unavailable"};
  if(!call||typeof call!=="object"||Array.isArray(call))return{ok:false,error:"invalid_tool_call"};
  const internal=internalToolName(call.name);
  if(!internal)return{ok:false,error:"tool_not_allowed"};
  let args={};
  try{args=typeof call.arguments==="string"?JSON.parse(call.arguments):call.arguments||{};}catch{return{ok:false,error:"invalid_tool_arguments"};}
  if(!args||typeof args!=="object"||Array.isArray(args))return{ok:false,error:"invalid_tool_arguments"};
  const resolved=resolveAgentBctTool(internal,role,args);
  if(!resolved.ok)return{ok:false,error:resolved.error};
  let raw;
  try{raw=await executeRpc(resolved.rpc,resolved.args);}catch{return{ok:false,error:"tool_execution_failed",internalTool:internal,risk:resolved.risk};}
  return{
    ok:true,
    internalTool:internal,
    risk:resolved.risk,
    data:wrapUntrustedData(`tool:${internal}`,resolved.project(raw)),
  };
}

export async function boundedToolSequence({calls,role,executeRpc}){
  const source=Array.isArray(calls)?calls:[];
  if(source.length===0)return{ok:true,results:[]};
  if(source.length>MAX_TOOL_STEPS)return{ok:false,error:"too_many_tool_steps",results:[]};
  const results=[];
  for(const call of source){
    const result=await executeModelToolCall({call,role,executeRpc});
    results.push(result);
    if(!result.ok)break;
  }
  return{ok:results.every(x=>x.ok),results};
}
