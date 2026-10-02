import test from "node:test";
import assert from "node:assert/strict";
import { checkLocalRateLimit, rateLimitPolicy } from "../../api/agent-bct/_rate-limit.js";

test("preview rate limit is stricter for public callers",()=>{
  const p=rateLimitPolicy();
  assert.ok(p.publicLimit<p.authenticatedLimit);
});

test("rate limit eventually blocks repeated caller in same window",()=>{
  const p=rateLimitPolicy(); let r;
  for(let i=0;i<p.publicLimit+1;i++) r=checkLocalRateLimit({identity:"test-rate-limit",authenticated:false,at:1000});
  assert.equal(r.allowed,false);
  assert.ok(r.retryAfterSeconds>0);
});
