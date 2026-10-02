const TOOL_REGISTRY = Object.freeze({
  "identity.permissions": Object.freeze({
    rpc: "bct_my_permissions",
    roles: ["homeowner", "contractor", "admin"],
    risk: "low",
    write: false,
    args: () => ({}),
    project: (value) => value,
  }),
  "project.list": Object.freeze({
    rpc: "bct_my_project_summary_cards",
    roles: ["homeowner"],
    risk: "medium",
    write: false,
    args: () => ({}),
    // Do not expose arbitrary database columns. Keep a small project navigation/status view.
    project: (rows) => Array.isArray(rows) ? rows.map(projectSummary) : rows,
  }),
  "project.status": Object.freeze({
    rpc: "bct_my_project_dashboard",
    roles: ["homeowner"],
    risk: "medium",
    write: false,
    args: (input) => ({ p_project_number: requiredText(input?.projectNumber, 80) }),
    project: projectDashboard,
  }),
  "estimate.list": Object.freeze({
    rpc: "bct_my_estimates_safe",
    roles: ["homeowner"],
    risk: "medium",
    write: false,
    args: () => ({}),
    project: (rows) => Array.isArray(rows) ? rows.map(estimateSafe) : [],
  }),
  "contract.summary": Object.freeze({
    rpc: "bct_my_contract_summary",
    roles: ["homeowner"],
    risk: "medium",
    write: false,
    args: () => ({}),
    project: contractSummary,
  }),
  "contractor.dashboard": Object.freeze({
    rpc: "bct_my_contractor_dashboard",
    roles: ["contractor"],
    risk: "medium",
    write: false,
    args: () => ({}),
    project: contractorDashboard,
  }),
});

function requiredText(value, max) {
  if (typeof value !== "string") throw new ToolInputError("invalid_text");
  const clean = value.trim();
  if (!clean || clean.length > max) throw new ToolInputError("invalid_text");
  return clean;
}

function pick(object, keys) {
  if (!object || typeof object !== "object") return {};
  return Object.fromEntries(keys.filter((key) => Object.hasOwn(object, key)).map((key) => [key, object[key]]));
}

function projectSummary(row) {
  return pick(row, [
    "id", "project_number", "workflow_status", "verification_status",
    "services", "city", "state", "submitted_at",
    "open_punch_items", "pending_decisions", "upcoming_events", "active_warranties",
  ]);
}

function projectDashboard(value) {
  return pick(value, [
    "project_id", "project_number", "workflow_status", "verification_status",
    "services", "city", "state", "submitted_at",
    "files", "service_calls", "open_service_calls", "notifications", "unread_notifications",
  ]);
}

function estimateSafe(row) {
  return pick(row, [
    "id", "project_id", "estimate_number", "version", "status",
    "subtotal", "discount_percent", "discount_amount", "total",
    "ai_assisted", "ai_summary", "assumptions", "created_at", "updated_at", "approved_at",
  ]);
}

function contractSummary(value) {
  return pick(value, ["contracts", "executed", "completed", "total_amount"]);
}

function contractorDashboard(value) {
  return pick(value, [
    "application_status", "active_contractor", "workforce_eligible",
    "safety_training", "available_jobs", "my_bids", "active_assignments",
    "documents_pending", "notifications_unread",
  ]);
}

export class ToolInputError extends Error {
  constructor(code) {
    super(code);
    this.name = "ToolInputError";
  }
}

export function listAgentBctTools() {
  return Object.entries(TOOL_REGISTRY).map(([name, spec]) => ({
    name,
    roles: spec.roles,
    risk: spec.risk,
    write: spec.write,
  }));
}

export function resolveAgentBctTool(name, role, input) {
  const spec = TOOL_REGISTRY[name];
  if (!spec) return { ok: false, status: 404, error: "tool_not_allowed" };
  if (spec.write) return { ok: false, status: 403, error: "write_tool_disabled" };
  if (!spec.roles.includes(role)) return { ok: false, status: 403, error: "tool_role_denied" };

  try {
    return { ok: true, rpc: spec.rpc, args: spec.args(input), project: spec.project };
  } catch (error) {
    if (error instanceof ToolInputError) return { ok: false, status: 400, error: error.message };
    throw error;
  }
}
