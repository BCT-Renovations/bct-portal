const WINDOW_MS=60_000;
const PUBLIC_LIMIT=12;
const AUTH_LIMIT=30;
const buckets=new Map();
const MAX_BUCKETS=5000;
let lastSweep=0;

function sweep(at){
  if(buckets.size<MAX_BUCKETS && at-lastSweep<WINDOW_MS)return;
  lastSweep=at;
  for(const [key,value] of buckets){if(at-value.startedAt>=WINDOW_MS)buckets.delete(key);}
  if(buckets.size>MAX_BUCKETS){
    const excess=buckets.size-MAX_BUCKETS;
    let removed=0;
    for(const key of buckets.keys()){buckets.delete(key);if(++removed>=excess)break;}
  }
}

function now(){return Date.now();}
function keyPart(value){return String(value||"anonymous").slice(0,160);}

export function checkLocalRateLimit({identity="anonymous",authenticated=false,at=now()}={}) {
  sweep(at);
  const key=`${authenticated?"auth":"public"}:${keyPart(identity)}`;
  const limit=authenticated?AUTH_LIMIT:PUBLIC_LIMIT;
  const current=buckets.get(key);
  if(!current||at-current.startedAt>=WINDOW_MS){
    buckets.set(key,{startedAt:at,count:1});
    return{allowed:true,limit,remaining:limit-1,retryAfterSeconds:0};
  }
  if(current.count>=limit){
    return{allowed:false,limit,remaining:0,retryAfterSeconds:Math.max(1,Math.ceil((WINDOW_MS-(at-current.startedAt))/1000))};
  }
  current.count+=1;
  return{allowed:true,limit,remaining:limit-current.count,retryAfterSeconds:0};
}

export function rateLimitPolicy(){
  return{windowMs:WINDOW_MS,publicLimit:PUBLIC_LIMIT,authenticatedLimit:AUTH_LIMIT,scope:"best_effort_instance_local_preview",maxBuckets:MAX_BUCKETS};
}
