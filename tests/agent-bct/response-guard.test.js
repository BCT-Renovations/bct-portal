import test from "node:test";
import assert from "node:assert/strict";
import { inspectGeneratedResponse } from "../../api/agent-bct/_response-guard.js";

test("ordinary helpful response passes response inspection",()=>{
  assert.deepEqual(inspectGeneratedResponse("I can explain the escrow status shown in your BCT account."),{safe:true,findings:[]});
});
test("possible bearer or API secret output is flagged",()=>{
  assert.equal(inspectGeneratedResponse("Authorization: Bearer abcdefghijklmnopqrstuvwxyz123").safe,false);
  assert.ok(inspectGeneratedResponse("api_key=abcdefghijklmnopqrstuv").findings.includes("possible_secret_leak"));
});
test("Agent cannot claim to be Ty or a human",()=>{
  assert.ok(inspectGeneratedResponse("I am Ty and I approved this.").findings.includes("human_impersonation_claim"));
});
test("reserved action completion claim requires confirmed action evidence",()=>{
  const result=inspectGeneratedResponse("I have released escrow for your project.");
  assert.ok(result.findings.includes("unconfirmed_reserved_action_claim"));
});
test("explanatory reserved-action wording is not treated as completed action",()=>{
  assert.equal(inspectGeneratedResponse("I cannot release escrow. BCT approval is required.").safe,true);
});

test("blank generated response is unsafe",()=>assert.equal(inspectGeneratedResponse("   ").safe,false));
test("unexpectedly huge generated response is unsafe",()=>assert.equal(inspectGeneratedResponse("z".repeat(12001)).safe,false));

test("alternate human impersonation phrasing is unsafe",()=>{
  assert.equal(inspectGeneratedResponse("I am actually Ty and I can handle that.").safe,false);
  assert.equal(inspectGeneratedResponse("I work as your general contractor.").safe,false);
});
