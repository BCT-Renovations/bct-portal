import test from "node:test";
import assert from "node:assert/strict";
import {prepareEscalation,escalationLabels,escalationFingerprint,escalationRpcArgs} from "../../api/agent-bct/_escalation.js";
test("escalation preparation requires explicit confirmation",()=>assert.equal(prepareEscalation({label:"project_question",subject:"Question",description:"Need help"}).error,"confirmation_required"));
test("Agent labels map only to existing BCT case enums",()=>{
  for(const label of escalationLabels()){
    const r=prepareEscalation({label,confirmed:true,subject:"Need review",description:"Please review this matter."});
    assert.equal(r.ok,true);
    assert.ok(["issue","dispute"].includes(r.caseType));
    assert.ok(["scope","quality","schedule","payment","contractor","customer","materials","property_damage","communication","safety","other"].includes(r.category));
  }
});
test("critical severity cannot be self-declared by Agent preparation",()=>assert.equal(prepareEscalation({label:"safety_concern",severity:"critical",confirmed:true,subject:"Safety",description:"Review"}).error,"invalid_escalation_severity"));
test("escalation text is bounded and strips control characters",()=>{
  const r=prepareEscalation({confirmed:true,subject:" A\nB ",description:"x".repeat(2000)});
  assert.equal(r.subject,"A B");assert.equal(r.description.length,1200);
});
test("unknown conversational escalation label fails closed",()=>assert.equal(prepareEscalation({label:"refund_approved",confirmed:true,subject:"x",description:"y"}).error,"invalid_escalation_label"));

test("same escalation content has deterministic duplicate fingerprint",()=>{
  const p={label:"schedule_issue",severity:"normal",subject:" Schedule ",description:"Please review",projectId:"abc_123",jobId:"job-7"};
  assert.equal(escalationFingerprint(p),escalationFingerprint({...p,subject:"schedule"}));
});
test("different project changes escalation fingerprint",()=>{
  const p={label:"payment_question",subject:"Payment",description:"Please review"};
  assert.notEqual(escalationFingerprint({...p,projectId:"one"}),escalationFingerprint({...p,projectId:"two"}));
});
test("unsafe project and job identifiers are not carried into prepared payload",()=>{
  const r=prepareEscalation({confirmed:true,subject:"Question",description:"Review",projectId:"id\nsecret",jobId:"id:bad"});
  assert.equal(r.projectId,"");assert.equal(r.jobId,"");
});

test("escalation RPC arguments contain only the narrow existing case contract",()=>{
  const prepared=prepareEscalation({confirmed:true,label:"schedule_issue",severity:"high",subject:"Schedule",description:"Please review",projectId:"abc",jobId:"job_1"});
  assert.deepEqual(Object.keys(escalationRpcArgs(prepared)).sort(),["p_case_type","p_category","p_description","p_job_id","p_project_id","p_severity","p_subject"].sort());
  assert.equal(escalationRpcArgs({ok:false}),null);
});
