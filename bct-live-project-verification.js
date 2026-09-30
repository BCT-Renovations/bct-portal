/* BCT V46 Live Project Verification
   BCT quality-control video checkpoints. Not a municipal/code inspection. */
(function(){
  'use strict';
  const VERSION='V46-2026.09.30-live-project-verification-1';
  window.BCT_LIVE_PROJECT_VERIFICATION_VERSION=VERSION;

  const COPY={
    en:{title:'BCT Live Project Verification',desc:'Live video quality-control checkpoints for BCT-managed jobs. This is a BCT project verification, not a city or code inspection.',checkpoint:'Checkpoint',arrival:'Arrival',pre_cover:'Before Work Is Covered',progress:'Progress Check',final:'Final Completion',scheduled:'Scheduled Time',video:'Secure Video Link',notes:'Verification Notes',schedule:'Schedule Live Verification',empty:'No live verification checkpoints scheduled.',join:'Join Live Video',start:'Mark Started',pass:'Passed',correct:'Needs Correction',recheck:'Recheck Required',pending:'Pending',started:'Started',saved:'Live verification checkpoint saved.',updated:'Live verification updated.'},
    es:{title:'Verificación de proyecto en vivo de BCT',desc:'Puntos de control por video en vivo para trabajos administrados por BCT. Esta es una verificación de BCT, no una inspección municipal ni de código.',checkpoint:'Punto de control',arrival:'Llegada',pre_cover:'Antes de cubrir el trabajo',progress:'Revisión de progreso',final:'Finalización',scheduled:'Hora programada',video:'Enlace de video seguro',notes:'Notas de verificación',schedule:'Programar verificación en vivo',empty:'No hay verificaciones en vivo programadas.',join:'Unirse al video',start:'Marcar iniciada',pass:'Aprobado',correct:'Necesita corrección',recheck:'Revisión requerida',pending:'Pendiente',started:'Iniciada',saved:'Verificación en vivo guardada.',updated:'Verificación en vivo actualizada.'},
    fr:{title:'Vérification de projet en direct BCT',desc:'Points de contrôle vidéo en direct pour les travaux gérés par BCT. Il s’agit d’une vérification BCT, pas d’une inspection municipale ou de conformité.',checkpoint:'Point de contrôle',arrival:'Arrivée',pre_cover:'Avant recouvrement',progress:'Contrôle d’avancement',final:'Achèvement final',scheduled:'Heure prévue',video:'Lien vidéo sécurisé',notes:'Notes de vérification',schedule:'Planifier la vérification',empty:'Aucune vérification en direct planifiée.',join:'Rejoindre la vidéo',start:'Marquer démarrée',pass:'Réussi',correct:'Correction requise',recheck:'Nouveau contrôle requis',pending:'En attente',started:'Démarrée',saved:'Vérification enregistrée.',updated:'Vérification mise à jour.'},
    ht:{title:'Verifikasyon Pwojè BCT an Dirèk',desc:'Pwen kontwòl videyo an dirèk pou travay BCT ap jere. Sa a se verifikasyon kalite BCT, se pa enspeksyon vil oswa kòd.',checkpoint:'Pwen kontwòl',arrival:'Rive',pre_cover:'Anvan travay la kouvri',progress:'Kontwòl pwogrè',final:'Finisman final',scheduled:'Lè pwograme',video:'Lyen videyo sekirize',notes:'Nòt verifikasyon',schedule:'Pwograme verifikasyon an dirèk',empty:'Pa gen verifikasyon an dirèk pwograme.',join:'Antre nan videyo',start:'Make kòmanse',pass:'Pase',correct:'Bezwen koreksyon',recheck:'Bezwen re-tcheke',pending:'Annatant',started:'Kòmanse',saved:'Verifikasyon anrejistre.',updated:'Verifikasyon mete ajou.'},
    pt:{title:'Verificação de Projeto ao Vivo BCT',desc:'Pontos de controle por vídeo ao vivo para obras gerenciadas pela BCT. É uma verificação da BCT, não uma inspeção municipal ou de código.',checkpoint:'Ponto de controle',arrival:'Chegada',pre_cover:'Antes de cobrir o trabalho',progress:'Verificação de progresso',final:'Conclusão final',scheduled:'Horário agendado',video:'Link de vídeo seguro',notes:'Notas de verificação',schedule:'Agendar verificação ao vivo',empty:'Nenhuma verificação ao vivo agendada.',join:'Entrar no vídeo',start:'Marcar iniciada',pass:'Aprovado',correct:'Precisa de correção',recheck:'Nova verificação necessária',pending:'Pendente',started:'Iniciada',saved:'Verificação ao vivo salva.',updated:'Verificação atualizada.'},
    vi:{title:'Xác minh dự án trực tiếp BCT',desc:'Các điểm kiểm tra chất lượng qua video trực tiếp cho công việc do BCT quản lý. Đây là xác minh của BCT, không phải kiểm tra của thành phố hoặc kiểm tra mã xây dựng.',checkpoint:'Điểm kiểm tra',arrival:'Đến nơi',pre_cover:'Trước khi che phủ công việc',progress:'Kiểm tra tiến độ',final:'Hoàn thành cuối',scheduled:'Thời gian',video:'Liên kết video an toàn',notes:'Ghi chú xác minh',schedule:'Lên lịch xác minh trực tiếp',empty:'Chưa có điểm xác minh trực tiếp.',join:'Tham gia video',start:'Đánh dấu bắt đầu',pass:'Đạt',correct:'Cần sửa',recheck:'Cần kiểm tra lại',pending:'Đang chờ',started:'Đã bắt đầu',saved:'Đã lưu xác minh trực tiếp.',updated:'Đã cập nhật xác minh.'},
    zh:{title:'BCT 实时项目核验',desc:'用于 BCT 管理项目的实时视频质量检查点。这是 BCT 项目核验，不是市政或建筑规范检查。',checkpoint:'检查点',arrival:'到场',pre_cover:'隐蔽前',progress:'进度检查',final:'最终完工',scheduled:'计划时间',video:'安全视频链接',notes:'核验备注',schedule:'安排实时核验',empty:'暂无实时核验检查点。',join:'加入实时视频',start:'标记已开始',pass:'通过',correct:'需要整改',recheck:'需要复检',pending:'待处理',started:'已开始',saved:'实时核验已保存。',updated:'核验已更新。'},
    ar:{title:'التحقق المباشر من مشروع BCT',desc:'نقاط تحقق مباشرة بالفيديو لأعمال تديرها BCT. هذا تحقق جودة تابع لـ BCT وليس تفتيشًا بلديًا أو تفتيش كود.',checkpoint:'نقطة التحقق',arrival:'الوصول',pre_cover:'قبل تغطية العمل',progress:'فحص التقدم',final:'الإنجاز النهائي',scheduled:'الوقت المجدول',video:'رابط فيديو آمن',notes:'ملاحظات التحقق',schedule:'جدولة تحقق مباشر',empty:'لا توجد نقاط تحقق مباشرة مجدولة.',join:'الانضمام للفيديو',start:'تحديد كبداية',pass:'ناجح',correct:'يحتاج تصحيحًا',recheck:'يلزم إعادة الفحص',pending:'قيد الانتظار',started:'بدأ',saved:'تم حفظ التحقق المباشر.',updated:'تم تحديث التحقق.'},
    ru:{title:'Живая проверка проекта BCT',desc:'Контрольные видеопроверки качества для работ под управлением BCT. Это проверка BCT, а не муниципальная или кодовая инспекция.',checkpoint:'Контрольная точка',arrival:'Прибытие',pre_cover:'До закрытия работ',progress:'Проверка хода работ',final:'Финальное завершение',scheduled:'Запланированное время',video:'Безопасная видеоссылка',notes:'Примечания проверки',schedule:'Запланировать живую проверку',empty:'Живые проверки не запланированы.',join:'Подключиться к видео',start:'Отметить начало',pass:'Пройдено',correct:'Нужна коррекция',recheck:'Нужна повторная проверка',pending:'Ожидает',started:'Начато',saved:'Живая проверка сохранена.',updated:'Проверка обновлена.'}
  };

  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  function lang(){try{return (localStorage.getItem('bctPreferredLanguage')||document.documentElement.lang||'en').toLowerCase().split('-')[0]}catch(_){return 'en'}}
  function t(){return COPY[lang()]||COPY.en}
  function callRpc(name,args={}){if(typeof rpc!=='function')return Promise.reject(new Error('BCT data connection is not ready.'));return rpc(name,args)}
  function managedJob(){try{return typeof activeManagedJob!=='undefined'?activeManagedJob:null}catch(_){return null}}
  function checkpointLabel(value,c=t()){return c[value]||value||''}
  function resultLabel(value,c=t()){
    const map={pending:c.pending,passed:c.pass,needs_correction:c.correct,recheck_required:c.recheck,failed:'Failed',cancelled:'Cancelled'};
    return map[value]||value||c.pending;
  }
  function formatDate(value){if(!value)return 'Not scheduled';try{return new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short'}).format(new Date(value))}catch(_){return value}}
  function validHttps(value){return !value||/^https:\/\//i.test(value)}
  function notify(message,error=false){
    const out=$('bctLiveVerificationStatus');if(!out)return;
    out.className=error?'notice':'notice';out.textContent=message;out.hidden=false;
  }
  function injectStyle(){
    if($('bct-live-project-verification-style'))return;
    const style=document.createElement('style');style.id='bct-live-project-verification-style';style.textContent=`
      #bctLiveVerificationForm,#bctLiveVerificationListCard,#bctContractorLiveVerificationCard{border:1px solid #93c5fd;background:#f8fbff}
      #bctLiveVerificationList{display:grid;gap:10px}
      .bct-live-verification-row{border:1px solid #d7e0e1;border-radius:12px;padding:12px;background:#fff}
      .bct-live-verification-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
      .bct-live-verification-actions button,.bct-live-verification-actions a{min-height:44px;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}
      .bct-live-verification-disclaimer{font-size:12px;color:#52666b;margin-top:6px}
      @media(max-width:820px){.bct-live-verification-actions{display:grid;grid-template-columns:1fr}.bct-live-verification-actions button,.bct-live-verification-actions a{width:100%}}
    `;document.head.appendChild(style);
  }
  function adminFormHtml(){const c=t();return `
    <h3>${esc(c.title)}</h3>
    <p class="muted">${esc(c.desc)}</p>
    <div id="bctLiveVerificationStatus" class="notice" hidden></div>
    <label>${esc(c.checkpoint)}</label>
    <select name="checkpoint" required>
      <option value="arrival">${esc(c.arrival)}</option><option value="pre_cover">${esc(c.pre_cover)}</option><option value="progress">${esc(c.progress)}</option><option value="final">${esc(c.final)}</option>
    </select>
    <label>${esc(c.scheduled)}</label><input name="scheduledFor" type="datetime-local" required>
    <label>${esc(c.video)}</label><input name="videoUrl" type="url" inputmode="url" placeholder="https://...">
    <label>${esc(c.notes)}</label><textarea name="notes" placeholder="What the contractor must show during this checkpoint"></textarea>
    <button type="submit">${esc(c.schedule)}</button>
    <div class="bct-live-verification-disclaimer">${esc(c.desc)}</div>`}
  function ensureAdminUi(){
    injectStyle();const panel=$('jobManagementPanel');if(!panel)return;
    let form=$('bctLiveVerificationForm');
    if(!form){
      form=document.createElement('form');form.id='bctLiveVerificationForm';form.className='stage';form.autocomplete='on';form.innerHTML=adminFormHtml();
      const schedule=$('jobScheduleForm');if(schedule)schedule.insertAdjacentElement('afterend',form);else panel.appendChild(form);
      form.addEventListener('submit',submitVerification);
    }
    let listCard=$('bctLiveVerificationListCard');
    if(!listCard){listCard=document.createElement('div');listCard.id='bctLiveVerificationListCard';listCard.className='stage';listCard.innerHTML=`<h3>${esc(t().title)}</h3><div id="bctLiveVerificationList" class="muted">${esc(t().empty)}</div>`;form.insertAdjacentElement('afterend',listCard)}
  }
  async function submitVerification(event){
    event.preventDefault();const j=managedJob();if(!j)return notify('Open a BCT job first.',true);
    const data=new FormData(event.currentTarget);const video=String(data.get('videoUrl')||'').trim();
    if(!validHttps(video))return notify('Use an https:// video link.',true);
    try{
      await callRpc('bct_admin_create_live_verification',{
        p_project_id:j.project_id,p_job_id:j.job_id,p_checkpoint:data.get('checkpoint'),
        p_scheduled_for:new Date(data.get('scheduledFor')).toISOString(),p_video_join_url:video||null,p_notes:data.get('notes')||null
      });
      notify(t().saved);event.currentTarget.reset();await loadAdminVerifications();
    }catch(error){notify(error?.message||'Live verification could not be saved.',true)}
  }
  function adminRow(item){const c=t();const join=item.video_join_url?`<a class="btn secondary" href="${esc(item.video_join_url)}" target="_blank" rel="noopener noreferrer">${esc(c.join)}</a>`:'';return `
    <div class="bct-live-verification-row" data-live-verification-id="${esc(item.id)}">
      <b>${esc(checkpointLabel(item.verification_checkpoint,c))}</b> <span class="badge info">${esc(resultLabel(item.result,c))}</span><br>
      <small>${esc(formatDate(item.scheduled_for))}${item.started_at?` • ${esc(c.started)}`:''}</small>
      ${item.notes?`<p>${esc(item.notes)}</p>`:''}
      <div class="bct-live-verification-actions">${join}
        <button type="button" class="secondary" data-live-result="start" data-live-id="${esc(item.id)}">${esc(c.start)}</button>
        <button type="button" class="success" data-live-result="passed" data-live-id="${esc(item.id)}">${esc(c.pass)}</button>
        <button type="button" data-live-result="needs_correction" data-live-id="${esc(item.id)}">${esc(c.correct)}</button>
        <button type="button" data-live-result="recheck_required" data-live-id="${esc(item.id)}">${esc(c.recheck)}</button>
      </div>
    </div>`}
  async function loadAdminVerifications(){
    ensureAdminUi();const j=managedJob(),host=$('bctLiveVerificationList');if(!host||!j)return;
    try{const rows=await callRpc('bct_admin_inspections',{p_project_id:j.project_id});const live=(Array.isArray(rows)?rows:[]).filter(x=>x.verification_mode==='live_video'||x.inspection_type==='BCT Live Project Verification').filter(x=>!j.job_id||!x.job_id||x.job_id===j.job_id);host.innerHTML=live.length?live.map(adminRow).join(''):`<span class="muted">${esc(t().empty)}</span>`}catch(error){host.textContent=error?.message||'Live verification list unavailable.'}
  }
  async function updateVerification(id,result){
    try{await callRpc('bct_admin_update_live_verification',{p_id:id,p_result:result==='start'?null:result,p_video_join_url:null,p_notes:null,p_mark_started:result==='start'});notify(t().updated);await loadAdminVerifications()}catch(error){notify(error?.message||'Live verification could not be updated.',true)}
  }
  function ensureContractorUi(){
    injectStyle();const view=$('view-jobs');if(!view)return null;let card=$('bctContractorLiveVerificationCard');if(card)return card;
    const host=view.querySelector(':scope > .card.section')||view;card=document.createElement('div');card.id='bctContractorLiveVerificationCard';card.className='card section';card.innerHTML=`<h3>${esc(t().title)}</h3><p class="muted">${esc(t().desc)}</p><div id="bctContractorLiveVerificationList" class="muted">${esc(t().empty)}</div>`;host.appendChild(card);return card;
  }
  function contractorRow(item){const c=t();return `<div class="bct-live-verification-row"><b>${esc(checkpointLabel(item.verification_checkpoint,c))}</b> <span class="badge info">${esc(resultLabel(item.result,c))}</span><br><small>${esc(formatDate(item.scheduled_for))}</small>${item.notes?`<p>${esc(item.notes)}</p>`:''}${item.video_join_url?`<div class="bct-live-verification-actions"><a class="btn" href="${esc(item.video_join_url)}" target="_blank" rel="noopener noreferrer">${esc(c.join)}</a></div>`:''}</div>`}
  async function loadContractorVerifications(){
    ensureContractorUi();const host=$('bctContractorLiveVerificationList');if(!host)return;
    try{const rows=await callRpc('bct_my_assigned_inspections',{});const live=(Array.isArray(rows)?rows:[]).filter(x=>x.verification_mode==='live_video'||x.inspection_type==='BCT Live Project Verification');host.innerHTML=live.length?live.map(contractorRow).join(''):`<span class="muted">${esc(t().empty)}</span>`}catch(_){host.innerHTML=`<span class="muted">${esc(t().empty)}</span>`}
  }
  function refreshCopy(){const form=$('bctLiveVerificationForm');if(form){form.innerHTML=adminFormHtml();form.addEventListener('submit',submitVerification)}const cc=$('bctContractorLiveVerificationCard');if(cc){cc.querySelector('h3').textContent=t().title;cc.querySelector('p').textContent=t().desc}loadAdminVerifications();loadContractorVerifications()}

  document.addEventListener('click',event=>{
    const action=event.target?.closest?.('[data-live-result]');if(action){event.preventDefault();updateVerification(action.dataset.liveId,action.dataset.liveResult);return}
    const jobs=event.target?.closest?.('[data-contractor-view="jobs"]');if(jobs)setTimeout(loadContractorVerifications,0);
  },true);
  document.addEventListener('change',event=>{if(event.target&&['bctLoginLanguage','bctLanguage'].includes(event.target.id))setTimeout(refreshCopy,0)},true);
  window.addEventListener('pageshow',()=>{ensureAdminUi();ensureContractorUi();loadContractorVerifications()});

  function hookManageJob(){
    if(typeof window.bctManageJob!=='function'||window.bctManageJob.__bctLiveVerificationWrapped)return;
    const original=window.bctManageJob;
    const wrapped=async function(){const result=await original.apply(this,arguments);ensureAdminUi();await loadAdminVerifications();return result};
    wrapped.__bctLiveVerificationWrapped=true;window.bctManageJob=wrapped;
  }
  function init(){ensureAdminUi();ensureContractorUi();hookManageJob();setTimeout(hookManageJob,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
