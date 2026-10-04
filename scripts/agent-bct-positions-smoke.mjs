import fs from "node:fs";
import assert from "node:assert/strict";

const positions=fs.readFileSync(new URL("../api/agent-bct/_positions.js",import.meta.url),"utf8");
const context=fs.readFileSync(new URL("../api/agent-bct/_context.js",import.meta.url),"utf8");
const policy=fs.readFileSync(new URL("../api/agent-bct/_policy.js",import.meta.url),"utf8");
const chat=fs.readFileSync(new URL("../api/agent-bct/chat.js",import.meta.url),"utf8");
const session=fs.readFileSync(new URL("../api/agent-bct/session.js",import.meta.url),"utf8");

const keys=[
  "project_manager","estimator","contractor_coordinator","assignment_scheduler",
  "customer_support","finance_escrow","insurance_claims","property_commercial",
  "documents_change_orders","quality_completion","compliance_credentials","admin_escalation"
];
for(const key of keys) assert.match(positions,new RegExp("\\b"+key+"\\s*:"));
assert.equal((positions.match(/voiceProfile:/g)||[]).length,12,"every position must define a voice profile");
assert.match(positions,/availablePositionCount|listAgentBctPositions/);
assert.match(context,/normalizeAgentBctPosition/);
assert.match(context,/positionProfile/);
assert.match(context,/positionConfig/);
assert.match(policy,/position changes communication focus and voice configuration only/);
assert.match(chat,/parsed\.value\?\.position/);
assert.match(chat,/availablePositions:listAgentBctPositions\(\)/);
assert.match(session,/availablePositionCount: AGENT_POSITION_KEYS\.length/);
assert.match(session,/positionProfilesEnabled: true/);
console.log("Agent BCT multi-position smoke passed: 12 positions, 12 voice profiles, persona-only authority boundary.");
