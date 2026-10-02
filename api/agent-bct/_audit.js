const SAFE_EVENT_CODES = new Set([
  "request_received","auth_succeeded","auth_failed","knowledge_retrieved",
  "tool_requested","tool_denied","tool_succeeded","tool_failed",
  "generation_started","generation_completed","generation_failed",
  "human_authority_required","rate_limited","budget_blocked"
]);

function clean(value,max=120) {
  return typeof value==="string" ? value.replace(/[\r\n\u0000]/g," ").trim().slice(0,max) : "";
}

export function auditEvent({requestId,event,outcome="ok",role="public",tool="",risk="",status=200,durationMs=0,build=""}) {
  if(!SAFE_EVENT_CODES.has(event)) throw new Error("invalid_audit_event");
  return {
    source:"agent-bct",
    requestId:clean(requestId,80),
    event,
    outcome:clean(outcome,40),
    role:["public","homeowner","contractor","admin"].includes(role)?role:"public",
    tool:clean(tool,80),
    risk:clean(risk,20),
    status:Number.isFinite(Number(status))?Number(status):0,
    durationMs:Math.max(0,Math.min(Number(durationMs)||0,300000)),
    build:clean(build,80),
  };
}

export function emitPreviewAudit(event) {
  // Structured metadata only. Never pass request bodies, prompts, auth headers or tool data here.
  console.info(JSON.stringify(event));
}
