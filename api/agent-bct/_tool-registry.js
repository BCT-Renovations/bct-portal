const TOOL_REGISTRY = Object.freeze({
  "service.list": spec("bct_active_services_localized", ["homeowner","contractor","admin"], input => ({ p_language_code: languageCode(input?.languageCode) }), rows(serviceSafe)),
  "identity.permissions": spec("bct_my_permissions", ["homeowner", "contractor", "admin"], () => ({}), identityPermissions),
  "project.list": spec("bct_my_project_summary_cards", ["homeowner"], () => ({}), rows(projectSummary), "medium"),
  "project.status": spec("bct_my_project_dashboard", ["homeowner"], input => ({ p_project_number: requiredText(input?.projectNumber, 80) }), projectDashboard, "medium"),
  "notification.list": spec("bct_my_notifications", ["homeowner", "contractor", "admin"], () => ({}), rows(notificationSafe), "medium"),
  "project.files": spec("bct_my_project_files", ["homeowner"], input => ({ p_project_id: optionalUuid(input?.projectId) }), rows(projectFileSafe), "medium"),
  "project.schedule": spec("bct_my_schedule", ["homeowner"], () => ({}), rows(scheduleSafe), "medium"),
  "project.schedule.upcoming": spec("bct_my_upcoming_schedule", ["homeowner"], () => ({}), rows(scheduleSafe), "medium"),
  "estimate.list": spec("bct_my_estimates_safe", ["homeowner"], () => ({}), rows(estimateSafe), "medium"),
  "contract.summary": spec("bct_my_contract_summary", ["homeowner"], () => ({}), contractSummary, "medium"),
  "financing.list": spec("bct_my_financing", ["homeowner"], () => ({}), rows(financingSafe), "high"),
  "escrow.list": spec("bct_my_escrow", ["homeowner"], () => ({}), rows(escrowSafe), "high"),
  "payment.list": spec("bct_my_payments", ["homeowner"], () => ({}), rows(paymentSafe), "high"),
  "contractor.dashboard": spec("bct_my_contractor_dashboard", ["contractor"], () => ({}), contractorDashboard, "medium"),
});

function spec(rpc, roles, args, project, risk = "low") {
  return Object.freeze({ rpc, roles, risk, write: false, args, project });
}
const MAX_TOOL_ROWS=50;
function rows(projector) {
  return value => Array.isArray(value) ? value.slice(0,MAX_TOOL_ROWS).map(projector) : [];
}
function requiredText(value, max) {
  if (typeof value !== "string") throw new ToolInputError("invalid_text");
  const clean = value.trim();
  if (!clean || clean.length > max) throw new ToolInputError("invalid_text");
  return clean;
}
function languageCode(value) {
  const code = typeof value === "string" ? value.trim().toLowerCase() : "en";
  return ["en","ar","zh","fr","ht","pt","ru","es","vi"].includes(code) ? code : "en";
}
function optionalUuid(value) {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new ToolInputError("invalid_uuid");
  }
  return value;
}
function pick(object, keys) {
  if (!object || typeof object !== "object" || Array.isArray(object)) return {};
  return Object.fromEntries(keys.filter(key => Object.hasOwn(object, key)).map(key => [key, object[key]]));
}
function identityPermissions(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { role: "unknown", permissions: [] };
  const role=["homeowner","contractor","admin"].includes(value.role)?value.role:"unknown";
  const permissions=Array.isArray(value.permissions)?value.permissions.filter(x=>typeof x==="string"&&/^[a-z0-9._:-]{1,80}$/i.test(x)).slice(0,100):[];
  return { role, permissions };
}
function serviceSafe(row) {
  return pick(row, ["code","display_name","category","sort_order"]);
}
function projectSummary(row) {
  return pick(row, ["id","project_number","workflow_status","verification_status","services","city","state","submitted_at","open_punch_items","pending_decisions","upcoming_events","active_warranties"]);
}
function projectDashboard(value) {
  return pick(value, ["project_id","project_number","workflow_status","verification_status","services","city","state","submitted_at","files","service_calls","open_service_calls","notifications","unread_notifications"]);
}
function notificationSafe(row) {
  return pick(row, ["id","project_id","notification_type","subject","message","channel","status","sent_at","created_at","read_at"]);
}
function projectFileSafe(row) {
  // Deliberately excludes storage_path and uploaded_by.
  return pick(row, ["id","project_id","original_filename","mime_type","file_size","created_at"]);
}
function scheduleSafe(row) {
  // Deliberately excludes free-form notes until content-injection handling is in the model layer.
  return pick(row, ["id","project_id","job_id","event_type","title","starts_at","ends_at","status","created_at","updated_at"]);
}
function estimateSafe(row) {
  return pick(row, ["id","project_id","estimate_number","version","status","subtotal","discount_percent","discount_amount","total","ai_assisted","ai_summary","assumptions","created_at","updated_at","approved_at"]);
}
function contractSummary(value) { return pick(value, ["contracts","executed","completed","total_amount"]); }
function financingSafe(row) {
  // Deliberately excludes provider identity/reference fields and free-form notes.
  return pick(row, ["id","project_id","status","approved_amount","customer_shared_approval","created_at","updated_at"]);
}
function escrowSafe(row) {
  // Deliberately excludes provider/external references and free-form notes.
  return pick(row, ["id","project_id","amount","status","homeowner_approved_release","bct_approved_release","funded_at","released_at","created_at","updated_at"]);
}
function paymentSafe(row) {
  // Deliberately excludes external_reference and free-form notes.
  return pick(row, ["id","project_id","contract_id","payment_number","payment_type","amount","status","due_date","paid_at","created_at","updated_at"]);
}
function contractorDashboard(value) {
  return pick(value, ["application_status","active_contractor","workforce_eligible","safety_training","available_jobs","my_bids","active_assignments","documents_pending","notifications_unread"]);
}

export class ToolInputError extends Error {
  constructor(code) { super(code); this.name = "ToolInputError"; }
}
export function listAgentBctTools(role) {
  return Object.entries(TOOL_REGISTRY)
    .filter(([, spec]) => !role || spec.roles.includes(role))
    .map(([name, spec]) => ({ name, roles: spec.roles, risk: spec.risk, write: spec.write, rpc: spec.rpc }));
}
export function resolveAgentBctTool(name, role, input) {
  const tool = TOOL_REGISTRY[name];
  if (!tool) return { ok: false, status: 404, error: "tool_not_allowed" };
  if (tool.write) return { ok: false, status: 403, error: "write_tool_disabled" };
  if (!tool.roles.includes(role)) return { ok: false, status: 403, error: "tool_role_denied" };
  try { return { ok: true, rpc: tool.rpc, args: tool.args(input), project: tool.project, risk: tool.risk }; }
  catch (error) {
    if (error instanceof ToolInputError) return { ok: false, status: 400, error: error.message };
    throw error;
  }
}
