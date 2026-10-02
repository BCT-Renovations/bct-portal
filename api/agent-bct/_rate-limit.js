const WINDOW_MS=60_000;
const PUBLIC_LIMIT=12;
const AUTH_LIMIT=30;
const buckets=new Map();

function now(){return Date.now();}
function keyPart(value){return String(value||"anonymous").slice(0,160);}

export function checkLocalRateLimit({identity="anonymous",authenticated=false,at=now()}={}) {
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
  return{windowMs:WINDOW_MS,publicLimit:PUBLIC_LIMIT,authenticatedLimit:AUTH_LIMIT,scope:"best_effort_instance_local_preview"};
}
