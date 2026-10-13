const VERSION = "agent-bct-2026.10.01-boundary-1";

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

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "GET" });
    }

    return json({
      ok: true,
      service: "Agent BCT",
      version: VERSION,
      mode: "development",
      productionIntegrated: false,
      liveWritesEnabled: false,
      estimatorLiveToolsEnabled: false,
      voiceEnabled: false,
    });
  },
};
