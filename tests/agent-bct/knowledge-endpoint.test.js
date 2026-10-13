import test from "node:test";
import assert from "node:assert/strict";
import knowledge from "../../api/agent-bct/knowledge.js";

function req({method="GET",body,contentType="application/json"}={}){
  return new Request("https://example.test/api/agent-bct/knowledge",{method,headers:body?{"content-type":contentType}:{},body});
}

test("knowledge health does not expose secrets",async()=>{
  const res=await knowledge.fetch(req());
  const text=await res.text();
  assert.equal(res.status,200);
  assert.equal(/service.?role|api.?key|password|token/i.test(text),false);
});

test("public knowledge normalizes unsupported language to English",async()=>{
  const res=await knowledge.fetch(req({method:"POST",body:JSON.stringify({query:"BCT contractor",languageCode:"xx"})}));
  const body=await res.json();
  assert.equal(res.status,200);
  assert.equal(body.scope,"public");
  assert.equal(body.languageCode,"en");
});

test("public knowledge rejects invalid and oversized queries",async()=>{
  const empty=await knowledge.fetch(req({method:"POST",body:JSON.stringify({query:""})}));
  const large=await knowledge.fetch(req({method:"POST",body:JSON.stringify({query:"x".repeat(2001)})}));
  assert.equal(empty.status,400);assert.equal(large.status,400);
});

test("public knowledge endpoint rejects non-json POST",async()=>{
  const res=await knowledge.fetch(req({method:"POST",body:"query=x",contentType:"text/plain"}));
  assert.equal(res.status,400);
});

test("public knowledge rejects scalar and array request bodies",async()=>{
  for(const payload of ["123","[]","null"]){
    const res=await knowledge.fetch(req({method:"POST",body:payload}));
    assert.equal(res.status,400);
    assert.equal((await res.json()).error,"invalid_request");
  }
});
test("knowledge endpoint keeps microphone disabled and response non-cacheable",async()=>{
  const res=await knowledge.fetch(req());
  assert.equal(res.headers.get("cache-control"),"no-store");
  assert.match(res.headers.get("permissions-policy")||"",/microphone=\(\)/);
});
