const VERSION = "agent-bct-2026.10.01-session-1";
const MAX_BODY_BYTES = 16 * 1024;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
      "permissions-policy": "camera=(), microphone=(), geolocation=()",
      ...extraHeaders,
    },
  });
}

function correlationId() {
  return crypto.randomUUID();
}

function bearerToken(request) {
  const value = request.headers.get("authorization") || "";
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

async function parseSmallJson(request) {
  const declared = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { error: "payload_too_large", status: 413 };
  }

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return { error: "payload_too_large", status: 413 };
  }
  if (!text) return { value: {} };

  try {
    return { value: JSON.parse(text) };
  } catch {
    return { error: "invalid_json", status: 400 };
  }
}

async function supabaseRpc(name, token, args = {}) {
  const baseUrl = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || "";

  if (!baseUrl || !publishableKey) {
    throw new Error("agent_bct_supabase_not_configured");
  }

  const response = await fetch(`${baseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(args),
  });

  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!response.ok) {
    const error = new Error("agent_bct_backend_request_failed");
    error.status = response.status === 401 ? 401 : response.status === 403 ? 403 : 502;
    throw error;
  }

  return data;
}

export default {
  async fetch(request) {
    const requestId = correlationId();

    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed", requestId }, 405, { allow: "POST" });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return json({ ok: false, error: "content_type_required", requestId }, 400);
    }

    const parsed = await parseSmallJson(request);
    if (parsed.error) return json({ ok: false, error: parsed.error, requestId }, parsed.status);

    if(!parsed.value||typeof parsed.value!=="object"||Array.isArray(parsed.value))return json({ok:false,error:"invalid_request",requestId},400);

    const token = bearerToken(request);
    if (!token) return json({ ok: false, error: "authentication_required", requestId }, 401);

    try {
      // Fixed allowlisted RPC. The client cannot choose an RPC name.
      const rawPermissions = await supabaseRpc("bct_my_permissions", token, {});
      const role = rawPermissions && typeof rawPermissions.role==="string" ? rawPermissions.role : "";
      if(!["homeowner","contractor","admin"].includes(role)) throw Object.assign(new Error("access_denied"),{status:403});
      const permissions={role,permissions:Array.isArray(rawPermissions.permissions)?rawPermissions.permissions.filter(x=>typeof x==="string").slice(0,100):[]};
      return json({
        ok: true,
        service: "Agent BCT",
        version: VERSION,
        requestId,
        authenticated: true,
        permissions,
        capabilities: {
          chatEnabled: false,
          generationPreviewEnabled: false,
          liveReadsEnabled: true,
          liveWritesEnabled: false,
          estimatorLiveToolsEnabled: false,
          voiceEnabled: false,
        },
      });
    } catch (error) {
      const status = Number(error?.status) || (String(error?.message).includes("not_configured") ? 503 : 500);
      return json({
        ok: false,
        error: status === 401 ? "authentication_required" : status === 403 ? "access_denied" : status === 503 ? "service_unavailable" : "request_failed",
        requestId,
      }, status);
    }
  },
};
