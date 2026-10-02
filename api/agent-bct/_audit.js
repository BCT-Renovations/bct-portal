const SAFE_EVENT_CODES = new Set([
  "request_received","auth_succeeded","auth_failed","knowledge_retrieved",
  "tool_requested","tool_denied","tool_succeeded","tool_failed",
  "generation_started","generation_completed","generation_failed",
  "human_authority_required","rate_limited","budget_blocked"
]);

function clean(value,max=120) {
  return typeof value==="string" ? value.replace(/[\\r\\n\\u0000]/g," ").trim().slice(0,max) : "";
}
function safeToken(value,max=80){
  const cleaned=clean(value,max);
  return /^[a-z0-9._:-]*$/i.test(cleaned)?cleaned:"redacted";
}

export function auditEvent({requestId,event,outcome="ok",role="public",tool="",risk="",status=200,durationMs=0,build=""}) {
  if(!SAFE_EVENT_CODES.has(event)) throw new Error("invalid_audit_event");
  return {
    source:"agent-bct",
    requestId:safeToken(requestId,80),
    event,
    outcome:["ok","denied","failed","blocked","unavailable"].includes(clean(outcome,40))?clean(outcome,40):"failed",
    role:["public","homeowner","contractor","admin"].includes(role)?role:"public",
    tool:safeToken(tool,80),
    risk:safeToken(risk,20),
    status:Number.isInteger(Number(status))&&Number(status)>=100&&Number(status)<=599?Number(status):0,
    durationMs:Math.max(0,Math.min(Number(durationMs)||0,300000)),
    build:safeToken(build,80),
  };
}

export function emitPreviewAudit(event) {
  // Structured metadata only. Never pass request bodies, prompts, auth headers or tool data here.
  console.info(JSON.stringify(event));
}
