import test from "node:test";
import assert from "node:assert/strict";
import {prepareEscalation,escalationLabels} from "../../api/agent-bct/_escalation.js";
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
