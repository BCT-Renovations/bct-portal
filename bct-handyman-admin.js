/* BCT V46 isolated Handyman Admin Board. Reuses existing BCT admin auth; additive only. */
(function(){'use strict';
const sb=window.supabaseClient||window.supabase;
let generation=0,principal=null;const reviewing=new Set();
function queueState(state){const panel=document.getElementById('bctHandymanAdminMount');if(panel)panel.dataset.bctAdminQueueState=state;}
function clearPrivate(){generation++;reviewing.clear();const out=document.getElementById('bctHandymanAdminList');if(out)out.textContent='Sign in as a BCT administrator to load applications.';queueState('unknown');}
async function verifiedAdmin(){
 if(!sb?.auth?.getUser||!sb?.rpc)throw Error('Admin authentication unavailable.');
 const result=await sb.auth.getUser();if(result.error||!result.data?.user?.id)throw Error('Admin sign-in required.');
 const permission=await sb.rpc('is_bct_admin');if(permission.error||permission.data!==true)throw Error('BCT administrator permission required.');
 return result.data.user.id;
}
sb?.auth?.onAuthStateChange?.((_event,session)=>{const next=session?.user?.id||null;if(next!==principal){principal=next;clearPrivate();}});
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function root(){return document.getElementById('view-admin')||document.querySelector('main')}
function ensureHandymanTab(){
  const r=document.getElementById('view-admin');if(!r)return;
  const tabs=r.querySelector('.portal-tabs');if(!tabs)return;
  if(!tabs.querySelector('[data-admin-page-tab="handyman"]')){
    const b=document.createElement('button');b.type='button';b.dataset.adminPageTab='handyman';b.textContent='Handyman';tabs.appendChild(b);
  }
}
function open(){const panel=mount();if(window.BCT_ADMIN_CONTROL_BOARD_OPEN_PANEL&&panel)window.BCT_ADMIN_CONTROL_BOARD_OPEN_PANEL(panel);else panel?.classList.remove('hidden');load();}
function mount(){
  const parent=root();if(!parent)return null;
  const existing=document.getElementById('bctHandymanAdminMount');if(existing)return existing;
  ensureHandymanTab();
  const s=document.createElement('section');s.id='bctHandymanAdminMount';s.className='card section';s.dataset.adminPagePanel='handyman';s.dataset.bctBoardInclude='1';s.dataset.bctUrgentCategory='contractors';s.dataset.bctAdminQueueState='unknown';
  s.innerHTML='<div class="bct-handyman-card"><div class="toolbar"><div><span class="badge info">BCT ADMIN</span><h2>Handyman Review Board</h2><p class="muted">Review handyman applications, screening status, credentials, and approval. Handyman is separate from contractor.</p></div><div class="bct-handyman-actions"><button class="secondary" type="button" id="bctHandymanAdminRefresh">View Applications</button><button class="secondary" type="button" id="bctHandymanAdminClose">Close</button></div></div><div id="bctHandymanAdminList">Loading...</div></div>';
  parent.appendChild(s);
  s.querySelector('#bctHandymanAdminClose').onclick=()=>s.classList.add('hidden');
  s.querySelector('#bctHandymanAdminRefresh').onclick=load;
  return s;
}
async function load(){
  const out=document.getElementById('bctHandymanAdminList');if(!out)return;
  const request=++generation;queueState('loading');
  out.innerHTML='<div class="bct-handyman-note">Loading handyman applications...</div>';
  try{
    const user=await verifiedAdmin();if(request!==generation)return;principal=user;
    const {data,error}=await sb.rpc('bct_admin_handyman_applications');if(request!==generation)return;if(error)throw error;
    if(!Array.isArray(data))throw Error('Invalid application response.');
    const rows=data;
    out.innerHTML=rows.length?rows.map(a=>{
      const status=String(a.approval_status||'pending_bct_review').toLowerCase();
      const statusClass=status==='approved'?'good':status==='rejected'||status==='suspended'?'bad':'warn';
      return '<div class="bct-handyman-card" style="margin-top:12px" data-bct-alert-id="'+esc(a.id)+'" data-status="'+esc(status)+'"><div class="toolbar"><div><b>'+esc(a.application_code)+'</b> - '+esc(a.legal_name)+'<br><span class="badge '+statusClass+' bct-handyman-status" data-status="'+esc(status)+'">'+esc(a.approval_status||'pending_bct_review')+'</span></div><div><b>Background:</b> '+esc(a.background_check_status||'pending')+'</div></div><p>'+esc(a.business_name||'Independent handyman')+' - '+esc(a.city)+', '+esc(a.state)+' - '+esc(a.service_area)+'</p><p><b>Services/Profile:</b> '+esc(a.services)+'</p><div class="bct-handyman-actions"><button data-id="'+esc(a.id)+'" data-a="bct_review" data-b="pending" data-c="pending_bct_review">Start BCT Review</button><button data-id="'+esc(a.id)+'" data-a="background_check_pending" data-b="scheduled" data-c="pending_bct_review">Mark Screening Scheduled</button><button data-id="'+esc(a.id)+'" data-a="bct_review" data-b="clear" data-c="approved">Approve - Clear Only</button><button data-id="'+esc(a.id)+'" data-a="rejected" data-b="failed" data-c="rejected">Reject</button></div></div>';
    }).join(''):'<div class="bct-handyman-note">No handyman applications yet.</div>';
    queueState('ready');
    out.querySelectorAll('button[data-id]').forEach(b=>b.onclick=async()=>{
      const id=b.dataset.id;if(reviewing.has(id)||request!==generation)return;
      reviewing.add(id);const buttons=[...out.querySelectorAll('button[data-id]')].filter(el=>el.dataset.id===id);buttons.forEach(el=>el.disabled=true);
      try{
        const user=await verifiedAdmin();if(request!==generation||user!==principal)return;
        const result=await sb.rpc('bct_admin_review_handyman_application',{p_application_id:id,p_application_status:b.dataset.a,p_background_check_status:b.dataset.b,p_approval_status:b.dataset.c});
        if(request!==generation)return;if(!result||result.error!==null)throw Error('Unable to confirm application update.');await load();
      }catch(e){if(request===generation)alert('Unable to update application. Refresh before retrying.');}
      finally{reviewing.delete(id);if(request===generation)buttons.forEach(el=>el.disabled=false);}
    });
  }catch(e){if(request!==generation)return;queueState('error');out.textContent='Admin review board unavailable. Verify your access and refresh.';}

}
window.BCTHandymanAdmin={open,mount,load};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();