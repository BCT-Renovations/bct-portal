import test from "node:test";
import assert from "node:assert/strict";
import { classifyProvenance,PROVENANCE } from "../../api/agent-bct/_provenance.js";
test("general knowledge without confirmed live result is general guidance",()=>assert.equal(classifyProvenance({hasGeneral:true}),PROVENANCE.GENERAL));
test("successful live evidence is live confirmed",()=>assert.equal(classifyProvenance({liveResults:[{ok:true}]}),PROVENANCE.LIVE));
test("general plus successful live evidence is mixed",()=>assert.equal(classifyProvenance({hasGeneral:true,liveResults:[{ok:true}]}),PROVENANCE.MIXED));
test("failed live result never becomes live confirmed",()=>assert.equal(classifyProvenance({liveResults:[{ok:false}]}),PROVENANCE.GENERAL));
test("reserved authority risk requires human review regardless of live data",()=>assert.equal(classifyProvenance({liveResults:[{ok:true}],riskSignals:["financial_authority"]}),PROVENANCE.REVIEW));
test("unavailable state is explicit",()=>assert.equal(classifyProvenance({unavailable:true}),PROVENANCE.UNAVAILABLE));
