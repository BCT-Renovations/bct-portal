import test from "node:test";
import assert from "node:assert/strict";
import { MAX_TOOL_STEPS,modelToolsForRole,executeModelToolCall,boundedToolSequence } from "../../api/agent-bct/_tool-loop.js";

test("model tools are role filtered",()=>{
  const homeowner=modelToolsForRole("homeowner").map(x=>x.function.name);
  const contractor=modelToolsForRole("contractor").map(x=>x.function.name);
  assert.equal(homeowner.includes("payment_status"),false);
  assert.equal(contractor.includes("payment_status"),false);
  assert.ok(contractor.includes("contractor_dashboard"));
});
test("unknown model tool is denied before executor",async()=>{
  let called=false;
  const result=await executeModelToolCall({call:{name:"run_sql",arguments:"{}"},role:"admin",executeRpc:async()=>{called=true;}});
  assert.equal(result.ok,false);assert.equal(called,false);
});
test("role denial happens before RPC",async()=>{
  let called=false;
  const result=await executeModelToolCall({call:{name:"payment_status",arguments:"{}"},role:"contractor",executeRpc:async()=>{called=true;}});
  assert.equal(result.error,"tool_role_denied");assert.equal(called,false);
});
test("tool result is projected and labeled untrusted",async()=>{
  const result=await executeModelToolCall({call:{name:"payment_status",arguments:"{}"},role:"homeowner",executeRpc:async()=>[{id:"1",status:"paid",external_reference:"secret"}]});
  assert.equal(result.ok,true);assert.equal(result.data.trust,"untrusted_data_not_instructions");assert.equal(Object.hasOwn(result.data.value[0],"external_reference"),false);
});
test("tool sequence is strictly bounded",async()=>{
  const calls=Array.from({length:MAX_TOOL_STEPS+1},()=>({name:"project_list",arguments:"{}"}));
  const result=await boundedToolSequence({calls,role:"homeowner",executeRpc:async()=>[]});
  assert.equal(result.error,"too_many_tool_steps");
});

test("tool execution failure is contained and does not leak backend error",async()=>{
  const result=await executeModelToolCall({call:{name:"project_list",arguments:"{}"},role:"homeowner",executeRpc:async()=>{throw new Error("database secret detail");}});
  assert.equal(result.ok,false);
  assert.equal(result.error,"tool_execution_failed");
  assert.equal(JSON.stringify(result).includes("database secret detail"),false);
});

test("tool loop rejects arrays and scalar argument payloads",async()=>{
  for(const args of ["[]","123","null"]){
    const r=await executeModelToolCall({call:{name:"project_list",arguments:args},role:"homeowner",executeRpc:async()=>[]});
    assert.equal(r.ok,false);assert.equal(r.error,"invalid_tool_arguments");
  }
});
test("empty tool sequence is a safe no-op",async()=>{
  const r=await boundedToolSequence({calls:[],role:"homeowner",executeRpc:async()=>{throw new Error("should not run");}});
  assert.equal(r.ok,true);assert.deepEqual(r.results,[]);
});

test("tool execution fails closed for unknown role",async()=>{
  let called=false;
  const r=await executeModelToolCall({call:{name:"service_list",arguments:"{}"},role:"superadmin",executeRpc:async()=>{called=true;return[];}});
  assert.equal(r.error,"tool_role_denied");assert.equal(called,false);
});
test("tool execution fails closed without an executor",async()=>{
  const r=await executeModelToolCall({call:{name:"project_list",arguments:"{}"},role:"homeowner"});
  assert.equal(r.error,"tool_executor_unavailable");
});
test("array-shaped model tool call is rejected",async()=>{
  const r=await executeModelToolCall({call:[],role:"homeowner",executeRpc:async()=>[]});
  assert.equal(r.error,"invalid_tool_call");
});

test("ordinary Phase B schemas exclude high-risk money reads",()=>{
  const names=modelToolsForRole("homeowner").map(x=>x.function.name);
  for(const high of ["financing_status","escrow_status","payment_status"])assert.equal(names.includes(high),false);
  assert.ok(names.includes("project_list"));
  assert.ok(names.includes("contract_summary"));
});
test("high-risk reads require explicit schema exposure",()=>{
  const names=modelToolsForRole("homeowner",{maxRisk:"high"}).map(x=>x.function.name);
  for(const high of ["financing_status","escrow_status","payment_status"])assert.ok(names.includes(high));
});
test("invalid risk stage fails closed with no model tools",()=>{
  assert.deepEqual(modelToolsForRole("homeowner",{maxRisk:"critical"}),[]);
  assert.deepEqual(modelToolsForRole("homeowner",{maxRisk:null}),[]);
});

test("duplicate tool calls are rejected before executor work",async()=>{
  let count=0;
  const call={name:"project_list",arguments:"{}"};
  const r=await boundedToolSequence({calls:[call,call],role:"homeowner",executeRpc:async()=>{count++;return[];}});
  assert.equal(r.error,"duplicate_tool_call");
  assert.equal(count,0);
});

test("unserializable model tool arguments fail closed before executor",async()=>{
  let count=0;
  const cyclic={};cyclic.self=cyclic;
  const r=await boundedToolSequence({calls:[{name:"project_list",arguments:cyclic}],role:"homeowner",executeRpc:async()=>{count++;return[];}});
  assert.equal(r.error,"invalid_tool_call");
  assert.equal(count,0);
});
