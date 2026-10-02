import { listAgentBctTools, resolveAgentBctTool } from "./_tool-registry.js";

const VERSION = "agent-bct-2026.10.01-tool-executor-1";
const MAX_BODY_BYTES = 24 * 1024;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}
function requestId() { return crypto.randomUUID(); }
function bearerToken(request) {
  const match = (request.headers.get("authorization") || "").match(/^Bearer\\s+(.+)$/i);
  return match ? match[1].trim() : "";
}
async function smallJson(request) {
  const declared = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return { error: "payload_too_large", status: 413 };
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) return { error: "payload_too_large", status: 413 };
  try { return { value: text ? JSON.parse(text) : {} }; }
  catch { return { error: "invalid_json", status: 400 }; }
}
function config() {
  const url = (process.env.SUPABASE_URL || "").replace(/\\/$/, "");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !key) throw Object.assign(new Error("service_unavailable"), { status: 503 });
  return { url, key };
}
async function rpc(name, token, args = {}) {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!response.ok) {
    const status = response.status === 401 ? 401 : response.status === 403 ? 403 : response.status === 404 ? 404 : 502;
    throw Object.assign(new Error("backend_request_failed"), { status });
  }
  return data;
}
function normalizedRole(permissions) {
  const role = permissions && typeof permissions.role === "string" ? permissions.role : "";
  return ["homeowner", "contractor", "admin"].includes(role) ? role : "homeowner";
}

export default {
  async fetch(request) {
    const id = requestId();
    if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed", requestId: id }, 405, { allow: "POST" });
    if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: "content_type_required", requestId: id }, 400);
    }
    const token = bearerToken(request);
    if (!token) return json({ ok: false, error: "authentication_required", requestId: id }, 401);
    const parsed = await smallJson(request);
    if (parsed.error) return json({ ok: false, error: parsed.error, requestId: id }, parsed.status);

    try {
      // Always resolve role/permissions from BCT backend first. Client-supplied role is ignored.
      const permissions = await rpc("bct_my_permissions", token, {});
      const role = normalizedRole(permissions);
      const toolName = typeof parsed.value?.tool === "string" ? parsed.value.tool : "";
      if (!toolName) {
        return json({ ok: true, requestId: id, role, tools: listAgentBctTools(role), writeToolsEnabled: false });
      }

      const resolved = resolveAgentBctTool(toolName, role, parsed.value?.input || {});
      if (!resolved.ok) return json({ ok: false, error: resolved.error, requestId: id }, resolved.status);

      const raw = await rpc(resolved.rpc, token, resolved.args);
      const data = resolved.project(raw);
      return json({
        ok: true,
        requestId: id,
        tool: toolName,
        role,
        risk: resolved.risk,
        untrustedData: true,
        data,
      });
    } catch (error) {
      const status = Number(error?.status) || 500;
      return json({
        ok: false,
        error: status === 401 ? "authentication_required" : status === 403 ? "access_denied" : status === 503 ? "service_unavailable" : "request_failed",
        requestId: id,
      }, status);
    }
  },
};
