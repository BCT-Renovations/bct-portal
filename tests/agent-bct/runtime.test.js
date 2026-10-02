import test from "node:test";
import assert from "node:assert/strict";
import { runtimeConfig, generateAgentBct } from "../../api/agent-bct/_runtime.js";

test("generation defaults disabled",()=>{
  const prior=process.env.AGENT_BCT_GENERATION_ENABLED;
  delete process.env.AGENT_BCT_GENERATION_ENABLED;
  assert.equal(runtimeConfig().generationFlag,false);
  if(prior!==undefined)process.env.AGENT_BCT_GENERATION_ENABLED=prior;
});

test("runtime exposes configuration state but never key value",()=>{
  const prior=process.env.AI_GATEWAY_API_KEY;
  process.env.AI_GATEWAY_API_KEY="super-secret";
  const cfg=runtimeConfig();
  assert.equal(cfg.gatewayConfigured,true);
  assert.equal(JSON.stringify(cfg).includes("super-secret"),false);
  if(prior===undefined)delete process.env.AI_GATEWAY_API_KEY; else process.env.AI_GATEWAY_API_KEY=prior;
});

test("runtime reports model id but never gateway credential",()=>{
  const oldModel=process.env.AGENT_BCT_MODEL,oldKey=process.env.AI_GATEWAY_API_KEY;
  process.env.AGENT_BCT_MODEL="openai/gpt-test";
  process.env.AI_GATEWAY_API_KEY="private-key";
  const cfg=runtimeConfig();
  assert.equal(cfg.model,"openai/gpt-test");
  assert.equal(Object.hasOwn(cfg,"apiKey"),false);
  assert.equal(JSON.stringify(cfg).includes("private-key"),false);
  if(oldModel===undefined)delete process.env.AGENT_BCT_MODEL;else process.env.AGENT_BCT_MODEL=oldModel;
  if(oldKey===undefined)delete process.env.AI_GATEWAY_API_KEY;else process.env.AI_GATEWAY_API_KEY=oldKey;
});

test("runtime rejects malformed successful gateway payload",async()=>{
  const old={flag:process.env.AGENT_BCT_GENERATION_ENABLED,key:process.env.AI_GATEWAY_API_KEY,model:process.env.AGENT_BCT_MODEL};
  process.env.AGENT_BCT_GENERATION_ENABLED="true";process.env.AI_GATEWAY_API_KEY="test";process.env.AGENT_BCT_MODEL="openai/gpt-test";
  const priorFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({unexpected:true}),{status:200});
  try{await assert.rejects(()=>generateAgentBct({system:"s",userMessage:"u",requestId:"r"}),e=>e.code==="invalid_generation_response");}
  finally{globalThis.fetch=priorFetch;for(const [k,v] of Object.entries({AGENT_BCT_GENERATION_ENABLED:old.flag,AI_GATEWAY_API_KEY:old.key,AGENT_BCT_MODEL:old.model})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
test("runtime rejects unexpected tool calls during Phase A",async()=>{
  const old={flag:process.env.AGENT_BCT_GENERATION_ENABLED,key:process.env.AI_GATEWAY_API_KEY,model:process.env.AGENT_BCT_MODEL};
  process.env.AGENT_BCT_GENERATION_ENABLED="true";process.env.AI_GATEWAY_API_KEY="test";process.env.AGENT_BCT_MODEL="openai/gpt-test";
  const priorFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:"x",tool_calls:[{id:"1"}]}}]}),{status:200});
  try{await assert.rejects(()=>generateAgentBct({system:"s",userMessage:"u",requestId:"r"}),e=>e.code==="unexpected_tool_call");}
  finally{globalThis.fetch=priorFetch;for(const [k,v] of Object.entries({AGENT_BCT_GENERATION_ENABLED:old.flag,AI_GATEWAY_API_KEY:old.key,AGENT_BCT_MODEL:old.model})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});

test("runtime rejects multiple choices instead of selecting ambiguous output",async()=>{
  const old={flag:process.env.AGENT_BCT_GENERATION_ENABLED,key:process.env.AI_GATEWAY_API_KEY,model:process.env.AGENT_BCT_MODEL};
  process.env.AGENT_BCT_GENERATION_ENABLED="true";process.env.AI_GATEWAY_API_KEY="test";process.env.AGENT_BCT_MODEL="openai/gpt-test";
  const priorFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:"one"}},{message:{content:"two"}}]}),{status:200});
  try{await assert.rejects(()=>generateAgentBct({system:"s",userMessage:"u",requestId:"r"}),e=>e.code==="invalid_generation_response");}
  finally{globalThis.fetch=priorFetch;for(const [k,v] of Object.entries({AGENT_BCT_GENERATION_ENABLED:old.flag,AI_GATEWAY_API_KEY:old.key,AGENT_BCT_MODEL:old.model})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
test("runtime does not trust malformed provider model metadata",async()=>{
  const old={flag:process.env.AGENT_BCT_GENERATION_ENABLED,key:process.env.AI_GATEWAY_API_KEY,model:process.env.AGENT_BCT_MODEL};
  process.env.AGENT_BCT_GENERATION_ENABLED="true";process.env.AI_GATEWAY_API_KEY="test";process.env.AGENT_BCT_MODEL="openai/gpt-test";
  const priorFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({model:"bad model injected",choices:[{message:{content:"ok"},finish_reason:"stop"}]}),{status:200});
  try{const r=await generateAgentBct({system:"s",userMessage:"u",requestId:"r"});assert.equal(r.model,"openai/gpt-test");}
  finally{globalThis.fetch=priorFetch;for(const [k,v] of Object.entries({AGENT_BCT_GENERATION_ENABLED:old.flag,AI_GATEWAY_API_KEY:old.key,AGENT_BCT_MODEL:old.model})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});

test("runtime ignores valid-looking provider model substitution",async()=>{
  const old={flag:process.env.AGENT_BCT_GENERATION_ENABLED,key:process.env.AI_GATEWAY_API_KEY,model:process.env.AGENT_BCT_MODEL};
  process.env.AGENT_BCT_GENERATION_ENABLED="true";process.env.AI_GATEWAY_API_KEY="test";process.env.AGENT_BCT_MODEL="openai/gpt-test";
  const priorFetch=globalThis.fetch;globalThis.fetch=async()=>new Response(JSON.stringify({model:"other/vendor-model",choices:[{message:{content:"ok"},finish_reason:"stop"}]}),{status:200});
  try{const r=await generateAgentBct({system:"s",userMessage:"u",requestId:"r"});assert.equal(r.model,"openai/gpt-test");}
  finally{globalThis.fetch=priorFetch;for(const [k,v] of Object.entries({AGENT_BCT_GENERATION_ENABLED:old.flag,AI_GATEWAY_API_KEY:old.key,AGENT_BCT_MODEL:old.model})){if(v===undefined)delete process.env[k];else process.env[k]=v;}}
});
