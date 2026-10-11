import { normalizeAgentBctPosition, listAgentBctPositions } from "./_positions.js";

export const AGENT_BCT_ROLE_GROUPS = Object.freeze({
  client: Object.freeze(["customer_support", "project_manager", "finance_escrow", "assignment_scheduler"]),
  contractor: Object.freeze(["contractor_coordinator", "compliance_credentials", "project_manager", "assignment_scheduler", "admin_escalation"]),
  handyman: Object.freeze(["contractor_coordinator"]),
  estimator: Object.freeze(["estimator", "project_manager", "assignment_scheduler", "admin_escalation"]),
  admin: Object.freeze(listAgentBctPositions().map(position => position.key)),
});

export function normalizeAgentBctPortal(value) {
  const portal = typeof value === "string" ? value.trim().toLowerCase() : "";
  return Object.hasOwn(AGENT_BCT_ROLE_GROUPS, portal) ? portal : "client";
}

export function portalForAuthenticatedRole(role, requestedPortal = "client") {
  if (role === "admin") return "admin";
  const portal = normalizeAgentBctPortal(requestedPortal);
  if (portal === "admin") return "client";
  if (role === "contractor") {
    return portal === "handyman" || portal === "estimator" ? portal : "contractor";
  }
  return portal;
}

export function allowedPositionsForPortal(portal) {
  return [...(AGENT_BCT_ROLE_GROUPS[normalizeAgentBctPortal(portal)] || AGENT_BCT_ROLE_GROUPS.client)];
}

export function resolveAllowedAgentBctPosition({ position, role = "public", portal = "client" } = {}) {
  const effectivePortal = portalForAuthenticatedRole(role, portal);
  const allowed = allowedPositionsForPortal(effectivePortal);
  const requested = normalizeAgentBctPosition(position);
  return {
    position: allowed.includes(requested) ? requested : allowed[0],
    requestedPosition: requested,
    effectivePortal,
    allowedPositions: allowed,
  };
}
