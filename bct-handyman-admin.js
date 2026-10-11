/* BCT V46 isolated Handyman Admin Board. Reuses existing BCT admin auth; additive only. */
(function(){'use strict';
const sb=window.supabaseClient||window.supabase;
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
  const s=document.createElement('section');s.id='bctHandymanAdminMount';s.className='card section';s.dataset.adminPagePanel='handyman';s.dataset.bctBoardInclude='1';s.dataset.bctUrgentCategory='handymen';
  s.innerHTML='<div class="bct-handyman-card"><div class="toolbar"><div><span class="badge info">BCT ADMIN</span><h2>Handyman Review Board</h2><p class="muted">Review handyman applications, screening status, credentials, and approval. Handyman is separate from contractor.</p></div><div class="bct-handyman-actions"><button class="secondary" type="button" id="bctHandymanAdminRefresh">View Applications</button><button class="secondary" type="button" id="bctHandymanAdminClose">Close</button></div></div><div id="bctHandymanAdminList">Loading...</div></div>';
  parent.appendChild(s);
  s.querySelector('#bctHandymanAdminClose').onclick=()=>s.classList.add('hidden');
  s.querySelector('#bctHandymanAdminRefresh').onclick=load;
  return s;
}
async function load(){
  const out=document.getElementById('bctHandymanAdminList');if(!out)return;
  if(!sb?.rpc){out.textContent='Admin backend unavailable on this preview.';return;}
  out.innerHTML='<div class="bct-handyman-note">Loading handyman applications...</div>';
  try{
    const {data,error}=await sb.rpc('bct_admin_handyman_applications');if(error)throw error;
    const rows=data||[];
    out.innerHTML=rows.length?rows.map(a=>{
      const status=String(a.approval_status||'pending_bct_review').toLowerCase();
      const statusClass=status==='approved'?'good':status==='rejected'||status==='suspended'?'bad':'warn';
      return '<div class="bct-handyman-card" style="margin-top:12px" data-status="'+esc(status+' pending handyman review')+'"><div class="toolbar"><div><b>'+esc(a.application_code)+'</b> - '+esc(a.legal_name)+'<br><span class="badge '+statusClass+' bct-handyman-status" data-status="'+esc(status)+'">'+esc(a.approval_status||'pending_bct_review')+'</span></div><div><b>Background:</b> '+esc(a.background_check_status||'pending')+'</div></div><p>'+esc(a.business_name||'Independent handyman')+' - '+esc(a.city)+', '+esc(a.state)+' - '+esc(a.service_area)+'</p><p><b>Services/Profile:</b> '+esc(a.services)+'</p><div class="bct-handyman-actions"><button data-id="'+esc(a.id)+'" data-a="bct_review" data-b="pending" data-c="pending_bct_review">Start BCT Review</button><button data-id="'+esc(a.id)+'" data-a="background_check_pending" data-b="scheduled" data-c="pending_bct_review">Mark Screening Scheduled</button><button data-id="'+esc(a.id)+'" data-a="bct_review" data-b="clear" data-c="approved">Approve - Clear Only</button><button data-id="'+esc(a.id)+'" data-a="rejected" data-b="failed" data-c="rejected">Reject</button></div></div>';
    }).join(''):'<div class="bct-handyman-note">No handyman applications yet.</div>';
    out.querySelectorAll('button[data-id]').forEach(b=>b.onclick=async()=>{try{const {error}=await sb.rpc('bct_admin_review_handyman_application',{p_application_id:b.dataset.id,p_application_status:b.dataset.a,p_background_check_status:b.dataset.b,p_approval_status:b.dataset.c});if(error)throw error;load();}catch(e){alert(e.message||'Unable to update application.');}});
  }catch(e){out.innerHTML='<div class="bct-handyman-note">Admin review board unavailable: '+esc(e.message)+'</div>';}
}
window.BCTHandymanAdmin={open,mount,load};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();