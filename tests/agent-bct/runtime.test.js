import test from "node:test";
import assert from "node:assert/strict";
import { runtimeConfig } from "../../api/agent-bct/_runtime.js";

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
