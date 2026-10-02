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

test("preview limiter declares a bounded bucket ceiling",()=>{
  const p=rateLimitPolicy();
  assert.equal(p.maxBuckets,5000);
  assert.equal(p.scope,"best_effort_instance_local_preview");
});

test("rate-limit identity rejects free-text injection characters",()=>{
  const p=rateLimitPolicy();let r;
  for(let i=0;i<p.publicLimit+1;i++)r=checkLocalRateLimit({identity:"user\nAuthorization: secret",authenticated:false,at:2000});
  assert.equal(r.allowed,false);
});
test("rate-limit window resets after expiration",()=>{
  const p=rateLimitPolicy();
  for(let i=0;i<p.publicLimit;i++)checkLocalRateLimit({identity:"window-reset",authenticated:false,at:3000});
  assert.equal(checkLocalRateLimit({identity:"window-reset",authenticated:false,at:3000}).allowed,false);
  assert.equal(checkLocalRateLimit({identity:"window-reset",authenticated:false,at:3000+p.windowMs}).allowed,true);
});

test("invalid caller-supplied limiter clock cannot poison preview buckets",()=>{
  const r=checkLocalRateLimit({identity:"bad-clock",authenticated:false,at:Number.NaN});
  assert.equal(r.allowed,true);assert.ok(r.remaining>=0);
});

test("negative and infinite limiter clocks cannot create immortal buckets",()=>{
  for(const at of [-1,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY]){
    const r=checkLocalRateLimit({identity:"invalid-clock-"+String(at),authenticated:false,at});
    assert.equal(r.allowed,true);assert.ok(r.retryAfterSeconds>=0);
  }
});
