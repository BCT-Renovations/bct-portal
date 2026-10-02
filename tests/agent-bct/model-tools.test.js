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
