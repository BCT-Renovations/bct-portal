import test from "node:test";
import assert from "node:assert/strict";
import { auditEvent } from "../../api/agent-bct/_audit.js";

test("audit event accepts only fixed event codes",()=>{
  assert.throws(()=>auditEvent({event:"dump_all_secrets"}),/invalid_audit_event/);
});

test("audit event normalizes role and bounds scalar metadata",()=>{
  const e=auditEvent({requestId:"x".repeat(200),event:"tool_denied",role:"fake-admin",durationMs:999999,status:403,tool:"sql.execute"});
  assert.equal(e.role,"public");
  assert.equal(e.requestId.length,80);
  assert.equal(e.durationMs,300000);
  assert.equal(e.tool,"sql.execute");
  assert.equal(Object.hasOwn(e,"prompt"),false);
});
