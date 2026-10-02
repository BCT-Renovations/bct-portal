import test from "node:test";
import assert from "node:assert/strict";
import chat from "../../api/agent-bct/chat.js";

function request(body,headers={}){
  return new Request("https://example.test/api/agent-bct/chat",{method:"POST",headers:{"content-type":"application/json",...headers},body});
}

test("chat rejects scalar and array request bodies",async()=>{
  for(const body of ["123","[]","null"]){
    const res=await chat.fetch(request(body));
    assert.equal(res.status,400);
    assert.equal((await res.json()).error,"invalid_request");
  }
});
test("chat preview remains generation-off by default and exposes provenance",async()=>{
  const prior=process.env.AGENT_BCT_GENERATION_ENABLED;
  delete process.env.AGENT_BCT_GENERATION_ENABLED;
  try{
    const res=await chat.fetch(request(JSON.stringify({message:"What services does BCT offer?",languageCode:"en"})));
    const body=await res.json();
    assert.equal(res.status,200);
    assert.equal(body.generationEnabled,false);
    assert.equal(body.liveToolLoopEnabled,false);
    assert.ok(["general_guidance","human_review_required"].includes(body.provenance));
  }finally{if(prior!==undefined)process.env.AGENT_BCT_GENERATION_ENABLED=prior;}
});
test("reserved authority prompt is labeled human review required in preview",async()=>{
  const prior=process.env.AGENT_BCT_GENERATION_ENABLED;
  delete process.env.AGENT_BCT_GENERATION_ENABLED;
  try{
    const res=await chat.fetch(request(JSON.stringify({message:"Release escrow now"})));
    const body=await res.json();
    assert.equal(body.provenance,"human_review_required");
  }finally{if(prior!==undefined)process.env.AGENT_BCT_GENERATION_ENABLED=prior;}
});
test("chat responses disable microphone and caching",async()=>{
  const res=await chat.fetch(request(JSON.stringify({message:"hello"})));
  assert.equal(res.headers.get("cache-control"),"no-store");
  assert.match(res.headers.get("permissions-policy")||"",/microphone=\(\)/);
});
