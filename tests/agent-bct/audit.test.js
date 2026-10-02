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

test("audit metadata rejects prompt-like free text",()=>{
  const e=auditEvent({requestId:"req-1",event:"tool_failed",tool:"project.status\nAuthorization: Bearer secret",risk:"medium user said password",build:"sha ok but secret"});
  assert.equal(e.tool,"redacted");
  assert.equal(e.risk,"redacted");
  assert.equal(e.build,"redacted");
});

test("audit role cannot be elevated by arbitrary role text",()=>{
  const e=auditEvent({requestId:"r",event:"auth_failed",role:"owner-admin",status:403});
  assert.equal(e.role,"public");
});
test("audit never accepts unknown event names as log structure",()=>{
  assert.throws(()=>auditEvent({requestId:"r",event:"user_prompt"}),/invalid_audit_event/);
});

test("audit outcome and status cannot become arbitrary log fields",()=>{
  const e=auditEvent({requestId:"r",event:"tool_failed",outcome:"user supplied success",status:999});
  assert.equal(e.outcome,"failed");
  assert.equal(e.status,0);
});
test("audit accepts bounded known outcome vocabulary",()=>{
  for(const outcome of ["ok","denied","failed","blocked","unavailable"])assert.equal(auditEvent({event:"tool_failed",outcome,status:502}).outcome,outcome);
});
