import test from "node:test";
import assert from "node:assert/strict";
import health from "../../api/agent-bct/health.js";
import session from "../../api/agent-bct/session.js";
import tool from "../../api/agent-bct/tool.js";

function req(url,{method="GET",headers={},body}={}){return new Request(url,{method,headers,body});}

test("health is GET-only and explicitly non-production",async()=>{
  const ok=await health.fetch(req("https://example.test/api/agent-bct/health"));
  const body=await ok.json();
  assert.equal(ok.status,200);
  assert.equal(body.productionIntegrated,false);
  assert.equal(body.liveWritesEnabled,false);
  const bad=await health.fetch(req("https://example.test/api/agent-bct/health",{method:"POST"}));
  assert.equal(bad.status,405);
});

test("session rejects unauthenticated request before backend access",async()=>{
  const res=await session.fetch(req("https://example.test/api/agent-bct/session",{method:"POST",headers:{"content-type":"application/json"},body:"{}"}));
  const body=await res.json();
  assert.equal(res.status,401);assert.equal(body.error,"authentication_required");
});

test("tool executor rejects unauthenticated request",async()=>{
  const res=await tool.fetch(req("https://example.test/api/agent-bct/tool",{method:"POST",headers:{"content-type":"application/json"},body:"{}"}));
  assert.equal(res.status,401);
});

test("session and tool enforce JSON content type",async()=>{
  const s=await session.fetch(req("https://example.test/api/agent-bct/session",{method:"POST",body:"{}"}));
  const t=await tool.fetch(req("https://example.test/api/agent-bct/tool",{method:"POST",headers:{authorization:"Bearer fake"},body:"{}"}));
  assert.equal(s.status,400);assert.equal(t.status,400);
});

test("oversized declared session body is rejected",async()=>{
  const res=await session.fetch(req("https://example.test/api/agent-bct/session",{method:"POST",headers:{"content-type":"application/json","content-length":"20000",authorization:"Bearer fake"},body:"{}"}));
  assert.equal(res.status,413);
});

test("Agent endpoints use no-store and no-referrer privacy headers",async()=>{
  const h=await health.fetch(req("https://example.test/api/agent-bct/health"));
  const s=await session.fetch(req("https://example.test/api/agent-bct/session",{method:"POST",headers:{"content-type":"application/json"},body:"{}"}));
  const t=await tool.fetch(req("https://example.test/api/agent-bct/tool",{method:"POST",headers:{"content-type":"application/json"},body:"{}"}));
  for(const res of [h,s,t]){assert.equal(res.headers.get("cache-control"),"no-store");assert.equal(res.headers.get("referrer-policy"),"no-referrer");}
});

test("tool endpoint rejects scalar JSON request bodies before tool execution",async()=>{
  const original=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({role:"homeowner",permissions:[]}),{status:200});
  try{
    const res=await tool.fetch(req("https://example.test/api/agent-bct/tool",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer fake"},body:"123"}));
    assert.equal(res.status,400);assert.equal((await res.json()).error,"invalid_request");
  }finally{globalThis.fetch=original;}
});
test("tool endpoint rejects array tool input",async()=>{
  const original=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({role:"homeowner",permissions:[]}),{status:200});
  try{
    const res=await tool.fetch(req("https://example.test/api/agent-bct/tool",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer fake"},body:JSON.stringify({tool:"project.list",input:[]})}));
    assert.equal(res.status,400);assert.equal((await res.json()).error,"invalid_tool_input");
  }finally{globalThis.fetch=original;}
});
