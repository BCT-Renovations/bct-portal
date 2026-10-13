import test from "node:test";
import assert from "node:assert/strict";
import {projectEscalationReceipt} from "../../api/agent-bct/_escalation-receipt.js";
test("case receipt exposes only safe minimal fields",()=>{
  const r=projectEscalationReceipt({id:"1",case_number:"CASE-1",project_id:"p",case_type:"issue",category:"schedule",severity:"normal",status:"open",created_at:"2026-10-01",description:"private",internal_notes:"secret",opened_by:"user"});
  assert.deepEqual(Object.keys(r),["caseId","caseNumber","projectId","caseType","category","severity","status","createdAt"]);
  assert.equal(Object.hasOwn(r,"description"),false);
  assert.equal(Object.hasOwn(r,"internal_notes"),false);
});
test("malformed case receipt input fails closed",()=>{assert.equal(projectEscalationReceipt(null),null);assert.equal(projectEscalationReceipt([]),null);});

test("case receipt rejects malformed authority state instead of laundering it",()=>{
  assert.equal(projectEscalationReceipt({id:"1",case_type:"admin",severity:"critical",status:"approved"}),null);
  assert.equal(projectEscalationReceipt({id:"",case_type:"issue",severity:"normal",status:"open"}),null);
});
