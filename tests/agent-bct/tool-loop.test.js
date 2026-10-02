import test from "node:test";
import assert from "node:assert/strict";
import { MAX_TOOL_STEPS,modelToolsForRole,executeModelToolCall,boundedToolSequence } from "../../api/agent-bct/_tool-loop.js";

test("model tools are role filtered",()=>{
  const homeowner=modelToolsForRole("homeowner").map(x=>x.function.name);
  const contractor=modelToolsForRole("contractor").map(x=>x.function.name);
  assert.ok(homeowner.includes("payment_status"));
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
