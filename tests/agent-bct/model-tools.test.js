import test from "node:test";
import assert from "node:assert/strict";
import { MODEL_TOOL_SCHEMAS,internalToolName,schemasForInternalTools } from "../../api/agent-bct/_model-tools.js";

test("model schemas never expose database RPC names",()=>{
  const serialized=JSON.stringify(MODEL_TOOL_SCHEMAS);
  assert.equal(serialized.includes("bct_my_"),false);
  assert.equal(serialized.includes("sql"),false);
});
test("unknown model tool cannot map to internal tool",()=>assert.equal(internalToolName("run_sql"),null));
test("role-filtered schema helper exposes only supplied internal tools",()=>{
  const list=schemasForInternalTools(["contractor.dashboard"]);
  assert.deepEqual(list.map(x=>x.function.name),["contractor_dashboard"]);
});

test("public model schema can expose only the safe service catalog read",()=>{
  const list=schemasForInternalTools(["service.list"]);
  assert.deepEqual(list.map(x=>x.function.name),["service_list"]);
  assert.equal(internalToolName("service_list"),"service.list");
});

test("malformed model tool allowlist fails closed",()=>{
  assert.deepEqual(schemasForInternalTools("service.list"),[]);
  assert.deepEqual(schemasForInternalTools(null),[]);
  assert.deepEqual(schemasForInternalTools([null,{},42]),[]);
});
